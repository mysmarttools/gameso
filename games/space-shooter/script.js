const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const shootButton = document.getElementById("shootButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
let lives = 3;
let level = 1;

let running = false;
let animationId = null;

let bullets = [];
let enemies = [];
let stars = [];

let enemyTimer = 0;
let shootCooldown = 0;

const keys = {};

const player = {
    x: WIDTH / 2 - 24,
    y: HEIGHT - 75,
    width: 48,
    height: 38,
    speed: 7
};


/* =========================
   STARS
========================= */

function createStars() {

    stars = [];

    for (let i = 0; i < 100; i++) {

        stars.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1.5 + 0.3
        });
    }
}


/* =========================
   RESET GAME
========================= */

function resetGame() {

    score = 0;
    lives = 3;
    level = 1;

    bullets = [];
    enemies = [];

    enemyTimer = 0;
    shootCooldown = 0;

    player.x = WIDTH / 2 - player.width / 2;

    updateStats();

    createStars();
}


/* =========================
   STATS
========================= */

function updateStats() {

    scoreEl.textContent = score;
    livesEl.textContent = lives;
    levelEl.textContent = level;
}


/* =========================
   START GAME
========================= */

function startGame() {

    resetGame();

    running = true;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    gameLoop();
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
        requestAnimationFrame(gameLoop);
}


/* =========================
   UPDATE
========================= */

function update() {

    movePlayer();

    updateStars();

    shootCooldown--;

    if (
        keys[" "] ||
        keys["Spacebar"]
    ) {
        shoot();
    }

    updateBullets();

    spawnEnemies();

    updateEnemies();

    checkCollisions();

    /* Increase level */

    const newLevel =
        Math.floor(score / 100) + 1;

    if (newLevel > level) {

        level = Math.min(newLevel, 10);

        updateStats();
    }
}


/* =========================
   PLAYER MOVEMENT
========================= */

function movePlayer() {

    if (
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"]
    ) {

        player.x -= player.speed;
    }

    if (
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"]
    ) {

        player.x += player.speed;
    }

    if (player.x < 0) {
        player.x = 0;
    }

    if (
        player.x + player.width > WIDTH
    ) {

        player.x =
            WIDTH - player.width;
    }
}


/* =========================
   SHOOT
========================= */

function shoot() {

    if (!running) {
        return;
    }

    if (shootCooldown > 0) {
        return;
    }

    bullets.push({
        x: player.x + player.width / 2,
        y: player.y - 5,
        width: 5,
        height: 16,
        speed: 10
    });

    shootCooldown = 12;
}


/* =========================
   BULLETS
========================= */

function updateBullets() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.y -= bullet.speed;

        if (bullet.y < -20) {
            bullets.splice(i, 1);
        }
    }
}


/* =========================
   SPAWN ENEMIES
========================= */

function spawnEnemies() {

    enemyTimer--;

    if (enemyTimer > 0) {
        return;
    }

    const difficulty =
        Math.max(18, 55 - level * 4);

    enemyTimer = difficulty;

    const size =
        Math.random() * 12 + 32;

    enemies.push({

        x:
            Math.random() *
            (WIDTH - size),

        y: -size,

        width: size,
        height: size,

        speed:
            1.5 +
            Math.random() * 1.2 +
            level * 0.18,

        color:
            Math.random() > 0.5
                ? "#ff4d8d"
                : "#8b5cf6"
    });
}


/* =========================
   ENEMIES
========================= */

function updateEnemies() {

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy = enemies[i];

        enemy.y += enemy.speed;

        /* Enemy reaches bottom */

        if (
            enemy.y >
            HEIGHT + enemy.height
        ) {

            enemies.splice(i, 1);

            loseLife();

            if (!running) {
                return;
            }
        }
    }
}


/* =========================
   COLLISIONS
========================= */

function checkCollisions() {

    /* Bullet vs enemy */

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet = bullets[i];

        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy = enemies[j];

            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {

                bullets.splice(i, 1);
                enemies.splice(j, 1);

                score += 10;

                updateStats();

                break;
            }
        }
    }


    /* Player vs enemy */

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy = enemies[i];

        if (
            player.x <
                enemy.x + enemy.width &&
            player.x + player.width >
                enemy.x &&
            player.y <
                enemy.y + enemy.height &&
            player.y + player.height >
                enemy.y
        ) {

            enemies.splice(i, 1);

            loseLife();

            if (!running) {
                return;
            }
        }
    }
}


/* =========================
   LOSE LIFE
========================= */

function loseLife() {

    lives--;

    updateStats();

    if (lives <= 0) {

        endGame(false);

        return;
    }

    player.x =
        WIDTH / 2 -
        player.width / 2;
}


/* =========================
   STARS UPDATE
========================= */

function updateStars() {

    for (const star of stars) {

        star.y += star.speed;

        if (star.y > HEIGHT) {

            star.y = -5;

            star.x =
                Math.random() * WIDTH;
        }
    }
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


    /* Background */

    ctx.fillStyle = "#030712";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    /* Stars */

    drawStars();


    /* Player */

    drawPlayer();


    /* Bullets */

    drawBullets();


    /* Enemies */

    drawEnemies();
}


