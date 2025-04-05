
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { summaryAPI } from "@/lib/api";

// Define the context shape
interface AssetsContextType {
  totalAssets: number;
  totalDebt: number;
  percentageSpent: number;
  refreshTotalAssets: () => Promise<void>;
}

// Create the context with default values
const AssetsContext = createContext<AssetsContextType>({
  totalAssets: 0,
  totalDebt: 0,
  percentageSpent: 0,
  refreshTotalAssets: async () => {},
});

// Custom hook to use the assets context
export const useAssets = () => useContext(AssetsContext);

interface AssetsProviderProps {
  children: ReactNode;
}

export const AssetsProvider: React.FC<AssetsProviderProps> = ({ children }) => {
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [percentageSpent, setPercentageSpent] = useState(0);

  // Function to fetch total assets data
  const refreshTotalAssets = async () => {
    try {
      const response = await summaryAPI.getTotalAssets();
      setTotalAssets(response.totalAssets);
      setTotalDebt(response.totalDebt || 0);
      
      // Calculate percentage spent
      const percentSpent = response.totalAllTimeExpense 
        ? Math.round((response.totalAllTimeExpense / response.totalAllTimeIncome) * 100)
        : 0;
      setPercentageSpent(percentSpent);
    } catch (error) {
      console.error("Error fetching total assets:", error);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    refreshTotalAssets();
    
    // Set up interval to refresh data every 60 seconds
    const intervalId = setInterval(refreshTotalAssets, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AssetsContext.Provider value={{ totalAssets, totalDebt, percentageSpent, refreshTotalAssets }}>
      {children}
    </AssetsContext.Provider>
  );
};
