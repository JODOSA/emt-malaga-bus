import { rejects } from 'assert';
import fs from 'fs';
import Papa from 'papaparse';

interface StopTime {
    trip_id: string;
    arrival_time: string;
    departure_time: string;
    stop_id: string;
    stop_sequence: string;
}

interface Trip {
    route_id: string;
    service_id: string;
    trip_id: string;
    trip_headsign: string;
    direction_id: string;
}

interface Route {
    route_id: string;
    route_short_name: string;
    route_long_name: string;
}

interface CalendarDate {
    service_id: string;
    date: string;
    exception_type: string;
}

export function cargarCalendarDates(): Promise<CalendarDate[]> {
    return new Promise((resolve, reject) => {
        const archivo = fs.readFileSync('./data/gtfs/calendar_dates.csv', 'utf-8');
        Papa.parse(archivo, {
            header:true,
            complete: (results) => resolve(results.data as CalendarDate[]),
            error: (error: Error) => reject(error)
        });
    });
}

export function cargarStopTimes(): Promise<StopTime[]> {
    return new Promise((resolve, reject) => {
        const archivo = fs.readFileSync('./data/gtfs/stop_times.csv', 'utf-8');
        Papa.parse(archivo, {
            header: true,
            complete: (results) => resolve(results.data as StopTime[]),
            error: (error: Error) => reject(error)
        });
    });
}
export function cargarTrips(): Promise<Trip[]> {
    return new Promise((resolve, reject) => {
        const archivo = fs.readFileSync('./data/gtfs/trips.csv', 'utf-8');
        Papa.parse(archivo, {
            header:true,
            complete: (results) => resolve(results.data as Trip[]),
            error: (error: Error) => reject(error)
        });
    });
}

export function cargarRoutes(): Promise<Route[]> {
    return new Promise((resolve, reject) => {
        const archivo = fs.readFileSync('./data/gtfs/routes.csv', 'utf-8');
        Papa.parse(archivo, {
            header: true,
            complete: (results) => resolve(results.data as Route[]),
            error: (error: Error) => reject(error)
        });
    });
}
