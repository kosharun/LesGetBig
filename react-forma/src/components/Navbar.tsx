import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

type Session = {
  userId: string
  role: 'trainer' | 'client'
  name: string
  email: string
}

function getSession(): Session | null {
  const raw = sessionStorage.getItem('forma-session')
  if (!raw) return null
  try { return JSON.parse(raw) as Session } catch { return null }
}

export function Navbar() {
  const navigate = useNavigate()
  const session = getSession()

  useEffect(() => {
    // Always apply light theme
    document.documentElement.setAttribute('data-bs-theme', 'light')
    localStorage.setItem('forma-theme', 'light')
  }, [])

  function logout() {
    sessionStorage.removeItem('forma-session')
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg pro-navbar">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">Forma+</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="mainNav" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {session && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/dashboard">Dashboard</NavLink></li>
                {session.role === 'trainer' && (
                  <>
                    <li className="nav-item"><NavLink className="nav-link" to="/profiles">Profili</NavLink></li>
                    <li className="nav-item"><NavLink className="nav-link" to="/plans">Planovi</NavLink></li>
                  </>
                )}
                <li className="nav-item"><NavLink className="nav-link" to="/schedule">Raspored</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/progress">Napredak</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/chat">Chat</NavLink></li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {session ? (
              <>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    {session.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><NavLink className="dropdown-item" to="/profiles/me">Moj profil</NavLink></li>
                    <li><NavLink className="dropdown-item" to="/settings">Postavke</NavLink></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={logout}>Odjava</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/login">Prijava</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/register">Registracija</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


