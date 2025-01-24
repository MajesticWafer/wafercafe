const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = { x: canvas.width / 2, y: canvas.height / 2, radius: 30 };
let enemies = [];
let lives = 3;

function getRandomLetter() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[Math.floor(Math.random() * letters.length)];
}

function spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 20 + 20;
    enemies.push({
        x: Math.cos(angle) * canvas.width + canvas.width / 2,
        y: Math.sin(angle) * canvas.height + canvas.height / 2,
        speed: 1.5,
        letter: getRandomLetter(),
        radius: radius,
        color: "white"
    });
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(enemy.letter, enemy.x, enemy.y);
        ctx.closePath();
    });
}

function moveEnemies() {
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + enemy.radius) {
            lives--;
            enemies.splice(enemies.indexOf(enemy), 1);
        } else {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
    });
}

function getClosestEnemy() {
    let closest = null;
    let minDist = Infinity;
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
            minDist = dist;
            closest = enemy;
        }
    });
    return closest;
}

function highlightTarget() {
    let target = getClosestEnemy();
    if (target) {
        target.color = "yellow";
    }
}

function handleTyping(event) {
    let target = getClosestEnemy();
    if (target && event.key.toUpperCase() === target.letter) {
        enemies.splice(enemies.indexOf(target), 1);
    } else if (target) {
        target.color = "red";
        target.speed += 1;
    }
}

document.addEventListener('keydown', handleTyping);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();
    moveEnemies();
    highlightTarget();

    if (lives <= 0) {
        alert("Game Over!");
        enemies = [];
        lives = 3;
    }

    requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 1000);
gameLoop();
