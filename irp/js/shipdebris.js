// Ship Debris System
// Creates fractured ship pieces that explode on collision

export const shipDebris = [];
export const respawnPieces = [];

export function createShipDebris(shipX, shipY, shipAngle) {
  const debrisCount = 8;
  
  // Create debris pieces
  for (let i = 0; i < debrisCount; i++) {
    const angle = (Math.PI * 2 * i) / debrisCount + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 0.8 + 0.4;
    
    shipDebris.push({
      x: shipX,
      y: shipY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      life: Math.random() * 60 + 80,
      maxLife: 140,
      size: Math.random() * 3 + 2,
      type: i % 3 // Different piece types for variety
    });
  }
}

export function updateShipDebris(timeScale = 1) {
  shipDebris.forEach((debris, i) => {
    debris.x += debris.vx * timeScale;
    debris.y += debris.vy * timeScale;
    debris.rotation += debris.rotationSpeed * timeScale;
    debris.life -= timeScale;
    
    // Wraparound
    if (debris.x > 800) debris.x = 0;
    if (debris.x < 0) debris.x = 800;
    if (debris.y > 600) debris.y = 0;
    if (debris.y < 0) debris.y = 600;
    
    // Remove when life expires
    if (debris.life <= 0) shipDebris.splice(i, 1);
  });
}

export function drawShipDebris(ctx) {
  shipDebris.forEach(debris => {
    const alpha = Math.max(0, debris.life / debris.maxLife);
    
    ctx.save();
    ctx.translate(debris.x, debris.y);
    ctx.rotate(debris.rotation);
    ctx.globalAlpha = alpha;
    
    // Draw different piece types
    switch (debris.type) {
      case 0: // Front point
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(debris.size * 2, 0);
        ctx.lineTo(-debris.size, -debris.size);
        ctx.lineTo(-debris.size * 0.5, 0);
        ctx.lineTo(-debris.size, debris.size);
        ctx.closePath();
        ctx.stroke();
        break;
      
      case 1: // Side wing piece
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -debris.size);
        ctx.lineTo(debris.size * 1.5, 0);
        ctx.lineTo(0, debris.size);
        ctx.lineTo(-debris.size, debris.size * 0.5);
        ctx.closePath();
        ctx.stroke();
        break;
      
      case 2: // Random shard
        ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, debris.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  });
}

// --- Respawn assembly pieces -------------------------------------------
// Create line segment pieces that fly in and form the ship outline like a puzzle
export function createRespawnPieces(targets, count = 8) {
  respawnPieces.length = 0;

  // targets should be an array of edges: [{p1: {x,y}, p2: {x,y}, rotation}, ...]
  // each target is a line segment where pieces will snap into place
  if (!Array.isArray(targets) || targets.length === 0) {
    // fallback: single point
    targets = [{ p1: { x: 400, y: 480 }, p2: { x: 402, y: 480 }, rotation: 0 }];
  }

  const now = Date.now();
  
  // For each edge target, create multiple small line segment pieces
  for (let i = 0; i < targets.length; i++) {
    const edgeTarget = targets[i];
    const piecesPerEdge = Math.ceil(count / targets.length);
    
    for (let j = 0; j < piecesPerEdge; j++) {
      // start position scattered around edges of screen
      const edge = Math.floor(Math.random() * 4);
      let startX, startY;
      switch (edge) {
        case 0: startX = -80 - Math.random() * 200; startY = Math.random() * 600; break;
        case 1: startX = 800 + 80 + Math.random() * 200; startY = Math.random() * 600; break;
        case 2: startX = Math.random() * 800; startY = -80 - Math.random() * 200; break;
        default: startX = Math.random() * 800; startY = 600 + 80 + Math.random() * 200; break;
      }

      // Compute target center (midpoint of the edge)
      const targetCenterX = (edgeTarget.p1.x + edgeTarget.p2.x) / 2;
      const targetCenterY = (edgeTarget.p1.y + edgeTarget.p2.y) / 2;
      
      const angleToTarget = Math.atan2(targetCenterY - startY, targetCenterX - startX);
      const speed = 2.0 + Math.random() * 1.5;
      const delay = i * 40 + j * 10; // stagger by edge, then by piece within edge

      respawnPieces.push({
        x: startX,
        y: startY,
        vx: Math.cos(angleToTarget) * speed,
        vy: Math.sin(angleToTarget) * speed,
        targetX: targetCenterX,
        targetY: targetCenterY,
        targetRotation: edgeTarget.rotation,
        // Edge segment to draw (for rendering)
        edgeP1: edgeTarget.p1,
        edgeP2: edgeTarget.p2,
        edgeLength: Math.hypot(edgeTarget.p2.x - edgeTarget.p1.x, edgeTarget.p2.y - edgeTarget.p1.y),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        arrived: false,
        ease: 0.04 + Math.random() * 0.06,
        startTime: now + delay,
        glowPulse: 0
      });
    }
  }
}

export function updateRespawnPieces(dt) {
  const now = Date.now();
  for (let i = respawnPieces.length - 1; i >= 0; i--) {
    const p = respawnPieces[i];
    // Skip pieces that haven't started yet (staggered spawn)
    if (now < p.startTime) continue;
    
    if (!p.arrived) {
      // Accelerate towards target with strong attraction
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      // Move with velocity + attraction force
      p.vx += nx * p.ease * dt * 0.5;
      p.vy += ny * p.ease * dt * 0.5;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;

      // Snap when close enough
      if (Math.hypot(p.targetX - p.x, p.targetY - p.y) < 6) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.rotation = p.targetRotation;
        p.arrived = true;
        p.vx = 0; p.vy = 0; p.rotationSpeed = 0;
        p.glowPulse = 1.0; // Trigger arrival glow effect
      }
    } else {
      // Piece has arrived: fade the glow pulse
      p.glowPulse = Math.max(0, p.glowPulse - 0.04);
    }
  }
}

export function drawRespawnPieces(ctx) {
  respawnPieces.forEach(p => {
    const now = Date.now();
    // Skip if piece hasn't started animation yet
    if (now < p.startTime) return;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    
    // Holographic glow around the line segment
    ctx.strokeStyle = `rgba(100,200,255,${0.2 + p.glowPulse * 0.3})`;
    ctx.lineWidth = 4 + p.glowPulse * 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(p.edgeLength / 2, 0);
    ctx.stroke();
    
    // Scan lines effect
    ctx.strokeStyle = `rgba(200,100,255,${0.3 + p.glowPulse * 0.3})`;
    ctx.lineWidth = 0.5;
    for (let s = 0; s < 2; s++) {
      ctx.beginPath();
      ctx.moveTo(s * p.edgeLength / 4, -2);
      ctx.lineTo(s * p.edgeLength / 4, 2);
      ctx.stroke();
    }
    
    // Main line segment (bright cyan/magenta)
    ctx.strokeStyle = `rgba(150,100,255,${0.9 + p.glowPulse * 0.1})`;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(p.edgeLength / 2, 0);
    ctx.stroke();
    
    // Bright edge highlight on arrival
    if (p.glowPulse > 0) {
      ctx.strokeStyle = `rgba(255,200,255,${p.glowPulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p.edgeLength / 2, 0);
      ctx.stroke();
    }
    
    ctx.restore();
  });
}

export function respawnComplete() {
  // complete when all pieces have arrived
  return respawnPieces.length > 0 && respawnPieces.every(p => p.arrived);
}

export function clearRespawnPieces() {
  respawnPieces.length = 0;
}
