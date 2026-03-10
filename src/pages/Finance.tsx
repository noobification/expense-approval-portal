import { useMemo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import useSWR, { mutate } from "swr";
import {
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Layers,
    FileBox,
    Wallet,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { cn, fetcher } from "@/lib/utils";

type LineItem = { id: string, name: string, category: string, paidBy: string, budget: number, actualCost: number, amountPaid: number, status: string, dateIncurred: string };
type Project = { id: string, name: string, address: string, salesPrice: number, status: string, createdAt: string };
type Document = { id: string, url: string, type: string, name: string | null, uploadedAt: string };
type ProjectDetails = Project & { lineItems: LineItem[] };

// --- In-Line Editing Component ---
function EditableCell({
    value,
    type = "text",
    options = [],
    onSave,
    format = (v: any) => v
}: {
    value: string | number;
    type?: "text" | "number" | "select";
    options?: string[];
    onSave: (val: string | number) => void;
    format?: (v: any) => React.ReactNode;
}) {
    const [activeEdit, setActiveEdit] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

    useEffect(() => { setEditValue(value) }, [value]);

    useEffect(() => {
        if (activeEdit && inputRef.current) {
            inputRef.current.focus();
        }
    }, [activeEdit]);

    const handleBlur = () => {
        setActiveEdit(false);
        if (editValue !== value) {
            onSave(type === "number" ? Number(editValue) : editValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleBlur();
        if (e.key === 'Escape') {
            setEditValue(value);
            setActiveEdit(false);
        }
    };

    if (activeEdit) {
        if (type === "select") {
            return (
                <select
                    className="bg-background border border-black/10 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-fit min-w-[120px]"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    ref={inputRef as React.RefObject<HTMLSelectElement>}
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        }
        return (
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type={type}
                className={cn(
                    "bg-background border border-black/10 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-[300px]",
                    type === 'number' && "text-right"
                )}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        );
    }

    return (
        <div
            className="cursor-pointer hover:bg-black/5 outline outline-1 outline-transparent hover:outline-black/10 transition-all rounded inline-flex items-center min-h-[1.5em]"
            onClick={() => setActiveEdit(true)}
        >
            {format(value)}
        </div>
    );
}

export const Finance = ({ selectedProjectId }: { selectedProjectId?: string | null }) => {
    // For prototyping, we fetch all projects and select the passed one or default to the first
    const { data: projects } = useSWR<Project[]>('/api/projects', fetcher);
    // Explicit priority: 1) Passed from Dashboard 2) First project in list
    const projectId = selectedProjectId || projects?.[0]?.id;

    // Fetch the detailed project data including its nested line items
    const { data: projectData, error, isLoading } = useSWR<ProjectDetails>(
        projectId ? `/api/projects/${projectId}` : null,
        fetcher
    );

    const { data: documents } = useSWR<Document[]>(
        projectData?.lineItems?.[0]?.id ? `/api/line-items/${projectData.lineItems[0].id}/documents` : null,
        fetcher
    );

    const { summary, breakdown } = useMemo(() => {
        if (!projectData) return { summary: null, breakdown: [] };

        const items = projectData.lineItems;
        const totalBudget = items.reduce((sum, item) => sum + item.budget, 0);
        const actualSpent = items.reduce((sum, item) => sum + item.actualCost, 0);
        const amountPaid = items.reduce((sum, item) => sum + item.amountPaid, 0);
        const remaining = totalBudget - actualSpent;

        // Group line items by category for the breakdown chart
        const categoryMap = new Map<string, { budget: number, spent: number }>();
        items.forEach(item => {
            const existing = categoryMap.get(item.category) || { budget: 0, spent: 0 };
            categoryMap.set(item.category, {
                budget: existing.budget + item.budget,
                spent: existing.spent + item.actualCost
            });
        });

        const breakdownArr = Array.from(categoryMap.entries()).map(([category, data]) => {
            const variance = data.budget - data.spent;
            const variancePercent = data.budget === 0 ? 0 : (variance / data.budget) * 100;
            let status = "Good";
            if (variance < 0) status = "Warning";
            if (variancePercent > 10) status = "Pending";

            return {
                category,
                budget: data.budget,
                spent: data.spent,
                variance: variance,
                status
            };
        });

        return {
            summary: {
                budget: totalBudget,
                actual: actualSpent,
                committed: amountPaid,
                remaining: remaining
            },
            breakdown: breakdownArr
        };
    }, [projectData]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border border-rose-500/20 rounded-xl bg-rose-500/5">
                <AlertCircle className="text-rose-500 h-10 w-10 mb-2" />
                <span className="text-rose-500 font-medium">Error loading financial data.</span>
            </div>
        );
    }

    if (isLoading || !projectData || !summary) {
        return (
            <div className="space-y-8 animate-pulse">
                <header>
                    <div className="h-8 w-64 bg-black/10 rounded mb-2"></div>
                    <div className="h-5 w-96 bg-black/5 rounded"></div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 glass-card bg-black/5 rounded-xl border border-black/5"></div>
                    ))}
                </div>
            </div>
        );
    }

    const updateProject = async (field: string, value: string | number) => {
        if (!projectId) return;
        try {
            await fetcher(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
            mutate(`/api/projects/${projectId}`);
            mutate('/api/projects'); // Also update dashboard projects list
        } catch (err) {
            console.error(err);
        }
    };

    const deleteProject = async () => {
        if (!projectId) return;
        if (!confirm("Are you sure you want to delete this project and ALL its line items and documents? This cannot be undone.")) return;

        try {
            await fetcher(`/api/projects/${projectId}`, {
                method: 'DELETE'
            });
            mutate('/api/projects'); // Refresh dashboard list
            // Note: Since we don't have direct access to setActiveTab from Finance without drilling props,
            // we'll just let the SWR reload handle the state (it will default back to the first available project)
            // or the user can navigate back manually. The data will be wiped immediately.
            alert("Project deleted successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to delete project");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <EditableCell
                            value={projectData.status}
                            type="select"
                            options={["Active", "Delayed", "Completed", "On Hold"]}
                            onSave={(val) => updateProject('status', val)}
                            format={(val) => (
                                <Badge variant="outline" className={cn(
                                    "border-black/10 font-medium pointer-events-none",
                                    val === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                        val === "Delayed" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"
                                )}>
                                    {val} Project
                                </Badge>
                            )}
                        />
                        <span className="text-muted-foreground text-sm font-medium flex items-center gap-1">
                            •
                            <EditableCell
                                value={projectData.address}
                                onSave={(val) => updateProject('address', val)}
                            />
                        </span>
                    </div>
                    <div className="text-3xl font-bold tracking-tight">
                        <EditableCell
                            value={projectData.name}
                            onSave={(val) => updateProject('name', val)}
                        />
                    </div>
                    <p className="text-muted-foreground mt-1 text-lg">Detailed financial analysis and budget allocation.</p>
                </div>
                <div className="flex gap-4">
                    <Card className="glass px-6 py-4 flex items-center gap-4 border border-rose-500/10">
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Actual Costs</p>
                            <p className="text-xl font-bold text-rose-500">
                                ${summary.actual.toLocaleString()}
                            </p>
                        </div>
                    </Card>
                    <Card className="glass px-6 py-4 flex items-center gap-4 border border-emerald-500/20 bg-emerald-500/5">
                        <div className="text-right">
                            <p className="text-[10px] text-emerald-500/70 uppercase font-bold">Proj. Revenue / Profit</p>
                            <p className="text-xl font-bold text-emerald-500">
                                ${(projectData.salesPrice - summary.actual).toLocaleString()}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <Wallet size={20} />
                        </div>
                    </Card>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={deleteProject}
                        className="h-full px-4 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Delete Project"
                    >
                        <Trash size={18} />
                    </Button>
                </div>
            </header>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card p-6 border-black/5">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Sales Price</p>
                    <div className="text-2xl font-bold text-emerald-100">
                        <EditableCell
                            value={projectData.salesPrice}
                            type="number"
                            onSave={(val) => updateProject('salesPrice', val)}
                            format={(val) => `$${Number(val).toLocaleString()}`}
                        />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Layers size={14} /> Expected gross revenue
                    </div>
                </Card>
                <Card className="glass-card p-6 border-l-4 border-l-primary border-black/5 bg-black/[0.02]">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Actual Spending</p>
                    <div className="text-2xl font-bold">${summary.actual.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <ArrowUpRight size={14} /> Total incurred cost
                    </div>
                </Card>
                <Card className="glass-card p-6 border-black/5">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Total Paid Out</p>
                    <div className="text-2xl font-bold">${summary.committed.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 mt-2">
                        <ArrowDownRight size={14} /> Cleared payments
                    </div>
                </Card>
            </div>

            {/* Granular Breakdown Table */}
            <Card className="glass-card border-black/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary" />
                        Budget vs Actual Breakdown by Trade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {breakdown.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No categorical data available.</p>
                        )}
                        {breakdown.map((item, i) => {
                            const percentSpent = item.budget === 0 ? 0 : Math.min(100, (item.spent / item.budget) * 100);

                            return (
                                <motion.div
                                    key={item.category}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="font-semibold text-sm">{item.category}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Variance: <span className={item.variance >= 0 ? "text-emerald-500" : "text-rose-500"}>
                                                    {item.variance >= 0 ? "+" : ""}${item.variance.toLocaleString()}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold">${item.spent.toLocaleString()}</span>
                                            <span className="text-xs text-muted-foreground ml-2">/ ${item.budget.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentSpent}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className={cn(
                                                "h-full rounded-full",
                                                percentSpent > 90 ? "bg-rose-500" : percentSpent > 75 ? "bg-amber-500" : "bg-primary"
                                            )}
                                        />
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card p-6 border-black/5 relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                        <FileBox size={32} className="text-primary/40" />
                        <div>
                            <h4 className="font-semibold">Document Manager</h4>
                            <p className="text-xs text-muted-foreground">Upload and manage Receipts or Invoices.</p>
                            {documents && documents.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {documents.map(d => (
                                        <div key={d.id} className="flex items-center justify-between group/doc">
                                            <a href={`${d.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-emerald-500 hover:text-emerald-400 transition-colors overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]" title={d.name || d.type}>
                                                • {d.name || d.type} ({new Date(d.uploadedAt).toLocaleDateString()})
                                            </a>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Delete ${d.name || d.type}?`)) return;
                                                    try {
                                                        await fetcher(`/api/documents/${d.id}`, { method: 'DELETE' });
                                                        mutate(projectData?.lineItems?.[0]?.id ? `/api/line-items/${projectData.lineItems[0].id}/documents` : null);
                                                    } catch (err) {
                                                        alert("Failed to delete document");
                                                    }
                                                }}
                                                className="text-muted-foreground hover:text-rose-500 opacity-0 group-hover/doc:opacity-100 transition-opacity p-1"
                                            >
                                                <Trash size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="ml-auto relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={async (e) => {
                                    if (!e.target.files?.[0]) return;
                                    const formData = new FormData();
                                    formData.append('document', e.target.files[0]);

                                    // For now, upload to the first line item of this project for demo purposes
                                    const lineItemId = projectData.lineItems[0]?.id;
                                    if (!lineItemId) return alert("Must have at least one line item to attach document to.");

                                    try {
                                        await fetcher(`/api/line-items/${lineItemId}/upload`, {
                                            method: 'POST',
                                            body: formData
                                        });
                                        alert("Document uploaded successfully!");
                                    } catch (err) {
                                        alert("Failed to upload document.");
                                    }
                                }}
                            />
                            <Button variant="outline" className="pointer-events-none">Upload File</Button>
                        </div>
                    </div>
                </Card>
                <Card className="glass-card p-6 flex items-center gap-4 border-dashed border-black/10 bg-transparent hover:bg-black/[0.02] cursor-pointer transition-colors">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                        <span className="text-muted-foreground font-bold">+</span>
                    </div>
                    <div>
                        <h4 className="font-semibold text-muted-foreground">Add Project Note</h4>
                        <p className="text-xs text-muted-foreground">Internal communication for partners</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};
