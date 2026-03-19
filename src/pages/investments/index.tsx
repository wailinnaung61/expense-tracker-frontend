import { Card, CardContent } from "@/components/ui/card"
import { PiggyBank, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Investments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Investments</h1>
        <p className="text-muted-foreground">View your investments here.</p>
      </div>

      {/* Link to Savings */}
      <Link to="/saving" className="block hover:scale-[1.02] transition-transform max-w-2xl">
        <Card className="border-blue-200 dark:border-blue-800 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 cursor-pointer">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Savings</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Track your savings goals in the Savings menu</p>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
