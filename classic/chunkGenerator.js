// chunkGenerator.js

function generateChunk(scene, blockGeometry, material, blocks) {
    const chunkSize = 16; // Size of the chunk (16x16)
    const chunkHeight = 3; // Height of the chunk in blocks
    for (let x = 0; x < chunkSize; x++) {
        for (let z = 0; z < chunkSize; z++) {
            for (let y = 0; y < chunkHeight; y++) {
                const position = new THREE.Vector3(x, y, z);
                const block = new THREE.Mesh(blockGeometry, material);
                block.position.copy(position);
                scene.add(block);
                blocks.push({ position: position.clone() }); // Store block position for collision detection
            }
        }
    }
}
