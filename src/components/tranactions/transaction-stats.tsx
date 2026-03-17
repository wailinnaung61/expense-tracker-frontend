import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const data = [
  { name: "Food & Dining", value: 350, color: "rgba(34, 197, 94, 0.7)" },
  { name: "Housing", value: 1200, color: "rgba(59, 130, 246, 0.7)" },
  { name: "Transportation", value: 180, color: "rgba(168, 85, 247, 0.7)" },
  { name: "Entertainment", value: 150, color: "rgba(249, 115, 22, 0.7)" },
  { name: "Utilities", value: 120, color: "rgba(234, 179, 8, 0.7)" },
  { name: "Other", value: 200, color: "rgba(156, 163, 175, 0.7)" },
];

const totalExpenses = data.reduce((acc, curr) => acc + curr.value, 0);

export default function TransactionStats() {
  return (
    <Card className="sticky top-12">
      <CardHeader className="pb-3">
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Current month spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-60 flex items-center justify-center">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">${totalExpenses}</div>
            <div className="text-xs text-muted-foreground">Total Expenses</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
              <div className="text-sm font-medium">
                ${entry.value} (
                {Math.round((entry.value / totalExpenses) * 100)}%)
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-sm font-medium">Monthly Comparison</div>
          <div className="flex items-center justify-between text-sm">
            <span>Last Month</span>
            <span className="font-medium">$2,150</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>This Month</span>
            <span className="font-medium">${totalExpenses}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Difference</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              +$50 (2.3%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
