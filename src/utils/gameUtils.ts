import { Enemy, Star, Particle, PowerUp, Bullet } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_TYPES } from '../constants';

let nextId = 0;
export const getNextId = () => ++nextId;

export const resetIds = () => { nextId = 0; };

export function createStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    speed: 0.5 + Math.random() * 2,
    size: 0.5 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.7,
  }));
}

export function spawnEnemy(level: number): Enemy {
  const types: Array<'basic' | 'fast' | 'tank' | 'boss'> = ['basic'];
  if (level >= 2) types.push('fast');
  if (level >= 3) types.push('tank');
  if (level >= 5 && Math.random() < 0.05) types.push('boss');

  const type = types[Math.floor(Math.random() * types.length)];
  const config = ENEMY_TYPES[type];

  return {
    id: getNextId(),
    x: Math.random() * (CANVAS_WIDTH - config.width),
    y: -config.height,
    width: config.width,
    height: config.height,
    speed: config.speed * (1 + level * 0.1),
    health: config.health + Math.floor(level / 3),
    maxHealth: config.health + Math.floor(level / 3),
    type,
    points: config.points,
    color: config.color,
    shootTimer: Math.floor(Math.random() * config.shootInterval),
  };
}

export function createExplosion(x: number, y: number, color: string, count: number = 10): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    return {
      id: getNextId(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color,
      size: 2 + Math.random() * 4,
    };
  });
}

export function createPowerUp(x: number, y: number): PowerUp {
  const types: Array<'shield' | 'rapid' | 'spread' | 'health'> = ['shield', 'rapid', 'spread', 'health'];
  return {
    id: getNextId(),
    x,
    y,
    type: types[Math.floor(Math.random() * types.length)],
    speed: 2,
  };
}

export function createBullet(
  x: number,
  y: number,
  isPlayer: boolean,
  angle: number = 0
): Bullet {
  const speed = isPlayer ? -10 : 5;
  return {
    id: getNextId(),
    x,
    y,
    speed,
    isPlayer,
    color: isPlayer ? '#ffff00' : '#ff6600',
  };
}

export function checkCollision(
  a: { x: number; y: number; width?: number; height?: number },
  b: { x: number; y: number; width?: number; height?: number }
): boolean {
  const aw = a.width || 4;
  const ah = a.height || 4;
  const bw = b.width || 4;
  const bh = b.height || 4;

  return (
    a.x < b.x + bw &&
    a.x + aw > b.x &&
    a.y < b.y + bh &&
    a.y + ah > b.y
  );
}

export function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  isPlayer: boolean
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);

  if (isPlayer) {
    // Draw player ship
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(-width / 2, height / 2);
    ctx.lineTo(-width / 4, height / 3);
    ctx.lineTo(0, height / 2.5);
    ctx.lineTo(width / 4, height / 3);
    ctx.lineTo(width / 2, height / 2);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Engine glow
    ctx.beginPath();
    ctx.arc(0, height / 3, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffff';
    ctx.fill();
  } else {
    // Draw enemy ship
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(-width / 2, -height / 2);
    ctx.lineTo(-width / 4, -height / 3);
    ctx.lineTo(0, -height / 2.5);
    ctx.lineTo(width / 4, -height / 3);
    ctx.lineTo(width / 2, -height / 2);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}
