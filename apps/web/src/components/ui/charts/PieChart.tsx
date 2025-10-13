import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { ChartContainer, chartColors, type ChartColor } from './Chart';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  description?: string;
  className?: string;
  height?: number;
  loading?: boolean;
  error?: string;
  colorScheme?: ChartColor;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  animated?: boolean;
  donut?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <motion.div
        className="bg-secondary-900/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg border border-secondary-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.color || data.color }}
          />
          <span className="text-secondary-300">{data.name}:</span>
          <span className="font-medium">{data.value}</span>
        </div>
      </motion.div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="500"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AnimatedPie = ({ ...props }) => {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Pie {...props} />
    </motion.g>
  );
};

export function PieChart({
  data,
  title,
  description,
  className,
  height = 300,
  loading = false,
  error,
  colorScheme = 'gradient',
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  innerRadius = 0,
  outerRadius,
  animated = true,
  donut = false,
}: PieChartProps) {
  const colors = chartColors[colorScheme];
  const calculatedInnerRadius = donut ? (outerRadius || 80) * 0.6 : innerRadius;
  const calculatedOuterRadius = outerRadius || 80;

  const PieComponent = animated ? AnimatedPie : Pie;

  // Calculate total for center label in donut chart
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      className={className}
    >
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <PieComponent
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? CustomLabel : false}
              outerRadius={calculatedOuterRadius}
              innerRadius={calculatedInnerRadius}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                />
              ))}
            </PieComponent>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                }}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>

        {/* Center label for donut chart */}
        {donut && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-900">{total}</div>
              <div className="text-sm text-secondary-600">Total</div>
            </div>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}

export type { PieChartProps };