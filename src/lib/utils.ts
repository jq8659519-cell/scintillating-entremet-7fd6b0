import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { POINTS_PER_DOLLAR } from '../db/schema'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPoints(points: number) {
  return new Intl.NumberFormat('en-US').format(points)
}

export function pointsToCurrency(points: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(points / POINTS_PER_DOLLAR)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}
