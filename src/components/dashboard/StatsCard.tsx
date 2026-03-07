import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp 
}: StatsCardProps) {
  return (
    <div className="bg-[#2f2f2f] border border-white/10 rounded-lg p-6 transition-all duration-200 hover:border-white/15">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium lowercase">{title}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-semibold text-white">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${
                trendUp ? 'text-emerald-500' : 'text-red-400'
              }`}>
                {trendUp ? '+' : ''}{trend}
              </span>
            )}
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <Icon className="h-5 w-5 text-white/60" />
        </div>
      </div>
    </div>
  );
}