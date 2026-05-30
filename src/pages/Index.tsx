
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Activity, ClipboardList, Users, Shield } from 'lucide-react';

const features = [
  {
    title: 'Risk Assessment',
    text: 'Run ML-powered diabetes risk predictions with feature importance analysis and clinical flag detection.',
    icon: ClipboardList,
  },
  {
    title: 'Patient Management',
    text: 'Track patients, view assessment history, and monitor risk trends over time in a structured clinical workflow.',
    icon: Users,
  },
  {
    title: 'Clinical Decision Support',
    text: 'Clear risk tiers, SHAP values, and model metadata designed for clinician trust and transparency.',
    icon: Shield,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-canvas)' }}>
      <header
        className="border-b"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border-default)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center"
              style={{ background: 'var(--color-brand-600)' }}
            >
              <Activity className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold" style={{ fontSize: 'var(--text-heading-md)', color: 'var(--color-brand-900)' }}>
              DiaTrack
            </span>
          </div>
          <Link to="/dashboard">
            <Button>Launch Demo</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <h1
            className="font-semibold mb-4"
            style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: 'var(--color-text-primary)', lineHeight: 1.25 }}
          >
            Evidence-based diabetes risk assessment
          </h1>
          <p
            className="max-w-2xl mx-auto mb-2"
            style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-text-secondary)' }}
          >
            Clinician-facing demo workflow: assess risk with an in-browser ML model, track patients,
            and explore clinical insights.
          </p>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-tertiary)' }}>
            For educational and portfolio demonstration only. Not for clinical diagnosis.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link to="/dashboard">
              <Button size="lg">Launch Demo</Button>
            </Link>
            <Link to="/assessment">
              <Button size="lg" variant="outline">Start Assessment</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="clinical-card">
              <feature.icon
                className="h-5 w-5 mb-3"
                style={{ color: 'var(--color-brand-600)' }}
                aria-hidden="true"
              />
              <h2 className="clinical-card-title mb-2">{feature.title}</h2>
              <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer
        className="border-t py-4 text-center"
        style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-body-sm)' }}
      >
        © {new Date().getFullYear()} DiaTrack · Clinical Precision Design
      </footer>
    </div>
  );
};

export default Index;
