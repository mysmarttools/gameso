const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const healthElement = document.getElementById("health");
const scoreElement = document.getElementById("score");
const enemyCountElement = document.getElementById("enemyCount");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScore = document.getElementById("finalScore");

const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const shootBtn = document.getElementById("shootBtn");


/* =========================
   CANVAS
========================= */

const WORLD_WIDTH = 1800;
const WORLD_HEIGHT = 900;

canvas.width = 1000;
canvas.height = 550;


/* =========================
   GAME VARIABLES
========================= */

let gameRunning = false;

let health = 100;
let score = 0;

let cameraX = 0;
let cameraY = 0;

let enemies = [];
let bullets = [];

let lastEnemySpawn = 0;

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;


/* =========================
   CONTROLS
========================= */

const keys = {
    up: false,
    down: false,
    left: false,
    right: false
};


/* =========================
   PLAYER
========================= */

const player = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,

    radius: 20,

    speed: 4.5,

    angle: 0
};


/* =========================
   KEYBOARD
========================= */

document.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    if (key === "w" || event.key === "arrowup") {
        keys.up = true;
    }

    if (key === "s" || event.key === "arrowdown") {
        keys.down = true;
    }

    if (key === "a" || event.key === "arrowleft") {
        keys.left = true;
    }

    if (key === "d" || event.key === "arrowright") {
        keys.right = true;
    }

});


document.addEventListener("keyup", function(event) {

    const key = event.key.toLowerCase();

    if (key === "w" || key === "arrowup") {
        keys.up = false;
    }

    if (key === "s" || key === "arrowdown") {
        keys.down = false;
    }

    if (key === "a" || key === "arrowleft") {
        keys.left = false;
    }

    if (key === "d" || key === "arrowright") {
        keys.right = false;
    }

});


/* =========================
   MOUSE AIM
========================= */

canvas.addEventListener("mousemove", function(event) {

    const rect = canvas.getBoundingClientRect();

    mouseX =
        (event.clientX - rect.left)
        * canvas.width / rect.width;

    mouseY =
        (event.clientY - rect.top)
        * canvas.height / rect.height;

});


/* =========================
   SHOOT
========================= */

canvas.addEventListener("mousedown", function() {

    shoot();

});


shootBtn.addEventListener("touchstart", function(event) {

    event.preventDefault();

    shoot();

});


shootBtn.addEventListener("click", shoot);


/* =========================
   MOBILE MOVEMENT
========================= */

function holdButton(button, direction) {

    button.addEventListener("touchstart", function(event) {

        event.preventDefault();

        keys[direction] = true;

    });


    button.addEventListener("touchend", function(event) {

        event.preventDefault();

        keys[direction] = false;

    });


    button.addEventListener("mousedown", function() {

        keys[direction] = true;

    });


    button.addEventListener("mouseup", function() {

        keys[direction] = false;

    });


    button.addEventListener("mouseleave", function() {

        keys[direction] = false;

    });

}


holdButton(upBtn, "up");
holdButton(downBtn, "down");
holdButton(leftBtn, "left");
holdButton(rightBtn, "right");


/* =========================
   START GAME
========================= */

function startGame() {

    health = 100;

    score = 0;

    enemies = [];

    bullets = [];

    player.x = WORLD_WIDTH / 2;
    player.y = WORLD_HEIGHT / 2;

    cameraX = 0;
    cameraY = 0;

    gameRunning = true;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    updateStats();

}


startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", startGame);


/* =========================
   UPDATE STATS
========================= */

function updateStats() {

    healthElement.textContent = Math.max(0, Math.floor(health));

    scoreElement.textContent = score;

    enemyCountElement.textContent = enemies.length;

}


/* =========================
   PLAYER UPDATE
========================= */

