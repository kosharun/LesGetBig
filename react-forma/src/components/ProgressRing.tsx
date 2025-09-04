import { useEffect, useState } from 'react'

interface Props {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  duration?: number
  label?: string
  value?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = 'rgba(102, 126, 234, 1)',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  duration = 1000,
  label,
  value
}: Props) {
  const [currentPercentage, setCurrentPercentage] = useState(0)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const center = size / 2

  useEffect(() => {
    const startTime = Date.now()
    const targetPercentage = Math.min(Math.max(percentage, 0), 100)

    const updatePercentage = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const interpolatedPercentage = targetPercentage * easeOut
      setCurrentPercentage(interpolatedPercentage)
      
      if (progress < 1) {
        requestAnimationFrame(updatePercentage)
      } else {
        setCurrentPercentage(targetPercentage)
      }
    }

    // Start animation after a small delay
    const timer = setTimeout(() => {
      requestAnimationFrame(updatePercentage)
    }, 100)

    return () => clearTimeout(timer)
  }, [percentage, duration])

  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (currentPercentage / 100) * circumference

  return (
    <div className="progress-ring-container d-flex flex-column align-items-center">
      <div className="position-relative">
        <svg
          width={size}
          height={size}
          className="progress-ring"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s ease',
              filter: 'drop-shadow(0 0 8px rgba(102, 126, 234, 0.3))'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div 
          className="position-absolute top-50 start-50 translate-middle text-center"
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-white fw-bold" style={{ fontSize: `${size * 0.15}px` }}>
            {Math.round(currentPercentage)}%
          </div>
          {value && (
            <div className="text-white-50" style={{ fontSize: `${size * 0.08}px` }}>
              {value}
            </div>
          )}
        </div>
      </div>
      
      {label && (
        <div className="text-white-50 text-center mt-2 small">
          {label}
        </div>
      )}
    </div>
  )
}

export default ProgressRing
