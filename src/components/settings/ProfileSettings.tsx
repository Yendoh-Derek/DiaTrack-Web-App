
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { exportDemoData, resetDemoData } from "@/stores/demoStore";
import { Download, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

const ProfileSettings = () => {
  const { toast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = exportDemoData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diatrack-demo-data.json';
    a.click();
    toast({ title: "Exported", description: "Demo data downloaded as JSON." });
  };

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    toast({ title: "Reset complete", description: "Demo data restored to defaults." });
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
        Demo mode stores all patient and assessment data locally in your browser. No account required.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export Demo Data
        </Button>
        <Button variant="destructive" onClick={() => setShowResetConfirm(true)}>
          <RefreshCw className="h-4 w-4 mr-2" /> Reset Demo Data
        </Button>
      </div>

      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span style={{ color: 'var(--color-risk-high-accent)' }} aria-hidden="true">⚠</span>
              Reset Demo Data
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all local patient records and assessments, then restore
              default seed data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset Demo Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSettings;
