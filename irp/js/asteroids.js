export const asteroids = [];

export function createAsteroid(x, y, size) {
  const points = Math.floor(Math.random() * 6) + 6;
  const verts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const radius = size * (0.7 + Math.random() * 0.6);
    verts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  return {
    x, y,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    verts,
    size
  };
}

export function spawnAsteroids(count) {
  asteroids.length = 0;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 300;
    const size = Math.random() * 30 + 20;
    asteroids.push(createAsteroid(x, y, size));
  }
}

export function worldVerts(obj){
  return obj.verts.map(v => ({ x: obj.x + v.x, y: obj.y + v.y }));
}

export function updateAsteroids(dt, mission = 1){
  asteroids.forEach(a => {
    a.x += a.vx * dt;
    a.y += a.vy * dt + 0.2 * dt;
    // Wraparound (disabled for Mission 3)
    if (mission !== 3) {
      if(a.x > 800) a.x = 0;
      if(a.x < 0) a.x = 800;
      if(a.y > 600) a.y = 0;
      if(a.y < 0) a.y = 600;
    }
  });
}

export function drawAsteroids(ctx){
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;

  asteroids.forEach(a => {
    const verts = worldVerts(a);

    // Draw main asteroid
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
    ctx.closePath();
    ctx.stroke();

    // Draw ghost copies for wraparound
    const offsets = [
      [-800, 0], [800, 0],
      [0, -600], [0, 600],
      [-800,-600], [800,-600],
      [-800,600], [800,600]
    ];

    const nearEdgeX = a.x < 50 || a.x > 750;
    const nearEdgeY = a.y < 50 || a.y > 550;

    if(nearEdgeX || nearEdgeY){
      offsets.forEach(offset => {
        ctx.beginPath();
        ctx.moveTo(verts[0].x + offset[0], verts[0].y + offset[1]);
        for(let i = 1; i < verts.length; i++){
          ctx.lineTo(verts[i].x + offset[0], verts[i].y + offset[1]);
        }
        ctx.closePath();
        ctx.stroke();
      });
    }
  });
}
