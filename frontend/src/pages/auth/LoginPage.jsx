import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Input } from '../../components/ui'
import { Mail, Lock, LogIn } from 'lucide-react'
import { getDashboardPath } from '../../utils/roles'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const validate = () => {
    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      errs.email = 'Email address is required'
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com)'
    }

    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        let destination = location.state?.from?.pathname

        // If no prior location or trying to go to login/root, route by role
        if (!destination || destination === '/login' || destination === '/') {
          destination = getDashboardPath(result.user.role)
        }

        navigate(destination, { replace: true })
      } else {
        setAuthError(result.error || 'Authentication failed')
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to HomeSphere"
      subtitle="Access your smart rental property management portal"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {authError && (
          <div className="p-3 rounded-md bg-[#FBF0F0] border border-[#EFC8C7] text-xs font-medium text-[#B94A48]">
            {authError}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
          }}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
              Password
            </span>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[#315A7D] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
            }}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>

        <div className="pt-2 text-center text-xs text-[#5B6875]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#315A7D] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
