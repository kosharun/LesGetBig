import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'
import Storage from '../data/storage'
import type { ProgressEntry, ProgressMetric, User } from '../data/models'
import { progressSchema } from '../lib/validators'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import FormField from '../components/FormField'
import toast from 'react-hot-toast'
import { getCurrentSession } from '../lib/auth'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js'
import PDFExport from '../components/PDFExport'
import { achievementTriggers } from '../store/achievements'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type FormValues = z.infer<typeof progressSchema>

export function Progress() {
  const session = getCurrentSession()
  const [metric, setMetric] = useState<ProgressMetric>('weightKg')
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [clientId, setClientId] = useState<string>('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: { metric: 'weightKg' as ProgressMetric },
  })

  useEffect(() => {
    ;(async () => {
      if (!session) return
      const [all, allUsers] = await Promise.all([
        Storage.getAll<ProgressEntry>('progress'),
        Storage.getAll<User>('users'),
      ])
      setUsers(allUsers)
      if (session.role === 'trainer') {
        setEntries(all)
      } else {
        setEntries(all.filter(e => e.userId === session.userId))
      }
    })()
  }, [])

  const targetUserId = session?.role === 'trainer' ? clientId : session?.userId

  const data = useMemo(() => {
    const list = entries
      .filter(e => (!targetUserId || e.userId === targetUserId))
      .filter(e => e.metric === metric)
      .sort((a,b) => a.date.localeCompare(b.date))
    return {
      labels: list.map(e => e.date),
      datasets: [
        {
          label: metric === 'weightKg' ? 'Težina (kg)' : metric === 'bodyFatPercent' ? 'Body fat (%)' : metric === 'chestCm' ? 'Grudi (cm)' : 'Struk (cm)',
          data: list.map(e => e.value),
          borderColor: 'rgb(13,110,253)',
          backgroundColor: 'rgba(13,110,253,0.2)'
        },
      ],
    }
  }, [entries, metric, targetUserId])

  const onSubmit = async (values: FormValues) => {
    if (!session) return
    const effectiveUserId = session.role === 'trainer' ? clientId : session.userId
    if (session.role === 'trainer' && !clientId) {
      toast.error('Odaberite klijenta')
      return
    }
    const entry: ProgressEntry = {
      id: Storage.generateId('prg'),
      userId: effectiveUserId,
      date: values.date,
      metric: values.metric,
      value: values.value,
    }
    await Storage.put('progress', entry)
    const updated = await Storage.getAll<ProgressEntry>('progress')
    setEntries(updated)
    setMetric(values.metric)
    reset({ date: '', metric: values.metric, value: 0 as any })
    
    // Trigger achievement
    achievementTriggers.onProgressEntry()
    
    toast.success('Uneseno')
  }

  return (
    <>
      <Navbar />
      <Toasts />
      <section className="progress-page">
        <div className="container">
          <div className="progress-header">
            <h1 className="progress-title">Praćenje napretka</h1>
            <p className="progress-subtitle">
              {session?.role === 'trainer' 
                ? 'Pratite napredak svojih klijenata i analizirajte trendove' 
                : 'Pratite svoj napredak i ostvarite svoje fitnes ciljeve'
              }
            </p>
          </div>

          <div className="progress-content">
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="progress-form-card">
                  <div className="form-card-header">
                    <div className="form-icon">
                      <i className="bi bi-plus-circle"></i>
                    </div>
                    <div>
                      <h3 className="form-title">Novo mjerenje</h3>
                      <p className="form-subtitle">Dodajte novo mjerenje napretka</p>
                    </div>
                  </div>

                  <div className="form-card-content">
                    {session?.role === 'trainer' && (
                      <div className="client-selector">
                        <label htmlFor="clientPick" className="form-label-pro">Klijent</label>
                        <select 
                          id="clientPick" 
                          className="form-control-pro" 
                          value={clientId} 
                          onChange={(e) => setClientId(e.target.value)}
                        >
                          <option value="">Odaberi klijenta...</option>
                          {users.filter(u => u.role === 'client').map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="progress-form">
                      <FormField id="date" label="Datum" error={errors.date}>
                        <input 
                          id="date" 
                          type="date" 
                          className="form-control-pro" 
                          {...register('date')} 
                        />
                      </FormField>

                      <FormField id="metric" label="Tip mjerenja" error={errors.metric}>
                        <select 
                          id="metric" 
                          className="form-control-pro" 
                          {...register('metric')} 
                          onChange={(e) => setMetric(e.target.value as ProgressMetric)}
                        >
                          <option value="weightKg">💪 Težina (kg)</option>
                          <option value="bodyFatPercent">📊 Body fat (%)</option>
                          <option value="chestCm">📏 Grudi (cm)</option>
                          <option value="waistCm">📐 Struk (cm)</option>
                        </select>
                      </FormField>

                      <FormField id="value" label="Vrijednost" error={errors.value}>
                        <input 
                          id="value" 
                          type="number" 
                          inputMode="decimal" 
                          step="0.1" 
                          min={0} 
                          className="form-control-pro" 
                          {...register('value')} 
                          placeholder="Unesite vrijednost" 
                        />
                      </FormField>

                      <button className="btn-hero-primary w-100" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Spremanje...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-lg me-2"></i>
                            Dodaj mjerenje
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-lg-8">
                <div className="chart-card">
                  <div className="chart-card-header">
                    <div className="chart-info">
                      <h3 className="chart-title">
                        <i className="bi bi-graph-up-arrow"></i>
                        Trend napretka
                      </h3>
                      <p className="chart-subtitle">
                        {metric === 'weightKg' ? 'Težina' : 
                         metric === 'bodyFatPercent' ? 'Body fat procenat' : 
                         metric === 'chestCm' ? 'Obim grudi' : 'Obim struka'}
                      </p>
                    </div>
                    <div className="chart-actions">
                      <PDFExport 
                        progressData={entries.filter(e => (!targetUserId || e.userId === targetUserId))}
                        fileName="napredak-izvještaj"
                        title="Izvještaj o napretku"
                        className="btn-chart-export"
                      />
                    </div>
                  </div>

                  <div className="chart-card-content">
                    {data.labels.length === 0 ? (
                      <div className="chart-empty-state">
                        <div className="empty-chart-icon">
                          <i className="bi bi-graph-up"></i>
                        </div>
                        <h4 className="empty-chart-title">Nema podataka za prikaz</h4>
                        <p className="empty-chart-text">
                          {session?.role === 'trainer' && !clientId 
                            ? 'Odaberite klijenta da vidite njegov napredak'
                            : 'Dodajte prvo mjerenje da biste videli grafik napretka'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="chart-wrapper">
                        <div className="chart-stats">
                          <div className="stat-item">
                            <div className="stat-value">{data.labels.length}</div>
                            <div className="stat-label">Mjerenja</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">
                              {data.datasets[0]?.data.length > 1 ? (
                                <>
                                  {data.datasets[0].data[data.datasets[0].data.length - 1] > data.datasets[0].data[0] ? (
                                    <span className="trend-up">↗</span>
                                  ) : (
                                    <span className="trend-down">↘</span>
                                  )}
                                </>
                              ) : '-'}
                            </div>
                            <div className="stat-label">Trend</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">
                              {data.datasets[0]?.data.length > 0 
                                ? data.datasets[0].data[data.datasets[0].data.length - 1]
                                : 0
                              }
                            </div>
                            <div className="stat-label">Trenutno</div>
                          </div>
                        </div>
                        
                        <div className="chart-container">
                          <Line 
                            data={{
                              ...data,
                              datasets: data.datasets.map(dataset => ({
                                ...dataset,
                                borderColor: 'rgba(37, 99, 235, 1)',
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                borderWidth: 3,
                                pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 3,
                                pointRadius: 6,
                                pointHoverRadius: 8,
                                tension: 0.4,
                                fill: true,
                              }))
                            }}
                            options={{ 
                              responsive: true, 
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleColor: 'white',
                                  bodyColor: 'white',
                                  borderColor: 'rgba(37, 99, 235, 1)',
                                  borderWidth: 1,
                                  cornerRadius: 8,
                                  displayColors: false,
                                }
                              },
                              scales: {
                                x: { 
                                  ticks: { 
                                    color: 'rgba(107, 114, 128, 1)',
                                    font: { size: 12 }
                                  },
                                  grid: { 
                                    color: 'rgba(229, 231, 235, 1)',
                                    borderColor: 'rgba(229, 231, 235, 1)'
                                  }
                                },
                                y: { 
                                  ticks: { 
                                    color: 'rgba(107, 114, 128, 1)',
                                    font: { size: 12 }
                                  },
                                  grid: { 
                                    color: 'rgba(229, 231, 235, 1)',
                                    borderColor: 'rgba(229, 231, 235, 1)'
                                  }
                                }
                              },
                              interaction: {
                                intersect: false,
                                mode: 'index'
                              }
                            }} 
                          />
                        </div>
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

export default Progress


