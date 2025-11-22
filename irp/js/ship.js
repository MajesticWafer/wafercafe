export const ship = {
  x: 400, y: 480,
  angle: -Math.PI/2,
  vx: 0, vy: 0,
  fuel: 100,
  maxFuel: 100,
  alive: true,
  thrusting: false
};

export function refuelShip(amount) {
  ship.fuel = Math.min(ship.maxFuel, ship.fuel + amount);
}

export function updateShip(dt, keys) {
  if (!ship.alive) return;

  ship.y -= 0.2 * dt;
  ship.x += ship.vx * dt;
  ship.y += ship.vy * dt;

  ship.thrusting = false;
  if (keys['ArrowLeft']) ship.angle -= 0.05 * dt;
  if (keys['ArrowRight']) ship.angle += 0.05 * dt;
  if (keys['ArrowUp'] && ship.fuel > 0) {
    const thrust = 0.05 * dt;
    ship.vx += Math.cos(ship.angle) * thrust;
    ship.vy += Math.sin(ship.angle) * thrust;
    ship.fuel -= thrust * 2;
    ship.thrusting = true;
    // Play thrust sound
    if (window.thrustSound) window.thrustSound();
  }

  // Wraparound
  if (ship.x > 800) ship.x = 0;
  if (ship.x < 0) ship.x = 800;
  if (ship.y > 600) ship.y = 0;
  if (ship.y < 0) ship.y = 600;
}

export function drawShip(ctx) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(15,0);
  ctx.lineTo(-10,-8);
  ctx.lineTo(-5,0);
  ctx.lineTo(-10,8);
  ctx.closePath();
  ctx.stroke();

  // Thruster flame
  if(ship.thrusting){
    ctx.strokeStyle='orange';
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.lineTo(-15, 0);
    ctx.lineTo(-10, 4);
    ctx.stroke();
  }

  ctx.restore();
}
