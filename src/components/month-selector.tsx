import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export default function MonthSelector({ 
  month, 
  year, 
  onChange 
}: MonthSelectorProps) {
  const [selectedDate, setSelectedDate] = useState(new Date(year, month - 1, 1));

  const handlePreviousMonth = () => {
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    onChange(newMonth, newYear);
    setSelectedDate(new Date(newYear, newMonth - 1, 1));
  };

  const handleNextMonth = () => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    onChange(newMonth, newYear);
    setSelectedDate(new Date(newYear, newMonth - 1, 1));
  };

  const getMonthYearLabel = () => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newMonth = date.getMonth() + 1;
      const newYear = date.getFullYear();
      onChange(newMonth, newYear);
      setSelectedDate(new Date(newYear, newMonth - 1, 1));
    }
  };

  return (
    <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        disabled={year === 2025 && month === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-center text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{getMonthYearLabel()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => handleDateSelect(date)}
            initialFocus
            month={selectedDate}
            fromMonth={new Date(2025, 0)}
            toMonth={new Date(2125, 11)}
            captionLayout="dropdown-buttons"
            fromYear={2025}
            toYear={2125}
            disabled={(date) => {
              // Only allow selection of the first day of each month
              return date.getDate() !== 1;
            }}
          />
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        disabled={year === 2125 && month === 12}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
