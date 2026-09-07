import React, { createContext, useContext, useState } from 'react'

/**
 * Predefined mock responses for SCOUT chatbot demo
 */
const getDemoResponse = (query) => {
  const q = query.toLowerCase().trim()

  // 1. Applications query
  if (
    q.includes('check my application') ||
    q.includes('check applications') ||
    q.includes('my applications') ||
    (q.includes('application') && (q.includes('check') || q.includes('status') || q.includes('how') || q.includes('find')))
  ) {
    return {
      text: "You can check your applications from the Applications section in the sidebar. Once the backend is connected, I will also be able to provide application-specific information here.",
      suggestions: ['Check my application status', 'Required documents', 'New application'],
    }
  }

  // 2. Payments query
  if (
    q.includes('help me with payment') ||
    q.includes('help with payment') ||
    q.includes('payment help') ||
    (q.includes('payment') && (q.includes('help') || q.includes('pay') || q.includes('rent') || q.includes('how')))
  ) {
    return {
      text: "I can help with payment-related information. The payment service will be connected to SCOUT when the backend APIs are available.",
      suggestions: ['How to set up AutoPay', 'View recent receipts', 'Payment methods'],
    }
  }

  // 3. Find a property query
  if (
    q.includes('how do i find a property') ||
    q.includes('find a property') ||
    q.includes('find property') ||
    q.includes('browse propert') ||
    (q.includes('property') && (q.includes('find') || q.includes('search') || q.includes('look') || q.includes('browse')))
  ) {
    return {
      text: "You can use the Property Search section to filter properties by location, budget, bedrooms, furnishing and other preferences.",
      suggestions: ['Under $1,500/mo', '2+ Bedrooms', 'Pet friendly units'],
    }
  }

  // 4. Maintenance query
  if (
    q.includes('maintenance') ||
    q.includes('repair') ||
    q.includes('fix') ||
    q.includes('broken') ||
    q.includes('work order') ||
    q.includes('leak')
  ) {
    return {
      text: "You can submit and track maintenance requests from the Maintenance section in the sidebar. Once the backend is connected, you will be able to file repair tickets, attach photos, and receive contractor dispatch updates directly through SCOUT.",
      suggestions: ['Report emergency issue', 'Track open tickets', 'Routine inspection'],
    }
  }

  // 5. My properties / Managed properties (Owner & Manager)
  if (
    q.includes('my properties') ||
    q.includes('managed properties') ||
    q.includes('portfolio') ||
    (q.includes('properties') && (q.includes('manage') || q.includes('view') || q.includes('add') || q.includes('unit')))
  ) {
    return {
      text: "You can review and manage your property listings, occupancy statuses, and unit details from the Properties section in the sidebar. Real-time property metrics and vacancy alerts will be available once the backend service is connected.",
      suggestions: ['View occupancy rate', 'Add new property', 'Lease expirations'],
    }
  }

  // 6. System overview (Super Admin)
  if (
    q.includes('system overview') ||
    q.includes('platform health') ||
    q.includes('telemetry')
  ) {
    return {
      text: "The system overview is available on your Admin Dashboard. It provides high-level telemetry on total users, active property owners, tenants, pending verifications, and operational metrics.",
      suggestions: ['View user growth', 'Pending verifications', 'Platform status'],
    }
  }

  // 7. Users & Owner verification (Super Admin)
  if (
    q.includes('user') ||
    q.includes('owner verification') ||
    q.includes('verify owner') ||
    q.includes('credentials')
  ) {
    return {
      text: "User management and pending owner approvals can be accessed via Users and Owner Verification in the sidebar. You can review submitted identity documents, title deeds, and approve credentials.",
      suggestions: ['Pending owner queue', 'Search user accounts', 'Audit log'],
    }
  }

  // 8. Reports & Audit logs (Super Admin / Owner)
  if (q.includes('report') || q.includes('audit')) {
    return {
      text: "Platform-wide audit trails and financial reports are located in Audit Logs and Reports. Every administrative action and authentication event is securely recorded for compliance.",
      suggestions: ['Recent audit logs', 'Monthly financial report', 'Export summary'],
    }
  }

  // 9. AI Monitoring (Super Admin)
  if (q.includes('ai monitoring') || q.includes('monitoring') || q.includes('model')) {
    return {
      text: "You can inspect active machine learning models, telemetry metrics, and confidence scores from the AI Monitoring page in your Super Admin sidebar. This page remains your dedicated control center for AI oversight.",
      suggestions: ['Rent prediction model', 'Demand forecast model', 'Maintenance model'],
    }
  }

  // General fallback response
  return {
    text: "I'm currently running in demo mode. Once the SCOUT AI service is connected, I'll be able to provide more detailed assistance.",
    suggestions: ['Find a property', 'Check applications', 'Payment help', 'Maintenance help'],
  }
}

const ScoutContext = createContext(null)

/**
 * ScoutProvider
 * Manages open/closed state and conversation history across route transitions
 */
export function ScoutProvider({ children }) {
  const [isScoutOpen, setIsScoutOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const openScout = () => setIsScoutOpen(true)
  const closeScout = () => setIsScoutOpen(false)
  const toggleScout = () => setIsScoutOpen((prev) => !prev)

  const sendMessage = (text) => {
    if (!text.trim()) return

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Simulated typing delay
    setTimeout(() => {
      const responseData = getDemoResponse(text)
      const scoutMessage = {
        id: `scout-${Date.now()}`,
        sender: 'scout',
        text: responseData.text,
        suggestions: responseData.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, scoutMessage])
      setIsTyping(false)
    }, 600)
  }

  const resetConversation = () => {
    setMessages([])
    setIsTyping(false)
  }

  return (
    <ScoutContext.Provider
      value={{
        isScoutOpen,
        openScout,
        closeScout,
        toggleScout,
        messages,
        setMessages,
        isTyping,
        sendMessage,
        resetConversation,
      }}
    >
      {children}
    </ScoutContext.Provider>
  )
}

export function useScout() {
  const context = useContext(ScoutContext)
  if (!context) {
    throw new Error('useScout must be used within a ScoutProvider')
  }
  return context
}
