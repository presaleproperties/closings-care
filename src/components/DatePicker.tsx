import * as React from "react";
import { format, parse, setMonth, setYear } from "date-fns";
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
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const currentYear = new Date().getFullYear();
  
  // Generate years from current year - 2 to current year + 10
  const years = React.useMemo(() => {
    const result = [];
    for (let y = currentYear - 2; y <= currentYear + 10; y++) {
      result.push(y);
    }
    return result;
  }, [currentYear]);

  // Convert string date to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    try {
      return parse(value, 'yyyy-MM-dd', new Date());
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

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
    } else {
      onChange(undefined);
    }
    setOpen(false);
  };

  const handleMonthChange = (monthStr: string) => {
    const monthIndex = parseInt(monthStr, 10);
    setDisplayMonth(setMonth(displayMonth, monthIndex));
  };

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    setDisplayMonth(setYear(displayMonth, year));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover" align="start">
        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between gap-2 p-3 pb-0">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDisplayMonth(prev => setMonth(prev, prev.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1">
            <Select
              value={displayMonth.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={displayMonth.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-8 w-[80px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDisplayMonth(prev => setMonth(prev, prev.getMonth() + 1))}
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
          className={cn("p-3 pointer-events-auto")}
          classNames={{
            caption: "hidden", // Hide default caption since we have custom nav
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
