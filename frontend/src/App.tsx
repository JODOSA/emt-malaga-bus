import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import MapScreen from './components/MapScreen'
import './App.css'

function App() {
    const [currentScreen, setCurrentScreen] = useState('welcome')

    if(currentScreen === 'welcome'){
        return <WelcomeScreen onStart={() => setCurrentScreen('map')} />
    }

    if(currentScreen === 'map'){
        return <MapScreen onBack={() => setCurrentScreen('welcome')} />
    }

    return null
}

export default App