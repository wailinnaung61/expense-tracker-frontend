import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import spinnerGif from '@/assets/Spinner.gif'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await authService.forgotPassword(data.email)
      toast.success(response.message || 'Password reset code sent to your email!')
      // Navigate to reset password page with email
      navigate('/reset-password', { 
        state: { email: data.email },
        replace: true 
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email')
    }
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <div className="w-full max-w-100 mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-7 border border-white/30">
          
          {/* Icon */}
          <div className="flex justify-center mb-1">
            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-linear-to-br from-blue-300 to-indigo-400 shadow-lg">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-center text-sm text-gray-600 mb-7">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-9 text-sm rounded-2xl"
                {...register('email')}
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
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
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
