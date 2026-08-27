const boardElement = document.getElementById("chessBoard");
const turnElement = document.getElementById("turn");
const messageElement = document.getElementById("message");
const restartButton = document.getElementById("restartBtn");
const yearElement = document.getElementById("year");

yearElement.textContent = new Date().getFullYear();


/* PIECES */

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


/* GAME VARIABLES */

let board = [];
let currentTurn = "white";
let selected = null;
let gameOver = false;


/* CREATE BOARD */

function createBoard() {

    return [

        [
            {type:"rook", color:"black"},
            {type:"knight", color:"black"},
            {type:"bishop", color:"black"},
            {type:"queen", color:"black"},
            {type:"king", color:"black"},
            {type:"bishop", color:"black"},
            {type:"knight", color:"black"},
            {type:"rook", color:"black"}
        ],

        [
            {type:"pawn", color:"black"},
            {type:"pawn", color:"black"},
            {type:"pawn", color:"black"},
            {type:"pawn", color:"black"},
            {type:"pawn", color:"black"},
            {type:"pawn", color:"black"},
            {type:"pawn", color:"black"},
            {type:"pawn", color:"black"}
        ],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        [
            {type:"pawn", color:"white"},
            {type:"pawn", color:"white"},
            {type:"pawn", color:"white"},
            {type:"pawn", color:"white"},
            {type:"pawn", color:"white"},
            {type:"pawn", color:"white"},
            {type:"pawn", color:"white"},
            {type:"pawn", color:"white"}
        ],

        [
            {type:"rook", color:"white"},
            {type:"knight", color:"white"},
            {type:"bishop", color:"white"},
            {type:"queen", color:"white"},
            {type:"king", color:"white"},
            {type:"bishop", color:"white"},
            {type:"knight", color:"white"},
            {type:"rook", color:"white"}
        ]

    ];

}


/* RESET */

function resetGame() {

    board = createBoard();

    currentTurn = "white";
    selected = null;
    gameOver = false;

    turnElement.textContent = "White";
    messageElement.textContent = "White's turn";

    renderBoard();
}


/* RENDER */

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

            const piece = board[row][col];

            if (piece) {

                square.textContent =
                    pieces[piece.color][piece.type];

                square.classList.add(
                    piece.color === "white"
                        ? "white-piece"
                        : "black-piece"
                );
            }


            /* SELECTED */

            if (
                selected &&
                selected.row === row &&
                selected.col === col
            ) {

                square.classList.add("selected");

            }


            /* VALID MOVES */

            if (selected) {

                const moves = getMoves(
                    selected.row,
                    selected.col
                );

                const valid = moves.some(
                    move =>
                        move.row === row &&
                        move.col === col
                );

                if (valid) {

                    square.classList.add("valid");

                    if (piece) {
                        square.classList.add("capture");
                    }

                }

            }


            square.addEventListener(
                "click",
                () => squareClick(row, col)
            );

            boardElement.appendChild(square);
        }
    }
}


/* CLICK */

function squareClick(row, col) {

    if (gameOver) return;

    const piece = board[row][col];


    /* NOTHING SELECTED */

    if (!selected) {

        if (
            piece &&
            piece.color === currentTurn
        ) {

            selected = {
                row: row,
                col: col
            };

            renderBoard();
        }

        return;
    }


    /* CLICK OWN PIECE */

    if (
        piece &&
        piece.color === currentTurn
    ) {

        selected = {
            row: row,
            col: col
        };

        renderBoard();

        return;
    }


    /* CHECK MOVE */

    const moves = getMoves(
        selected.row,
        selected.col
    );

    const valid = moves.some(
        move =>
            move.row === row &&
            move.col === col
    );


    if (!valid) {

        selected = null;

        renderBoard();

        return;
    }


    /* MAKE MOVE */

    const fromRow = selected.row;
    const fromCol = selected.col;

    const movingPiece = board[fromRow][fromCol];
    const targetPiece = board[row][col];


    /* KING CAPTURE */

    if (
        targetPiece &&
        targetPiece.type === "king"
    ) {

        board[row][col] = movingPiece;
        board[fromRow][fromCol] = null;

        gameOver = true;

        const winner =
            movingPiece.color === "white"
                ? "White"
                : "Black";

        turnElement.textContent = "Game Over";

        messageElement.textContent =
            "🏆 " + winner + " wins!";

        selected = null;

        renderBoard();

        return;
    }


    /* MOVE */

    board[row][col] = movingPiece;
    board[fromRow][fromCol] = null;


    /* PAWN PROMOTION */

    if (
        movingPiece.type === "pawn" &&
        (row === 0 || row === 7)
    ) {

        movingPiece.type = "queen";

    }


    selected = null;

    switchTurn();
}


