import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, 'Ime je obavezno'),
  email: z.string().email('Neispravan email'),
  role: z.enum(['trainer', 'client'], { required_error: 'Uloga je obavezna' }),
  password: z.string().min(6, 'Min 6 karaktera'),
  confirmPassword: z.string().min(6, 'Potvrda lozinke je obavezna'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Lozinke se ne poklapaju',
  path: ['confirmPassword'],
})

export const profileSchema = z.object({
  age: z.coerce.number().min(10).max(100),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(30).max(300),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().url('Neispravan URL').optional().or(z.literal('')),
})

export const scheduleSchema = z.object({
  clientId: z.string().min(1, 'Klijent je obavezan'),
  date: z.string().min(1, 'Datum je obavezan'),
  time: z.string().min(1, 'Vrijeme je obavezno'),
  title: z.string().optional(),
})

export const progressSchema = z.object({
  date: z.string().min(1, 'Datum je obavezan'),
  metric: z.enum(['weightKg', 'bodyFatPercent', 'chestCm', 'waistCm']),
  value: z.coerce.number().min(0),
})

export const planSchema = z.object({
  clientId: z.string().min(1, 'Klijent je obavezan'),
  type: z.enum(['training', 'nutrition']),
  title: z.string().min(1, 'Naslov je obavezan'),
  details: z.string().optional(),
})


