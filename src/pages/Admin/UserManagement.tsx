import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Shield, Mail, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '@/lib/utils';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved: string;
    createdAt: string;
}

export const UserManagement: React.FC = () => {
    const { session } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleApproval = async (userId: string, currentStatus: string) => {
        setActionLoading(userId);
        const newStatus = currentStatus === "true" ? "false" : "true";
        try {
            const response = await fetch(`/api/admin/users/${userId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ isApproved: newStatus })
            });
            if (response.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, isApproved: newStatus } : u));
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 min-w-0 w-full">
                    <h2 className="text-4xl font-extrabold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground mt-2 text-xl font-medium leading-relaxed">
                        Manage portal access and approve new registration requests.
                    </p>
                </div>
                <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-primary uppercase tracking-wider">Admin Mode</span>
                </div>
            </header>

            <div className="surface-card rounded-[2.5rem] border border-border/50 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border/50">
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">User</th>
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Role</th>
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Joined</th>
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Access Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-surface-dim border border-border/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                                <Users className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-lg">{user.name}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                            user.role === 'Admin' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-muted-foreground font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4 opacity-70" />
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            disabled={actionLoading === user.id}
                                            onClick={() => toggleApproval(user.id, user.isApproved)}
                                            className={cn(
                                                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50",
                                                user.isApproved === "true"
                                                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                    : "bg-success/10 text-success hover:bg-success/20 shadow-lg shadow-success/10"
                                            )}
                                        >
                                            {actionLoading === user.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : user.isApproved === "true" ? (
                                                <><UserX className="w-4 h-4" /> Revoke Access</>
                                            ) : (
                                                <><UserCheck className="w-4 h-4" /> Approve User</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
