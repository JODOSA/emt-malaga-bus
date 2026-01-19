import { useEffect, useState } from 'react'
import './MapScreen.css'
import StopCard from './StopCard'

// Definimos el tipo de las props que recibe
interface MapScreenProps {
    onBack: () => void
}

interface Stop {
    stop_id: string
    stop_name: string
    distancia: number
}

interface Schedule {
    fechaHoy: string
    hora: string
    linea: string
    destino: string
    sentido: string
}

interface SchedulesCache {
    [stop_id: string]: Schedule[]
}

function MapScreen({ onBack }: MapScreenProps) {
    const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)
    const [stops, setStops] = useState<Stop[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedStopId, setExpandedStopId] = useState<string | null>(null)
    const [schedulesCache, setSchedulesCache] = useState<SchedulesCache>({})
    const [loadingSchedules, setLoadingSchedules] = useState<string | null>(null)

    const handleStopClick = async (stop_id: string) => {
        // Si se hace click en una tarjeta ya expandida, se colapsa
        if(expandedStopId === stop_id){
            setExpandedStopId(null)
            return
        }

        // Si no, se expande la tarjeta seleccionada y se colapsa cualquier otra
        setExpandedStopId(stop_id)

        // Verificar si ya tenemos los horarios en caché
        if(schedulesCache[stop_id]){
            // Ya los tenemos, no hacer nada más
            return
        }

        // No los tenemos, cargarlos del backend
        setLoadingSchedules(stop_id)

        try{
            const response = await fetch(`http://localhost:3000/api/horarios/${stop_id}`)

            if(!response.ok){
                throw new Error('Error al obtener horarios')
            }

            const data = await response.json()

            // Guardar en caché
            setSchedulesCache((prev: SchedulesCache) => ({
                ...prev,
                [stop_id]: data.horarios
            }))
            setLoadingSchedules(null)
        }catch (err){
            console.error('Error al cargar horarios: ', err)
            setLoadingSchedules(null)
        }
        
    }

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
                    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
                    setError(`Error al conectar al servidor: ${errorMessage}`)
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
            {stops.map((stop) => (
                <StopCard
                    key={stop.stop_id}
                    stop_id={stop.stop_id}
                    stop_name={stop.stop_name}
                    distancia={stop.distancia}
                    isExpanded={expandedStopId === stop.stop_id}
                    onClick={() => handleStopClick(stop.stop_id)}
                    schedules={schedulesCache[stop.stop_id] || []}
                    isLoadingSchedules={loadingSchedules === stop.stop_id} />
            ))}
           
          </>
        )}
      </div>
    </div>
  )
}

export default MapScreen

