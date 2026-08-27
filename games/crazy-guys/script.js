const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const speedEl = document.getElementById("speed");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScoreEl = document.getElementById("finalScore");
const jumpBtn = document.getElementById("jumpBtn");


/* =========================
   CANVAS
========================= */

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


/* =========================
   GAME VARIABLES
========================= */

let running = false;
let animationId = null;

let score = 0;

let highScore =
    Number(localStorage.getItem("crazyGuysHighScore")) || 0;

highScoreEl.textContent = highScore;

let gameSpeed = 6;

let obstacleTimer = 0;

let groundY;


/* =========================
   PLAYER
========================= */

const player = {

    x: 100,

    y: 0,

    width: 45,

    height: 58,

    velocityY: 0,

    gravity: 0.75,

    jumpPower: -14,

    grounded: false

};


/* =========================
   OBSTACLES
========================= */

let obstacles = [];


/* =========================
   CLOUDS
========================= */

let clouds = [
    {
        x: 150,
        y: 100,
        size: 45,
        speed: 0.4
    },
    {
        x: 500,
        y: 160,
        size: 60,
        speed: 0.25
    },
    {
        x: 850,
        y: 90,
        size: 40,
        speed: 0.35
    }
];


/* =========================
   RESET
========================= */

function resetGame() {

    score = 0;

    gameSpeed = 6;

    obstacleTimer = 0;

    obstacles = [];

    groundY = canvas.height - 100;

    player.x = Math.min(100, canvas.width * 0.2);

    player.y =
        groundY - player.height;

    player.velocityY = 0;

    player.grounded = true;

    scoreEl.textContent = "0";

    speedEl.textContent = "1x";
}


/* =========================
   START
========================= */

function startGame() {

    resetGame();

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    running = true;

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    gameLoop();
}


/* =========================
   JUMP
========================= */

function jump() {

    if (!running) {
        return;
    }

    if (player.grounded) {

        player.velocityY =
            player.jumpPower;

        player.grounded = false;
    }
}


/* =========================
   UPDATE
========================= */

function update() {

    groundY = canvas.height - 100;


    /* PLAYER */

    player.velocityY += player.gravity;

    player.y += player.velocityY;


    if (
        player.y + player.height >= groundY
    ) {

        player.y =
            groundY - player.height;

        player.velocityY = 0;

        player.grounded = true;
    }


    /* SPEED */

    gameSpeed += 0.0015;

    const speedLevel =
        Math.min(
            5,
            Math.floor(gameSpeed / 3)
        );

    speedEl.textContent =
        speedLevel + "x";


    /* SCORE */

    score += 0.05;

    scoreEl.textContent =
        Math.floor(score);


    /* OBSTACLES */

    obstacleTimer--;

    if (obstacleTimer <= 0) {

        createObstacle();

        obstacleTimer =
            80 +
            Math.random() * 100 -
            Math.min(gameSpeed * 3, 40);
    }


    for (let i = obstacles.length - 1; i >= 0; i--) {

        const obstacle = obstacles[i];

        obstacle.x -= gameSpeed;


        if (obstacle.x + obstacle.width < 0) {

            obstacles.splice(i, 1);

            continue;
        }


        if (checkCollision(player, obstacle)) {

            endGame();

            return;
        }
    }


    /* CLOUDS */

    for (const cloud of clouds) {

        cloud.x -= cloud.speed;

        if (cloud.x < -120) {

            cloud.x =
                canvas.width + 100;

            cloud.y =
                60 + Math.random() * 150;
        }
    }
}


/* =========================
   CREATE OBSTACLE
========================= */

function createObstacle() {

    const type =
        Math.random() < 0.5
            ? "rock"
            : "spike";

    const height =
        type === "rock"
            ? 35 + Math.random() * 25
            : 40 + Math.random() * 25;

    obstacles.push({

        x: canvas.width + 30,

        y: groundY - height,

        width:
            type === "rock"
                ? 35
                : 45,

        height: height,

        type: type
    });
}


/* =========================
   COLLISION
========================= */

function checkCollision(a, b) {

    const padding = 8;

    return (

        a.x + padding < b.x + b.width &&

        a.x +
            a.width -
            padding >
            b.x &&

        a.y + padding < b.y + b.height &&

        a.y +
            a.height -
            padding >
            b.y
    );
}


