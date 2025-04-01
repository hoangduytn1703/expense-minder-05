
import React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  disabled?: boolean;
}

export default function MonthSelector({ 
  month, 
  year, 
  onChange, 
  disabled = false 
}: MonthSelectorProps) {
  const handlePrevMonth = () => {
    if (disabled) return;
    
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    onChange(newMonth, newYear);
  };
  
  const handleNextMonth = () => {
    if (disabled) return;
    
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    onChange(newMonth, newYear);
  };
  
  return (
    <div className="flex items-center justify-center space-x-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handlePrevMonth}
        disabled={disabled}
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
      <div className="text-xl font-medium">
        Tháng {month} ({year})
      </div>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleNextMonth}
        disabled={disabled}
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}
