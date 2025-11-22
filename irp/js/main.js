import { ship, updateShip, drawShip, refuelShip } from './ship.js';
import { asteroids, spawnAsteroids, worldVerts, drawAsteroids, updateAsteroids, createAsteroid } from './asteroids.js';
import { bullets, shootBullet, updateBullets, drawBullets } from './bullets.js';
import { particles, createParticles, updateParticles, drawParticles } from './particles.js';
import { polysCollide } from './collision.js';
import { MissionLog } from './missionlog.js';
import { FuelGauge } from './fuel.js';
import { shipDebris, createShipDebris, updateShipDebris, drawShipDebris, createRespawnPieces, updateRespawnPieces, drawRespawnPieces, respawnComplete, clearRespawnPieces } from './shipdebris.js';
import { astrophageClouds, spawnAstrophageClouds, updateAstrophageClouds, drawAstrophageClouds, checkCloudCollision, getCollectedCount, getTotalCloudCount } from './astrophage.js';
import { canisters, spawnCanisters, updateCanisters, drawCanisters, checkCanisterCollision, getCollectedCanisterCount, getTotalCanisterCount, setMissionNumber } from './canister.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
window.audioContext = audioContext;

const bgAudio = new Audio('./soundtrack.mp3');
bgAudio.loop = true;
bgAudio.volume = 0.0275;
let audioStarted = false;

function startAudio() {
  if (!audioStarted) {
    audioContext.resume();
    bgAudio.play().catch(e => console.error('Music playback failed:', e));
    audioStarted = true;
  }
}

document.addEventListener('keydown', startAudio, { once: true });
document.addEventListener('click', startAudio, { once: true });

window.shootSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  osc.start(now);
  osc.stop(now + 0.05);
};

window.collisionSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
  gain.gain.setValueAtTime(0.45, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  osc.start(now);
  osc.stop(now + 0.1);
};

window.respawnSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.frequency.setValueAtTime(100, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.4);
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  osc.start(now);
  osc.stop(now + 0.4);
};

window.bulletHitSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
  gain.gain.setValueAtTime(0.32, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  osc.start(now);
  osc.stop(now + 0.08);
};

window.collectSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.setValueAtTime(330, now + 0.05);
  osc.frequency.setValueAtTime(440, now + 0.1);
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  osc.start(now);
  osc.stop(now + 0.15);
};

window.thrustSound = (() => {
  let lastThrustTime = 0;
  return () => {
    if (!audioStarted) return;
    const now = audioContext.currentTime;
    if (now - lastThrustTime < 0.08) return;
    lastThrustTime = now;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  };
})();

window.missionCompleteSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const notes = [
    { freq: 330, time: 0.2 },
    { freq: 440, time: 0.2 },
    { freq: 550, time: 0.4 }
  ];
  
  let currentTime = now;
  notes.forEach(note => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(note.freq, currentTime);
    gain.gain.setValueAtTime(0.32, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, currentTime + note.time);
    osc.start(currentTime);
    osc.stop(currentTime + note.time);
    currentTime += note.time;
  });
};

window.asteroidPopSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);
  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
  osc.start(now);
  osc.stop(now + 0.06);
};

window.lowFuelSound = (() => {
  let lastBeepTime = 0;
  return () => {
    if (!audioStarted) return;
    const now = audioContext.currentTime;
    if (now - lastBeepTime < 0.3) return;
    lastBeepTime = now;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  };
})();

window.waveClearSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const notes = [262, 330, 392, 523];
  
  notes.forEach((freq, i) => {
    const startTime = now + (i * 0.08);
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });
};

window.asteroidSpawnSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  osc.start(now);
  osc.stop(now + 0.2);
};

window.gameStartSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const freqs = [220, 330, 440];
  
  freqs.forEach(freq => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  });
};

window.noBulletsSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.frequency.setValueAtTime(100, now);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  osc.start(now);
  osc.stop(now + 0.05);
};

window.radarPingSound = (() => {
  let lastPingTime = 0;
  return () => {
    if (!audioStarted) return;
    const now = audioContext.currentTime;
    if (now - lastPingTime < 0.5) return;
    lastPingTime = now;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  };
})();

