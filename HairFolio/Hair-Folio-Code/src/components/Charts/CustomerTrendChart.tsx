// Customer count and profit trend line chart
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { format, subMonths, startOfMonth } from 'date-fns';

interface CustomerTrendChartProps {
  months?: number;
}

export function CustomerTrendChart({ months = 6 }: CustomerTrendChartProps) {
  const { getMonthlyAnalytics, settings } = useSupabaseStore();

  // Generate data for the last N months
  const chartData = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = subMonths(startOfMonth(new Date()), i);
    const monthStr = format(month, 'yyyy-MM');
    const analytics = getMonthlyAnalytics(monthStr);
    
    chartData.push({
      month: format(month, 'MMM yyyy'),
      customers: analytics.totalCustomers,
      profit: analytics.netProfit,
    });
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="month" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          yAxisId="customers"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          yAxisId="profit"
          orientation="right"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            name === 'customers' ? `${value} customers` : formatCurrency(value), 
            name === 'customers' ? 'Customers' : 'Net Profit'
          ]}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Line 
          yAxisId="customers"
          type="monotone" 
          dataKey="customers" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
        />
        <Line 
          yAxisId="profit"
          type="monotone" 
          dataKey="profit" 
          stroke="hsl(var(--accent))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}