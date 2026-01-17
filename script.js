// --- Word banks ---
const NORMAL_WORDS = [
  "apple", "banana", "chair", "window", "table",
  "school", "house", "car", "book", "forest",
  "river", "sun", "moon", "flower", "dog"
];

const HARRY_POTTER_WORDS = [
  "quidditch", "horcrux", "muggle", "wand", "gryffindor",
  "slytherin", "hufflepuff", "ravenclaw", "diagon", "privet",
  "butterbeer", "patronus", "basilisk", "invisibility", "horntail"
];

// --- DOM ---
const rope = document.getElementById("rope");
const currentWordEl = document.getElementById("currentWord");
const upcomingWordsEl = document.getElementById("upcomingWords");
const input = document.getElementById("typingInput");
const result = document.getElementById("result");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const gameContainer = document.getElementById("gameContainer");

// --- Game State ---
let ropePosition = 325;
let gameOver = false;
let computerInterval;

let currentDifficulty = "easy";
let currentWordSet = "normal";

const NUM_UPCOMING = 5;
const PLAYER_PULL = 20;

// Difficulty affects ONLY computer
const DIFFICULTY_SETTINGS = {
  easy: {
    speed: 600,
    computerPull: 8
  },
  hard: {
    speed: 300,
    computerPull: 18
  }
};

let wordsQueue = [];

/* --- Helpers --- */
function randomWord() {
  const bank =
    currentWordSet === "normal" ? NORMAL_WORDS : HARRY_POTTER_WORDS;
  return bank[Math.floor(Math.random() * bank.length)];
}

function initWords() {
  wordsQueue = [];
  for (let i = 0; i < NUM_UPCOMING + 1; i++) {
    wordsQueue.push(randomWord());
  }
  updateWords();
}

function updateWords() {
  currentWordEl.textContent = wordsQueue[0];
  upcomingWordsEl.textContent = wordsQueue.slice(1).join(" ");

  const currentWordWidth = currentWordEl.offsetWidth;
  upcomingWordsEl.style.left = `calc(50% + ${currentWordWidth / 2 + 20}px)`;
}

function moveRope(amount) {
  ropePosition += amount;
  ropePosition = Math.max(0, Math.min(650, ropePosition));

  // Call our new visual updater
  updateVisuals();

  if (ropePosition === 0) endGame("Computer wins!");
  if (ropePosition === 650) endGame("You win!");
}

function updateVisuals() {
  // 1. Move the Clash Point
  clashPoint.style.left = ropePosition + "px";

  // 2. Define Offsets (MUST MATCH CSS 'left' and 'right' of beams)
  const leftWandOffset = 80;  // Matches CSS #beamLeft { left: 80px }
  const rightWandOffset = 80; // Matches CSS #beamRight { right: 80px }
  const containerWidth = 700; // Matches CSS #gameContainer { width: 700px }

  // 3. Calculate Left Beam Width
  // Distance from Left Wand -> Clash Point
  let leftWidth = ropePosition - leftWandOffset;
  if (leftWidth < 0) leftWidth = 0;
  beamLeft.style.width = leftWidth + "px";

  // 4. Calculate Right Beam Width
  // Distance from Right Wand -> Clash Point
  let rightWidth = (containerWidth - ropePosition) - rightWandOffset;
  if (rightWidth < 0) rightWidth = 0;
  beamRight.style.width = rightWidth + "px";
}

/* --- Player Input --- */
input.addEventListener("input", () => {
  if (gameOver) return;

  if (input.value.trim() === wordsQueue[0]) {
    moveRope(PLAYER_PULL);

    wordsQueue.shift();
    wordsQueue.push(randomWord());
    updateWords();
    input.value = "";
  }
});

/* --- Computer --- */
function startComputer() {
  clearInterval(computerInterval);

  const settings = DIFFICULTY_SETTINGS[currentDifficulty];

  computerInterval = setInterval(() => {
    if (!gameOver) moveRope(-settings.computerPull);
  }, settings.speed);
}

/* --- Game Flow --- */
function endGame(text) {
  gameOver = true;
  result.textContent = text;
  clearInterval(computerInterval);

  setTimeout(() => {
    menu.style.display = "block";
    gameContainer.style.display = "none";
    result.textContent = "";
  }, 1000);
}

startBtn.addEventListener("click", () => {
  currentDifficulty =
    document.querySelector('input[name="difficulty"]:checked').value;

  currentWordSet =
    document.querySelector('input[name="wordset"]:checked').value;

  menu.style.display = "none";
  gameContainer.style.display = "flex";

  resetGame();
  input.focus();
});

function resetGame() {
  gameOver = false;
  ropePosition = 325;
  
  // Update the new visuals instead of rope.style.left
  updateVisuals(); 
  
  input.value = "";
  initWords();
  startComputer();
}
