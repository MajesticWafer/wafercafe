// Astrophage Cloud System
// Clouds that the player must sample for Project Hail Mary mission

export const astrophageClouds = [];
let cloudIdCounter = 0;

export function createAstrophageCloud(x, y) {
  astrophageClouds.push({
    id: cloudIdCounter++,
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 0.1,
    vy: (Math.random() - 0.5) * 0.1,
    radius: 30 + Math.random() * 20,
    collected: false,
    particleAge: 0
  });
  return astrophageClouds[astrophageClouds.length - 1];
}

export function spawnAstrophageClouds(count = 3) {
  // Remove old clouds
  astrophageClouds.length = 0;
  
  for (let i = 0; i < count; i++) {
    // Spread clouds around the map
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 200 + Math.random() * 150;
    const x = 400 + Math.cos(angle) * distance;
    const y = 300 + Math.sin(angle) * distance;
    createAstrophageCloud(x, y);
  }
}

export function updateAstrophageClouds(timeScale = 1) {
  astrophageClouds.forEach((cloud, i) => {
    // Slow drift movement
    cloud.x += cloud.vx * timeScale;
    cloud.y += cloud.vy * timeScale;
    cloud.particleAge += 0.5 * timeScale;
    
    // Wraparound
    if (cloud.x > 800) cloud.x = 0;
    if (cloud.x < 0) cloud.x = 800;
    if (cloud.y > 600) cloud.y = 0;
    if (cloud.y < 0) cloud.y = 600;
  });
}

export function drawAstrophageClouds(ctx) {
  astrophageClouds.forEach(cloud => {
    ctx.save();
    
    if (cloud.collected) {
      ctx.globalAlpha = 0.3;
    }
    
    // Draw cloud with pulsing effect
    const pulse = Math.sin(cloud.particleAge * 0.05) * 0.2 + 0.8;
    const radius = cloud.radius * pulse;
    
    // Main cloud glow
    ctx.fillStyle = `rgba(100, 200, 255, ${0.4 * (cloud.collected ? 0.3 : 1)})`;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Cloud outline
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 * (cloud.collected ? 0.3 : 1)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner glow
    ctx.strokeStyle = `rgba(100, 255, 255, ${0.5 * (cloud.collected ? 0.3 : 1)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ASTROPHAGE', cloud.x, cloud.y);
    
    ctx.restore();
  });
}

export function checkCloudCollision(shipX, shipY) {
  let collected = null;
  
  astrophageClouds.forEach(cloud => {
    if (!cloud.collected) {
      const dx = shipX - cloud.x;
      const dy = shipY - cloud.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < cloud.radius + 15) {
        cloud.collected = true;
        collected = cloud;
      }
    }
  });
  
  return collected;
}

export function getCollectedCount() {
  return astrophageClouds.filter(c => c.collected).length;
}

export function getTotalCloudCount() {
  return astrophageClouds.length;
}
