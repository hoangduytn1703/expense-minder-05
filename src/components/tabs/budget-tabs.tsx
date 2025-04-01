
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="income" className="bg-yellow-50">Thu nhập</TabsTrigger>
        <TabsTrigger value="expense" className="bg-red-50">Chi tiêu</TabsTrigger>
      </TabsList>
      <TabsContent value="income">{children.incomeTab}</TabsContent>
      <TabsContent value="expense">{children.expenseTab}</TabsContent>
    </Tabs>
  );
}
