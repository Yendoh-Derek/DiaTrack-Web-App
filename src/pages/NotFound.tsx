
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--color-bg-canvas)' }}
    >
      <div className="clinical-card text-center max-w-md">
        <p
          className="tabular-nums font-bold mb-2"
          style={{ fontSize: 'var(--text-data-xl)', color: 'var(--color-brand-600)' }}
        >
          404
        </p>
        <h1 className="clinical-card-title mb-2">Page not found</h1>
        <p className="mb-6" style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
          No route matches <code style={{ fontFamily: 'var(--font-mono)' }}>{location.pathname}</code>
        </p>
        <Link to="/dashboard">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
