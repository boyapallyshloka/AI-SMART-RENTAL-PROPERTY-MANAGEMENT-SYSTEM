import axiosClient from './axiosClient'

/**
 * Rent Payments & Invoices API Service (Spring Boot Integration)
 * Note: These are placeholder signatures for future backend integration.
 */

// TODO: Replace with Spring Boot invoices list endpoint (e.g. GET /invoices)
export const getInvoices = async (params) => {
  // return axiosClient.get('/invoices', { params })
  throw new Error('TODO: Connect to Spring Boot backend /invoices')
}

// TODO: Replace with Spring Boot invoice details endpoint (e.g. GET /invoices/{id})
export const getInvoiceById = async (id) => {
  // return axiosClient.get(`/invoices/${id}`)
  throw new Error(`TODO: Connect to Spring Boot backend /invoices/${id}`)
}

// TODO: Replace with Spring Boot invoice creation endpoint (e.g. POST /invoices)
export const createInvoice = async (invoiceData) => {
  // return axiosClient.post('/invoices', invoiceData)
  throw new Error('TODO: Connect to Spring Boot backend /invoices')
}

// TODO: Replace with Spring Boot record payment endpoint (e.g. POST /invoices/{id}/payments)
export const recordPayment = async (id, paymentData) => {
  // return axiosClient.post(`/invoices/${id}/payments`, paymentData)
  throw new Error(`TODO: Connect to Spring Boot backend /invoices/${id}/payments`)
}

// TODO: Replace with Spring Boot receipt download endpoint (e.g. GET /invoices/{id}/receipt)
export const downloadReceipt = async (id) => {
  // return axiosClient.get(`/invoices/${id}/receipt`, { responseType: 'blob' })
  throw new Error(`TODO: Connect to Spring Boot backend /invoices/${id}/receipt`)
}
