import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Input } from '../../components/ui'
import { Mail, Lock, LogIn, Sparkles, Building2, User, Briefcase, Shield } from 'lucide-react'

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
          if (result.user.role === 'admin' || result.user.role === 'superadmin') {
            destination = '/admin/dashboard'
          } else if (result.user.role === 'owner' || result.user.role === 'manager') {
            // manager goes to /owner/dashboard temporarily per requirements
            destination = '/owner/dashboard'
          } else {
            destination = '/tenant/dashboard'
          }
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

  const handleQuickFill = (mockEmail, mockPassword) => {
    setEmail(mockEmail)
    setPassword(mockPassword)
    setErrors({})
    setAuthError('')
  }

  return (
    <AuthLayout
      title="Sign in to HomeSphere"
      subtitle="Access your smart rental property management portal"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-400">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password
            </span>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
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

        {/* Quick Mock Credentials */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('owner@homesphere.com', 'password123')}
              className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all text-xs group"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                <Building2 className="w-3.5 h-3.5" />
                <span>Owner</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                owner@...
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('tenant@homesphere.com', 'password123')}
              className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all text-xs group"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                <User className="w-3.5 h-3.5" />
                <span>Tenant</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                tenant@...
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('manager@homesphere.com', 'password123')}
              className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all text-xs group"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Manager</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                manager@...
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@homesphere.com', 'password123')}
              className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all text-xs group"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>Admin</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                admin@...
              </p>
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Create an account
          </Link>
        </div>

        <div className="pt-1 text-center">
          <Link
            to="/ui-showcase"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>View Reusable UI Components Showcase</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