function updatePlayer() {

    let dx = 0;
    let dy = 0;


    if (keys.up) {
        dy -= 1;
    }

    if (keys.down) {
        dy += 1;
    }

    if (keys.left) {
        dx -= 1;
    }

    if (keys.right) {
        dx += 1;
    }


    if (dx !== 0 || dy !== 0) {

        const length = Math.sqrt(
            dx * dx + dy * dy
        );

        dx /= length;
        dy /= length;

        player.x += dx * player.speed;
        player.y += dy * player.speed;

    }


    player.x = Math.max(
        player.radius,
        Math.min(
            WORLD_WIDTH - player.radius,
            player.x
        )
    );


    player.y = Math.max(
        player.radius,
        Math.min(
            WORLD_HEIGHT - player.radius,
            player.y
        )
    );


    /* Camera */

    cameraX =
        player.x - canvas.width / 2;

    cameraY =
        player.y - canvas.height / 2;


    cameraX = Math.max(
        0,
        Math.min(
            WORLD_WIDTH - canvas.width,
            cameraX
        )
    );


    cameraY = Math.max(
        0,
        Math.min(
            WORLD_HEIGHT - canvas.height,
            cameraY
        )
    );


    /* Aim */

    const worldMouseX =
        mouseX + cameraX;

    const worldMouseY =
        mouseY + cameraY;


    player.angle =
        Math.atan2(
            worldMouseY - player.y,
            worldMouseX - player.x
        );

}


/* =========================
   SHOOT BULLET
========================= */

function shoot() {

    if (!gameRunning) return;


    const speed = 10;


    bullets.push({

        x:
            player.x +
            Math.cos(player.angle) * 25,

        y:
            player.y +
            Math.sin(player.angle) * 25,

        velocityX:
            Math.cos(player.angle) * speed,

        velocityY:
            Math.sin(player.angle) * speed,

        radius: 5,

        life: 100

    });

}


/* =========================
   UPDATE BULLETS
========================= */

function updateBullets() {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.x += bullet.velocityX;

        bullet.y += bullet.velocityY;

        bullet.life--;


        if (
            bullet.life <= 0 ||
            bullet.x < 0 ||
            bullet.x > WORLD_WIDTH ||
            bullet.y < 0 ||
            bullet.y > WORLD_HEIGHT
        ) {

            bullets.splice(i, 1);

            continue;

        }


        /* Enemy collision */

        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy = enemies[j];


            const distance =
                Math.hypot(
                    bullet.x - enemy.x,
                    bullet.y - enemy.y
                );


            if (
                distance <
                bullet.radius + enemy.radius
            ) {

                enemy.health--;

                bullets.splice(i, 1);


                if (enemy.health <= 0) {

                    enemies.splice(j, 1);

                    score += 10;

                }


                break;

            }

        }

    }

}


/* =========================
   SPAWN ENEMY
========================= */

function spawnEnemy() {

    const side =
        Math.floor(Math.random() * 4);

    let x;
    let y;


    if (side === 0) {

        x = Math.random() * WORLD_WIDTH;
        y = 20;

    }

    else if (side === 1) {

        x = WORLD_WIDTH - 20;
        y = Math.random() * WORLD_HEIGHT;

    }

    else if (side === 2) {

        x = Math.random() * WORLD_WIDTH;
        y = WORLD_HEIGHT - 20;

    }

    else {

        x = 20;
        y = Math.random() * WORLD_HEIGHT;

    }


    enemies.push({

        x: x,

        y: y,

        radius: 18,

        speed:
            0.7 +
            Math.random() * 0.6,

        health: 2

    });

}


/* =========================
   UPDATE ENEMIES
========================= */

function updateEnemies() {

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];


        const dx =
            player.x - enemy.x;

        const dy =
            player.y - enemy.y;


        const distance =
            Math.hypot(dx, dy);


        if (distance > 0) {

            enemy.x +=
                (dx / distance) *
                enemy.speed;

            enemy.y +=
                (dy / distance) *
                enemy.speed;

        }


        /* Enemy hits player */

        if (
            distance <
            player.radius + enemy.radius
        ) {

            health -= 0.35;

        }

    }


    if (health <= 0) {

        endGame();

    }

}


/* =========================
   SPAWN SYSTEM
========================= */

function spawnSystem() {

    const now = Date.now();


    if (
        now - lastEnemySpawn > 1200 &&
        enemies.length < 15
    ) {

        spawnEnemy();

        lastEnemySpawn = now;

    }

}


/* =========================
   DRAW BACKGROUND
========================= */

