const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const speedEl = document.getElementById("speed");
const statusEl = document.getElementById("status");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const mobileStart = document.getElementById("mobileStart");


/* =========================
   GAME SETTINGS
========================= */

const ROAD_WIDTH = 280;
const ROAD_LEFT = (canvas.width - ROAD_WIDTH) / 2;

const PLAYER_WIDTH = 46;
const PLAYER_HEIGHT = 78;

const ENEMY_WIDTH = 46;
const ENEMY_HEIGHT = 78;

let player;

let enemies = [];

let score = 0;

let highScore =
  Number(
    localStorage.getItem("gamesoTrafficHighScore")
  ) || 0;

let gameRunning = false;
let gameOver = false;

let roadOffset = 0;

let speed = 4;

let enemyTimer = 0;

let animationId;


/* =========================
   COLORS
========================= */

const enemyColors = [
  "#e74c3c",
  "#3498db",
  "#f1c40f",
  "#9b59b6",
  "#1abc9c",
  "#ecf0f1"
];


/* =========================
   PLAYER
========================= */

function createPlayer() {

  return {

    x:
      canvas.width / 2 -
      PLAYER_WIDTH / 2,

    y:
      canvas.height -
      PLAYER_HEIGHT -
      35,

    width: PLAYER_WIDTH,

    height: PLAYER_HEIGHT,

    moveSpeed: 7

  };

}


/* =========================
   RESET GAME
========================= */

function resetGame() {

  cancelAnimationFrame(animationId);

  player = createPlayer();

  enemies = [];

  score = 0;

  speed = 4;

  roadOffset = 0;

  enemyTimer = 0;

  gameOver = false;

  gameRunning = false;

  scoreEl.textContent = "0";

  highScoreEl.textContent = highScore;

  speedEl.textContent = "1x";

  statusEl.textContent =
    "Press Start to Race";

  draw();

}


/* =========================
   START GAME
========================= */

function startGame() {

  if (gameRunning) return;

  if (gameOver) {

    resetGame();

  }

  gameRunning = true;

  gameOver = false;

  statusEl.textContent =
    "Dodge the traffic!";

  lastTime = performance.now();

  animationId =
    requestAnimationFrame(gameLoop);

}


/* =========================
   ROAD
========================= */

function drawRoad() {

  /* Background */

  ctx.fillStyle = "#18251b";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* Grass */

  ctx.fillStyle = "#102015";

  ctx.fillRect(
    0,
    0,
    ROAD_LEFT,
    canvas.height
  );

  ctx.fillRect(
    ROAD_LEFT + ROAD_WIDTH,
    0,
    ROAD_LEFT,
    canvas.height
  );


  /* Road */

  ctx.fillStyle = "#292d34";

  ctx.fillRect(
    ROAD_LEFT,
    0,
    ROAD_WIDTH,
    canvas.height
  );


  /* Road edges */

  ctx.fillStyle = "#d8d8d8";

  ctx.fillRect(
    ROAD_LEFT,
    0,
    5,
    canvas.height
  );

  ctx.fillRect(
    ROAD_LEFT + ROAD_WIDTH - 5,
    0,
    5,
    canvas.height
  );


  /* Lane markings */

  ctx.fillStyle = "#f5f5f5";

  const laneWidth = ROAD_WIDTH / 3;

  for (let lane = 1; lane < 3; lane++) {

    const x =
      ROAD_LEFT +
      lane * laneWidth;

    for (
      let y = -80 + roadOffset;
      y < canvas.height;
      y += 100
    ) {

      ctx.fillRect(
        x - 2,
        y,
        4,
        55
      );

    }

  }


  /* Road texture */

  ctx.fillStyle = "rgba(255,255,255,0.025)";

  for (
    let y = 0;
    y < canvas.height;
    y += 45
  ) {

    ctx.fillRect(
      ROAD_LEFT,
      y,
      ROAD_WIDTH,
      1
    );

  }

}


/* =========================
   PLAYER CAR
========================= */

