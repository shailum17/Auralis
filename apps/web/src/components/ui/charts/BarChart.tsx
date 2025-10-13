import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { ChartContainer, chartColors, type ChartColor } from './Chart';

interface BarChartProps {
  data: Array<Record<string, any>>;
  bars: Array<{
    dataKey: string;
    name?: string;
    color?: string;
    radius?: number;
  }>;
  xAxisKey: string;
  title?: string;
  description?: string;
  className?: string;
  height?: number;
  loading?: boolean;
  error?: string;
  colorScheme?: ChartColor;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
  animated?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        className="bg-secondary-900/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg border border-secondary-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-secondary-300">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

const AnimatedBar = ({ ...props }) => {
  return (
    <motion.g
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ transformOrigin: 'bottom' }}
    >
      <Bar {...props} />
    </motion.g>
  );
};

export function BarChart({
  data,
  bars,
  xAxisKey,
  title,
  description,
  className,
  height = 300,
  loading = false,
  error,
  colorScheme = 'primary',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  horizontal = false,
  stacked = false,
  animated = true,
}: BarChartProps) {
  const colors = chartColors[colorScheme];

  const BarComponent = animated ? AnimatedBar : Bar;

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      className={className}
    >
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            layout={horizontal ? 'horizontal' : 'vertical'}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={0.5}
                horizontal={!horizontal}
                vertical={horizontal}
              />
            )}
            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  type="category"
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
              </>
            )}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                }}
              />
            )}
            {bars.map((bar, index) => (
              <BarComponent
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name || bar.dataKey}
                fill={bar.color || colors[index % colors.length]}
                radius={bar.radius || [4, 4, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
              >
                {/* Add gradient effect for single color bars */}
                {!stacked && (
                  <defs>
                    <linearGradient
                      id={`gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={bar.color || colors[index % colors.length]}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={bar.color || colors[index % colors.length]}
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                )}
              </BarComponent>
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export type { BarChartProps };