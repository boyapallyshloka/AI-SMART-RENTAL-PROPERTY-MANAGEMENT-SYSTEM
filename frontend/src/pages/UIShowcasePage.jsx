import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UIShowcase from '../components/common/UIShowcase'
import { Button } from '../components/ui'
import { ArrowLeft, Home, LogIn } from 'lucide-react'

export default function UIShowcasePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#243447] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#D9E0E6] shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#315A7D] text-white shadow-xs">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[#243447]">HomeSphere</span>
              <span className="text-xs text-[#5B6875] ml-2 font-mono">/ui-showcase</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to={user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard'}>
                <Button size="sm" variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to {user.role === 'owner' ? 'Owner' : 'Tenant'} Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="primary" leftIcon={<LogIn className="w-4 h-4" />}>
                  Go to Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* UI Showcase Core */}
        <UIShowcase />
      </div>
    </div>
  )
}
