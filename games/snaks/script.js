document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const scoreElement = document.getElementById("score");
    const highScoreElement = document.getElementById("highScore");

    const gameMessage = document.getElementById("gameMessage");
    const startButton = document.getElementById("startButton");

    const canvasSize = 500;
    const gridSize = 20;
    const tileCount = canvasSize / gridSize;

    let snake = [];
    let food = {};

    let direction = {
        x: 1,
        y: 0
    };

    let nextDirection = {
        x: 1,
        y: 0
    };

    let score = 0;
    let highScore = Number(
        localStorage.getItem("gamesoSnakeHighScore") || 0
    );

    let gameRunning = false;
    let gameOver = false;

    let gameLoop = null;

    let speed = 115;


    /* =====================================================
       HIGH SCORE
    ===================================================== */

    highScoreElement.textContent = highScore;


    /* =====================================================
       INITIAL SNAKE
    ===================================================== */

    function resetGame() {

        snake = [
            {
                x: 12,
                y: 12
            },
            {
                x: 11,
                y: 12
            },
            {
                x: 10,
                y: 12
            }
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

        speed = 115;

        scoreElement.textContent = score;

        createFood();

        drawGame();
    }


    /* =====================================================
       CREATE FOOD
    ===================================================== */

    function createFood() {

        let newFood;

        do {

            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };

        } while (
            snake.some(
                segment =>
                    segment.x === newFood.x &&
                    segment.y === newFood.y
            )
        );

        food = newFood;
    }


    /* =====================================================
       START GAME
    ===================================================== */

    function startGame() {

        clearInterval(gameLoop);

        resetGame();

        gameRunning = true;
        gameOver = false;

        gameMessage.style.display = "none";

        gameLoop = setInterval(
            updateGame,
            speed
        );
    }


    /* =====================================================
       UPDATE GAME
    ===================================================== */

    function updateGame() {

        if (!gameRunning) return;

        direction = nextDirection;

        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };


        /* ---------------------------------------------
           WALL COLLISION
        --------------------------------------------- */

        if (
            head.x < 0 ||
            head.x >= tileCount ||
            head.y < 0 ||
            head.y >= tileCount
        ) {

            endGame();

            return;
        }


        /* ---------------------------------------------
           SELF COLLISION
        --------------------------------------------- */

        const hitSelf = snake.some(
            segment =>
                segment.x === head.x &&
                segment.y === head.y
        );

        if (hitSelf) {

            endGame();

            return;
        }


        /* ---------------------------------------------
           ADD NEW HEAD
        --------------------------------------------- */

        snake.unshift(head);


        /* ---------------------------------------------
           FOOD
        --------------------------------------------- */

        if (
            head.x === food.x &&
            head.y === food.y
        ) {

            score++;

            scoreElement.textContent = score;


            /* High score */

            if (score > highScore) {

                highScore = score;

                highScoreElement.textContent =
                    highScore;

                localStorage.setItem(
                    "gamesoSnakeHighScore",
                    highScore
                );
            }


            /* Increase difficulty */

            if (
                score % 5 === 0 &&
                speed > 65
            ) {

                speed -= 5;

                clearInterval(gameLoop);

                gameLoop = setInterval(
                    updateGame,
                    speed
                );
            }

            createFood();

        } else {

            snake.pop();

        }


        drawGame();
    }


    /* =====================================================
       DRAW GAME
    ===================================================== */

    function drawGame() {

        /* Background */

        ctx.fillStyle = "#070b12";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /* Grid */

        drawGrid();


        /* Food */

        drawFood();


        /* Snake */

        snake.forEach(
            (segment, index) => {

                drawSnakeSegment(
                    segment,
                    index
                );

            }
        );
    }


    /* =====================================================
       GRID
    ===================================================== */

    function drawGrid() {

        ctx.strokeStyle =
            "rgba(255,255,255,0.035)";

        ctx.lineWidth = 1;

        for (
            let i = 0;
            i <= tileCount;
            i++
        ) {

            const position =
                i * gridSize;

            ctx.beginPath();

            ctx.moveTo(
                position,
                0
            );

            ctx.lineTo(
                position,
                canvasSize
            );

            ctx.stroke();


            ctx.beginPath();

            ctx.moveTo(
                0,
                position
            );

            ctx.lineTo(
                canvasSize,
                position
            );

            ctx.stroke();
        }
    }


    /* =====================================================
       DRAW SNAKE
    ===================================================== */

    function drawSnakeSegment(
        segment,
        index
    ) {

        const padding = 2;

        const x =
            segment.x * gridSize + padding;

        const y =
            segment.y * gridSize + padding;

        const size =
            gridSize - padding * 2;


        /* Head */

        if (index === 0) {

            ctx.fillStyle = "#8175ee";

            roundedRect(
                ctx,
                x,
                y,
                size,
                size,
                6
            );

            ctx.fill();


            /* Eyes */

            drawSnakeEyes(
                x,
                y
            );

        } else {

            ctx.fillStyle =
                index % 2 === 0
                    ? "#6659df"
                    : "#5b50d2";

            roundedRect(
                ctx,
                x,
                y,
                size,
                size,
                5
            );

            ctx.fill();
        }
    }


    /* =====================================================
       SNAKE EYES
    ===================================================== */

    function drawSnakeEyes(
        x,
        y
    ) {

        ctx.fillStyle = "#ffffff";

        const eyeSize = 3;

        let eye1;
        let eye2;


        if (direction.x === 1) {

            eye1 = {
                x: x + 13,
                y: y + 5
            };

            eye2 = {
                x: x + 13,
                y: y + 12
            };

        } else if (direction.x === -1) {

            eye1 = {
                x: x + 4,
                y: y + 5
            };

            eye2 = {
                x: x + 4,
                y: y + 12
            };

        } else if (direction.y === -1) {

            eye1 = {
                x: x + 5,
                y: y + 4
            };

            eye2 = {
                x: x + 12,
                y: y + 4
            };

        } else {

            eye1 = {
                x: x + 5,
                y: y + 13
            };

            eye2 = {
                x: x + 12,
                y: y + 13
            };
        }


        ctx.fillRect(
            eye1.x,
            eye1.y,
            eyeSize,
            eyeSize
        );

        ctx.fillRect(
            eye2.x,
            eye2.y,
            eyeSize,
            eyeSize
        );
    }


    /* =====================================================
       DRAW FOOD
    ===================================================== */

    function drawFood() {

        const centerX =
            food.x * gridSize +
            gridSize / 2;

        const centerY =
            food.y * gridSize +
            gridSize / 2;


        /* Glow */

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            10,
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
            6,
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


    /* =====================================================
       ROUNDED RECTANGLE
    ===================================================== */

    function roundedRect(
        context,
        x,
        y,
        width,
        height,
        radius
    ) {

        context.beginPath();

        context.moveTo(
            x + radius,
            y
        );

        context.lineTo(
            x + width - radius,
            y
        );

        context.quadraticCurveTo(
            x + width,
            y,
            x + width,
            y + radius
        );

        context.lineTo(
            x + width,
            y + height - radius
        );

        context.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height
        );

        context.lineTo(
            x + radius,
            y + height
        );

        context.quadraticCurveTo(
            x,
            y + height,
            x,
            y + height - radius
        );

        context.lineTo(
            x,
            y + radius
        );

        context.quadraticCurveTo(
            x,
            y,
            x + radius,
            y
        );

        context.closePath();
    }


    /* =====================================================
       CHANGE DIRECTION
    ===================================================== */

    function changeDirection(
        newDirection
    ) {

        if (!gameRunning) return;


        /* Prevent reversing */

        if (
            newDirection.x === -direction.x &&
            newDirection.y === -direction.y
        ) {

            return;
        }

        nextDirection = newDirection;
    }


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            const key =
                event.key.toLowerCase();


            if (
                [
                    "arrowup",
                    "arrowdown",
                    "arrowleft",
                    "arrowright",
                    " "
                ].includes(key)
            ) {

                event.preventDefault();

            }


            if (key === "arrowup") {

                changeDirection({
                    x: 0,
                    y: -1
                });

            }

            else if (
                key === "arrowdown"
            ) {

                changeDirection({
                    x: 0,
                    y: 1
                });

            }

            else if (
                key === "arrowleft"
            ) {

                changeDirection({
                    x: -1,
                    y: 0
                });

            }

            else if (
                key === "arrowright"
            ) {

                changeDirection({
                    x: 1,
                    y: 0
                });

            }

        }
    );


    /* =====================================================
       MOBILE CONTROLS
    ===================================================== */

    const controlButtons =
        document.querySelectorAll(
            ".control-btn"
        );


    controlButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const directionName =
                        button.dataset.direction;

                    if (
                        directionName === "up"
                    ) {

                        changeDirection({
                            x: 0,
                            y: -1
                        });

                    }

                    else if (
                        directionName === "down"
                    ) {

                        changeDirection({
                            x: 0,
                            y: 1
                        });

                    }

                    else if (
                        directionName === "left"
                    ) {

                        changeDirection({
                            x: -1,
                            y: 0
                        });

                    }

                    else if (
                        directionName === "right"
                    ) {

                        changeDirection({
                            x: 1,
                            y: 0
                        });

                    }

                }
            );


            /* Prevent mobile delay */

            button.addEventListener(
                "touchstart",
                event => {

                    event.preventDefault();

                },
                {
                    passive: false
                }
            );

        }
    );


    /* =====================================================
       GAME OVER
    ===================================================== */

    function endGame() {

        gameRunning = false;
        gameOver = true;

        clearInterval(gameLoop);

        gameMessage.style.display = "flex";

        gameMessage.innerHTML = `
            <div class="message-icon">
                💥
            </div>

            <h2>Game Over!</h2>

            <p>
                Your score: <strong>${score}</strong>
            </p>

            <button
                id="startButton"
                class="start-button"
            >
                🔄 Play Again
            </button>
        `;


        const newStartButton =
            document.getElementById(
                "startButton"
            );

        if (newStartButton) {

            newStartButton.addEventListener(
                "click",
                startGame
            );

        }
    }


    /* =====================================================
       START BUTTON
    ===================================================== */

    if (startButton) {

        startButton.addEventListener(
            "click",
            startGame
        );

    }


    /* =====================================================
       SPACEBAR TO START / RESTART
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.code === "Space" &&
                !gameRunning
            ) {

                event.preventDefault();

                startGame();

            }

        }
    );


    /* =====================================================
       INITIAL DRAW
    ===================================================== */

    resetGame();

});
