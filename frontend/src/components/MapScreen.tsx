import { useEffect, useState } from 'react'
import './MapScreen.css'

// Definimos el tipo de las props que recibe
interface MapScreenProps {
    onBack: () => void
}

interface Stop {
    stop_id: string
    stop_name: string
    distancia: number
}

function MapScreen({ onBack }: MapScreenProps) {
    const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)
    const [stops, setStops] = useState<Stop[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Solo ejecutar si el navegador soporta geolocalización
        if(!navigator.geolocation) {
            // Usar setTimeout para hacer el setState asíncrono
            setTimeout(() => {
                setError('Tu navegador no soporta geolocalización')
                setLoading(false)
            }, 0)            
            return
        }

        // Si llegamos aquí, si soporta la geolocalización
        navigator.geolocation.getCurrentPosition(
            async (position) => {                
                const lat = position.coords.latitude
                const lon = position.coords.longitude

                setUserLocation({ lat, lon })

                // Hacer petición al backend
                try{
                    const response = await fetch(
                        `http://localhost:3000/api/paradas/cercanas?lat=${lat}&lon=${lon}`
                    )

                    if(!response.ok){
                        throw new Error('Error al obtener paradas')
                    }

                    const data = await response.json()
                    setStops(data.paradasCercanas)
                    setLoading(false)
                }catch (err) {
                    setError('Error al conectar al servidor')
                    setLoading(false)
                }
            },
            (err) => {
                setError(`Error al obtener ubicación: ${err.message}`)
                setLoading(false)
            }
        )
    }, [])

  return (
    <div className="map-screen">
      <div className="header">
        <button className="back-button" onClick={onBack}>←</button>
        <h2>Paradas cercanas</h2>
      </div>
      
      <div className="map-container">
        <div className="map-placeholder">
            {loading && (
            <>
                <div className="spinner"></div>
                <p>Obteniendo tu ubicación...</p>
            </>
            )}

            {error && <p style={{color: 'red'}}>{error}</p>}

            {userLocation && !loading && (
                <div>
                    <p>✅ {stops.length} paradas encontradas</p>
                </div>
            )}          
        </div>
      </div>
      
      <div className="stops-sheet">
        {loading ? (
          <h3>📍 Buscando paradas...</h3>
        ) : (
          <>
            <h3>📍 {stops.length} paradas encontradas</h3>
            <div style={{ marginTop: '1rem' }}>
              {stops.map((stop) => (
                <div key={stop.stop_id} style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  marginBottom: '0.8rem',
                  borderRadius: '12px',
                  borderLeft: '4px solid #667eea'
                }}>
                  <div style={{ fontWeight: 600, color: '#333' }}>
                    {stop.stop_name}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                    📏 {Math.round(stop.distancia)} metros
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MapScreen

