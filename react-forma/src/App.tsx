import { Outlet } from 'react-router-dom'
import './App.css'
import './styles/professional-design.css'
import { useEffect } from 'react'
import { seedIfNeeded } from './data/seed'

function App() {
  useEffect(() => {
    seedIfNeeded()
  }, [])
  return (
    <div className="min-vh-100 d-flex flex-column animate-fade-in">
      <Outlet />
    </div>
  )
}

export default App
