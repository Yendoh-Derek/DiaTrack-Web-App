import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Line,
  ComposedChart,
} from 'recharts';
import { RISK_THRESHOLDS } from '@/constants/riskThresholds';

interface TrendPoint {
  date: string;
  risk: number;
}

interface RiskTrendChartProps {
  data: TrendPoint[];
  height?: number;
}

const RiskTrendChart = ({ data, height = 240 }: RiskTrendChartProps) => {
  const modThreshold = RISK_THRESHOLDS.probability.moderate * 100;
  const highThreshold = RISK_THRESHOLDS.probability.high * 100;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 48, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border-default)" strokeWidth={0.5} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 13, fill: 'var(--color-text-tertiary)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 13, fill: 'var(--color-text-tertiary)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
          }}
          formatter={(value: number) => [`${value}%`, 'Risk Score']}
        />
        <ReferenceLine
          y={modThreshold}
          stroke="var(--color-risk-mod-accent)"
          strokeDasharray="4 4"
          label={{
            value: 'Moderate',
            position: 'right',
            fontSize: 11,
            fill: 'var(--color-text-tertiary)',
          }}
        />
        <ReferenceLine
          y={highThreshold}
          stroke="var(--color-risk-high-accent)"
          strokeDasharray="4 4"
          label={{
            value: 'High',
            position: 'right',
            fontSize: 11,
            fill: 'var(--color-text-tertiary)',
          }}
        />
        <Area
          type="monotone"
          dataKey="risk"
          fill="var(--color-brand-50)"
          stroke="none"
          fillOpacity={0.5}
        />
        <Line
          type="monotone"
          dataKey="risk"
          stroke="var(--color-brand-600)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--color-brand-600)' }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default RiskTrendChart;
