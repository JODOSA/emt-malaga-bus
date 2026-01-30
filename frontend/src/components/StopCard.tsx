import './StopCard.css'
import type { Schedule } from '../types'

interface StopCardProps {
    stop_id: string
    stop_name: string
    distancia: number
    isExpanded: boolean
    onClick: () => void
    schedules: Schedule[]
    isLoadingSchedules: boolean
}

function StopCard({ stop_name, distancia, isExpanded, onClick, schedules, isLoadingSchedules }: StopCardProps) {
    return (
        <div className='stop-card' onClick={onClick}>
            <div className='stop-name'>{stop_name}</div>
            <div className='stop-distance'>📏 {Math.round(distancia)} metros</div>

            {isExpanded && (
                <div className='schedules-container' onClick={(e) => e.stopPropagation()}>
                    {isLoadingSchedules ? (
                    <p className='loading-text'>Cargando horarios...</p>
                    ) : schedules.length === 0 ? (
                    <p className='no-schedules'>No hay horarios disponibles</p>
                    ) : (
                    <>
                        <div className='schedules-header'>
                        <div className='schedules-title'>🕐 Próximos horarios</div>
                        <div className='current-date'>
                            Hoy, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        </div>
                        
                        <div className='schedule-list'>
                        {schedules.map((schedule, index) => (
                            <div key={index} className='schedule-item'>
                            <div className='schedule-line'>{schedule.linea}</div>
                            <div className='schedule-info'>
                                <div className='schedule-time'>{schedule.hora.substring(0, 5)}</div>
                                <div className='schedule-destination'>→ {schedule.destino}</div>
                                <div className='schedule-direction'>{schedule.sentido}</div>
                            </div>
                            </div>
                        ))}
                        </div>
                    </>
                    )}
                </div>
                )}
        </div>
    )
}

export default StopCard