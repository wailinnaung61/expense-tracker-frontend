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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50/70 via-purple-50/50 to-pink-50/40 opacity-0 animate-[fadeIn_1s_ease-out_forwards]"></div>
      
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-100/20 via-purple-100/17 to-pink-100/15 animate-gradient-shift opacity-0 animate-[fadeIn_1s_ease-out_forwards]"></div>
      
      {/* Multiple Floating orbs - more variety */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-linear-to-br from-blue-200/20 to-purple-200/18 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-linear-to-br from-purple-200/17 to-pink-200/16 rounded-full blur-3xl animate-float" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-linear-to-br from-indigo-200/15 to-blue-200/14 rounded-full blur-3xl animate-float" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-linear-to-br from-cyan-200/14 to-teal-200/13 rounded-full blur-3xl animate-float" style={{animationDelay: '0.5s', animationDuration: '6s'}}></div>
      <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-linear-to-br from-violet-200/16 to-purple-200/15 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s', animationDuration: '7s'}}></div>
      
      {/* More Sparkle/Spot effects - scattered throughout */}
      <div className="absolute top-20 left-1/4 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-pulse shadow-md shadow-blue-200"></div>
      <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400/45 rounded-full animate-pulse shadow-md shadow-purple-200" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-pink-400/50 rounded-full animate-pulse shadow-sm shadow-pink-200" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-indigo-400/45 rounded-full animate-pulse shadow-md shadow-indigo-200" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-10 right-1/3 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse shadow-sm shadow-cyan-200" style={{animationDelay: '0.3s'}}></div>
      <div className="absolute bottom-20 left-1/5 w-1.5 h-1.5 bg-violet-400/45 rounded-full animate-pulse shadow-md shadow-violet-200" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-2/3 right-1/5 w-2 h-2 bg-blue-300/45 rounded-full animate-pulse shadow-md shadow-blue-100" style={{animationDelay: '0.8s'}}></div>
      <div className="absolute bottom-1/2 right-2/3 w-1 h-1 bg-purple-300/50 rounded-full animate-pulse shadow-sm shadow-purple-100" style={{animationDelay: '1.2s'}}></div>
      <div className="absolute top-1/4 left-2/3 w-1.5 h-1.5 bg-pink-300/45 rounded-full animate-pulse shadow-md shadow-pink-100" style={{animationDelay: '1.8s'}}></div>
      <div className="absolute bottom-2/3 left-1/6 w-1 h-1 bg-indigo-300/50 rounded-full animate-pulse shadow-sm shadow-indigo-100" style={{animationDelay: '0.6s'}}></div>
      <div className="absolute top-3/4 left-1/2 w-1.5 h-1.5 bg-cyan-300/47 rounded-full animate-pulse shadow-md shadow-cyan-100" style={{animationDelay: '1.4s'}}></div>
      <div className="absolute bottom-1/4 right-1/2 w-1 h-1 bg-violet-300/50 rounded-full animate-pulse shadow-sm shadow-violet-100" style={{animationDelay: '0.9s'}}></div>
      <div className="absolute top-1/5 right-2/5 w-2 h-2 bg-blue-300/42 rounded-full animate-pulse shadow-md shadow-blue-50" style={{animationDelay: '1.7s'}}></div>
      <div className="absolute bottom-1/5 left-2/5 w-1.5 h-1.5 bg-purple-300/45 rounded-full animate-pulse shadow-md shadow-purple-50" style={{animationDelay: '0.4s'}}></div>
      <div className="absolute top-1/8 left-1/5 w-1 h-1 bg-teal-400/47 rounded-full animate-pulse shadow-sm shadow-teal-200" style={{animationDelay: '2.2s'}}></div>
      <div className="absolute bottom-3/4 right-1/6 w-1.5 h-1.5 bg-indigo-400/47 rounded-full animate-pulse shadow-md shadow-indigo-100" style={{animationDelay: '1.1s'}}></div>
      <div className="absolute top-3/5 left-3/4 w-2 h-2 bg-pink-400/43 rounded-full animate-pulse shadow-md shadow-pink-200" style={{animationDelay: '0.7s'}}></div>
      <div className="absolute bottom-2/5 right-3/5 w-1 h-1 bg-blue-400/45 rounded-full animate-pulse shadow-sm shadow-blue-100" style={{animationDelay: '1.9s'}}></div>
      <div className="absolute top-4/5 right-1/5 w-1.5 h-1.5 bg-purple-400/49 rounded-full animate-pulse shadow-md shadow-purple-100" style={{animationDelay: '0.2s'}}></div>
      
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px]"></div>
      
      {/* Multiple Radial gradients for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.07),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.06),transparent_60%)]"></div>
      
      {/* More Floating decorative circles - various sizes */}
      <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-blue-200/35 rounded-full animate-float" style={{animationDuration: '6s', animationDelay: '0.7s'}}></div>
      <div className="absolute bottom-1/4 left-20 w-32 h-32 border-2 border-purple-200/31 rounded-full animate-float" style={{animationDuration: '7.5s', animationDelay: '1.4s'}}></div>
      <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-indigo-200/27 rounded-full animate-float" style={{animationDuration: '5.5s', animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-1/3 left-1/2 w-28 h-28 border-2 border-pink-200/23 rounded-full animate-float" style={{animationDuration: '8s', animationDelay: '1.8s'}}></div>
      <div className="absolute top-1/6 left-1/3 w-16 h-16 border border-cyan-200/31 rounded-full animate-float" style={{animationDuration: '6.5s', animationDelay: '1.1s'}}></div>
      <div className="absolute bottom-1/6 right-1/4 w-36 h-36 border-2 border-violet-200/20 rounded-full animate-float" style={{animationDuration: '7s', animationDelay: '1.6s'}}></div>
      <div className="absolute top-2/3 left-1/5 w-22 h-22 border border-blue-200/25 rounded-full animate-float" style={{animationDuration: '5s', animationDelay: '0.8s'}}></div>
      <div className="absolute bottom-2/3 right-1/5 w-18 h-18 border border-purple-200/29 rounded-full animate-float" style={{animationDuration: '6.5s', animationDelay: '1.7s'}}></div>
      <div className="absolute top-1/3 left-2/3 w-26 h-26 border-2 border-pink-200/27 rounded-full animate-float" style={{animationDuration: '7.5s', animationDelay: '0.6s'}}></div>
      <div className="absolute top-1/8 right-1/6 w-20 h-20 border border-teal-200/29 rounded-full animate-float" style={{animationDuration: '6s', animationDelay: '1.2s'}}></div>
      <div className="absolute bottom-3/5 left-1/4 w-24 h-24 border-2 border-indigo-200/25 rounded-full animate-float" style={{animationDuration: '8s', animationDelay: '0.9s'}}></div>
      <div className="absolute top-4/5 right-2/5 w-30 h-30 border-2 border-cyan-200/23 rounded-full animate-float" style={{animationDuration: '5.5s', animationDelay: '1.5s'}}></div>
      <div className="absolute bottom-1/5 left-3/5 w-18 h-18 border border-violet-200/29 rounded-full animate-float" style={{animationDuration: '7s', animationDelay: '0.4s'}}></div>
      <div className="absolute top-2/5 right-3/4 w-22 h-22 border border-pink-200/27 rounded-full animate-float" style={{animationDuration: '6.5s', animationDelay: '1.9s'}}></div>
      
      <div className="relative w-full max-w-100 mx-auto opacity-0 animate-[fadeInZoom_0.7s_ease-out_forwards]">
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-900/10 p-7 border border-white/50 hover:shadow-sky-900/20 transition-all duration-500">
          <div className="absolute -inset-0.5 bg-linear-to-r from-sky-400 via-cyan-400 to-teal-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          
          <div className="relative">
          {/* Icon */}
          <div className="flex justify-center mb-1 opacity-0 animate-[fadeInZoom_0.7s_ease-out_0.1s_forwards]">
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-br from-sky-400 to-cyan-500 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              <div className="relative flex h-15 w-15 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-cyan-500 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-2 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.2s_forwards]">
            Reset Password
          </h1>
          <p className="text-center text-sm text-gray-600 mb-7 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.3s_forwards]">
            Enter the code sent to your email and your new password below.
          </p>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.5s_forwards]">
            {/* Confirmation Code Field */}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-gray-900!">
                Confirmation Code
              </Label>
              <Input
                id="code"
                type="text"
                maxLength={6}
                placeholder="000000"
                variant="code"
                className="bg-white! text-gray-900! border-gray-300!"
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
              <Label htmlFor="newPassword" className="text-gray-900!">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="pr-10 bg-white! text-gray-900! border-gray-300!"
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
              <Label htmlFor="confirmPassword" className="text-gray-900!">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="pr-10 bg-white! text-gray-900! border-gray-300!"
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
              variant="gradient"
              size="sm"
              className="w-full relative overflow-hidden group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={isSubmitting}
            >
              <span className="relative z-10">
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <img src={spinnerGif} alt="Loading..." className="w-4 h-4" />
                  <span>Resetting...</span>
                </div>
              ) : (
                'Reset Password'
              )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
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
          <div className="mt-6 p-3 bg-gray-50 rounded-lg opacity-0 animate-[fadeIn_0.7s_ease-out_0.6s_forwards]">
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
          <div className="mt-4 text-center opacity-0 animate-[fadeIn_0.7s_ease-out_0.6s_forwards]">
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
    </div>
  )
}
