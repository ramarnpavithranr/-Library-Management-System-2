import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'burgundy'
  | 'neutral'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'info':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'burgundy':
        return 'bg-burgundy-50 text-burgundy-900 border-burgundy-200';
      case 'outline':
        return 'bg-transparent text-charcoal-700 border-charcoal-300';
      case 'neutral':
      default:
        return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'danger':
        return 'bg-rose-500';
      case 'info':
        return 'bg-sky-500';
      case 'burgundy':
        return 'bg-burgundy-600';
      default:
        return 'bg-charcoal-500';
    }
  };

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeStyles} ${getVariantStyles()} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />}
      {children}
    </span>
  );
};

