import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import spinnerGif from '@/assets/Spinner.gif'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <img src={spinnerGif} alt="Loading..." className="w-20 h-20" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}