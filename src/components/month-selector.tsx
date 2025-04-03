
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
  const MIN_YEAR = 2025;
  const MAX_YEAR = 2125;
  
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const years = Array.from(
    { length: MAX_YEAR - MIN_YEAR + 1 },
    (_, index) => MIN_YEAR + index
  );
  
  const handlePrevMonth = () => {
    if (isLoading) return;
    
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    // Ensure we don't go below the minimum year
    if (newYear < MIN_YEAR) {
      newMonth = 1;
      newYear = MIN_YEAR;
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
    if (newYear > MAX_YEAR) {
      newMonth = 12;
      newYear = MAX_YEAR;
      return;
    }
    
    onChange(newMonth, newYear);
  };

  const handleMonthChange = (newMonth: string) => {
    if (isLoading) return;
    onChange(parseInt(newMonth), year);
  };

  const handleYearChange = (newYear: string) => {
    if (isLoading) return;
    onChange(month, parseInt(newYear));
  };
  
  return (
    <div className="flex items-center justify-center space-x-4 bg-white dark:bg-gray-800 rounded-full shadow-md px-5 py-2 w-fit mx-auto">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handlePrevMonth}
        disabled={isLoading || (year === MIN_YEAR && month === 1)}
        className="text-gray-500 hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 min-w-[150px] text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            <Calendar className="h-4 w-4" />
            <span className="text-lg font-medium">
              {monthNames[month-1]} {year}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 w-auto" align="center">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Tháng
                </label>
                <Select value={month.toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">
                  Năm
                </label>
                <Select value={year.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleNextMonth}
        disabled={isLoading || (year === MAX_YEAR && month === 12)}
        className="text-gray-500 hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
