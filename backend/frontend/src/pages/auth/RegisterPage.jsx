import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Input, Select } from '../../components/ui'
import {
  Mail,
  Lock,
  User,
  Phone,
  UserPlus,
  Building2,
  Briefcase,
  Clock,
  ShieldAlert,
  CheckCircle2,
  LogIn,
} from 'lucide-react'
import {
  ROLES,
  isTenant,
  isPropertyOwner,
  isPropertyManager,
  isOwnerOrManager,
} from '../../utils/roles'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('OTHER')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState(ROLES.TENANT)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const [registeredData, setRegisteredData] = useState(null)

  const validate = () => {
    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[6-9]\d{9}$/

    if (!name.trim()) {
      errs.name = 'Full name is required'
    }

    if (!email.trim()) {
      errs.email = 'Email address is required'
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address'
    }

    if (!phone.trim()) {
      errs.phone = 'Phone number is required'
    } else if (!phoneRegex.test(phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number (starts with 6-9)'
    }

    if (!gender) {
      errs.gender = 'Gender is required'
    }

    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    } else if (password.length > 100) {
      errs.password = 'Password must not exceed 100 characters'
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
    setFormError('')
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await register({
        name,
        email,
        phone,
        gender,
        password,
        role,
      })
      if (result.success) {
        if (result.isPending || result.status === 'PENDING') {
          setRegisteredData({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            gender,
            role,
          })
          setIsPendingApproval(true)
        } else {
          const destination = isOwnerOrManager(role)
            ? '/owner/dashboard'
            : '/tenant/dashboard'
          navigate(destination, { replace: true })
        }
      } else {
        setFormError(result.error || 'Registration failed')
      }
    } catch (err) {
      setFormError('An unexpected error occurred during registration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Waiting for Approval state view for PROPERTY_OWNER
  if (isPendingApproval) {
    return (
      <AuthLayout
        title="Registration Submitted"
        subtitle="Your Property Owner account is pending administrator verification"
      >
        <div className="space-y-5">
          {/* Status Banner */}
          <div className="p-4 rounded-xl bg-[#F0F7F3] border border-[#C6DEC8] text-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-[#EDF7EE] border border-[#C6DEC8] flex items-center justify-center mx-auto text-[#3F7D58]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#243447]">
                Awaiting Administrator Approval
              </h3>
              <p className="text-xs text-[#5B6875] mt-1 max-w-sm mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-[#243447]">{registeredData?.name || name}</span>.
                Your property owner registration has been recorded and submitted for Super Admin review.
              </p>
            </div>
          </div>

          {/* Account Details Summary */}
          <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6] text-xs space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-[#D9E0E6]/60">
              <span className="text-[#5B6875]">Account Email:</span>
              <span className="font-mono font-medium text-[#243447]">{registeredData?.email || email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#D9E0E6]/60">
              <span className="text-[#5B6875]">Phone Number:</span>
              <span className="font-mono font-medium text-[#243447]">{registeredData?.phone || phone}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#D9E0E6]/60">
              <span className="text-[#5B6875]">Role Requested:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#315A7D]">
                <Building2 className="w-3.5 h-3.5" />
                Property Owner
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#5B6875]">Verification Status:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF7EC] text-[#8A5B16] border border-[#F4E2B6]">
                <ShieldAlert className="w-3 h-3" />
                Pending Super Admin Review
              </span>
            </div>
          </div>

          {/* Compliance & Next Steps Notice */}
          <div className="p-3 rounded-lg bg-[#EAF2F7] border border-[#D9E0E6] text-xs text-[#274B68] space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-[#243447]">
              <CheckCircle2 className="w-4 h-4 text-[#3F7D58]" />
              <span>What happens next?</span>
            </div>
            <p className="text-[11px] text-[#5B6875]">
              In accordance with HomeSphere enterprise security policies, property owner credentials must be verified by a Super Administrator before access to the Owner Portal is unlocked.
            </p>
          </div>

          {/* Action button */}
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={() => navigate('/login')}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Return to Sign In
          </Button>

          <div className="text-center text-xs text-[#5B6875]">
            Need immediate assistance?{' '}
            <Link to="/contact" className="font-semibold text-[#315A7D] hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join HomeSphere as a tenant, owner, or manager"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="p-3 rounded-md bg-[#FBF0F0] border border-[#EFC8C7] text-xs font-medium text-[#B94A48]">
            {formError}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div>
          <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#243447]">
            I am joining as a
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F7F8FA] border border-[#D9E0E6]">
            <button
              type="button"
              onClick={() => setRole(ROLES.TENANT)}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                isTenant(role)
                  ? 'bg-white text-[#315A7D] border border-[#D9E0E6] shadow-xs'
                  : 'text-[#5B6875] hover:text-[#243447]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Tenant</span>
            </button>
            <button
              type="button"
              onClick={() => setRole(ROLES.PROPERTY_OWNER)}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                isPropertyOwner(role)
                  ? 'bg-white text-[#315A7D] border border-[#D9E0E6] shadow-xs'
                  : 'text-[#5B6875] hover:text-[#243447]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Owner</span>
            </button>
            <button
              type="button"
              onClick={() => setRole(ROLES.PROPERTY_MANAGER)}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                isPropertyManager(role)
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
          label="Phone Number"
          type="tel"
          placeholder="e.g. 9876543210"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
          }}
          error={errors.phone}
          leftIcon={<Phone className="w-4 h-4" />}
          required
        />

        <Select
          label="Gender"
          value={gender}
          onChange={(e) => {
            setGender(e.target.value)
            if (errors.gender) setErrors((prev) => ({ ...prev, gender: '' }))
          }}
          error={errors.gender}
          required
          options={[
            { value: 'FEMALE', label: 'Female' },
            { value: 'MALE', label: 'Male' },
            { value: 'OTHER', label: 'Other' },
            { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
          ]}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
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
