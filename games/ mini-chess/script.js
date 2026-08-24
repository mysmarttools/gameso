const boardElement = document.getElementById("chessBoard");
const turnElement = document.getElementById("turn");
const messageElement = document.getElementById("gameMessage");
const restartButton = document.getElementById("restartBtn");

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

let board;
let currentTurn = "white";
let selectedSquare = null;
let gameOver = false;


/* =========================
   STARTING BOARD
========================= */

function createInitialBoard() {

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
   RESET GAME
========================= */

function resetGame() {

    board = createInitialBoard();

    currentTurn = "white";

    selectedSquare = null;

    gameOver = false;

    turnElement.textContent = "White";

    messageElement.textContent = "White's turn";

    renderBoard();
}


/* =========================
   RENDER BOARD
========================= */

function renderBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];

            if (piece) {

                square.textContent =
                    pieces[piece.color][piece.type];

            }

            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {

                square.classList.add("selected");

            }


            if (selectedSquare) {

                const moves = getLegalMoves(
                    selectedSquare.row,
                    selectedSquare.col
                );

                const isValid = moves.some(
                    move =>
                        move.row === row &&
                        move.col === col
                );

                if (isValid) {

                    square.classList.add("valid");

                    if (board[row][col]) {
                        square.classList.add("capture");
                    }

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
   SQUARE CLICK
========================= */

function handleSquareClick(row, col) {

    if (gameOver) return;


    const clickedPiece = board[row][col];


    // Select own piece

    if (!selectedSquare) {

        if (
            clickedPiece &&
            clickedPiece.color === currentTurn
        ) {

            selectedSquare = {
                row,
                col
            };

            renderBoard();

        }

        return;
    }


    // Click another own piece

    if (
        clickedPiece &&
        clickedPiece.color === currentTurn
    ) {

        selectedSquare = {
            row,
            col
        };

        renderBoard();

        return;
    }


    // Try move

    const legalMoves = getLegalMoves(
        selectedSquare.row,
        selectedSquare.col
    );

    const validMove = legalMoves.some(
        move =>
            move.row === row &&
            move.col === col
    );


    if (validMove) {

        makeMove(
            selectedSquare.row,
            selectedSquare.col,
            row,
            col
        );

        selectedSquare = null;

        switchTurn();

    }

    else {

        selectedSquare = null;

        renderBoard();

    }
}


/* =========================
   MAKE MOVE
========================= */

function makeMove(fromRow, fromCol, toRow, toCol) {

    const movingPiece =
        board[fromRow][fromCol];

    const capturedPiece =
        board[toRow][toCol];


    // Capture king = win

    if (
        capturedPiece &&
        capturedPiece.type === "king"
    ) {

        board[toRow][toCol] = movingPiece;

        board[fromRow][fromCol] = null;

        gameOver = true;

        const winner =
            movingPiece.color === "white"
                ? "White"
                : "Black";

        messageElement.textContent =
            `🏆 ${winner} wins!`;

        turnElement.textContent =
            "Game Over";

        renderBoard();

        return;

    }


    board[toRow][toCol] = movingPiece;

    board[fromRow][fromCol] = null;


    // Pawn promotion

    if (
        movingPiece.type === "pawn" &&
        (toRow === 0 || toRow === 7)
    ) {

        movingPiece.type = "queen";

    }
}


/* =========================
   SWITCH TURN
========================= */

function switchTurn() {

    if (gameOver) return;

    currentTurn =
        currentTurn === "white"
            ? "black"
            : "white";

    turnElement.textContent =
        currentTurn === "white"
            ? "White"
            : "Black";

    messageElement.textContent =
        `${currentTurn === "white" ? "White" : "Black"}'s turn`;

    renderBoard();
}


/* =========================
   GET LEGAL MOVES
========================= */

function getLegalMoves(row, col) {

    const piece = board[row][col];

    if (!piece) return [];

    let moves = [];


    switch (piece.type) {

        case "pawn":

            moves = pawnMoves(row, col, piece);

            break;

        case "rook":

            moves = rookMoves(row, col, piece);

            break;

        case "bishop":

            moves = bishopMoves(row, col, piece);

            break;

        case "queen":

            moves = [
                ...rookMoves(row, col, piece),
                ...bishopMoves(row, col, piece)
            ];

            break;

        case "knight":

            moves = knightMoves(row, col, piece);

            break;

        case "king":

            moves = kingMoves(row, col, piece);

            break;

    }


    return moves.filter(move => {

        const target = board[move.row][move.col];

        return !target ||
               target.color !== piece.color;

    });
}


/* =========================
   PAWN MOVES
========================= */

function pawnMoves(row, col, piece) {

    const moves = [];

    const direction =
        piece.color === "white"
            ? -1
            : 1;


    const nextRow = row + direction;


    if (
        isInside(nextRow, col) &&
        !board[nextRow][col]
    ) {

        moves.push({
            row: nextRow,
            col
        });


        const startingRow =
            piece.color === "white"
                ? 6
                : 1;


        if (
            row === startingRow &&
            !board[row + direction * 2][col]
        ) {

            moves.push({
                row: row + direction * 2,
                col
            });

        }

    }


    // Diagonal captures

    for (const dc of [-1, 1]) {

        const targetRow = row + direction;
        const targetCol = col + dc;

        if (!isInside(targetRow, targetCol)) {
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
   ROOK MOVES
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
   BISHOP MOVES
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
   SLIDING PIECES
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

            const target = board[r][c];


            if (!target) {

                moves.push({
                    row: r,
                    col: c
                });

            }

            else {

                if (
                    target.color !== piece.color
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
   KNIGHT MOVES
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


        if (isInside(r, c)) {

            const target = board[r][c];


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
   KING MOVES
========================= */

function kingMoves(row, col, piece) {

    const moves = [];


    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            if (dr === 0 && dc === 0) {
                continue;
            }


            const r = row + dr;
            const c = col + dc;


            if (!isInside(r, c)) {
                continue;
            }


            const target = board[r][c];


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
   BOARD LIMITS
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
   RESTART
========================= */

restartButton.addEventListener(
    "click",
    resetGame
);


/* =========================
   START
========================= */

resetGame();
