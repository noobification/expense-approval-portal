import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    FileCheck,
    BarChart3,
    Settings,
    ChevronRight,
    LogOut,
    X,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
    { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
    { id: "approvals", label: "Project Approvals", icon: FileCheck },
    { id: "finances", label: "Financial Deep-Dive", icon: BarChart3 },
];

const SECONDARY_NAV = [
    { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
    activeTab: string;
    onTabChange: (id: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) => {
    const { user, session, isAdmin, signOut } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Partner";

    React.useEffect(() => {
        if (isAdmin && session?.access_token) {
            fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const count = data.filter((u: any) => u.isApproved === "false" || u.isApproved === false).length;
                        setPendingCount(count);
                    }
                })
                .catch(err => console.error("Failed to fetch pending user count:", err));
        }
    }, [isAdmin, session?.access_token]);

    const sidebarContent = (
        <aside
            role="navigation"
            aria-label="Main Navigation"
            className={cn(
                "w-72 h-screen flex flex-col p-6 fixed left-0 top-0 overflow-hidden z-50 bg-surface border-r border-border shadow-xl lg:shadow-none",
                "transition-transform duration-300 ease-in-out",
                !isOpen && "-translate-x-full lg:translate-x-0"
            )}
        >
            <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                        <span className="text-primary-foreground font-bold text-xl">E</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground leading-tight">Expense Portal</h1>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-70">Partner Access</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onTabChange(item.id);
                            onClose?.();
                        }}
                        aria-label={`Go to ${item.label}`}
                        aria-current={activeTab === item.id ? "page" : undefined}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                            activeTab === item.id ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <item.icon size={20} className={cn(activeTab === item.id ? "text-primary" : "group-hover:scale-105 transition-transform opacity-70")} />
                        <span className="font-semibold text-sm">{item.label}</span>
                        {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
                    </button>
                ))}

                {isAdmin && (
                    <button
                        onClick={() => {
                            onTabChange("admin-users");
                            onClose?.();
                        }}
                        aria-current={activeTab === "admin-users" ? "page" : undefined}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                            activeTab === "admin-users" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <Users size={20} className={cn(activeTab === "admin-users" ? "text-primary" : "group-hover:scale-105 transition-transform opacity-70")} />
                        <span className="font-semibold text-sm">User Management</span>
                        {pendingCount > 0 && (
                            <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg shadow-primary/20 animate-pulse">
                                {pendingCount}
                            </span>
                        )}
                        {activeTab === "admin-users" && pendingCount === 0 && <ChevronRight size={14} className="ml-auto" />}
                    </button>
                )}
            </nav>

            <div className="pt-6 border-t border-border space-y-1">
                {SECONDARY_NAV.map((item) => (
                    <button
                        key={item.id}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group"
                    >
                        <item.icon size={20} className="group-hover:scale-105 transition-transform opacity-70" />
                        <span className="font-semibold text-sm">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-border flex items-center justify-between gap-3 px-2">
                <div className="flex flex-col min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50 mb-0.5">
                        Authenticated
                    </p>
                    <p className="text-foreground font-bold text-xs truncate" title={displayName}>
                        {displayName}
                    </p>
                </div>
                <button
                    onClick={() => signOut()}
                    className="p-2 rounded-xl bg-muted/50 hover:bg-destructive/10 hover:text-destructive transition-all text-muted-foreground"
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Desktop / Mobile Sidebar */}
            {sidebarContent}
        </>
    );
};
