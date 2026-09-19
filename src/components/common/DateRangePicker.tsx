import React from 'react';
import { DateFilterType } from '../../utils/calculations';
import { Calendar } from 'lucide-react';

export interface DateRangePickerProps {
  selectedFilter?: DateFilterType;
  filter?: DateFilterType;
  onFilterChange?: (filter: DateFilterType) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (start: string) => void;
  onEndDateChange?: (end: string) => void;
  onCustomDateChange?: (start: string, end: string) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedFilter,
  filter,
  onFilterChange,
  startDate = '',
  endDate = '',
  onStartDateChange,
  onEndDateChange,
  onCustomDateChange,
  className = '',
}) => {
  const currentFilter = selectedFilter || filter || 'this_month';

  const filterOptions: { label: string; value: DateFilterType }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'All Time', value: 'all' },
    { label: 'Custom', value: 'custom' },
  ];

  const handleStartChange = (val: string) => {
    if (onStartDateChange) onStartDateChange(val);
    if (onCustomDateChange) onCustomDateChange(val, endDate);
  };

  const handleEndChange = (val: string) => {
    if (onEndDateChange) onEndDateChange(val);
    if (onCustomDateChange) onCustomDateChange(startDate, val);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {onFilterChange && (
        <div className="inline-flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {filterOptions.map((opt) => {
            const isActive = currentFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange(opt.value)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {(currentFilter === 'custom' || !onFilterChange) && (
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartChange(e.target.value)}
            className="text-xs border-none p-0 text-slate-700 focus:outline-none cursor-pointer"
          />
          <span className="text-xs text-slate-300">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleEndChange(e.target.value)}
            className="text-xs border-none p-0 text-slate-700 focus:outline-none cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
