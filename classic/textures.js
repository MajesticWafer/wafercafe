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
  }),
  bedrock: loader.load('assets/bedrock.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  gravel: loader.load('assets/gravel.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  leavesOpaque: loader.load('assets/leaves_opaque.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  rock: loader.load('assets/rock.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  sand: loader.load('assets/sand.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  stone: loader.load('assets/stone.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  treeSide: loader.load('assets/tree_side.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  treeTop: loader.load('assets/tree_top.png', (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
  wood: loader.load('assets/wood.png', (texture) => {
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

// Creating materials for the tree logs
function createLogMaterial() {
  return [
    new THREE.MeshBasicMaterial({ map: textures.treeSide }), // left
    new THREE.MeshBasicMaterial({ map: textures.treeSide }), // right
    new THREE.MeshBasicMaterial({ map: textures.treeTop }),  // top
    new THREE.MeshBasicMaterial({ map: textures.treeTop }),  // bottom
    new THREE.MeshBasicMaterial({ map: textures.treeSide }), // front
    new THREE.MeshBasicMaterial({ map: textures.treeSide })  // back
  ];
}
