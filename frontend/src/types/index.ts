// Tipo para una parada cercana (lo que devuelve tu función buscarParadasCercanas)
export interface ParadaCercana {
    stop_id: string;
    stop_name: string;
    direccion: string;
    lat: number;
    lon: number;
    distancia: number;
    lineas: string[];
}

// Tipo para los horarios (ya estaban en StopCard, ahora lo compartimos)
export interface Schedule {
    fechaHoy: string;
    hora: string;
    linea: string;
    destino: string;
    sentido: string;
}