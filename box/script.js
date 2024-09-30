const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.5;
const boxes = [];

// Box class
class Box {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedY = 0;
  }

  update() {
    if (this.y + this.size + this.speedY < canvas.height) {
      this.speedY += gravity;
    } else {
      this.speedY = 0;
    }
    this.y += this.speedY;
  }

  draw() {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

// Event listener to drop boxes on click
canvas.addEventListener('click', (e) => {
  const boxSize = Math.random() * 30 + 20;
  boxes.push(new Box(e.clientX - boxSize / 2, e.clientY - boxSize / 2, boxSize));
});

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw each box
  boxes.forEach((box) => {
    box.update();
    box.draw();
  });

  requestAnimationFrame(gameLoop);
}

gameLoop();
