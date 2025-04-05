
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  isLoading?: boolean;
}

export default function MonthSelector({ 
  month, 
  year, 
  onChange, 
  isLoading = false 
}: MonthSelectorProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const minYear = 2025;
  const maxYear = 2125;
  
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  
  const handlePrevMonth = () => {
    if (isLoading) return;
    
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    // Ensure we don't go below the minimum year
    if (newYear < minYear) {
      newMonth = 1;
      newYear = minYear;
      return;
    }
    
    onChange(newMonth, newYear);
  };
  
  const handleNextMonth = () => {
    if (isLoading) return;
    
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    // Ensure we don't exceed the maximum year
    if (newYear > maxYear) {
      newMonth = 12;
      newYear = maxYear;
      return;
    }
    
    onChange(newMonth, newYear);
  };

  const handleMonthYearSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    const newMonth = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed
    const newYear = selectedDate.getFullYear();
    
    // Validate against min/max bounds
    if (newYear < minYear || newYear > maxYear) return;
    
    onChange(newMonth, newYear);
    setIsDrawerOpen(false);
  };
  
  // Generate a date for the current month/year for the calendar component
  const currentDateForCalendar = new Date(year, month - 1, 1);

  // Set the minimum and maximum selectable dates
  const minDate = new Date(minYear, 0, 1);  // January 1, 2025
  const maxDate = new Date(maxYear, 11, 31); // December 31, 2125
  
  return (
    <div className="flex items-center justify-center space-x-4 bg-white rounded-full shadow-md px-5 py-2 w-fit mx-auto">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handlePrevMonth}
        disabled={isLoading || (year === minYear && month === 1)}
        className="text-gray-500 hover:text-black hover:bg-gray-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="ghost"
            className="text-xl font-medium min-w-[150px] text-center hover:bg-gray-100 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <span>{monthNames[month-1]} {year}</span>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-4">
            <h3 className="text-lg font-medium text-center mb-4">Chọn tháng và năm</h3>
            <Calendar
              mode="month"
              selected={currentDateForCalendar}
              onSelect={handleMonthYearSelect}
              fromDate={minDate}
              toDate={maxDate}
              disabled={isLoading}
              initialFocus
            />
          </div>
        </DrawerContent>
      </Drawer>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleNextMonth}
        disabled={isLoading || (year === maxYear && month === 12)}
        className="text-gray-500 hover:text-black hover:bg-gray-100"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
