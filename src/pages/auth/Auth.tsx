import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isCoachIntent = searchParams.get("role") === "coach";

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkProfileAndRedirect(session.user.id);
      }
    });
  }, []);

  const checkProfileAndRedirect = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('sex, display_name, is_coach')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      navigate('/onboarding');
      return;
    }

    // Redirección basada en el rol real del perfil
    if (profile?.is_coach) {
      navigate('/coach');
    } else if (profile?.sex === 'other' && !profile?.display_name) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success("Bienvenido de nuevo");
        if (data.user) {
          checkProfileAndRedirect(data.user.id);
        }
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      toast.success("Cuenta creada. Por favor verifica tu email.");
      setError("Te hemos enviado un link de confirmación a tu correo.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver al Inicio
      </Button>

      <Card className="w-full max-w-md mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Heavy Duty Di Iorio</CardTitle>
          <CardDescription className={isCoachIntent ? "text-red-500 font-bold" : ""}>
            {isCoachIntent 
              ? "Ser coach es mucho más que pasar una rutina." 
              : "Entrena inteligente, no solo duro."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                  <Input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox 
                    id="remember" 
                    defaultChecked={true}
                    disabled
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                  >
                    Mantener sesión iniciada
                  </Label>
                </div>

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                  <Input 
                    type="password" 
                    placeholder="Contraseña (min 8 chars)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    minLength={8} 
                  />
                  <Input 
                    type="password" 
                    placeholder="Confirmar Contraseña" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    minLength={8} 
                  />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          Al continuar, aceptas los Términos y Condiciones.
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;