function drawBackground() {

    ctx.fillStyle = "#6da34d";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Grid */

    ctx.strokeStyle =
        "rgba(255,255,255,0.08)";

    ctx.lineWidth = 1;


    const gridSize = 50;


    for (
        let x = -cameraX % gridSize;
        x < canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, canvas.height);

        ctx.stroke();

    }


    for (
        let y = -cameraY % gridSize;
        y < canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(canvas.width, y);

        ctx.stroke();

    }


    /* Trees */

    for (let i = 0; i < 35; i++) {

        const treeX =
            (i * 317) % WORLD_WIDTH;

        const treeY =
            (i * 193) % WORLD_HEIGHT;


        const screenX =
            treeX - cameraX;

        const screenY =
            treeY - cameraY;


        if (
            screenX < -50 ||
            screenX > canvas.width + 50 ||
            screenY < -50 ||
            screenY > canvas.height + 50
        ) {
            continue;
        }


        ctx.fillStyle = "#654321";

        ctx.fillRect(
            screenX - 5,
            screenY,
            10,
            28
        );


        ctx.fillStyle = "#176b2c";

        ctx.beginPath();

        ctx.arc(
            screenX,
            screenY - 8,
            25,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


/* =========================
   DRAW BULLETS
========================= */

function drawBullets() {

    for (const bullet of bullets) {

        const x =
            bullet.x - cameraX;

        const y =
            bullet.y - cameraY;


        ctx.fillStyle = "#ffe600";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            bullet.radius,
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

    const x =
        player.x - cameraX;

    const y =
        player.y - cameraY;


    /* Shadow */

    ctx.fillStyle =
        "rgba(0,0,0,.25)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 22,
        24,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Body */

    ctx.fillStyle = "#2463eb";

    ctx.fillRect(
        x - 17,
        y - 3,
        34,
        35
    );


    /* Head */

    ctx.fillStyle = "#f2c49b";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 18,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Helmet */

    ctx.fillStyle = "#263238";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 22,
        16,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /* Gun */

    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(player.angle);

    ctx.fillStyle = "#202020";

    ctx.fillRect(
        10,
        -5,
        35,
        10
    );

    ctx.fillStyle = "#444";

    ctx.fillRect(
        25,
        5,
        10,
        12
    );

    ctx.restore();

}


/* =========================
   DRAW ENEMIES
========================= */

function drawEnemies() {

    for (const enemy of enemies) {

        const x =
            enemy.x - cameraX;

        const y =
            enemy.y - cameraY;


        /* Shadow */

        ctx.fillStyle =
            "rgba(0,0,0,.25)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 20,
            22,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* Body */

        ctx.fillStyle = "#e53935";

        ctx.fillRect(
            x - 15,
            y,
            30,
            32
        );


        /* Head */

        ctx.fillStyle = "#e5b887";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 15,
            13,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* Health bar */

        ctx.fillStyle = "#222";

        ctx.fillRect(
            x - 18,
            y - 38,
            36,
            5
        );


        ctx.fillStyle = "#4ade80";

        ctx.fillRect(
            x - 18,
            y - 38,
            18 * enemy.health,
            5
        );

    }

}


/* =========================
   DRAW AIM
========================= */

function drawAim() {

    if (!gameRunning) return;


    ctx.strokeStyle =
        "rgba(255,255,255,.8)";

    ctx.lineWidth = 2;


    ctx.beginPath();

    ctx.arc(
        mouseX,
        mouseY,
        12,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        mouseX - 18,
        mouseY
    );

    ctx.lineTo(
        mouseX + 18,
        mouseY
    );

    ctx.moveTo(
        mouseX,
        mouseY - 18
    );

    ctx.lineTo(
        mouseX,
        mouseY + 18
    );

    ctx.stroke();

}


/* =========================
   END GAME
========================= */

function endGame() {

    gameRunning = false;

    finalScore.textContent = score;

    gameOverScreen.classList.remove("hidden");

}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    drawBackground();

    if (gameRunning) {

        updatePlayer();

        updateBullets();

        updateEnemies();

        spawnSystem();

        updateStats();

    }


    drawBullets();

    drawEnemies();

    drawPlayer();

    drawAim();


    requestAnimationFrame(gameLoop);

}


/* =========================
   START
========================= */

gameLoop();
