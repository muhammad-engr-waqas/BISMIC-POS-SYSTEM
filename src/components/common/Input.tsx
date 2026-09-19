import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
  helperText?: string;
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  onEndIconClick?: () => void;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  labelClassName = '',
  error,
  helperText,
  startIcon: StartIcon,
  endIcon: EndIcon,
  onEndIconClick,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
            labelClassName || 'text-slate-600'
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {StartIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <StartIcon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full rounded-xl border ${
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-900/10'
          } ${StartIcon ? 'pl-9' : 'pl-3.5'} ${
            EndIcon ? 'pr-9' : 'pr-3.5'
          } py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm ${className}`}
          {...props}
        />
        {EndIcon && (
          <div
            onClick={onEndIconClick}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 ${
              onEndIconClick ? 'cursor-pointer hover:text-slate-600 transition-colors' : 'pointer-events-none'
            }`}
          >
            <EndIcon className="h-4 w-4" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
    </div>
  );
};
