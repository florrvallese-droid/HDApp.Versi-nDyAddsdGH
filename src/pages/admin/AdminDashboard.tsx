import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { Users, Activity, DollarSign, Brain, Zap, Download, Copy, TrendingUp, Mail, CreditCard } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    premiumUsers: 0,
    aiRequests: 0,
    totalLogs: 0,
    totalTokens: 0,
    revenue: 0,
    conversionRate: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const PRICE_MONTHLY = 9.99; 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Fetch Counts
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: premiumCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true);
    const { count: aiCount } = await supabase.from('ai_logs').select('*', { count: 'exact', head: true });
    const { count: logsCount } = await supabase.from('logs').select('*', { count: 'exact', head: true });
    
    // 2. Fetch Token Usage
    const { data: tokenData } = await supabase.from('ai_logs').select('tokens_used');
    const totalTokens = tokenData?.reduce((sum, row) => sum + (row.tokens_used || 0), 0) || 0;

    // 3. Fetch Users for Mailing List
    const { data: users } = await supabase
        .from('profiles')
        .select('user_id, display_name, created_at, is_premium, coach_tone, discipline')
        .order('created_at', { ascending: false });

    // 4. Activity Chart Data
    const startDate = subDays(new Date(), 14).toISOString();
    const { data: logsData } = await supabase
      .from('logs')
      .select('created_at')
      .gte('created_at', startDate)
      .order('created_at', { ascending: true });

    // Process Chart
    const dailyCounts: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, 'dd/MM');
        dailyCounts[key] = 0;
    }
    logsData?.forEach(log => {
        const key = format(new Date(log.created_at), 'dd/MM');
        if (dailyCounts[key] !== undefined) dailyCounts[key]++;
    });
    const formattedChartData = Object.keys(dailyCounts).map(date => ({ name: date, logs: dailyCounts[date] }));

    // Calculations
    const calculatedRevenue = (premiumCount || 0) * PRICE_MONTHLY;
    const conversion = userCount ? ((premiumCount || 0) / userCount) * 100 : 0;

    setStats({
      users: userCount || 0,
      premiumUsers: premiumCount || 0,
      aiRequests: aiCount || 0,
      totalLogs: logsCount || 0,
      totalTokens: totalTokens,
      revenue: calculatedRevenue,
      conversionRate: conversion
    });

    setChartData(formattedChartData);
    setUserList(users || []);
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!userList.length) return;

    const headers = ["ID", "Nombre", "Fecha Registro", "Premium", "Disciplina", "Coach"];
    
    const rows = userList.map(u => [
      u.user_id,
      u.display_name || "Sin Nombre",
      new Date(u.created_at).toLocaleDateString(),
      u.is_premium ? "SI" : "NO",
      u.discipline,
      u.coach_tone
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `heavyduty_users_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Base de datos exportada correctamente");
  };

  const handleCopyMailing = () => {
    const dataString = userList.map(u => `${u.display_name} [ID: ${u.user_id}]`).join("\n");
    navigator.clipboard.writeText(dataString);
    toast.success("Lista copiada al portapapeles (Nombres + IDs)");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight uppercase italic">Gestión del Negocio</h2>
        <div className="flex gap-2">
            <span className="text-xs text-muted-foreground self-center mr-2">
                Actualizado: {format(new Date(), 'HH:mm')}
            </span>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="bg-green-950/20 border-green-900/50 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 bg-green-500/10 w-24 h-24 rounded-full blur-xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-green-500 uppercase tracking-wider">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">${stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-green-400/70 font-mono mt-1">
              Base: {stats.premiumUsers} suscriptores activos
            </p>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                    {stats.conversionRate.toFixed(1)}% Conversión
                </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiRequests} <span className="text-sm font-normal text-muted-foreground">reqs</span></div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
               <Zap className="h-3 w-3 text-yellow-500" />
               <span className="font-mono font-medium text-white">{stats.totalTokens.toLocaleString()}</span> tokens
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              Workouts + Checkins
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Tendencia de Uso (14 días)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#666'}} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#666'}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="logs" stroke="#dc2626" fillOpacity={1} fill="url(#colorLogs)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-zinc-900 border-zinc-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                <CreditCard className="h-4 w-4 text-green-500" /> Esquema de Negocio
            </CardTitle>
            <CardDescription className="text-xs">Proyección basada en usuarios actuales</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center gap-6">
            
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">ARR (Anual)</p>
                    <p className="text-xl font-black text-white">${(stats.revenue * 12).toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Ticket Promedio</p>
                    <p className="text-xl font-black text-white">$9.99</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Distribución Free vs Pro</span>
                    <span className="text-white font-bold">{stats.premiumUsers} / {stats.users}</span>
                </div>
                <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div 
                        className="h-full bg-yellow-600" 
                        style={{ width: `${stats.conversionRate}%` }} 
                    />
                    <div className="h-full bg-zinc-700 w-full" />
                </div>
                <p className="text-[10px] text-zinc-500 text-right">
                    Meta saludable: 5% conversión (Actual: {stats.conversionRate.toFixed(1)}%)
                </p>
            </div>

          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" /> Recolección de Datos (Mailing)
                </CardTitle>
                <CardDescription>
                    Gestiona tu audiencia para campañas de Email Marketing.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyMailing} className="border-zinc-700 text-zinc-300 hover:text-white">
                    <Copy className="h-4 w-4 mr-2" /> Copiar Lista
                </Button>
                <Button size="sm" onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="h-4 w-4 mr-2" /> Exportar CSV
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border border-zinc-800 overflow-hidden">
                <div className="bg-zinc-900/50 p-3 grid grid-cols-12 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                    <div className="col-span-4">Usuario</div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-2">Disciplina</div>
                    <div className="col-span-2">Coach</div>
                    <div className="col-span-2 text-right">Registro</div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {userList.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">Cargando usuarios...</div>
                    ) : (
                        userList.map((user) => (
                            <div key={user.user_id} className="p-3 grid grid-cols-12 items-center text-sm border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                                <div className="col-span-4 flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border border-zinc-800">
                                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                                            {user.display_name?.substring(0, 2).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium text-white truncate">{user.display_name || "Sin Nombre"}</span>
                                        <span className="text-[10px] text-zinc-500 font-mono truncate">{user.user_id}</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    {user.is_premium ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">PRO</span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">FREE</span>
                                    )}
                                </div>
                                <div className="col-span-2 text-xs capitalize text-zinc-400">{user.discipline}</div>
                                <div className="col-span-2 text-xs capitalize text-zinc-400">{user.coach_tone}</div>
                                <div className="col-span-2 text-right text-xs text-zinc-500 font-mono">
                                    {format(new Date(user.created_at), 'dd/MM/yy')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2 text-center">
                *Nota: Para ver correos electrónicos reales, utiliza la función de exportación CSV que incluye identificadores únicos para cruzar con la base de datos de Auth.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}