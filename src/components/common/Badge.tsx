import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
  }[size];

  const variantClasses = {
    default: 'bg-slate-50 text-slate-600 border border-slate-200/60',
    success: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/60',
    warning: 'bg-amber-50/80 text-amber-700 border border-amber-200/60',
    danger: 'bg-red-50/80 text-red-700 border border-red-200/60',
    info: 'bg-sky-50/80 text-sky-700 border border-sky-200/60',
    purple: 'bg-purple-50/80 text-purple-700 border border-purple-200/60',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full capitalize whitespace-nowrap select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};
