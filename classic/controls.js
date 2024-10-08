// controls.js

// Player setup
const player = {
  position: new THREE.Vector3(8, 10, 8),
  velocity: new THREE.Vector3(),
  speed: 4.317,
  isCrouching: false,
  isJumping: false,
  jumpStrength: 0.25,
  crouchHeight: 1.65,
  gravity: -1, 
  fallSpeed: 0,
  grounded: false
};

camera.position.copy(player.position);

// Movement controls
const keys = { forward: false, backward: false, left: false, right: false, jump: false, up: false, down: false, crouch: false };

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': keys.forward = true; break;
    case 'KeyS': keys.backward = true; break;
    case 'KeyA': keys.left = true; break;
    case 'KeyD': keys.right = true; break;
    case 'Space': keys.jump = true; break;
    case 'ShiftLeft': keys.crouch = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': keys.forward = false; break;
    case 'KeyS': keys.backward = false; break;
    case 'KeyA': keys.left = false; break;
    case 'KeyD': keys.right = false; break;
    case 'Space': keys.jump = false; break;
    case 'ShiftLeft': keys.crouch = false; break;
  }
});

// Mouse and Arrow Key controls for looking around
let pitch = 0, yaw = 0;
const mouseSensitivity = 0.002;
const arrowKeySensitivity = 0.1;
const maxPitch = Math.PI / 2;

// Mouse movement listener
document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;

document.addEventListener('click', () => {
  document.body.requestPointerLock();
});

document.addEventListener('mousemove', (event) => {
  yaw -= event.movementX * mouseSensitivity;
  pitch -= event.movementY * mouseSensitivity;
  pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
});

// Arrow key listener for looking around
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp': 
      pitch -= arrowKeySensitivity;
      pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
      break;
    case 'ArrowDown': 
      pitch += arrowKeySensitivity;
      pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
      break;
    case 'ArrowLeft': 
      yaw += arrowKeySensitivity;
      break;
    case 'ArrowRight': 
      yaw -= arrowKeySensitivity;
      break;
  }
});

// Collision detection using AABB
function checkCollision(nextPosition) {
  for (let block of blocks) {
    const min = block.position.clone().sub(new THREE.Vector3(0.5, 0.5, 0.5));
    const max = block.position.clone().add(new THREE.Vector3(0.5, 0.5, 0.5));
    if (nextPosition.x >= min.x && nextPosition.x <= max.x &&
        nextPosition.y >= min.y && nextPosition.y <= max.y &&
        nextPosition.z >= min.z && nextPosition.z <= max.z) {
      return true;
    }
  }
  return false;
}

// Update player's movement and apply collision detection with delta time
function updatePlayer(deltaTime) {
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  player.velocity.set(0, player.fallSpeed, 0);

  // Adjust movement based on deltaTime
  const movementSpeed = player.speed * deltaTime;
  if (keys.forward) player.velocity.sub(forward.multiplyScalar(movementSpeed));
  if (keys.backward) player.velocity.add(forward.multiplyScalar(movementSpeed));
  if (keys.left) player.velocity.sub(right.multiplyScalar(movementSpeed));
  if (keys.right) player.velocity.add(right.multiplyScalar(movementSpeed));

  if (keys.crouch) {
    player.isCrouching = true;
  } else {
    player.isCrouching = false;
  }
  
  if (player.grounded && keys.jump) {
    player.fallSpeed = player.jumpStrength;
    player.isJumping = true;
    player.grounded = false;
  }

  // Apply gravity
  if (!player.grounded) {
    player.fallSpeed += player.gravity * deltaTime;
  }

  const nextPosition = player.position.clone().add(player.velocity);
  if (!checkCollision(nextPosition)) {
    player.position.copy(nextPosition);
  } else {
    player.fallSpeed = 0; // Reset fall speed on collision
    player.grounded = true; // Mark player as grounded
  }

  camera.position.copy(player.position); // Update camera position
}

// Keep yaw and pitch constrained for camera rotation
function updateCamera() {
  camera.rotation.set(pitch, yaw, 0);
}
