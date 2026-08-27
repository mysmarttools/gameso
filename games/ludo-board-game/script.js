const rollBtn = document.getElementById("rollBtn");
const restartBtn = document.getElementById("restartBtn");

const diceValue = document.getElementById("diceValue");
const turnText = document.getElementById("turnText");
const statusText = document.getElementById("status");

const year = document.getElementById("year");

year.textContent = new Date().getFullYear();


/* =========================
   PLAYERS
========================= */

const players = [
    {
        name: "Red",
        emoji: "🔴"
    },
    {
        name: "Green",
        emoji: "🟢"
    },
    {
        name: "Yellow",
        emoji: "🟡"
    },
    {
        name: "Blue",
        emoji: "🔵"
    }
];


let currentPlayer = 0;
let rolling = false;


/* =========================
   DICE
========================= */

const diceFaces = [
    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"
];


function rollDice() {

    if (rolling) {
        return;
    }

    rolling = true;

    rollBtn.disabled = true;

    statusText.textContent =
        "🎲 Rolling dice...";


    let rolls = 0;

    const animation = setInterval(() => {

        const random =
            Math.floor(Math.random() * 6);

        diceValue.textContent =
            diceFaces[random];

        rolls++;

        if (rolls >= 8) {

            clearInterval(animation);

            const result =
                Math.floor(Math.random() * 6) + 1;

            diceValue.textContent =
                diceFaces[result - 1];

            finishTurn(result);
        }

    }, 80);
}


/* =========================
   TURN
========================= */

function finishTurn(number) {

    const player =
        players[currentPlayer];


    if (number === 6) {

        statusText.textContent =
            `${player.emoji} ${player.name} rolled a 6! Roll again.`;

        rolling = false;

        rollBtn.disabled = false;

        return;
    }


    statusText.textContent =
        `${player.emoji} ${player.name} rolled ${number}.`;

    setTimeout(() => {

        nextPlayer();

    }, 700);
}


/* =========================
   NEXT PLAYER
========================= */

function nextPlayer() {

    currentPlayer++;

    if (
        currentPlayer >= players.length
    ) {

        currentPlayer = 0;
    }


    updateTurn();

    rolling = false;

    rollBtn.disabled = false;
}


/* =========================
   UPDATE TURN
========================= */

function updateTurn() {

    const player =
        players[currentPlayer];


    turnText.textContent =
        `${player.emoji} ${player.name}`;


    statusText.textContent =
        `${player.emoji} ${player.name} Player's Turn`;
}


/* =========================
   NEW GAME
========================= */

function newGame() {

    currentPlayer = 0;

    rolling = false;

    rollBtn.disabled = false;

    diceValue.textContent = "🎲";

    updateTurn();
}


/* =========================
   BUTTONS
========================= */

rollBtn.addEventListener(
    "click",
    rollDice
);


restartBtn.addEventListener(
    "click",
    newGame
);


/* =========================
   START
========================= */

newGame();
