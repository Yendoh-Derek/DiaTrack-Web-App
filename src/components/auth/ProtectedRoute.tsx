
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [currentUser, loading, navigate, toast]);

  // Show loading state or some placeholder while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-diabetesSense-background">
        <div className="text-center">
          <div className="animate-pulse mb-4 text-diabetesSense-accent text-4xl">Ds</div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the children components
  return currentUser ? <>{children}</> : null;
};

export default ProtectedRoute;
