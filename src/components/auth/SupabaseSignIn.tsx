import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export const SupabaseSignIn: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });
            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                setSuccess(true);
                setLoading(false);
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
                setLoading(false);
            }
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-10 rounded-[2.5rem] surface-card border-border shadow-2xl text-center"
            >
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Check Your Email</h1>
                <p className="text-muted-foreground mt-4 font-medium italic">
                    We've sent a verification link to <b>{email}</b>. Please confirm your email to continue.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-8 text-primary font-bold hover:underline"
                >
                    Back to Sign In
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-md p-10 rounded-[2.5rem] surface-card border-border shadow-2xl relative overflow-hidden"
        >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />

            <div className="flex flex-col items-center mb-10 relative">
                <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/25 mb-6 rotate-3">
                    {isSignUp ? <Mail className="w-10 h-10 text-primary-foreground" /> : <LogIn className="w-10 h-10 text-primary-foreground" />}
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-muted-foreground mt-2 font-medium">
                    {isSignUp ? "Join the portal to manage expenses" : "Sign in to manage your expenses"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm font-bold"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                {isSignUp && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                        <div className="relative group">
                            <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="John Doe"
                                className="w-full pl-12 pr-4 py-4 bg-surface-dim border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none text-foreground font-medium placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com"
                            className="w-full pl-12 pr-4 py-4 bg-surface-dim border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none text-foreground font-medium placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-4 bg-surface-dim border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none text-foreground font-medium"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            {isSignUp ? "Create Account" : "Sign In"}
                            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-10 pt-8 border-t border-border/50 text-center relative">
                <p className="text-sm text-muted-foreground font-medium">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    {" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-primary font-bold cursor-pointer hover:underline bg-transparent border-none p-0"
                    >
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </motion.div>
    );
};
