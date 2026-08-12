document.addEventListener("DOMContentLoaded", () => {

    const canvas =
        document.getElementById("pongCanvas");

    const ctx =
        canvas.getContext("2d");

    const playerScoreElement =
        document.getElementById("playerScore");

    const computerScoreElement =
        document.getElementById("computerScore");

    const startScreen =
        document.getElementById("startScreen");

    const gameOverScreen =
        document.getElementById("gameOverScreen");

    const startButton =
        document.getElementById("startButton");

    const restartButton =
        document.getElementById("restartButton");

    const resultTitle =
        document.getElementById("resultTitle");

    const resultText =
        document.getElementById("resultText");

    const resultIcon =
        document.getElementById("resultIcon");

    const year =
        document.getElementById("year");


    /* ==============================
       SETTINGS
    ============================== */

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const paddleWidth = 14;
    const paddleHeight = 100;

    const paddleMargin = 30;

    const ballSize = 13;

    const winningScore = 7;

    const playerSpeed = 7;

    const computerSpeed = 4.8;


    /* ==============================
       GAME STATE
    ============================== */

    let player;
    let computer;
    let ball;

    let playerScore = 0;
    let computerScore = 0;

    let gameRunning = false;

    let animationId = null;

    let keys = {};

    let touchActive = false;


    /* ==============================
       CREATE OBJECTS
    ============================== */

    function resetObjects() {

        player = {
            x: paddleMargin,
            y:
                HEIGHT / 2 -
                paddleHeight / 2,

            width: paddleWidth,
            height: paddleHeight
        };


        computer = {
            x:
                WIDTH -
                paddleMargin -
                paddleWidth,

            y:
                HEIGHT / 2 -
                paddleHeight / 2,

            width: paddleWidth,
            height: paddleHeight
        };


        ball = {
            x: WIDTH / 2,
            y: HEIGHT / 2,

            size: ballSize,

            velocityX:
                Math.random() > 0.5
                    ? 5
                    : -5,

            velocityY:
                (Math.random() - 0.5) * 5
        };
    }


    /* ==============================
       RESET GAME
    ============================== */

    function resetGame() {

        playerScore = 0;
        computerScore = 0;

        playerScoreElement.textContent =
            "0";

        computerScoreElement.textContent =
            "0";

        resetObjects();
    }


    /* ==============================
       START
    ============================== */

    function startGame() {

        resetGame();

        gameRunning = true;

        startScreen.classList.add(
            "hidden"
        );

        gameOverScreen.classList.add(
            "hidden"
        );

        if (animationId) {

            cancelAnimationFrame(
                animationId
            );
        }

        animationId =
            requestAnimationFrame(
                gameLoop
            );
    }


    /* ==============================
       GAME LOOP
    ============================== */

    function gameLoop() {

        if (!gameRunning) {
            return;
        }

        update();

        draw();

        animationId =
            requestAnimationFrame(
                gameLoop
            );
    }


    /* ==============================
       UPDATE
    ============================== */

    function update() {

        updatePlayer();

        updateComputer();

        updateBall();

        checkScore();
    }


    /* ==============================
       PLAYER
    ============================== */

    function updatePlayer() {

        if (
            keys["ArrowUp"] ||
            keys["w"] ||
            keys["W"]
        ) {

            player.y -= playerSpeed;
        }


        if (
            keys["ArrowDown"] ||
            keys["s"] ||
            keys["S"]
        ) {

            player.y += playerSpeed;
        }


        keepPaddleInside(
            player
        );
    }


    /* ==============================
       COMPUTER AI
    ============================== */

    function updateComputer() {

        const paddleCenter =
            computer.y +
            computer.height / 2;


        const target =
            ball.y;


        if (
            paddleCenter <
            target - 10
        ) {

            computer.y +=
                computerSpeed;

        } else if (
            paddleCenter >
            target + 10
        ) {

            computer.y -=
                computerSpeed;
        }


        keepPaddleInside(
            computer
        );
    }


    /* ==============================
       PADDLE BOUNDS
    ============================== */

    function keepPaddleInside(
        paddle
    ) {

        if (paddle.y < 0) {

            paddle.y = 0;
        }


        if (
            paddle.y +
            paddle.height >
            HEIGHT
        ) {

            paddle.y =
                HEIGHT -
                paddle.height;
        }
    }


    /* ==============================
       BALL
    ============================== */

    function updateBall() {

        ball.x += ball.velocityX;

        ball.y += ball.velocityY;


        /* Top / bottom */

        if (
            ball.y -
            ball.size / 2 <= 0
        ) {

            ball.y =
                ball.size / 2;

            ball.velocityY *= -1;
        }


        if (
            ball.y +
            ball.size / 2 >=
            HEIGHT
        ) {

            ball.y =
                HEIGHT -
                ball.size / 2;

            ball.velocityY *= -1;
        }


        /* Player collision */

        if (
            ball.velocityX < 0 &&
            collision(
                ball,
                player
            )
        ) {

            ball.x =
                player.x +
                player.width +
                ball.size / 2;

            bounceFromPaddle(
                player
            );
        }


        /* Computer collision */

        if (
            ball.velocityX > 0 &&
            collision(
                ball,
                computer
            )
        ) {

            ball.x =
                computer.x -
                ball.size / 2;

            bounceFromPaddle(
                computer
            );
        }
    }


    /* ==============================
       COLLISION
    ============================== */

    function collision(
        ball,
        paddle
    ) {

        return (
            ball.x -
            ball.size / 2 <
            paddle.x +
            paddle.width &&

            ball.x +
            ball.size / 2 >
            paddle.x &&

            ball.y -
            ball.size / 2 <
            paddle.y +
            paddle.height &&

            ball.y +
            ball.size / 2 >
            paddle.y
        );
    }


    /* ==============================
       BOUNCE
    ============================== */

    function bounceFromPaddle(
        paddle
    ) {

        const paddleCenter =
            paddle.y +
            paddle.height / 2;


        const hitPosition =
            ball.y -
            paddleCenter;


        const normalized =
            hitPosition /
            (paddle.height / 2);


        const maxAngle =
            Math.PI / 3;


        const angle =
            normalized *
            maxAngle;


        const speed =
            Math.min(
                Math.sqrt(
                    ball.velocityX *
                    ball.velocityX +
                    ball.velocityY *
                    ball.velocityY
                ) + 0.25,
                10
            );


        const direction =
            ball.velocityX > 0
                ? -1
                : 1;


        ball.velocityX =
            direction *
            speed *
            Math.cos(angle);


        ball.velocityY =
            speed *
            Math.sin(angle);
    }


    /* ==============================
       SCORE
    ============================== */

    function checkScore() {

        if (
            ball.x < -30
        ) {

            computerScore++;

            computerScoreElement.textContent =
                computerScore;

            if (
                computerScore >=
                winningScore
            ) {

                endGame(
                    false
                );

                return;
            }

            resetBall(
                false
            );
        }


        if (
            ball.x >
            WIDTH + 30
        ) {

            playerScore++;

            playerScoreElement.textContent =
                playerScore;

            if (
                playerScore >=
                winningScore
            ) {

                endGame(
                    true
                );

                return;
            }

            resetBall(
                true
            );
        }
    }


    /* ==============================
       RESET BALL
    ============================== */

    function resetBall(
        towardsPlayer
    ) {

        ball.x =
            WIDTH / 2;

        ball.y =
            HEIGHT / 2;


        ball.velocityX =
            towardsPlayer
                ? -5
                : 5;


        ball.velocityY =
            (Math.random() - 0.5) * 5;
    }


    /* ==============================
       GAME OVER
    ============================== */

    function endGame(
        playerWon
    ) {

        gameRunning = false;

        if (animationId) {

            cancelAnimationFrame(
                animationId
            );

            animationId = null;
        }


        if (playerWon) {

            resultIcon.textContent =
                "🏆";

            resultTitle.textContent =
                "You Win!";

            resultText.textContent =
                `Final Score: ${playerScore} - ${computerScore}`;

        } else {

            resultIcon.textContent =
                "🤖";

            resultTitle.textContent =
                "CPU Wins!";

            resultText.textContent =
                `Final Score: ${playerScore} - ${computerScore}`;
        }


        gameOverScreen.classList.remove(
            "hidden"
        );
    }


    /* ==============================
       DRAW
    ============================== */

    function draw() {

        drawBackground();

        drawCenterLine();

        drawPaddles();

        drawBall();
    }


    /* ==============================
       BACKGROUND
    ============================== */

    function drawBackground() {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                HEIGHT
            );


        gradient.addColorStop(
            0,
            "#0d1424"
        );

        gradient.addColorStop(
            1,
            "#070b14"
        );


        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );


        /* subtle glow */

        const glow =
            ctx.createRadialGradient(
                WIDTH / 2,
                HEIGHT / 2,
                10,
                WIDTH / 2,
                HEIGHT / 2,
                300
            );


        glow.addColorStop(
            0,
            "rgba(108,92,231,0.10)"
        );

        glow.addColorStop(
            1,
            "rgba(108,92,231,0)"
        );


        ctx.fillStyle =
            glow;

        ctx.fillRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );
    }


    /* ==============================
       CENTER LINE
    ============================== */

    function drawCenterLine() {

        ctx.save();

        ctx.strokeStyle =
            "rgba(255,255,255,0.12)";

        ctx.lineWidth = 3;

        ctx.setLineDash(
            [12, 14]
        );

        ctx.beginPath();

        ctx.moveTo(
            WIDTH / 2,
            0
        );

        ctx.lineTo(
            WIDTH / 2,
            HEIGHT
        );

        ctx.stroke();

        ctx.restore();
    }


    /* ==============================
       PADDLES
    ============================== */

    function drawPaddles() {

        drawPaddle(
            player,
            "#7c6cf2"
        );

        drawPaddle(
            computer,
            "#00c9e8"
        );
    }


    function drawPaddle(
        paddle,
        color
    ) {

        ctx.save();

        ctx.shadowBlur = 18;

        ctx.shadowColor =
            color;

        ctx.fillStyle =
            color;

        roundRect(
            paddle.x,
            paddle.y,
            paddle.width,
            paddle.height,
            7
        );

        ctx.fill();

        ctx.restore();
    }


    /* ==============================
       BALL
    ============================== */

    function drawBall() {

        ctx.save();

        ctx.shadowBlur = 22;

        ctx.shadowColor =
            "#ffffff";

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            ball.x,
            ball.y,
            ball.size / 2,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    /* ==============================
       ROUND RECT
    ============================== */

    function roundRect(
        x,
        y,
        width,
        height,
        radius
    ) {

        const r =
            Math.min(
                radius,
                width / 2,
                height / 2
            );

        ctx.beginPath();

        ctx.moveTo(
            x + r,
            y
        );

        ctx.arcTo(
            x + width,
            y,
            x + width,
            y + height,
            r
        );

        ctx.arcTo(
            x + width,
            y + height,
            x,
            y + height,
            r
        );

        ctx.arcTo(
            x,
            y + height,
            x,
            y,
            r
        );

        ctx.arcTo(
            x,
            y,
            x + width,
            y,
            r
        );

        ctx.closePath();
    }


    /* ==============================
       KEYBOARD
    ============================== */

    document.addEventListener(
        "keydown",
        event => {

            keys[event.key] = true;

            if (
                event.key ===
                "ArrowUp" ||
                event.key ===
                "ArrowDown" ||
                event.key === " "
            ) {

                event.preventDefault();
            }
        }
    );


    document.addEventListener(
        "keyup",
        event => {

            keys[event.key] = false;
        }
    );


    /* ==============================
       MOBILE TOUCH
    ============================== */

    function movePlayerToTouch(
        event
    ) {

        const rect =
            canvas.getBoundingClientRect();

        const touch =
            event.touches[0];

        if (!touch) {
            return;
        }


        const scaleY =
            HEIGHT /
            rect.height;


        const y =
            (
                touch.clientY -
                rect.top
            ) *
            scaleY;


        player.y =
            y -
            player.height / 2;


        keepPaddleInside(
            player
        );
    }


    canvas.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            touchActive = true;

            movePlayerToTouch(
                event
            );

        },
        {
            passive: false
        }
    );


    canvas.addEventListener(
        "touchmove",
        event => {

            if (!touchActive) {
                return;
            }

            event.preventDefault();

            movePlayerToTouch(
                event
            );

        },
        {
            passive: false
        }
    );


    canvas.addEventListener(
        "touchend",
        () => {

            touchActive = false;

        }
    );


    /* ==============================
       BUTTONS
    ============================== */

    startButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            startGame();
        }
    );


    restartButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            startGame();
        }
    );


    /* ==============================
       YEAR
    ============================== */

    year.textContent =
        new Date().getFullYear();


    /* ==============================
       INITIALIZE
    ============================== */

    resetGame();

    draw();

});
