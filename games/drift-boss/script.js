const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const coinsEl = document.getElementById("coins");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScoreEl = document.getElementById("finalScore");
const finalBestEl = document.getElementById("finalBest");
const finalCoinsEl = document.getElementById("finalCoins");

const driftBtn = document.getElementById("driftBtn");


/* =========================================
   CANVAS
========================================= */

let W = 900;
let H = 506;

function resizeCanvas() {

  const rect = canvas.getBoundingClientRect();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  W = rect.width;
  H = rect.height;

  canvas.width = W * dpr;
  canvas.height = H * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* =========================================
   GAME VARIABLES
========================================= */

let gameRunning = false;

let score = 0;
let coins = 0;

let bestScore =
  Number(localStorage.getItem("driftBossBest")) || 0;

let totalCoins =
  Number(localStorage.getItem("driftBossCoins")) || 0;

bestScoreEl.textContent = bestScore;
coinsEl.textContent = totalCoins;

let distance = 0;

let speed = 4;

let roadCenter = 0;
let targetRoadCenter = 0;

let curveTimer = 0;

let driftPressed = false;
let leftPressed = false;
let rightPressed = false;

let animationId = null;


/* =========================================
   CAR
========================================= */

const car = {

  x: 0,
  y: 0,

  width: 42,
  height: 68,

  angle: 0,

  targetAngle: 0,

  driftAmount: 0
};


/* =========================================
   ROAD
========================================= */

const road = {

  width: 210,

  segments: [],

  segmentLength: 80

};


/* =========================================
   COINS
========================================= */

let coinList = [];


/* =========================================
   PARTICLES
========================================= */

let particles = [];


/* =========================================
   INITIALIZE ROAD
========================================= */

function createRoad() {

  road.segments = [];

  let center = 0;

  for (let i = 0; i < 30; i++) {

    road.segments.push({
      center: center,
      curve: 0
    });
  }

  roadCenter = 0;
  targetRoadCenter = 0;
}


/* =========================================
   START GAME
========================================= */

function startGame() {

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  gameRunning = true;

  score = 0;
  coins = 0;
  distance = 0;

  speed = 4;

  curveTimer = 0;

  particles = [];
  coinList = [];

  createRoad();

  car.x = 0;
  car.y = 0;

  car.angle = 0;
  car.targetAngle = 0;
  car.driftAmount = 0;

  scoreEl.textContent = "0";
  coinsEl.textContent = "0";

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  gameLoop();
}


/* =========================================
   GAME LOOP
========================================= */

let lastTime = 0;

function gameLoop(timestamp = 0) {

  if (!gameRunning) return;

  const delta =
    Math.min((timestamp - lastTime) / 16.67, 2) || 1;

  lastTime = timestamp;

  update(delta);
  draw();

  animationId = requestAnimationFrame(gameLoop);
}


/* =========================================
   UPDATE
========================================= */

function update(dt) {

  distance += speed * dt;

  score = Math.floor(distance / 5);

  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = bestScore;
  }

  scoreEl.textContent = score;

  /* Speed slowly increases */

  speed = Math.min(
    8.5,
    4 + distance / 2500
  );


  /* Road curve */

  curveTimer -= dt;

  if (curveTimer <= 0) {

    targetRoadCenter =
      (Math.random() - 0.5) * 230;

    curveTimer =
      70 + Math.random() * 90;
  }

  roadCenter +=
    (targetRoadCenter - roadCenter) *
    0.018 *
    dt;


  /* Car controls */

  let steering = 0;

  if (leftPressed) steering -= 1;
  if (rightPressed) steering += 1;

  if (driftPressed) {

    if (steering === 0) {

      steering =
        roadCenter > car.x ? 1 : -1;

    }

    car.targetAngle =
      steering * 0.38;

    car.x +=
      steering * 3.1 * dt;

    car.driftAmount +=
      (1 - car.driftAmount) *
      0.12 * dt;

  } else {

    car.targetAngle *=
      Math.pow(0.84, dt);

    car.driftAmount *=
      Math.pow(0.82, dt);
  }


  /* Keyboard steering */

  if (!driftPressed && steering !== 0) {

    car.x +=
      steering * 2.2 * dt;

    car.targetAngle =
      steering * 0.22;
  }


  /* Natural movement toward road */

  if (
    Math.abs(car.x - roadCenter) > 50 &&
    !driftPressed
  ) {

    car.x +=
      (roadCenter - car.x) *
      0.008 *
      dt;
  }


  /* Smooth rotation */

  car.angle +=
    (car.targetAngle - car.angle) *
    0.15 *
    dt;


  /* Coin generation */

  if (Math.random() < 0.025 * dt) {

    coinList.push({

      x:
        roadCenter +
        (Math.random() - 0.5) *
        120,

      y: -30,

      radius: 9,

      rotation: 0

    });

  }


  /* Move coins */

  for (let i = coinList.length - 1; i >= 0; i--) {

    const coin = coinList[i];

    coin.y += speed * dt;

    coin.rotation += 0.08 * dt;


    const dx =
      coin.x - car.x;

    const dy =
      coin.y - (H * 0.75);

    const distanceToCar =
      Math.sqrt(dx * dx + dy * dy);


    if (distanceToCar < 30) {

      coins++;

      totalCoins++;

      localStorage.setItem(
        "driftBossCoins",
        totalCoins
      );

      coinsEl.textContent =
        totalCoins;

      createCoinParticles(
        coin.x,
        coin.y
      );

      coinList.splice(i, 1);

      continue;
    }


    if (coin.y > H + 30) {

      coinList.splice(i, 1);
    }
  }


  /* Particles */

  updateParticles(dt);


  /* Collision */

  const roadHalf =
    road.width / 2;

  const carRoadPosition =
    car.x - roadCenter;


  if (
    Math.abs(carRoadPosition) >
    roadHalf - 25
  ) {

    createCrashParticles();

    endGame();
  }
}


