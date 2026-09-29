/**
 * Utility: Formatters
 * Common formatting helpers used across the Smart Farming app
 */

/** Format a number with commas  e.g. 1234567 → "1,23,567" */
export const formatNumber = (num) =>
    new Intl.NumberFormat('en-IN').format(num)

/** Format currency in INR  e.g. 5000 → "₹5,000" */
export const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

/** Format a date to readable form  e.g. new Date() → "10 Mar 2026" */
export const formatDate = (date) =>
    new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))

/** Format a percentage value  e.g. 0.823 → "82.3%" */
export const formatPercent = (value, decimals = 1) =>
    `${(value * 100).toFixed(decimals)}%`

/** Clamp a number between min and max */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

/** Get relative time  e.g. "2 hours ago" */
export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
}
