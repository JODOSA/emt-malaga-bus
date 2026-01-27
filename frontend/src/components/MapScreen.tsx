import { useEffect, useState, useCallback} from 'react'
import './MapScreen.css'
import StopCard from './StopCard'
import { Map } from './Map'
import type { ParadaCercana } from '../types'

// Definimos el tipo de las props que recibe
interface MapScreenProps {
    onBack: () => void
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
    const [stops, setStops] = useState<ParadaCercana[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedStopId, setExpandedStopId] = useState<string | null>(null)
    const [schedulesCache, setSchedulesCache] = useState<SchedulesCache>({})
    const [loadingSchedules, setLoadingSchedules] = useState<string | null>(null)
    const [showLocationInput, setShowLocationInput] = useState(false)
    const [manualLat, setManualLat] = useState('')
    const [manualLon, setManualLon] = useState('')

    const handleStopClick = useCallback(async (stop_id: string) => {
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

            console.log('📡 Respuesta del backend para parada:', stop_id, 'Status:', response.status);

            if(!response.ok){
                throw new Error('Error al obtener horarios')
            }

            const data = await response.json()

            console.log('📊 Datos recibidos para parada', stop_id, ':', data);
            console.log('📋 Número de horarios:', data.horarios?.length || 0);

            // Guardar en caché
            setSchedulesCache((prev: SchedulesCache) => ({
                ...prev,
                [stop_id]: data.horarios
            }))
            setLoadingSchedules(null)

            // Forzar actualización para que el useEffect del mapa se ejecute
            // Esto asegura que el popup se abra DESPUÉS de cargar los horarios
            setExpandedStopId(null)
            setTimeout(() => {
                setExpandedStopId(stop_id)
            }, 50)

        }catch (err){
            console.error('Error al cargar horarios: ', err)
            setLoadingSchedules(null)
        }
        
    }, [expandedStopId, schedulesCache])

    const handleManualLocation = async () => {
        const lat = parseFloat(manualLat)
        const lon = parseFloat(manualLon)

        // Validar que sean números válidos
        if(isNaN(lat) || isNaN(lon)) {
            alert('Por favor, introduce coordenadas válidas')
            return
        }

        // Validar rangos aproximados de España
        if(lat < 35 || lat > 44 || lon < -10 || lon > 5) {
            alert('Las coordenadas parecen estar fuera del rango de España. Verifica que son correctas')
            return
        }

        setUserLocation({lat, lon})
        setLoading(true)

        // Hacer petición al backend con las coordenadas manuales
        try {
            const response = await fetch(
            `http://localhost:3000/api/paradas/cercanas?lat=${lat}&lon=${lon}`
            );

            if (!response.ok) {
            throw new Error('Error al obtener paradas');
            }

            const data = await response.json();
            setStops(data.paradasCercanas);
            setLoading(false);
            setShowLocationInput(false); // Cerrar el formulario
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(`Error al conectar al servidor: ${errorMessage}`);
            setLoading(false);
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
            {loading && (
                <div className="map-placeholder">
                    <div className="spinner"></div>
                    <p>Obteniendo tu ubicación...</p>
                </div>
            )}

            {error && (
                <div className='map-placeholder'>
                    <p style={{color: 'red'}}>{error}</p>
                </div>
            )}

            {userLocation && !loading && (
                <Map 
                userLocation={userLocation}
                busStops={stops}
                onStopClick={(stop) => handleStopClick(stop.stop_id)}
                expandedStopId={expandedStopId}
                />
            )}          
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

        {/* Botón flotante para ubicación manual */}
{!loading && (
  <button 
    className="manual-location-button"
    onClick={() => setShowLocationInput(!showLocationInput)}
    title="Introducir ubicación manual"
  >
    📍
  </button>
)}

{/* Formulario de ubicación manual */}
{showLocationInput && (
  <div className="location-input-modal">
    <h3>Ubicación Manual</h3>
    <p style={{fontSize: '0.9em', color: '#666', marginBottom: '1rem'}}>
      Introduce coordenadas de Málaga para testing
    </p>
    
    <div className="input-group">
      <label>Latitud:</label>
      <input
        type="text"
        placeholder="Ej: 36.7213"
        value={manualLat}
        onChange={(e) => setManualLat(e.target.value)}
      />
    </div>
    
    <div className="input-group">
      <label>Longitud:</label>
      <input
        type="text"
        placeholder="Ej: -4.4214"
        value={manualLon}
        onChange={(e) => setManualLon(e.target.value)}
      />
    </div>

    <p style={{fontSize: '0.85em', color: '#888', marginTop: '0.5rem'}}>
      💡 Tip: Centro de Málaga: 36.7213, -4.4214
    </p>
    
    <div className="button-group">
      <button 
        className="btn-primary"
        onClick={handleManualLocation}
      >
        Buscar paradas
      </button>
      <button 
        className="btn-secondary"
        onClick={() => setShowLocationInput(false)}
      >
        Cancelar
      </button>
    </div>
  </div>
)}

    </div>
  )
}

export default MapScreen

