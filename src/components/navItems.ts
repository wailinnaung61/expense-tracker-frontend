import {
  Home,
  LayoutDashboard,
  TrendingUp,
  PiggyBank,
  Wallet,
  BarChart3,
  Settings,
  Bell,
  Users,
  Tag,
  LineChart,
  type LucideIcon,
  CreditCard,
} from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  path: string
  icon: LucideIcon
}

// Icon mapping for dynamic menus from API
export const iconMap: Record<string, LucideIcon> = {
  // Dashboard variants
  home: Home,
  dashboard: LayoutDashboard,

  // Expenses / Transactions
  expenses: CreditCard,
  transactions: CreditCard,

  // Budget variants
  budget: TrendingUp,
  budgets: TrendingUp,

  // Savings
  savings: PiggyBank,

  // Accounts / Wallets
  accounts: Wallet,
  wallet: Wallet,

  // Reports / Analytics
  reports: BarChart3,
  analytics: BarChart3,

  // Investments
  investments: LineChart,

  // Categories
  categories: Tag,

  // Notifications
  notifications: Bell,

  // Referrals / Users
  referrals: Users,
  users: Users,

  // Settings
  settings: Settings,
}

// Get icon by menu key, fallback to Home icon
export const getIconByKey = (key: string): LucideIcon => {
  return iconMap[key.toLowerCase()] || Home
}
