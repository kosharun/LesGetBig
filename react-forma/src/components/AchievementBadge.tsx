import { useState, useEffect } from 'react'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

interface Props {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showAnimation?: boolean
  onClick?: (achievement: Achievement) => void
}

export function AchievementBadge({ 
  achievement, 
  size = 'md', 
  showAnimation = false,
  onClick 
}: Props) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (showAnimation && achievement.unlocked) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showAnimation, achievement.unlocked])

  const sizeClasses = {
    sm: { container: 'p-2', icon: 'fs-5', title: 'small', desc: 'small' },
    md: { container: 'p-3', icon: 'fs-4', title: 'fs-6', desc: 'small' },
    lg: { container: 'p-4', icon: 'fs-2', title: 'fs-5', desc: 'fs-6' }
  }

  const rarityColors = {
    common: 'rgba(108, 117, 125, 1)',
    rare: 'rgba(13, 110, 253, 1)',
    epic: 'rgba(111, 66, 193, 1)',
    legendary: 'rgba(255, 193, 7, 1)'
  }

  const rarityGradients = {
    common: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
    rare: 'linear-gradient(135deg, #0d6efd 0%, #0856cc 100%)',
    epic: 'linear-gradient(135deg, #6f42c1 0%, #59359a 100%)',
    legendary: 'linear-gradient(135deg, #ffc107 0%, #ffb006 100%)'
  }

  const classes = sizeClasses[size]

  return (
    <div 
      className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'} ${isAnimating ? 'animate-unlock' : ''} cursor-pointer`}
      onClick={() => onClick?.(achievement)}
      style={{
        background: achievement.unlocked 
          ? rarityGradients[achievement.rarity]
          : 'rgba(255, 255, 255, 0.1)',
        border: `2px solid ${achievement.unlocked ? rarityColors[achievement.rarity] : 'rgba(255, 255, 255, 0.2)'}`,
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        opacity: achievement.unlocked ? 1 : 0.6,
        filter: achievement.unlocked ? 'none' : 'grayscale(1)',
        transform: isAnimating ? 'scale(1.1)' : 'scale(1)'
      }}
    >
      {/* Shine effect for unlocked achievements */}
      {achievement.unlocked && (
        <div 
          className="achievement-shine"
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            animation: isAnimating ? 'shine 1s ease-out 0.5s' : 'none',
            pointerEvents: 'none'
          }}
        />
      )}

      <div className={`text-center ${classes.container}`}>
        {/* Icon */}
        <div className="mb-2">
          <i 
            className={`bi ${achievement.icon} ${classes.icon}`}
            style={{ 
              color: achievement.unlocked ? 'white' : 'rgba(255, 255, 255, 0.5)',
              textShadow: achievement.unlocked ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
            }}
          />
        </div>

        {/* Title */}
        <div 
          className={`fw-bold ${classes.title} mb-1`}
          style={{ color: achievement.unlocked ? 'white' : 'rgba(255, 255, 255, 0.7)' }}
        >
          {achievement.title}
        </div>

        {/* Description */}
        <div 
          className={`${classes.desc} opacity-75`}
          style={{ color: achievement.unlocked ? 'white' : 'rgba(255, 255, 255, 0.5)' }}
        >
          {achievement.description}
        </div>

        {/* Progress bar (if applicable) */}
        {achievement.maxProgress && (
          <div className="mt-2">
            <div 
              className="progress"
              style={{ 
                height: '4px', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px'
              }}
            >
              <div 
                className="progress-bar"
                style={{ 
                  width: `${Math.min((achievement.progress || 0) / achievement.maxProgress * 100, 100)}%`,
                  backgroundColor: achievement.unlocked ? 'white' : rarityColors[achievement.rarity],
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
            <div className="text-center mt-1">
              <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {achievement.progress || 0}/{achievement.maxProgress}
              </small>
            </div>
          </div>
        )}

        {/* Rarity indicator */}
        <div className="mt-2">
          <span 
            className="badge"
            style={{ 
              backgroundColor: rarityColors[achievement.rarity],
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {achievement.rarity}
          </span>
        </div>

        {/* Unlock date */}
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="mt-1">
            <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Otkljucano {achievement.unlockedAt.toLocaleDateString()}
            </small>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes unlock {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .achievement-badge:hover {
          transform: translateY(-5px) scale(1.05) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
        }
        
        .animate-unlock {
          animation: unlock 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}

export default AchievementBadge
