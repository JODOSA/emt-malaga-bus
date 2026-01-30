import { describe, it, expect } from 'vitest'
import { calcularDistancia } from '../utils/distancia'

describe('calcularDistancia', () => {
    it('debería calcular correctamente la distancia entre dos puntos conocidos', () => {
        // Coordenadas reales:  Málaga Centro -> Aeropuerto de Málaga
        const malagaCentro = { lat: 36.7213, lon: -4.4214 }
        const aeropuerto = { lat: 36.6749, lon: -4.4990 }

        const distancia = calcularDistancia(
            malagaCentro.lat,
            malagaCentro.lon,
            aeropuerto.lat,
            aeropuerto.lon
        )

        // La distancia real es aproximadamente 9100 metros
        // Usamos un rango porque Heversine da aproximaciones
        expect(distancia).toBeGreaterThan(8500)
        expect(distancia).toBeLessThan(8700)
    })

    it('debería retornar 0 cuando las coordenadas son idénticas', () => {
        const distancia = calcularDistancia(36.7213, -4.4214, 36.7213, -4.4214)

        expect(distancia).toBe(0)
    })

    it('debería calcular distancias cortas correctamente', () => {
        // Dos puntos muy cercanos (aproximadamente 100 metros)
        const distancia = calcularDistancia(
            36.7213, 
            -4.4214, 
            36.7223, 
            -4.4214
        )

        // Debería ser apoximadamente 111 metros (diferencia de 0.001 grados)
        expect(distancia).toBeGreaterThan(100)
        expect(distancia).toBeLessThan(150)
    })

    it('debería manejar coordenadas en diferentes hemisferios', () => {
        // Madrid (España) -> Buenos Aires (Argentina)
        const distancia = calcularDistancia(
            40.4168,  // Madrid
            -3.7038,
            -34.6037, // Buenos Aires  
            -58.3816
        )

        // Distancia aproximada: 10.000 km
        expect(distancia).toBeGreaterThan(10000000)
        expect(distancia).toBeLessThan(11000000)
    })
})