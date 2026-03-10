import { useMemo } from "react";
import { motion } from "framer-motion";
import useSWR, { mutate } from "swr";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign,
    Building2
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, fetcher } from "@/lib/utils";

// Define Types based on DB schema
type Project = { id: string, name: string, address: string, salesPrice: number, status: string, createdAt: string };
type LineItem = { id: string, name: string, category: string, paidBy: string, budget: number, actualCost: number, amountPaid: number, status: string, dateIncurred: string, projectName: string, projectId: string };

export const Dashboard = ({ onProjectSelect }: { onProjectSelect?: (id: string) => void }) => {
    // SWR Fetching
    const { data: projects, error: projectsError, isLoading: isLoadingProjects } = useSWR<Project[]>('/api/projects', fetcher);
    const { data: lineItems, error: itemsError, isLoading: isLoadingItems } = useSWR<LineItem[]>('/api/line-items', fetcher);

    // Calculate dynamic stats
    const stats = useMemo(() => {
        if (!projects || !lineItems) return null;

        const totalSales = projects.reduce((acc, proj) => acc + (Number(proj.salesPrice) || 0), 0);
        const actualCost = lineItems.reduce((acc, item) => acc + item.actualCost, 0);
        const totalProfit = totalSales - actualCost;
        const activeProjectsCount = projects.filter(p => p.status === 'Active').length;

        const pendingApprovals = lineItems.filter(i => i.status === 'Revision Required' || i.status === 'Waiting on Material').length;
        const totalPaid = lineItems.reduce((acc, item) => acc + item.amountPaid, 0);

        return [
            { label: "Portfolio Profit", value: `$${(totalProfit / 1000).toFixed(1)}k`, icon: DollarSign, change: "Expected net", color: "text-emerald-500" },
            { label: "Pending Items", value: pendingApprovals.toString(), icon: Clock, change: "Needs review", color: "text-amber-500" },
            { label: "Amount Paid", value: `$${(totalPaid / 1000).toFixed(1)}k`, icon: CheckCircle2, change: "Cleared", color: "text-blue-500" },
            { label: "Active Projects", value: activeProjectsCount.toString(), icon: Building2, change: "In Progress", color: "text-purple-500" },
        ];
    }, [projects, lineItems]);

    const projectPerformance = useMemo(() => {
        if (!projects || !lineItems) return [];
        return projects.map(p => {
            const deps = lineItems.filter(i => i.projectId === p.id);
            const budget = deps.reduce((acc, i) => acc + i.budget, 0);
            const spent = deps.reduce((acc, i) => acc + i.actualCost, 0);
            return {
                id: p.id,
                name: p.name,
                status: p.status,
                budget: `$${(budget / 1000).toFixed(1)}k`,
                spent: `$${(spent / 1000).toFixed(1)}k`,
                progress: budget === 0 ? 0 : Math.min(100, Math.round((spent / budget) * 100))
            }
        });
    }, [projects, lineItems]);

    const createProject = async () => {
        try {
            await fetcher(`/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: "New Project",
                    address: "TBD",
                    salesPrice: 0,
                    status: "Active"
                })
            });
            // Re-fetch projects
            // Needs mutate from swr. Let's make sure it's imported.
        } catch (err) {
            console.error(err);
            alert("Failed to create project");
        }
    };

    // Handle Errors
    if (projectsError || itemsError) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <AlertCircle className="text-rose-500 h-12 w-12" />
                <h3 className="text-xl font-bold">Failed to load Dashboard</h3>
                <p className="text-muted-foreground">Ensure the backend API is running.</p>
            </div>
        );
    }

    // Loading State
    if (isLoadingProjects || isLoadingItems || !stats) {
        return (
            <div className="space-y-10 animate-pulse">
                <header>
                    <div className="h-10 w-64 bg-muted/20 rounded-lg mb-3"></div>
                    <div className="h-6 w-96 bg-muted/10 rounded-lg"></div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-36 surface-card bg-muted/5 rounded-2xl border border-border/50"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            <header className="w-full flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 min-w-0 w-full">
                    <h2 className="text-4xl font-extrabold tracking-tight">Executive Overview</h2>
                    <p className="text-muted-foreground mt-2 text-xl font-medium leading-relaxed">
                        Portfolio-wide visibility and high-level financial health.
                    </p>
                </div>
                <div>
                    <Button
                        onClick={async () => {
                            await createProject();
                            mutate('/api/projects');
                        }}
                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Create Project
                    </Button>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: i * 0.1
                        }}
                    >
                        <Card className="surface-card overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-default relative">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                                <div className={cn("p-2 rounded-lg bg-surface-dim border border-border/50 group-hover:scale-110 transition-transform", stat.color)}>
                                    <stat.icon size={18} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-extrabold tracking-tighter">{stat.value}</div>
                                <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground mt-2 flex items-center gap-1.5">
                                    <span className={cn("inline-block w-1.5 h-1.5 rounded-full bg-current opacity-50", stat.color)} />
                                    {stat.change}
                                </p>
                            </CardContent>
                            <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Project Performance Chart */}
                <Card className="lg:col-span-2 surface-card shadow-xl shadow-black/10">
                    <CardHeader className="flex flex-row items-center justify-between py-6">
                        <CardTitle className="text-xl font-bold">Project Performance</CardTitle>
                        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-primary/10 border border-primary/20" />
                                <span className="text-muted-foreground">Budget</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-primary shadow-lg shadow-primary/20" />
                                <span className="text-muted-foreground">Actual Spent</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-10">
                        <div className="h-80 w-full relative pt-8">
                            {projectPerformance.length === 0 ? (
                                <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/5">
                                    <p className="text-muted-foreground font-medium">No project data available</p>
                                </div>
                            ) : (
                                <div className="h-full flex items-end gap-10 px-6 pb-8 border-b border-border/50 border-l border-border/50 ml-2">
                                    {projectPerformance.map((project, idx) => {
                                        const rawSpent = lineItems?.filter(i => i.projectId === project.id).reduce((acc, i) => acc + i.actualCost, 0) || 0;
                                        const rawBudget = lineItems?.filter(i => i.projectId === project.id).reduce((acc, i) => acc + i.budget, 0) || 0;
                                        const maxVal = Math.max(...projectPerformance.map(p => {
                                            const deps = lineItems?.filter(i => i.projectId === p.id) || [];
                                            return Math.max(
                                                deps.reduce((acc, i) => acc + i.budget, 0),
                                                deps.reduce((acc, i) => acc + i.actualCost, 0)
                                            );
                                        })) || 1;

                                        const budgetHeight = (rawBudget / maxVal) * 100;
                                        const spentHeight = (rawSpent / maxVal) * 100;

                                        return (
                                            <div key={project.id} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                                <div className="w-full flex justify-center items-end gap-1.5 h-full relative">
                                                    {/* Budget Bar */}
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${budgetHeight}%` }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 100,
                                                            damping: 15,
                                                            delay: idx * 0.1
                                                        }}
                                                        className="w-10 bg-primary/10 rounded-t-lg relative border-x border-t border-primary/20 group-hover:bg-primary/15 transition-colors"
                                                    >
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-surface-dim border border-border text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap">
                                                            Budget: ${rawBudget.toLocaleString()}
                                                        </div>
                                                    </motion.div>
                                                    {/* Spent Bar */}
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${spentHeight}%` }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 100,
                                                            damping: 12,
                                                            delay: (idx * 0.1) + 0.2
                                                        }}
                                                        className={cn(
                                                            "w-10 rounded-t-lg relative shadow-xl transition-all duration-300 group-hover:scale-x-105 group-hover:-translate-y-1",
                                                            rawSpent > rawBudget ? "bg-destructive shadow-destructive/20" : "bg-primary shadow-primary/20"
                                                        )}
                                                    >
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-surface-dim border border-border text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap">
                                                            Spent: ${rawSpent.toLocaleString()}
                                                        </div>
                                                    </motion.div>
                                                </div>
                                                <div className="mt-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest text-center truncate w-full" title={project.name}>
                                                    {project.name}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Live Projects Alert */}
                <Card className="surface-card shadow-xl shadow-black/10">
                    <CardHeader className="py-6">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <AlertCircle size={22} className="text-destructive" />
                            Active Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-8">
                        {projectPerformance.map((project, i) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1) }}
                                onClick={() => onProjectSelect?.(project.id)}
                                className="p-5 rounded-2xl bg-surface-dim border border-border/50 hover:bg-muted/10 transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{project.name}</h4>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase py-1 px-2.5 rounded-full tracking-tighter",
                                        project.status === "Active" ? "bg-success/10 text-success" :
                                            project.status === "Delayed" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                                    )}>
                                        {project.status}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                                    <span>Spent: <span className="text-foreground">{project.spent}</span></span>
                                    <span>Budget: <span className="text-foreground">{project.budget}</span></span>
                                </div>
                                <div className="w-full h-1.5 bg-muted/20 mt-4 rounded-full overflow-hidden relative">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-1000 ease-out rounded-full",
                                            project.progress > 90 ? "bg-destructive" : "bg-primary"
                                        )}
                                        style={{ width: `${project.progress}%` }}
                                    />
                                    {project.progress > 100 && (
                                        <div className="absolute top-0 right-0 h-full bg-destructive animate-pulse" style={{ width: '10%' }} />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
