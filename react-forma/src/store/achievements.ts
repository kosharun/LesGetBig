import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Achievement } from '../components/AchievementBadge'

interface AchievementStore {
  achievements: Achievement[]
  unlockedCount: number
  initializeAchievements: () => void
  unlockAchievement: (id: string) => void
  updateProgress: (id: string, progress: number) => void
  getAchievementsByRarity: (rarity: Achievement['rarity']) => Achievement[]
  getRecentlyUnlocked: (days?: number) => Achievement[]
}

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'first-workout',
    title: 'Prvi trening',
    description: 'Završi prvi trening',
    icon: 'bi-trophy',
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'week-streak',
    title: 'Sedmica posvećenosti',
    description: 'Treniraj 7 dana uzastopno',
    icon: 'bi-calendar-check',
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 7
  },
  {
    id: 'weight-goal',
    title: 'Cilj dosegnut',
    description: 'Dosegni ciljanu težinu',
    icon: 'bi-bullseye',
    rarity: 'epic',
    unlocked: false
  },
  {
    id: 'month-streak',
    title: 'Mesec discipline',
    description: 'Treniraj 30 dana uzastopno',
    icon: 'bi-award',
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
    maxProgress: 30
  },
  {
    id: 'progress-tracker',
    title: 'Praćenje napretka',
    description: 'Unesi 10 merenja napretka',
    icon: 'bi-graph-up',
    rarity: 'common',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'social-butterfly',
    title: 'Društvena osoba',
    description: 'Pošalji 50 poruka u chatu',
    icon: 'bi-chat-heart',
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'consistency-king',
    title: 'Kralj konzistentnosti',
    description: 'Završi sve treninge u mesecu',
    icon: 'bi-crown',
    rarity: 'epic',
    unlocked: false
  },
  {
    id: 'transformation',
    title: 'Transformacija',
    description: 'Postani drugi za 100 dana',
    icon: 'bi-star-fill',
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  }
]

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      achievements: [],
      unlockedCount: 0,

      initializeAchievements: () => {
        const { achievements } = get()
        if (achievements.length === 0) {
          set({ 
            achievements: defaultAchievements,
            unlockedCount: 0
          })
        }
      },

      unlockAchievement: (id: string) => {
        set((state) => {
          const achievements = state.achievements.map(achievement => {
            if (achievement.id === id && !achievement.unlocked) {
              return {
                ...achievement,
                unlocked: true,
                unlockedAt: new Date(),
                progress: achievement.maxProgress || undefined
              }
            }
            return achievement
          })

          const unlockedCount = achievements.filter(a => a.unlocked).length

          return { achievements, unlockedCount }
        })
      },

      updateProgress: (id: string, progress: number) => {
        set((state) => {
          const achievements = state.achievements.map(achievement => {
            if (achievement.id === id && achievement.maxProgress) {
              const newProgress = Math.min(progress, achievement.maxProgress)
              const shouldUnlock = !achievement.unlocked && newProgress >= achievement.maxProgress
              
              return {
                ...achievement,
                progress: newProgress,
                unlocked: shouldUnlock ? true : achievement.unlocked,
                unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt
              }
            }
            return achievement
          })

          const unlockedCount = achievements.filter(a => a.unlocked).length

          return { achievements, unlockedCount }
        })
      },

      getAchievementsByRarity: (rarity: Achievement['rarity']) => {
        return get().achievements.filter(a => a.rarity === rarity)
      },

      getRecentlyUnlocked: (days = 7) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        return get().achievements.filter(a => 
          a.unlocked && 
          a.unlockedAt && 
          a.unlockedAt >= cutoffDate
        )
      }
    }),
    {
      name: 'forma-achievements'
    }
  )
)

// Achievement trigger functions
export const achievementTriggers = {
  onWorkoutComplete: () => {
    const store = useAchievementStore.getState()
    store.unlockAchievement('first-workout')
    
    // Update streak counters (this would be more sophisticated in a real app)
    const currentWeekStreak = Math.floor(Math.random() * 7) + 1 // Mock data
    const currentMonthStreak = Math.floor(Math.random() * 30) + 1 // Mock data
    
    store.updateProgress('week-streak', currentWeekStreak)
    store.updateProgress('month-streak', currentMonthStreak)
  },

  onProgressEntry: () => {
    const store = useAchievementStore.getState()
    const currentProgress = store.achievements.find(a => a.id === 'progress-tracker')?.progress || 0
    store.updateProgress('progress-tracker', currentProgress + 1)
  },

  onMessageSent: () => {
    const store = useAchievementStore.getState()
    const currentProgress = store.achievements.find(a => a.id === 'social-butterfly')?.progress || 0
    store.updateProgress('social-butterfly', currentProgress + 1)
  },

  onWeightGoalReached: () => {
    const store = useAchievementStore.getState()
    store.unlockAchievement('weight-goal')
  },

  onMonthlyConsistency: () => {
    const store = useAchievementStore.getState()
    store.unlockAchievement('consistency-king')
  },

  onTransformationComplete: () => {
    const store = useAchievementStore.getState()
    store.unlockAchievement('transformation')
  }
}
