import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '../lib/auth'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import FormField from '../components/FormField'
import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'

const schema = z.object({
  email: z.string().email('Neispravan email'),
  password: z.string().min(1, 'Lozinka je obavezna'),
})

type FormValues = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password)
      toast.success('Dobrodošli!')
      navigate('/dashboard')
    } catch (e: any) {
      toast.error(e?.message || 'Greška pri prijavi')
    }
  }

  return (
    <>
      <Navbar />
      <Toasts />
      <section className="auth-page">
        <div className="container">
          <div className="row justify-content-center align-items-center min-vh-100">
            <div className="col-lg-5 col-md-7 col-sm-8">
              <div className="auth-card animate-fade-in">
                <div className="auth-header">
                  <h1 className="auth-title">Dobrodošli nazad</h1>
                  <p className="auth-subtitle">Prijavite se na svoj račun</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
                  <FormField id="email" label="Email adresa" error={errors.email}>
                    <input 
                      id="email" 
                      type="email" 
                      className="form-control-pro" 
                      {...register('email')} 
                      placeholder="vaš@email.com" 
                    />
                  </FormField>
                  
                  <FormField id="password" label="Lozinka" error={errors.password}>
                    <input 
                      id="password" 
                      type="password" 
                      className="form-control-pro" 
                      {...register('password')} 
                      placeholder="Unesite lozinku" 
                    />
                  </FormField>
                  
                  <button className="btn-hero-primary w-100" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Prijavljujem...
                      </>
                    ) : (
                      'Prijavi se'
                    )}
                  </button>
                </form>
                
                <div className="auth-footer">
                  <span className="auth-footer-text">Nemaš račun? </span>
                  <Link to="/register" className="auth-footer-link">
                    Registruj se
                  </Link>
                </div>
                
                <div className="auth-demo">
                  <p className="auth-demo-text">Demo podaci:</p>
                  <div className="auth-demo-accounts">
                    <div className="demo-account">
                      <strong>Trener:</strong> trainer@demo.app / demo123
                    </div>
                    <div className="demo-account">
                      <strong>Klijent:</strong> client@demo.app / demo123
                    </div>
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

export default Login


