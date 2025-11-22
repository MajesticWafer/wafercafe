export const bullets = [];

const BASE_BULLET_SPEED = 1.4;
const BULLET_LIFE = 200;
const MAX_BULLETS = 10;

export function shootBullet(ship){
  // Cap bullets at 10
  if (bullets.length >= MAX_BULLETS) {
    if (window.audioContext && window.noBulletsSound) {
      window.noBulletsSound();
    }
    return;
  }

  const angle = ship.angle;

  // Total ship speed magnitude
  const shipSpeed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);

  // Bullet travels forward + inherits speed magnitude (not components)
  const bulletSpeed = BASE_BULLET_SPEED + shipSpeed;

  const spawnOffset = 15;
  const bx = ship.x + Math.cos(angle) * spawnOffset;
  const by = ship.y + Math.sin(angle) * spawnOffset;

  bullets.push({
    x: bx,
    y: by,
    vx: Math.cos(angle) * bulletSpeed,
    vy: Math.sin(angle) * bulletSpeed,
    life: BULLET_LIFE,
    trail: []
  });

  // Play blaster sound
  if (window.audioContext && window.shootSound) {
    window.shootSound();
  }
}

export function updateBullets(dt){
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    b.trail.push({x: b.x, y: b.y});
    if (b.trail.length > 6) b.trail.shift();

    // wrap
    if (b.x > 800) b.x = 0;
    if (b.x < 0) b.x = 800;
    if (b.y > 600) b.y = 0;
    if (b.y < 0) b.y = 600;

    b.life -= dt;
    if (b.life <= 0) bullets.splice(i, 1);
  }
}

export function drawBullets(ctx){
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;

  bullets.forEach(b => {
    // trail
    if (b.trail.length > 0) {
      ctx.beginPath();
      b.trail.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // dot
    ctx.fillRect(b.x - 1, b.y - 1, 2, 2);

    // wrap ghosts
    const offsets = [-800, 0, 800];
    offsets.forEach(ox => {
      offsets.forEach(oy => {
        if (ox !== 0 || oy !== 0) {
          // trail ghost
          if (b.trail.length > 0) {
            ctx.beginPath();
            b.trail.forEach((p, idx) => {
              if (idx === 0) ctx.moveTo(p.x + ox, p.y + oy);
              else ctx.lineTo(p.x + ox, p.y + oy);
            });
            ctx.stroke();
          }
          // dot ghost
          ctx.fillRect(b.x - 1 + ox, b.y - 1 + oy, 2, 2);
        }
      });
    });
  });
}
