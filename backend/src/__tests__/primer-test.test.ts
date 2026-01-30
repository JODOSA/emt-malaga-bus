import { describe, it, expect } from 'vitest'

describe('Mi primer test', () => {
    it('debería verificar que 2 + 2 es 4', () => {
        const resultado = 2 + 2
        expect(resultado).toBe(4)
    })
})