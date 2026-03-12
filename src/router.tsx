import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import RootLayout from "./layout/RootLayout"
import AuthLayout from "./layout/AuthLayout"

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage"
import SignUpPage from "@/pages/auth/SignUpPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import TotpVerificationPage from "@/pages/auth/TotpVerificationPage"

// Dashboard Pages
import Home from "@/pages/home"
import Expenses from "@/pages/expenses"
import Budget from "@/pages/budget"
import Savings from "@/pages/savings"
import Accounts from "@/pages/accounts"
import Reports from "@/pages/reports"
import Settings from "@/pages/settings"
import Notifications from "@/pages/notifications"
import Referrals from "@/pages/referrals"
// Protected Route Component
import { ProtectedRoute } from "@/components/ProtectedRoute"
import ConfirmSignUpPage from "./pages/auth/ConfirmSignUpPage"

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/confirm-signup" element={<ConfirmSignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-totp" element={<TotpVerificationPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/referrals" element={<Referrals />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}