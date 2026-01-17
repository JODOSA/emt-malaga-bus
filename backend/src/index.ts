import express, { Request, Response } from 'express';
import cors from 'cors';
import { cargarParadas } from './services/dataLoader';
import { buscarParadasCercanas } from './services/paradaService';
import { obtenerHorariosParada } from './services/horarioService';

const app = express();
const PORT = 3000;

// Permitir peticiones desde el frontend
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API de EMT Málaga funcionando'});
});

// Solicitar paradas cercanas
app.get('/api/paradas/cercanas', async(req: Request, res: Response) => {
    try{
        const { lat, lon } = req.query;

        if(!lat || !lon) {
            return res.status(400).json({ error: 'Faltan parámetros lat y lon'});
        }

        const paradas = await buscarParadasCercanas(
            parseFloat(lat as string),
            parseFloat(lon as string)
        );

        res.json({
            ubicacionUsuario: { lat: parseFloat(lat as string), lon: parseFloat(lon as string)},
            paradasCercanas: paradas
        });
    }catch (error){
        res.status(500).json({error: 'Error al buscar paradas cercanas'});
    }
});

// Ruta de prueba para paradas
app.get('/api/paradas', async (req:Request, res:Response) => {
    try{
        const paradas = await cargarParadas();

        console.log('Total de paradas: ', paradas.length);
        console.log('Primera parada: ', paradas[0]);

        res.json({
        message: 'Paradas cargadas exitosamente',
        total: paradas.length,
        paradas: paradas.slice(0, 5) // Solo las primeras 5, para no saturar
        });
    }
    catch (error){
        res.status(500).json({ error: 'Error al cargar paradas' });
    }
    
    });

// Ruta de preba para horarios
app.get('/api/horarios/:paradaId',async(req: Request, res: Response) => {
    try{
        const { paradaId } = req.params;
        const horarios = await obtenerHorariosParada(paradaId);

        res.json({
            paradaId,
            totalHorarios: horarios.length,
            horarios: horarios.slice(0, 10) // Primeros 10 para no saturar
        });
    }catch (error){
        res.status(500).json({ error: 'Error al obtener horarios' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});