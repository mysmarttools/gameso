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
        emoji: "🔴",
        color: "#ef4444"
    },
    {
        name: "Green",
        emoji: "🟢",
        color: "#22c55e"
    },
    {
        name: "Yellow",
        emoji: "🟡",
        color: "#facc15"
    },
    {
        name: "Blue",
        emoji: "🔵",
        color: "#3b82f6"
    }
];


let currentPlayer = 0;
let dice = 0;
let waitingForToken = false;


/* =========================
   TOKEN DATA
========================= */

const tokens = [];

for (let player = 0; player < 4; player++) {

    for (let token = 0; token < 4; token++) {

        tokens.push({
            player: player,
            id: token,
            position: -1,
            finished: false
        });

    }
}


/* =========================
   BOARD TRACK
========================= */

const track = [

    [50, 5],
    [57, 5],
    [64, 5],
    [71, 5],
    [78, 5],

    [85, 12],
    [85, 19],
    [85, 26],
    [85, 33],

    [78, 40],
    [71, 40],
    [64, 40],
    [57, 40],
    [50, 40],

    [43, 40],
    [36, 40],
    [29, 40],
    [22, 40],

    [15, 33],
    [15, 26],
    [15, 19],
    [15, 12],

    [22, 5],
    [29, 5],
    [36, 5],
    [43, 5]
];


/* =========================
   CREATE PLAY AREA
========================= */

function createGameTrack() {

    const board =
        document.getElementById("board");

    const oldTrack =
        board.querySelector(".game-track");

    if (oldTrack) {
        oldTrack.remove();
    }

    const trackContainer =
        document.createElement("div");

    trackContainer.className =
        "game-track";


    track.forEach((position, index) => {

        const cell =
            document.createElement("div");

        cell.className =
            "track-cell";

        cell.dataset.index =
            index;

        cell.style.left =
            position[0] + "%";

        cell.style.top =
            position[1] + "%";

        trackContainer.appendChild(cell);

    });


    board.appendChild(trackContainer);
}


/* =========================
   CREATE TOKENS
========================= */

function createTokens() {

    const board =
        document.getElementById("board");


    document
        .querySelectorAll(".game-token")
        .forEach(token => token.remove());


    tokens.forEach(token => {

        const element =
            document.createElement("button");

        element.className =
            "game-token";

        element.textContent =
            token.id + 1;

        element.dataset.player =
            token.player;

        element.dataset.token =
            token.id;


        element.style.background =
            players[token.player].color;


        element.addEventListener(
            "click",
            () => {

                moveToken(
                    token.player,
                    token.id
                );

            }
        );


        board.appendChild(element);

        token.element =
            element;

    });


    renderTokens();
}


/* =========================
   RENDER TOKENS
========================= */

function renderTokens() {

    tokens.forEach(token => {

        const element =
            token.element;


        if (!element) {
            return;
        }


        /* HOME */

        if (token.position === -1) {

            const homePositions = [

                [
                    [15, 15],
                    [25, 15],
                    [15, 25],
                    [25, 25]
                ],

                [
                    [75, 15],
                    [85, 15],
                    [75, 25],
                    [85, 25]
                ],

                [
                    [15, 75],
                    [25, 75],
                    [15, 85],
                    [25, 85]
                ],

                [
                    [75, 75],
                    [85, 75],
                    [75, 85],
                    [85, 85]
                ]

            ];


            const pos =
                homePositions[token.player][token.id];


            element.style.left =
                pos[0] + "%";

            element.style.top =
                pos[1] + "%";

        }

        else {

            const boardIndex =
                (token.player * 7 +
                 token.position) %
                track.length;


            const pos =
                track[boardIndex];


            element.style.left =
                pos[0] + "%";

            element.style.top =
                pos[1] + "%";

        }

    });
}


/* =========================
   ROLL DICE
========================= */

function rollDice() {

    if (waitingForToken) {
        return;
    }


    rollBtn.disabled = true;


    statusText.textContent =
        "🎲 Rolling...";


    let count = 0;


    const animation =
        setInterval(() => {

            const random =
                Math.floor(
                    Math.random() * 6
                );

            diceValue.textContent =
                random + 1;

            count++;


            if (count >= 8) {

                clearInterval(animation);


                dice =
                    Math.floor(
                        Math.random() * 6
                    ) + 1;


                diceValue.textContent =
                    dice;


                handleDice();

            }

        }, 100);
}


/* =========================
   HANDLE DICE
========================= */

function handleDice() {

    const player =
        players[currentPlayer];


    const playerTokens =
        tokens.filter(
            token =>
                token.player ===
                currentPlayer
        );


    const movable =
        playerTokens.filter(token => {

            if (token.finished) {
                return false;
            }

            if (
                token.position === -1 &&
                dice !== 6
            ) {
                return false;
            }

            return true;

        });


    if (movable.length === 0) {

        statusText.textContent =
            `${player.emoji} ${player.name} cannot move.`;

        setTimeout(
            nextPlayer,
            900
        );

        return;
    }


    waitingForToken = true;


    movable.forEach(token => {

        token.element.classList.add(
            "movable"
        );

    });


    statusText.textContent =
        `${player.emoji} ${player.name}: Select a token`;
}


/* =========================
   MOVE TOKEN
========================= */

function moveToken(player, tokenId) {

    if (!waitingForToken) {
        return;
    }


    if (player !== currentPlayer) {
        return;
    }


    const token =
        tokens.find(
            t =>
                t.player === player &&
                t.id === tokenId
        );


    if (!token) {
        return;
    }


    if (
        token.position === -1 &&
        dice !== 6
    ) {
        return;
    }


    if (token.position === -1) {

        token.position = 0;

    } else {

        token.position += dice;

    }


    if (token.position >= 25) {

        token.position = 25;

        token.finished = true;

    }


    waitingForToken = false;


    document
        .querySelectorAll(".game-token")
        .forEach(el =>
            el.classList.remove("movable")
        );


    renderTokens();


    if (checkWinner()) {

        statusText.textContent =
            `${players[currentPlayer].emoji} ${players[currentPlayer].name} WINS! 🏆`;

        rollBtn.disabled = true;

        return;
    }


    if (dice === 6) {

        statusText.textContent =
            `${players[currentPlayer].emoji} ${players[currentPlayer].name} gets another turn!`;

        rollBtn.disabled = false;

        return;
    }


    nextPlayer();
}


/* =========================
   WINNER
========================= */

function checkWinner() {

    const playerTokens =
        tokens.filter(
            token =>
                token.player ===
                currentPlayer
        );


    return playerTokens.every(
        token =>
            token.finished
    );
}


/* =========================
   NEXT PLAYER
========================= */

function nextPlayer() {

    currentPlayer++;


    if (
        currentPlayer >=
        players.length
    ) {

        currentPlayer = 0;

    }


    waitingForToken = false;

    rollBtn.disabled = false;


    document
        .querySelectorAll(".game-token")
        .forEach(el =>
            el.classList.remove("movable")
        );


    updateTurn();

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

    dice = 0;

    waitingForToken = false;


    tokens.forEach(token => {

        token.position = -1;

        token.finished = false;

    });


    diceValue.textContent =
        "🎲";


    rollBtn.disabled =
        false;


    createGameTrack();

    createTokens();

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
