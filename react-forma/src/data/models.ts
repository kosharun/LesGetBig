export type Role = 'trainer' | 'client'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  passwordHash: string
  [key: string]: unknown
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
  [key: string]: unknown
}

export interface Workout { 
  id: string; 
  userId: string; 
  title: string; 
  details?: string;
  [key: string]: unknown;
}

export interface Nutrition { 
  id: string; 
  userId: string; 
  title: string; 
  details?: string;
  [key: string]: unknown;
}

export interface ScheduleItem {
  id: string
  clientId: string
  trainerId: string
  date: string // ISO date
  time: string // HH:mm
  title?: string
  [key: string]: unknown
}

export type ProgressMetric = 'weightKg' | 'bodyFatPercent' | 'chestCm' | 'waistCm'
export interface ProgressEntry {
  id: string
  userId: string
  date: string
  metric: ProgressMetric
  value: number
  [key: string]: unknown
}

export type PlanType = 'training' | 'nutrition'
export interface Plan {
  id: string
  clientId: string
  trainerId: string
  type: PlanType
  title: string
  details?: string
  [key: string]: unknown
}

export interface Message {
  id: string
  fromUserId: string
  toUserId: string
  timestamp: number
  text: string
  [key: string]: unknown
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


