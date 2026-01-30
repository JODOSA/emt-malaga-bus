import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';

interface Parada{
    codParada: string;
    nombreParada: string;
    direccion: string,
    lat: string;
    lon: string;
    codLinea: string;
}

export function cargarParadas(): Promise<Parada[]>{
    return new Promise((resolve, reject) => {
        //const archivo = fs.readFileSync('./data/paradas/lineasyparadas.csv', 'utf-8');
        const archivo = fs.readFileSync(
            path.join(process.cwd(), 'data/paradas/lineasyparadas.csv'), 'utf-8'
        );

        Papa.parse(archivo, {
            header: true,
            complete: (result) => {
                resolve(result.data as Parada[]);
            },
            error: (error: Error) => {
                reject(error);
            }
        });
    });
}