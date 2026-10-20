import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import type { Screen } from './types/game';
import Icon from './components/common/Icon';
import GameSelectPage from './pages/GameSelectPage';
import ReactionGamePage from './pages/ReactionGamePage';
import AimGamePage from './pages/AimGamePage';

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <>
      <main className={`app-shell screen-${screen}`}>
        <header>
          <button className='brand' onClick={() => setScreen("home")} aria-label='Về trang chủ'>
            <span className='brand-mark'>
              <span>
                <Icon name='bolt'/>
              </span>
            </span>

            <span>Reflex Lab</span>
          </button>

          <span className='header-label'>
            {screen === "home" ? "Performance training" : screen}
          </span>
        </header>

        {screen === "home" && (
          <HomePage onNavigate={setScreen}/>
        )}

        {screen === "games" && (
          <GameSelectPage onNavigate={setScreen}/>
        )}
        
        {screen === "reaction" && (
          <ReactionGamePage onNavigate={setScreen}/>
        )}
        
        {screen === "aim" && (
          <AimGamePage onNavigate={setScreen}/>
        )}
      </main>
    </>
  )
}

export default App
