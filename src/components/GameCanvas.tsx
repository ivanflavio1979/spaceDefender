import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameState, Player, Bullet, Enemy, Particle, PowerUp } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_CONFIG, POWERUP_CONFIG, COLORS } from '../constants';
import {
  createStars,
  spawnEnemy,
  createExplosion,
  createPowerUp,
  createBullet,
  checkCollision,
  drawShip,
  getNextId,
  resetIds,
} from '../utils/gameUtils';

interface GameCanvasProps {
  onGameOver: (score: number, level: number) => void;
  onScoreUpdate: (score: number, level: number, health: number, combo: number, shield: boolean, rapidFire: boolean, spreadShot: boolean) => void;
  isPaused: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const animFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const enemiesKilledRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const [isPausedState, setIsPausedState] = useState(false);

  useEffect(() => {
    setIsPausedState(isPaused);
  }, [isPaused]);

  const initGame = useCallback(() => {
    resetIds();
    const player: Player = {
      x: CANVAS_WIDTH / 2 - PLAYER_CONFIG.width / 2,
      y: CANVAS_HEIGHT - 80,
      width: PLAYER_CONFIG.width,
      height: PLAYER_CONFIG.height,
      speed: PLAYER_CONFIG.speed,
      health: PLAYER_CONFIG.maxHealth,
      maxHealth: PLAYER_CONFIG.maxHealth,
      shield: false,
      shieldTimer: 0,
      rapidFire: false,
      rapidFireTimer: 0,
      spreadShot: false,
      spreadShotTimer: 0,
      shootCooldown: 0,
    };

    const state: GameState = {
      player,
      bullets: [],
      enemies: [],
      particles: [],
      powerUps: [],
      stars: createStars(100),
      score: 0,
      level: 1,
      gameStatus: 'playing',
      highScore: parseInt(localStorage.getItem('spaceDefenderHighScore') || '0'),
      combo: 0,
      comboTimer: 0,
    };

    gameStateRef.current = state;
    frameCountRef.current = 0;
    enemiesKilledRef.current = 0;
    spawnTimerRef.current = 0;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.key.toLowerCase());
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key.toLowerCase());
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateGame = useCallback(() => {
    const state = gameStateRef.current;
    if (!state || state.gameStatus !== 'playing' || isPausedState) return;

    const { player } = state;
    const keys = keysRef.current;
    frameCountRef.current++;

    // Player movement
    if ((keys.has('arrowleft') || keys.has('a')) && player.x > 0) {
      player.x -= player.speed;
    }
    if ((keys.has('arrowright') || keys.has('d')) && player.x < CANVAS_WIDTH - player.width) {
      player.x += player.speed;
    }
    if ((keys.has('arrowup') || keys.has('w')) && player.y > CANVAS_HEIGHT / 2) {
      player.y -= player.speed;
    }
    if ((keys.has('arrowdown') || keys.has('s')) && player.y < CANVAS_HEIGHT - player.height - 10) {
      player.y += player.speed;
    }

    // Player shooting
    if (player.shootCooldown > 0) player.shootCooldown--;
    const cooldown = player.rapidFire ? PLAYER_CONFIG.rapidShootCooldown : PLAYER_CONFIG.shootCooldown;
    if (keys.has(' ') && player.shootCooldown <= 0) {
      player.shootCooldown = cooldown;
      if (player.spreadShot) {
        state.bullets.push(
          createBullet(player.x + player.width / 2 - 2, player.y, true),
        );
        const leftBullet = createBullet(player.x + player.width / 2 - 2, player.y + 5, true);
        leftBullet.x -= 10;
        state.bullets.push(leftBullet);
        const rightBullet = createBullet(player.x + player.width / 2 - 2, player.y + 5, true);
        rightBullet.x += 10;
        state.bullets.push(rightBullet);
      } else {
        state.bullets.push(
          createBullet(player.x + player.width / 2 - 2, player.y, true)
        );
      }
    }

    // Update power-up timers
    if (player.shield) {
      player.shieldTimer--;
      if (player.shieldTimer <= 0) player.shield = false;
    }
    if (player.rapidFire) {
      player.rapidFireTimer--;
      if (player.rapidFireTimer <= 0) player.rapidFire = false;
    }
    if (player.spreadShot) {
      player.spreadShotTimer--;
      if (player.spreadShotTimer <= 0) player.spreadShot = false;
    }

    // Combo timer
    if (state.combo > 0) {
      state.comboTimer--;
      if (state.comboTimer <= 0) state.combo = 0;
    }

    // Update stars
    state.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }
    });

    // Update bullets
    state.bullets = state.bullets.filter(bullet => {
      bullet.y += bullet.speed;
      return bullet.y > -20 && bullet.y < CANVAS_HEIGHT + 20;
    });

    // Spawn enemies
    const spawnRate = Math.max(30, 90 - state.level * 5);
    spawnTimerRef.current++;
    if (spawnTimerRef.current >= spawnRate) {
      spawnTimerRef.current = 0;
      state.enemies.push(spawnEnemy(state.level));
    }

    // Update enemies
    state.enemies.forEach(enemy => {
      enemy.y += enemy.speed;
      enemy.shootTimer--;

      // Enemy shooting
      if (enemy.shootTimer <= 0 && enemy.y > 0 && enemy.y < CANVAS_HEIGHT * 0.7) {
        const config = { shootInterval: enemy.type === 'fast' ? 90 : enemy.type === 'tank' ? 80 : enemy.type === 'boss' ? 40 : 120 };
        enemy.shootTimer = config.shootInterval;
        state.bullets.push(
          createBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height, false)
        );
      }
    });

    // Remove off-screen enemies
    state.enemies = state.enemies.filter(e => e.y < CANVAS_HEIGHT + 50);

    // Update particles
    state.particles = state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vx *= 0.98;
      p.vy *= 0.98;
      return p.life > 0;
    });

    // Update power-ups
    state.powerUps = state.powerUps.filter(p => {
      p.y += p.speed;
      return p.y < CANVAS_HEIGHT + 20;
    });

    // Collision: player bullets vs enemies
    const bulletsToRemove = new Set<number>();
    const enemiesToRemove = new Set<number>();

    state.bullets.forEach(bullet => {
      if (!bullet.isPlayer) return;
      state.enemies.forEach(enemy => {
        if (checkCollision(bullet, enemy)) {
          bulletsToRemove.add(bullet.id);
          enemy.health--;
          // Small hit particles
          state.particles.push(...createExplosion(bullet.x, bullet.y, '#ffff00', 3));

          if (enemy.health <= 0) {
            enemiesToRemove.add(enemy.id);
            state.particles.push(...createExplosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              enemy.color,
              enemy.type === 'boss' ? 30 : 15
            ));

            // Score with combo
            state.combo++;
            state.comboTimer = 60;
            const comboMultiplier = Math.min(state.combo, 10);
            state.score += enemy.points * comboMultiplier;

            // Power-up drop
            if (Math.random() < POWERUP_CONFIG.spawnChance * 10 || enemy.type === 'boss') {
              state.powerUps.push(createPowerUp(enemy.x + enemy.width / 2, enemy.y));
            }

            enemiesKilledRef.current++;
          }
        }
      });
    });

    state.bullets = state.bullets.filter(b => !bulletsToRemove.has(b.id));
    state.enemies = state.enemies.filter(e => !enemiesToRemove.has(e.id));

    // Collision: enemy bullets vs player
    state.bullets = state.bullets.filter(bullet => {
      if (bullet.isPlayer) return true;
      if (checkCollision(bullet, player)) {
        if (player.shield) {
          state.particles.push(...createExplosion(bullet.x, bullet.y, COLORS.shield, 5));
          return false;
        }
        player.health--;
        state.particles.push(...createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', 8));
        if (player.health <= 0) {
          state.gameStatus = 'gameover';
          state.particles.push(...createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#00ffcc', 30));
        }
        return false;
      }
      return true;
    });

    // Collision: enemies vs player
    state.enemies = state.enemies.filter(enemy => {
      if (checkCollision(enemy, player)) {
        if (!player.shield) {
          player.health -= 2;
          state.particles.push(...createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', 10));
          if (player.health <= 0) {
            state.gameStatus = 'gameover';
          }
        }
        state.particles.push(...createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 10));
        state.score += Math.floor(enemy.points / 2);
        return false;
      }
      return true;
    });

    // Collision: power-ups vs player
    state.powerUps = state.powerUps.filter(powerUp => {
      if (checkCollision(powerUp, { x: player.x, y: player.y, width: player.width, height: player.height })) {
        switch (powerUp.type) {
          case 'shield':
            player.shield = true;
            player.shieldTimer = POWERUP_CONFIG.duration;
            break;
          case 'rapid':
            player.rapidFire = true;
            player.rapidFireTimer = POWERUP_CONFIG.duration;
            break;
          case 'spread':
            player.spreadShot = true;
            player.spreadShotTimer = POWERUP_CONFIG.duration;
            break;
          case 'health':
            player.health = Math.min(player.health + 1, player.maxHealth);
            break;
        }
        state.particles.push(...createExplosion(powerUp.x, powerUp.y, '#ffffff', 8));
        return false;
      }
      return true;
    });

    // Level up
    const enemiesForNextLevel = state.level * 10 + 5;
    if (enemiesKilledRef.current >= enemiesForNextLevel) {
      state.level++;
      enemiesKilledRef.current = 0;
      // Level up effect
      state.particles.push(...createExplosion(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#00ffcc', 20));
    }

    // Update HUD
    onScoreUpdate(
      state.score,
      state.level,
      player.health,
      state.combo,
      player.shield,
      player.rapidFire,
      player.spreadShot
    );

    // Check game over
    const currentStatus: string = state.gameStatus;
    if (currentStatus === 'gameover') {
      const highScore = Math.max(state.score, state.highScore);
      localStorage.setItem('spaceDefenderHighScore', highScore.toString());
      onGameOver(state.score, state.level);
    }
  }, [isPausedState, onGameOver, onScoreUpdate]);

  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    const state = gameStateRef.current;
    if (!canvas || !state) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    state.stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
    });

    // Draw power-ups
    state.powerUps.forEach(powerUp => {
      ctx.save();
      ctx.translate(powerUp.x, powerUp.y);
      const pulse = Math.sin(frameCountRef.current * 0.1) * 3;

      let color = '#ffffff';
      let emoji = '?';
      switch (powerUp.type) {
        case 'shield': color = COLORS.shield; emoji = '🛡️'; break;
        case 'rapid': color = COLORS.rapid; emoji = '⚡'; break;
        case 'spread': color = COLORS.spread; emoji = '🌟'; break;
        case 'health': color = COLORS.health; emoji = '💚'; break;
      }

      ctx.beginPath();
      ctx.arc(0, 0, 12 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = color + '44';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 0, 0);
      ctx.restore();
    });

    // Draw enemies
    state.enemies.forEach(enemy => {
      drawShip(ctx, enemy.x, enemy.y, enemy.width, enemy.height, enemy.color, false);

      // Health bar for tanks and bosses
      if (enemy.maxHealth > 1) {
        const barWidth = enemy.width;
        const barHeight = 3;
        const barX = enemy.x;
        const barY = enemy.y - 8;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = enemy.health > enemy.maxHealth * 0.5 ? '#00ff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * (enemy.health / enemy.maxHealth), barHeight);
      }
    });

    // Draw bullets
    state.bullets.forEach(bullet => {
      ctx.save();
      ctx.shadowColor = bullet.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, 4, 12);
      ctx.restore();
    });

    // Draw particles
    state.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Draw player
    if (state.player.health > 0) {
      const { player } = state;

      // Shield effect
      if (player.shield) {
        ctx.beginPath();
        ctx.arc(
          player.x + player.width / 2,
          player.y + player.height / 2,
          player.width * 0.8,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = COLORS.shield + '88';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = COLORS.shield + '22';
        ctx.fill();
      }

      // Engine trail
      ctx.beginPath();
      const trailLength = 10 + Math.random() * 5;
      ctx.moveTo(player.x + player.width / 2 - 5, player.y + player.height);
      ctx.lineTo(player.x + player.width / 2, player.y + player.height + trailLength);
      ctx.lineTo(player.x + player.width / 2 + 5, player.y + player.height);
      ctx.fillStyle = '#00ffff88';
      ctx.fill();

      drawShip(ctx, player.x, player.y, player.width, player.height, COLORS.player, true);
    }

    // Pause overlay
    if (isPausedState) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('⏸️ PAUSADO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Pressione P para continuar', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    }
  }, [isPausedState]);

  const gameLoop = useCallback(() => {
    updateGame();
    renderGame();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, renderGame]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameLoop]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block rounded-lg shadow-2xl shadow-cyan-500/20 border border-gray-800"
    />
  );
};

export default GameCanvas;
