import { useEffect, useRef } from "react"
import L from 'leaflet'
import type { ParadaCercana } from '../types'
import { calculateRoute, type RouteResponse } from '../services/routingService'

interface MapProps {
    userLocation: { lat: number, lon: number } | null
    busStops: ParadaCercana[]
    onStopClick?: (stop: ParadaCercana) => void
    expandedStopId?: string | null
}

export const Map = ({ userLocation, busStops, onStopClick, expandedStopId }: MapProps) => {
    // useRef para mantener la referencia al contendor del mapa
    const mapContainerRef = useRef<HTMLDivElement>(null)
    // useRef para mantener la instancia del mapa entre renders
    const mapRef = useRef<L.Map | null>(null)
    // useRef para los marcadores, así podemos limpiarlos después
    const markersRef = useRef<L.Marker[]>([])
    // useRef para guardar la línea de ruta
    const routeLineRef = useRef<L.Polyline | null>(null)

    // Función para dibujar la ruta en el mapa
    const drawRoute = async (from: {lat: number; lon: number}, to: {lat: number; lon: number}) => {
        if(!mapRef.current) return null

        // Borrar ruta anterior si existe
        if(routeLineRef.current){
            routeLineRef.current.remove()
            routeLineRef.current = null
        }

        // Calcular la ruta
        const routeData = await calculateRoute(from, to)

        if(!routeData){
            console.error('No se pudo calcular la ruta')
            return null
        }

        // Dibujar la línea de ruta en el mapa
        const routeLine = L.polyline(routeData.geometry, {
            color: '#2a81cb', // Color azul, como el marcador del usuario
            weight: 4,  // Grosor de la línea
            opacity: 0.7,  // Transparencia de la línea
            lineJoin: 'round'  // Esquinas redondeadas
        }).addTo(mapRef.current)

        // Guardar referencia para poder borrarla después
        routeLineRef.current = routeLine

        return routeData
    }

    // Efecto para inicializar el mapa (solo se ejecuta una vez)
    useEffect(() => {
        if(!mapContainerRef.current) return

        // Crear el mapa centrado en Málaga por defecto
        const map = L.map(mapContainerRef.current).setView(
            [36.7213, -4.4214], // Coordenadas de Málaga centro
            13) // Nivel de zoom inicial

        // Añadir la capa de titles (imágenes del mapa)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map)

        mapRef.current = map

        // Cleanup: eliminar el mapa cuando el componente se desmonte
        return () => {
            map.remove()
        };
    }, []) // Array vacio, solo se ejecuta la montar

    // Efecto para actualizar la posición del usuario
    useEffect(() => {
        if(!mapRef.current || !userLocation) return

        const map = mapRef.current

        // Centrar el mapa en la ubicación del usuario
        map.setView([userLocation.lat, userLocation.lon], 15)

        // Crear un marcador personalizado para el usuario (azul)
        const userIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Añadir el marcador del usuario
        const userMarker = L.marker([userLocation.lat, userLocation.lon], {
            icon: userIcon
        })
            .addTo(map)
            .bindPopup('📍 Tu ubicación')

        // Cleanup: eliminar el marcador cuando cambien las coordenadas
        return () => {
            userMarker.remove()
        }
    }, [userLocation]);

    // Efecto par actualizar los marcadores de paradas
    useEffect(() => {
        if(!mapRef.current || busStops.length === 0) return

        const map = mapRef.current

        // Limpiar marcadores anteriores
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []

        // Crear un marcador para cada parada (rojo)
        const newMarkers = busStops.map(stop => {
            const stopIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })

            const marker = L.marker([stop.lat, stop.lon], {
                icon: stopIcon
            })

                .addTo(map)
                .bindPopup(`<strong>${stop.stop_name}</strong><br>
                    ${stop.direccion}<br>
                    Distancia: ${Math.round(stop.distancia)}m`)

            // Abrir popup al pasar el ratón (hover)
            marker.on('mouseover', function() {
                this.openPopup()
            })

            // Los popups se cierran solos al interactuar con el mapa
            // o los controla el useEffect cuando hay tarjeta expandida

            // Al hacer clic: abrir popup y ejecutar callback
            if(onStopClick) {
                marker.on('click', () => onStopClick(stop))
            }

            return marker
        })

        markersRef.current = newMarkers

        // Cleanup: eliminar marcadores cuando cambien las paradas
        return () => {
            markersRef.current.forEach(marker => marker.remove())
        }
    }, [busStops, onStopClick])

    // Efecto para manejar popups según tarjeta expandida
    useEffect(() => {

        if(!mapRef.current || markersRef.current.length === 0) return

        // Si hay una parada expandida
        if(expandedStopId) {

            const markerIndex = busStops.findIndex(stop => stop.stop_id === expandedStopId)

            if(markerIndex !== -1 && markersRef.current[markerIndex]) {
                const marker = markersRef.current[markerIndex]
                const stop = busStops[markerIndex]

                // Dibujar la ruta si tenemos ubicación del usuario
                if(userLocation){
                    drawRoute(
                        {lat: userLocation.lat, lon: userLocation.lon},
                        {lat: stop.lat, lon: stop.lon}
                    ).then(routeData => {
                        // Si se calculó la ruta correctamente, actualizar el popup
                        if(routeData) {
                            // Calcular tiempo estimado en minutos
                            const minutes = Math.round(routeData.duration / 60)
                            // Convertir distancia a metros o kilómetros
                            const distance = routeData.distance < 1000
                            ? `${Math.round(routeData.distance)}m`
                            : `${(routeData.distance / 1000).toFixed(1)}km`

                            // Actualizar el contenido del popup con la info de la ruta
                            marker.setPopupContent(`
                                <strong>${stop.stop_name}</strong><br>
                                ${stop.direccion}<br>
                                📏 Distancia: ${distance}<br>
                                🚶 Tiempo: ~${minutes} min
                            `)
                        }
                    })
                }

                // Abrir popup
                setTimeout(() => {
                    marker.openPopup()
                }, 100)

                // Centrar mapa en ese marcador con zoom 16
                mapRef.current.setView([stop.lat, stop.lon], 16, {
                    animate: true,
                    duration: 0.5
                })
            }
        }else{

            // Si no hay tarjeta expandida, cerrar todos los popups
            markersRef.current.forEach(marker => {
                marker.closePopup()
            })

            // Borrar la ruta del mapa
            if(routeLineRef.current) {
                routeLineRef.current.remove()
                routeLineRef.current = null
            }
        }
    }, [expandedStopId, userLocation])

    return (
        <div 
            ref={mapContainerRef}
            style={{width: '100%', height: '100%'}}
            className="rounded-lg shadow-lg"
        />
    )
}