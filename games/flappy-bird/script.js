document.addEventListener("DOMContentLoaded", () => {

    /* ==============================
       ELEMENTS
    ============================== */

    const canvas =
        document.getElementById("gameCanvas");

    const ctx =
        canvas.getContext("2d");

    const scoreElement =
        document.getElementById("score");

    const bestScoreElement =
        document.getElementById("bestScore");

    const startScreen =
        document.getElementById("startScreen");

    const gameOverScreen =
        document.getElementById("gameOverScreen");

    const startButton =
        document.getElementById("startButton");

    const restartButton =
        document.getElementById("restartButton");

    const finalScore =
        document.getElementById("finalScore");

    const finalBest =
        document.getElementById("finalBest");

    const year =
        document.getElementById("year");


    /* ==============================
       CANVAS
    ============================== */

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;


    /* ==============================
       GAME SETTINGS
    ============================== */

    const gravity = 0.42;
    const jumpStrength = -7.2;

    const pipeWidth = 72;
    const pipeGap = 165;

    const pipeSpeed = 2.7;

    const groundHeight = 85;


    /* ==============================
       GAME STATE
    ============================== */

    let bird;
    let pipes;

    let score = 0;

    let bestScore =
        Number(
            localStorage.getItem(
                "gamesoFlappyBest"
            )
        ) || 0;

    let gameRunning = false;
    let gameOver = false;

    let animationId = null;

    let lastPipeTime = 0;

    let cloudOffset = 0;


    bestScoreElement.textContent =
        bestScore;


    /* ==============================
       BIRD
    ============================== */

    function createBird() {

        return {
            x: 105,
            y: HEIGHT / 2,

            width: 34,
            height: 26,

            velocity: 0,

            rotation: 0
        };
    }


    /* ==============================
       RESET GAME
    ============================== */

    function resetGame() {

        bird = createBird();

        pipes = [];

        score = 0;

        gameRunning = false;

        gameOver = false;

        lastPipeTime = 0;

        scoreElement.textContent =
            "0";

        draw();

    }


    /* ==============================
       START GAME
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

        bird.velocity =
            jumpStrength;

        lastPipeTime =
            performance.now();

        animationId =
            requestAnimationFrame(
                gameLoop
            );
    }


    /* ==============================
       GAME LOOP
    ============================== */

    function gameLoop(timestamp) {

        if (!gameRunning) {
            return;
        }


        update(timestamp);

        draw();


        animationId =
            requestAnimationFrame(
                gameLoop
            );
    }


    /* ==============================
       UPDATE
    ============================== */

    function update(timestamp) {

        /* Bird physics */

        bird.velocity += gravity;

        bird.y += bird.velocity;


        bird.rotation =
            Math.min(
                bird.velocity * 0.07,
                0.45
            );


        /* Clouds */

        cloudOffset += 0.25;


        /* Create pipes */

        if (
            timestamp - lastPipeTime >
            1450
        ) {

            createPipe();

            lastPipeTime =
                timestamp;
        }


        /* Move pipes */

        pipes.forEach((pipe) => {

            pipe.x -= pipeSpeed;

        });


        /* Remove old pipes */

        pipes =
            pipes.filter(
                pipe =>
                    pipe.x + pipeWidth > -20
            );


        /* Score */

        pipes.forEach((pipe) => {

            if (
                !pipe.scored &&
                pipe.x + pipeWidth <
                bird.x
            ) {

                pipe.scored = true;

                score++;

                scoreElement.textContent =
                    score;
            }

        });


        /* Collision */

        if (checkCollision()) {

            endGame();

            return;
        }
    }


    /* ==============================
       CREATE PIPE
    ============================== */

    function createPipe() {

        const minTop = 80;

        const maxTop =
            HEIGHT -
            groundHeight -
            pipeGap -
            80;


        const topHeight =
            Math.floor(
                minTop +
                Math.random() *
                (maxTop - minTop)
            );


        pipes.push({

            x: WIDTH + 20,

            topHeight: topHeight,

            bottomY:
                topHeight + pipeGap,

            scored: false
        });
    }


    /* ==============================
       COLLISION
    ============================== */

    function checkCollision() {

        const birdLeft =
            bird.x - bird.width / 2;

        const birdRight =
            bird.x + bird.width / 2;

        const birdTop =
            bird.y - bird.height / 2;

        const birdBottom =
            bird.y + bird.height / 2;


        /* Ground */

        if (
            birdBottom >=
            HEIGHT - groundHeight
        ) {

            return true;
        }


        /* Ceiling */

        if (
            birdTop <= 0
        ) {

            return true;
        }


        /* Pipes */

        for (
            const pipe of pipes
        ) {

            const pipeLeft =
                pipe.x;

            const pipeRight =
                pipe.x + pipeWidth;


            const touchingPipe =
                birdRight > pipeLeft &&
                birdLeft < pipeRight;


            if (!touchingPipe) {
                continue;
            }


            const hitsTopPipe =
                birdTop <
                pipe.topHeight;


            const hitsBottomPipe =
                birdBottom >
                pipe.bottomY;


            if (
                hitsTopPipe ||
                hitsBottomPipe
            ) {

                return true;
            }
        }


        return false;
    }


    /* ==============================
       END GAME
    ============================== */

    function endGame() {

        gameRunning = false;

        gameOver = true;


        if (
            animationId
        ) {

            cancelAnimationFrame(
                animationId
            );

            animationId = null;
        }


        if (
            score > bestScore
        ) {

            bestScore = score;

            localStorage.setItem(
                "gamesoFlappyBest",
                bestScore
            );
        }


        bestScoreElement.textContent =
            bestScore;

        finalScore.textContent =
            score;

        finalBest.textContent =
            bestScore;


        gameOverScreen.classList.remove(
            "hidden"
        );


        draw();
    }


    /* ==============================
       FLAP
    ============================== */

    function flap() {

        if (!gameRunning) {
            return;
        }


        bird.velocity =
            jumpStrength;
    }


    /* ==============================
       DRAW
    ============================== */

    function draw() {

        drawBackground();

        drawClouds();

        drawPipes();

        drawGround();

        drawBird();
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
            "#69d7f3"
        );

        gradient.addColorStop(
            0.65,
            "#a6e9f5"
        );

        gradient.addColorStop(
            1,
            "#d8f7fa"
        );


        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );
    }


    /* ==============================
       CLOUDS
    ============================== */

    function drawClouds() {

        ctx.save();

        ctx.fillStyle =
            "rgba(255,255,255,0.65)";


        const clouds = [
            {
                x: 80,
                y: 95,
                scale: 1
            },
            {
                x: 330,
                y: 165,
                scale: 0.75
            },
            {
                x: 210,
                y: 280,
                scale: 0.55
            }
        ];


        clouds.forEach(
            cloud => {

                let x =
                    cloud.x -
                    (cloudOffset % 560);


                if (x < -100) {
                    x += 560;
                }


                drawCloud(
                    x,
                    cloud.y,
                    cloud.scale
                );
            }
        );


        ctx.restore();
    }


    function drawCloud(
        x,
        y,
        scale
    ) {

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            24 * scale,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 25 * scale,
            y - 8 * scale,
            31 * scale,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 57 * scale,
            y,
            23 * scale,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* ==============================
       PIPES
    ============================== */

    function drawPipes() {

        pipes.forEach(
            pipe => {

                drawPipe(
                    pipe.x,
                    0,
                    pipeWidth,
                    pipe.topHeight,
                    true
                );


                drawPipe(
                    pipe.x,
                    pipe.bottomY,
                    pipeWidth,
                    HEIGHT -
                    groundHeight -
                    pipe.bottomY,
                    false
                );

            }
        );
    }


    function drawPipe(
        x,
        y,
        width,
        height,
        top
    ) {

        if (height <= 0) {
            return;
        }


        /* Main pipe */

        const gradient =
            ctx.createLinearGradient(
                x,
                0,
                x + width,
                0
            );


        gradient.addColorStop(
            0,
            "#38a83e"
        );

        gradient.addColorStop(
            0.45,
            "#68d55d"
        );

        gradient.addColorStop(
            1,
            "#21852d"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            x + 5,
            y,
            width - 10,
            height
        );


        /* Pipe edge */

        ctx.fillStyle =
            "#1d7628";


        ctx.fillRect(
            x + 5,
            y,
            6,
            height
        );


        /* Cap */

        const capHeight = 25;


        const capY =
            top
                ? y + height - capHeight
                : y;


        ctx.fillStyle =
            "#54c951";


        ctx.fillRect(
            x,
            capY,
            width,
            capHeight
        );


        ctx.strokeStyle =
            "#196d24";

        ctx.lineWidth = 2;


        ctx.strokeRect(
            x,
            capY,
            width,
            capHeight
        );
    }


    /* ==============================
       GROUND
    ============================== */

    function drawGround() {

        const groundY =
            HEIGHT -
            groundHeight;


        ctx.fillStyle =
            "#ded56a";


        ctx.fillRect(
            0,
            groundY,
            WIDTH,
            groundHeight
        );


        /* Grass */

        ctx.fillStyle =
            "#67c94c";


        ctx.fillRect(
            0,
            groundY,
            WIDTH,
            14
        );


        /* Ground pattern */

        ctx.fillStyle =
            "#c3b953";


        for (
            let x = -20;
            x < WIDTH + 40;
            x += 35
        ) {

            ctx.fillRect(
                x,
                groundY + 25,
                18,
                5
            );
        }
    }


    /* ==============================
       BIRD
    ============================== */

    function drawBird() {

        ctx.save();


        ctx.translate(
            bird.x,
            bird.y
        );


        ctx.rotate(
            bird.rotation
        );


        /* Body */

        ctx.fillStyle =
            "#ffd84d";


        ctx.beginPath();

        ctx.ellipse(
            0,
            0,
            18,
            14,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* Wing */

        ctx.fillStyle =
            "#f3b82f";


        ctx.beginPath();

        ctx.ellipse(
            -5,
            6,
            10,
            6,
            -0.25,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* Eye */

        ctx.fillStyle =
            "#ffffff";


        ctx.beginPath();

        ctx.arc(
            9,
            -7,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#111827";


        ctx.beginPath();

        ctx.arc(
            11,
            -7,
            2.5,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* Beak */

        ctx.fillStyle =
            "#ff7a38";


        ctx.beginPath();

        ctx.moveTo(
            16,
            -1
        );

        ctx.lineTo(
            30,
            4
        );

        ctx.lineTo(
            16,
            8
        );

        ctx.closePath();

        ctx.fill();


        ctx.restore();
    }


    /* ==============================
       INPUT
    ============================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.code ===
                "Space"
            ) {

                event.preventDefault();

                if (
                    !gameRunning &&
                    !gameOver
                ) {

                    startGame();

                    return;
                }


                if (gameOver) {

                    startGame();

                    return;
                }


                flap();
            }
        }
    );


    canvas.addEventListener(
        "click",
        () => {

            if (!gameRunning) {

                if (gameOver) {

                    startGame();

                } else {

                    startGame();
                }

                return;
            }


            flap();
        }
    );


    canvas.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();


            if (!gameRunning) {

                startGame();

                return;
            }


            flap();
        },
        {
            passive: false
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

});
