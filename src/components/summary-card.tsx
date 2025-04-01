
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

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
  // Xác định màu sắc dựa vào variant
  const getBgColor = () => {
    switch (variant) {
      case "income":
        return "bg-yellow-300";
      case "expense":
        return "bg-red-400 text-white";
      case "remaining":
        return "bg-green-400";
      default:
        return "bg-gray-100";
    }
  };
  
  return (
    <Card className={`${getBgColor()} border-none shadow-sm`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {formatCurrency(amount)} đ
        </p>
      </CardContent>
    </Card>
  );
}
