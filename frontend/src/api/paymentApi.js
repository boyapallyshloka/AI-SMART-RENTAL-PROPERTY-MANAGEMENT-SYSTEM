import axiosClient from './axiosClient'
import {
  INVOICE_STATUSES,
  getInvoices,
  getInvoiceById,
  getMyInvoices,
  createInvoice,
  getInvoiceDocumentUrl,
  downloadInvoicePdf,
} from './invoiceApi'

/**
 * Payment Statuses matching backend PaymentStatus enum
 */
export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
}

/**
 * Payment Methods matching backend PaymentMethod enum
 */
export const PAYMENT_METHODS = {
  UPI: 'UPI',
  CARD: 'CARD',
  NET_BANKING: 'NET_BANKING',
  WALLET: 'WALLET',
}

/**
 * TENANT ONLY: Create a new pending payment record for an invoice
 * Endpoint: POST /api/payments/create
 *
 * Payload matching PaymentCreateDTO:
 * {
 *   invoiceId: Long (required),
 *   amount: BigDecimal (required, min 0.01),
 *   paymentMethod: PaymentMethod (required: 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET')
 * }
 *
 * @param {Object} payload
 * @param {number|string} payload.invoiceId
 * @param {number|string} payload.amount
 * @param {string} payload.paymentMethod
 * @returns {Promise<Object>} PaymentResponse
 */
export const createPayment = async ({ invoiceId, amount, paymentMethod }) => {
  const requestBody = {
    invoiceId: Number(invoiceId),
    amount: Number(amount),
    paymentMethod: paymentMethod || PAYMENT_METHODS.UPI,
  }
  return await axiosClient.post('/payments/create', requestBody)
}

/**
 * TENANT ONLY: Confirm a pending payment
 * Endpoint: POST /api/payments/confirm/{paymentId}
 *
 * Automatically marks the payment SUCCESS and updates the invoice status to PAID or PARTIALLY_PAID.
 *
 * @param {number|string} paymentId
 * @returns {Promise<Object>} PaymentResponse
 */
export const confirmPayment = async (paymentId) => {
  return await axiosClient.post(`/payments/confirm/${paymentId}`)
}

/**
 * TENANT ONLY: Complete payment flow (Create order -> Confirm payment)
 * Executes sequential creation and confirmation to complete the settlement.
 *
 * @param {Object} params
 * @param {number|string} params.invoiceId
 * @param {number|string} params.amount
 * @param {string} params.paymentMethod
 * @returns {Promise<Object>} Final confirmed PaymentResponse
 */
export const processPayment = async ({ invoiceId, amount, paymentMethod }) => {
  // 1. Create pending payment record
  const createRes = await createPayment({ invoiceId, amount, paymentMethod })
  const pendingPayment = createRes?.data || createRes

  if (!pendingPayment || !pendingPayment.paymentId) {
    throw new Error('Failed to create payment order with the server')
  }

  // 2. Confirm the payment
  const confirmRes = await confirmPayment(pendingPayment.paymentId)
  return confirmRes?.data || confirmRes
}

/**
 * Retrieve a payment record by ID
 * Endpoint: GET /api/payments/{paymentId}
 * Permitted roles: SUPER_ADMIN, PROPERTY_OWNER, PROPERTY_MANAGER, TENANT
 *
 * @param {number|string} paymentId
 * @returns {Promise<Object>} PaymentResponse
 */
export const getPaymentById = async (paymentId) => {
  return await axiosClient.get(`/payments/${paymentId}`)
}

/**
 * Retrieve all payment records for a specific tenant
 * Endpoint: GET /api/payments/tenant/{tenantId}
 * Permitted roles: SUPER_ADMIN, PROPERTY_OWNER, PROPERTY_MANAGER, TENANT
 *
 * @param {number|string} tenantId
 * @returns {Promise<Array<Object>>} List of PaymentResponse
 */
export const getPaymentsByTenant = async (tenantId) => {
  return await axiosClient.get(`/payments/tenant/${tenantId}`)
}

/**
 * Retrieve all payment records for a specific invoice
 * Endpoint: GET /api/payments/invoice/{invoiceId}
 * Permitted roles: SUPER_ADMIN, PROPERTY_OWNER, PROPERTY_MANAGER, TENANT
 *
 * @param {number|string} invoiceId
 * @returns {Promise<Array<Object>>} List of PaymentResponse
 */
export const getPaymentsByInvoice = async (invoiceId) => {
  return await axiosClient.get(`/payments/invoice/${invoiceId}`)
}

/**
 * Download official invoice / payment receipt PDF using authenticated request
 *
 * @param {string} invoiceDocument Path to PDF
 * @param {string} [suggestedFileName] Fallback filename
 * @returns {Promise<void>}
 */
export const downloadInvoiceReceipt = async (invoiceDocument, suggestedFileName) => {
  return await downloadInvoicePdf(invoiceDocument, suggestedFileName)
}

// Re-export invoice APIs for backward compatibility and unified access
export {
  INVOICE_STATUSES,
  getInvoices,
  getInvoiceById,
  getMyInvoices,
  createInvoice,
  getInvoiceDocumentUrl,
  downloadInvoicePdf,
}
