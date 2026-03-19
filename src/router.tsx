import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Index from "./components/layout/Index"
import AuthLayout from "./components/layout/AuthLayout"

// Public Pages
import LandingPage from "@/pages/LandingPage"

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage"
import SignUpPage from "@/pages/auth/SignUpPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import TotpVerificationPage from "@/pages/auth/TotpVerificationPage"
import DisableMfaPage from "@/pages/auth/DisableMfaPage"
import ConfirmSignUpPage from "./pages/auth/ConfirmSignUpPage"

// Dashboard Pages
import Home from "@/pages/home"
import Tranactions from "@/pages/tranactions"
import Budget from "@/pages/budget"
import Savings from "@/pages/savings"
import Accounts from "@/pages/accounts"
import Reports from "@/pages/reports"
import Settings from "@/pages/settings"
import Investments from "@/pages/investments"
import Categories from "@/pages/categories"

// Route Components
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { PublicRoute } from "@/components/PublicRoute"

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/confirm-signup" element={<ConfirmSignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-totp" element={<TotpVerificationPage />} />
          <Route path="/disable-mfa" element={<DisableMfaPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Index />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/expenseCategory" element={<Categories />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/tranaction" element={<Tranactions />} />
            <Route path="/saving" element={<Savings />} />
            <Route path="/investment" element={<Investments />} />
            <Route path="/report" element={<Reports />} />
            <Route path="/user" element={<Accounts />} />
            <Route path="/setting" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}