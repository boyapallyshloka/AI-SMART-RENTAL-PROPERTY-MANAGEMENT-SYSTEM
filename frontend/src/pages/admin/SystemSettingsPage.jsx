import React, { useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  Button,
  Input,
  Select,
  StatusBadge,
} from '../../components/ui'
import {
  Shield,
  Bell,
  Globe,
  Mail,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'

const DEFAULT_SETTINGS = {
  platformName: 'HomeSphere Real Estate Systems',
  supportEmail: 'support@homesphere.com',
  defaultCurrency: 'USD',
  rentRemindersEnabled: true,
  overdueAlertsEnabled: true,
  agreementExpiryRemindersEnabled: true,
  sessionTimeout: '60',
  maxLoginAttempts: '5',
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS })
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const currencyOptions = [
    { value: 'USD', label: 'USD ($) - US Dollar' },
    { value: 'EUR', label: 'EUR (€) - Euro' },
    { value: 'GBP', label: 'GBP (£) - British Pound' },
    { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
  ]

  const timeoutOptions = [
    { value: '15', label: '15 Minutes (High Security)' },
    { value: '30', label: '30 Minutes' },
    { value: '60', label: '60 Minutes (Default)' },
    { value: '120', label: '120 Minutes (2 Hours)' },
    { value: '480', label: '480 Minutes (8 Hours)' },
  ]

  const loginAttemptOptions = [
    { value: '3', label: '3 Failed Attempts (Strict)' },
    { value: '5', label: '5 Failed Attempts (Standard)' },
    { value: '10', label: '10 Failed Attempts (Permissive)' },
  ]

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSuccessMessage('System settings saved successfully.')
      setTimeout(() => setSuccessMessage(''), 3500)
    }, 400)
  }

  const handleReset = () => {
    setSettings({ ...DEFAULT_SETTINGS })
    setSuccessMessage('Settings have been reset to default values.')
    setTimeout(() => setSuccessMessage(''), 3500)
  }

  return (
    <DashboardLayout
      defaultRole="admin"
      activeItem="settings"
      pageTitle="System Settings"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Message Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-md bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-[#2A583B] hover:text-[#243447] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                Global System Settings
              </h1>
              <StatusBadge status="Active" size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
              Configure platform parameters, notification triggers, and security compliance policies
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Platform Settings */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#D9E0E6] pb-3">
              <div className="w-8 h-8 rounded-md bg-[#EAF2F7] text-[#315A7D] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#243447]">
                  1. Platform Settings
                </h2>
                <p className="text-xs text-[#5B6875]">
                  Core branding, primary correspondence channels, and base transaction currency
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <Input
                  label="Platform Brand Name"
                  value={settings.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  placeholder="e.g. HomeSphere"
                  required
                />
              </div>

              <div>
                <Input
                  label="System Support Email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-[#5B6875]" />}
                  placeholder="support@example.com"
                  required
                />
              </div>
            </div>

            <div className="sm:w-1/2">
              <Select
                label="Default Operating Currency"
                options={currencyOptions}
                value={settings.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                helperText="Used across property pricing, rent ledgers, and invoice generation"
              />
            </div>
          </div>

          {/* Section 2: Notification Settings */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#D9E0E6] pb-3">
              <div className="w-8 h-8 rounded-md bg-[#EAF2F7] text-[#315A7D] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#243447]">
                  2. Notification Settings
                </h2>
                <p className="text-xs text-[#5B6875]">
                  Automated dispatch policies for tenant billing and lease milestones
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Rent Reminders Toggle */}
              <label className="flex items-start justify-between p-3 rounded-md border border-[#D9E0E6] hover:border-[#315A7D]/40 transition-colors cursor-pointer bg-[#F7F8FA]">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-semibold text-[#243447] block">
                    Upcoming Rent Reminders
                  </span>
                  <span className="text-xs text-[#5B6875] block">
                    Automatically send friendly payment reminders 3 days before rent due dates
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.rentRemindersEnabled}
                  onChange={(e) =>
                    handleChange('rentRemindersEnabled', e.target.checked)
                  }
                  className="w-4 h-4 mt-0.5 rounded text-[#315A7D] focus:ring-[#315A7D] border-[#D9E0E6] cursor-pointer"
                />
              </label>

              {/* Overdue Alerts Toggle */}
              <label className="flex items-start justify-between p-3 rounded-md border border-[#D9E0E6] hover:border-[#315A7D]/40 transition-colors cursor-pointer bg-[#F7F8FA]">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-semibold text-[#243447] block">
                    Overdue Invoice Alerts
                  </span>
                  <span className="text-xs text-[#5B6875] block">
                    Alert both tenant and property manager when an invoice remains unpaid past due date
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.overdueAlertsEnabled}
                  onChange={(e) =>
                    handleChange('overdueAlertsEnabled', e.target.checked)
                  }
                  className="w-4 h-4 mt-0.5 rounded text-[#315A7D] focus:ring-[#315A7D] border-[#D9E0E6] cursor-pointer"
                />
              </label>

              {/* Agreement-Expiry Reminders Toggle */}
              <label className="flex items-start justify-between p-3 rounded-md border border-[#D9E0E6] hover:border-[#315A7D]/40 transition-colors cursor-pointer bg-[#F7F8FA]">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-semibold text-[#243447] block">
                    Agreement-Expiry Reminders
                  </span>
                  <span className="text-xs text-[#5B6875] block">
                    Notify owners and tenants 60 days and 30 days prior to lease agreement termination
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.agreementExpiryRemindersEnabled}
                  onChange={(e) =>
                    handleChange('agreementExpiryRemindersEnabled', e.target.checked)
                  }
                  className="w-4 h-4 mt-0.5 rounded text-[#315A7D] focus:ring-[#315A7D] border-[#D9E0E6] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Security Settings */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#D9E0E6] pb-3">
              <div className="w-8 h-8 rounded-md bg-[#EAF2F7] text-[#315A7D] flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#243447]">
                  3. Security & Access Control
                </h2>
                <p className="text-xs text-[#5B6875]">
                  Authentication session parameters and lockout thresholds
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <Select
                  label="Session Inactivity Timeout"
                  options={timeoutOptions}
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                  helperText="Automatic sign-out duration after user inactivity"
                />
              </div>

              <div>
                <Select
                  label="Maximum Failed Login Attempts"
                  options={loginAttemptOptions}
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
                  helperText="Lockout trigger threshold for consecutive invalid passwords"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Changes
            </Button>

            <Button
              variant="primary"
              type="submit"
              isLoading={isSaving}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
