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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function AILogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">AI Logs</h2>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas 50 Interacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Tono</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Latencia</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.error ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" /> Error
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3" /> OK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(log.created_at), 'dd/MM HH:mm:ss')}
                  </TableCell>
                  <TableCell className="capitalize">{log.action}</TableCell>
                  <TableCell className="capitalize">{log.coach_tone}</TableCell>
                  <TableCell>{log.tokens_used || '-'}</TableCell>
                  <TableCell>{log.latency_ms ? `${log.latency_ms}ms` : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalle del Log</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <h4 className="font-bold text-sm">Input Data</h4>
                            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[300px]">
                              {JSON.stringify(log.input_data, null, 2)}
                            </pre>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-bold text-sm">Output Data</h4>
                            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-[300px]">
                              {log.error ? log.error : JSON.stringify(log.output_data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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