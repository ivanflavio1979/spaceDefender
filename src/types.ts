export interface Position {
  x: number;
  y: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  speed: number;
  isPlayer: boolean;
  color: string;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  maxHealth: number;
  type: 'basic' | 'fast' | 'tank' | 'boss';
  points: number;
  color: string;
  shootTimer: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'shield' | 'rapid' | 'spread' | 'health';
  speed: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  health: number;
  maxHealth: number;
  shield: boolean;
  shieldTimer: number;
  rapidFire: boolean;
  rapidFireTimer: number;
  spreadShot: boolean;
  spreadShotTimer: number;
  shootCooldown: number;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
}

export interface GameState {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  particles: Particle[];
  powerUps: PowerUp[];
  stars: Star[];
  score: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameover';
  highScore: number;
  combo: number;
  comboTimer: number;
}
