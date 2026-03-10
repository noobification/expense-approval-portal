import React from "react";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { Approvals } from "./pages/Approvals";
import { Finance } from "./pages/Finance";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import { SupabaseSignIn } from "./components/auth/SupabaseSignIn";
import { ApprovalPending } from "./components/auth/ApprovalPending";
import { UserManagement } from "./pages/Admin/UserManagement";

function App() {
  const { user, isApproved, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  const handleProjectSelect = (id: string, tab: string = "approvals") => {
    setSelectedProjectId(id);
    setActiveTab(tab);
  };

  // Environment Variable Check
  const isSupabaseConfigMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (isSupabaseConfigMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Configuration Required</h2>
            <p className="text-slate-400 text-sm">
              Your Supabase environment variables are missing. Please add them to your Netlify dashboard.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 text-left text-xs font-mono text-slate-300 space-y-2">
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>
          <p className="text-xs text-slate-500 italic">
            Note: These values are required for the frontend to connect to your database.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium tracking-tight">Securing your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans p-4">
        <SupabaseSignIn />
      </div>
    );
  }

  if (!isApproved) {
    return <ApprovalPending />;
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard onProjectSelect={(id) => handleProjectSelect(id, "approvals")} />
          </motion.div>
        )}
        {activeTab === "approvals" && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Approvals selectedProjectId={selectedProjectId} onProjectSelect={(id) => setSelectedProjectId(id)} />
          </motion.div>
        )}
        {activeTab === "finances" && (
          <motion.div
            key="finances"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Finance selectedProjectId={selectedProjectId} />
          </motion.div>
        )}
        {activeTab === "admin-users" && (
          <motion.div
            key="admin-users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UserManagement />
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

export default App;
