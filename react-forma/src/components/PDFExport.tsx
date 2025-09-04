import { useState } from 'react'
import { getCurrentSession } from '../lib/auth'

interface ProgressEntry {
  id: string
  userId: string
  date: string
  metric: string
  value: number
}

interface PDFExportProps {
  progressData: ProgressEntry[]
  fileName?: string
  title?: string
  className?: string
}

export function PDFExport({ 
  progressData, 
  fileName = 'izvještaj', 
  title = 'Izvještaj o napretku',
  className = '' 
}: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      const session = getCurrentSession()
      if (!session) return
      
      // Process real progress data
      const weightData = progressData.filter(p => p.metric === 'weightKg').sort((a, b) => a.date.localeCompare(b.date))
      const bodyFatData = progressData.filter(p => p.metric === 'bodyFatPercent').sort((a, b) => a.date.localeCompare(b.date))
      const totalEntries = progressData.length
      const   totalWorkouts = Math.floor(totalEntries * 1.5) // Estimate based on progress entries
      
      // Calculate progress
      let weightLoss = 0
      if (weightData.length >= 2) {
        weightLoss = weightData[0].value - weightData[weightData.length - 1].value
      }
      
      const consistency = totalEntries > 0 ? Math.min(95, 60 + (totalEntries * 2)) : 0
      
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              margin: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #333;
              min-height: 100vh;
            }
            .report-container {
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.1);
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #667eea;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #667eea;
              margin: 0;
              font-size: 2.5em;
              font-weight: 700;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 1.1em;
            }
            .section {
              margin: 30px 0;
            }
            .section h2 {
              color: #333;
              border-left: 4px solid #667eea;
              padding-left: 15px;
              font-size: 1.5em;
              margin-bottom: 20px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }
            .stat-card {
              background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              border: 1px solid #e0e7ff;
            }
            .stat-value {
              font-size: 2em;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 5px;
            }
            .stat-label {
              color: #666;
              font-size: 0.9em;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #999;
              font-size: 0.9em;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .data-table th {
              background: #667eea;
              color: white;
              font-weight: 600;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            @media print {
              body { margin: 0; background: white; }
              .report-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h1>Forma+</h1>
              <p>${title}</p>
              <p style="font-size: 0.9em; color: #999;">Generisan ${new Date().toLocaleDateString('sr-RS')} za ${session.name}</p>
            </div>
            
            <div class="section">
              <h2>📊 Pregled napretka</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${totalWorkouts}</div>
                  <div class="stat-label">Procjena treninga</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${weightLoss > 0 ? weightLoss.toFixed(1) + 'kg' : 'N/A'}</div>
                  <div class="stat-label">Promjena težine</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${consistency}%</div>
                  <div class="stat-label">Konzistentnost</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${totalEntries}</div>
                  <div class="stat-label">Ukupno mjerenja</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>📈 Merenja napretka</h2>
              ${progressData.length > 0 ? `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Metreka</th>
                    <th>Vrijednost</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  ${progressData.slice(-10).map((entry, index, arr) => {
                    const metricNames = {
                      weightKg: 'Težina (kg)',
                      bodyFatPercent: 'Body fat (%)',
                      chestCm: 'Grudi (cm)',
                      waistCm: 'Struk (cm)'
                    }
                    
                    let trend = '-'
                    if (index > 0) {
                      const prevEntry = arr.find(e => e.metric === entry.metric && e.date < entry.date)
                      if (prevEntry) {
                        const diff = entry.value - prevEntry.value
                        if (entry.metric === 'weightKg' || entry.metric === 'bodyFatPercent' || entry.metric === 'waistCm') {
                          trend = diff < 0 ? '↓ Poboljšanje' : diff > 0 ? '↑ Povećanje' : '→ Stabilno'
                        } else {
                          trend = diff > 0 ? '↑ Poboljšanje' : diff < 0 ? '↓ Smanjenje' : '→ Stabilno'
                        }
                      }
                    }
                    
                    return `
                    <tr>
                      <td>${entry.date}</td>
                      <td>${metricNames[entry.metric] || entry.metric}</td>
                      <td>${entry.value}</td>
                      <td>${trend}</td>
                    </tr>
                    `
                  }).join('')}
                </tbody>
              </table>
              ` : '<p>Nema unesenih mjerenja.</p>'}
            </div>
            
            <div class="section">
              <h2>📊 Sažetak</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${weightData.length}</div>
                  <div class="stat-label">Mjerenja težine</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${bodyFatData.length}</div>
                  <div class="stat-label">Body fat mjerenja</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${progressData.filter(p => p.metric === 'chestCm').length}</div>
                  <div class="stat-label">Mjerenja grudi</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${progressData.filter(p => p.metric === 'waistCm').length}</div>
                  <div class="stat-label">Mjerenja struka</div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>Ovaj izvještaj je automatski generiran od strane Forma+ aplikacije.</p>
              <p>Za dodatne informacije kontaktirajte vašeg trenera.</p>
            </div>
          </div>
        </body>
        </html>
      `
      
      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      URL.revokeObjectURL(url)
      
      // Show success message (you might want to use toast here)
      alert('Izvještaj je uspešno kreiran i preuzet!')
      
    } catch (error) {
      console.error('Greška pri kreiranju izvještaja:', error)
      alert('Došlo je do greške pri kreiranju izvještaja.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button 
      className={`btn-pro-outline ${className}`}
      onClick={generatePDF}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          Kreiranje...
        </>
      ) : (
        <>
          <i className="bi bi-file-earmark-pdf me-2"></i>
          Izvezi PDF
        </>
      )}
    </button>
  )
}

export default PDFExport
