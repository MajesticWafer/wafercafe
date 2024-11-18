const barrel = document.getElementById('barrel');
const sequenceDiv = document.getElementById('sequence');
const statusDiv = document.getElementById('status');

const BUTTONS = ['A', 'B', 'X', 'Y'];
const keyboardMap = { Q: 'A', W: 'B', E: 'X', R: 'Y' };
let currentSequence = [];
let playerInput = [];
let position = 0;

// Generate a random sequence
function generateSequence() {
  currentSequence = Array.from({ length: 6 }, () =>
    BUTTONS[Math.floor(Math.random() * BUTTONS.length)]
  );
  sequenceDiv.textContent = `Sequence: ${currentSequence.join(' ')}`;
}

// Reset player input
function resetInput() {
  playerInput = [];
}

// Move barrel up
function moveUp() {
  position++;
  updateBarrelPosition();
  statusDiv.textContent = "Good job! Keep going!";
}

// Slide barrel down
function slideDown() {
  position = Math.max(0, position - 1);
  updateBarrelPosition();
  statusDiv.textContent = "Oops! You slid down!";
}

// Update barrel position
function updateBarrelPosition() {
  barrel.style.bottom = `${position * 40}px`;
}

// Handle input
function handleInput(input) {
  const expected = currentSequence[playerInput.length];
  if (input === expected) {
    playerInput.push(input);
    if (playerInput.length === currentSequence.length) {
      moveUp();
      generateSequence();
      resetInput();
    }
  } else {
    slideDown();
    resetInput();
  }
}

// Listen for button clicks
document.querySelectorAll('#controls button').forEach(button => {
  button.addEventListener('click', () => {
    handleInput(button.textContent);
  });
});

// Listen for keyboard input
document.addEventListener('keydown', event => {
  const input = keyboardMap[event.key.toUpperCase()];
  if (input) handleInput(input);
});

// Initialize game
generateSequence();
updateBarrelPosition();
