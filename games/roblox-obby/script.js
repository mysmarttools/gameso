const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const livesEl = document.getElementById("lives");
const coinsEl = document.getElementById("coins");
const timerEl = document.getElementById("timer");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const winScreen = document.getElementById("winScreen");

const finalCoins = document.getElementById("finalCoins");
const finalTime = document.getElementById("finalTime");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");


/* =========================
   GAME VARIABLES
========================= */

let gameRunning = false;

let lives = 3;
let coins = 0;
let time = 0;

let timerInterval;

const gravity = 0.7;

const keys = {
  left: false,
  right: false
};


/* =========================
   PLAYER
========================= */

const player = {
  x: 70,
  y: 420,

  width: 35,
  height: 45,

  velocityX: 0,
  velocityY: 0,

  speed: 5,
  jumpPower: -13,

  onGround: false
};


/* =========================
   LEVEL
========================= */

const platforms = [

  {
    x: 0,
    y: 500,
    width: 250,
    height: 50
  },

  {
    x: 320,
    y: 430,
    width: 170,
    height: 25
  },

  {
    x: 550,
    y: 360,
    width: 150,
    height: 25
  },

  {
    x: 760,
    y: 300,
    width: 160,
    height: 25
  },

  {
    x: 960,
    y: 400,
    width: 200,
    height: 25
  },

  {
    x: 1200,
    y: 330,
    width: 170,
    height: 25
  },

  {
    x: 1430,
    y: 260,
    width: 200,
    height: 25
  }
];


/* =========================
   OBSTACLES
========================= */

const obstacles = [

  {
    x: 170,
    y: 470,
    width: 35,
    height: 30
  },

  {
    x: 390,
    y: 400,
    width: 30,
    height: 30
  },

  {
    x: 620,
    y: 330,
    width: 35,
    height: 30
  },

  {
    x: 1030,
    y: 370,
    width: 35,
    height: 30
  },

  {
    x: 1260,
    y: 300,
    width: 35,
    height: 30
  }

];


/* =========================
   COINS
========================= */

let coinObjects = [

  { x: 350, y: 385, collected: false },
  { x: 580, y: 315, collected: false },
  { x: 800, y: 255, collected: false },
  { x: 1010, y: 355, collected: false },
  { x: 1235, y: 285, collected: false },
  { x: 1480, y: 215, collected: false }

];


/* =========================
   CAMERA
========================= */

let cameraX = 0;


/* =========================
   KEYBOARD CONTROLS
========================= */

document.addEventListener("keydown", function(e) {

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    keys.left = true;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = true;
  }

  if (e.code === "Space" || e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
    jump();
  }

});


document.addEventListener("keyup", function(e) {

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
    keys.left = false;
  }

  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
    keys.right = false;
  }

});


/* =========================
   MOBILE CONTROLS
========================= */

function pressButton(button, action) {

  button.addEventListener("touchstart", function(e) {
    e.preventDefault();
    action(true);
  });

  button.addEventListener("touchend", function(e) {
    e.preventDefault();
    action(false);
  });

  button.addEventListener("mousedown", function() {
    action(true);
  });

  button.addEventListener("mouseup", function() {
    action(false);
  });

}


pressButton(leftBtn, function(value) {
  keys.left = value;
});


pressButton(rightBtn, function(value) {
  keys.right = value;
});


jumpBtn.addEventListener("touchstart", function(e) {
  e.preventDefault();
  jump();
});


jumpBtn.addEventListener("click", jump);


/* =========================
   JUMP
========================= */

function jump() {

  if (!gameRunning) return;

  if (player.onGround) {

    player.velocityY = player.jumpPower;

    player.onGround = false;

  }

}


/* =========================
   COLLISION
========================= */

function collision(a, b) {

  return (

    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y

  );

}


/* =========================
   RESET PLAYER
========================= */

function resetPlayer() {

  player.x = 70;
  player.y = 420;

  player.velocityX = 0;
  player.velocityY = 0;

  cameraX = 0;

}


/* =========================
   LOSE LIFE
========================= */

function loseLife() {

  lives--;

  livesEl.textContent = lives;

  if (lives <= 0) {

    gameRunning = false;

    clearInterval(timerInterval);

    gameOverScreen.classList.remove("hidden");

    return;

  }

  resetPlayer();

}


/* =========================
   UPDATE PLAYER
========================= */

function updatePlayer() {

  if (!gameRunning) return;


  /* Movement */

  if (keys.left) {
    player.velocityX = -player.speed;
  }

  else if (keys.right) {
    player.velocityX = player.speed;
  }

  else {
    player.velocityX *= 0.8;
  }


  player.x += player.velocityX;


  /* Gravity */

  player.velocityY += gravity;

  player.y += player.velocityY;

  player.onGround = false;


  /* Platform collision */

  for (let platform of platforms) {

    if (

      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width &&
      player.y + player.height >= platform.y &&
      player.y + player.height <= platform.y + 20 &&
      player.velocityY >= 0

    ) {

      player.y = platform.y - player.height;

      player.velocityY = 0;

      player.onGround = true;

    }

  }


  /* Obstacles */

  for (let obstacle of obstacles) {

    if (collision(player, obstacle)) {

      loseLife();

      return;

    }

  }


  /* Coins */

  for (let coin of coinObjects) {

    if (coin.collected) continue;


    const coinBox = {

      x: coin.x - 12,
      y: coin.y - 12,

      width: 24,
      height: 24

    };


    if (collision(player, coinBox)) {

      coin.collected = true;

      coins++;

      coinsEl.textContent = coins;

    }

  }


  /* Falling */

  if (player.y > canvas.height + 100) {

    loseLife();

  }


  /* Camera */

  cameraX = player.x - 200;

  if (cameraX < 0) {
    cameraX = 0;
  }


  /* Finish */

  if (player.x > 1550) {

    winGame();

  }

}


