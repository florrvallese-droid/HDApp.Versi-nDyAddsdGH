import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/services/supabase";
import { Users, Activity, DollarSign, Brain } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    premiumUsers: 0,
    aiRequests: 0,
    totalLogs: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // These are simplified counts. In a real app with millions of rows, use count() estimation or dedicated stats table.
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: premiumCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true);
    const { count: aiCount } = await supabase.from('ai_logs').select('*', { count: 'exact', head: true });
    const { count: logsCount } = await supabase.from('logs').select('*', { count: 'exact', head: true });

    setStats({
      users: userCount || 0,
      premiumUsers: premiumCount || 0,
      aiRequests: aiCount || 0,
      totalLogs: logsCount || 0
    });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">
              {stats.premiumUsers} usuarios premium
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiRequests}</div>
            <p className="text-xs text-muted-foreground">
              Total histórico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad (Logs)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              Workouts + Checkins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Est.</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.premiumUsers * 9.99}</div>
            <p className="text-xs text-muted-foreground">
              MRR Potencial
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Gráfico de actividad en desarrollo...</p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Lista de usuarios en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}