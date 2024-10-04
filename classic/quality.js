// quality.js
let qualityLevel = 1; // Start with medium quality (0: Low, 1: Medium, 2: High)

const qualitySettings = [
  { resolution: 0.5, renderDistance: 12 },  // Low Quality (0.75 chunks)
  { resolution: 1, renderDistance: 16 },   // Medium Quality (1 chunk)
  { resolution: 1.25, renderDistance: 20 } // High Quality (1.25 chunks)
];

function applyQualitySettings(renderer, scene) {
  const settings = qualitySettings[qualityLevel];
  
  // Adjust canvas resolution to fit the viewport and zoom in/out accordingly
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio * settings.resolution);
  
  // Adjust render distance (set how far the player can see)
  return settings.renderDistance;
}

// Handle quality change with '=' and '-' keys
document.addEventListener('keydown', (event) => {
  if (event.key === '=') {
    qualityLevel = Math.min(qualityLevel + 1, qualitySettings.length - 1); // Increase quality
  } else if (event.key === '-') {
    qualityLevel = Math.max(qualityLevel - 1, 0); // Decrease quality
  }
});
