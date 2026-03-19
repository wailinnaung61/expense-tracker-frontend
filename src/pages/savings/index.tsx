import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Savings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Savings</h1>
        <p className="text-muted-foreground">Track your savings goals here.</p>
      </div>

      {/* Link to Investments */}
      <Link to="/investment" className="block hover:scale-[1.02] transition-transform max-w-2xl">
        <Card className="border-green-200 dark:border-green-800 bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 cursor-pointer">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Investments</h3>
              <p className="text-sm text-green-700 dark:text-green-300">View your investments in the Investments menu</p>
            </div>
            <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400" />
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
