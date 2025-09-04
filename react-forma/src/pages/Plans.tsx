import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'
import Storage from '../data/storage'
import type { Plan, PlanType, User } from '../data/models'
import { planSchema } from '../lib/validators'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import FormField from '../components/FormField'
import toast from 'react-hot-toast'
import { getCurrentSession } from '../lib/auth'

type FormValues = z.infer<typeof planSchema>

export function Plans() {
  const session = getCurrentSession()
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(planSchema),
  })

  useEffect(() => {
    ;(async () => {
      setUsers(await Storage.getAll<User>('users'))
      setPlans(await Storage.getAll<Plan>('plans'))
    })()
  }, [])

  const mine = useMemo(() => {
    if (!session) return [] as Plan[]
    return session.role === 'trainer'
      ? plans.filter(p => p.trainerId === session.userId)
      : plans.filter(p => p.clientId === session.userId)
  }, [plans])

  const onSubmit = async (values: FormValues) => {
    if (!session || session.role !== 'trainer') return
    const plan: Plan = {
      id: Storage.generateId('pln'),
      clientId: values.clientId,
      trainerId: session.userId,
      type: values.type,
      title: values.title,
      details: values.details || undefined,
    }
    await Storage.put('plans', plan)
    setPlans(await Storage.getAll<Plan>('plans'))
    reset({ clientId: '', type: 'training' as PlanType, title: '', details: '' })
    toast.success('Plan kreiran')
  }

  const remove = async (id: string) => {
    await Storage.delete('plans', id)
    setPlans(await Storage.getAll<Plan>('plans'))
  }

  return (
    <>
      <Navbar />
      <Toasts />
      <div className="container py-4">
        <div className="row g-4">
          {session?.role === 'trainer' && (
            <div className="col-lg-5">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Novi plan</h5>
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FormField id="clientId" label="Klijent" error={errors.clientId}>
                      <select id="clientId" className="form-select" {...register('clientId')}>
                        <option value="">Odaberi klijenta...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField id="type" label="Tip" error={errors.type}>
                      <select id="type" className="form-select" {...register('type')}>
                        <option value="training">Trening</option>
                        <option value="nutrition">Ishrana</option>
                      </select>
                    </FormField>
                    <FormField id="title" label="Naslov" error={errors.title}>
                      <input id="title" className="form-control" {...register('title')} />
                    </FormField>
                    <FormField id="details" label="Detalji">
                      <textarea id="details" rows={4} className="form-control" {...register('details')} />
                    </FormField>
                    <button className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Spremanje...' : 'Kreiraj'}</button>
                  </form>
                </div>
              </div>
            </div>
          )}
          <div className="col-lg">
            <div className="row g-3">
              {mine.map(p => (
                <div key={p.id} className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{p.type === 'training' ? 'Trening' : 'Ishrana'} — {p.title}</h5>
                      <div className="flex-grow-1" style={{ whiteSpace: 'pre-wrap' }}>{p.details}</div>
                      {session?.role === 'trainer' && (
                        <button className="btn btn-outline-danger mt-3 align-self-start" onClick={() => remove(p.id)}>Obriši</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {mine.length === 0 && (
                <div className="col-12">
                  <div className="card card-empty">
                    <div className="card-body text-center text-muted">Nema planova.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Plans


