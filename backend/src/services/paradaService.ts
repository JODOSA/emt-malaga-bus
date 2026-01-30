import { calcularDistancia } from "../utils/distancia";
import { cargarParadas } from "./dataLoader";

interface ParadaCercana {
    stop_id: string;
    stop_name: string;
    direccion: string;
    lat: number;
    lon: number;
    distancia: number;
    lineas: string[];
}

export async function buscarParadasCercanas(
    latUsuario: number,
    lonUsuario: number,
    limite: number = 5
): Promise<ParadaCercana[]> {
    // 1. Cargar todas las paradas
    const todasLasParadas = await cargarParadas();

    // 2. Eliminar duplicados por codParada
    const paradasUnicas = Array.from(
        new Map(todasLasParadas.map(parada => [parada.codParada, parada])).values()
    );

    // 3. Calcular distancia de cada parada al usuario
    const paradasConDistancia = paradasUnicas.map(parada => {
        const distancia = calcularDistancia(
            latUsuario,
            lonUsuario,
            parseFloat(parada.lat),
            parseFloat(parada.lon)
        );

        return {
            stop_id: parada.codParada,
            stop_name: parada.nombreParada,
            direccion: parada.direccion,
            lat: parseFloat(parada.lat),
            lon: parseFloat(parada.lon),
            distancia: distancia,
            lineas: [] // Se llenará después
        };
    });

    // 4. Ordenar por distancia (menor a mayor)
    paradasConDistancia.sort((a, b) => a.distancia - b.distancia);

    // 5. Devolver solo las cantidad de paradas que indica 'limite'
    return paradasConDistancia.slice(0, limite);
}