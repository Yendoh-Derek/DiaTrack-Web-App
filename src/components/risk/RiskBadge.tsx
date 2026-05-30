import type { RiskLevel } from "@/types/prediction";
import { getRiskTier, getRiskTierIcon, getRiskTierLabel } from "@/constants/riskThresholds";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const RiskBadge = ({ level, className }: RiskBadgeProps) => {
  const tier = getRiskTier(level);
  const icon = getRiskTierIcon(tier);
  const label = getRiskTierLabel(level);

  return (
    <span
      className={cn(`risk-badge risk-badge--${tier}`, className)}
      aria-label={`Risk level: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
};

export default RiskBadge;
