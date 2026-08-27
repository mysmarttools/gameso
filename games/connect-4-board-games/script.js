const ROWS = 6;
const COLS = 7;

const boardElement = document.getElementById("board");

const statusElement =
    document.getElementById("status");

const turnText =
    document.getElementById("turnText");

const redScoreElement =
    document.getElementById("redScore");

const yellowScoreElement =
    document.getElementById("yellowScore");

const restartButton =
    document.getElementById("restartBtn");

const yearElement =
    document.getElementById("year");


/* =========================
   GAME VARIABLES
========================= */

let board = [];

let currentPlayer = 1;

let gameOver = false;

let redScore = 0;

let yellowScore = 0;


/* =========================
   CREATE EMPTY BOARD
========================= */

function createEmptyBoard() {

    board = [];

    for (let row = 0; row < ROWS; row++) {

        const rowArray = [];

        for (let col = 0; col < COLS; col++) {

            rowArray.push(0);

        }

        board.push(rowArray);
    }
}


/* =========================
   DRAW BOARD
========================= */

function drawBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            const cell =
                document.createElement("div");

            cell.className = "cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            if (board[row][col] === 1) {

                cell.classList.add("red");

            }

            if (board[row][col] === 2) {

                cell.classList.add("yellow");

            }

            cell.addEventListener(
                "click",
                function () {

                    handleColumnClick(col);

                }
            );

            boardElement.appendChild(cell);
        }
    }
}


/* =========================
   HANDLE COLUMN
========================= */

function handleColumnClick(col) {

    if (gameOver) {
        return;
    }

    const row = findAvailableRow(col);

    if (row === -1) {

        statusElement.textContent =
            "⚠️ This column is full!";

        return;
    }

    board[row][col] = currentPlayer;

    drawBoard();


    /* CHECK WIN */

    const winningCells =
        getWinningCells(
            row,
            col,
            currentPlayer
        );


    if (winningCells.length >= 4) {

        gameOver = true;

        highlightWinningCells(
            winningCells
        );

        if (currentPlayer === 1) {

            redScore++;

            redScoreElement.textContent =
                redScore;

            statusElement.textContent =
                "🏆 🔴 Player 1 Wins!";

        } else {

            yellowScore++;

            yellowScoreElement.textContent =
                yellowScore;

            statusElement.textContent =
                "🏆 🟡 Player 2 Wins!";
        }

        return;
    }


    /* CHECK DRAW */

    if (isBoardFull()) {

        gameOver = true;

        statusElement.textContent =
            "🤝 It's a Draw!";

        turnText.textContent =
            "🤝";

        return;
    }


    /* CHANGE PLAYER */

    currentPlayer =
        currentPlayer === 1
            ? 2
            : 1;


    updateTurn();
}


/* =========================
   FIND AVAILABLE ROW
========================= */

function findAvailableRow(col) {

    for (
        let row = ROWS - 1;
        row >= 0;
        row--
    ) {

        if (board[row][col] === 0) {

            return row;

        }
    }

    return -1;
}


/* =========================
   CHECK WIN
========================= */

function getWinningCells(
    row,
    col,
    player
) {

    const directions = [

        [0, 1],

        [1, 0],

        [1, 1],

        [1, -1]

    ];


    for (const direction of directions) {

        const dr = direction[0];
        const dc = direction[1];

        let cells = [
            [row, col]
        ];


        /* FORWARD */

        let r = row + dr;
        let c = col + dc;

        while (
            r >= 0 &&
            r < ROWS &&
            c >= 0 &&
            c < COLS &&
            board[r][c] === player
        ) {

            cells.push([r, c]);

            r += dr;
            c += dc;
        }


        /* BACKWARD */

        r = row - dr;
        c = col - dc;

        while (
            r >= 0 &&
            r < ROWS &&
            c >= 0 &&
            c < COLS &&
            board[r][c] === player
        ) {

            cells.push([r, c]);

            r -= dr;
            c -= dc;
        }


        if (cells.length >= 4) {

            return cells;
        }
    }


    return [];
}


/* =========================
   HIGHLIGHT WIN
========================= */

function highlightWinningCells(cells) {

    const allCells =
        document.querySelectorAll(".cell");


    cells.forEach(function(position) {

        const row = position[0];
        const col = position[1];

        const index =
            row * COLS + col;

        if (allCells[index]) {

            allCells[index]
                .classList.add("winner");
        }
    });
}


/* =========================
   BOARD FULL
========================= */

function isBoardFull() {

    for (let col = 0; col < COLS; col++) {

        if (board[0][col] === 0) {

            return false;
        }
    }

    return true;
}


/* =========================
   UPDATE TURN
========================= */

function updateTurn() {

    if (currentPlayer === 1) {

        turnText.textContent = "🔴";

        statusElement.textContent =
            "🔴 Player 1's Turn";

    } else {

        turnText.textContent = "🟡";

        statusElement.textContent =
            "🟡 Player 2's Turn";
    }
}


/* =========================
   NEW GAME
========================= */

function newGame() {

    createEmptyBoard();

    currentPlayer = 1;

    gameOver = false;

    turnText.textContent = "🔴";

    statusElement.textContent =
        "🔴 Player 1's Turn";

    drawBoard();
}


/* =========================
   RESTART BUTTON
========================= */

restartButton.addEventListener(
    "click",
    function () {

        newGame();

    }
);


/* =========================
   YEAR
========================= */

yearElement.textContent =
    new Date().getFullYear();


/* =========================
   START
========================= */

newGame();