function drawPlayer() {

  const x = player.x;
  const y = player.y;

  /* Shadow */

  ctx.fillStyle =
    "rgba(0,0,0,0.35)";

  ctx.fillRect(
    x + 4,
    y + 7,
    player.width,
    player.height
  );


  /* Car body */

  ctx.fillStyle = "#7657ff";

  roundRect(
    x,
    y,
    player.width,
    player.height,
    9
  );

  ctx.fill();


  /* Car highlight */

  ctx.fillStyle = "#9a86ff";

  roundRect(
    x + 5,
    y + 5,
    player.width - 10,
    25,
    6
  );

  ctx.fill();


  /* Windshield */

  ctx.fillStyle = "#111827";

  roundRect(
    x + 8,
    y + 16,
    player.width - 16,
    20,
    5
  );

  ctx.fill();


  /* Rear window */

  ctx.fillStyle = "#0c1220";

  roundRect(
    x + 8,
    y + 43,
    player.width - 16,
    17,
    5
  );

  ctx.fill();


  /* Headlights */

  ctx.fillStyle = "#fff5a5";

  ctx.fillRect(
    x + 5,
    y + 4,
    9,
    6
  );

  ctx.fillRect(
    x + player.width - 14,
    y + 4,
    9,
    6
  );


  /* Wheels */

  ctx.fillStyle = "#080a0f";

  ctx.fillRect(
    x - 4,
    y + 12,
    6,
    17
  );

  ctx.fillRect(
    x + player.width - 2,
    y + 12,
    6,
    17
  );

  ctx.fillRect(
    x - 4,
    y + player.height - 30,
    6,
    17
  );

  ctx.fillRect(
    x + player.width - 2,
    y + player.height - 30,
    6,
    17
  );

}


/* =========================
   ENEMY CAR
========================= */

function drawEnemy(enemy) {

  const x = enemy.x;
  const y = enemy.y;

  /* Shadow */

  ctx.fillStyle =
    "rgba(0,0,0,0.35)";

  ctx.fillRect(
    x + 4,
    y + 7,
    enemy.width,
    enemy.height
  );


  /* Body */

  ctx.fillStyle =
    enemy.color;

  roundRect(
    x,
    y,
    enemy.width,
    enemy.height,
    9
  );

  ctx.fill();


  /* Windshield */

  ctx.fillStyle = "#111827";

  roundRect(
    x + 8,
    y + 14,
    enemy.width - 16,
    22,
    5
  );

  ctx.fill();


  /* Rear window */

  ctx.fillStyle = "#0c1220";

  roundRect(
    x + 8,
    y + 44,
    enemy.width - 16,
    17,
    5
  );

  ctx.fill();


  /* Red lights */

  ctx.fillStyle = "#ff4d4d";

  ctx.fillRect(
    x + 5,
    y + enemy.height - 10,
    9,
    6
  );

  ctx.fillRect(
    x + enemy.width - 14,
    y + enemy.height - 10,
    9,
    6
  );


  /* Wheels */

  ctx.fillStyle = "#080a0f";

  ctx.fillRect(
    x - 4,
    y + 13,
    6,
    17
  );

  ctx.fillRect(
    x + enemy.width - 2,
    y + 13,
    6,
    17
  );

  ctx.fillRect(
    x - 4,
    y + enemy.height - 30,
    6,
    17
  );

  ctx.fillRect(
    x + enemy.width - 2,
    y + enemy.height - 30,
    6,
    17
  );

}


/* =========================
   ROUND RECTANGLE
========================= */

function roundRect(
  x,
  y,
  width,
  height,
  radius
) {

  ctx.beginPath();

  ctx.moveTo(
    x + radius,
    y
  );

  ctx.lineTo(
    x + width - radius,
    y
  );

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + radius
  );

  ctx.lineTo(
    x + width,
    y + height - radius
  );

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );

  ctx.lineTo(
    x + radius,
    y + height
  );

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - radius
  );

  ctx.lineTo(
    x,
    y + radius
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + radius,
    y
  );

  ctx.closePath();

}


/* =========================
   CREATE ENEMY
========================= */

function createEnemy() {

  const laneWidth =
    ROAD_WIDTH / 3;

  const lane =
    Math.floor(
      Math.random() * 3
    );

  const x =
    ROAD_LEFT +
    lane * laneWidth +
    laneWidth / 2 -
    ENEMY_WIDTH / 2;

  enemies.push({

    x: x,

    y: -ENEMY_HEIGHT - 20,

    width: ENEMY_WIDTH,

    height: ENEMY_HEIGHT,

    color:
      enemyColors[
        Math.floor(
          Math.random() *
          enemyColors.length
        )
      ],

    speed:
      speed *
      (0.65 + Math.random() * 0.35)

  });

}


/* =========================
   UPDATE ENEMIES
========================= */

function updateEnemies() {

  for (
    let i = enemies.length - 1;
    i >= 0;
    i--
  ) {

    const enemy = enemies[i];

    enemy.y +=
      enemy.speed;

    if (
      enemy.y >
      canvas.height + 100
    ) {

      enemies.splice(i, 1);

      score += 10;

      updateScore();

    }

  }

}


/* =========================
   COLLISION
========================= */

