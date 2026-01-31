import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/services/supabase";
import { Users, Activity, DollarSign, Brain } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, subDays } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    premiumUsers: 0,
    aiRequests: 0,
    totalLogs: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchChartData();
    fetchRecentUsers();
  }, []);

  const fetchStats = async () => {
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

  const fetchChartData = async () => {
    // Fetch logs for the last 14 days to build an activity chart
    const startDate = subDays(new Date(), 14).toISOString();
    
    const { data } = await supabase
      .from('logs')
      .select('created_at')
      .gte('created_at', startDate)
      .order('created_at', { ascending: true });

    if (!data) return;

    // Process data for chart
    const dailyCounts: Record<string, number> = {};
    
    // Initialize last 14 days with 0
    for (let i = 13; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, 'MM/dd');
        dailyCounts[key] = 0;
    }

    data.forEach(log => {
        const key = format(new Date(log.created_at), 'MM/dd');
        if (dailyCounts[key] !== undefined) {
            dailyCounts[key]++;
        }
    });

    const formattedData = Object.keys(dailyCounts).map(date => ({
        name: date,
        logs: dailyCounts[date]
    }));

    setChartData(formattedData);
  };

  const fetchRecentUsers = async () => {
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    
    setRecentUsers(data || []);
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
            <div className="text-2xl font-bold">${(stats.premiumUsers * 9.99).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              MRR Potencial
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad (Últimos 14 días)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip />
                        <Area type="monotone" dataKey="logs" stroke="#8884d8" fillOpacity={1} fill="url(#colorLogs)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
                {recentUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay usuarios recientes.</p>
                ) : (
                    recentUsers.map((user) => (
                        <div key={user.user_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                        {user.display_name?.substring(0, 2).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.display_name || "Usuario Sin Nombre"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(user.created_at), 'dd MMM yyyy')}
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs font-medium">
                                {user.is_premium ? (
                                    <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">PRO</span>
                                ) : (
                                    <span className="text-zinc-500">FREE</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}