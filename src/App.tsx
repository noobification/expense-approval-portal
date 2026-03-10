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
