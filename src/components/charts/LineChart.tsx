import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
  dashed?: boolean;
}

interface LineChartProps {
  data: Record<string, unknown>[];
  lines: LineConfig[];
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
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

const LineChartComponent = ({
  data,
  lines,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  className = '',
}: LineChartProps) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.dashed ? '5 5' : undefined}
              dot={{ r: 3, fill: line.color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: line.color, strokeWidth: 2, stroke: '#fff' }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
