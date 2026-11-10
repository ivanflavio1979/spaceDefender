import React from 'react';

interface HUDProps {
  score: number;
  level: number;
  health: number;
  maxHealth: number;
  combo: number;
  shield: boolean;
  rapidFire: boolean;
  spreadShot: boolean;
}

const HUD: React.FC<HUDProps> = ({ score, level, health, maxHealth, combo, shield, rapidFire, spreadShot }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start pointer-events-none z-5">
      {/* Left side - Health and Power-ups */}
      <div className="space-y-2">
        {/* Health bar */}
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-sm">❤️</span>
          <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300 rounded-full"
              style={{ width: `${(health / maxHealth) * 100}%` }}
            />
          </div>
          <span className="text-white text-xs font-mono">{health}/{maxHealth}</span>
        </div>

        {/* Active power-ups */}
        <div className="flex gap-1">
          {shield && (
            <span className="px-2 py-0.5 bg-blue-500/30 border border-blue-400 rounded text-xs text-blue-300 animate-pulse">
              🛡️ Escudo
            </span>
          )}
          {rapidFire && (
            <span className="px-2 py-0.5 bg-yellow-500/30 border border-yellow-400 rounded text-xs text-yellow-300 animate-pulse">
              ⚡ Rápido
            </span>
          )}
          {spreadShot && (
            <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-400 rounded text-xs text-purple-300 animate-pulse">
              🌟 Trio
            </span>
          )}
        </div>
      </div>

      {/* Center - Combo */}
      {combo > 1 && (
        <div className="text-center">
          <p className="text-orange-400 font-bold text-lg animate-bounce">
            🔥 x{combo} COMBO!
          </p>
        </div>
      )}

      {/* Right side - Score and Level */}
      <div className="text-right">
        <p className="text-cyan-400 font-bold text-xl font-mono">
          {score.toLocaleString()}
        </p>
        <p className="text-purple-400 text-sm font-mono">
          Nível {level}
        </p>
      </div>
    </div>
  );
};

export default HUD;
