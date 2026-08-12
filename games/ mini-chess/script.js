const boardElement = document.getElementById("chessBoard");

const playerScoreElement =
    document.getElementById("playerScore");

const computerScoreElement =
    document.getElementById("computerScore");

const turnElement =
    document.getElementById("turn");

const messageElement =
    document.getElementById("message");

const gameOverlay =
    document.getElementById("gameOverlay");

const resultIcon =
    document.getElementById("resultIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultText =
    document.getElementById("resultText");

const restartButton =
    document.getElementById("restartButton");

const newGameButton =
    document.getElementById("newGameButton");

const yearElement =
    document.getElementById("year");


yearElement.textContent =
    new Date().getFullYear();


/* =========================
PIECES
========================= */

const PIECES = {

    wK: "♔",
    wQ: "♕",
    wR: "♖",
    wB: "♗",
    wN: "♘",
    wP: "♙",

    bK: "♚",
    bQ: "♛",
    bR: "♜",
    bB: "♝",
    bN: "♞",
    bP: "♟"

};


/* =========================
GAME VARIABLES
========================= */

let board = [];

let selectedSquare = null;

let validMoves = [];

let playerScore = 0;

let computerScore = 0;

let gameRunning = true;

let computerThinking = false;


/* =========================
CREATE BOARD
========================= */

function createStartingBoard() {

    return [

        ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],

        ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],

        ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]

    ];
}


/* =========================
START / RESET
========================= */

function startNewGame() {

    board =
        createStartingBoard();

    selectedSquare = null;

    validMoves = [];

    playerScore = 0;

    computerScore = 0;

    gameRunning = true;

    computerThinking = false;

    playerScoreElement.textContent =
        playerScore;

    computerScoreElement.textContent =
        computerScore;

    turnElement.textContent =
        "YOU";

    messageElement.textContent =
        "Your turn — select a piece.";

    gameOverlay.classList.add("hidden");

    renderBoard();
}


/* =========================
RENDER BOARD
========================= */

function renderBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square =
                document.createElement("button");

            square.className =
                "chess-square " +
                (
                    (row + col) % 2 === 0
                        ? "light"
                        : "dark"
                );

            square.dataset.row = row;
            square.dataset.col = col;

            const piece =
                board[row][col];

            if (piece) {

                const pieceElement =
                    document.createElement("span");

                pieceElement.className =
                    "piece";

                pieceElement.textContent =
                    PIECES[piece];

                square.appendChild(
                    pieceElement
                );
            }


            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {

                square.classList.add(
                    "selected"
                );
            }


            const isValid =
                validMoves.some(
                    move =>
                        move.row === row &&
                        move.col === col
                );

            if (isValid) {

                if (board[row][col]) {

                    square.classList.add(
                        "capture-move"
                    );

                } else {

                    square.classList.add(
                        "valid-move"
                    );
                }
            }


            square.addEventListener(
                "click",
                handleSquareClick
            );

            boardElement.appendChild(
                square
            );
        }
    }
}


/* =========================
SQUARE CLICK
========================= */

function handleSquareClick(event) {

    if (
        !gameRunning ||
        computerThinking
    ) {
        return;
    }

    const row =
        Number(
            event.currentTarget.dataset.row
        );

    const col =
        Number(
            event.currentTarget.dataset.col
        );


    /* MOVE SELECTED PIECE */

    if (selectedSquare) {

        const moveIsValid =
            validMoves.some(
                move =>
                    move.row === row &&
                    move.col === col
            );

        if (moveIsValid) {

            makePlayerMove(
                selectedSquare.row,
                selectedSquare.col,
                row,
                col
            );

            return;
        }
    }


    /* SELECT PLAYER PIECE */

    const piece =
        board[row][col];

    if (
        piece &&
        piece.startsWith("w")
    ) {

        selectedSquare = {
            row,
            col
        };

        validMoves =
            getMovesForPiece(
                row,
                col,
                board
            );

        messageElement.textContent =
            "Choose a highlighted square.";

        renderBoard();

        return;
    }


    selectedSquare = null;

    validMoves = [];

    messageElement.textContent =
        "Select one of your pieces.";

    renderBoard();
}


/* =========================
PLAYER MOVE
========================= */

function makePlayerMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const captured =
        board[toRow][toCol];

    board[toRow][toCol] =
        board[fromRow][fromCol];

    board[fromRow][fromCol] =
        null;

    selectedSquare = null;

    validMoves = [];


    if (captured) {

        playerScore +=
            getPieceValue(captured);

        playerScoreElement.textContent =
            playerScore;

        if (captured === "bK") {

            finishGame(
                true,
                "🏆",
                "You Win!",
                "You captured the computer's king!"
            );

            return;
        }
    }


    turnElement.textContent =
        "CPU";

    messageElement.textContent =
        "Computer is thinking...";

    renderBoard();

    computerThinking = true;

    setTimeout(
        computerMove,
        500
    );
}


/* =========================
COMPUTER MOVE
========================= */

