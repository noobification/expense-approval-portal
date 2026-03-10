import { useState, useRef, useEffect, Fragment } from "react";
import { motion } from "framer-motion";
import useSWR, { mutate } from "swr";
import {
    Search,
    Filter,
    Trash,
    CornerDownRight,
    ArrowUp,
    Plus
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, fetcher } from "@/lib/utils";

type LineItem = {
    id: string;
    projectId: string;
    parentId?: string | null;
    name: string;
    category: string;
    paidBy: string;
    budget: number;
    actualCost: number;
    amountPaid: number;
    status: string;
    dateIncurred: string;
    projectName: string;
};

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
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

    useEffect(() => { setEditValue(value) }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (editValue !== value) {
            onSave(type === "number" ? Number(editValue) : editValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleBlur();
        if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        if (type === "select") {
            return (
                <select
                    className="w-full bg-surface-raised border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    "w-full bg-surface-raised border border-border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
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
        <button
            type="button"
            className="w-full text-left cursor-pointer hover:bg-muted/50 px-2 py-1.5 -mx-2 rounded-lg transition-colors min-h-8 flex items-center font-medium focus-visible:ring-2 focus-visible:ring-primary/50 outline-none"
            onClick={() => setIsEditing(true)}
            aria-label={`Edit ${value}`}
        >
            {format(value)}
        </button>
    );
}

// --- Row Renderer Helper ---
const RenderLineItemRow = ({
    item,
    isChild,
    index,
    draggedId,
    setDraggedId,
    hoveredId,
    setHoveredId,
    updateLineItem,
    addLineItem,
    deleteLineItem
}: {
    item: LineItem;
    isChild: boolean;
    index: number;
    draggedId: string | null;
    setDraggedId: (id: string | null) => void;
    hoveredId: string | null;
    setHoveredId: (id: string | null) => void;
    updateLineItem: (id: string, field: string, value: any) => void;
    addLineItem: (parentId: string | null) => void;
    deleteLineItem: (id: string) => void;
}) => {
    const variance = item.budget - item.actualCost;
    const amountDue = item.actualCost - item.amountPaid;

    return (
        <motion.tr
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            draggable
            onDragStart={(e: any) => {
                setDraggedId(item.id);
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                }
            }}
            onDragOver={(e: any) => {
                e.preventDefault();
                if (draggedId && draggedId !== item.id && !isChild) {
                    setHoveredId(item.id);
                }
            }}
            onDragLeave={() => {
                if (hoveredId === item.id) {
                    setHoveredId(null);
                }
            }}
            onDrop={(e: any) => {
                e.preventDefault();
                if (draggedId && draggedId !== item.id && !isChild) {
                    updateLineItem(draggedId, 'parentId', item.id);
                }
                setDraggedId(null);
                setHoveredId(null);
            }}
            onDragEnd={() => {
                setDraggedId(null);
                setHoveredId(null);
            }}
            className={cn(
                "group border-border/50 hover:bg-muted/20 transition-colors relative cursor-grab active:cursor-grabbing",
                isChild && "bg-muted/5",
                hoveredId === item.id && "bg-primary/5 shadow-[inset_0_0_0_1px_var(--color-primary)]"
            )}
        >
            <TableCell className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                {isChild ? (
                    <div className="flex justify-end pr-2 text-muted-foreground/30">
                        <CornerDownRight size={14} />
                    </div>
                ) : item.projectName}
            </TableCell>
            <TableCell className="font-bold text-sm relative whitespace-normal max-w-[300px]">
                <div className={cn("flex items-center gap-2", isChild && "ml-4")}>
                    {isChild && <div className="w-2 h-px bg-border absolute -left-2 top-1/2"></div>}
                    {isChild && <div className="w-px h-full bg-border absolute -left-2 top-0"></div>}
                    <EditableCell
                        value={item.name}
                        onSave={(val) => updateLineItem(item.id, 'name', val)}
                    />
                </div>
            </TableCell>
            <TableCell>
                <EditableCell
                    value={item.paidBy}
                    type="select"
                    options={["Matt", "Dominik", "Dad", "Credit", "Company", "Other"]}
                    onSave={(val) => updateLineItem(item.id, 'paidBy', val)}
                />
            </TableCell>
            <TableCell>
                <div className="flex items-center">
                    <EditableCell
                        value={item.status}
                        type="select"
                        options={["Not Started", "Completed", "In Progress", "Waiting on Material", "Revision Required", "Delayed"]}
                        onSave={(val) => updateLineItem(item.id, 'status', val)}
                        format={(val) => (
                            <Badge variant="outline" className={cn(
                                "font-bold text-[10px] uppercase tracking-tighter px-2 py-0.5",
                                val === "Completed" ? "text-success border-success/20 bg-success/10" :
                                    val === "Revision Required" ? "text-destructive border-destructive/20 bg-destructive/10" :
                                        val === "Waiting on Material" ? "text-warning border-warning/20 bg-warning/10" :
                                            "text-muted-foreground border-muted/50 bg-muted/10"
                            )}>
                                {val}
                            </Badge>
                        )}
                    />
                </div>
            </TableCell>
            <TableCell className="text-right text-muted-foreground/80">
                <div className="flex justify-end tabular-nums">
                    <EditableCell
                        value={item.budget}
                        type="number"
                        onSave={(val) => updateLineItem(item.id, 'budget', val)}
                        format={(val) => `$${Number(val).toLocaleString()}`}
                    />
                </div>
            </TableCell>
            <TableCell className="text-right font-bold text-foreground">
                <div className="flex justify-end tabular-nums">
                    <EditableCell
                        value={item.actualCost}
                        type="number"
                        onSave={(val) => updateLineItem(item.id, 'actualCost', val)}
                        format={(val) => `$${Number(val).toLocaleString()}`}
                    />
                </div>
            </TableCell>
            <TableCell className={cn(
                "text-right font-bold tabular-nums text-sm",
                variance > 0 ? "text-success" : variance < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
                {variance === 0 ? "—" : `${variance > 0 ? '+' : ''}$${variance.toLocaleString()}`}
            </TableCell>
            <TableCell className="text-right text-muted-foreground/80">
                <div className="flex justify-end tabular-nums">
                    <EditableCell
                        value={item.amountPaid}
                        type="number"
                        onSave={(val) => updateLineItem(item.id, 'amountPaid', val)}
                        format={(val) => `$${Number(val).toLocaleString()}`}
                    />
                </div>
            </TableCell>
            <TableCell className="text-right font-bold tracking-tight tabular-nums text-primary">
                ${amountDue.toLocaleString()}
            </TableCell>
            <TableCell className="sticky right-0 text-right p-0 w-[100px] min-w-[100px] bg-inherit z-10">
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 pr-2">
                    {!isChild && (
                        <Button
                            onClick={() => addLineItem(item.id)}
                            size="icon"
                            variant="ghost"
                            title="Add Sub Cost"
                            className="h-8 w-8 text-success hover:text-success hover:bg-success/20"
                        >
                            <Plus size={16} />
                        </Button>
                    )}
                    {isChild && (
                        <Button
                            onClick={() => updateLineItem(item.id, 'parentId', null)}
                            size="icon"
                            variant="ghost"
                            title="Promote to Top Level"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/20"
                        >
                            <ArrowUp size={16} />
                        </Button>
                    )}
                    <Button
                        onClick={() => deleteLineItem(item.id)}
                        size="icon"
                        variant="ghost"
                        title="Delete Item"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash size={16} />
                    </Button>
                </div>
            </TableCell>
        </motion.tr>
    );
};

export const Approvals = ({
    selectedProjectId,
    onProjectSelect
}: {
    selectedProjectId?: string | null,
    onProjectSelect?: (id: string) => void
}) => {
    const { data: lineItemsRaw, error, isLoading } = useSWR<LineItem[]>('/api/line-items', fetcher);

    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [showPendingOnly, setShowPendingOnly] = useState(false);

    // Filter line items if a project is selected or if Pending Only is enabled
    let lineItems = selectedProjectId && lineItemsRaw
        ? lineItemsRaw.filter(i => i.projectId === selectedProjectId)
        : lineItemsRaw;

    if (showPendingOnly && lineItems) {
        lineItems = lineItems.filter(i => i.status === 'Pending Approval');
    }

    // Calculate totals
    const totals = lineItems?.reduce((acc, item) => {
        acc.budget += item.budget;
        acc.actualCost += item.actualCost;
        acc.amountPaid += item.amountPaid;
        acc.variance += (item.budget - item.actualCost);
        acc.amountDue += (item.actualCost - item.amountPaid);
        return acc;
    }, { budget: 0, actualCost: 0, amountPaid: 0, variance: 0, amountDue: 0 }) || { budget: 0, actualCost: 0, amountPaid: 0, variance: 0, amountDue: 0 };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border border-destructive/20 rounded-2xl bg-destructive/5">
                <span className="text-destructive font-bold">Error loading line items. Ensure backend is running.</span>
            </div>
        );
    }

    const updateLineItem = async (id: string, field: string, value: string | number | null) => {
        try {
            await fetcher(`/api/line-items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
            mutate('/api/line-items');
        } catch (err) {
            console.error(err);
        }
    };

    const deleteLineItem = async (id: string) => {
        if (!confirm("Are you sure you want to delete this line item?")) return;
        try {
            await fetcher(`/api/line-items/${id}`, { method: 'DELETE' });
            mutate('/api/line-items');
        } catch (err) {
            console.error(err);
        }
    };

    const addLineItem = async (parentId: string | null = null) => {
        const projectId = selectedProjectId || lineItemsRaw?.[0]?.projectId;
        if (!projectId) {
            alert("No active project found. Either select a project or ensure one exists.");
            return;
        }

        try {
            await fetcher(`/api/line-items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    parentId,
                    name: parentId ? "New Sub-Cost" : "New Line Item",
                    category: "General",
                    paidBy: "Other",
                    budget: 0,
                    actualCost: 0,
                    amountPaid: 0,
                    status: "In Progress"
                })
            });
            mutate('/api/line-items');
        } catch (err) {
            console.error(err);
            alert("Failed to create line item.");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="w-full flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-extrabold tracking-tight">Project Line Items</h2>
                        {selectedProjectId && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 pointer-events-auto cursor-pointer font-bold" onClick={() => onProjectSelect?.("")}>
                                Clear Filter ✕
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-2 text-xl font-medium leading-relaxed">
                        Review detailed project expenses and track variances. Click any cell to edit.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={showPendingOnly ? "default" : "outline"}
                        onClick={() => setShowPendingOnly(!showPendingOnly)}
                        className={cn("h-11 rounded-xl font-bold transition-all px-6", showPendingOnly && "bg-warning hover:bg-warning/90 text-primary-foreground")}
                    >
                        {showPendingOnly ? "Show All Items" : "Pending Approvals"}
                    </Button>
                    <Button variant="outline" className="h-11 rounded-xl font-bold px-6">Export CSV</Button>
                    <Button onClick={() => addLineItem(null)} className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-lg shadow-primary/20">Add Line Item</Button>
                </div>
            </header>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input placeholder="Search items, projects, or categories..." className="pl-12 h-14 bg-surface-dim border-border/50 rounded-2xl font-medium focus:ring-primary/20" />
                </div>
                <Button variant="outline" className="h-14 rounded-2xl flex gap-2 font-bold px-6 w-full sm:w-auto">
                    <Filter size={18} />
                    Filters
                </Button>
            </div>

            <div className="surface-card rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Project</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-widest whitespace-normal max-w-[300px]">Description</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-widest">Paid By</TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-widest">Status</TableHead>
                            <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Budget</TableHead>
                            <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Actual Cost</TableHead>
                            <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Variance</TableHead>
                            <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Amount Paid</TableHead>
                            <TableHead className="text-right font-bold text-xs uppercase tracking-widest">Amount Due</TableHead>
                            <TableHead className="w-[100px] sticky right-0 bg-muted z-30 shadow-[-1px_0_0_0_rgba(255,255,255,0.1)]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i} className="animate-pulse border-border/30">
                                    <TableCell><div className="h-4 w-24 bg-muted/20 rounded-lg" /></TableCell>
                                    <TableCell><div className="h-4 w-32 bg-muted/20 rounded-lg" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted/20 rounded-lg" /></TableCell>
                                    <TableCell><div className="h-6 w-20 bg-muted/20 rounded-full" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted/20 rounded-lg ml-auto" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted/20 rounded-lg ml-auto" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted/20 rounded-lg ml-auto" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted/20 rounded-lg ml-auto" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted/20 rounded-lg ml-auto" /></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            ))
                        ) : lineItems?.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableCell colSpan={10} className="text-center py-20 text-muted-foreground font-bold text-lg">
                                    {showPendingOnly ? "No pending approvals found." : "No line items found."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            showPendingOnly ? (
                                lineItems?.map((item, i) => (
                                    <Fragment key={item.id}>
                                        <RenderLineItemRow
                                            item={item}
                                            isChild={false}
                                            index={i}
                                            draggedId={draggedId}
                                            setDraggedId={setDraggedId}
                                            hoveredId={hoveredId}
                                            setHoveredId={setHoveredId}
                                            updateLineItem={updateLineItem}
                                            addLineItem={addLineItem}
                                            deleteLineItem={deleteLineItem}
                                        />
                                    </Fragment>
                                ))
                            ) : (
                                lineItems?.filter(item => !item.parentId).map((parentItem, i) => {
                                    const children = lineItems?.filter(child => child.parentId === parentItem.id) || [];
                                    return (
                                        <Fragment key={`group-${parentItem.id}`}>
                                            <RenderLineItemRow
                                                item={parentItem}
                                                isChild={false}
                                                index={i}
                                                draggedId={draggedId}
                                                setDraggedId={setDraggedId}
                                                hoveredId={hoveredId}
                                                setHoveredId={setHoveredId}
                                                updateLineItem={updateLineItem}
                                                addLineItem={addLineItem}
                                                deleteLineItem={deleteLineItem}
                                            />
                                            {children.map((child, childIdx) =>
                                                <RenderLineItemRow
                                                    key={child.id}
                                                    item={child}
                                                    isChild={true}
                                                    index={i + childIdx + 1}
                                                    draggedId={draggedId}
                                                    setDraggedId={setDraggedId}
                                                    hoveredId={hoveredId}
                                                    setHoveredId={setHoveredId}
                                                    updateLineItem={updateLineItem}
                                                    addLineItem={addLineItem}
                                                    deleteLineItem={deleteLineItem}
                                                />
                                            )}
                                        </Fragment>
                                    );
                                })
                            )
                        )}
                        {lineItems && lineItems.length > 0 && (
                            <TableRow className="hover:bg-transparent border-t-2 border-border bg-muted/10">
                                <TableCell colSpan={4} className="text-right font-extrabold text-lg py-6 italic text-muted-foreground">Total Summary:</TableCell>
                                <TableCell className="text-right font-bold tabular-nums text-muted-foreground">
                                    ${totals.budget.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-extrabold tabular-nums text-lg text-foreground">
                                    ${totals.actualCost.toLocaleString()}
                                </TableCell>
                                <TableCell className={cn(
                                    "text-right font-extrabold tabular-nums text-lg",
                                    totals.variance > 0 ? "text-success" : totals.variance < 0 ? "text-destructive" : "text-muted-foreground"
                                )}>
                                    {totals.variance === 0 ? "$0" : `${totals.variance > 0 ? '+' : ''}$${totals.variance.toLocaleString()}`}
                                </TableCell>
                                <TableCell className="text-right font-bold tabular-nums text-muted-foreground">
                                    ${totals.amountPaid.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-extrabold tabular-nums text-xl text-primary drop-shadow-[0_0_8px_var(--color-primary)]">
                                    ${totals.amountDue.toLocaleString()}
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