window.shieldSound = () => {
  if (!audioStarted) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  osc.start(now);
  osc.stop(now + 0.1);
};

const missionLog = new MissionLog();
await missionLog.loadEvents();

let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);
document.addEventListener('keydown', e => { if(e.key===' '&&ship.alive) shootBullet(ship); });

let lastTime=0;
let gameTime=0;
let asteroidsDestroyed = 0;
let previousAsteroidCount = 0;
let shipExploded = false;
let shipInvulnerable = false;
let shipExplodedAt = 0;
let shipInvulnerableUntil = 0;
let shipRespawnAt = 0;
const RESPAWN_DELAY = 1500;
const RESPAWN_INVULN = 2000;
let shipAssembling = false;

let currentMission = 1;
let missionComplete = false;
let transitionAlpha = 0;
let isTransitioning = false;
let missionCompleteAt = 0;
const MISSION_COMPLETE_WAIT = 2000;
const MISSION_SLOW_DURATION = 2000;
const MISSION_FADE_IN_DURATION = 800;
let isFadingIn = false;
let fadeInStart = 0;
let timeScale = 1.0;
let gameFinished = false;

let mission2Requirement = 3;
const fuelGauge = new FuelGauge(ship.maxFuel);
const missionTargets = 3;
spawnAstrophageClouds(missionTargets);
spawnAsteroids(5);
if (window.gameStartSound) window.gameStartSound();
missionLog.triggerEvent('gameStart', { gameTime: 0 });
ship.fuel = ship.maxFuel;
const stars = [];
for(let i=0;i<50;i++){
  stars.push({ x: Math.random()*800, y: Math.random()*600, speed: Math.random()*0.3+0.1 });
}

