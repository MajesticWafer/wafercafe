document.addEventListener('DOMContentLoaded', function () {
    const particlesToggle = document.getElementById('particles-toggle');
    const particlesContainer = document.getElementById('particles-js');
    const title = document.getElementById('title');
    const dropdown = document.getElementById('dropdown');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Load and save particles setting in localStorage
    const savedParticlesSetting = JSON.parse(localStorage.getItem('particlesEnabled')) ?? true;
    particlesToggle.checked = savedParticlesSetting;
    particlesContainer.style.display = savedParticlesSetting ? 'block' : 'none';

    particlesToggle.addEventListener('change', function () {
      const isChecked = particlesToggle.checked;
      particlesContainer.style.display = isChecked ? 'block' : 'none';
      localStorage.setItem('particlesEnabled', JSON.stringify(isChecked));
    });

    title.addEventListener('click', function () {
      dropdown.classList.toggle('open');
    });

    // Function to load particles based on theme
    function loadParticles(theme) {
      const particlesConfig = theme === 'light-mode' ? 'dark-particles.json' : 'light-particles.json';
      particlesJS.load('particles-js', `head/${particlesConfig}`, function() {
        console.log(`Particles.js config (${particlesConfig}) loaded`);
      });
    }

    // Theme toggle functionality
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    document.body.classList.add(savedTheme);
    themeToggle.textContent = savedTheme === 'light-mode' ? '🌙' : '☀️';
    loadParticles(savedTheme);

    themeToggle.addEventListener('click', function () {
      const isLightMode = document.body.classList.toggle('light-mode');
      const newTheme = isLightMode ? 'light-mode' : 'dark-mode';
      localStorage.setItem('theme', newTheme);
      themeToggle.textContent = isLightMode ? '🌙' : '☀️';
      loadParticles(newTheme);
    });

    // Random game function
    document.getElementById('random-game').addEventListener('click', function () {
      const games = document.querySelectorAll('.button-container');
      const randomGame = games[Math.floor(Math.random() * games.length)];
      const onClickValue = randomGame.getAttribute('onclick');
      const url = onClickValue.match(/location\.href='([^']+)'/)[1];
      window.location.href = url;
    });
  });

  // Load game buttons dynamically from games.json
  window.onload = function() {
    fetch('head/games.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        const games = data.games;
        const container = document.querySelector('.container');

        Object.keys(games).forEach(gameName => {
          const gameLink = games[gameName];
          const buttonContainer = document.createElement('div');
          buttonContainer.classList.add('button-container');
          buttonContainer.setAttribute('onclick', `location.href='${gameLink}/'`);

          const img = document.createElement('img');
          img.src = `/${gameLink}/img.jpeg`;
          img.alt = gameName;

          const span = document.createElement('span');
          span.classList.add('button-text');
          span.textContent = gameName;

          buttonContainer.appendChild(img);
          buttonContainer.appendChild(span);
          container.appendChild(buttonContainer);
        });
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  };
