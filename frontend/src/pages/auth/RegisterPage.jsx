import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Input } from '../../components/ui'
import { Mail, Lock, User, UserPlus, Building2, Briefcase } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('tenant')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name.trim()) {
      errs.name = 'Full name is required'
    }

    if (!email.trim()) {
      errs.email = 'Email address is required'
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address'
    }

    if (!password) {
      errs.password = 'Password is required'
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
      const result = await register({ name, email, password, role })
      if (result.success) {
        const destination =
          role === 'owner' || role === 'manager'
            ? '/owner/dashboard'
            : '/tenant/dashboard'
        navigate(destination, { replace: true })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join HomeSphere as a tenant, owner, or manager"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Role Selector Tabs */}
        <div>
          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#243447]">
            I am joining as a
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
            <button
              type="button"
              onClick={() => setRole('tenant')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                role === 'tenant'
                  ? 'bg-white text-[#315A7D] border border-[#D9E0E6] shadow-xs'
                  : 'text-[#5B6875] hover:text-[#243447]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Tenant</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                role === 'owner'
                  ? 'bg-white text-[#315A7D] border border-[#D9E0E6] shadow-xs'
                  : 'text-[#5B6875] hover:text-[#243447]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Owner</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('manager')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                role === 'manager'
                  ? 'bg-white text-[#315A7D] border border-[#D9E0E6] shadow-xs'
                  : 'text-[#5B6875] hover:text-[#243447]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Manager</span>
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          placeholder="e.g. Alex Morgan"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
          }}
          error={errors.name}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
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

        <Input
          label="Password"
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
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
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
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>

        <div className="pt-2 text-center text-xs text-[#5B6875]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#315A7D] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
