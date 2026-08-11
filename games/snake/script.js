document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("highScore");
    const messageEl = document.getElementById("gameMessage");

    let startButton = document.getElementById("startButton");

    const GRID = 25;
    const SIZE = canvas.width;
    const CELL = SIZE / GRID;

    let snake = [];
    let food = {};

    let direction = { x: 1, y: 0 };
    let nextDirection = { x: 1, y: 0 };

    let score = 0;
    let highScore = Number(
        localStorage.getItem("gamesoSnakeHighScore") || 0
    );

    let gameTimer = null;
    let running = false;

    let speed = 140;


    /* =========================================
       HIGH SCORE
    ========================================= */

    highScoreEl.textContent = highScore;


    /* =========================================
       RESET GAME
    ========================================= */

    function resetGame() {

        snake = [
            { x: 12, y: 12 },
            { x: 11, y: 12 },
            { x: 10, y: 12 },
            { x: 9, y: 12 }
        ];

        direction = {
            x: 1,
            y: 0
        };

        nextDirection = {
            x: 1,
            y: 0
        };

        score = 0;
        speed = 140;

        scoreEl.textContent = "0";

        createFood();

        draw();
    }


    /* =========================================
       CREATE FOOD
    ========================================= */

    function createFood() {

        let valid = false;

        while (!valid) {

            food = {
                x: Math.floor(Math.random() * GRID),
                y: Math.floor(Math.random() * GRID)
            };

            valid = !snake.some(
                part =>
                    part.x === food.x &&
                    part.y === food.y
            );
        }
    }


    /* =========================================
       START GAME
    ========================================= */

    function startGame() {

        stopGame();

        resetGame();

        running = true;

        messageEl.style.display = "none";

        gameTimer = setInterval(
            gameLoop,
            speed
        );
    }


    /* =========================================
       STOP GAME
    ========================================= */

    function stopGame() {

        if (gameTimer) {
            clearInterval(gameTimer);
            gameTimer = null;
        }
    }


    /* =========================================
       GAME LOOP
    ========================================= */

    function gameLoop() {

        if (!running) return;

        direction = {
            ...nextDirection
        };

        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };


        /* =====================================
           WALL COLLISION
        ===================================== */

        if (
            head.x < 0 ||
            head.x >= GRID ||
            head.y < 0 ||
            head.y >= GRID
        ) {

            gameOver();

            return;
        }


        /* =====================================
           SELF COLLISION
        ===================================== */

        const eating =
            head.x === food.x &&
            head.y === food.y;

        /*
         * If we're not eating, the tail will move,
         * so don't count the current tail as a collision.
         */

        const bodyToCheck = eating
            ? snake
            : snake.slice(0, -1);

        const hitBody = bodyToCheck.some(
            part =>
                part.x === head.x &&
                part.y === head.y
        );

        if (hitBody) {

            gameOver();

            return;
        }


        /* =====================================
           MOVE SNAKE
        ===================================== */

        snake.unshift(head);


        /* =====================================
           FOOD
        ===================================== */

        if (eating) {

            score++;

            scoreEl.textContent = score;


            /* High Score */

            if (score > highScore) {

                highScore = score;

                highScoreEl.textContent =
                    highScore;

                localStorage.setItem(
                    "gamesoSnakeHighScore",
                    highScore
                );
            }


            createFood();


            /*
             * Increase speed slowly
             */

            if (
                score % 5 === 0 &&
                speed > 75
            ) {

                speed -= 8;

                stopGame();

                gameTimer = setInterval(
                    gameLoop,
                    speed
                );
            }

        } else {

            snake.pop();
        }


        draw();
    }


    /* =========================================
       DRAW EVERYTHING
    ========================================= */

    function draw() {

        drawBackground();

        drawGrid();

        drawFood();

        drawSnake();
    }


    /* =========================================
       BACKGROUND
    ========================================= */

    function drawBackground() {

        ctx.fillStyle = "#070b12";

        ctx.fillRect(
            0,
            0,
            SIZE,
            SIZE
        );
    }


    /* =========================================
       GRID
    ========================================= */

    function drawGrid() {

        ctx.strokeStyle =
            "rgba(255,255,255,0.035)";

        ctx.lineWidth = 1;

        for (
            let i = 0;
            i <= GRID;
            i++
        ) {

            const pos = i * CELL;

            ctx.beginPath();

            ctx.moveTo(
                pos,
                0
            );

            ctx.lineTo(
                pos,
                SIZE
            );

            ctx.stroke();


            ctx.beginPath();

            ctx.moveTo(
                0,
                pos
            );

            ctx.lineTo(
                SIZE,
                pos
            );

            ctx.stroke();
        }
    }


    /* =========================================
       DRAW SNAKE
    ========================================= */

    function drawSnake() {

        snake.forEach(
            (part, index) => {

                const padding = 2;

                const x =
                    part.x * CELL + padding;

                const y =
                    part.y * CELL + padding;

                const size =
                    CELL - padding * 2;


                if (index === 0) {

                    ctx.fillStyle = "#8175ee";

                } else {

                    ctx.fillStyle =
                        index % 2 === 0
                            ? "#6659df"
                            : "#5b50d2";
                }


                roundedRect(
                    x,
                    y,
                    size,
                    size,
                    5
                );

                ctx.fill();


                /* Eyes */

                if (index === 0) {

                    drawEyes(
                        x,
                        y,
                        size
                    );
                }
            }
        );
    }


    /* =========================================
       SNAKE EYES
    ========================================= */

    function drawEyes(
        x,
        y,
        size
    ) {

        ctx.fillStyle = "#ffffff";

        const eye = 3;

        let eyes = [];


        if (direction.x > 0) {

            eyes = [
                {
                    x: x + size - 7,
                    y: y + 5
                },
                {
                    x: x + size - 7,
                    y: y + size - 8
                }
            ];

        } else if (direction.x < 0) {

            eyes = [
                {
                    x: x + 4,
                    y: y + 5
                },
                {
                    x: x + 4,
                    y: y + size - 8
                }
            ];

        } else if (direction.y < 0) {

            eyes = [
                {
                    x: x + 5,
                    y: y + 4
                },
                {
                    x: x + size - 8,
                    y: y + 4
                }
            ];

        } else {

            eyes = [
                {
                    x: x + 5,
                    y: y + size - 7
                },
                {
                    x: x + size - 8,
                    y: y + size - 7
                }
            ];
        }


        eyes.forEach(
            eyePos => {

                ctx.fillRect(
                    eyePos.x,
                    eyePos.y,
                    eye,
                    eye
                );
            }
        );
    }


    /* =========================================
       DRAW FOOD
    ========================================= */

    function drawFood() {

        const centerX =
            food.x * CELL +
            CELL / 2;

        const centerY =
            food.y * CELL +
            CELL / 2;


        /* Glow */

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            CELL * 0.38,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(0,212,255,0.12)";

        ctx.fill();


        /* Food */

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            CELL * 0.25,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#00d4ff";

        ctx.fill();


        /* Highlight */

        ctx.beginPath();

        ctx.arc(
            centerX - 2,
            centerY - 2,
            2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";

        ctx.fill();
    }


    /* =========================================
       ROUNDED RECT
    ========================================= */

    function roundedRect(
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


    /* =========================================
       CHANGE DIRECTION
    ========================================= */

    function changeDirection(
        x,
        y
    ) {

        /*
         * Don't allow the snake to
         * instantly reverse.
         */

        if (
            x === -direction.x &&
            y === -direction.y
        ) {
            return;
        }

        nextDirection = {
            x,
            y
        };
    }


    /* =========================================
       KEYBOARD
    ========================================= */

    document.addEventListener(
        "keydown",
        event => {

            const key = event.key;


            if (
                key === "ArrowUp" ||
                key === "ArrowDown" ||
                key === "ArrowLeft" ||
                key === "ArrowRight" ||
                key === " "
            ) {

                event.preventDefault();
            }


            if (key === "ArrowUp") {

                changeDirection(
                    0,
                    -1
                );

            } else if (
                key === "ArrowDown"
            ) {

                changeDirection(
                    0,
                    1
                );

            } else if (
                key === "ArrowLeft"
            ) {

                changeDirection(
                    -1,
                    0
                );

            } else if (
                key === "ArrowRight"
            ) {

                changeDirection(
                    1,
                    0
                );
            }


            /* Space = Start */

            if (
                event.code === "Space" &&
                !running
            ) {

                startGame();
            }
        }
    );


    /* =========================================
       MOBILE CONTROLS
    ========================================= */

    const controls =
        document.querySelectorAll(
            ".control-btn"
        );


    controls.forEach(
        button => {

            const press = event => {

                event.preventDefault();

                const dir =
                    button.dataset.direction;


                if (dir === "up") {

                    changeDirection(
                        0,
                        -1
                    );

                } else if (
                    dir === "down"
                ) {

                    changeDirection(
                        0,
                        1
                    );

                } else if (
                    dir === "left"
                ) {

                    changeDirection(
                        -1,
                        0
                    );

                } else if (
                    dir === "right"
                ) {

                    changeDirection(
                        1,
                        0
                    );
                }
            };


            button.addEventListener(
                "click",
                press
            );


            button.addEventListener(
                "touchstart",
                press,
                {
                    passive: false
                }
            );
        }
    );


    /* =========================================
       GAME OVER
    ========================================= */

    function gameOver() {

        running = false;

        stopGame();


        messageEl.innerHTML = `

            <div class="message-icon">
                💥
            </div>

            <h2>
                Game Over!
            </h2>

            <p>
                Your score:
                <strong>${score}</strong>
            </p>

            <button
                id="startButton"
                class="start-button"
                type="button"
            >
                🔄 Play Again
            </button>
        `;


        messageEl.style.display = "flex";


        startButton =
            document.getElementById(
                "startButton"
            );


        startButton.addEventListener(
            "click",
            startGame
        );
    }


    /* =========================================
       START BUTTON
    ========================================= */

    if (startButton) {

        startButton.addEventListener(
            "click",
            startGame
        );
    }


    /* =========================================
       INITIAL SCREEN
    ========================================= */

    resetGame();

});
