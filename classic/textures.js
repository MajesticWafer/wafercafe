// textures.js

const loader = new THREE.TextureLoader();

// Load textures with pixelated filters
const textures = {
  grassTop: loader.load('assets/grass.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  dirt: loader.load('assets/dirt.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  grassSide: loader.load('assets/grass_dirt.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  })
};

// Creating materials for each side of the grass block
function createGrassBlockMaterial() {
  return [
    new THREE.MeshBasicMaterial({ map: textures.grassSide }), // left
    new THREE.MeshBasicMaterial({ map: textures.grassSide }), // right
    new THREE.MeshBasicMaterial({ map: textures.grassTop }),  // top
    new THREE.MeshBasicMaterial({ map: textures.dirt }),      // bottom
    new THREE.MeshBasicMaterial({ map: textures.grassSide }), // front
    new THREE.MeshBasicMaterial({ map: textures.grassSide })  // back
  ];
}
