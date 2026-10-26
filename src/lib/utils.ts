import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS class names, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a currency amount.
 * @param amount - The numeric amount
 * @param currency - The currency code (default: TZS)
 */
export function formatCurrency(amount: number, currency = "TZS"): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/**
 * Formats a date to a human-readable string.
 * @param date - The date to format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Formats a duration in hours to a human-readable string.
 * @param hours - The duration in hours
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`
  } else if (hours < 24) {
    return hours === 1 ? "1 hour" : `${hours} hours`
  } else if (hours < 168) {
    const days = Math.round(hours / 24)
    return days === 1 ? "1 day" : `${days} days`
  } else {
    const weeks = Math.round(hours / 168)
    return weeks === 1 ? "1 week" : `${weeks} weeks`
  }
}

/**
 * Formats a data limit in MB to a human-readable string.
 * @param mb - The data limit in megabytes
 */
export function formatDataLimit(mb: number): string {
  if (mb < 1024) {
    return `${mb} MB`
  } else {
    const gb = mb / 1024
    return `${gb % 1 === 0 ? gb : gb.toFixed(1)} GB`
  }
}
