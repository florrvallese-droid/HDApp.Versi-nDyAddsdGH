import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Camera, Scale, Save, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { uploadCheckinPhoto } from "@/services/storage";
import { useProfile } from "@/hooks/useProfile";

export default function Checkin() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState("");
  
  // Previous data
  const [prevWeight, setPrevWeight] = useState<number | null>(null);

  // Photos
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);

  // Previews
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [sidePreview, setSidePreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchLastCheckin();
  }, []);

  const fetchLastCheckin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get last checkin log
      const { data, error } = await supabase
        .from('logs')
        .select('data')
        .eq('user_id', user.id)
        .eq('type', 'checkin')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && data.data && data.data.weight) {
        setPrevWeight(data.data.weight);
        // Pre-fill weight with previous weight for convenience? 
        // No, better to force user to type it.
      }
    } catch (err) {
      console.log("No previous checkin found or error fetching it.");
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
    if (!weight) {
      toast.error("Por favor ingresa tu peso actual");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const photoPaths: string[] = [];

      // Upload photos if exist
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
        // Assuming checkin doesn't need specific muscle group etc.
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
      
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Check-in Físico</h1>
      </div>

      {/* Weight Section */}
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
              className="text-2xl h-14 w-32 text-center"
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

      {/* Photos Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" /> Fotos de Progreso
          </CardTitle>
          <CardDescription>Opcional pero recomendado (Máx 3)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          
          {/* Front */}
          <div className="space-y-2">
            <Label className="text-xs text-center block">Frente</Label>
            <div 
              className="aspect-[3/4] bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => document.getElementById('front-upload')?.click()}
            >
              {frontPreview ? (
                <img src={frontPreview} alt="Front" className="w-full h-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
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

          {/* Side */}
          <div className="space-y-2">
            <Label className="text-xs text-center block">Perfil</Label>
            <div 
              className="aspect-[3/4] bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => document.getElementById('side-upload')?.click()}
            >
              {sidePreview ? (
                <img src={sidePreview} alt="Side" className="w-full h-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
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

          {/* Back */}
          <div className="space-y-2">
            <Label className="text-xs text-center block">Espalda</Label>
            <div 
              className="aspect-[3/4] bg-muted rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => document.getElementById('back-upload')?.click()}
            >
              {backPreview ? (
                <img src={backPreview} alt="Back" className="w-full h-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
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

      {/* Notes Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="¿Cómo te sientes? ¿Hinchazón, vascularidad, energía?" 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button className="w-full h-12 text-lg" onClick={handleSubmit} disabled={loading}>
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

    </div>
  );
}