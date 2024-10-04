// Quality settings script to adjust quality and render distance
const qualitySettings = {
  low: {
    scale: 0.75,
    renderDistance: 12,
  },
  medium: {
    scale: 1.0,
    renderDistance: 16,
  },
  high: {
    scale: 1.25,
    renderDistance: 20,
  },
};

let currentQuality = 'medium';

function adjustQuality(quality) {
  currentQuality = quality;
  const settings = qualitySettings[quality];
  renderer.setSize(window.innerWidth * settings.scale, window.innerHeight * settings.scale);
  camera.far = settings.renderDistance;
  camera.updateProjectionMatrix();
}

document.addEventListener('keydown', (event) => {
  if (event.key === '=') {
    if (currentQuality === 'low') {
      adjustQuality('medium');
    } else if (currentQuality === 'medium') {
      adjustQuality('high');
    }
  } else if (event.key === '-') {
    if (currentQuality === 'high') {
      adjustQuality('medium');
    } else if (currentQuality === 'medium') {
      adjustQuality('low');
    }
  }
});
