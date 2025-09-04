import { useMemo } from 'react'

interface ActivityData {
  date: string
  count: number
}

interface Props {
  data: ActivityData[]
  className?: string
}

export function ActivityHeatmap({ data, className = "" }: Props) {
  const heatmapData = useMemo(() => {
    // Create a grid for the last 20 weeks (140 days)
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 139) // 20 weeks * 7 days - 1
    
    const grid: { date: Date; count: number; level: number }[][] = []
    const dataMap = new Map(data.map(d => [d.date, d.count]))
    
    // Create weeks
    for (let week = 0; week < 20; week++) {
      const weekData = []
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + week * 7 + day)
        
        if (currentDate <= today) {
          const dateString = currentDate.toISOString().split('T')[0]
          const count = dataMap.get(dateString) || 0
          
          // Calculate intensity level (0-4)
          let level = 0
          if (count > 0) level = 1
          if (count >= 2) level = 2
          if (count >= 4) level = 3
          if (count >= 6) level = 4
          
          weekData.push({ date: currentDate, count, level })
        }
      }
      
      if (weekData.length > 0) {
        grid.push(weekData)
      }
    }
    
    return grid
  }, [data])

  const getColorForLevel = (level: number) => {
    const colors = [
      'rgba(255, 255, 255, 0.1)', // level 0 - no activity
      'rgba(102, 126, 234, 0.3)', // level 1 - low activity
      'rgba(102, 126, 234, 0.5)', // level 2 - medium activity
      'rgba(102, 126, 234, 0.7)', // level 3 - high activity
      'rgba(102, 126, 234, 1)'    // level 4 - very high activity
    ]
    return colors[level] || colors[0]
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className={`activity-heatmap ${className}`}>
      <div className="heatmap-header mb-3">
        <h6 className="text-white mb-2">Aktivnost u zadnjih 20 sedmica</h6>
        <div className="d-flex align-items-center gap-3">
          <span className="text-white-50 small">Manje</span>
          <div className="d-flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="heatmap-legend-item"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: getColorForLevel(level),
                  borderRadius: '2px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            ))}
          </div>
          <span className="text-white-50 small">Više</span>
        </div>
      </div>
      
      <div className="heatmap-grid" style={{ display: 'flex', gap: '2px' }}>
        {/* Day labels */}
        <div className="heatmap-days" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '8px' }}>
          <div style={{ height: '14px' }}></div> {/* Space for month labels */}
          {days.map((day, index) => (
            <div
              key={day}
              className="text-white-50"
              style={{
                fontSize: '10px',
                height: '12px',
                lineHeight: '12px',
                display: index % 2 === 1 ? 'block' : 'none' // Show every other day
              }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        {heatmapData.map((week, weekIndex) => (
          <div key={weekIndex} className="heatmap-week" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* Month label */}
            {weekIndex === 0 || week[0]?.date.getDate() <= 7 ? (
              <div className="text-white-50" style={{ fontSize: '10px', height: '14px', lineHeight: '14px' }}>
                {months[week[0]?.date.getMonth()]}
              </div>
            ) : (
              <div style={{ height: '14px' }}></div>
            )}
            
            {/* Week days */}
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className="heatmap-day"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: getColorForLevel(day.level),
                  borderRadius: '2px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title={`${day.date.toLocaleDateString()} - ${day.count} aktivnosti`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-center">
        <div className="text-white-50 small">
          {data.reduce((sum, item) => sum + item.count, 0)} ukupno aktivnosti u zadnjih 20 sedmica
        </div>
      </div>
    </div>
  )
}

export default ActivityHeatmap
