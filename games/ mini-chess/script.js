const boardElement = document.getElementById("board");
const turnElement = document.getElementById("turn");
const messageElement = document.getElementById("message");
const restartButton = document.getElementById("restartBtn");
const yearElement = document.getElementById("year");

yearElement.textContent = new Date().getFullYear();


/* =========================
   CHESS PIECES
========================= */

const pieces = {

    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },

    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }

};


/* =========================
   GAME STATE
========================= */

let board = [];
let currentTurn = "white";
let selected = null;
let gameOver = false;


/* =========================
   INITIAL BOARD
========================= */

function createBoard() {

    return [

        [
            { type: "rook", color: "black" },
            { type: "knight", color: "black" },
            { type: "bishop", color: "black" },
            { type: "queen", color: "black" },
            { type: "king", color: "black" },
            { type: "bishop", color: "black" },
            { type: "knight", color: "black" },
            { type: "rook", color: "black" }
        ],

        [
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" },
            { type: "pawn", color: "black" }
        ],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [null, null, null, null, null, null, null, null],

        [
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" },
            { type: "pawn", color: "white" }
        ],

        [
            { type: "rook", color: "white" },
            { type: "knight", color: "white" },
            { type: "bishop", color: "white" },
            { type: "queen", color: "white" },
            { type: "king", color: "white" },
            { type: "bishop", color: "white" },
            { type: "knight", color: "white" },
            { type: "rook", color: "white" }
        ]

    ];

}


/* =========================
   RESET
========================= */

function resetGame() {

    board = createBoard();

    currentTurn = "white";

    selected = null;

    gameOver = false;

    turnElement.textContent = "White";

    messageElement.textContent =
        "White's turn — select a piece";

    renderBoard();

}


/* =========================
   RENDER BOARD
========================= */

function renderBoard() {

    boardElement.innerHTML = "";

    let validMoves = [];

    if (selected) {

        validMoves =
            getLegalMoves(
                selected.row,
                selected.col
            );

    }


    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square =
                document.createElement("div");

            square.className = "square";

            square.classList.add(
                (row + col) % 2 === 0
                    ? "light"
                    : "dark"
            );

            square.dataset.row = row;
            square.dataset.col = col;


            const piece = board[row][col];


            if (piece) {

                const pieceElement =
                    document.createElement("span");

                pieceElement.className = "piece";

                pieceElement.textContent =
                    pieces[piece.color][piece.type];

                square.appendChild(pieceElement);

            }


            if (
                selected &&
                selected.row === row &&
                selected.col === col
            ) {

                square.classList.add("selected");

            }


            const isValid =
                validMoves.some(
                    move =>
                        move.row === row &&
                        move.col === col
                );


            if (isValid) {

                square.classList.add("valid");

                if (piece) {
                    square.classList.add("capture");
                }

            }


            square.addEventListener(
                "click",
                () => handleSquareClick(row, col)
            );


            boardElement.appendChild(square);

        }

    }

}


/* =========================
   HANDLE CLICK
========================= */

function handleSquareClick(row, col) {

    if (gameOver) {
        return;
    }


    const clickedPiece =
        board[row][col];


    /* Select own piece */

    if (!selected) {

        if (
            clickedPiece &&
            clickedPiece.color === currentTurn
        ) {

            selected = {
                row,
                col
            };

            messageElement.textContent =
                "Choose a highlighted square";

            renderBoard();

        }

        return;
    }


    /* Select another own piece */

    if (
        clickedPiece &&
        clickedPiece.color === currentTurn
    ) {

        selected = {
            row,
            col
        };

        messageElement.textContent =
            "Choose a highlighted square";

        renderBoard();

        return;
    }


    /* Check move */

    const moves =
        getLegalMoves(
            selected.row,
            selected.col
        );


    const validMove =
        moves.some(
            move =>
                move.row === row &&
                move.col === col
        );


    if (!validMove) {

        selected = null;

        messageElement.textContent =
            `${capitalize(currentTurn)}'s turn — select a piece`;

        renderBoard();

        return;
    }


    makeMove(
        selected.row,
        selected.col,
        row,
        col
    );


    selected = null;


    if (!gameOver) {

        currentTurn =
            currentTurn === "white"
                ? "black"
                : "white";


        turnElement.textContent =
            capitalize(currentTurn);

        messageElement.textContent =
            `${capitalize(currentTurn)}'s turn — select a piece`;

    }


    renderBoard();

}


/* =========================
   MAKE MOVE
========================= */

function makeMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const movingPiece =
        board[fromRow][fromCol];

    const targetPiece =
        board[toRow][toCol];


    /* KING CAPTURE */

    if (
        targetPiece &&
        targetPiece.type === "king"
    ) {

        board[toRow][toCol] =
            movingPiece;

        board[fromRow][fromCol] =
            null;

        gameOver = true;

        const winner =
            movingPiece.color === "white"
                ? "White"
                : "Black";

        turnElement.textContent =
            "Game Over";

        messageElement.textContent =
            `🏆 ${winner} wins! King captured.`;

        return;
    }


    /* NORMAL MOVE */

    board[toRow][toCol] =
        movingPiece;

    board[fromRow][fromCol] =
        null;


    /* PAWN PROMOTION */

    if (
        movingPiece.type === "pawn" &&
        (
            toRow === 0 ||
            toRow === 7
        )
    ) {

        movingPiece.type = "queen";

    }

}


/* =========================
   LEGAL MOVES
========================= */

function getLegalMoves(row, col) {

    const piece =
        board[row][col];

    if (!piece) {
        return [];
    }


    switch (piece.type) {

        case "pawn":
            return pawnMoves(row, col, piece);

        case "rook":
            return rookMoves(row, col, piece);

        case "bishop":
            return bishopMoves(row, col, piece);

        case "queen":

            return [
                ...rookMoves(row, col, piece),
                ...bishopMoves(row, col, piece)
            ];

        case "knight":
            return knightMoves(row, col, piece);

        case "king":
            return kingMoves(row, col, piece);

        default:
            return [];

    }

}


/* =========================
   PAWN
========================= */

function pawnMoves(row, col, piece) {

    const moves = [];

    const direction =
        piece.color === "white"
            ? -1
            : 1;


    const nextRow =
        row + direction;


    /* Forward */

    if (
        isInside(nextRow, col) &&
        !board[nextRow][col]
    ) {

        moves.push({
            row: nextRow,
            col: col
        });


        const startingRow =
            piece.color === "white"
                ? 6
                : 1;


        const doubleRow =
            row + direction * 2;


        if (
            row === startingRow &&
            isInside(doubleRow, col) &&
            !board[doubleRow][col]
        ) {

            moves.push({
                row: doubleRow,
                col: col
            });

        }

    }


    /* Diagonal capture */

    for (const dc of [-1, 1]) {

        const targetRow =
            row + direction;

        const targetCol =
            col + dc;


        if (
            !isInside(
                targetRow,
                targetCol
            )
        ) {
            continue;
        }


        const target =
            board[targetRow][targetCol];


        if (
            target &&
            target.color !== piece.color
        ) {

            moves.push({
                row: targetRow,
                col: targetCol
            });

        }

    }


    return moves;

}


/* =========================
   ROOK
========================= */

function rookMoves(row, col, piece) {

    return slidingMoves(
        row,
        col,
        piece,
        [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ]
    );

}


/* =========================
   BISHOP
========================= */

function bishopMoves(row, col, piece) {

    return slidingMoves(
        row,
        col,
        piece,
        [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ]
    );

}


/* =========================
   QUEEN
========================= */

function queenMoves(row, col, piece) {

    return [
        ...rookMoves(row, col, piece),
        ...bishopMoves(row, col, piece)
    ];

}


/* =========================
   SLIDING
========================= */

function slidingMoves(
    row,
    col,
    piece,
    directions
) {

    const moves = [];


    for (const [dr, dc] of directions) {

        let r = row + dr;
        let c = col + dc;


        while (isInside(r, c)) {

            const target =
                board[r][c];


            if (!target) {

                moves.push({
                    row: r,
                    col: c
                });

            } else {

                if (
                    target.color !==
                    piece.color
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


    return moves;

}


/* =========================
   KNIGHT
========================= */

function knightMoves(row, col, piece) {

    const moves = [];


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


    for (const [dr, dc] of jumps) {

        const r = row + dr;
        const c = col + dc;


        if (!isInside(r, c)) {
            continue;
        }


        const target =
            board[r][c];


        if (
            !target ||
            target.color !== piece.color
        ) {

            moves.push({
                row: r,
                col: c
            });

        }

    }


    return moves;

}


/* =========================
   KING
========================= */

function kingMoves(row, col, piece) {

    const moves = [];


    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            if (
                dr === 0 &&
                dc === 0
            ) {
                continue;
            }


            const r = row + dr;
            const c = col + dc;


            if (!isInside(r, c)) {
                continue;
            }


            const target =
                board[r][c];


            if (
                !target ||
                target.color !== piece.color
            ) {

                moves.push({
                    row: r,
                    col: c
                });

            }

        }

    }


    return moves;

}


/* =========================
   BOARD LIMIT
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
   CAPITALIZE
========================= */

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================
   RESTART BUTTON
========================= */

restartButton.addEventListener(
    "click",
    resetGame
);


/* =========================
   START
========================= */

resetGame();
