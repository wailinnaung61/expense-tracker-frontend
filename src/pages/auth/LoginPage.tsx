import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type SignInFormData } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import spinnerGif from '@/assets/Spinner.gif'
import { authService } from '@/services/authService'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  const { login, fetchUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const callbackProcessed = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
    },
  })


  // Handle Google OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    if (code && state && !callbackProcessed.current) {
      callbackProcessed.current = true
      setIsGoogleLoading(true)
      handleGoogleCallback(code)
    }
  }, [searchParams])

  const handleGoogleCallback = async (code: string) => {
    setIsGoogleLoading(true)
    try {
      const response = await authService.handleGoogleCallback(code)
      
      // Check if MFA is required
      if (response.requiresMfa) {
        toast.info('Two-factor authentication required')
        navigate('/verify-totp', {
          state: {
            session: response.mfaChallenge
          }
        })
        return
      }
      
      // Fetch user data after successful login
      await fetchUser()
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google login failed')
      // Clear the URL parameters
      navigate('/login', { replace: true })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await login(data.email, data.password)
      
      // Check if MFA is required
      if (response.requiresMfa) {
        toast.info('Two-factor authentication required')
        navigate('/verify-totp', {
          state: {
            session: response.mfaChallenge,
            email: data.email
          }
        })
        return
      }    
      // No MFA - login successful
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      const { authorizationUrl } = await authService.getGoogleAuthUrl()
      
      // Open Google OAuth in the same window
      window.location.href = authorizationUrl
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate Google login')
      setIsGoogleLoading(false)
    }
  }

  // Show blank white page during OAuth callback processing
  if (isGoogleLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* Blank white page */}
      </div>
    )
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
      <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-blue-200/35 rounded-full animate-float" style={{animationDuration: '6s', animationDelay: '0.3s'}}></div>
      <div className="absolute bottom-1/4 left-20 w-32 h-32 border-2 border-purple-200/31 rounded-full animate-float" style={{animationDuration: '7.5s', animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-indigo-200/27 rounded-full animate-float" style={{animationDuration: '5.5s', animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-1/3 left-1/2 w-28 h-28 border-2 border-pink-200/23 rounded-full animate-float" style={{animationDuration: '8s', animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/6 left-1/3 w-16 h-16 border border-cyan-200/31 rounded-full animate-float" style={{animationDuration: '6.5s', animationDelay: '0.8s'}}></div>
      <div className="absolute bottom-1/6 right-1/4 w-36 h-36 border-2 border-violet-200/20 rounded-full animate-float" style={{animationDuration: '7s', animationDelay: '1.2s'}}></div>
      <div className="absolute top-2/3 left-1/5 w-22 h-22 border border-blue-200/25 rounded-full animate-float" style={{animationDuration: '5s', animationDelay: '0.6s'}}></div>
      <div className="absolute bottom-2/3 right-1/5 w-18 h-18 border border-purple-200/29 rounded-full animate-float" style={{animationDuration: '6.5s', animationDelay: '1.8s'}}></div>
      <div className="absolute top-1/3 left-2/3 w-26 h-26 border-2 border-pink-200/27 rounded-full animate-float" style={{animationDuration: '7.5s', animationDelay: '0.4s'}}></div>
      <div className="absolute top-1/8 right-1/6 w-20 h-20 border border-teal-200/29 rounded-full animate-float" style={{animationDuration: '6s', animationDelay: '1.4s'}}></div>
      <div className="absolute bottom-3/5 left-1/4 w-24 h-24 border-2 border-indigo-200/25 rounded-full animate-float" style={{animationDuration: '8s', animationDelay: '0.9s'}}></div>
      <div className="absolute top-4/5 right-2/5 w-30 h-30 border-2 border-cyan-200/23 rounded-full animate-float" style={{animationDuration: '5.5s', animationDelay: '1.6s'}}></div>
      <div className="absolute bottom-1/5 left-3/5 w-18 h-18 border border-violet-200/29 rounded-full animate-float" style={{animationDuration: '7s', animationDelay: '0.7s'}}></div>
      <div className="absolute top-2/5 right-3/4 w-22 h-22 border border-pink-200/27 rounded-full animate-float" style={{animationDuration: '6.5s', animationDelay: '2s'}}></div>
      
      <div className="relative w-full max-w-100 mx-auto opacity-0 animate-[fadeInZoom_0.7s_ease-out_forwards]">
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-900/10 p-7 border border-white/50 hover:shadow-sky-900/20 transition-all duration-500">
          {/* Subtle glow effect on card */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-sky-400 via-cyan-400 to-teal-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          
          <div className="relative">{/* Logo */}
          <div className="flex justify-center mb-1 opacity-0 animate-[fadeInZoom_0.7s_ease-out_0.1s_forwards]">
            <Logo noLink showText={false} />
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-7 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.2s_forwards]">
            Log in
          </h1>

          {/* OAuth Buttons */}
          <div className="space-y-2.5 mb-7 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.3s_forwards]">
          <Button
            type="button"
            variant="outline"
            className="w-full h-9 border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-sky-300 text-gray-700 font-medium text-sm transition-all shadow-sm hover:shadow-md hover:scale-105 rounded-2xl group"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
        {isGoogleLoading ? (
          <>
            <img src={spinnerGif} alt="Loading" className="w-5 h-5 mr-2" />
            Loading...
          </>
        ) : (
          'Continue with Google'
        )}          
        </Button>
        </div>

          {/* Divider */}
          <div className="relative my-5 opacity-0 animate-[fadeIn_0.7s_ease-out_0.4s_forwards]">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-500 uppercase tracking-wider">OR</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.5s_forwards]">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900!">
                Username or Email Address
              </Label>
              <Input
                id="email"
                type="text"
                className="h-9 text-sm rounded-2xl bg-white! text-gray-900! border-gray-300!"
                {...register('email')}
              />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-900!">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="h-9 pr-10 text-sm rounded-2xl bg-white! text-gray-900! border-gray-300!"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

            {/* Forgot Password & Remember Me Row */}
            <div className="flex items-center justify-between">                            
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forget your password
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              className="w-full relative overflow-hidden group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={isSubmitting}
            >
              <span className="relative z-10">
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                <img src={spinnerGif} alt="Loading" className="w-5 h-5 mr-2" />
                  Logging in...
                </span>
              ) : (
                'Log in'
              )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center opacity-0 animate-[fadeIn_0.7s_ease-out_0.6s_forwards]">
            <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
            <Button
              type="button"
              variant="outline"
              className="w-full h-8 border-2 border-gray-300 bg-white hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50 hover:border-sky-300 text-gray-700 font-semibold text-sm transition-all rounded-2xl hover:scale-105 hover:shadow-md"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
