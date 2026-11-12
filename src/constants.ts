export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_CONFIG = {
  width: 40,
  height: 40,
  speed: 6,
  maxHealth: 5,
  shootCooldown: 15,
  rapidShootCooldown: 5,
};

export const BULLET_CONFIG = {
  playerSpeed: 10,
  enemySpeed: 5,
  width: 4,
  height: 12,
};

export const ENEMY_TYPES = {
  basic: {
    width: 30,
    height: 30,
    speed: 1.5,
    health: 1,
    points: 100,
    color: '#ff4444',
    shootInterval: 120,
  },
  fast: {
    width: 25,
    height: 25,
    speed: 3,
    health: 1,
    points: 150,
    color: '#ffaa00',
    shootInterval: 90,
  },
  tank: {
    width: 40,
    height: 40,
    speed: 0.8,
    health: 3,
    points: 300,
    color: '#aa44ff',
    shootInterval: 80,
  },
  boss: {
    width: 60,
    height: 60,
    speed: 0.5,
    health: 10,
    points: 1000,
    color: '#ff0066',
    shootInterval: 40,
  },
};

export const POWERUP_CONFIG = {
  duration: 300,
  speed: 2,
  spawnChance: 0.02,
};

export const LEVEL_CONFIG = {
  enemiesPerLevel: 10,
  speedMultiplier: 0.1,
  spawnRateMultiplier: 0.85,
};

export const COLORS = {
  background: '#0a0a1a',
  player: '#00ffcc',
  playerGlow: '#00ffcc44',
  bullet: '#ffff00',
  enemyBullet: '#ff6600',
  shield: '#00aaff',
  rapid: '#ffaa00',
  spread: '#ff00ff',
  health: '#00ff00',
  text: '#ffffff',
  textGlow: '#00ffcc',
};