/* =========================================
   DRAW
========================================= */

function draw() {

  ctx.clearRect(0, 0, W, H);

  drawBackground();

  drawRoad();

  drawCoins();

  drawParticles();

  drawCar();
}


/* =========================================
   BACKGROUND
========================================= */

function drawBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );

  gradient.addColorStop(
    0,
    "#6da64d"
  );

  gradient.addColorStop(
    1,
    "#315b36"
  );

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* Grass stripes */

  ctx.globalAlpha = 0.15;

  ctx.fillStyle = "#ffffff";

  const stripeOffset =
    (distance * 2) % 80;

  for (
    let y = -80 + stripeOffset;
    y < H;
    y += 80
  ) {

    ctx.fillRect(
      0,
      y,
      W,
      2
    );
  }

  ctx.globalAlpha = 1;
}


/* =========================================
   ROAD
========================================= */

function drawRoad() {

  const roadX =
    W / 2 +
    roadCenter;

  const roadTopWidth =
    road.width * 0.55;

  const roadBottomWidth =
    road.width;


  /* Road */

  ctx.beginPath();

  ctx.moveTo(
    roadX - roadTopWidth / 2,
    0
  );

  ctx.lineTo(
    roadX + roadTopWidth / 2,
    0
  );

  ctx.lineTo(
    roadX + roadBottomWidth / 2,
    H
  );

  ctx.lineTo(
    roadX - roadBottomWidth / 2,
    H
  );

  ctx.closePath();

  ctx.fillStyle = "#343941";

  ctx.fill();


  /* Road edge */

  ctx.strokeStyle = "#e9e9e9";

  ctx.lineWidth = 5;

  ctx.beginPath();

  ctx.moveTo(
    roadX - roadTopWidth / 2,
    0
  );

  ctx.lineTo(
    roadX - roadBottomWidth / 2,
    H
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    roadX + roadTopWidth / 2,
    0
  );

  ctx.lineTo(
    roadX + roadBottomWidth / 2,
    H
  );

  ctx.stroke();


  /* Center dashed line */

  ctx.strokeStyle =
    "rgba(255,255,255,0.55)";

  ctx.lineWidth = 3;

  ctx.setLineDash([22, 25]);

  ctx.lineDashOffset =
    distance * 2;

  ctx.beginPath();

  ctx.moveTo(
    roadX,
    0
  );

  ctx.lineTo(
    roadX,
    H
  );

  ctx.stroke();

  ctx.setLineDash([]);


  /* Roadside markers */

  const markerOffset =
    (distance * 2) % 55;

  for (
    let y = -55 + markerOffset;
    y < H;
    y += 55
  ) {

    const perspective =
      y / H;

    const roadWidthAtY =
      roadTopWidth +
      (roadBottomWidth - roadTopWidth) *
      perspective;

    const center =
      roadX;

    ctx.fillStyle =
      "#f5f5f5";

    ctx.fillRect(
      center -
        roadWidthAtY / 2 -
        14,
      y,
      7,
      15
    );

    ctx.fillRect(
      center +
        roadWidthAtY / 2 +
        7,
      y,
      7,
      15
    );
  }
}


