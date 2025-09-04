import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '../lib/validators'
import { z } from 'zod'
import FormField from '../components/FormField'
import { registerUser } from '../lib/auth'
import Storage from '../data/storage'
import type { Profile } from '../data/models'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'

type FormValues = z.infer<typeof registerSchema>

export function Register() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await registerUser(values.name, values.email, values.role, values.password)
      const profile: Profile = {
        id: Storage.generateId('pro'),
        userId: user.id,
        age: 25,
        heightCm: 175,
        weightKg: 75,
        bio: '',
      }
      await Storage.put('profiles', profile)
      toast.success('Registracija uspješna')
      navigate('/login')
    } catch (e: any) {
      toast.error(e?.message || 'Greška pri registraciji')
    }
  }

  return (
    <>
      <Navbar />
      <Toasts />
      <section className="auth-page">
        <div className="container">
          <div className="row justify-content-center align-items-center min-vh-100">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="auth-card animate-fade-in">
                <div className="auth-header">
                  <h1 className="auth-title">Kreiraj račun</h1>
                  <p className="auth-subtitle">Pridruži se našoj fitness zajednici</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <FormField id="name" label="Puno ime" error={errors.name}>
                        <input 
                          id="name" 
                          className="form-control-pro" 
                          {...register('name')} 
                          placeholder="Unesite ime i prezime"
                        />
                      </FormField>
                    </div>
                    <div className="col-md-6">
                      <FormField id="email" label="Email adresa" error={errors.email}>
                        <input 
                          id="email" 
                          type="email" 
                          className="form-control-pro" 
                          {...register('email')} 
                          placeholder="vaš@email.com"
                        />
                      </FormField>
                    </div>
                  </div>
                  
                  <FormField id="role" label="Tip računa" error={errors.role}>
                    <select id="role" className="form-control-pro" {...register('role')}>
                      <option value="">Odaberi tip računa...</option>
                      <option value="trainer">Trener</option>
                      <option value="client">Klijent</option>
                    </select>
                  </FormField>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <FormField id="password" label="Lozinka" error={errors.password}>
                        <input 
                          id="password" 
                          type="password" 
                          className="form-control-pro" 
                          {...register('password')} 
                          placeholder="Minimalno 6 karaktera"
                        />
                      </FormField>
                    </div>
                    <div className="col-md-6">
                      <FormField id="confirmPassword" label="Potvrdi lozinku" error={errors.confirmPassword}>
                        <input 
                          id="confirmPassword" 
                          type="password" 
                          className="form-control-pro" 
                          {...register('confirmPassword')} 
                          placeholder="Ponovite lozinku"
                        />
                      </FormField>
                    </div>
                  </div>
                  
                  <button className="btn-hero-primary w-100" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Kreiram račun...
                      </>
                    ) : (
                      'Kreiraj račun'
                    )}
                  </button>
                </form>
                
                <div className="auth-footer">
                  <span className="auth-footer-text">Već imaš račun? </span>
                  <Link to="/login" className="auth-footer-link">
                    Prijavi se
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Register


