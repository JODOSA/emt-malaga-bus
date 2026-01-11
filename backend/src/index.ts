import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'API de EMT Málaga funcionando'});
});

// Ruta de prueba para paradas
app.get('/api/paradas', (req:Request, res:Response) => {
    res.json({
        message: 'Aquí irán las paradas cercanas',
        paradas:[]
    });
});

// Ruta de preba para horarios
app.get('/api/horarios/:paradaId', (req:Request, res:Response) => {
    const { paradaId } = req.params;
    res.json({
        message: `Aquí irán los horarios de la parada ${paradaId}`,
        horarios:[]
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});