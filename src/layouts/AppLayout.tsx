"use client";

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Dumbbell, Utensils, User, TrendingUp, Users, Briefcase, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();

  // Definición de navegación dinámica
  // Si es coach, le damos acceso al "Team Hub" en el centro
  const navItems = profile?.is_coach 
    ? [
        { label: "Home", icon: Home, path: "/dashboard" },
        { label: "Train", icon: Dumbbell, path: "/workout" },
        { label: "Equipo", icon: Users, path: "/coach", highlight: true }, // Acceso Coach
        { label: "Nutri", icon: Utensils, path: "/nutrition" },
        { label: "Perfil", icon: User, path: "/settings" },
      ]
    : [
        { label: "Home", icon: Home, path: "/dashboard" },
        { label: "Train", icon: Dumbbell, path: "/workout" },
        { label: "Nutri", icon: Utensils, path: "/nutrition" },
        { label: "Audit", icon: TrendingUp, path: "/analysis" },
        { label: "Perfil", icon: User, path: "/settings" },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-zinc-900 z-50 h-16 safe-area-bottom">
        <div className="max-w-md mx-auto h-full flex items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
                  isActive 
                    ? item.highlight ? "text-red-500 scale-110" : "text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive && !item.highlight && "bg-primary/10",
                  item.highlight && "bg-red-600/10 border border-red-600/20"
                )}>
                  <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}