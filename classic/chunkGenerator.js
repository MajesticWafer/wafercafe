// chunkGenerator.js

// Create block geometry and material
const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
const dirtMaterial = new THREE.MeshStandardMaterial({ map: textures.dirt });

const chunkSize = 16;
const chunkHeight = 3;
const blocks = []; // Store block positions for collision detection

function generateChunk() {
  for (let x = 0; x < chunkSize; x++) {
    for (let z = 0; z < chunkSize; z++) {
      for (let y = 0; y < chunkHeight; y++) {
        let material;
        if (y === 2) {
          material = createGrassBlockMaterial(); // Grass block on top
        } else {
          material = dirtMaterial; // Dirt block below
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

// Export the function to be used in the main script
export { generateChunk, blocks };
