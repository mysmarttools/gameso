const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const livesEl = document.getElementById("lives");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

const TILE = 28;

const maze = [
  "####################",
  "#........##........#",
  "#.####.#.##.#.####.#",
  "#o####.#.##.#.####o#",
  "#..................#",
  "#.####.######.####.#",
  "#......##..##......#",
  "######.##..##.######",
  "######.##..##.######",
  "#........##........#",
  "#.####.#.##.#.####.#",
  "#o...#.#....#.#...o#",
  "###.#.#.####.#.#.###",
  "#...#............#.#",
  "#.####.######.####.#",
  "#..................#",
  "####################"
];

const ROWS = maze.length;
const COLS = maze[0].length;

canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

let player;
let ghosts;
let score = 0;
let lives = 3;
let highScore = Number(localStorage.getItem("gamesoPacmanHighScore")) || 0;

let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };

let gameRunning = false;
let gameOver = false;
let levelComplete = false;

let pelletsLeft = 0;
let powerTimer = 0;

const ghostColors = [
  "#ff4d6d",
  "#ff9f43",
  "#48dbfb",
  "#ff7edb"
];

highScoreEl.textContent = highScore;

/* -------------------------
   INITIALIZE GAME
------------------------- */

function resetGame() {

  score = 0;
  lives = 3;

  scoreEl.textContent = score;
  livesEl.textContent = lives;

  gameOver = false;
  levelComplete = false;
  gameRunning = false;

  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };

  powerTimer = 0;

  createBoard();

  statusEl.textContent = "Press an arrow key to start";

  draw();
}

function createBoard() {

  pelletsLeft = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (maze[row][col] === "." || maze[row][col] === "o") {
        pelletsLeft++;
      }
    }
  }

  player = {
    x: 10,
    y: 15,
    startX: 10,
    startY: 15
  };

  ghosts = [
    {
      x: 9,
      y: 9,
      startX: 9,
      startY: 9,
      color: ghostColors[0],
      direction: { x: 1, y: 0 }
    },
    {
      x: 10,
      y: 9,
      startX: 10,
      startY: 9,
      color: ghostColors[1],
      direction: { x: -1, y: 0 }
    },
    {
      x: 11,
      y: 9,
      startX: 11,
      startY: 9,
      color: ghostColors[2],
      direction: { x: 0, y: -1 }
    },
    {
      x: 12,
      y: 9,
      startX: 12,
      startY: 9,
      color: ghostColors[3],
      direction: { x: 0, y: 1 }
    }
  ];

  rebuildPellets();
}

/* -------------------------
   PELLETS
------------------------- */

let pellets = [];

function rebuildPellets() {

  pellets = [];

  for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

      const cell = maze[row][col];

      if (cell === "." || cell === "o") {

        pellets.push({
          x: col,
          y: row,
          power: cell === "o"
        });

      }

    }

  }

}

/* -------------------------
   DRAW
------------------------- */

function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawMaze();
  drawPellets();
  drawPlayer();
  drawGhosts();

  if (gameOver) {
    drawOverlay("GAME OVER", "Press Restart to play again");
  }

  if (levelComplete) {
    drawOverlay("YOU WIN!", "Amazing! Press Restart for another game");
  }
}

function drawBackground() {

  ctx.fillStyle = "#050812";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

}

function drawMaze() {

  for (let row = 0; row < ROWS; row++) {

    for (let col = 0; col < COLS; col++) {

      if (maze[row][col] === "#") {

        const x = col * TILE;
        const y = row * TILE;

        ctx.fillStyle = "#111c49";
        ctx.fillRect(x, y, TILE, TILE);

        ctx.strokeStyle = "#5265e8";
        ctx.lineWidth = 1.5;

        ctx.strokeRect(
          x + 2,
          y + 2,
          TILE - 4,
          TILE - 4
        );
      }
    }
  }
}

function drawPellets() {

  pellets.forEach(pellet => {

    const cx = pellet.x * TILE + TILE / 2;
    const cy = pellet.y * TILE + TILE / 2;

    ctx.beginPath();

    if (pellet.power) {

      ctx.fillStyle = "#ffffff";

      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ffffff";

      ctx.arc(cx, cy, 6, 0, Math.PI * 2);

    } else {

      ctx.fillStyle = "#ffd92f";

      ctx.shadowBlur = 5;
      ctx.shadowColor = "#ffd92f";

      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    }

    ctx.fill();

    ctx.shadowBlur = 0;
  });
}

/* -------------------------
   PLAYER
------------------------- */

function drawPlayer() {

  const cx = player.x * TILE + TILE / 2;
  const cy = player.y * TILE + TILE / 2;

  let angle = 0;

  if (direction.x === -1) angle = Math.PI;
  if (direction.y === -1) angle = -Math.PI / 2;
  if (direction.y === 1) angle = Math.PI / 2;

  const mouth = 0.28;

  ctx.save();

  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.fillStyle = "#ffd92f";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#ffd92f";

  ctx.beginPath();

  ctx.moveTo(0, 0);

  ctx.arc(
    0,
    0,
    11,
    mouth,
    Math.PI * 2 - mouth
  );

  ctx.closePath();
  ctx.fill();

  ctx.restore();

  ctx.shadowBlur = 0;
}

/* -------------------------
   GHOSTS
------------------------- */

