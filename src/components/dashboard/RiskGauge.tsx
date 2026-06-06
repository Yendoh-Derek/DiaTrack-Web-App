import { getRiskLevelFromProbability } from "@/constants/riskThresholds";
import RiskBadge from "@/components/risk/RiskBadge.tsx";

interface RiskGaugeProps {
  score: number;
  size?: number;
}

const RiskGauge = ({ score, size = 200 }: RiskGaugeProps) => {
  const pct = Math.round(score * 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const level = getRiskLevelFromProbability(score);
  const tier = getRiskTierFromProbability(score);
  const colorClass =
    tier === "low"
      ? "circle-low"
      : tier === "mod"
        ? "circle-mod"
        : tier === "high"
          ? "circle-high"
          : "circle-crit";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`Risk score ${pct} percent, ${level} risk`}
        >
          <circle
            className="circle-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          <circle
            className={`circle ${colorClass}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="tabular-nums font-bold"
            style={{
              fontSize: "var(--text-data-xl)",
              color: "var(--color-text-primary)",
            }}
          >
            {pct}
          </span>
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            Risk Score
          </span>
        </div>
      </div>
      <RiskBadge level={level} className="mt-2" />
    </div>
  );
};

export default RiskGauge;
