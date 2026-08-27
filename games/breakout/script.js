const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");

const startScreen = document.getElementById("startScreen");
const endScreen = document.getElementById("endScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const endIcon = document.getElementById("endIcon");
const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");

document.getElementById("year").textContent =
    new Date().getFullYear();

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
let lives = 3;
let level = 1;

let gameRunning = false;
let animationId = null;

const keys = {};

const paddle = {
    width: 120,
    height: 14,
    x: WIDTH / 2 - 60,
    y: HEIGHT - 35,
    speed: 9
};

const ball = {
    x: WIDTH / 2,
    y: HEIGHT - 60,
    radius: 8,
    dx: 5,
    dy: -5
};

let bricks = [];

const brickRows = 5;
const brickCols = 9;

const brickWidth = 72;
const brickHeight = 23;
const brickGap = 8;

const totalBrickWidth =
    brickCols * brickWidth +
    (brickCols - 1) * brickGap;

const brickStartX =
    (WIDTH - totalBrickWidth) / 2;

const brickStartY = 55;


/* =========================
   BRICKS
========================= */

function createBricks() {

    bricks = [];

    for (let row = 0; row < brickRows; row++) {

        for (let col = 0; col < brickCols; col++) {

            bricks.push({
                x: brickStartX +
                    col * (brickWidth + brickGap),

                y: brickStartY +
                    row * (brickHeight + brickGap),

                width: brickWidth,
                height: brickHeight,
                alive: true
            });
        }
    }
}


/* =========================
   BALL RESET
========================= */

function resetBall() {

    ball.x = WIDTH / 2;
    ball.y = HEIGHT - 60;

    const ballSpeed =
        5 + (level - 1) * 0.6;

    ball.dx =
        Math.random() < 0.5
            ? -ballSpeed
            : ballSpeed;

    ball.dy = -ballSpeed;

    paddle.x =
        WIDTH / 2 -
        paddle.width / 2;
}


/* =========================
   GAME RESET
========================= */

function resetGame() {

    score = 0;
    lives = 3;
    level = 1;

    scoreEl.textContent = "0";
    livesEl.textContent = "3";
    levelEl.textContent = "1";

    createBricks();
    resetBall();

    draw();
}


/* =========================
   START
========================= */

function startGame() {

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    resetGame();

    startScreen.classList.add("hidden");
    endScreen.classList.add("hidden");

    gameRunning = true;

    gameLoop();
}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    if (!gameRunning) return;

    update();
    draw();

    animationId =
        requestAnimationFrame(gameLoop);
}


/* =========================
   UPDATE
========================= */

function update() {

    movePaddle();

    ball.x += ball.dx;
    ball.y += ball.dy;


    /* WALL */

    if (ball.x - ball.radius <= 0) {

        ball.x = ball.radius;
        ball.dx = Math.abs(ball.dx);
    }

    if (ball.x + ball.radius >= WIDTH) {

        ball.x = WIDTH - ball.radius;
        ball.dx = -Math.abs(ball.dx);
    }

    if (ball.y - ball.radius <= 0) {

        ball.y = ball.radius;
        ball.dy = Math.abs(ball.dy);
    }


    /* PADDLE */

    if (
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width &&
        ball.dy > 0
    ) {

        const paddleCenter =
            paddle.x + paddle.width / 2;

        const hitPosition =
            (ball.x - paddleCenter) /
            (paddle.width / 2);

        ball.dx = hitPosition * 7;

        if (Math.abs(ball.dx) < 1) {
            ball.dx = ball.dx < 0 ? -1 : 1;
        }

        ball.dy = -Math.abs(ball.dy);

        ball.y =
            paddle.y -
            ball.radius;
    }


    /* BRICKS */

    for (let i = 0; i < bricks.length; i++) {

        const brick = bricks[i];

        if (!brick.alive) continue;

        const hit =
            ball.x + ball.radius > brick.x &&
            ball.x - ball.radius <
                brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius <
                brick.y + brick.height;

        if (hit) {

            brick.alive = false;

            score += 10;

            scoreEl.textContent = score;

            ball.dy *= -1;

            break;
        }
    }


    /* LEVEL COMPLETE */

    const bricksLeft =
        bricks.some(brick => brick.alive);

    if (!bricksLeft) {

        nextLevel();
        return;
    }


    /* BALL LOST */

    if (
        ball.y - ball.radius > HEIGHT
    ) {

        loseLife();
    }
}


