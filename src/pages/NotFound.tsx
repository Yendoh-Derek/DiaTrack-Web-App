
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-diabetesSense-background flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-diabetesSense-accent mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-6">Oops! Page not found</p>
        <Button 
          onClick={() => window.location.href = "/"}
          className="inline-flex items-center bg-diabetesSense-accent hover:bg-diabetesSense-accent/90"
        >
          <ArrowLeft size={18} className="mr-2" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
