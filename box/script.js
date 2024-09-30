const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.3;
const friction = 0.99;
const angularFriction = 0.98;
const boxes = [];

// Box class with rotation and inertia
class Box {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedY = 0;
    this.speedX = 0;
    this.angle = 0;
    this.angularSpeed = Math.random() * 0.1 - 0.05; // Random spin
  }

  update() {
    if (this.y + this.size < canvas.height) {
      this.speedY += gravity;
    } else {
      this.speedY *= -0.5; // bounce
      this.angularSpeed *= angularFriction;
    }

    if (this.x + this.size > canvas.width || this.x < 0) {
      this.speedX *= -0.5; // bounce on sides
    }

    this.x += this.speedX;
    this.y += this.speedY;

    this.angle += this.angularSpeed;
    this.speedX *= friction;
    this.speedY *= friction;
  }

  draw() {
    // Save current state and translate to box position
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw the box with a cardboard color and shading
    ctx.fillStyle = '#D2B48C'; // Cardboard color
    ctx.fillRect(0, 0, this.size, this.size);

    // Shading effect (simple gradient)
    const gradient = ctx.createLinearGradient(0, 0, this.size, this.size);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.size, this.size);

    // Restore state
    ctx.restore();
  }
}

// Event listener to drop boxes on click or touch
canvas.addEventListener('click', (e) => {
  const boxSize = Math.random() * 40 + 30;
  const box = new Box(e.clientX, e.clientY, boxSize);
  boxes.push(box);
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
