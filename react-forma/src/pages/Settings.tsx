import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'

export function Settings() {
  return (
    <>
      <Navbar />
      <Toasts />
      <div className="container py-4">
        <h1 className="h4 mb-3">Postavke</h1>
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3">
              <div>Tema: Light (aktivna)</div>
              <div className="badge bg-primary">Svjetla tema</div>
            </div>
            <small className="text-muted">Aplikacija koristi svjetlu temu za najbolje korisničko iskustvo.</small>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings


