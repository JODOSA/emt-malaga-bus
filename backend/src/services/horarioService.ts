import { cargarStopTimes, cargarTrips, cargarRoutes, cargarCalendarDates } from "./gtfsLoader";

interface HorarioParada {
    hora: string;
    linea: string;
    destino: string;
    sentido: string;
}

function obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}${month}${day}`; // Formato YYYYMMDD
}

export async function obtenerHorariosParada(
    codParada: string
): Promise<HorarioParada[]> {
    // 1. Cargar todos los datos necesarios
    const [stopTimes, trips, routes, calendarDates] = await Promise.all([
        cargarStopTimes(),
        cargarTrips(),
        cargarRoutes(),
        cargarCalendarDates()
    ]);

    // 2. Obtener los service_ids que operan hoy
    const fechaHoy = obtenerFechaHoy();
    const servicesHoy = calendarDates
        .filter(cd => cd.date === fechaHoy && cd.exception_type === '1')
        .map(cd => cd.service_id);

    console.log(`Fecha hoy: ${fechaHoy}`);
    console.log(`Services operando hoy: ${servicesHoy.length}`);

    // 3. Filtrar trips que operan hoy
    const tripsHoy = trips.filter(t => servicesHoy.includes(t.service_id));

    // 4. Filtrar horarios de esta parada específica
    const horariosParada = stopTimes.filter(st => st.stop_id === codParada &&
        tripsHoy.some(t => t.trip_id === st.trip_id)
    );

    // 5. Relacionar con trips y routes para obtener información completa
    const horariosCompletos: HorarioParada[] = horariosParada.map(st => {
        const trip = tripsHoy.find(t => t.trip_id === st.trip_id);
        const route = routes.find(r => r.route_id === trip?.route_id);

        return {
            fechaHoy: fechaHoy,
            hora: st.arrival_time,
            linea: route?.route_short_name || 'Desconocida',
            destino: trip?.trip_headsign || 'Desconocido',
            sentido: trip?.direction_id === '0' ? 'Ida' : 'Vuelta'
        };
    });

    // 6. Ordenar por hora
    horariosCompletos.sort((a, b) => a.hora.localeCompare(b.hora));

    return horariosCompletos;
}