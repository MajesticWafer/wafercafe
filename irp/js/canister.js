// Alien Canister System
// Canisters from an intelligent alien race that the player must collect

export const canisters = [];
let canisteIdCounter = 0;
let nextCanisterSpawnTime = 0;
let currentMissionNumber = 1;
let maxCanisters = 3; // maximum number of canisters allowed to spawn in mission 2

export function createCanister(x, y) {
  canisters.push({
    id: canisteIdCounter++,
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 0.2, // more horizontal drift
    vy: 0.35, // faster fall
    radius: 10, // slightly smaller -> harder to hit
    collected: false,
    rotation: 0,
    rotationSpeed: Math.random() * 0.06 + 0.03, // faster rotation
    age: 0,
    spinAxisAngle: Math.random() * Math.PI * 2 // Which axis it's spinning on
  });
  nextCanisterSpawnTime = Date.now() + 12000; // Next canister in 12 seconds
  return canisters[canisters.length - 1];
}

export function spawnCanisters(count = 3) {
  // Remove old canisters and set max
  canisters.length = 0;
  canisteIdCounter = 0;
  nextCanisterSpawnTime = 0;
  maxCanisters = Math.max(1, Math.floor(count));
  
  // Spawn the first canister immediately (if any), then schedule the rest at random intervals
  if (maxCanisters > 0) {
    const x = 100 + Math.random() * 600;
    createCanister(x, -30 - Math.random() * 60);
  }

  // Schedule the next spawn time randomly between 2 and 8 seconds
  if (maxCanisters > 1) {
    nextCanisterSpawnTime = Date.now() + (2000 + Math.floor(Math.random() * 6000));
  } else {
    nextCanisterSpawnTime = 0;
  }
}

export function setMissionNumber(mission) {
  currentMissionNumber = mission;
}

export function updateCanisters(timeScale = 1) {
  canisters.forEach((canister, i) => {
    // Drift movement (comes down from top)
    canister.x += canister.vx * timeScale;
    canister.y += canister.vy * timeScale;
    
    // Rotation
    canister.rotation += canister.rotationSpeed * timeScale;
    canister.age += timeScale;
    
    // Wraparound horizontally only (vertical reset when off bottom)
    if (canister.x > 820) canister.x = -20;
    if (canister.x < -20) canister.x = 820;
    if (canister.y > 620) canister.y = -40; // loop back to top if somehow missed
  });
  
  // Only auto-spawn canisters during Mission 2, up to maxCanisters
  if (currentMissionNumber === 2) {
    const uncollectedCount = canisters.filter(c => !c.collected).length;
    const totalSpawned = canisters.length;

    if (totalSpawned < maxCanisters) {
      // If there are no uncollected canisters, spawn the next one immediately
      if (uncollectedCount === 0) {
        createCanister(100 + Math.random() * 600, -30 - Math.random() * 60);
        // schedule next if needed
        if (canisters.length < maxCanisters) {
          nextCanisterSpawnTime = Date.now() + (2000 + Math.floor(Math.random() * 6000));
        } else {
          nextCanisterSpawnTime = 0;
        }
      } else if (nextCanisterSpawnTime && Date.now() > nextCanisterSpawnTime) {
        createCanister(100 + Math.random() * 600, -30 - Math.random() * 60);
        // schedule another if still under limit
        if (canisters.length < maxCanisters) {
          nextCanisterSpawnTime = Date.now() + (2000 + Math.floor(Math.random() * 6000));
        } else {
          nextCanisterSpawnTime = 0;
        }
      }
    }
  }
}

export function drawCanisters(ctx) {
  canisters.forEach(canister => {
    ctx.save();
    ctx.translate(canister.x, canister.y);
    
    if (canister.collected) {
      ctx.globalAlpha = 0.2;
    }
    
    // Pulse effect
    const pulse = Math.sin(canister.age * 0.05) * 0.15 + 1;
    const radius = canister.radius * pulse;
    
    // Glow around canister
    ctx.fillStyle = `rgba(200, 100, 255, ${0.3 * (canister.collected ? 0.3 : 1)})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw cylinder spinning
    // Rotate based on the axis
    ctx.rotate(canister.rotation);
    ctx.rotate(canister.spinAxisAngle);
    
    // Cylinder body (3D-like view)
    ctx.fillStyle = `rgba(180, 100, 255, ${0.8 * (canister.collected ? 0.3 : 1)})`;
    ctx.fillRect(-8, -radius, 16, radius * 2);
    
    // Cylinder ends (caps)
    ctx.fillStyle = `rgba(220, 150, 255, ${0.9 * (canister.collected ? 0.3 : 1)})`;
    ctx.beginPath();
    ctx.ellipse(-0, -radius, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(0, radius, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight stripe
    ctx.strokeStyle = `rgba(255, 200, 255, ${0.7 * (canister.collected ? 0.3 : 1)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -radius * 0.5);
    ctx.lineTo(6, -radius * 0.5);
    ctx.stroke();
    
    // Label when not collected
    if (!canister.collected) {
      ctx.rotate(-canister.spinAxisAngle);
      ctx.rotate(-canister.rotation);
      ctx.fillStyle = '#ff00ff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CANISTER', 0, -radius - 15);
    }
    
    ctx.restore();
  });
}

export function checkCanisterCollision(shipX, shipY) {
  let collected = null;
  
  canisters.forEach(canister => {
    if (!canister.collected) {
      const dx = shipX - canister.x;
      const dy = shipY - canister.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // reduce the extra collision padding so canisters are actually harder to pick up
      if (distance < canister.radius + 12) {
        canister.collected = true;
        collected = canister;
      }
    }
  });
  
  return collected;
}

export function getCollectedCanisterCount() {
  return canisters.filter(c => c.collected).length;
}

export function getTotalCanisterCount() {
  return canisters.length;
}
