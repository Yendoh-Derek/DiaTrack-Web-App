import type { FeatureContribution } from '@/types/prediction';

interface ModelInterpretabilityProps {
  contributions: FeatureContribution[];
  maxFeatures?: number;
}

const ModelInterpretability = ({ contributions, maxFeatures = 10 }: ModelInterpretabilityProps) => {
  const sorted = [...contributions]
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, maxFeatures);

  const maxAbs = Math.max(...sorted.map((f) => Math.abs(f.contribution)), 0.001);

  return (
    <div className="w-full space-y-3">
      <p
        className="font-semibold mb-3"
        style={{ fontSize: "var(--text-heading-sm)", color: "var(--color-text-primary)" }}
      >
        Feature Importance (SHAP Values)
      </p>
      {sorted.length === 0 ? (
        <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-tertiary)" }}>
          No feature contributions available.
        </p>
      ) : (
        sorted.map((feature, index) => {
          const increasing = feature.contribution > 0;
          const nearZero = Math.abs(feature.contribution) < 0.01;
          const barWidth = (Math.abs(feature.contribution) / maxAbs) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center gap-2">
                <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-primary)" }}>
                  {feature.name}
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-mono)",
                    color: nearZero
                      ? "var(--color-text-tertiary)"
                      : increasing
                        ? "var(--color-risk-high-text)"
                        : "var(--color-risk-low-text)",
                  }}
                >
                  {feature.contribution >= 0 ? "+" : ""}
                  {feature.contribution.toFixed(2)}
                </span>
              </div>
              <div
                className="h-2 w-full rounded-sm overflow-hidden"
                style={{
                  background: nearZero ? "var(--color-bg-subtle)" : "transparent",
                  border: nearZero ? "1px solid var(--color-border-default)" : "none",
                }}
              >
                {!nearZero && (
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${barWidth}%`,
                      background: increasing
                        ? "var(--color-risk-high-accent)"
                        : "var(--color-risk-low-accent)",
                    }}
                  />
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ModelInterpretability;
