import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { totpSchema, type TotpFormData } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield } from 'lucide-react'
import spinnerGif from '@/assets/Spinner.gif'
import { useAuth } from '@/contexts/AuthContext'

export default function TotpVerificationPage() {
  const { fetchUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get session from navigation state
  const session = location.state?.session
  const email = location.state?.email

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TotpFormData>({
    resolver: zodResolver(totpSchema),
  })

  // Redirect if no session
  if (!session) {
    navigate('/login', { replace: true })
    return null
  }

  const onSubmit = async (data: TotpFormData) => {
    try {
      await authService.verifyTotp({
        code: data.code,
        session,
      })
      
      // Fetch user data after successful MFA verification
      await fetchUser()
      
      toast.success('Verification successful!')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed')
    }
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <div className="w-full max-w-100 mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-7 border border-white/30">
          
          {/* Icon */}
          <div className="flex justify-center mb-1">
            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-linear-to-br from-blue-300 to-indigo-400 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-center text-sm text-gray-600 mb-1">
            Enter the 6-digit code from your authenticator app
          </p>
          {email && (
            <p className="text-center text-xs text-gray-500 mb-7">
              for {email}
            </p>
          )}
          {!email && <div className="mb-7"></div>}

          {/* TOTP Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                maxLength={6}
                placeholder="000000"
                className="h-10 text-center text-xl tracking-widest rounded-2xl"
                {...register('code')}
                autoComplete="off"
                autoFocus
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-9 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition-all rounded-2xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <img src={spinnerGif} alt="Loading..." className="w-4 h-4" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to login
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Need help?</strong> Open your authenticator app (e.g., Google Authenticator, 
              Authy) and enter the 6-digit code shown for Expense Tracker.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
