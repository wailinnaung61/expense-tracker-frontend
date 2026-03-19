import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthLayout() {
  const { isAuthenticated } = useAuth()

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-white">
      <Outlet />
    </div>
  )
}