/* =========================
   DRAW
========================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* SKY */

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#72d7ff"
    );

    gradient.addColorStop(
        1,
        "#d8f7ff"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* SUN */

    ctx.beginPath();

    ctx.arc(
        canvas.width - 100,
        110,
        45,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffd93d";

    ctx.fill();


    /* CLOUDS */

    drawClouds();


    /* GROUND */

    ctx.fillStyle = "#6bcB77";

    ctx.fillRect(
        0,
        groundY,
        canvas.width,
        canvas.height - groundY
    );


    ctx.fillStyle = "#4caf50";

    ctx.fillRect(
        0,
        groundY,
        canvas.width,
        8
    );


    /* PLAYER */

    drawPlayer();


    /* OBSTACLES */

    for (const obstacle of obstacles) {

        drawObstacle(obstacle);
    }
}


/* =========================
   DRAW CLOUDS
========================= */

function drawClouds() {

    ctx.fillStyle =
        "rgba(255,255,255,0.9)";

    for (const cloud of clouds) {

        ctx.beginPath();

        ctx.arc(
            cloud.x,
            cloud.y,
            cloud.size * 0.45,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x + cloud.size * 0.4,
            cloud.y - 12,
            cloud.size * 0.35,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloud.x + cloud.size * 0.75,
            cloud.y,
            cloud.size * 0.4,
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

    const x = player.x;
    const y = player.y;


    /* BODY */

    ctx.fillStyle = "#ff4d6d";

    ctx.beginPath();

    ctx.roundRect(
        x,
        y + 15,
        player.width,
        player.height - 15,
        12
    );

    ctx.fill();


    /* HEAD */

    ctx.fillStyle = "#ffd6a5";

    ctx.beginPath();

    ctx.arc(
        x + player.width / 2,
        y + 13,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* HAIR */

    ctx.fillStyle = "#352208";

    ctx.beginPath();

    ctx.arc(
        x + player.width / 2,
        y + 7,
        17,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /* EYES */

    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(
        x + 16,
        y + 12,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 30,
        y + 12,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* LEGS */

    ctx.strokeStyle = "#172b38";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        x + 13,
        y + player.height - 2
    );

    ctx.lineTo(
        x + 8,
        y + player.height + 8
    );

    ctx.moveTo(
        x + 32,
        y + player.height - 2
    );

    ctx.lineTo(
        x + 38,
        y + player.height + 8
    );

    ctx.stroke();
}


/* =========================
   DRAW OBSTACLE
========================= */

function drawObstacle(obstacle) {

    if (obstacle.type === "rock") {

        ctx.fillStyle = "#6d6875";

        ctx.beginPath();

        ctx.moveTo(
            obstacle.x,
            obstacle.y + obstacle.height
        );

        ctx.lineTo(
            obstacle.x + 5,
            obstacle.y + 10
        );

        ctx.lineTo(
            obstacle.x + obstacle.width / 2,
            obstacle.y
        );

        ctx.lineTo(
            obstacle.x + obstacle.width - 5,
            obstacle.y + 10
        );

        ctx.lineTo(
            obstacle.x + obstacle.width,
            obstacle.y + obstacle.height
        );

        ctx.closePath();

        ctx.fill();

    } else {

        ctx.fillStyle = "#ff6b35";

        ctx.beginPath();

        ctx.moveTo(
            obstacle.x,
            obstacle.y + obstacle.height
        );

        ctx.lineTo(
            obstacle.x + obstacle.width / 2,
            obstacle.y
        );

        ctx.lineTo(
            obstacle.x + obstacle.width,
            obstacle.y + obstacle.height
        );

        ctx.closePath();

        ctx.fill();
    }
}


/* =========================
   GAME OVER
========================= */

function endGame() {

    running = false;

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;
    }


    const final =
        Math.floor(score);

    finalScoreEl.textContent =
        final;


    if (final > highScore) {

        highScore = final;

        localStorage.setItem(
            "crazyGuysHighScore",
            highScore
        );

        highScoreEl.textContent =
            highScore;
    }


    gameOverScreen.classList.remove(
        "hidden"
    );
}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    if (!running) {
        return;
    }

    update();

    draw();

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            event.preventDefault();

            jump();
        }
    }
);


/* =========================
   MOUSE / TOUCH
========================= */

canvas.addEventListener(
    "pointerdown",
    function() {

        jump();
    }
);


jumpBtn.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();

        jump();
    }
);


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


/* =========================
   INITIAL DRAW
========================= */

resetGame();

draw();
