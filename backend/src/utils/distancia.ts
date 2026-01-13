/** Calcula la distancia entre dos coordenadas geográficas usando la formula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lon1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lon2 Longitud del punto 2
 * @returns Distancia en kilometros
 */

export function calcularDistacia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radio de la Tierra en kilometros

    // Convertir los grados en radianes
    const dLat = toRadianes(lat2 - lat1);
    const dLon = toRadianes(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadianes(lat1)) *
        Math.cos(toRadianes(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return distancia;
}

function toRadianes(grados: number): number {
    return grados * (Math.PI / 180);
}

