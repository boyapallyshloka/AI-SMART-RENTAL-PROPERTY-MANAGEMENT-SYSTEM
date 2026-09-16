import React, { useState, useRef, useEffect } from 'react'
import {
  Bot,
  X,
  Minus,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  FileText,
  CreditCard,
  Wrench,
  Building2,
  Users,
  BarChart3,
  Activity,
} from 'lucide-react'
import ScoutMessage from './ScoutMessage'
import ScoutInput from './ScoutInput'
import ScoutTypingIndicator from './ScoutTypingIndicator'
import { useScout } from '../../context/ScoutContext'
import { useAuth } from '../../context/AuthContext'
import {
  isSuperAdmin,
  isPropertyManager,
  isTenant as isTenantRole,
} from '../../utils/roles'

/**
 * Role-aware quick-action suggestions
 */
const ROLE_QUICK_ACTIONS = {
  owner: [
    {
      id: 'my-properties',
      label: 'My properties',
      query: 'How do I view and manage my properties?',
      icon: Building2,
    },
    {
      id: 'applications',
      label: 'Applications',
      query: 'How can I check my applications?',
      icon: FileText,
    },
    {
      id: 'payments',
      label: 'Payments',
      query: 'Help me with payments.',
      icon: CreditCard,
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      query: 'How do I track maintenance requests for my units?',
      icon: Wrench,
    },
  ],
  tenant: [
    {
      id: 'find-property',
      label: 'Find a property',
      query: 'How do I find a property?',
      icon: Search,
    },
    {
      id: 'my-applications',
      label: 'My applications',
      query: 'How can I check my applications?',
      icon: FileText,
    },
    {
      id: 'payments',
      label: 'Payments',
      query: 'Help me with payments.',
      icon: CreditCard,
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      query: 'How do I submit a maintenance request?',
      icon: Wrench,
    },
  ],
  manager: [
    {
      id: 'managed-properties',
      label: 'Managed properties',
      query: 'How do I review all managed properties?',
      icon: Building2,
    },
    {
      id: 'applications',
      label: 'Applications',
      query: 'How can I check my applications?',
      icon: FileText,
    },
    {
      id: 'payments',
      label: 'Payments',
      query: 'Help me with payments.',
      icon: CreditCard,
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      query: 'How do I coordinate maintenance tickets?',
      icon: Wrench,
    },
  ],
  admin: [
    {
      id: 'system-overview',
      label: 'System overview',
      query: 'Give me a system overview and platform health summary.',
      icon: BarChart3,
    },
    {
      id: 'users',
      label: 'Users',
      query: 'How do I manage users and verify owner accounts?',
      icon: Users,
    },
    {
      id: 'reports',
      label: 'Reports',
      query: 'Where can I review system audit and financial reports?',
      icon: FileText,
    },
    {
      id: 'ai-monitoring',
      label: 'AI Monitoring',
      query: 'Tell me about the AI monitoring models and performance.',
      icon: Activity,
    },
  ],
}

/**
 * ScoutAssistant Component
 * Reusable AI assistant panel for HomeSphere.
 * Activated strictly from the Sidebar (no persistent floating button).
 *
 * @param {Object} props
 * @param {boolean} [props.isEmbedded=false] - If true, renders as an inline panel rather than floating panel
 * @param {boolean} [props.isOpen] - Optional override for open state
 * @param {Function} [props.onClose] - Optional override for close handler
 * @param {string} [props.className] - Optional container CSS class
 */
