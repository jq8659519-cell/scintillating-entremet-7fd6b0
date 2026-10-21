import { db } from './localDB'
import {
  KEYS,
  MIN_WITHDRAWAL,
  REFEREE_REWARD,
  REFERRER_REWARD,
  type Course,
  type Role,
  type Transaction,
  type TransactionType,
  type User,
  type Withdrawal,
  type WithdrawalStatus,
} from './schema'

export class ServiceError extends Error {}

export async function hashPassword(password: string) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateReferralCode() {
  const users = db.get<User>(KEYS.users)
  let code = ''
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
  } while (users.some((u) => u.referralCode === code))
  return code
}

function makeTransaction(userId: string, amount: number, type: TransactionType, note: string): Transaction {
  return { id: crypto.randomUUID(), userId, amount, type, note, createdAt: new Date().toISOString() }
}

function addTransactions(...txs: Transaction[]) {
  db.save(KEYS.transactions, [...db.get<Transaction>(KEYS.transactions), ...txs])
}

export async function registerUser(input: {
  name: string
  email: string
  password: string
  refCode?: string
  role?: Role
}) {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (!name) throw new ServiceError('Name is required')
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ServiceError('Enter a valid email address')
  if (input.password.length < 6) throw new ServiceError('Password must be at least 6 characters')
  if (db.findUser(email)) throw new ServiceError('An account with this email already exists')

  const users = db.get<User>(KEYS.users)
  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: await hashPassword(input.password),
    role: input.role ?? 'user',
    points: 0,
    referralCode: generateReferralCode(),
    createdAt: new Date().toISOString(),
  }

  const txs: Transaction[] = []
  let updatedUsers = users
  const refCode = input.refCode?.trim().toUpperCase()

  if (refCode) {
    const referrer = users.find((u) => u.referralCode === refCode)
    if (!referrer) throw new ServiceError('Referral code not found')
    updatedUsers = users.map((u) =>
      u.id === referrer.id ? { ...u, points: u.points + REFERRER_REWARD } : u,
    )
    newUser.points += REFEREE_REWARD
    newUser.referredBy = referrer.id
    txs.push(
      makeTransaction(referrer.id, REFERRER_REWARD, 'referral', `Referral bonus: ${newUser.name} joined`),
      makeTransaction(newUser.id, REFEREE_REWARD, 'referral', `Welcome bonus via code ${refCode}`),
    )
  }

  db.save(KEYS.users, [...updatedUsers, newUser])
  if (txs.length) addTransactions(...txs)
  return newUser
}

export async function loginUser(email: string, password: string) {
  const user = db.findUser(email)
  if (!user || user.passwordHash !== (await hashPassword(password))) {
    throw new ServiceError('Invalid email or password')
  }
  return user
}

export function completeLesson(userId: string, courseId: string, lessonId: string) {
  const course = db.get<Course>(KEYS.courses).find((c) => c.id === courseId)
  const user = db.findUserById(userId)
  if (!course || !user) return false
  const lesson = course.lessons.find((l) => l.id === lessonId)
  if (!lesson) return false

  const isNew = db.updateProgress(userId, courseId, lessonId)
  if (isNew && course.pointsPerLesson > 0) {
    db.updateUser(userId, { points: user.points + course.pointsPerLesson })
    addTransactions(
      makeTransaction(userId, course.pointsPerLesson, 'lesson', `Completed "${lesson.title}"`),
    )
  }
  return isNew
}

export function requestWithdrawal(userId: string, amount: number, method: string, account: string) {
  const user = db.findUserById(userId)
  if (!user) throw new ServiceError('User not found')
  if (!Number.isInteger(amount) || amount <= 0) throw new ServiceError('Enter a whole number of points')
  if (amount < MIN_WITHDRAWAL) throw new ServiceError(`Minimum withdrawal is ${MIN_WITHDRAWAL} points`)
  if (user.points < amount) throw new ServiceError('Insufficient balance')
  if (!method.trim() || !account.trim()) throw new ServiceError('Payout method and account are required')

  const withdrawal: Withdrawal = {
    id: Date.now().toString(),
    userId,
    amount,
    status: 'pending',
    method: method.trim(),
    account: account.trim(),
    createdAt: new Date().toISOString(),
  }

  db.updateUser(userId, { points: user.points - amount })
  db.save(KEYS.withdrawals, [...db.get<Withdrawal>(KEYS.withdrawals), withdrawal])
  addTransactions(makeTransaction(userId, -amount, 'withdrawal', `Withdrawal request via ${withdrawal.method}`))
  return withdrawal
}

export function reviewWithdrawal(id: string, status: Exclude<WithdrawalStatus, 'pending'>) {
  const withdrawals = db.get<Withdrawal>(KEYS.withdrawals)
  const target = withdrawals.find((w) => w.id === id)
  if (!target || target.status !== 'pending') return

  db.save(
    KEYS.withdrawals,
    withdrawals.map((w) => (w.id === id ? { ...w, status } : w)),
  )

  if (status === 'rejected') {
    const user = db.findUserById(target.userId)
    if (user) {
      db.updateUser(user.id, { points: user.points + target.amount })
      addTransactions(makeTransaction(user.id, target.amount, 'refund', 'Withdrawal rejected — points refunded'))
    }
  }
}

export function adjustPoints(userId: string, delta: number, note: string) {
  const user = db.findUserById(userId)
  if (!user) throw new ServiceError('User not found')
  if (!Number.isInteger(delta) || delta === 0) throw new ServiceError('Enter a non-zero whole number')
  if (user.points + delta < 0) throw new ServiceError('Balance cannot go below zero')
  db.updateUser(userId, { points: user.points + delta })
  addTransactions(makeTransaction(userId, delta, 'admin', note.trim() || (delta > 0 ? 'Manual credit' : 'Manual debit')))
}

export function setUserRole(userId: string, role: Role) {
  db.updateUser(userId, { role })
}

export function deleteUser(userId: string) {
  db.save(KEYS.users, db.get<User>(KEYS.users).filter((u) => u.id !== userId))
}

export function saveCourse(course: Course) {
  const courses = db.get<Course>(KEYS.courses)
  const exists = courses.some((c) => c.id === course.id)
  db.save(KEYS.courses, exists ? courses.map((c) => (c.id === course.id ? course : c)) : [...courses, course])
}

export function deleteCourse(courseId: string) {
  db.save(KEYS.courses, db.get<Course>(KEYS.courses).filter((c) => c.id !== courseId))
}

export function parseCourseJSON(json: string): Course {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new ServiceError('Invalid JSON')
  }
  const obj = data as Partial<Course>
  if (!obj || typeof obj.title !== 'string' || !obj.title.trim()) throw new ServiceError('"title" is required')
  if (!Array.isArray(obj.lessons) || obj.lessons.length === 0) throw new ServiceError('"lessons" must be a non-empty array')
  const lessons = obj.lessons.map((l, i) => {
    if (!l || typeof l.title !== 'string' || typeof l.content !== 'string') {
      throw new ServiceError(`Lesson ${i + 1} needs "title" and "content" strings`)
    }
    return { id: typeof l.id === 'string' && l.id ? l.id : crypto.randomUUID(), title: l.title, content: l.content }
  })
  return {
    id: typeof obj.id === 'string' && obj.id ? obj.id : crypto.randomUUID(),
    title: obj.title.trim(),
    description: typeof obj.description === 'string' ? obj.description : '',
    pointsPerLesson: typeof obj.pointsPerLesson === 'number' && obj.pointsPerLesson >= 0 ? Math.floor(obj.pointsPerLesson) : 10,
    lessons,
  }
}
