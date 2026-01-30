import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('GET /api/paradas/cercanas', () => {
    it('debería retornar paradas cercanas con parámetros válidos', async () => {
        const response = await request(app)
        .get('/api/paradas/cercanas')
        .query({ lat: 36.7213, lon: -4.4214 })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('ubicacionUsuario')
        expect(response.body).toHaveProperty('paradasCercanas')
        expect(Array.isArray(response.body.paradasCercanas)).toBe(true)
    })

    it('debería retornar error 400 si faltan parámetros', async () => {
        const response = await request(app)
        .get('/api/paradas/cercanas')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Faltan parámetros lat y lon')
    })
})
