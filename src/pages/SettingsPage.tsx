
import AppLayout from '@/components/layout/AppLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from '@/context/ThemeContext';
import { MODEL_VERSION } from '@/constants/riskThresholds';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppLayout>
      <header className="mb-6">
        <h1 className="font-semibold" style={{ fontSize: 'var(--text-display)' }}>Settings</h1>
        <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
          Demo data and app preferences
        </p>
      </header>

      <div className="clinical-card mb-6 max-w-2xl">
        <div className="clinical-card-header">
          <h2 className="clinical-card-title">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="normal-case tracking-normal text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Dark Mode
            </Label>
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-tertiary)' }}>
              Switch between light and dark clinical themes
            </p>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
          />
        </div>
      </div>

      <div className="clinical-card mb-6 max-w-2xl">
        <div className="clinical-card-header">
          <h2 className="clinical-card-title">Demo Data</h2>
        </div>
        <ProfileSettings />
      </div>

      <div className="clinical-card max-w-2xl">
        <div className="clinical-card-header">
          <h2 className="clinical-card-title">About DiaTrack</h2>
        </div>
        <div className="space-y-4" style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
          <p>
            DiaTrack is a clinician-facing diabetes risk assessment demo. Predictions use an
            in-browser logistic regression model (ONNX). All data is stored locally.
          </p>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Disclaimer
            </h3>
            <p style={{ fontSize: 'var(--text-body-sm)' }}>
              This application is for educational and portfolio demonstration purposes only.
              It is not intended for clinical diagnosis or medical decision-making.
            </p>
          </div>
          <Separator />
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-tertiary)' }}>
            Version 1.0.0 · Model v{MODEL_VERSION} · © {new Date().getFullYear()} DiaTrack
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
