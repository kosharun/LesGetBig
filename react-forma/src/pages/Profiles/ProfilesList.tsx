import Navbar from '../../components/Navbar'
import { Toasts } from '../../components/Toasts'
import Storage from '../../data/storage'
import type { Profile, User } from '../../data/models'
import { useEffect, useMemo, useState } from 'react'

export function ProfilesList() {
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<Array<Profile & { user: User }>>([])

  useEffect(() => {
    ;(async () => {
      const [profiles, users] = await Promise.all([
        Storage.getAll<Profile>('profiles'),
        Storage.getAll<User>('users'),
      ])
      const byId = new Map(users.map((u) => [u.id, u]))
      setRows(profiles.map((p) => ({ ...p, user: byId.get(p.userId)! })).filter(r => !!r.user))
    })()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => r.user.name.toLowerCase().includes(q) || r.user.email.toLowerCase().includes(q))
  }, [query, rows])

  return (
    <>
      <Navbar />
      <Toasts />
      <section className="profiles-page">
        <div className="container">
          <div className="profiles-header">
            <h1 className="profiles-title">Profili klijenata</h1>
            <p className="profiles-subtitle">Pregledajte i upravljajte profilima svojih klijenata</p>
          </div>

          <div className="profiles-controls">
            <div className="search-section">
              <div className="search-box">
                <i className="bi bi-search search-icon"></i>
                <input 
                  className="search-input" 
                  placeholder="Pretražite po imenu ili email adresi..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                />
              </div>
              <div className="results-count">
                {filtered.length} {filtered.length === 1 ? 'profil' : 'profila'}
              </div>
            </div>
          </div>

          <div className="profiles-content">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-people"></i>
                </div>
                <h3 className="empty-title">
                  {query ? 'Nema rezultata' : 'Nema profila'}
                </h3>
                <p className="empty-text">
                  {query 
                    ? 'Pokušajte sa drugim kriterijima pretrage' 
                    : 'Kada se klijenti registruju, njihovi profili će se pojaviti ovdje'
                  }
                </p>
              </div>
            ) : (
              <div className="profiles-grid">
                {filtered.map(p => (
                  <div key={p.id} className="profile-card">
                    <div className="profile-header">
                      <div className="profile-avatar">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.user.name} className="avatar-image" />
                        ) : (
                          <div className="avatar-placeholder">
                            <i className="bi bi-person"></i>
                          </div>
                        )}
                      </div>
                      <div className="profile-info">
                        <h3 className="profile-name">{p.user.name}</h3>
                        <p className="profile-email">{p.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="profile-stats">
                      <div className="stat-item">
                        <div className="stat-value">{p.age}</div>
                        <div className="stat-label">godina</div>
                      </div>
                      <div className="stat-divider"></div>
                      <div className="stat-item">
                        <div className="stat-value">{p.heightCm}</div>
                        <div className="stat-label">cm</div>
                      </div>
                      <div className="stat-divider"></div>
                      <div className="stat-item">
                        <div className="stat-value">{p.weightKg}</div>
                        <div className="stat-label">kg</div>
                      </div>
                    </div>

                    {p.bio && (
                      <div className="profile-bio">
                        <p>{p.bio}</p>
                      </div>
                    )}

                    <div className="profile-actions">
                      <button className="btn-profile-action">
                        <i className="bi bi-eye"></i>
                        <span>Prikaži detalje</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default ProfilesList


