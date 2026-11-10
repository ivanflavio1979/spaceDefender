import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import HUD from './components/HUD';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

type Screen = 'menu' | 'playing' | 'gameover';

interface GameResult {
  score: number;
  level: number;
}

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('spaceDefenderHighScore') || '0')
  );
  const [lastResult, setLastResult] = useState<GameResult>({ score: 0, level: 1 });
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // HUD state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(5);
  const [combo, setCombo] = useState(0);
  const [shield, setShield] = useState(false);
  const [rapidFire, setRapidFire] = useState(false);
  const [spreadShot, setSpreadShot] = useState(false);

  const handleStart = useCallback(() => {
    setScreen('playing');
    setScore(0);
    setLevel(1);
    setHealth(5);
    setCombo(0);
    setShield(false);
    setRapidFire(false);
    setSpreadShot(false);
    setIsPaused(false);
  }, []);

  const handleGameOver = useCallback((finalScore: number, finalLevel: number) => {
    const newHighScore = Math.max(finalScore, highScore);
    setLastResult({ score: finalScore, level: finalLevel });
    setIsNewHighScore(finalScore > highScore);
    setHighScore(newHighScore);
    setScreen('gameover');
  }, [highScore]);

  const handleScoreUpdate = useCallback((
    newScore: number,
    newLevel: number,
    newHealth: number,
    newCombo: number,
    newShield: boolean,
    newRapidFire: boolean,
    newSpreadShot: boolean
  ) => {
    setScore(newScore);
    setLevel(newLevel);
    setHealth(newHealth);
    setCombo(newCombo);
    setShield(newShield);
    setRapidFire(newRapidFire);
    setSpreadShot(newSpreadShot);
  }, []);

  // Handle pause key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p' && screen === 'playing') {
        setIsPaused(prev => !prev);
      }
      if (e.key === 'Enter' && screen === 'menu') {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, handleStart]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Game container */}
      <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        {/* Game Canvas */}
        {screen === 'playing' && (
          <>
            <GameCanvas
              onGameOver={handleGameOver}
              onScoreUpdate={handleScoreUpdate}
              isPaused={isPaused}
            />
            <HUD
              score={score}
              level={level}
              health={health}
              maxHealth={5}
              combo={combo}
              shield={shield}
              rapidFire={rapidFire}
              spreadShot={spreadShot}
            />
          </>
        )}

        {/* Start Screen */}
        {screen === 'menu' && (
          <div className="relative w-full h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-purple-900/10" />
            <StartScreen onStart={handleStart} highScore={highScore} />
          </div>
        )}

        {/* Game Over Screen */}
        {screen === 'gameover' && (
          <div className="relative w-full h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
            <GameOverScreen
              score={lastResult.score}
              level={lastResult.level}
              highScore={highScore}
              isNewHighScore={isNewHighScore}
              onRestart={handleStart}
              onMenu={() => setScreen('menu')}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-xs">
          🎮 Space Defender • Feito com React + Canvas
        </p>
      </div>
    </div>
  );
}

export default App;
