
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const minYear = 2025;
  const maxYear = 2028;
  
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
      <div className="text-xl font-medium min-w-[150px] text-center">
        {monthNames[month-1]} {year}
      </div>
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
