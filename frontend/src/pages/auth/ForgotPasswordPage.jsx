import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Input } from '../../components/ui'
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      setError('Email address is required')
      return false
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await forgotPassword(email)
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email to receive a recovery link"
    >
      {isSubmitted ? (
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Check your inbox
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              We have dispatched a password reset link to{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {email}
              </span>
              .
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Link to="/reset-password">
              <Button variant="primary" className="w-full" leftIcon={<KeyRound className="w-4 h-4" />}>
                Proceed to Reset Password Page (Demo)
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            error={error}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
            leftIcon={<Mail className="w-4 h-4" />}
          >
            Send Reset Link
          </Button>

          <div className="pt-2 text-center text-xs">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
