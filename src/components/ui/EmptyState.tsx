import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  illustration?: ReactNode;
}

const DefaultIllustration = () => (
  <svg
    width="80"
    height="64"
    viewBox="0 0 80 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="mx-auto mb-4"
  >
    <line x1="8" y1="56" x2="72" y2="56" stroke="var(--color-border-default)" strokeWidth="1" />
    <line x1="8" y1="56" x2="8" y2="8" stroke="var(--color-border-default)" strokeWidth="1" />
    <rect x="20" y="32" width="10" height="24" rx="2" fill="var(--color-bg-subtle)" stroke="var(--color-border-default)" />
    <rect x="36" y="24" width="10" height="32" rx="2" fill="var(--color-bg-subtle)" stroke="var(--color-border-default)" />
    <rect x="52" y="40" width="10" height="16" rx="2" fill="var(--color-bg-subtle)" stroke="var(--color-border-default)" />
  </svg>
);

const EmptyState = ({ title, description, action, illustration }: EmptyStateProps) => (
  <div className="clinical-card text-center py-10 px-6">
    {illustration ?? <DefaultIllustration />}
    <h3
      className="font-semibold mb-2"
      style={{ fontSize: "var(--text-heading-md)", color: "var(--color-text-primary)" }}
    >
      {title}
    </h3>
    <p
      className="mb-6 max-w-sm mx-auto"
      style={{ fontSize: "var(--text-body-md)", color: "var(--color-text-secondary)" }}
    >
      {description}
    </p>
    {action && (
      <Button onClick={action.onClick}>{action.label}</Button>
    )}
  </div>
);

export default EmptyState;