function collision(a, b) {

  const padding = 7;

  return (

    a.x + padding <
      b.x + b.width - padding &&

    a.x + a.width - padding >
      b.x + padding &&

    a.y + padding <
      b.y + b.height - padding &&

    a.y + a.height - padding >
      b.y + padding

  );

}


function checkCollisions() {

  for (const enemy of enemies) {

    if (
      collision(
        player,
        enemy
      )
    ) {

      endGame();

      return;

    }

  }

}


/* =========================
   SCORE
========================= */

function updateScore() {

  scoreEl.textContent =
    score;

  if (score > highScore) {

    highScore = score;

    localStorage.setItem(
      "gamesoTrafficHighScore",
      highScore
    );

    highScoreEl.textContent =
      highScore;

  }

}


/* =========================
   DIFFICULTY
========================= */

function updateDifficulty() {

  speed =
    4 +
    Math.floor(score / 100) *
    0.5;

  const multiplier =
    (speed / 4).toFixed(1);

  speedEl.textContent =
    multiplier + "x";

}


/* =========================
   PLAYER MOVEMENT
========================= */

function moveLeft() {

  if (!gameRunning) return;

  player.x -=
    player.moveSpeed;

  if (
    player.x <
    ROAD_LEFT + 8
  ) {

    player.x =
      ROAD_LEFT + 8;

  }

}


function moveRight() {

  if (!gameRunning) return;

  player.x +=
    player.moveSpeed;

  if (
    player.x >
    ROAD_LEFT +
    ROAD_WIDTH -
    player.width -
    8
  ) {

    player.x =
      ROAD_LEFT +
      ROAD_WIDTH -
      player.width -
      8;

  }

}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "ArrowLeft" ||
      event.key === "a" ||
      event.key === "A"
    ) {

      event.preventDefault();

      moveLeft();

    }

    if (
      event.key === "ArrowRight" ||
      event.key === "d" ||
      event.key === "D"
    ) {

      event.preventDefault();

      moveRight();

    }

    if (
      event.key === " " ||
      event.key === "Enter"
    ) {

      if (!gameRunning) {

        startGame();

      }

    }

  }
);


/* =========================
   MOBILE BUTTONS
========================= */

leftBtn.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

    moveLeft();

  }
);


rightBtn.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

    moveRight();

  }
);


mobileStart.addEventListener(
  "click",
  () => {

    startGame();

  }
);


/* =========================
   BUTTONS
========================= */

startBtn.addEventListener(
  "click",
  () => {

    startGame();

  }
);


restartBtn.addEventListener(
  "click",
  () => {

    resetGame();

    startGame();

  }
);


/* =========================
   GAME OVER
========================= */

function endGame() {

  gameRunning = false;

  gameOver = true;

  statusEl.textContent =
    "💥 Crash! Game Over";

  draw();

}


/* =========================
   OVERLAY
========================= */

function drawOverlay(
  title,
  subtitle
) {

  ctx.fillStyle =
    "rgba(3,6,14,0.76)";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.textAlign = "center";

  ctx.fillStyle = "#ffffff";

  ctx.font =
    "900 32px Arial";

  ctx.fillText(
    title,
    canvas.width / 2,
    canvas.height / 2 - 20
  );

  ctx.fillStyle =
    "#aeb8d2";

  ctx.font =
    "600 14px Arial";

  ctx.fillText(
    subtitle,
    canvas.width / 2,
    canvas.height / 2 + 15
  );

}


/* =========================
   DRAW
========================= */

function draw() {

  drawRoad();

  enemies.forEach(
    drawEnemy
  );

  drawPlayer();

  if (gameOver) {

    drawOverlay(
      "GAME OVER",
      "Press Restart to race again"
    );

  }

}


/* =========================
   GAME LOOP
========================= */

let lastTime = 0;

function gameLoop(time) {

  const delta =
    time - lastTime;

  lastTime = time;

  if (gameRunning) {

    roadOffset +=
      speed * 1.5;

    if (
      roadOffset >= 100
    ) {

      roadOffset = 0;

    }


    enemyTimer += delta;


    const spawnDelay =
      Math.max(
        520,
        1050 -
        score * 1.5
      );


    if (
      enemyTimer >=
      spawnDelay
    ) {

      enemyTimer = 0;

      createEnemy();

    }


    updateEnemies();

    updateDifficulty();

    checkCollisions();

  }


  draw();

  animationId =
    requestAnimationFrame(
      gameLoop
    );

}


/* =========================
   INITIALIZE
========================= */

highScoreEl.textContent =
  highScore;

resetGame();

requestAnimationFrame(
  gameLoop
);
