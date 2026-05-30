import type { RiskLevel } from "@/types/prediction";
import {
  getRiskTier,
  getRiskTierLabel,
  MODEL_VERSION,
} from "@/constants/riskThresholds";
import { cn } from "@/lib/utils";

interface RiskHeroProps {
  probability: number;
  level: RiskLevel;
  updatedAt?: string;
  modelVersion?: string;
  className?: string;
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return "Just now";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

const RiskHero = ({
  probability,
  level,
  updatedAt,
  modelVersion = MODEL_VERSION,
  className,
}: RiskHeroProps) => {
  const tier = getRiskTier(level);
  const pct = Math.round(probability * 100);

  return (
    <div className={cn(`risk-hero risk-hero--${tier}`, className)} role="status">
      <span className="risk-hero__label">Diabetes Risk Score</span>
      <span className="risk-hero__value tabular-nums">
        {pct}
        <sup style={{ fontSize: "0.4em", verticalAlign: "super" }}>%</sup>
      </span>
      <span className="risk-hero__tier">{getRiskTierLabel(level)}</span>
      <span className="risk-hero__caption">
        Updated {formatRelativeTime(updatedAt)} · Model v{modelVersion}
      </span>
    </div>
  );
};

export default RiskHero;
