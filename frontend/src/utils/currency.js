/**
 * Currency formatting utility for Indian Rupee (INR / ₹)
 * Consistently formats monetary values using Indian numbering system
 */

export const formatCurrency = (amount, options = {}) => {
  const num = Number(amount ?? 0)
  if (isNaN(num)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    ...options,
  }).format(num)
}

export const formatINR = (amount) => {
  const num = Number(amount ?? 0)
  if (isNaN(num)) return '₹0'
  return `₹${num.toLocaleString('en-IN')}`
}

export default formatCurrency
