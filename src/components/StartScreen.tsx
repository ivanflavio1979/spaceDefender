import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse">
          SPACE DEFENDER
        </h1>
        <p className="text-cyan-300 text-lg mb-8">Defenda a galáxia dos invasores!</p>

        <div className="mb-8 space-y-2 text-gray-300 text-sm">
          <p>🎮 <span className="text-cyan-400">WASD</span> ou <span className="text-cyan-400">Setas</span> - Mover</p>
          <p>🔫 <span className="text-cyan-400">Espaço</span> - Atirar</p>
          <p>⏸️ <span className="text-cyan-400">P</span> - Pausar</p>
        </div>

        <div className="mb-8 space-y-1 text-xs text-gray-400">
          <p>🛡️ <span className="text-blue-400">Escudo</span> - Proteção temporária</p>
          <p>⚡ <span className="text-yellow-400">Tiro Rápido</span> - Cadência aumentada</p>
          <p>🌟 <span className="text-purple-400">Trio</span> - 3 tiros simultâneos</p>
          <p>💚 <span className="text-green-400">Vida</span> - Recupera 1 HP</p>
        </div>

        {highScore > 0 && (
          <p className="text-yellow-400 mb-4 text-lg">
            🏆 Recorde: {highScore.toLocaleString()}
          </p>
        )}

        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl rounded-lg 
                     hover:from-cyan-400 hover:to-purple-500 transform hover:scale-105 transition-all duration-200
                     shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70"
        >
          🚀 INICIAR JOGO
        </button>

        <p className="text-gray-500 text-xs mt-4">Pressione ENTER para começar</p>
      </div>
    </div>
  );
};

export default StartScreen;
