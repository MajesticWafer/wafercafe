// meshRendering.js

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

camera.up.set(0, 1, 0); // Ensure the camera's up is the global y-axis.

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10).normalize();
directionalLight.castShadow = true; // Enable shadow casting
scene.add(directionalLight);

// Create block geometry and material
const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
const dirtMaterial = new THREE.MeshStandardMaterial({ map: textures.dirt, side: THREE.FrontSide });
const stoneMaterial = new THREE.MeshStandardMaterial({ map: textures.stone, side: THREE.FrontSide });
const bedrockMaterial = new THREE.MeshStandardMaterial({ map: textures.bedrock, side: THREE.FrontSide });

// Use Math.random() to generate a seed value for randomness
const seed = Math.random() * 1000;

// Perlin Noise function (basic implementation for terrain generation)
function perlin(x, z) {
   return Math.sin((x + seed) * 0.1) * Math.cos((z + seed) * 0.1) * 4 + 4;
}

// Generate a 16x16 chunk of terrain with variable height
const chunkSize = 48;
const maxTerrainHeight = 8;
const blocks = []; // Store block positions for collision detection

function generateTerrainChunk() {
  for (let x = 0; x < chunkSize; x++) {
    for (let z = 0; z < chunkSize; z++) {
      const terrainHeight = Math.floor(perlin(x, z));

      for (let y = 0; y <= terrainHeight; y++) {
        let material;

        if (y === terrainHeight) {
          material = createGrassBlockMaterial(); // Grass block on top
        } else if (y < terrainHeight && y >= terrainHeight - 3) {
          material = dirtMaterial; // Dirt block below
        } else if (y < terrainHeight - 3) {
          material = stoneMaterial; // Stone block further down
        } else if (y === 0) {
          material = bedrockMaterial; // Bedrock block
        }

        const block = new THREE.Mesh(blockGeometry, material);
        block.position.set(x, y, z);
        block.castShadow = true;  // Enable block shadow casting
        block.receiveShadow = true;  // Enable block shadow receiving
        scene.add(block);
        blocks.push(block); // Add block to array for collision
      }
    }
  }
}

generateTerrainChunk();

// Create the skybox
function createSkybox() {
  const skyGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
  const skyMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Right
    new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Left
    new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Top
    new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Bottom
    new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide }), // Front
    new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide })  // Back
  ];
  const skybox = new THREE.Mesh(skyGeometry, skyMaterials);
  scene.add(skybox);
}

createSkybox(); // Call the function to create the skybox

// Main animation loop with delta time
let lastTime = 0;
function animate(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  updatePlayer(deltaTime);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate(0);  // Start animation loop
