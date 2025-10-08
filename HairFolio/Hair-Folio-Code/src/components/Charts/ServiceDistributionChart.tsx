// Service distribution pie chart
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
  'hsl(var(--muted))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0'
];

export function ServiceDistributionChart() {
  const { getMonthlyAnalytics, currentMonth } = useSupabaseStore();
  const analytics = getMonthlyAnalytics(currentMonth);

  // Calculate service distribution
  const serviceCount = analytics.transactions.reduce((acc, transaction) => {
    acc[transaction.style] = (acc[transaction.style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(serviceCount)
    .map(([service, count]) => ({
      name: service,
      value: count,
      percentage: ((count / analytics.totalCustomers) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Show top 8 services

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-2" />
          <p className="text-sm">No services data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string, props: any) => [
            `${value} (${props.payload.percentage}%)`,
            'Count'
          ]}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '20px',
            fontSize: '12px',
            color: 'hsl(var(--foreground))'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}