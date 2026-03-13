import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { confirmSignUpSchema, type ConfirmSignUpFormData } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import spinnerGif from '@/assets/Spinner.gif'

export default function ConfirmSignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isResending, setIsResending] = useState(false)
  
  // Get username from navigation state
  const username = location.state?.username

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmSignUpFormData>({
    resolver: zodResolver(confirmSignUpSchema),
  })

  // Redirect if no username
  if (!username) {
    navigate('/signup', { replace: true })
    return null
  }

  const onSubmit = async (data: ConfirmSignUpFormData) => {
    try {
      const response = await authService.confirm(username, data.code)
      toast.success(response.message || 'Email confirmed successfully!')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Confirmation failed')
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    try {
      const response = await authService.resendConfirmation(username)
      toast.success(response.message || 'Confirmation code resent!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend code')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <div className="w-full max-w-100 mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-7 border border-white/30">
          
          {/* Icon */}
          <div className="flex justify-center mb-1">
            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
            Confirm Your Email
          </h1>
          <p className="text-center text-sm text-gray-600 mb-7">
            We've sent a confirmation code to your email.
            <br />
            Enter the code below to verify your account.
          </p>

          {/* Confirmation Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 mb-4">
              <Label htmlFor="code">
                Confirmation Code
              </Label>
              <Input
                id="code"
                type="text"
                maxLength={6}
                placeholder="000000"
                variant="code"
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
              variant="gradient"
              size="sm"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <img src={spinnerGif} alt="Loading..." className="w-4 h-4" />
                  <span>Confirming...</span>
                </div>
              ) : (
                'Confirm Email'
              )}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
              >
                {isResending ? (
                  <span className="inline-flex items-center gap-1">
                    <img src={spinnerGif} alt="Loading" className="w-3 h-3" />
                    Resending...
                  </span>
                ) : (
                  'Resend Code'
                )}
              </button>
            </p>
          </div>

          {/* Back to Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Wrong email?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go back to Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