/* =========================
   DRAW STARS
========================= */

function drawStars() {

    for (const star of stars) {

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.7)";

        ctx.fill();
    }
}


/* =========================
   DRAW PLAYER
========================= */

function drawPlayer() {

    const centerX =
        player.x + player.width / 2;


    /* Glow */

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#00d4ff";


    /* Ship */

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        player.y
    );

    ctx.lineTo(
        player.x,
        player.y + player.height
    );

    ctx.lineTo(
        centerX,
        player.y + player.height - 10
    );

    ctx.lineTo(
        player.x + player.width,
        player.y + player.height
    );

    ctx.closePath();

    ctx.fillStyle = "#00d4ff";

    ctx.fill();

    ctx.shadowBlur = 0;


    /* Cockpit */

    ctx.beginPath();

    ctx.arc(
        centerX,
        player.y + 17,
        6,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";

    ctx.fill();


    /* Engine */

    ctx.fillStyle = "#ff8a00";

    ctx.fillRect(
        centerX - 5,
        player.y + player.height - 3,
        10,
        8
    );
}


/* =========================
   DRAW BULLETS
========================= */

function drawBullets() {

    for (const bullet of bullets) {

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#00d4ff";

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );

        ctx.shadowBlur = 0;
    }
}


/* =========================
   DRAW ENEMIES
========================= */

function drawEnemies() {

    for (const enemy of enemies) {

        const centerX =
            enemy.x + enemy.width / 2;

        const centerY =
            enemy.y + enemy.height / 2;


        ctx.shadowBlur = 20;
        ctx.shadowColor = enemy.color;


        /* Enemy body */

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            enemy.width / 2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = enemy.color;

        ctx.fill();


        /* Enemy wings */

        ctx.beginPath();

        ctx.moveTo(
            enemy.x,
            centerY
        );

        ctx.lineTo(
            enemy.x - 8,
            centerY + 8
        );

        ctx.lineTo(
            enemy.x + 5,
            centerY + 3
        );

        ctx.closePath();

        ctx.fill();


        ctx.beginPath();

        ctx.moveTo(
            enemy.x + enemy.width,
            centerY
        );

        ctx.lineTo(
            enemy.x + enemy.width + 8,
            centerY + 8
        );

        ctx.lineTo(
            enemy.x + enemy.width - 5,
            centerY + 3
        );

        ctx.closePath();

        ctx.fill();


        /* Eye */

        ctx.shadowBlur = 0;

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";

        ctx.fill();
    }
}


/* =========================
   END GAME
========================= */

function endGame(won) {

    running = false;

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;
    }

    if (won) {

        resultIcon.textContent = "🏆";

        resultTitle.textContent =
            "You Win!";

        resultText.textContent =
            "Amazing! Final Score: " +
            score;

    } else {

        resultIcon.textContent = "💥";

        resultTitle.textContent =
            "Game Over";

        resultText.textContent =
            "Your Score: " +
            score;
    }

    gameOverScreen.classList.remove(
        "hidden"
    );
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function (event) {

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
    function (event) {

        keys[event.key] = false;
    }
);


/* =========================
   BUTTON HELPER
========================= */

function holdButton(
    button,
    key
) {

    button.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            keys[key] = true;
        }
    );

    button.addEventListener(
        "pointerup",
        function () {

            keys[key] = false;
        }
    );

    button.addEventListener(
        "pointerleave",
        function () {

            keys[key] = false;
        }
    );

    button.addEventListener(
        "pointercancel",
        function () {

            keys[key] = false;
        }
    );
}


/* =========================
   MOBILE CONTROLS
========================= */

holdButton(
    leftButton,
    "ArrowLeft"
);

holdButton(
    rightButton,
    "ArrowRight"
);


shootButton.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();

        shoot();
    }
);


/* =========================
   BUTTONS
========================= */

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);


/* =========================
   CANVAS TOUCH
========================= */

canvas.addEventListener(
    "pointermove",
    function (event) {

        if (!running) {
            return;
        }

        const rect =
            canvas.getBoundingClientRect();

        const scaleX =
            WIDTH / rect.width;

        const x =
            (event.clientX - rect.left) *
            scaleX;

        player.x =
            x - player.width / 2;

        if (player.x < 0) {
            player.x = 0;
        }

        if (
            player.x + player.width >
            WIDTH
        ) {

            player.x =
                WIDTH - player.width;
        }
    }
);


/* =========================
   MOBILE TAP TO SHOOT
========================= */

canvas.addEventListener(
    "pointerdown",
    function () {

        if (running) {
            shoot();
        }
    }
);


/* =========================
   YEAR
========================= */

const yearEl =
    document.getElementById("year");

if (yearEl) {

    yearEl.textContent =
        new Date().getFullYear();
}


/* =========================
   INITIALIZE
========================= */

resetGame();

draw();
