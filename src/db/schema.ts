export type Role = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  points: number
  referralCode: string
  referredBy?: string
  createdAt: string
}

export interface Lesson {
  id: string
  title: string
  content: string
}

export interface Course {
  id: string
  title: string
  description: string
  pointsPerLesson: number
  lessons: Lesson[]
}

export interface Progress {
  userId: string
  courseId: string
  lessonId: string
  date: string
}

export type WithdrawalStatus = 'pending' | 'completed' | 'rejected'

export interface Withdrawal {
  id: string
  userId: string
  amount: number
  status: WithdrawalStatus
  method: string
  account: string
  createdAt: string
}

export type TransactionType = 'referral' | 'lesson' | 'withdrawal' | 'refund' | 'admin'

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: TransactionType
  note: string
  createdAt: string
}

export const KEYS = {
  users: 'users',
  courses: 'courses',
  progress: 'progress',
  withdrawals: 'withdrawals',
  transactions: 'transactions',
} as const

export type CollectionKey = (typeof KEYS)[keyof typeof KEYS]

export const POINTS_PER_DOLLAR = 100
export const MIN_WITHDRAWAL = 500
export const REFERRER_REWARD = 500
export const REFEREE_REWARD = 100
