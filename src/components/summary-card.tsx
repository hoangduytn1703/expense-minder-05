
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  variant?: "default" | "income" | "expense" | "remaining";
}

export default function SummaryCard({
  title,
  amount,
  variant = "default",
}: SummaryCardProps) {
  // Define styles based on variant
  const getStyles = () => {
    switch (variant) {
      case "income":
        return {
          bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-300 dark:from-yellow-800 dark:to-yellow-700",
          textColor: "text-yellow-900 dark:text-yellow-100",
          icon: <ArrowUpCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-300" />
        };
      case "expense":
        return {
          bgColor: "bg-gradient-to-r from-rose-400 to-red-300 dark:from-rose-800 dark:to-red-700",
          textColor: "text-red-900 dark:text-red-100",
          icon: <ArrowDownCircle className="h-8 w-8 text-red-600 dark:text-red-300" />
        };
      case "remaining":
        return {
          bgColor: "bg-gradient-to-r from-green-400 to-emerald-300 dark:from-green-800 dark:to-emerald-700",
          textColor: "text-emerald-900 dark:text-emerald-100",
          icon: <Wallet className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
        };
      default:
        return {
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-900 dark:text-gray-100",
          icon: null
        };
    }
  };
  
  const { bgColor, textColor, icon } = getStyles();
  
  return (
    <Card className={`${bgColor} border-none shadow-lg rounded-xl overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-lg font-medium ${textColor}`}>{title}</h3>
          {icon}
        </div>
        <p className={`text-2xl font-bold ${textColor}`}>
          {formatCurrency(amount)} đ
        </p>
      </CardContent>
    </Card>
  );
}
