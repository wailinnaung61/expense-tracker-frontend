import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import spinnerGif from '@/assets/Spinner.gif'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isResending, setIsResending] = useState(false)
  
  // Get email from navigation state
  const email = location.state?.email

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Redirect if no email
  if (!email) {
    navigate('/forgot-password', { replace: true })
    return null
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await authService.resetPassword({
        usernameOrEmail: email,
        confirmationCode: data.code,
        newPassword: data.newPassword,
      })
      toast.success(response.message || 'Password reset successfully!')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password')
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    try {
      const response = await authService.forgotPassword(email)
      toast.success(response.message || 'Reset code resent to your email!')
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
            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-linear-to-br from-blue-300 to-indigo-400 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-center text-sm text-gray-600 mb-7">
            Enter the code sent to your email and your new password below.
          </p>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Confirmation Code Field */}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                Confirmation Code
              </Label>
              <Input
                id="code"
                type="text"
                maxLength={6}
                placeholder="000000"
                className="h-9 text-center text-lg tracking-widest rounded-2xl"
                {...register('code')}
                autoComplete="off"
                autoFocus
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            {/* New Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="h-9 text-sm rounded-2xl pr-10"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="h-9 text-sm rounded-2xl pr-10"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                  <span>Resetting...</span>
                </div>
              ) : (
                'Reset Password'
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

          {/* Password Requirements */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">Password must contain:</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li>• At least 8 characters</li>
              <li>• One uppercase letter</li>
              <li>• One lowercase letter</li>
              <li>• One number</li>
              <li>• One special character</li>
            </ul>
          </div>

          {/* Back to Forgot Password */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Wrong email?{' '}
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go back
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
