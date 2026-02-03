import * as React from "react";
import { format, parse, setMonth, setYear, isValid } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  value: string | undefined | null;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker({ value, onChange, placeholder = "Pick a date", className, disabled }, ref) {
  const [open, setOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();
  
  // Generate years from current year - 5 to current year + 15 for better long-range planning
  const years = React.useMemo(() => {
    const result = [];
    for (let y = currentYear - 5; y <= currentYear + 15; y++) {
      result.push(y);
    }
    return result;
  }, [currentYear]);

  // Convert string date to Date object with validation
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    try {
      const parsed = parse(value, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [value]);

  // Track the displayed month for navigation
  const [displayMonth, setDisplayMonth] = React.useState<Date>(dateValue || new Date());

  React.useEffect(() => {
    if (dateValue) {
      setDisplayMonth(dateValue);
    }
  }, [dateValue]);

  const handleSelect = React.useCallback((date: Date | undefined) => {
    if (date && isValid(date)) {
      onChange(format(date, 'yyyy-MM-dd'));
    } else {
      onChange(undefined);
    }
    setOpen(false);
  }, [onChange]);

  const handleMonthChange = React.useCallback((monthStr: string) => {
    const monthIndex = parseInt(monthStr, 10);
    setDisplayMonth(prev => setMonth(prev, monthIndex));
  }, []);

  const handleYearChange = React.useCallback((yearStr: string) => {
    const year = parseInt(yearStr, 10);
    setDisplayMonth(prev => setYear(prev, year));
  }, []);

  const navigatePrevMonth = React.useCallback(() => {
    setDisplayMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const navigateNextMonth = React.useCallback(() => {
    setDisplayMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 transition-all",
            !value && "text-muted-foreground",
            "hover:border-accent/50 focus:ring-2 focus:ring-ring focus:ring-offset-1",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {dateValue ? format(dateValue, "PPP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover border border-border shadow-xl" align="start" sideOffset={4}>
        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between gap-2 p-3 pb-0 border-b border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={navigatePrevMonth}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-2">
            <Select
              value={displayMonth.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs border-border bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[280px]">
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={index.toString()} className="text-sm">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={displayMonth.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-8 w-[80px] text-xs border-border bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[280px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-sm">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={navigateNextMonth}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          initialFocus
          className="p-3 pointer-events-auto"
          classNames={{
            caption: "hidden",
            day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            day_today: "bg-muted text-foreground font-semibold",
          }}
        />
      </PopoverContent>
    </Popover>
  );
});
