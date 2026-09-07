import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Input } from '../../components/ui'
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = () => {
    const errs = {}

    if (!password) {
      errs.password = 'New password is required'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required'
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await resetPassword('user@example.com', password)
      setIsSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter and confirm your new account password"
    >
      {isSuccess ? (
        <div className="text-center space-y-4 py-2">
          <div className="w-12 h-12 rounded-full bg-[#EDF7EE] text-[#3F7D58] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#243447]">
              Password updated!
            </h2>
            <p className="text-xs text-[#5B6875] mt-1">
              Your password has been successfully reset. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/login">
              <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
            }}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: '' }))
            }}
            error={errors.confirmPassword}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
            leftIcon={<Lock className="w-4 h-4" />}
          >
            Update Password
          </Button>

          <div className="pt-2 text-center text-xs">
            <Link
              to="/login"
              className="font-medium text-[#5B6875] hover:text-[#315A7D]"
            >
              Cancel and return to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
