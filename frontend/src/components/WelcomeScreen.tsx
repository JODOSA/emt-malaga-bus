import './WelcomeScreen.css'

// Definimos el tipo de las props que recibe
interface WelcomeScreenProps {
    onStart: () => void
}

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="welcome-container">
      <div className="bus-icon">🚌</div>
      <h1>MiBus Málaga</h1>
      <p className="tagline">Tu parada de bus más cercana, a un click</p>
      
      <button className="start-button" onClick={onStart}>
        Empezar
      </button>
      
      <div className="features-section">
        <div className="features-title">¿Qué puedes hacer?</div>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">📍</div>
            <div className="feature-text">Encuentra tu ubicación en tiempo real</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🕐</div>
            <div className="feature-text">Consulta horarios actualizados</div>
          </div>
          <div className="feature">
            <div className="feature-icon">🗺️</div>
            <div className="feature-text">Descubre paradas cercanas</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen