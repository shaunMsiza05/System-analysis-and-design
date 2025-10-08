// Income vs Expenses comparison chart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { format, subMonths, startOfMonth } from 'date-fns';

interface IncomeExpenseChartProps {
  months?: number;
}

export function IncomeExpenseChart({ months = 6 }: IncomeExpenseChartProps) {
  const { getMonthlyAnalytics, settings } = useSupabaseStore();

  // Generate data for the last N months
  const chartData = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = subMonths(startOfMonth(new Date()), i);
    const monthStr = format(month, 'yyyy-MM');
    const analytics = getMonthlyAnalytics(monthStr);
    
    chartData.push({
      month: format(month, 'MMM yyyy'),
      income: analytics.totalIncome,
      expenses: analytics.totalExpenses,
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
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="month" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            formatCurrency(value), 
            name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net Profit'
          ]}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Bar dataKey="income" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
        <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}