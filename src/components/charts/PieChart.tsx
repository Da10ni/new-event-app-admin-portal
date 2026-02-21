import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieDataItem[];
  height?: number;
  showLegend?: boolean;
  centerText?: string;
  centerSubtext?: string;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: PieDataItem }>;
}) => {
  if (!active || !payload || !payload[0]) return null;
  const data = payload[0];
  return (
    <div className="bg-white rounded-lg shadow-dropdown border border-neutral-100 px-4 py-3">
      <div className="flex items-center gap-2 text-xs">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: data.payload.color }}
        />
        <span className="text-neutral-400">{data.name}:</span>
        <span className="font-semibold text-neutral-600">
          {data.value.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PieChartComponent = ({
  data,
  height = 300,
  showLegend = true,
  centerText,
  centerSubtext,
  innerRadius = 60,
  outerRadius = 100,
  className = '',
}: PieChartProps) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
            strokeWidth={2}
            stroke="#fff"
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value: string) => (
                <span className="text-neutral-500">{value}</span>
              )}
            />
          )}
          {/* Center text */}
          {centerText && (
            <>
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-lg font-bold fill-neutral-600"
              >
                {centerText}
              </text>
              {centerSubtext && (
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs fill-neutral-400"
                >
                  {centerSubtext}
                </text>
              )}
            </>
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
