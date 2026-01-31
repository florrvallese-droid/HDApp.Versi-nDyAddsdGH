import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { RefreshCw, Star, Shield, Eye, Activity, Dumbbell, Calendar } from "lucide-react";
import { format } from "date-fns";
import { UserProfile } from "@/types";

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Detail View State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: !currentStatus })
      .eq('user_id', userId);

    if (!error) {
      fetchUsers();
      if (selectedUser?.user_id === userId) {
        setSelectedUser(prev => prev ? { ...prev, is_premium: !currentStatus } : null);
      }
    }
  };

  const handleViewUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setLoadingStats(true);
    
    // Fetch stats
    const { count: workoutCount } = await supabase.from('logs').select('*', { count: 'exact', head: true }).eq('user_id', user.user_id).eq('type', 'workout');
    const { count: checkinCount } = await supabase.from('logs').select('*', { count: 'exact', head: true }).eq('user_id', user.user_id).eq('type', 'checkin');
    const { count: aiCount } = await supabase.from('ai_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.user_id);
    
    // Get last activity
    const { data: lastLog } = await supabase.from('logs').select('created_at').eq('user_id', user.user_id).order('created_at', { ascending: false }).limit(1).single();

    setUserStats({
        workouts: workoutCount || 0,
        checkins: checkinCount || 0,
        aiRequests: aiCount || 0,
        lastActive: lastLog?.created_at
    });
    setLoadingStats(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
        <Button variant="outline" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base de Usuarios ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Tono Coach</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span>{user.display_name || "Sin nombre"}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{user.sex} • {user.units}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.created_at ? format(new Date(user.created_at), 'dd/MM/yy') : '-'}
                  </TableCell>
                  <TableCell>
                    {user.is_premium ? (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 border-0 text-[10px]">
                        <Star className="w-3 h-3 mr-1 fill-white" /> PRO
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">FREE</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="destructive" className="gap-1 text-[10px]">
                        <Shield className="w-3 h-3" /> Admin
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">User</span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-sm">{user.coach_tone}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="h-4 w-4 text-zinc-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DETAIL SHEET */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
                <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                    {selectedUser?.display_name || "Usuario"}
                    {selectedUser?.is_premium && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                </SheetTitle>
                <SheetDescription>
                    ID: <span className="font-mono text-xs">{selectedUser?.user_id}</span>
                </SheetDescription>
            </SheetHeader>

            {selectedUser && (
                <div className="mt-6 space-y-6">
                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button 
                            className={`flex-1 ${selectedUser.is_premium ? 'bg-zinc-200 text-black hover:bg-zinc-300' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
                            onClick={() => togglePremium(selectedUser.user_id, selectedUser.is_premium)}
                        >
                            {selectedUser.is_premium ? "Revocar Premium" : "Otorgar Premium"}
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-muted/50 border-none">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <Dumbbell className="h-6 w-6 text-primary mb-2" />
                                <span className="text-2xl font-bold">{loadingStats ? "-" : userStats?.workouts}</span>
                                <span className="text-xs text-muted-foreground uppercase font-bold">Workouts</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/50 border-none">
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <Activity className="h-6 w-6 text-blue-500 mb-2" />
                                <span className="text-2xl font-bold">{loadingStats ? "-" : userStats?.checkins}</span>
                                <span className="text-xs text-muted-foreground uppercase font-bold">Check-ins</span>
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/50 border-none col-span-2">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-zinc-500" />
                                    <span className="text-sm font-medium">Última Actividad</span>
                                </div>
                                <span className="text-sm font-bold">
                                    {loadingStats ? "..." : userStats?.lastActive ? format(new Date(userStats.lastActive), 'dd MMM yyyy HH:mm') : "Nunca"}
                                </span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-4 border-t pt-4">
                        <h4 className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Configuración</h4>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <span className="block text-zinc-500 text-xs">Disciplina</span>
                                <span className="capitalize font-medium">{selectedUser.discipline}</span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 text-xs">Coach Tone</span>
                                <span className="capitalize font-medium">{selectedUser.coach_tone}</span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 text-xs">Unidades</span>
                                <span className="uppercase font-medium">{selectedUser.units}</span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 text-xs">Sexo</span>
                                <span className="capitalize font-medium">{selectedUser.sex}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Usage */}
                    <div className="space-y-2 border-t pt-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Consumo IA</h4>
                            <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded">
                                {loadingStats ? "-" : userStats?.aiRequests} reqs
                            </span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-purple-500" 
                                style={{ width: `${Math.min((userStats?.aiRequests || 0) / 100 * 100, 100)}%` }} 
                            />
                        </div>
                    </div>

                </div>
            )}
        </SheetContent>
      </Sheet>
    </div>
  );
}