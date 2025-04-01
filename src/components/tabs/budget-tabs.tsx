
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PiggyBank, CreditCard } from "lucide-react";

interface BudgetTabsProps {
  children: {
    incomeTab: React.ReactNode;
    expenseTab: React.ReactNode;
  };
}

export default function BudgetTabs({ children }: BudgetTabsProps) {
  const [activeTab, setActiveTab] = useState("income");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="grid w-full grid-cols-2 p-1 rounded-xl bg-gray-100">
        <TabsTrigger 
          value="income" 
          className={`rounded-lg flex items-center gap-2 ${activeTab === 'income' 
            ? 'bg-white shadow-sm text-green-600' 
            : 'bg-transparent hover:bg-white/50'}`}
        >
          <PiggyBank className="h-4 w-4" />
          <span>Thu nhập</span>
        </TabsTrigger>
        <TabsTrigger 
          value="expense" 
          className={`rounded-lg flex items-center gap-2 ${activeTab === 'expense' 
            ? 'bg-white shadow-sm text-red-600' 
            : 'bg-transparent hover:bg-white/50'}`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Chi tiêu</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="income" className="bg-white rounded-xl mt-2 p-4 shadow-sm border">
        {children.incomeTab}
      </TabsContent>
      <TabsContent value="expense" className="bg-white rounded-xl mt-2 p-4 shadow-sm border">
        {children.expenseTab}
      </TabsContent>
    </Tabs>
  );
}