function computerMove() {

    if (!gameRunning) {
        return;
    }

    const possibleMoves = [];


    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece =
                board[row][col];

            if (
                piece &&
                piece.startsWith("b")
            ) {

                const moves =
                    getMovesForPiece(
                        row,
                        col,
                        board
                    );

                moves.forEach(
                    move => {

                        possibleMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col
                        });

                    }
                );
            }
        }
    }


    if (possibleMoves.length === 0) {

        finishGame(
            true,
            "🏆",
            "You Win!",
            "The computer has no moves left."
        );

        return;
    }


    /* Prefer captures */

    const captures =
        possibleMoves.filter(
            move =>
                board[
                    move.toRow
                ][
                    move.toCol
                ]
        );


    const pool =
        captures.length > 0
            ? captures
            : possibleMoves;


    const chosen =
        pool[
            Math.floor(
                Math.random() * pool.length
            )
        ];


    const captured =
        board[
            chosen.toRow
        ][
            chosen.toCol
        ];


    board[
        chosen.toRow
    ][
        chosen.toCol
    ] =
        board[
            chosen.fromRow
        ][
            chosen.fromCol
        ];


    board[
        chosen.fromRow
    ][
        chosen.fromCol
    ] =
        null;


    if (captured) {

        computerScore +=
            getPieceValue(captured);

        computerScoreElement.textContent =
            computerScore;


        if (captured === "wK") {

            finishGame(
                false,
                "💥",
                "Game Over",
                "The computer captured your king."
            );

            return;
        }
    }


    computerThinking = false;

    turnElement.textContent =
        "YOU";

    messageElement.textContent =
        "Your turn — select a piece.";

    renderBoard();
}


/* =========================
PIECE VALUE
========================= */

function getPieceValue(piece) {

    const type =
        piece[1];

    const values = {
        P: 1,
        N: 3,
        B: 3,
        R: 5,
        Q: 9,
        K: 100
    };

    return values[type] || 0;
}


/* =========================
GET MOVES
========================= */

function getMovesForPiece(
    row,
    col,
    currentBoard
) {

    const piece =
        currentBoard[row][col];

    if (!piece) {
        return [];
    }

    const type =
        piece[1];

    const color =
        piece[0];

    const moves = [];


    /* PAWN */

    if (type === "P") {

        const direction =
            color === "w"
                ? -1
                : 1;

        const startRow =
            color === "w"
                ? 6
                : 1;


        const oneRow =
            row + direction;

        if (
            isInside(
                oneRow,
                col
            ) &&
            !currentBoard[
                oneRow
            ][
                col
            ]
        ) {

            moves.push({
                row: oneRow,
                col
            });


            const twoRow =
                row +
                direction * 2;

            if (
                row === startRow &&
                !currentBoard[
                    twoRow
                ][
                    col
                ]
            ) {

                moves.push({
                    row: twoRow,
                    col
                });
            }
        }


        for (
            const offset of [-1, 1]
        ) {

            const captureCol =
                col + offset;

            if (
                isInside(
                    oneRow,
                    captureCol
                )
            ) {

                const target =
                    currentBoard[
                        oneRow
                    ][
                        captureCol
                    ];

                if (
                    target &&
                    target[0] !== color
                ) {

                    moves.push({
                        row: oneRow,
                        col: captureCol
                    });
                }
            }
        }
    }


    /* KNIGHT */

    if (type === "N") {

        const jumps = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]
        ];

        jumps.forEach(
            ([dr, dc]) => {

                addIfValid(
                    row + dr,
                    col + dc,
                    color,
                    currentBoard,
                    moves
                );

            }
        );
    }


    /* KING */

    if (type === "K") {

        for (let dr = -1; dr <= 1; dr++) {

            for (let dc = -1; dc <= 1; dc++) {

                if (
                    dr === 0 &&
                    dc === 0
                ) {
                    continue;
                }

                addIfValid(
                    row + dr,
                    col + dc,
                    color,
                    currentBoard,
                    moves
                );
            }
        }
    }


    /* ROOK */

    if (type === "R") {

        addSlidingMoves(
            row,
            col,
            color,
            currentBoard,
            moves,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ]
        );
    }


    /* BISHOP */

    if (type === "B") {

        addSlidingMoves(
            row,
            col,
            color,
            currentBoard,
            moves,
            [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        );
    }


    /* QUEEN */

    if (type === "Q") {

        addSlidingMoves(
            row,
            col,
            color,
            currentBoard,
            moves,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        );
    }


    return moves;
}


/* =========================
ADD VALID MOVE
========================= */

function addIfValid(
    row,
    col,
    color,
    currentBoard,
    moves
) {

    if (
        !isInside(
            row,
            col
        )
    ) {
        return;
    }

    const target =
        currentBoard[row][col];

    if (
        !target ||
        target[0] !== color
    ) {

        moves.push({
            row,
            col
        });
    }
}


/* =========================
SLIDING PIECES
========================= */

function addSlidingMoves(
    row,
    col,
    color,
    currentBoard,
    moves,
    directions
) {

    directions.forEach(
        ([dr, dc]) => {

            let r =
                row + dr;

            let c =
                col + dc;


            while (
                isInside(r, c)
            ) {

                const target =
                    currentBoard[r][c];


                if (!target) {

                    moves.push({
                        row: r,
                        col: c
                    });

                } else {

                    if (
                        target[0] !== color
                    ) {

                        moves.push({
                            row: r,
                            col: c
                        });
                    }

                    break;
                }


                r += dr;
                c += dc;
            }
        }
    );
}


/* =========================
BOARD CHECK
========================= */

function isInside(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );
}


/* =========================
END GAME
========================= */

function finishGame(
    won,
    icon,
    title,
    text
) {

    gameRunning = false;

    computerThinking = false;

    selectedSquare = null;

    validMoves = [];

    resultIcon.textContent =
        icon;

    resultTitle.textContent =
        title;

    resultText.textContent =
        text;

    gameOverlay.classList.remove(
        "hidden"
    );

    messageElement.textContent =
        won
            ? "You won the game!"
            : "The computer won.";
}


/* =========================
BUTTONS
========================= */

restartButton.addEventListener(
    "click",
    startNewGame
);

newGameButton.addEventListener(
    "click",
    startNewGame
);


/* =========================
START
========================= */

startNewGame();
