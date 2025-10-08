// Main dashboard component with KPIs and charts
import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Scissors,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { KPICard } from './KPICard';
import { IncomeExpenseChart } from '@/components/Charts/IncomeExpenseChart';
import { CustomerTrendChart } from '@/components/Charts/CustomerTrendChart';
import { ServiceDistributionChart } from '@/components/Charts/ServiceDistributionChart';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function Dashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { 
    currentMonth, 
    setCurrentMonth, 
    getKPIData, 
    loadData, 
    isLoading,
    settings 
  } = useSupabaseStore();

  const [kpis, setKpis] = useState(getKPIData());

  useEffect(() => {
    const data = getKPIData();
    setKpis(data);
  }, [currentMonth, getKPIData]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(currentMonth + '-01');
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentMonth(format(currentDate, 'yyyy-MM'));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 gradient-primary rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Monthly overview and key metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMonthChange('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="px-4 py-2 bg-card border border-border rounded-lg">
            <span className="font-medium">
              {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMonthChange('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            change={kpi.change}
          />
        ))}
      </div>

      {/* Charts Section */}
      {kpis.find(k => k.title === 'Total Customers')?.value !== '0' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Analytics & Trends</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Income vs Expenses (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart months={6} />
              </CardContent>
            </Card>

            {/* Service Distribution Chart */}
            <Card>  
              <CardHeader>
                <CardTitle className="text-base">Popular Services ({format(new Date(currentMonth + '-01'), 'MMMM yyyy')})</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceDistributionChart />
              </CardContent>
            </Card>
          </div>

          {/* Customer Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer & Profit Trends (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerTrendChart months={6} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {kpis.find(k => k.title === 'Total Customers')?.value === '0' && (
        <div className="kpi-card text-center py-12">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Welcome to Hairfolio!</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start by adding your first transaction to see your business metrics come to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              className="gradient-primary text-primary-foreground"
              onClick={() => onNavigate?.('transactions')}
            >
              Add First Transaction
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
      />
    </svg>
  );
}