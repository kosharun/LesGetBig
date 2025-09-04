export type Role = 'trainer' | 'client'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  passwordHash: string
}

export interface Profile {
  id: string
  userId: string
  age: number
  heightCm: number
  weightKg: number
  bio?: string
  avatarUrl?: string
  goals?: string
}

export interface Workout { id: string; userId: string; title: string; details?: string }
export interface Nutrition { id: string; userId: string; title: string; details?: string }

export interface ScheduleItem {
  id: string
  clientId: string
  trainerId: string
  date: string // ISO date
  time: string // HH:mm
  title?: string
}

export type ProgressMetric = 'weightKg' | 'bodyFatPercent' | 'chestCm' | 'waistCm'
export interface ProgressEntry {
  id: string
  userId: string
  date: string
  metric: ProgressMetric
  value: number
}

export type PlanType = 'training' | 'nutrition'
export interface Plan {
  id: string
  clientId: string
  trainerId: string
  type: PlanType
  title: string
  details?: string
}

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  timestamp: number
  text: string
}

export type StoreName =
  | 'users'
  | 'profiles'
  | 'workouts'
  | 'nutrition'
  | 'schedules'
  | 'progress'
  | 'messages'
  | 'plans'


