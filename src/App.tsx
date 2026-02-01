import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/auth/Auth";
import Onboarding from "./pages/onboarding/Onboarding";
import Dashboard from "./pages/dashboard/Dashboard";
import WorkoutLogger from "./pages/workout/WorkoutLogger";
import PostWorkout from "./pages/workout/PostWorkout";
import Checkin from "./pages/checkin/Checkin";
import GlobalAnalysis from "./pages/analysis/GlobalAnalysis";
import Nutrition from "./pages/nutrition/Nutrition";
import Pharmacology from "./pages/pharmacology/Pharmacology";
import Settings from "./pages/settings/Settings";
import NotFound from "./pages/NotFound";

// Layouts
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PromptManager from "./pages/admin/PromptManager";
import AILogs from "./pages/admin/AILogs";
import UserManagement from "./pages/admin/UserManagement";
import FeatureFlags from "./pages/admin/FeatureFlags";

// Coach Pages
import CoachDashboard from "./pages/coach/CoachDashboard";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* User App Routes (With Bottom Nav) */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workout" element={<WorkoutLogger />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/checkin" element={<Checkin />} />
              <Route path="/analysis" element={<GlobalAnalysis />} />
              <Route path="/pharmacology" element={<Pharmacology />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Coach Dashboard inside AppLayout if preferred, or separate */}
              <Route path="/coach" element={<CoachDashboard />} />
            </Route>
            
            {/* Standalone User Pages */}
            <Route path="/workout/analysis" element={<PostWorkout />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="prompts" element={<PromptManager />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="logs" element={<AILogs />} />
              <Route path="flags" element={<FeatureFlags />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;