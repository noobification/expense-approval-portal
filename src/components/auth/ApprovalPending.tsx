import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ApprovalPending: React.FC = () => {
    const { signOut, user } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg p-10 rounded-[2.5rem] surface-card border-border shadow-2xl relative overflow-hidden text-center"
            >
                {/* Ambient Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-warning/10 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />

                <div className="flex flex-col items-center mb-8 relative">
                    <div className="w-20 h-20 bg-warning/10 rounded-3xl flex items-center justify-center mb-6 border border-warning/20">
                        <Clock className="w-10 h-10 text-warning animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Access Pending</h1>
                    <p className="text-muted-foreground mt-3 text-lg font-medium leading-relaxed">
                        Your account has been created successfully, but it requires administrator approval before you can access the portal.
                    </p>
                </div>

                <div className="space-y-4 mb-10 text-left bg-surface-dim/50 p-6 rounded-2xl border border-border/50">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground">Identity Verified</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Mail className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground">Awaiting Review</p>
                            <p className="text-sm text-muted-foreground">The administrator has been notified of your request.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 relative">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Check Status
                    </button>
                    <button
                        onClick={signOut}
                        className="flex-1 py-4 bg-surface-dim hover:bg-surface-dim/80 text-foreground font-extrabold rounded-2xl transition-all border border-border/50 flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                <p className="mt-8 text-sm text-muted-foreground font-medium">
                    Need urgent access? <span className="text-primary font-bold cursor-pointer hover:underline">Contact IT Support</span>
                </p>
            </motion.div>
        </div>
    );
};
