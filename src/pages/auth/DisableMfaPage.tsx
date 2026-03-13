import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { disableMfaSchema, type DisableMfaFormData } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { authService } from '@/services/authService'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import spinnerGif from '@/assets/Spinner.gif'

export default function DisableMfaPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DisableMfaFormData>({
    resolver: zodResolver(disableMfaSchema),
  })

  const onSubmit = async (data: DisableMfaFormData) => {
    try {
      const response = await authService.disableMfaWithBackup(data)
      toast.success(response.message || 'MFA has been disabled successfully!')
      // Navigate to login page
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to disable MFA')
    }
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      <div className="w-full max-w-100 mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-7 border border-white/30">
          
          {/* Icon */}
          <div className="flex justify-center mb-1">
            <div className="flex h-15 w-15 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-red-600 shadow-lg">
              <ShieldOff className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
            Disable MFA
          </h1>
          <p className="text-center text-sm text-gray-600 mb-7">
            Lost access to your authenticator app? Use your backup code to disable MFA.
          </p>

          {/* Alert Box */}
          <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-xs text-orange-800">
              <strong>Warning:</strong> Disabling MFA will reduce your account security. 
              You can re-enable it later in your account settings.
            </p>
          </div>

          {/* Disable MFA Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                {...register('username')}
                autoFocus
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="backupCode">
                Backup Code
              </Label>
              <Input
                id="backupCode"
                type="text"
                placeholder="Enter your backup code"
                variant="mono"
                {...register('backupCode')}
              />
              {errors.backupCode && (
                <p className="text-sm text-red-600">{errors.backupCode.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter the backup code you received when you first enabled MFA
              </p>
            </div>

            <Button 
              type="submit" 
              variant="danger"
              size="sm"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <img src={spinnerGif} alt="Loading..." className="w-4 h-4" />
                  <span>Disabling MFA...</span>
                </div>
              ) : (
                'Disable MFA'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Have access to your authenticator?{' '}
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