function drawGhosts() {

  ghosts.forEach(ghost => {

    const x = ghost.x * TILE + TILE / 2;
    const y = ghost.y * TILE + TILE / 2;

    const frightened = powerTimer > 0;

    ctx.fillStyle = frightened
      ? "#3159ff"
      : ghost.color;

    ctx.beginPath();

    ctx.arc(
      x,
      y - 2,
      10,
      Math.PI,
      0
    );

    ctx.lineTo(x + 10, y + 10);
    ctx.lineTo(x + 5, y + 6);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x - 5, y + 6);
    ctx.lineTo(x - 10, y + 10);

    ctx.closePath();
    ctx.fill();

    if (!frightened) {

      ctx.fillStyle = "#ffffff";

      ctx.beginPath();
      ctx.arc(x - 4, y - 3, 3, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 3, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#20243a";

      ctx.beginPath();
      ctx.arc(x - 4, y - 3, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/* -------------------------
   MOVEMENT
------------------------- */

function isWall(x, y) {

  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
    return true;
  }

  return maze[y][x] === "#";
}

function canMove(x, y, dir) {

  return !isWall(
    x + dir.x,
    y + dir.y
  );
}

function movePlayer() {

  if (canMove(player.x, player.y, nextDirection)) {
    direction = { ...nextDirection };
  }

  if (canMove(player.x, player.y, direction)) {

    player.x += direction.x;
    player.y += direction.y;

  }

  eatPellet();

  checkGhostCollision();
}

function eatPellet() {

  const index = pellets.findIndex(
    pellet =>
      pellet.x === player.x &&
      pellet.y === player.y
  );

  if (index === -1) return;

  const pellet = pellets[index];

  pellets.splice(index, 1);

  score += pellet.power ? 50 : 10;

  if (pellet.power) {
    powerTimer = 80;
  }

  updateScore();

  if (pellets.length === 0) {

    levelComplete = true;
    gameRunning = false;

    statusEl.textContent = "Level Complete! 🎉";
  }
}

function updateScore() {

  scoreEl.textContent = score;

  if (score > highScore) {

    highScore = score;

    localStorage.setItem(
      "gamesoPacmanHighScore",
      highScore
    );

    highScoreEl.textContent = highScore;
  }
}

/* -------------------------
   GHOST MOVEMENT
------------------------- */

function moveGhosts() {

  ghosts.forEach(ghost => {

    const possible = [];

    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    directions.forEach(dir => {

      if (
        !isWall(
          ghost.x + dir.x,
          ghost.y + dir.y
        )
      ) {

        possible.push(dir);

      }

    });

    if (
      possible.length &&
      Math.random() < 0.35
    ) {

      ghost.direction =
        possible[
          Math.floor(
            Math.random() * possible.length
          )
        ];

    }

    const newX =
      ghost.x + ghost.direction.x;

    const newY =
      ghost.y + ghost.direction.y;

    if (!isWall(newX, newY)) {

      ghost.x = newX;
      ghost.y = newY;

    } else {

      if (possible.length) {

        ghost.direction =
          possible[
            Math.floor(
              Math.random() * possible.length
            )
          ];

      }

    }

  });

  checkGhostCollision();
}

/* -------------------------
   COLLISION
------------------------- */

function checkGhostCollision() {

  ghosts.forEach(ghost => {

    if (
      ghost.x === player.x &&
      ghost.y === player.y
    ) {

      if (powerTimer > 0) {

        score += 100;
        updateScore();

        ghost.x = ghost.startX;
        ghost.y = ghost.startY;

      } else {

        loseLife();

      }

    }

  });
}

function loseLife() {

  lives--;

  livesEl.textContent = lives;

  if (lives <= 0) {

    gameOver = true;
    gameRunning = false;

    statusEl.textContent = "Game Over!";

    draw();

    return;
  }

  player.x = player.startX;
  player.y = player.startY;

  direction = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };

  ghosts.forEach(ghost => {

    ghost.x = ghost.startX;
    ghost.y = ghost.startY;

  });

  statusEl.textContent =
    `Life lost! ${lives} lives remaining`;

}

/* -------------------------
   GAME LOOP
------------------------- */

let lastTime = 0;
let accumulator = 0;

const MOVE_DELAY = 130;

function gameLoop(time) {

  const delta = time - lastTime;
  lastTime = time;

  accumulator += delta;

  if (
    gameRunning &&
    !gameOver &&
    !levelComplete &&
    accumulator >= MOVE_DELAY
  ) {

    accumulator = 0;

    movePlayer();
    moveGhosts();

    if (powerTimer > 0) {
      powerTimer--;
    }

  }

  draw();

  requestAnimationFrame(gameLoop);
}

/* -------------------------
   KEYBOARD
------------------------- */

document.addEventListener("keydown", event => {

  const keys = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight"
  ];

  if (!keys.includes(event.key)) return;

  event.preventDefault();

  if (gameOver || levelComplete) return;

  const directions = {

    ArrowUp: {
      x: 0,
      y: -1
    },

    ArrowDown: {
      x: 0,
      y: 1
    },

    ArrowLeft: {
      x: -1,
      y: 0
    },

    ArrowRight: {
      x: 1,
      y: 0
    }

  };

  nextDirection = directions[event.key];

  gameRunning = true;

  statusEl.textContent =
    "Eat the pellets and avoid the ghosts!";

});

/* -------------------------
   MOBILE CONTROLS
------------------------- */

document
  .querySelectorAll(".control")
  .forEach(button => {

    button.addEventListener("click", () => {

      const key = button.dataset.key;

      const event = new KeyboardEvent(
        "keydown",
        {
          key: key
        }
      );

      document.dispatchEvent(event);

    });

  });

/* -------------------------
   RESTART
------------------------- */

restartBtn.addEventListener("click", () => {

  resetGame();

});

/* START */

resetGame();
requestAnimationFrame(gameLoop);
