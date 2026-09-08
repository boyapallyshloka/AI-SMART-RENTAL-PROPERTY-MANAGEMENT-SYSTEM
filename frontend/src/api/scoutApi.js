/**
 * SCOUT Assistant API Service (Preparation for Future Spring Boot Backend Integration)
 *
 * Intended Future Architecture:
 * ----------------------------------------------------
 * SCOUT UI (React components)
 *   ↓
 * scoutApi.js (Frontend client abstraction)
 *   ↓
 * Future Spring Boot backend (/api/scout or /api/ai/scout)
 *   ↓
 * SCOUT / AI service (LLM / RAG / Enterprise Knowledge Base)
 *   ↓
 * Response
 *   ↓
 * SCOUT UI
 * ----------------------------------------------------
 *
 * NOTE:
 * - This file is strictly preparation for future backend integration.
 * - Do NOT make actual network requests or guess production endpoints yet.
 * - Currently running in frontend-only mock/demo mode.
 */

// TODO: Replace with Spring Boot SCOUT chat completion endpoint when backend is available
export const sendScoutMessage = async (message, sessionContext = {}) => {
  // Example future implementation:
  // return axiosClient.post('/scout/chat', { message, role: sessionContext.role, sessionId: sessionContext.sessionId })
  throw new Error('TODO: Connect to Spring Boot backend SCOUT API endpoint.')
}

// TODO: Replace with Spring Boot SCOUT conversation history retrieval endpoint
export const getScoutConversationHistory = async (sessionId) => {
  // Example future implementation:
  // return axiosClient.get(`/scout/conversations/${sessionId}`)
  throw new Error('TODO: Connect to Spring Boot backend conversation history endpoint.')
}

// TODO: Replace with Spring Boot SCOUT conversation reset/delete endpoint
export const clearScoutConversation = async (sessionId) => {
  // Example future implementation:
  // return axiosClient.delete(`/scout/conversations/${sessionId}`)
  throw new Error('TODO: Connect to Spring Boot backend conversation clear endpoint.')
}

// TODO: Replace with Spring Boot role-specific suggested actions endpoint
export const getScoutQuickActions = async (role) => {
  // Example future implementation:
  // return axiosClient.get(`/scout/quick-actions?role=${role}`)
  throw new Error('TODO: Connect to Spring Boot backend quick-actions endpoint.')
}

// TODO: Replace with Spring Boot SCOUT service health/readiness endpoint
export const getScoutHealthStatus = async () => {
  // Example future implementation:
  // return axiosClient.get('/scout/health')
  throw new Error('TODO: Connect to Spring Boot backend SCOUT health check.')
}
