const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");

const targetColor = document.getElementById("targetColor");
const colorGrid = document.getElementById("colorGrid");
const message = document.getElementById("message");

const finalText = document.getElementById("finalText");
const yearEl = document.getElementById("year");

yearEl.textContent = new Date().getFullYear();


let score = 0;
let timeLeft = 30;
let bestScore = Number(localStorage.getItem("colorMatchBest")) || 0;

let timer = null;
let running = false;

let currentTarget = "";


/* =========================
COLORS
========================= */

const colors = [
    "#ff4757",
    "#ff6b81",
    "#ff9f43",
    "#feca57",
    "#1dd1a1",
    "#10ac84",
    "#00d2d3",
    "#54a0ff",
    "#2e86de",
    "#5f27cd",
    "#a55eea",
    "#ff6bcb"
];


/* =========================
UPDATE BEST
========================= */

bestEl.textContent = bestScore;


/* =========================
START GAME
========================= */

function startGame() {

    clearInterval(timer);

    score = 0;
    timeLeft = 30;
    running = true;

    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    message.textContent = "Choose the matching color";

    createRound();

    timer = setInterval(() => {

        timeLeft--;

        timeEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }

    }, 1000);
}


/* =========================
CREATE ROUND
========================= */

function createRound() {

    if (!running) {
        return;
    }

    colorGrid.innerHTML = "";

    const shuffledColors = [...colors]
        .sort(() => Math.random() - 0.5);

    const options = shuffledColors.slice(0, 6);

    currentTarget =
        options[
            Math.floor(
                Math.random() * options.length
            )
        ];

    targetColor.style.background = currentTarget;

    options
        .sort(() => Math.random() - 0.5)
        .forEach(color => {

            const button =
                document.createElement("button");

            button.className = "color-option";

            button.style.background = color;

            button.setAttribute(
                "aria-label",
                "Choose color"
            );

            button.addEventListener(
                "click",
                () => checkColor(color, button)
            );

            colorGrid.appendChild(button);
        });
}


/* =========================
CHECK COLOR
========================= */

function checkColor(color, button) {

    if (!running) {
        return;
    }

    if (color === currentTarget) {

        score++;

        scoreEl.textContent = score;

        message.textContent = "✅ Correct!";

        button.style.transform =
            "scale(1.08)";

        setTimeout(() => {

            if (running) {
                createRound();
            }

        }, 180);

    } else {

        score = Math.max(0, score - 1);

        scoreEl.textContent = score;

        message.textContent = "❌ Wrong color!";

        button.style.opacity = "0.3";

        setTimeout(() => {

            if (running) {
                createRound();
            }

        }, 300);
    }
}


/* =========================
END GAME
========================= */

function endGame() {

    running = false;

    clearInterval(timer);

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "colorMatchBest",
            bestScore
        );

        bestEl.textContent = bestScore;
    }

    finalText.textContent =
        "Your score: " +
        score +
        " • Best score: " +
        bestScore;

    gameScreen.classList.add("hidden");

    gameOverScreen.classList.remove("hidden");
}


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
KEYBOARD SUPPORT
========================= */

document.addEventListener("keydown", event => {

    if (
        event.key === "Enter" &&
        !running &&
        !startScreen.classList.contains("hidden")
    ) {

        startGame();
    }

});


/* =========================
INITIAL
========================= */

timeEl.textContent = "30";
scoreEl.textContent = "0";
bestEl.textContent = bestScore;
