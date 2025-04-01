
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
    <div className="flex items-center justify-center space-x-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handlePrevMonth}
        disabled={isLoading || (year === minYear && month === 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-xl font-medium">
        Tháng {month} ({year})
      </div>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleNextMonth}
        disabled={isLoading || (year === maxYear && month === 12)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