export default function ScoutAssistant({
  isEmbedded = false,
  isOpen: propIsOpen,
  onClose: propOnClose,
  className = '',
}) {
  const scoutContext = useScout()
  const { user } = useAuth()

  const isOpen = propIsOpen !== undefined ? propIsOpen : scoutContext.isScoutOpen
  const handleClose = propOnClose || scoutContext.closeScout
  const messages = scoutContext.messages
  const isTyping = scoutContext.isTyping
  const handleSendMessage = scoutContext.sendMessage
  const handleResetConversation = scoutContext.resetConversation

  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef(null)

  // Determine role-based quick actions
  const quickActions = isSuperAdmin(user?.role)
    ? ROLE_QUICK_ACTIONS.admin
    : isPropertyManager(user?.role)
      ? ROLE_QUICK_ACTIONS.manager
      : isTenantRole(user?.role)
        ? ROLE_QUICK_ACTIONS.tenant
        : ROLE_QUICK_ACTIONS.owner

  // Auto-scroll to bottom on message change or typing indicator
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  const handleQuickAction = (action) => {
    handleSendMessage(action.query || action.label)
  }

  // If not embedded and not open, do NOT render any floating button
  if (!isEmbedded && !isOpen) {
    return null
  }

  // Container sizing based on expanded/embedded modes
  const containerClasses = isEmbedded
    ? `w-full h-full min-h-[480px] bg-white border border-[#D9E0E6] rounded-xl flex flex-col overflow-hidden shadow-xs ${className}`
    : `fixed bottom-5 right-5 z-50 ${isExpanded
      ? 'w-[94vw] sm:w-[540px] h-[85vh] max-h-[740px]'
      : 'w-[94vw] sm:w-[380px] md:w-[420px] h-[540px] max-h-[85vh]'
    } bg-white border border-[#D9E0E6] rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${className}`

  return (
    <div className={containerClasses} role="dialog" aria-label="SCOUT Assistant Dialog">
      {/* Header */}
      <div className="px-4 py-3.5 bg-white border-b border-[#D9E0E6] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-[#EAF2F7] border border-[#D9E0E6] flex items-center justify-center text-[#315A7D] font-bold">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#3F7D58] ring-2 ring-white"
              title="Online"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-[#243447] tracking-tight">
                SCOUT
              </h2>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                Assistant
              </span>
            </div>
            <p className="text-[11px] text-[#5B6875] leading-none mt-0.5">
              HomeSphere Property Management
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1 text-[#5B6875]">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleResetConversation}
              className="p-1.5 rounded-lg hover:bg-[#F7F8FA] hover:text-[#243447] transition-colors cursor-pointer"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {!isEmbedded && (
            <>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-[#F7F8FA] hover:text-[#243447] transition-colors cursor-pointer"
                title={isExpanded ? 'Restore size' : 'Expand panel'}
                aria-label={isExpanded ? 'Restore size' : 'Expand panel'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-[#F7F8FA] hover:text-[#243447] transition-colors cursor-pointer"
                title="Close assistant"
                aria-label="Close assistant"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F8FA] flex flex-col">
        {/* Welcome / Empty State */}
        {messages.length === 0 ? (
          <div className="my-auto space-y-5 text-center py-4 px-2">
            <div className="w-12 h-12 rounded-xl bg-[#EAF2F7] border border-[#D9E0E6] flex items-center justify-center text-[#315A7D] mx-auto shadow-xs">
              <Bot className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-[#243447]">
                Hi! I'm SCOUT, your HomeSphere assistant.
              </h3>
              <p className="text-xs text-[#5B6875] leading-relaxed">
                How can I help you today? Ask a question or select one of the common topics below:
              </p>
            </div>

            {/* Quick-action Suggestions Grid (Role-Aware) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-sm mx-auto pt-2">
              {quickActions.map((action) => {
                const ActionIcon = action.icon
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2.5 p-2.5 text-left rounded-xl bg-white border border-[#D9E0E6] text-[#243447] hover:border-[#315A7D] hover:bg-[#EAF2F7] hover:text-[#315A7D] transition-all shadow-xs cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F7F8FA] group-hover:bg-white border border-[#D9E0E6] flex items-center justify-center text-[#315A7D] shrink-0">
                      <ActionIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          <>
            {messages.map((message) => (
              <ScoutMessage
                key={message.id}
                message={message}
                onSelectSuggestion={handleSendMessage}
              />
            ))}

            {isTyping && <ScoutTypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form & Footer */}
      <div className="shrink-0 bg-white">
        <ScoutInput onSendMessage={handleSendMessage} disabled={isTyping} />

        {/* Footer Disclaimer */}
        <div className="px-3 py-1.5 bg-white border-t border-[#D9E0E6]/50 text-center">
          <p className="text-[10px] text-[#5B6875]">
            SCOUT AI Assistant &bull; HomeSphere decision support &bull; Demo mode
          </p>
        </div>
      </div>
    </div>
  )
}
