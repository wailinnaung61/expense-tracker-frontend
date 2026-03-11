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

export default function TotpVerificationPage() {
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
      
      toast.success('Verification successful!')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
          {email && (
            <p className="text-sm text-gray-500 mt-2">
              for {email}
            </p>
          )}
        </div>

        {/* TOTP Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm text-gray-600">
              Verification Code
            </Label>
            <Input
              id="code"
              type="text"
              maxLength={6}
              placeholder="000000"
              className="h-14 text-center text-2xl tracking-widest"
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
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
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
        <div className="mt-8 rounded-lg bg-gray-50 p-4">
          <p className="text-xs text-gray-600">
            <strong>Need help?</strong> Open your authenticator app (e.g., Google Authenticator, 
            Authy) and enter the 6-digit code shown for Expense Tracker.
          </p>
        </div>
      </div>
    </div>
  )
}
