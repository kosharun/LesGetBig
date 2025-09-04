import { useEffect, useState } from 'react'

interface Props {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  style?: React.CSSProperties
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  prefix = "", 
  suffix = "",
  className = "",
  style = {}
}: Props) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    const startValue = 0
    const endValue = value
    const startTime = Date.now()

    const updateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const interpolatedValue = startValue + (endValue - startValue) * easeOut
      setCurrentValue(Math.round(interpolatedValue * 10) / 10) // Round to 1 decimal
      
      if (progress < 1) {
        requestAnimationFrame(updateValue)
      } else {
        setCurrentValue(endValue)
      }
    }

    // Start animation after a small delay for better visual effect
    const timer = setTimeout(() => {
      requestAnimationFrame(updateValue)
    }, 100)

    return () => clearTimeout(timer)
  }, [value, duration])

  const formatValue = (val: number) => {
    // Format numbers nicely
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'k'
    }
    return val.toString()
  }

  return (
    <span className={`animated-counter ${className}`} style={style}>
      {prefix}{formatValue(currentValue)}{suffix}
    </span>
  )
}

export default AnimatedCounter
