import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Camera, Scale, Save, Loader2, Lock, Plus, Images } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { uploadCheckinPhoto } from "@/services/storage";
import { useProfile } from "@/hooks/useProfile";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { Badge } from "@/components/ui/badge";
import { ComparisonGallery } from "@/components/checkin/ComparisonGallery";

export default function Checkin() {
  const navigate = useNavigate();
  const { profile, hasProAccess } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState("");
  
  const [prevWeight, setPrevWeight] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [fullLogs, setFullLogs] = useState<any[]>([]);

  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);

  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [sidePreview, setSidePreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('logs')
        .select('id, data, created_at')
        .eq('user_id', user.id)
        .eq('type', 'checkin')
        .order('created_at', { ascending: true })
        .limit(50);

      if (data && data.length > 0) {
        setFullLogs(data);

        const chartData = data.map(log => ({
            date: new Date(log.created_at).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit'}),
            weight: log.data.weight
        }));
        setHistory(chartData);

        const lastEntry = data[data.length - 1];
        if (lastEntry.data.weight) {
            setPrevWeight(lastEntry.data.weight);
        }
      }
    } catch (err) {
      console.log("Error fetching history:", err);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File) => void, setPreview: (s: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }

    if (!weight) {
      toast.error("Por favor ingresa tu peso actual");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const photoPaths: string[] = [];

      if (frontPhoto) {
        const { path } = await uploadCheckinPhoto(user.id, frontPhoto, 'front');
        if (path) photoPaths.push(path);
      }
      if (sidePhoto) {
        const { path } = await uploadCheckinPhoto(user.id, sidePhoto, 'side');
        if (path) photoPaths.push(path);
      }
      if (backPhoto) {
        const { path } = await uploadCheckinPhoto(user.id, backPhoto, 'back');
        if (path) photoPaths.push(path);
      }

      const currentWeight = parseFloat(weight);
      const weightDelta = prevWeight ? currentWeight - prevWeight : 0;

      const logData = {
        weight: currentWeight,
        weight_delta: weightDelta,
        photos: photoPaths,
        notes: notes
      };

      const { error } = await supabase.from('logs').insert({
        user_id: user.id,
        type: 'checkin',
        data: logData,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Check-in guardado correctamente");
      navigate('/dashboard');

    } catch (error: any) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto min-h-screen space-y-6">
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        featureName="Check-in y Fotos" 
      />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Estado Físico</h1>
        </div>
        {!hasProAccess && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 gap-1">
            <Lock className="w-3 h-3" /> Vista Previa
          </Badge>
        )}
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="new" className="data-[state=active]:bg-zinc-800 text-xs uppercase font-bold tracking-wider">
             <Plus className="w-3 h-3 mr-2" /> Nuevo Registro
          </TabsTrigger>
          <TabsTrigger value="gallery" className="data-[state=active]:bg-zinc-800 text-xs uppercase font-bold tracking-wider">
             <Images className="w-3 h-3 mr-2" /> Galería & Progreso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6 animate-in fade-in slide-in-from-left-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> Peso Corporal
              </CardTitle>
              <CardDescription>
                {prevWeight ? `Anterior: ${prevWeight} ${profile?.units || 'kg'}` : "Primer registro"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  className="text-2xl h-14 w-32 text-center bg-zinc-950 font-bold"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  step="0.1"
                />
                <span className="text-xl font-medium text-muted-foreground uppercase">
                  {profile?.units || 'kg'}
                </span>
              </div>
              {prevWeight && weight && (
                <div className={`mt-2 text-sm font-medium ${parseFloat(weight) < prevWeight ? 'text-green-500' : parseFloat(weight) > prevWeight ? 'text-red-500' : 'text-muted-foreground'}`}>
                  Delta: {(parseFloat(weight) - prevWeight).toFixed(1)} {profile?.units}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" /> Fotos de Progreso
              </CardTitle>
              <CardDescription>Opcional pero recomendado (Máx 3)</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-center block text-zinc-400 font-bold uppercase">Frente</Label>
                <div 
                  className="aspect-[3/4] bg-zinc-950 rounded-md border-2 border-dashed border-zinc-800 flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-zinc-900 transition-colors"
                  onClick={() => document.getElementById('front-upload')?.click()}
                >
                  {frontPreview ? (
                    <img src={frontPreview} alt="Front" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-zinc-700" />
                  )}
                  <input 
                    id="front-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handlePhotoSelect(e, setFrontPhoto, setFrontPreview)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-center block text-zinc-400 font-bold uppercase">Perfil</Label>
                <div 
                  className="aspect-[3/4] bg-zinc-950 rounded-md border-2 border-dashed border-zinc-800 flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-zinc-900 transition-colors"
                  onClick={() => document.getElementById('side-upload')?.click()}
                >
                  {sidePreview ? (
                    <img src={sidePreview} alt="Side" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-zinc-700" />
                  )}
                  <input 
                    id="side-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handlePhotoSelect(e, setSidePhoto, setSidePreview)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-center block text-zinc-400 font-bold uppercase">Espalda</Label>
                <div 
                  className="aspect-[3/4] bg-zinc-950 rounded-md border-2 border-dashed border-zinc-800 flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-zinc-900 transition-colors"
                  onClick={() => document.getElementById('back-upload')?.click()}
                >
                  {backPreview ? (
                    <img src={backPreview} alt="Back" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-6 w-6 text-zinc-700" />
                  )}
                  <input 
                    id="back-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handlePhotoSelect(e, setBackPhoto, setBackPreview)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="¿Cómo te sientes? ¿Hinchazón, vascularidad, energía?" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-zinc-950 border-zinc-800"
              />
            </CardContent>
          </Card>

          <Button className="w-full h-12 text-lg relative overflow-hidden" onClick={handleSubmit} disabled={loading}>
            {!hasProAccess && (
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-10 font-bold text-shadow">
                <Lock className="w-4 h-4 mr-2"/> Requiere PRO
              </div>
            )}
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" /> Guardar Check-in
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6 animate-in fade-in slide-in-from-right-4">
           {history.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Evolución de Peso</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] w-full pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="weight" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <ComparisonGallery logs={fullLogs} />
        </TabsContent>
      </Tabs>

    </div>
  );
}