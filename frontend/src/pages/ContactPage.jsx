import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/common/Footer'
import { Button, Input, Select, Textarea } from '../components/ui'
import {
  Home,
  ArrowLeft,
  LogIn,
  Mail,
  Phone,
  Clock,
  MapPin,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Send,
  Building2,
  LifeBuoy,
  MessageSquare,
} from 'lucide-react'

export default function ContactPage() {
  const { user } = useAuth()

  useEffect(() => {
    document.title = 'Contact Support | HomeSphere Property Management'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'general',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Frontend-only demo interaction: does not submit to any backend
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      category: 'general',
      subject: '',
      message: '',
    })
    setIsSubmitted(false)
  }

  // Determine back destination based on authentication status
  const getDashboardDestination = () => {
    if (!user) return '/login'
    if (user.role === 'admin' || user.role === 'superadmin') return '/admin/dashboard'
    if (user.role === 'owner' || user.role === 'manager') return '/owner/dashboard'
    return '/tenant/dashboard'
  }

  const getDashboardLabel = () => {
    if (!user) return 'Sign In'
    if (user.role === 'admin' || user.role === 'superadmin') return 'Back to Admin Dashboard'
    if (user.role === 'owner' || user.role === 'manager') return 'Back to Owner Dashboard'
    return 'Back to Tenant Dashboard'
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#243447] font-sans antialiased flex flex-col">
      {/* Top Application Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#D9E0E6] shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-md bg-[#315A7D] text-white group-hover:bg-[#274B68] transition-colors shadow-2xs">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-[#243447] block leading-none">
                  HomeSphere
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#5B6875] mt-1 block">
                  Property Management
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block text-[#D9E0E6] font-light">|</span>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Help &amp; Support</span>
            </span>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-lg border border-[#D9E0E6]">
            <Link
              to="/privacy-policy"
              className="px-3 py-1.5 text-xs font-medium rounded-md text-[#5B6875] hover:text-[#243447] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-and-conditions"
              className="px-3 py-1.5 text-xs font-medium rounded-md text-[#5B6875] hover:text-[#243447] transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              to="/contact"
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-white text-[#315A7D] font-semibold shadow-2xs border border-[#D9E0E6] transition-colors"
            >
              Contact Support
            </Link>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            <Link to={getDashboardDestination()}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={user ? <ArrowLeft className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              >
                {getDashboardLabel()}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex md:hidden border-t border-[#D9E0E6] bg-[#F7F8FA] px-4 py-2 gap-2 text-xs">
          <Link
            to="/privacy-policy"
            className="flex-1 text-center py-1.5 rounded-md font-medium text-[#5B6875]"
          >
            Privacy
          </Link>
          <Link
            to="/terms-and-conditions"
            className="flex-1 text-center py-1.5 rounded-md font-medium text-[#5B6875]"
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className="flex-1 text-center py-1.5 rounded-md font-semibold bg-white text-[#315A7D] shadow-2xs border border-[#D9E0E6]"
          >
            Contact
          </Link>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="bg-white border-b border-[#D9E0E6] py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Client Assistance &amp; Inquiries</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#243447]">
              Contact Support
            </h1>

            <p className="text-sm sm:text-base text-[#5B6875] leading-relaxed">
              Have questions about your rental portfolio, lease agreements, tenant applications, or billing records? Reach out to the HomeSphere team for support.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Contact Information Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* General Inquiries */}
          <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-md bg-[#EAF2F7] flex items-center justify-center text-[#315A7D]">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#243447]">General Support</h3>
            <p className="text-xs text-[#5B6875]">Assistance with platform features and account access.</p>
            <p className="text-xs font-medium text-[#315A7D] pt-1">
              <a href="mailto:support@homesphere.com" className="hover:underline">
                support@homesphere.com
              </a>
            </p>
          </div>

          {/* Billing & Payments */}
          <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-md bg-[#EAF2F7] flex items-center justify-center text-[#315A7D]">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#243447]">Billing &amp; Rent</h3>
            <p className="text-xs text-[#5B6875]">Rent ledger reconciliation and payment receipts.</p>
            <p className="text-xs font-medium text-[#315A7D] pt-1">
              <a href="mailto:billing@homesphere.com" className="hover:underline">
                billing@homesphere.com
              </a>
            </p>
          </div>

          {/* Telephone */}
          <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-md bg-[#EAF2F7] flex items-center justify-center text-[#315A7D]">
              <Phone className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#243447]">Phone Support</h3>
            <p className="text-xs text-[#5B6875]">Direct desk support for property managers.</p>
            <p className="text-xs font-medium text-[#243447] pt-1 font-mono">
              +1 (800) 555-0199
            </p>
          </div>

          {/* Office Hours */}
          <div className="rounded-lg border border-[#D9E0E6] bg-white p-5 shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-md bg-[#EAF2F7] flex items-center justify-center text-[#315A7D]">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#243447]">Hours &amp; Availability</h3>
            <p className="text-xs text-[#5B6875]">Mon – Fri: 8:00 AM – 6:00 PM EST</p>
            <p className="text-[11px] text-[#5B6875] pt-1">
              Weekend: Emergency dispatch only
            </p>
          </div>
        </div>

        {/* Emergency Notice Banner */}
        <div className="rounded-lg bg-[#FDF4F4] border border-[#F2C0C0] p-4 sm:p-5 text-xs text-[#5B6875] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B94A48] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#B94A48]">
              Emergency Maintenance Protocol Notice
            </p>
            <p className="leading-relaxed">
              Online support and routine ticket dispatches are intended for administrative operations. For urgent health or life-safety emergencies (such as active gas leaks, fires, structural damage, or severe flooding), please contact local emergency authorities (911) or your property manager&rsquo;s on-call emergency dispatch number immediately.
            </p>
          </div>
        </div>

        {/* Two-Column Support Detail & Static Contact Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Office & Guidance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-lg border border-[#D9E0E6] bg-white p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#315A7D]" />
                Support Office Headquarters
              </h2>
              <div className="text-xs text-[#5B6875] space-y-1 leading-relaxed">
                <p className="font-semibold text-[#243447]">HomeSphere Systems, Inc.</p>
                <p>100 Montgomery Street, Suite 1800</p>
                <p>San Francisco, CA 94104</p>
                <p>United States</p>
              </div>

              <div className="pt-3 border-t border-[#D9E0E6] space-y-2 text-xs text-[#5B6875]">
                <p className="font-semibold text-[#243447]">Expected Response Times</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>General Account Questions: Within 1 business day</li>
                  <li>Billing &amp; Payment Inquiries: Within 24 hours</li>
                  <li>Maintenance Ticket Escalations: Under 4 hours</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-[#D9E0E6] bg-[#EAF2F7] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-[#243447] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#315A7D]" />
                Self-Service Dashboard Tips
              </h3>
              <p className="text-xs text-[#5B6875] leading-relaxed">
                Many routine requests can be resolved directly inside your dashboard:
              </p>
              <ul className="text-xs text-[#5B6875] space-y-1.5">
                <li>&bull; Tenants can submit repair requests from the <strong>Maintenance</strong> page.</li>
                <li>&bull; Owners can review vacancy status and leases from <strong>Properties</strong>.</li>
                <li>&bull; Payment receipts are accessible in real-time from <strong>Payments</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Static Contact Form UI (with explicit Non-Functional / Demo Notice) */}
          <div className="lg:col-span-7 rounded-lg border border-[#D9E0E6] bg-white p-6 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-[#D9E0E6] pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#315A7D]" />
                  Send an Inquiry
                </h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#D9E0E6] text-[#5B6875]">
                  Frontend Template
                </span>
              </div>
              <p className="text-xs text-[#5B6875] mt-1">
                Use the form below to draft an inquiry to our client services desk.
              </p>
            </div>

            {/* Prominent Demo Notice Box as requested */}
            <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#D9E0E6] text-xs text-[#5B6875] flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#315A7D] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[#243447]">Demonstration Form:</strong> This is a front-end placeholder UI. Submissions do not transmit data to an external server. To reach our support team immediately, please email{' '}
                <a href="mailto:support@homesphere.com" className="text-[#315A7D] font-medium hover:underline">
                  support@homesphere.com
                </a>.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-6 rounded-lg bg-[#EAF2F7] border border-[#D9E0E6] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#3F7D58] text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-[#243447] text-base">
                  Inquiry Simulated Successfully
                </h3>
                <p className="text-xs text-[#5B6875] max-w-md mx-auto leading-relaxed">
                  In a production environment, this message would be dispatched to the HomeSphere customer support queue. For actual assistance right now, please contact us directly at <strong className="text-[#243447]">support@homesphere.com</strong>.
                </p>
                <div className="pt-2">
                  <Button size="sm" variant="outline" onClick={handleReset}>
                    Send Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    placeholder="Marcus Vance"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="marcus@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Inquiry Category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    options={[
                      { value: 'general', label: 'General Platform Support' },
                      { value: 'billing', label: 'Billing & Rent Payments' },
                      { value: 'maintenance', label: 'Maintenance Ticket Coordination' },
                      { value: 'leases', label: 'Lease Agreement Inquiries' },
                      { value: 'technical', label: 'Technical / Access Assistance' },
                    ]}
                  />

                  <Input
                    label="Subject"
                    placeholder="e.g. Question regarding lease renewal"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    required
                  />
                </div>

                <Textarea
                  label="Message"
                  placeholder="Describe your question or issue in detail..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  required
                />

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Send Message (Demo Mode)
                  </Button>

                  <span className="text-xs text-[#5B6875] hidden sm:inline">
                    No data is stored externally
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Reusable Footer Component */}
      <Footer />
    </div>
  )
}
