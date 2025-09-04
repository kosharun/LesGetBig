import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'
import Storage from '../data/storage'
import type { ScheduleItem, User } from '../data/models'
import { scheduleSchema } from '../lib/validators'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import FormField from '../components/FormField'
import toast from 'react-hot-toast'
import { getCurrentSession } from '../lib/auth'

type FormValues = z.infer<typeof scheduleSchema>

export function Schedule() {
  const session = getCurrentSession()
  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<ScheduleItem[]>([])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(scheduleSchema),
  })

  useEffect(() => {
    ;(async () => {
      setUsers(await Storage.getAll<User>('users'))
      setItems(await Storage.getAll<ScheduleItem>('schedules'))
    })()
  }, [])

  const myItems = useMemo(() => {
    if (!session) return [] as ScheduleItem[]
    return session.role === 'trainer'
      ? items.filter(i => i.trainerId === session.userId)
      : items.filter(i => i.clientId === session.userId)
  }, [items])

  const onSubmit = async (values: FormValues) => {
    if (!session || session.role !== 'trainer') return
    // Conflict detection for same client/date/time
    const conflict = items.some(i => i.clientId === values.clientId && i.date === values.date && i.time === values.time)
    if (conflict) {
      toast.error('Postoji konflikt termina za klijenta u to vrijeme')
      return
    }
    const item: ScheduleItem = {
      id: Storage.generateId('sch'),
      clientId: values.clientId,
      trainerId: session.userId,
      date: values.date,
      time: values.time,
      title: values.title || undefined,
    }
    await Storage.put('schedules', item)
    setItems(await Storage.getAll<ScheduleItem>('schedules'))
    reset({ clientId: '', date: '', time: '', title: '' })
    toast.success('Termin kreiran')
  }

  const remove = async (id: string) => {
    await Storage.delete('schedules', id)
    setItems(await Storage.getAll<ScheduleItem>('schedules'))
  }

  return (
    <>
      <Navbar />
      <Toasts />
      <section className="schedule-page">
        <div className="container">
          <div className="schedule-header">
            <h1 className="schedule-title">Raspored termina</h1>
            <p className="schedule-subtitle">
              {session?.role === 'trainer' 
                ? 'Upravljajte terminima i zakazujte sesije s klijentima' 
                : 'Pregledajte svoje nadolazeće termine i sesije'
              }
            </p>
          </div>

          <div className="schedule-content">
            <div className="row g-4">
              {session?.role === 'trainer' && (
                <div className="col-lg-4">
                  <div className="schedule-form-card">
                    <div className="form-card-header">
                      <div className="form-icon">
                        <i className="bi bi-calendar-plus"></i>
                      </div>
                      <div>
                        <h3 className="form-title">Novi termin</h3>
                        <p className="form-subtitle">Zakazuje sesiju s klijentom</p>
                      </div>
                    </div>

                    <div className="form-card-content">
                      <form onSubmit={handleSubmit(onSubmit)} noValidate className="schedule-form">
                        <FormField id="clientId" label="Klijent" error={errors.clientId}>
                          <select 
                            id="clientId" 
                            className="form-control-pro" 
                            {...register('clientId')}
                          >
                            <option value="">Odaberi klijenta...</option>
                            {users.filter(u => u.role === 'client').map(u => (
                              <option key={u.id} value={u.id}>
                                👤 {u.name}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <div className="row g-3">
                          <div className="col-md-6">
                            <FormField id="date" label="Datum" error={errors.date}>
                              <input 
                                id="date" 
                                type="date" 
                                className="form-control-pro" 
                                {...register('date')} 
                              />
                            </FormField>
                          </div>
                          <div className="col-md-6">
                            <FormField id="time" label="Vrijeme" error={errors.time}>
                              <input 
                                id="time" 
                                type="time" 
                                className="form-control-pro" 
                                {...register('time')} 
                              />
                            </FormField>
                          </div>
                        </div>

                        <FormField id="title" label="Naslov sesije (opcionalno)">
                          <input 
                            id="title" 
                            className="form-control-pro" 
                            {...register('title')} 
                            placeholder="npr. Trening snage, Kardio sesija..."
                          />
                        </FormField>

                        <button className="btn-hero-primary w-100" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Stvaranje termina...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-calendar-plus me-2"></i>
                              Stvori termin
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className={`col-lg-${session?.role === 'trainer' ? '8' : '12'}`}>
                <div className="schedule-list-card">
                  <div className="list-card-header">
                    <div className="list-info">
                      <h3 className="list-title">
                        <i className="bi bi-calendar-event"></i>
                        {session?.role === 'trainer' ? 'Svi termini' : 'Moji termini'}
                      </h3>
                      <p className="list-subtitle">
                        {myItems.length} {myItems.length === 1 ? 'termin' : 'termina'} zakazano
                      </p>
                    </div>
                    <div className="list-actions">
                      <div className="schedule-count">
                        {myItems.length}
                      </div>
                    </div>
                  </div>

                  <div className="list-card-content">
                    {myItems.length === 0 ? (
                      <div className="schedule-empty-state">
                        <div className="empty-schedule-icon">
                          <i className="bi bi-calendar-x"></i>
                        </div>
                        <h4 className="empty-schedule-title">Nema zakazanih termina</h4>
                        <p className="empty-schedule-text">
                          {session?.role === 'trainer' 
                            ? 'Zakazuje prvi termin koristeći formu s lijeve strane'
                            : 'Vaš trener će zakazati termine koji će se pojaviti ovdje'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="schedule-list">
                        {myItems
                          .sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time))
                          .map((item) => {
                            const client = users.find(u => u.id === item.clientId)
                            const trainer = users.find(u => u.id === item.trainerId)
                            const itemDate = new Date(item.date + 'T' + item.time)
                            const isToday = item.date === new Date().toISOString().slice(0, 10)
                            const isPast = itemDate < new Date()
                            
                            return (
                              <div 
                                key={item.id} 
                                className={`schedule-item ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
                              >
                                <div className="schedule-item-main">
                                  <div className="schedule-icon">
                                    <i className={`bi ${isPast ? 'bi-check-circle' : isToday ? 'bi-clock' : 'bi-calendar-event'}`}></i>
                                  </div>
                                  <div className="schedule-details">
                                    <div className="schedule-title">
                                      {item.title || 'Trening sesija'}
                                    </div>
                                    <div className="schedule-participants">
                                      {session?.role === 'trainer' ? (
                                        <span className="participant">
                                          <i className="bi bi-person"></i>
                                          {client?.name || 'Nepoznat klijent'}
                                        </span>
                                      ) : (
                                        <span className="participant">
                                          <i className="bi bi-person-workspace"></i>
                                          {trainer?.name || 'Nepoznat trener'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="schedule-time">
                                    <div className="time-date">
                                      {new Date(item.date).toLocaleDateString('bs-BA', { 
                                        weekday: 'short', 
                                        day: 'numeric', 
                                        month: 'short' 
                                      })}
                                    </div>
                                    <div className="time-hour">
                                      {item.time}
                                    </div>
                                  </div>
                                </div>
                                {session?.role === 'trainer' && (
                                  <div className="schedule-actions">
                                    <button 
                                      className="btn-delete-schedule" 
                                      onClick={() => remove(item.id)}
                                      title="Obriši termin"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                )}
                                {isToday && (
                                  <div className="today-badge">
                                    Danas
                                  </div>
                                )}
                              </div>
                            )
                          })
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Schedule


