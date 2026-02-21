import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
  stackId?: string;
}

interface BarChartProps {
  data: Record<string, unknown>[];
  bars: BarConfig[];
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-dropdown border border-neutral-100 px-4 py-3">
      <p className="text-xs font-medium text-neutral-600 mb-2">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-neutral-400">{entry.name}:</span>
          <span className="font-semibold text-neutral-600">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const BarChartComponent = ({
  data,
  bars,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  className = '',
}: BarChartProps) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" vertical={false} />
          )}
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#717171' }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#717171' }}
            dx={-8}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            />
          )}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={stacked ? bar.stackId || 'stack' : undefined}
              radius={stacked ? undefined : [4, 4, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
