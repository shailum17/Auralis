import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { ChartContainer, chartColors, type ChartColor } from './Chart';
import { cn } from '@/lib/utils';

interface LineChartProps {
  data: Array<Record<string, any>>;
  lines: Array<{
    dataKey: string;
    name?: string;
    color?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
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
  curved?: boolean;
  filled?: boolean;
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
        <p className="font-medium text-sm mb-2 text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-secondary-300">{entry.name}:</span>
            <span className="font-medium text-white">{entry.value}</span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

const AnimatedLine = ({ ...props }) => {
  return (
    <motion.g
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      <Line {...props} />
    </motion.g>
  );
};

export function LineChart({
  data,
  lines,
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
  curved = true,
  filled = false,
  animated = true,
}: LineChartProps) {
  const colors = chartColors[colorScheme];

  const ChartComponent = filled ? AreaChart : RechartsLineChart;
  const LineComponent = filled ? Area : (animated ? AnimatedLine : Line);

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
          <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={0.5}
              />
            )}
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
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                }}
              />
            )}
            {lines.map((line, index) => (
              <LineComponent
                key={line.dataKey}
                type={curved ? 'monotone' : 'linear'}
                dataKey={line.dataKey}
                name={line.name || line.dataKey}
                stroke={line.color || colors[index % colors.length]}
                strokeWidth={line.strokeWidth || 2}
                strokeDasharray={line.strokeDasharray}
                fill={filled ? line.color || colors[index % colors.length] : undefined}
                fillOpacity={filled ? 0.1 : undefined}
                dot={{
                  fill: line.color || colors[index % colors.length],
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: line.color || colors[index % colors.length],
                  strokeWidth: 2,
                  fill: '#fff',
                }}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}

export type { LineChartProps };