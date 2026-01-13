import { calcularDistacia } from "../utils/distancia";
import { cargarParadas } from "./dataLoader";

interface ParadaCercana {
    codParada: string;
    nombreParada: string;
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

    // 2. Calcular distancia de cada parada al usuario
    const paradasConDistancia = todasLasParadas.map(parada => {
        const distancia = calcularDistacia(
            latUsuario,
            lonUsuario,
            parseFloat(parada.lat),
            parseFloat(parada.lon)
        );

        return {
            codParada: parada.codParada,
            nombreParada: parada.nombreParada,
            direccion: parada.direccion,
            lat: parseFloat(parada.lat),
            lon: parseFloat(parada.lon),
            distancia: distancia,
            lineas: [] // Se llenará después
        };
    });

    // 3. Ordenar por distancia (menor a mayor)
    paradasConDistancia.sort((a, b) => a.distancia - b.distancia);

    // 4. Devolver solo las cantidad de paradas que indica 'limite'
    return paradasConDistancia.slice(0, limite);
}