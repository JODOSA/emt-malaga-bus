interface OSRMRoute {
    distance: number
    duration: number
    geometry: {
        coordinates: [number, number][] // Coordenadas de la ruta
    }
}

interface OSRMResponse {
    routes: OSRMRoute[]
}

// Tipo que devolvemos a nuestro componente
export interface RouteResponse {
    distance: number  // Distancia en metros
    duration: number  // Tiempo en segundos
    geometry: [number, number][] // Coordenadas de la ruta
}

export async function calculateRoute(
    from: {lat: number; lon: number},
    to: {lat: number; lon: number}
) : Promise<RouteResponse | null> 
{
    try{
        // OSRM espera: lon, lat (no lat, lon)
        const url = `https://router.project-osrm.org/route/v1/foot/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`
        const response = await fetch(url)

        if(!response.ok){
            throw new Error('Error al calcular ruta')
        }

    const data: OSRMResponse = await response.json()

    if(!data.routes || data.routes.length === 0){
        return null
    }

    const route = data.routes[0]

    return {
        distance: route.distance,  // metros
        duration: route.duration,  // segundos
        geometry: route.geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon]  // Convertir a lat,lon para Leaflet
        )
    };
    }catch (error){
        console.error('Error calculando ruta: ', error)
        return null
    }
}