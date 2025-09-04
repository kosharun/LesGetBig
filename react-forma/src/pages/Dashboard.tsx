import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'
import { getCurrentSession } from '../lib/auth'
import Storage from '../data/storage'
import type { ScheduleItem, Plan, Profile, User } from '../data/models'
import { useEffect, useState } from 'react'
import AnimatedCounter from '../components/AnimatedCounter'

export function Dashboard() {
  const session = getCurrentSession()
  const [nextSession, setNextSession] = useState<ScheduleItem | null>(null)
  const [myPlans, setMyPlans] = useState<Plan[]>([])
  const [clientsCount, setClientsCount] = useState<number>(0)
  const [todaySessions, setTodaySessions] = useState<ScheduleItem[]>([])
  


  useEffect(() => {
    ;(async () => {
      if (!session) return
      const schedules = await Storage.getAll<ScheduleItem>('schedules')
      const nowIso = new Date().toISOString().slice(0, 10)
      if (session.role === 'client') {
        const mine = schedules.filter((s) => s.clientId === session.userId)
        const upcoming = mine.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        setNextSession(upcoming[0] || null)
        const plans = await Storage.getAll<Plan>('plans')
        setMyPlans(plans.filter((p) => p.clientId === session.userId))
      } else {
        const users = await Storage.getAll<User>('users')
        const profiles = await Storage.getAll<Profile>('profiles')
        const clientIds = new Set(profiles.map((p) => p.userId))
        setClientsCount(users.filter((u) => clientIds.has(u.id)).length)
        const today = schedules.filter((s) => s.trainerId === session.userId && s.date === nowIso)
        setTodaySessions(today.sort((a, b) => a.time.localeCompare(b.time)))
      }
    })()
  }, [])

  return (
    <>
      <Navbar />
      <Toasts />
      <section className="dashboard-page">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              Dobrodošli, {session?.name}
            </h1>
            <p className="dashboard-subtitle">
              {session?.role === 'trainer' ? 'Upravljajte klijentima i pratite njihov napredak' : 'Pratite svoj napredak i planove'}
            </p>
          </div>

          {session?.role === 'trainer' ? (
            <div className="dashboard-content">
              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="dashboard-metric-card">
                    <div className="metric-icon">
                      <i className="bi bi-people"></i>
                    </div>
                    <div className="metric-content">
                      <div className="metric-value">
                        <AnimatedCounter 
                          value={clientsCount} 
                          duration={1000}
                        />
                      </div>
                      <div className="metric-label">Ukupno klijenata</div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-8">
                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <div className="card-title">
                        <i className="bi bi-calendar-day"></i>
                        <span>Današnji termini</span>
                      </div>
                    </div>
                    <div className="dashboard-card-content">
                      {todaySessions.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">
                            <i className="bi bi-calendar-x"></i>
                          </div>
                          <p className="empty-text">Nema termina danas</p>
                        </div>
                      ) : (
                        <div className="sessions-list">
                          {todaySessions.map((s) => (
                            <div key={s.id} className="session-item">
                              <div className="session-info">
                                <div className="session-title">{s.title || 'Sesija'}</div>
                                <div className="session-date">{s.date}</div>
                              </div>
                              <div className="session-time">{s.time}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-content">
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <div className="card-title">
                        <i className="bi bi-calendar-event"></i>
                        <span>Sljedeća sesija</span>
                      </div>
                    </div>
                    <div className="dashboard-card-content">
                      {nextSession ? (
                        <div className="next-session">
                          <div className="session-label">Nadolazeći termin</div>
                          <div className="session-date-large">{nextSession.date}</div>
                          <div className="session-time-large">{nextSession.time}</div>
                          <div className="session-title-large">{nextSession.title || 'Sesija'}</div>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <div className="empty-icon">
                            <i className="bi bi-calendar-plus"></i>
                          </div>
                          <p className="empty-text">Nema zakazanih sesija</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <div className="card-title">
                        <i className="bi bi-journal-text"></i>
                        <span>Moji planovi</span>
                      </div>
                    </div>
                    <div className="dashboard-card-content">
                      {myPlans.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">
                            <i className="bi bi-plus-circle"></i>
                          </div>
                          <p className="empty-text">Nema planova</p>
                        </div>
                      ) : (
                        <div className="plans-list">
                          {myPlans.map((p) => (
                            <div key={p.id} className="plan-item">
                              <div className="plan-icon">
                                <i className={`bi ${p.type === 'training' ? 'bi-person-arms-up' : 'bi-apple'}`}></i>
                              </div>
                              <div className="plan-info">
                                <div className="plan-title">{p.title}</div>
                                <div className="plan-type">{p.type === 'training' ? 'Trening' : 'Ishrana'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Dashboard


