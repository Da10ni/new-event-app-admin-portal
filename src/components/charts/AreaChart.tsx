import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AreaConfig {
  dataKey: string;
  name: string;
  color: string;
  fillOpacity?: number;
}

interface AreaChartProps {
  data: Record<string, unknown>[];
  areas: AreaConfig[];
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

const AreaChartComponent = ({
  data,
  areas,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  className = '',
}: AreaChartProps) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={`gradient-${area.dataKey}`}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              strokeWidth={2}
              fill={`url(#gradient-${area.dataKey})`}
              fillOpacity={area.fillOpacity ?? 1}
              activeDot={{ r: 5, fill: area.color, strokeWidth: 2, stroke: '#fff' }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChartComponent;
