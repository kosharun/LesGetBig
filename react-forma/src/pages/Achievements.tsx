import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { Toasts } from '../components/Toasts'
import AchievementBadge, { type Achievement } from '../components/AchievementBadge'
import { useAchievementStore } from '../store/achievements'

export function Achievements() {
  const { 
    achievements, 
    unlockedCount, 
    initializeAchievements,
    getAchievementsByRarity,
    getRecentlyUnlocked
  } = useAchievementStore()
  
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [filterRarity, setFilterRarity] = useState<Achievement['rarity'] | 'all'>('all')

  useEffect(() => {
    initializeAchievements()
  }, [initializeAchievements])

  const filteredAchievements = filterRarity === 'all' 
    ? achievements 
    : getAchievementsByRarity(filterRarity)

  const recentlyUnlocked = getRecentlyUnlocked(7)
  const totalAchievements = achievements.length
  const completionPercentage = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0

  const rarityStats = {
    common: achievements.filter(a => a.rarity === 'common' && a.unlocked).length,
    rare: achievements.filter(a => a.rarity === 'rare' && a.unlocked).length,
    epic: achievements.filter(a => a.rarity === 'epic' && a.unlocked).length,
    legendary: achievements.filter(a => a.rarity === 'legendary' && a.unlocked).length,
  }

  return (
    <>
      <Navbar />
      <Toasts />
      <div className="container py-4">
        <div className="row g-4 animate-fade-in">
          {/* Header Stats */}
          <div className="col-12">
            <div className="glass-card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="text-white mb-3">
                      <i className="bi bi-trophy me-3"></i>
                      Dostignuća
                    </h2>
                    <div className="row g-3">
                      <div className="col-6 col-md-3 text-center">
                        <div className="display-6 fw-bold text-white">{unlockedCount}</div>
                        <div className="text-white-50 small">Otkljucano</div>
                      </div>
                      <div className="col-6 col-md-3 text-center">
                        <div className="display-6 fw-bold text-white">{totalAchievements}</div>
                        <div className="text-white-50 small">Ukupno</div>
                      </div>
                      <div className="col-6 col-md-3 text-center">
                        <div className="display-6 fw-bold text-warning">{rarityStats.legendary}</div>
                        <div className="text-white-50 small">Legendary</div>
                      </div>
                      <div className="col-6 col-md-3 text-center">
                        <div className="display-6 fw-bold text-primary">{Math.round(completionPercentage)}%</div>
                        <div className="text-white-50 small">Završenost</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex justify-content-center">
                      <div className="position-relative">
                        <svg width="120" height="120" className="progress-ring">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="8"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="rgba(102, 126, 234, 1)"
                            strokeWidth="8"
                            strokeDasharray={314}
                            strokeDashoffset={314 - (314 * completionPercentage) / 100}
                            strokeLinecap="round"
                            style={{
                              transition: 'stroke-dashoffset 0.5s ease',
                              transform: 'rotate(-90deg)',
                              transformOrigin: '60px 60px'
                            }}
                          />
                        </svg>
                        <div className="position-absolute top-50 start-50 translate-middle text-center">
                          <div className="text-white fw-bold fs-5">{Math.round(completionPercentage)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Unlocked */}
          {recentlyUnlocked.length > 0 && (
            <div className="col-12">
              <div className="glass-card">
                <div className="card-body">
                  <h5 className="text-white mb-3">
                    <i className="bi bi-clock me-2"></i>
                    Nedavno otkljucano
                  </h5>
                  <div className="row g-3">
                    {recentlyUnlocked.slice(0, 4).map(achievement => (
                      <div key={achievement.id} className="col-6 col-md-3">
                        <AchievementBadge 
                          achievement={achievement} 
                          size="sm"
                          onClick={setSelectedAchievement}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Controls */}
          <div className="col-12">
            <div className="glass-card">
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="text-white me-3">Filter po rettkosti:</span>
                  {['all', 'common', 'rare', 'epic', 'legendary'].map(rarity => (
                    <button
                      key={rarity}
                      className={`btn btn-sm ${filterRarity === rarity ? 'btn-gradient' : 'btn-outline-light'}`}
                      onClick={() => setFilterRarity(rarity as any)}
                    >
                      {rarity === 'all' ? 'Svi' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="col-12">
            <div className="glass-card">
              <div className="card-body">
                <div className="row g-4 animate-stagger">
                  {filteredAchievements.map((achievement, index) => (
                    <div key={achievement.id} className="col-6 col-md-4 col-lg-3">
                      <AchievementBadge 
                        achievement={achievement}
                        size="md"
                        onClick={setSelectedAchievement}
                        showAnimation={index < 3} // Animate first few for demo
                      />
                    </div>
                  ))}
                </div>
                
                {filteredAchievements.length === 0 && (
                  <div className="text-center py-5">
                    <div className="text-white-50">
                      <i className="bi bi-search display-4 d-block mb-3"></i>
                      Nema dostignuća za odabrani filter
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <div 
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSelectedAchievement(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="glass-card-strong">
                <div className="modal-body p-4 text-center">
                  <button 
                    className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                    onClick={() => setSelectedAchievement(null)}
                  />
                  
                  <div className="mb-4">
                    <AchievementBadge 
                      achievement={selectedAchievement} 
                      size="lg"
                    />
                  </div>
                  
                  <h4 className="text-white mb-3">{selectedAchievement.title}</h4>
                  <p className="text-white-50 mb-4">{selectedAchievement.description}</p>
                  
                  {selectedAchievement.unlocked ? (
                    <div className="text-success">
                      <i className="bi bi-check-circle me-2"></i>
                      Otkljucano {selectedAchievement.unlockedAt?.toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-warning">
                      <i className="bi bi-lock me-2"></i>
                      Još uvek zaključano
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Achievements
