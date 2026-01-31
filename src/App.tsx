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
import NotFound from "./pages/NotFound";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PromptManager from "./pages/admin/PromptManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public / User Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutLogger />} />
          <Route path="/workout/analysis" element={<PostWorkout />} />
          <Route path="/checkin" element={<Checkin />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="prompts" element={<PromptManager />} />
            <Route path="users" element={<div className="p-4">Users Management Coming Soon</div>} />
            <Route path="logs" element={<div className="p-4">AI Logs Viewer Coming Soon</div>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;