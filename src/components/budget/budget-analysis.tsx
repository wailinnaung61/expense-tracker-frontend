import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface Category {
  name: string;
  budget: number;
  spent: number;
  projected: number;
  trend: "stable" | "decreasing" | "increasing";
  status: "on-track" | "under-budget" | "warning" | "over-budget";
}

interface AnalysisData {
  totalBudget: number;
  totalSpent: number;
  projectedSpending: number;
  daysLeft: number;
  daysInMonth: number;
  categories: Category[];
}

export function BudgetAnalysis() {
  const analysisData: AnalysisData = {
    totalBudget: 3000,
    totalSpent: 2230,
    projectedSpending: 2850,
    daysLeft: 10,
    daysInMonth: 31,
    categories: [
      {
        name: "Housing",
        budget: 1500,
        spent: 1200,
        projected: 1450,
        trend: "stable",
        status: "on-track",
      },
      {
        name: "Food & Dining",
        budget: 500,
        spent: 350,
        projected: 480,
        trend: "decreasing",
        status: "under-budget",
      },
      {
        name: "Transportation",
        budget: 200,
        spent: 180,
        projected: 220,
        trend: "increasing",
        status: "warning",
      },
      {
        name: "Entertainment",
        budget: 120,
        spent: 150,
        projected: 180,
        trend: "increasing",
        status: "over-budget",
      },
    ],
  };

  const getStatusIcon = (status: Category["status"]) => {
    switch (status) {
      case "on-track":
        return (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "under-budget":
        return (
          <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "warning":
        return (
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        );
      case "over-budget":
        return (
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Category["status"]) => {
    switch (status) {
      case "on-track":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            On Track
          </Badge>
        );
      case "under-budget":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            Under Budget
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
          >
            Warning
          </Badge>
        );
      case "over-budget":
        return <Badge variant="destructive">Over Budget</Badge>;
      default:
        return null;
    }
  };

  const projectedPercentage = Math.round(
    (analysisData.projectedSpending / analysisData.totalBudget) * 100
  );
  const currentPercentage = Math.round(
    (analysisData.totalSpent / analysisData.totalBudget) * 100
  );

  return (
    <Card>
      <CardHeader className="pb-6">
        <CardTitle>Budget Analysis</CardTitle>
        <CardDescription>
          AI-powered insights and projections for your spending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-10">
          {/* Overall Projection */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Month-End Projection</h3>
              <Badge
                variant={
                  projectedPercentage > 100
                    ? "destructive"
                    : projectedPercentage > 90
                    ? "secondary"
                    : "outline"
                }
                className="bg-primary/90"
              >
                {projectedPercentage}% of budget
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Spending</span>
                <span className="font-medium">${analysisData.totalSpent}</span>
              </div>
              <Progress value={currentPercentage} className="h-1.5" />
              <div className="flex justify-between text-sm pt-2">
                <span>Projected Total</span>
                <span
                  className={`font-medium ${
                    projectedPercentage > 100
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                  }`}
                >
                  ${analysisData.projectedSpending}
                </span>
              </div>
              <Progress
                value={projectedPercentage > 100 ? 100 : projectedPercentage}
                className="h-1.5"
                indicatorClassName={
                  projectedPercentage > 100
                    ? "bg-red-600 dark:bg-red-400"
                    : "bg-blue-600 dark:bg-blue-400"
                }
              />
            </div>
            {projectedPercentage > 100 && (
              <div className="mt-3 p-2 rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {`⚠️ You're projected to exceed your budget by $`}
                  {analysisData.projectedSpending - analysisData.totalBudget}
                </p>
              </div>
            )}
          </div>

          {/* Category Analysis */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Category Analysis</h3>
            <div className="grid grid-cols-1 gap-6">
              {analysisData.categories.map((category, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(category.status)}
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    {getStatusBadge(category.status)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ${category.spent}</span>
                      <span>Budget: ${category.budget}</span>
                    </div>
                    <Progress
                      value={Math.min(
                        (category.spent / category.budget) * 100,
                        100
                      )}
                      className="h-1.5"
                      indicatorClassName={
                        category.status === "over-budget"
                          ? "bg-red-600 dark:bg-red-400"
                          : category.status === "warning"
                          ? "bg-amber-600 dark:bg-amber-400"
                          : "bg-green-600 dark:bg-green-400"
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Projected: ${category.projected}</span>
                      <span
                        className={`flex items-center gap-1 ${
                          category.trend === "increasing"
                            ? "text-red-600 dark:text-red-400"
                            : category.trend === "decreasing"
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {category.trend === "increasing" && (
                          <TrendingUp className="h-3 w-3" />
                        )}
                        {category.trend === "decreasing" && (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {category.trend}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              💡 Recommendations
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>
                • Consider reducing entertainment spending by $30 to stay on
                budget
              </li>
              <li>{`• You're doing great with food spending - keep it up!`}</li>
              <li>
                • Transportation costs are trending up - review recent expenses
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
