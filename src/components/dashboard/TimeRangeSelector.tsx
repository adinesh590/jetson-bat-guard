import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | 'custom';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  customDateRange?: DateRange;
  onCustomDateChange: (dateRange: DateRange | undefined) => void;
}

export const TimeRangeSelector = ({ 
  selectedRange, 
  onRangeChange,
  customDateRange,
  onCustomDateChange
}: TimeRangeSelectorProps) => {
  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last Week' },
    { value: '30d', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">Time Range:</span>
      
      <div className="flex flex-wrap gap-2">
        {timeRanges.map((range) => (
          range.value !== 'custom' ? (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => onRangeChange(range.value)}
            >
              {range.label}
            </Button>
          ) : (
            <Popover key={range.value}>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedRange === 'custom' ? "default" : "outline"}
                  size="sm"
                  className={cn("justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange?.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "MMM dd")} -{" "}
                        {format(customDateRange.to, "MMM dd")}
                      </>
                    ) : (
                      format(customDateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Custom Range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange?.from}
                  selected={customDateRange}
                  onSelect={(range) => {
                    onCustomDateChange(range);
                    if (range?.from) {
                      onRangeChange('custom');
                    }
                  }}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          )
        ))}
      </div>
    </div>
  );
};