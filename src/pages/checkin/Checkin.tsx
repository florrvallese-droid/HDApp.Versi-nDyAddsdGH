import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const Checkin = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen">
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver
      </Button>
      <h1 className="text-2xl font-bold">Check-in Físico</h1>
      <p className="text-muted-foreground mt-2">
        El módulo de fotos y peso estará disponible pronto.
      </p>
    </div>
  );
};

export default Checkin;