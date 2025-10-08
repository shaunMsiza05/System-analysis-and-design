// KPI Card component for dashboard metrics
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    type: 'positive' | 'negative' | 'neutral';
    label: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'gold' | 'success';
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = 'default',
  className 
}: KPICardProps) {
  const getGrowthIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return TrendingUp;
      case 'negative':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const GrowthIcon = change ? getGrowthIcon(change.type) : null;

  return (
    <div
      className={cn(
        'kpi-card',
        variant === 'gold' && 'gold',
        variant === 'success' && 'success',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-90">
            {title}
          </p>
          <p className="text-2xl font-bold">
            {value}
          </p>
        </div>
        
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            variant === 'gold' && 'bg-gold-foreground/10',
            variant === 'success' && 'bg-success-foreground/10',
            variant === 'default' && 'bg-primary/10'
          )}>
            <Icon className={cn(
              'w-5 h-5',
              variant === 'gold' && 'text-gold-foreground',
              variant === 'success' && 'text-success-foreground',
              variant === 'default' && 'text-primary'
            )} />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-2">
          <div className={cn(
            'growth-chip',
            change.type
          )}>
            {GrowthIcon && <GrowthIcon className="w-3 h-3" />}
            <span>
              {change.value > 0 ? '+' : ''}{change.value.toFixed(1)}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {change.label}
          </span>
        </div>
      )}
    </div>
  );
}