/* =========================
   PADDLE
========================= */

function movePaddle() {

    if (
        keys.ArrowLeft ||
        keys.a ||
        keys.A
    ) {
        paddle.x -= paddle.speed;
    }

    if (
        keys.ArrowRight ||
        keys.d ||
        keys.D
    ) {
        paddle.x += paddle.speed;
    }

    keepPaddleInside();
}


/* =========================
   KEEP PADDLE INSIDE
========================= */

function keepPaddleInside() {

    if (paddle.x < 0) {
        paddle.x = 0;
    }

    if (
        paddle.x + paddle.width > WIDTH
    ) {
        paddle.x =
            WIDTH - paddle.width;
    }
}


/* =========================
   LOSE LIFE
========================= */

function loseLife() {

    lives--;

    livesEl.textContent = lives;

    if (lives <= 0) {

        endGame(false);
        return;
    }

    resetBall();
}


/* =========================
   NEXT LEVEL
========================= */

function nextLevel() {

    level++;

    if (level > 3) {

        endGame(true);
        return;
    }

    levelEl.textContent = level;

    createBricks();
    resetBall();
}


/* =========================
   END GAME
========================= */

function endGame(won) {

    gameRunning = false;

    if (animationId !== null) {

        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (won) {

        endIcon.textContent = "🏆";
        endTitle.textContent = "You Win!";
        endText.textContent =
            "Amazing! Final Score: " + score;

    } else {

        endIcon.textContent = "💥";
        endTitle.textContent = "Game Over";
        endText.textContent =
            "Your Score: " + score;
    }

    endScreen.classList.remove("hidden");
}


/* =========================
   DRAW
========================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    /* BACKGROUND */

    ctx.fillStyle = "#080d18";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    /* BRICKS */

    for (const brick of bricks) {

        if (!brick.alive) continue;

        ctx.fillStyle = "#6c5ce7";

        ctx.fillRect(
            brick.x,
            brick.y,
            brick.width,
            brick.height
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.25)";

        ctx.fillRect(
            brick.x,
            brick.y,
            brick.width,
            4
        );
    }


    /* PADDLE */

    ctx.fillStyle = "#00d4ff";

    ctx.fillRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
    );


    /* BALL */

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.fill();

    ctx.closePath();
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        keys[event.key] = true;

        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === " "
        ) {
            event.preventDefault();
        }
    }
);

document.addEventListener(
    "keyup",
    function(event) {

        keys[event.key] = false;
    }
);


/* =========================
   MOUSE
========================= */

canvas.addEventListener(
    "mousemove",
    function(event) {

        if (!gameRunning) return;

        const rect =
            canvas.getBoundingClientRect();

        const scaleX =
            WIDTH / rect.width;

        const mouseX =
            (event.clientX - rect.left) *
            scaleX;

        paddle.x =
            mouseX -
            paddle.width / 2;

        keepPaddleInside();
    }
);


/* =========================
   TOUCH
========================= */

canvas.addEventListener(
    "touchstart",
    movePaddleTouch,
    { passive: false }
);

canvas.addEventListener(
    "touchmove",
    movePaddleTouch,
    { passive: false }
);

function movePaddleTouch(event) {

    if (!gameRunning) return;

    event.preventDefault();

    const touch =
        event.touches[0];

    if (!touch) return;

    const rect =
        canvas.getBoundingClientRect();

    const scaleX =
        WIDTH / rect.width;

    const touchX =
        (touch.clientX - rect.left) *
        scaleX;

    paddle.x =
        touchX -
        paddle.width / 2;

    keepPaddleInside();
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


/* =========================
   INITIALIZE
========================= */

resetGame();