function loop(timestamp){
  const dt = (timestamp - lastTime)/16;
  lastTime = timestamp;
  gameTime += dt;

  
  if(!missionLog.isDisplayingMessage() || missionComplete) {
    if(!shipAssembling) updateShip(dt * timeScale,keys);
    updateBullets(dt * timeScale);
    updateAsteroids(dt * timeScale);
    updateAstrophageClouds(timeScale);
    updateCanisters(timeScale);
  }
  
  updateParticles(timeScale);
  updateShipDebris(timeScale);
  missionLog.update();
  missionLog.updateBottomMessages();

  asteroids.forEach((a,ai)=>{
    bullets.forEach((b,bi)=>{
      if(polysCollide(worldVerts(a),[{x:b.x,y:b.y}])){
        createParticles(b.x,b.y,10);
        asteroidsDestroyed++;
        if (window.bulletHitSound) window.bulletHitSound();
        if(a.size>15){
          const numFragments = 2 + Math.floor(Math.random()*2);
          for(let i=0;i<numFragments;i++){
            const fragSize = a.size/2;
            const frag = createAsteroid(a.x,a.y,fragSize);
            const angle = Math.random()*Math.PI*2;
            const speed = Math.random()*0.3 + 0.1;
            frag.vx += Math.cos(angle)*speed + a.vx;
            frag.vy += Math.sin(angle)*speed + a.vy;
            asteroids.push(frag);
          }
        }
        asteroids.splice(ai,1);
        bullets.splice(bi,1);
      }
    });

    const shipVerts = [
      {x:ship.x+Math.cos(ship.angle)*15, y:ship.y+Math.sin(ship.angle)*15},
      {x:ship.x+Math.cos(ship.angle+2.5)*-10, y:ship.y+Math.sin(ship.angle+2.5)*-10},
      {x:ship.x+Math.cos(ship.angle-2.5)*-10, y:ship.y+Math.sin(ship.angle-2.5)*-10}
    ];
    const dx = a.x - ship.x;
    const dy = a.y - ship.y;
    const approxDist2 = dx*dx + dy*dy;
    const approxRadius = (a.size || 30) + 16;
    if(approxDist2 < approxRadius*approxRadius) {
      if(polysCollide(worldVerts(a), shipVerts) && !shipExploded && !shipInvulnerable) {
        createShipDebris(ship.x, ship.y, ship.angle);
        createParticles(ship.x, ship.y,50);
        ship.alive=false;
        shipExploded = true;
        shipExplodedAt = timestamp;
        if (window.collisionSound) window.collisionSound();
        if (window.shieldSound) window.shieldSound();
      }
    }
    
  });

  if(ship.alive && currentMission === 1) {
    const collectedCloud = checkCloudCollision(ship.x, ship.y);
    if(collectedCloud) {
      console.log('Cloud collected! Adding fuel...');
      refuelShip(30);
      console.log('Current fuel:', ship.fuel);
      if (window.collectSound) window.collectSound();
      
      const collected = getCollectedCount();
      const total = getTotalCloudCount();
      missionLog.queueBottomMessage(`Sample collected! (${collected}/${total})`);
      
      
      if(collected === missionTargets) {
        console.log('MISSION 1 COMPLETE!');
        missionComplete = true;
        if (window.missionCompleteSound) window.missionCompleteSound();
        missionLog.queueMessage('mission_complete', `MISSION 1 COMPLETE! Preparing Mission 2...`, 300);
        missionCompleteAt = 0;
        shipInvulnerable = true;
        ship.alive = true;
        shipExploded = false;
        shipDebris.length = 0;
        particles.length = 0;
        ship.alive = true;
        shipExploded = false;
        shipDebris.length = 0;
        particles.length = 0;
      }
    }
  }

  
  if(missionComplete && !missionLog.isDisplayingMessage()) {
    if(!missionCompleteAt) missionCompleteAt = timestamp;
  } else {
    
    if(!missionComplete) missionCompleteAt = 0;
  }

  if(missionCompleteAt) {
    const elapsed = timestamp - missionCompleteAt;

    if (gameFinished) {
      missionCompleteAt = 0;
      missionComplete = false;
    }

    if(elapsed < MISSION_COMPLETE_WAIT) {
      
    } else if(elapsed < MISSION_COMPLETE_WAIT + MISSION_SLOW_DURATION) {
      const t = (elapsed - MISSION_COMPLETE_WAIT) / MISSION_SLOW_DURATION;
      timeScale = Math.max(0, 1 - t);
      transitionAlpha = Math.min(1, t);
    } else {
      
        const nextMission = currentMission + 1;
        currentMission = nextMission;
        setMissionNumber(nextMission);
        missionComplete = false;
        missionCompleteAt = 0;

        
        ship.x = 400;
        ship.y = 480;
        ship.vx = 0;
        ship.vy = 0;
        ship.angle = -Math.PI / 2;
      ship.alive = true;
      shipExploded = false;

        
        astrophageClouds.length = 0;
        canisters.length = 0;
        bullets.length = 0;
        particles.length = 0;
        shipDebris.length = 0;

        
        if (nextMission === 2) {
          missionLog.queueMessage('mission2_start', `Mission 2: Receive alien canisters - dodge asteroids`, 240);
          spawnCanisters(mission2Requirement);
          spawnAsteroids(8);
        } else if (nextMission === 3) {
          currentMission = 3;
          gameFinished = true;
          missionLog.queueMessage('thanks', `Thanks for playing, that's all.`, 600);
          missionLog.queueMessage('based', `Based on Project Hail Mary`, 600);
          missionLog.queueMessage('book', `Book by Andy Weir`, 600);
          missionLog.queueMessage('made', `Made by Sebastien`, 600);
          missionLog.queueMessage('eeee', `EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE`, 1200);
        } else {
          spawnAsteroids(5);
        }

        
        ship.fuel = ship.maxFuel;

        timeScale = 1.0;
        transitionAlpha = 1.0;
        isFadingIn = true;
        fadeInStart = timestamp;
        shipInvulnerable = false;
    }
  }

  if(isFadingIn){
    const fadeElapsed = timestamp - fadeInStart;
    if(fadeElapsed >= MISSION_FADE_IN_DURATION){
      transitionAlpha = 0;
      isFadingIn = false;
      shipInvulnerable = false;
    }else{
      transitionAlpha = Math.max(0, 1 - (fadeElapsed / MISSION_FADE_IN_DURATION));
    }
  }

  if (shipInvulnerableUntil && timestamp >= shipInvulnerableUntil){
    shipInvulnerable = false;
    shipInvulnerableUntil = 0;
  }

  if (shipExploded && shipExplodedAt){
    if (timestamp - shipExplodedAt >= RESPAWN_DELAY){
      shipDebris.length = 0;
      particles.length = 0;
      ship.alive = true;
      shipExploded = false;
      ship.x = 400;
      ship.y = 480;
      ship.vx = 0;
      ship.vy = 0;
      ship.angle = -Math.PI/2;
      shipInvulnerable = true;
      shipInvulnerableUntil = timestamp + RESPAWN_INVULN;
      shipAssembling = false;
      shipExplodedAt = 0;
      shipRespawnAt = timestamp;
      if (window.respawnSound) window.respawnSound();
    }
  }

  if(ship.alive && currentMission === 2){
    const collectedCanister = checkCanisterCollision(ship.x, ship.y);
    if(collectedCanister) {
      console.log('Canister collected!');
      refuelShip(25);
      if (window.collectSound) window.collectSound();
      
      const collected = getCollectedCanisterCount();
      missionLog.queueBottomMessage(`Canister received! (${collected}/${mission2Requirement})`);
      
      if(collected >= mission2Requirement){
        console.log('MISSION 2 COMPLETE!');
        missionComplete = true;
        if (window.missionCompleteSound) window.missionCompleteSound();
        missionLog.queueMessage('mission2_complete', `MISSION 2 COMPLETE! All canisters received!`, 300);
        shipInvulnerable = true;
        ship.alive = true;
        shipExploded = false;
        shipDebris.length = 0;
        particles.length = 0;
      }
    }
  }

  if(asteroids.length===0 && previousAsteroidCount > 0){
    if (window.waveClearSound) window.waveClearSound();
    missionLog.triggerEvent('waveClear', { asteroidCount: asteroids.length });
    spawnAsteroids(5+Math.floor(Math.random()*5));
    if (window.asteroidSpawnSound) window.asteroidSpawnSound();
    missionLog.triggerEvent('asteroidSpawn', { asteroidCount: asteroids.length });
  } else if(previousAsteroidCount === 0 && asteroids.length > 0) {
    if (window.asteroidSpawnSound) window.asteroidSpawnSound();
    missionLog.triggerEvent('asteroidSpawn', { asteroidCount: asteroids.length });
  }
  previousAsteroidCount = asteroids.length;

  if(ship.fuel < 5 && ship.fuel > 0){
    if (window.lowFuelSound) window.lowFuelSound();
    missionLog.triggerEvent('lowFuel', { fuel: ship.fuel });
  }
  

  // Ghosting effect: slightly transparent background
  ctx.fillStyle='rgba(0,0,0,0.2)';
  ctx.fillRect(0,0,800,600);

  let shakeX=0, shakeY=0;
  ctx.save();
  ctx.translate(shakeX,shakeY);

  // Draw all game elements
  drawAsteroids(ctx);
  drawAstrophageClouds(ctx);
  drawCanisters(ctx);
  if(ship.alive) {
    drawShip(ctx);
    // Draw fancy glow/fade effect during respawn
    if (shipRespawnAt > 0) {
      const respawnElapsed = timestamp - shipRespawnAt;
      const respawnDuration = 800; // ms for glow/fade to complete
      if (respawnElapsed < respawnDuration) {
        const progress = respawnElapsed / respawnDuration;
        const glowAlpha = Math.max(0, 1 - progress);
        
        ctx.save();
        
        // Outer expanding ring (cyan)
        const ringSize = 20 + progress * 60;
        ctx.globalAlpha = glowAlpha * 0.5;
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ringSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // Middle pulsing ring (magenta)
        const pulse = Math.sin(progress * Math.PI * 3) * 0.5 + 0.5;
        ctx.globalAlpha = glowAlpha * pulse * 0.6;
        ctx.strokeStyle = 'magenta';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, 30 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner glow (bright cyan/white)
        ctx.globalAlpha = glowAlpha * 0.7;
        ctx.fillStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, 35 - progress * 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Radial spikes
        ctx.globalAlpha = glowAlpha * 0.4;
        ctx.strokeStyle = 'rgba(255, 200, 255, 0.8)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + progress * Math.PI;
          const innerRad = 15;
          const outerRad = 40 + progress * 30;
          ctx.beginPath();
          ctx.moveTo(
            ship.x + Math.cos(angle) * innerRad,
            ship.y + Math.sin(angle) * innerRad
          );
          ctx.lineTo(
            ship.x + Math.cos(angle) * outerRad,
            ship.y + Math.sin(angle) * outerRad
          );
          ctx.stroke();
        }
        
        ctx.restore();
      } else {
        shipRespawnAt = 0;
      }
    }
  }
  drawBullets(ctx);
  drawParticles(ctx);
  drawShipDebris(ctx);
  
  // Draw mission log
  missionLog.draw(ctx, canvas.width, canvas.height);

  ctx.restore();

  // Faint stars
  ctx.fillStyle='white';
  stars.forEach(s=>{
    ctx.fillRect(s.x,s.y,1,1);
    s.y += s.speed*dt*timeScale;
    if(s.y>600) s.y=0;
  });

  // HUD
  ctx.fillStyle='white';
  ctx.font='16px monospace';

  // Draw fuel gauge
  fuelGauge.draw(ctx, ship.fuel, canvas.width, canvas.height);

  // UI indicators: centered horizontally near bottom; text labels removed
  const hudPadding = 12;
  const hudY = canvas.height - hudPadding - 12;

  if (currentMission === 1) {
    const collected = getCollectedCount();
    const total = missionTargets;
    const spacing = 28;
    const startX = Math.round(canvas.width / 2 - ((total - 1) * spacing) / 2);

    for (let i = 0; i < total; i++) {
      const ix = startX + i * spacing;
      const iy = hudY;
      ctx.beginPath();
      ctx.arc(ix, iy, 7, 0, Math.PI * 2);
      ctx.fillStyle = i < collected ? 'cyan' : 'rgba(0,200,200,0.18)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,200,200,0.6)';
      ctx.stroke();
    }
  }

  if (currentMission === 2) {
    const collected = getCollectedCanisterCount();
    const total = mission2Requirement;
    const spacing = 36;
    const startX = Math.round(canvas.width / 2 - ((total - 1) * spacing) / 2);

    for (let i = 0; i < total; i++) {
      const ix = startX + i * spacing;
      const iy = hudY - 6;
      // draw a more detailed canister icon: body + caps + stripe + glow when collected
      // body
      ctx.fillStyle = i < collected ? '#8b5dd1' : 'rgba(120,80,130,0.18)';
      roundRect(ctx, ix - 10, iy, 20, 24, 3, true, false);
      // top cap
      ctx.fillStyle = i < collected ? '#9d78e3' : 'rgba(200,160,220,0.12)';
      ctx.beginPath();
      ctx.ellipse(ix, iy, 8, 4, 0, Math.PI, 0);
      ctx.fill();
      // bottom cap
      ctx.beginPath();
      ctx.ellipse(ix, iy + 24, 8, 4, 0, 0, Math.PI);
      ctx.fill();
      // stripe
      ctx.fillStyle = i < collected ? '#ffd7ff' : 'rgba(255,255,255,0.12)';
      ctx.fillRect(ix - 6, iy + 8, 12, 4);
      // outline
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.strokeRect(ix - 10, iy, 20, 24);
      // glow pulse when newly collected
      if (i < collected) {
        ctx.fillStyle = 'rgba(200,150,255,0.12)';
        ctx.beginPath();
        ctx.ellipse(ix, iy + 12, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw transition fade (draw when alpha > 0)
  if(transitionAlpha > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(loop);
}

  // Helper: rounded rectangle
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    if (typeof fill === 'undefined') fill = true;
    if (typeof stroke === 'undefined') stroke = false;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  requestAnimationFrame(loop);
