import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isApproved: boolean;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isApproved, setIsApproved] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (currentSession: Session | null) => {
        if (!currentSession) {
            setIsApproved(false);
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${currentSession.access_token}`
                }
            });

            if (response.ok) {
                const profile = await response.json();
                setIsApproved(profile.isApproved === true || profile.isApproved === "true");
                setIsAdmin(profile.isAdmin === true || profile.role === "Admin");
            } else if (response.status === 403) {
                // Not approved yet
                setIsApproved(false);
                setIsAdmin(false);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            fetchProfile(session);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            fetchProfile(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, isApproved, isAdmin, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
