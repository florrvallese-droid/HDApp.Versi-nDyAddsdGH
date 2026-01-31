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
import { RefreshCw, Star, Shield } from "lucide-react";
import { format } from "date-fns";
import { UserProfile } from "@/types";

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

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
    // In a real app, this should probably be done via an edge function to ensure sync with Stripe
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: !currentStatus })
      .eq('user_id', userId);

    if (!error) {
      fetchUsers();
    }
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
                <TableHead>Disciplina</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    {user.display_name || "Sin nombre"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {user.is_premium ? (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 border-0">
                        <Star className="w-3 h-3 mr-1 fill-white" /> PRO
                      </Badge>
                    ) : (
                      <Badge variant="outline">FREE</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="destructive" className="gap-1">
                        <Shield className="w-3 h-3" /> Admin
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">User</span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-sm">{user.coach_tone}</TableCell>
                  <TableCell className="capitalize text-sm">{user.discipline}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => togglePremium(user.user_id, user.is_premium)}
                    >
                      {user.is_premium ? "Revocar Pro" : "Dar Pro"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}