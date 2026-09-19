import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  footer,
  children,
  noPadding = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 ease-out overflow-hidden flex flex-col ${className}`}
      {...props}
    >
      {(title || action || subtitle) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100/80 shrink-0">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && typeof subtitle === 'string' ? (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${noPadding ? '' : 'p-5'}`}>{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100/80 text-xs text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
};
