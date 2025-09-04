import Navbar from '../../components/Navbar'
import { Toasts } from '../../components/Toasts'
import Storage from '../../data/storage'
import type { Profile } from '../../data/models'
import { profileSchema } from '../../lib/validators'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import FormField from '../../components/FormField'
import { getCurrentSession } from '../../lib/auth'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type FormValues = z.infer<typeof profileSchema>

export function MyProfile() {
  const session = getCurrentSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(profileSchema) as any,
  })

  useEffect(() => {
    ;(async () => {
      if (!session) return
      const profiles = await Storage.getAll<Profile>('profiles')
      const mine = profiles.find((p) => p.userId === session.userId)
      if (mine) {
        setProfile(mine)
        reset({
          age: mine.age,
          heightCm: mine.heightCm,
          weightKg: mine.weightKg,
          bio: mine.bio || '',
          avatarUrl: mine.avatarUrl || '',
        })
      }
    })()
  }, [])

  const onSubmit = async (values: FormValues) => {
    if (!profile) return
    const updated: Profile = { ...profile, ...values, bio: values.bio || undefined, avatarUrl: values.avatarUrl || undefined }
    await Storage.put('profiles', updated)
    toast.success('Sačuvano')
  }

  return (
    <>
      <Navbar />
      <Toasts />
      <section className="my-profile-page">
        <div className="container">
          <div className="my-profile-header">
            <h1 className="my-profile-title">Moj profil</h1>
            <p className="my-profile-subtitle">
              Upravljajte svojim profilom i ličnim podacima
            </p>
          </div>

          <div className="my-profile-content">
            {!profile ? (
              <div className="profile-loading">
                <div className="loading-spinner">
                  <div className="spinner-border" role="status"></div>
                </div>
                <p className="loading-text">Učitavanje profila...</p>
              </div>
            ) : (
              <div className="row g-4">
                {/* Profile Preview Card */}
                <div className="col-lg-4">
                  <div className="profile-preview-card">
                    <div className="profile-preview-header">
                      <div className="preview-title">
                        <i className="bi bi-person-circle"></i>
                        <span>Pregled profila</span>
                      </div>
                    </div>
                    
                    <div className="profile-preview-content">
                      <div className="profile-avatar-section">
                        <div className="profile-avatar-large">
                          {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={session?.name} className="avatar-image-large" />
                          ) : (
                            <div className="avatar-placeholder-large">
                              <i className="bi bi-person"></i>
                            </div>
                          )}
                        </div>
                        <div className="profile-name">{session?.name}</div>
                        <div className="profile-role">
                          {session?.role === 'trainer' ? 'Personalni trener' : 'Klijent'}
                        </div>
                      </div>

                      <div className="profile-stats-grid">
                        <div className="stat-card">
                          <div className="stat-icon">
                            <i className="bi bi-calendar3"></i>
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">{profile.age}</div>
                            <div className="stat-label">godina</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon">
                            <i className="bi bi-arrows-vertical"></i>
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">{profile.heightCm}</div>
                            <div className="stat-label">cm</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon">
                            <i className="bi bi-speedometer2"></i>
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">{profile.weightKg}</div>
                            <div className="stat-label">kg</div>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon">
                            <i className="bi bi-calculator"></i>
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">
                              {(profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)}
                            </div>
                            <div className="stat-label">BMI</div>
                          </div>
                        </div>
                      </div>

                      {profile.bio && (
                        <div className="profile-bio-preview">
                          <h4 className="bio-title">O meni</h4>
                          <p className="bio-text">{profile.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Edit Form */}
                <div className="col-lg-8">
                  <div className="profile-edit-card">
                    <div className="edit-card-header">
                      <div className="edit-title">
                        <i className="bi bi-pencil-square"></i>
                        <span>Uredi profil</span>
                      </div>
                    </div>

                    <div className="edit-card-content">
                      <form onSubmit={handleSubmit(onSubmit as any)} noValidate className="profile-edit-form">
                        <div className="form-section">
                          <h3 className="section-title">Osnovni podaci</h3>
                          <div className="row g-3">
                            <div className="col-md-4">
                              <FormField id="age" label="Godine" error={errors.age}>
                                <input 
                                  id="age" 
                                  type="number" 
                                  inputMode="numeric" 
                                  className="form-control-pro" 
                                  step="1" 
                                  min={10} 
                                  max={100} 
                                  {...register('age')} 
                                  placeholder="npr. 28"
                                />
                              </FormField>
                            </div>
                            <div className="col-md-4">
                              <FormField id="heightCm" label="Visina (cm)" error={errors.heightCm}>
                                <input 
                                  id="heightCm" 
                                  type="number" 
                                  inputMode="numeric" 
                                  className="form-control-pro" 
                                  step="1" 
                                  min={100} 
                                  max={250} 
                                  {...register('heightCm')} 
                                  placeholder="npr. 175"
                                />
                              </FormField>
                            </div>
                            <div className="col-md-4">
                              <FormField id="weightKg" label="Trenutna težina (kg)" error={errors.weightKg}>
                                <input 
                                  id="weightKg" 
                                  type="number" 
                                  inputMode="decimal" 
                                  className="form-control-pro" 
                                  step="0.1" 
                                  min={30} 
                                  max={300} 
                                  {...register('weightKg')} 
                                  placeholder="npr. 72.5"
                                />
                              </FormField>
                            </div>
                          </div>
                        </div>

                        <div className="form-section">
                          <h3 className="section-title">O meni</h3>
                          <FormField id="bio" label="Biografija" error={errors.bio as any}>
                            <textarea 
                              id="bio" 
                              className="form-control-pro" 
                              rows={4} 
                              {...register('bio')} 
                              placeholder={session?.role === 'trainer' 
                                ? 'Opišite svoju stručnost, iskustvo i pristup treningu...'
                                : 'Opišite svoje ciljeve, iskustvo s treningom i motivaciju...'
                              }
                            />
                          </FormField>
                        </div>

                        <div className="form-section">
                          <h3 className="section-title">Slika profila</h3>
                          <FormField id="avatarUrl" label="URL slike profila" error={errors.avatarUrl as any}>
                            <input 
                              id="avatarUrl" 
                              className="form-control-pro" 
                              {...register('avatarUrl')} 
                              placeholder="https://example.com/slika.jpg (opcionalno)"
                            />
                          </FormField>
                          <div className="avatar-help">
                            <i className="bi bi-info-circle"></i>
                            <span>Kopirajte URL veze do vaše slike profila</span>
                          </div>
                        </div>

                        <div className="form-actions">
                          <button className="btn-hero-primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Spremam promjene...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-lg me-2"></i>
                                Sačuvaj promjene
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default MyProfile


