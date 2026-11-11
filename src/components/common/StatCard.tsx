import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'burgundy' | 'cream' | 'white' | 'accent';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'white',
  trend,
  onClick,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'burgundy':
        return 'bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-burgundy-950 text-white shadow-burgundy-glow border border-burgundy-700/60';
      case 'cream':
        return 'bg-gradient-to-br from-[#FFF9F6] to-[#FBF1EC] text-charcoal-900 border border-burgundy-100/80 shadow-soft';
      case 'accent':
        return 'bg-gradient-to-br from-rose-50 to-burgundy-50 text-burgundy-950 border border-rose-200/60 shadow-soft';
      case 'white':
      default:
        return 'bg-white text-charcoal-900 border border-burgundy-100/50 shadow-soft hover:shadow-soft-lg';
    }
  };

  const isBurgundy = variant === 'burgundy';

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-3xl transition-all duration-200 flex flex-col justify-between overflow-hidden ${getVariantStyles()} ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      } ${className}`}
    >
      {/* Top row: Icon and title */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                isBurgundy
                  ? 'bg-white/15 text-rose-200 border border-white/20'
                  : 'bg-burgundy-50 text-burgundy-800 border border-burgundy-100'
              }`}
            >
              <Icon size={18} />
            </div>
          )}
          <span
            className={`text-xs font-semibold tracking-wide uppercase ${
              isBurgundy ? 'text-burgundy-200' : 'text-charcoal-500'
            }`}
          >
            {title}
          </span>
        </div>

        {trend && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? isBurgundy
                  ? 'bg-emerald-400/20 text-emerald-300'
                  : 'bg-emerald-50 text-emerald-700'
                : isBurgundy
                ? 'bg-rose-400/20 text-rose-300'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {/* Main Stat Value */}
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isBurgundy ? 'text-white' : 'text-charcoal-900'}`}>
          {value}
        </span>
        {subtitle && (
          <span className={`text-xs font-medium ${isBurgundy ? 'text-burgundy-200' : 'text-charcoal-400'}`}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Decorative gradient orb for burgundy card (matching Proton Vault reference!) */}
      {isBurgundy && (
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
      )}
    </div>
  );
};