/* =========================
   DRAW BACKGROUND
========================= */

function drawBackground() {

  ctx.fillStyle = "#87CEEB";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /* Clouds */

  ctx.fillStyle = "rgba(255,255,255,.8)";

  for (let i = 0; i < 8; i++) {

    const x = i * 220 - cameraX * 0.3;

    const y = 70 + (i % 3) * 40;

    ctx.beginPath();

    ctx.arc(x, y, 25, 0, Math.PI * 2);

    ctx.arc(x + 30, y - 10, 35, 0, Math.PI * 2);

    ctx.arc(x + 65, y, 25, 0, Math.PI * 2);

    ctx.fill();

  }

}


/* =========================
   DRAW PLATFORMS
========================= */

function drawPlatforms() {

  for (let platform of platforms) {

    const x = platform.x - cameraX;

    ctx.fillStyle = "#4CAF50";

    ctx.fillRect(
      x,
      platform.y,
      platform.width,
      platform.height
    );

    ctx.fillStyle = "#2E7D32";

    ctx.fillRect(
      x,
      platform.y + 15,
      platform.width,
      platform.height - 15
    );

  }

}


/* =========================
   DRAW OBSTACLES
========================= */

function drawObstacles() {

  for (let obstacle of obstacles) {

    const x = obstacle.x - cameraX;

    ctx.fillStyle = "#E53935";

    ctx.fillRect(
      x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );

    ctx.fillStyle = "#FFCDD2";

    ctx.fillRect(
      x + 5,
      obstacle.y + 5,
      obstacle.width - 10,
      5
    );

  }

}


/* =========================
   DRAW COINS
========================= */

function drawCoins() {

  for (let coin of coinObjects) {

    if (coin.collected) continue;


    const x = coin.x - cameraX;

    ctx.fillStyle = "#FFD700";

    ctx.beginPath();

    ctx.arc(
      x,
      coin.y,
      12,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle = "#FFF3A0";

    ctx.beginPath();

    ctx.arc(
      x - 3,
      coin.y - 3,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();

  }

}


/* =========================
   DRAW PLAYER
========================= */

function drawPlayer() {

  const x = player.x - cameraX;

  const y = player.y;


  /* Body */

  ctx.fillStyle = "#2196F3";

  ctx.fillRect(
    x,
    y + 15,
    player.width,
    30
  );


  /* Head */

  ctx.fillStyle = "#FFD1A9";

  ctx.fillRect(
    x + 4,
    y - 5,
    27,
    25
  );


  /* Hair */

  ctx.fillStyle = "#4E342E";

  ctx.fillRect(
    x + 3,
    y - 7,
    29,
    8
  );


  /* Eyes */

  ctx.fillStyle = "#111";

  ctx.fillRect(
    x + 10,
    y + 4,
    3,
    3
  );

  ctx.fillRect(
    x + 22,
    y + 4,
    3,
    3
  );


  /* Legs */

  ctx.fillStyle = "#263238";

  ctx.fillRect(
    x + 5,
    y + 43,
    10,
    10
  );

  ctx.fillRect(
    x + 20,
    y + 43,
    10,
    10
  );

}


/* =========================
   FINISH LINE
========================= */

function drawFinish() {

  const x = 1580 - cameraX;

  ctx.fillStyle = "#222";

  ctx.fillRect(
    x,
    180,
    10,
    100
  );


  ctx.fillStyle = "#fff";

  for (let i = 0; i < 5; i++) {

    ctx.fillRect(
      x + 10,
      180 + i * 20,
      20,
      20
    );

  }


  ctx.fillStyle = "#111";

  ctx.fillRect(
    x + 30,
    180,
    20,
    20
  );

}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  drawBackground();

  drawPlatforms();

  drawObstacles();

  drawCoins();

  drawFinish();

  updatePlayer();

  drawPlayer();


  requestAnimationFrame(gameLoop);

}


/* =========================
   START GAME
========================= */

function startGame() {

  lives = 3;

  coins = 0;

  time = 0;

  livesEl.textContent = lives;

  coinsEl.textContent = coins;

  timerEl.textContent = time;


  coinObjects.forEach(coin => {

    coin.collected = false;

  });


  resetPlayer();


  startScreen.classList.add("hidden");

  gameOverScreen.classList.add("hidden");

  winScreen.classList.add("hidden");


  gameRunning = true;


  clearInterval(timerInterval);


  timerInterval = setInterval(function() {

    if (gameRunning) {

      time++;

      timerEl.textContent = time;

    }

  }, 1000);

}


/* =========================
   WIN GAME
========================= */

function winGame() {

  gameRunning = false;

  clearInterval(timerInterval);

  finalCoins.textContent = coins;

  finalTime.textContent = time;

  winScreen.classList.remove("hidden");

}


/* =========================
   BUTTONS
========================= */

startBtn.addEventListener(
  "click",
  startGame
);

restartBtn.addEventListener(
  "click",
  startGame
);

playAgainBtn.addEventListener(
  "click",
  startGame
);


/* =========================
   START LOOP
========================= */

gameLoop();
