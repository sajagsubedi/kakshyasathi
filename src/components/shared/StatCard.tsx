import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  accent?: 'primary' | 'chart-2' | 'chart-3' | 'chart-4' | 'success' | 'warning' | 'destructive';
}

const accentClasses: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  'chart-2': 'bg-chart-2/10 text-chart-2',
  'chart-3': 'bg-chart-3/10 text-chart-3',
  'chart-4': 'bg-chart-4/10 text-chart-4',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  accent = 'primary',
}: StatCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              accentClasses[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <p
            className={cn(
              'mt-3 text-xs font-medium',
              trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
            )}
          >
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
