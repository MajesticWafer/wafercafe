// trees.js

function generateTree(scene, x, y, z) {
    const trunkHeight = Math.floor(Math.random() * 4) + 3; // Random height between 3 and 6 blocks
    const leavesSize = 3; // Size of the leaf cluster

    // Create trunk geometry
    const trunkGeometry = new THREE.BoxGeometry(1, 1, 1);
    
    // Use the log material from textures.js
    const logMaterial = createLogMaterial();

    // Generate the trunk
    for (let i = 0; i < trunkHeight; i++) {
        const trunk = new THREE.Mesh(trunkGeometry, logMaterial);
        trunk.position.set(x, y + i, z); // Stack the trunk vertically
        scene.add(trunk);
    }

    // Create leaves geometry
    const leavesGeometry = new THREE.BoxGeometry(leavesSize, leavesSize, leavesSize);
    
    // Use the leaves material from textures.js
    const leavesMaterial = new THREE.MeshBasicMaterial({ map: textures.leavesOpaque });
    
    // Generate leaves at the top of the trunk
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(x, y + trunkHeight, z); // Position leaves above the trunk
    scene.add(leaves);
}

// Generate multiple trees within a given area
function generateForest(scene, areaX, areaZ, density) {
    for (let i = 0; i < density; i++) {
        const x = Math.floor(Math.random() * areaX);  // Random position in X axis
        const z = Math.floor(Math.random() * areaZ);  // Random position in Z axis
        const y = 0; // Trees start at ground level (y = 0)

        generateTree(scene, x, y, z); // Generate tree at the random position
    }
}
