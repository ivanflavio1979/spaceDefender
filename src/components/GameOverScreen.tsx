import React from 'react';

interface GameOverScreenProps {
  score: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  level,
  highScore,
  isNewHighScore,
  onRestart,
  onMenu,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-10">
      <div className="text-center">
        <h2 className="text-5xl font-bold mb-4 text-red-500 animate-pulse">
          GAME OVER
        </h2>

        {isNewHighScore && (
          <div className="mb-4 animate-bounce">
            <p className="text-2xl text-yellow-400 font-bold">
              🎉 NOVO RECORDE! 🎉
            </p>
          </div>
        )}

        <div className="bg-gray-900/80 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-gray-400 text-sm">Pontuação</p>
              <p className="text-2xl font-bold text-cyan-400">{score.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Nível</p>
              <p className="text-2xl font-bold text-purple-400">{level}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Recorde</p>
              <p className="text-2xl font-bold text-yellow-400">{highScore.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rating</p>
              <p className="text-2xl font-bold text-green-400">
                {score >= 10000 ? '⭐⭐⭐' : score >= 5000 ? '⭐⭐' : '⭐'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-x-4">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-bold rounded-lg 
                       hover:from-green-400 hover:to-cyan-500 transform hover:scale-105 transition-all duration-200
                       shadow-lg shadow-green-500/50"
          >
            🔄 Jogar Novamente
          </button>
          <button
            onClick={onMenu}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-lg 
                       hover:from-gray-500 hover:to-gray-600 transform hover:scale-105 transition-all duration-200"
          >
            📋 Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
