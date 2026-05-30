import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getRiskLevelFromProbability } from '@/constants/riskThresholds';

interface DistributionItem {
  tier: string;
  count: number;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
}

interface RiskDistributionChartProps {
  probabilities: number[];
}

const TIER_COLORS: Record<string, string> = {
  Low: 'var(--color-risk-low-accent)',
  Moderate: 'var(--color-risk-mod-accent)',
  High: 'var(--color-risk-high-accent)',
  Critical: 'var(--color-risk-crit-accent)',
};

function buildDistribution(probabilities: number[]): DistributionItem[] {
  const counts = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
  for (const p of probabilities) {
    counts[getRiskLevelFromProbability(p)]++;
  }
  return (['Low', 'Moderate', 'High', 'Critical'] as const).map((level) => ({
    tier: level,
    count: counts[level],
    level,
  }));
}

const RiskDistributionChart = ({ probabilities }: RiskDistributionChartProps) => {
  const data = buildDistribution(probabilities);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border-default)" strokeWidth={0.5} vertical={false} />
        <XAxis
          dataKey="tier"
          tick={{ fontSize: 13, fill: 'var(--color-text-secondary)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 13, fill: 'var(--color-text-tertiary)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          label={{
            value: 'Patients',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fill: 'var(--color-text-tertiary)' },
          }}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
          }}
          formatter={(value: number) => [value, 'Patients']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.tier} fill={TIER_COLORS[entry.level]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RiskDistributionChart;