/* =========================================
   CAR
========================================= */

function drawCar() {

  const x =
    W / 2 + car.x;

  const y =
    H * 0.75;

  ctx.save();

  ctx.translate(x, y);

  ctx.rotate(car.angle);


  /* Shadow */

  ctx.fillStyle =
    "rgba(0,0,0,0.3)";

  ctx.beginPath();

  ctx.ellipse(
    0,
    8,
    27,
    38,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /* Drift smoke */

  if (car.driftAmount > 0.15) {

    ctx.globalAlpha =
      car.driftAmount * 0.5;

    ctx.fillStyle =
      "#ffffff";

    for (let i = 0; i < 3; i++) {

      ctx.beginPath();

      ctx.arc(
        -18 + Math.random() * 36,
        28 + Math.random() * 15,
        5 + Math.random() * 5,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }


  /* Wheels */

  ctx.fillStyle = "#101217";

  ctx.fillRect(
    -25,
    -24,
    9,
    22
  );

  ctx.fillRect(
    16,
    -24,
    9,
    22
  );

  ctx.fillRect(
    -25,
    9,
    9,
    22
  );

  ctx.fillRect(
    16,
    9,
    9,
    22
  );


  /* Car body */

  const bodyGradient =
    ctx.createLinearGradient(
      -20,
      0,
      20,
      0
    );

  bodyGradient.addColorStop(
    0,
    "#5928d9"
  );

  bodyGradient.addColorStop(
    0.5,
    "#8d61ff"
  );

  bodyGradient.addColorStop(
    1,
    "#4e24c7"
  );

  ctx.fillStyle =
    bodyGradient;

  ctx.beginPath();

  ctx.roundRect(
    -20,
    -34,
    40,
    68,
    10
  );

  ctx.fill();


  /* Windshield */

  ctx.fillStyle =
    "#111b32";

  ctx.beginPath();

  ctx.roundRect(
    -14,
    -20,
    28,
    22,
    7
  );

  ctx.fill();


  /* Front window */

  ctx.fillStyle =
    "#263c60";

  ctx.beginPath();

  ctx.roundRect(
    -12,
    -17,
    24,
    14,
    5
  );

  ctx.fill();


  /* Headlights */

  ctx.fillStyle =
    "#fff6b0";

  ctx.fillRect(
    -15,
    -33,
    10,
    5
  );

  ctx.fillRect(
    5,
    -33,
    10,
    5
  );


  /* Rear lights */

  ctx.fillStyle =
    "#ff3c58";

  ctx.fillRect(
    -15,
    28,
    10,
    4
  );

  ctx.fillRect(
    5,
    28,
    10,
    4
  );


  /* Center highlight */

  ctx.fillStyle =
    "rgba(255,255,255,0.18)";

  ctx.fillRect(
    -2,
    -29,
    4,
    58
  );

  ctx.restore();
}


/* =========================================
   COINS
========================================= */

function drawCoins() {

  for (const coin of coinList) {

    const x =
      W / 2 + coin.x;

    const y =
      coin.y;

    ctx.save();

    ctx.translate(x, y);

    const scale =
      Math.abs(
        Math.cos(coin.rotation)
      );

    ctx.scale(
      Math.max(scale, 0.2),
      1
    );


    ctx.fillStyle =
      "#ffd83d";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      coin.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
      "#f0a900";

    ctx.lineWidth = 2;

    ctx.stroke();


    ctx.fillStyle =
      "#fff2a2";

    ctx.font =
      "bold 10px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      "$",
      0,
      1
    );

    ctx.restore();
  }
}


/* =========================================
   PARTICLES
========================================= */

function createCoinParticles(x, y) {

  for (let i = 0; i < 10; i++) {

    particles.push({

      x: W / 2 + x,
      y: y,

      vx:
        (Math.random() - 0.5) * 4,

      vy:
        (Math.random() - 0.5) * 4,

      life: 1,

      size:
        2 + Math.random() * 3

    });
  }
}


function createCrashParticles() {

  const x =
    W / 2 + car.x;

  const y =
    H * 0.75;

  for (let i = 0; i < 25; i++) {

    particles.push({

      x: x,
      y: y,

      vx:
        (Math.random() - 0.5) * 8,

      vy:
        (Math.random() - 0.5) * 8,

      life: 1,

      size:
        2 + Math.random() * 5

    });
  }
}


function updateParticles(dt) {

  for (
    let i = particles.length - 1;
    i >= 0;
    i--
  ) {

    const p =
      particles[i];

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    p.vy += 0.15 * dt;

    p.life -= 0.035 * dt;

    if (p.life <= 0) {

      particles.splice(i, 1);
    }
  }
}


function drawParticles() {

  for (const p of particles) {

    ctx.globalAlpha =
      Math.max(0, p.life);

    ctx.fillStyle =
      "#ffffff";

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.size,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.globalAlpha = 1;
}


/* =========================================
   GAME OVER
========================================= */

function endGame() {

  if (!gameRunning) return;

  gameRunning = false;

  if (score > bestScore) {

    bestScore = score;

    localStorage.setItem(
      "driftBossBest",
      bestScore
    );
  }

  bestScoreEl.textContent =
    bestScore;

  finalScoreEl.textContent =
    score;

  finalBestEl.textContent =
    bestScore;

  finalCoinsEl.textContent =
    coins;

  gameOverScreen.classList.remove(
    "hidden"
  );
}


/* =========================================
   KEYBOARD
========================================= */

window.addEventListener(
  "keydown",
  (event) => {

    if (
      event.code === "Space" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {

      event.preventDefault();
    }


    if (event.code === "Space") {

      driftPressed = true;
    }


    if (event.key === "ArrowLeft") {

      leftPressed = true;
    }


    if (event.key === "ArrowRight") {

      rightPressed = true;
    }


    if (
      event.key.toLowerCase() === "r"
    ) {

      startGame();
    }
  }
);


window.addEventListener(
  "keyup",
  (event) => {

    if (event.code === "Space") {

      driftPressed = false;
    }


    if (event.key === "ArrowLeft") {

      leftPressed = false;
    }


    if (event.key === "ArrowRight") {

      rightPressed = false;
    }
  }
);


/* =========================================
   MOBILE DRIFT BUTTON
========================================= */

function pressDrift(event) {

  event.preventDefault();

  driftPressed = true;
}


function releaseDrift(event) {

  event.preventDefault();

  driftPressed = false;
}


driftBtn.addEventListener(
  "pointerdown",
  pressDrift
);

driftBtn.addEventListener(
  "pointerup",
  releaseDrift
);

driftBtn.addEventListener(
  "pointercancel",
  releaseDrift
);

driftBtn.addEventListener(
  "pointerleave",
  releaseDrift
);


/* =========================================
   BUTTONS
========================================= */

startBtn.addEventListener(
  "click",
  startGame
);

restartBtn.addEventListener(
  "click",
  startGame
);


/* =========================================
   INITIAL DRAW
========================================= */

createRoad();

draw();
