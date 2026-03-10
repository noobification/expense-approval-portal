import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";
import { Menu, Search, Bell } from "lucide-react";

interface AppShellProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const AppShell = ({ children, activeTab, onTabChange }: AppShellProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background font-sans dark antialiased text-foreground selection:bg-primary/30">
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen lg:pl-72">
                {/* Mobile & Desktop Header */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                            aria-label="Open Menu"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/50 text-muted-foreground hover:border-primary/30 transition-all cursor-pointer group">
                            <Search size={16} className="group-hover:text-primary transition-colors" />
                            <span className="text-xs font-semibold">Search projects...</span>
                            <kbd className="ml-4 flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-bold opacity-50">
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground relative" aria-label="Notifications">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-background" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="p-4 lg:p-8 max-w-7xl mx-auto pb-[calc(1rem+env(safe-area-inset-bottom))]"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};