/* TURN */

function switchTurn() {

    currentTurn =
        currentTurn === "white"
            ? "black"
            : "white";

    turnElement.textContent =
        currentTurn === "white"
            ? "White"
            : "Black";

    messageElement.textContent =
        currentTurn === "white"
            ? "White's turn"
            : "Black's turn";

    renderBoard();
}


/* GET MOVES */

function getMoves(row, col) {

    const piece = board[row][col];

    if (!piece) {
        return [];
    }


    let moves = [];


    if (piece.type === "pawn") {

        moves = pawnMoves(row, col, piece);

    }

    else if (piece.type === "rook") {

        moves = slidingMoves(
            row,
            col,
            piece,
            [
                [-1,0],
                [1,0],
                [0,-1],
                [0,1]
            ]
        );

    }

    else if (piece.type === "bishop") {

        moves = slidingMoves(
            row,
            col,
            piece,
            [
                [-1,-1],
                [-1,1],
                [1,-1],
                [1,1]
            ]
        );

    }

    else if (piece.type === "queen") {

        moves = slidingMoves(
            row,
            col,
            piece,
            [
                [-1,0],
                [1,0],
                [0,-1],
                [0,1],
                [-1,-1],
                [-1,1],
                [1,-1],
                [1,1]
            ]
        );

    }

    else if (piece.type === "knight") {

        moves = knightMoves(row, col, piece);

    }

    else if (piece.type === "king") {

        moves = kingMoves(row, col, piece);

    }


    return moves;
}


/* PAWN */

function pawnMoves(row, col, piece) {

    const moves = [];

    const direction =
        piece.color === "white"
            ? -1
            : 1;


    const nextRow = row + direction;


    /* MOVE FORWARD */

    if (
        inside(nextRow, col) &&
        !board[nextRow][col]
    ) {

        moves.push({
            row: nextRow,
            col: col
        });


        const startRow =
            piece.color === "white"
                ? 6
                : 1;


        const doubleRow =
            row + direction * 2;


        if (
            row === startRow &&
            inside(doubleRow, col) &&
            !board[doubleRow][col]
        ) {

            moves.push({
                row: doubleRow,
                col: col
            });

        }

    }


    /* CAPTURE */

    for (const dc of [-1, 1]) {

        const r = row + direction;
        const c = col + dc;

        if (!inside(r, c)) {
            continue;
        }

        const target = board[r][c];

        if (
            target &&
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


/* SLIDING */

function slidingMoves(
    row,
    col,
    piece,
    directions
) {

    const moves = [];


    for (const direction of directions) {

        let r = row + direction[0];
        let c = col + direction[1];


        while (inside(r, c)) {

            const target = board[r][c];


            if (!target) {

                moves.push({
                    row: r,
                    col: c
                });

            }

            else {

                if (target.color !== piece.color) {

                    moves.push({
                        row: r,
                        col: c
                    });

                }

                break;
            }


            r += direction[0];
            c += direction[1];
        }
    }


    return moves;
}


/* KNIGHT */

function knightMoves(row, col, piece) {

    const moves = [];

    const jumps = [
        [-2,-1],
        [-2,1],
        [-1,-2],
        [-1,2],
        [1,-2],
        [1,2],
        [2,-1],
        [2,1]
    ];


    for (const jump of jumps) {

        const r = row + jump[0];
        const c = col + jump[1];


        if (!inside(r, c)) {
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


    return moves;
}


/* KING */

function kingMoves(row, col, piece) {

    const moves = [];


    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            if (dr === 0 && dc === 0) {
                continue;
            }


            const r = row + dr;
            const c = col + dc;


            if (!inside(r, c)) {
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


/* BOARD LIMIT */

function inside(row, col) {

    return (
        row >= 0 &&
        row < 8 &&
        col >= 0 &&
        col < 8
    );

}


/* RESTART */

restartButton.addEventListener(
    "click",
    resetGame
);


/* START GAME */

resetGame();
