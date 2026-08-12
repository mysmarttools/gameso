document.addEventListener("DOMContentLoaded", () => {
    const boardElement = document.getElementById("chessBoard");

    const playerScoreElement = document.getElementById("playerScore");
    const computerScoreElement = document.getElementById("computerScore");
    const turnElement = document.getElementById("turn");

    const messageElement = document.getElementById("message");

    const gameOverlay = document.getElementById("gameOverlay");
    const resultIcon = document.getElementById("resultIcon");
    const resultTitle = document.getElementById("resultTitle");
    const resultText = document.getElementById("resultText");

    const restartButton = document.getElementById("restartButton");
    const newGameButton = document.getElementById("newGameButton");

    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const PIECES = {
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

    let board = [];
    let selected = null;
    let validMoves = [];
    let playerScore = 0;
    let computerScore = 0;
    let gameOver = false;
    let computerThinking = false;

    /*
     * Mini Chess uses a simplified 8x8 board.
     * Normal chess pieces are supported.
     */

    function createInitialBoard() {
        return [
            [
                piece("black", "rook"),
                piece("black", "knight"),
                piece("black", "bishop"),
                piece("black", "queen"),
                piece("black", "king"),
                piece("black", "bishop"),
                piece("black", "knight"),
                piece("black", "rook")
            ],
            [
                piece("black", "pawn"),
                piece("black", "pawn"),
                piece("black", "pawn"),
                piece("black", "pawn"),
                piece("black", "pawn"),
                piece("black", "pawn"),
                piece("black", "pawn"),
                piece("black", "pawn")
            ],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [
                piece("white", "pawn"),
                piece("white", "pawn"),
                piece("white", "pawn"),
                piece("white", "pawn"),
                piece("white", "pawn"),
                piece("white", "pawn"),
                piece("white", "pawn"),
                piece("white", "pawn")
            ],
            [
                piece("white", "rook"),
                piece("white", "knight"),
                piece("white", "bishop"),
                piece("white", "queen"),
                piece("white", "king"),
                piece("white", "bishop"),
                piece("white", "knight"),
                piece("white", "rook")
            ]
        ];
    }

    function piece(color, type) {
        return {
            color: color,
            type: type
        };
    }

    function resetGame() {
        board = createInitialBoard();

        selected = null;
        validMoves = [];

        playerScore = 0;
        computerScore = 0;

        gameOver = false;
        computerThinking = false;

        updateStats();

        gameOverlay.classList.add("hidden");

        messageElement.textContent =
            "Your turn — select a piece.";

        turnElement.textContent = "YOU";

        renderBoard();
    }

    function renderBoard() {
        boardElement.innerHTML = "";

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {

                const square = document.createElement("button");

                square.type = "button";
                square.className = "chess-square";

                if ((row + col) % 2 === 0) {
                    square.classList.add("light");
                } else {
                    square.classList.add("dark");
                }

                square.dataset.row = row;
                square.dataset.col = col;

                if (
                    selected &&
                    selected.row === row &&
                    selected.col === col
                ) {
                    square.classList.add("selected");
                }

                const move = validMoves.find(
                    m => m.row === row && m.col === col
                );

                if (move) {
                    if (board[row][col]) {
                        square.classList.add("capture-move");
                    } else {
                        square.classList.add("valid-move");
                    }
                }

                const currentPiece = board[row][col];

                if (currentPiece) {
                    const pieceElement =
                        document.createElement("span");

                    pieceElement.className = "piece";

                    pieceElement.textContent =
                        PIECES[currentPiece.color][currentPiece.type];

                    square.appendChild(pieceElement);
                }

                square.addEventListener(
                    "click",
                    () => handleSquareClick(row, col)
                );

                boardElement.appendChild(square);
            }
        }
    }

    function handleSquareClick(row, col) {

        if (gameOver || computerThinking) {
            return;
        }

        const clickedPiece = board[row][col];

        /*
         * If player already selected a piece,
         * check whether clicked square is a valid move.
         */

        if (selected) {

            const move = validMoves.find(
                m => m.row === row && m.col === col
            );

            if (move) {
                makePlayerMove(
                    selected.row,
                    selected.col,
                    row,
                    col
                );

                return;
            }
        }

        /*
         * Select a white piece.
         */

        if (
            clickedPiece &&
            clickedPiece.color === "white"
        ) {

            selected = {
                row: row,
                col: col
            };

            validMoves = getValidMoves(
                row,
                col,
                board
            );

            if (validMoves.length === 0) {

                messageElement.textContent =
                    "That piece has no valid moves.";

                selected = null;
                validMoves = [];

            } else {

                messageElement.textContent =
                    "Choose a highlighted square.";
            }

            renderBoard();
        }
    }

    function makePlayerMove(fromRow, fromCol, toRow, toCol) {

        const captured = board[toRow][toCol];

        board[toRow][toCol] =
            board[fromRow][fromCol];

        board[fromRow][fromCol] = null;

        selected = null;
        validMoves = [];

        if (captured) {

            playerScore += pieceValue(
                captured.type
            );

            playerScoreElement.textContent =
                playerScore;

            if (captured.type === "king") {
                finishGame(true);
                return;
            }
        }

        /*
         * Pawn promotion
         */

        promotePawn(toRow, toCol);

        renderBoard();

        if (checkForKings()) {
            finishGame(true);
            return;
        }

        turnElement.textContent = "CPU";

        messageElement.textContent =
            "Computer is thinking...";

        computerThinking = true;

        renderBoard();

        setTimeout(() => {
            computerMove();
        }, 500);
    }

    function computerMove() {

        if (gameOver) {
            return;
        }

        const moves = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {

                const currentPiece = board[row][col];

                if (
                    currentPiece &&
                    currentPiece.color === "black"
                ) {

                    const pieceMoves =
                        getValidMoves(
                            row,
                            col,
                            board
                        );

                    pieceMoves.forEach(move => {

                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col
                        });

                    });
                }
            }
        }

        if (moves.length === 0) {

            finishGame(true);
            return;
        }

        /*
         * Prefer captures.
         */

        const captures = moves.filter(move => {

            return board[move.toRow][move.toCol] &&
                board[move.toRow][move.toCol].color === "white";

        });

        let chosenMove;

        if (captures.length > 0) {

            chosenMove =
                captures[
                    Math.floor(
                        Math.random() *
                        captures.length
                    )
                ];

        } else {

            chosenMove =
                moves[
                    Math.floor(
                        Math.random() *
                        moves.length
                    )
                ];
        }

        const captured =
            board[
                chosenMove.toRow
            ][
                chosenMove.toCol
            ];

        board[
            chosenMove.toRow
        ][
            chosenMove.toCol
        ] =
            board[
                chosenMove.fromRow
            ][
                chosenMove.fromCol
            ];

        board[
            chosenMove.fromRow
        ][
            chosenMove.fromCol
        ] = null;

        if (captured) {

            computerScore += pieceValue(
                captured.type
            );

            computerScoreElement.textContent =
                computerScore;

            if (captured.type === "king") {

                finishGame(false);
                return;
            }
        }

        promotePawn(
            chosenMove.toRow,
            chosenMove.toCol
        );

        computerThinking = false;

        turnElement.textContent = "YOU";

        messageElement.textContent =
            "Your turn — select a piece.";

        renderBoard();

        if (checkForKings()) {
            finishGame(false);
        }
    }

    function getValidMoves(row, col, currentBoard) {

        const currentPiece =
            currentBoard[row][col];

        if (!currentPiece) {
            return [];
        }

        const moves = [];

        if (currentPiece.type === "pawn") {

            const direction =
                currentPiece.color === "white"
                    ? -1
                    : 1;

            const startRow =
                currentPiece.color === "white"
                    ? 6
                    : 1;

            const oneRow = row + direction;

            if (
                inBounds(oneRow, col) &&
                !currentBoard[oneRow][col]
            ) {

                moves.push({
                    row: oneRow,
                    col: col
                });

                const twoRow =
                    row + direction * 2;

                if (
                    row === startRow &&
                    !currentBoard[twoRow][col]
                ) {

                    moves.push({
                        row: twoRow,
                        col: col
                    });
                }
            }

            for (const dc of [-1, 1]) {

                const captureRow =
                    row + direction;

                const captureCol =
                    col + dc;

                if (
                    inBounds(
                        captureRow,
                        captureCol
                    )
                ) {

                    const target =
                        currentBoard[
                            captureRow
                        ][
                            captureCol
                        ];

                    if (
                        target &&
                        target.color !==
                            currentPiece.color
                    ) {

                        moves.push({
                            row: captureRow,
                            col: captureCol
                        });
                    }
                }
            }
        }

        if (currentPiece.type === "knight") {

            const offsets = [
                [-2, -1],
                [-2, 1],
                [-1, -2],
                [-1, 2],
                [1, -2],
                [1, 2],
                [2, -1],
                [2, 1]
            ];

            offsets.forEach(([dr, dc]) => {

                addMove(
                    row + dr,
                    col + dc,
                    currentPiece,
                    currentBoard,
                    moves
                );

            });
        }

        if (currentPiece.type === "king") {

            for (let dr = -1; dr <= 1; dr++) {

                for (let dc = -1; dc <= 1; dc++) {

                    if (dr === 0 && dc === 0) {
                        continue;
                    }

                    addMove(
                        row + dr,
                        col + dc,
                        currentPiece,
                        currentBoard,
                        moves
                    );
                }
            }
        }

        if (currentPiece.type === "rook") {

            slideMoves(
                row,
                col,
                currentPiece,
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

        if (currentPiece.type === "bishop") {

            slideMoves(
                row,
                col,
                currentPiece,
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

        if (currentPiece.type === "queen") {

            slideMoves(
                row,
                col,
                currentPiece,
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

    function addMove(
        row,
        col,
        currentPiece,
        currentBoard,
        moves
    ) {

        if (!inBounds(row, col)) {
            return;
        }

        const target =
            currentBoard[row][col];

        if (
            !target ||
            target.color !== currentPiece.color
        ) {

            moves.push({
                row: row,
                col: col
            });
        }
    }

    function slideMoves(
        row,
        col,
        currentPiece,
        currentBoard,
        moves,
        directions
    ) {

        directions.forEach(([dr, dc]) => {

            let r = row + dr;
            let c = col + dc;

            while (inBounds(r, c)) {

                const target =
                    currentBoard[r][c];

                if (!target) {

                    moves.push({
                        row: r,
                        col: c
                    });

                } else {

                    if (
                        target.color !==
                        currentPiece.color
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
        });
    }

    function inBounds(row, col) {

        return (
            row >= 0 &&
            row < 8 &&
            col >= 0 &&
            col < 8
        );
    }

    function pieceValue(type) {

        const values = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 10
        };

        return values[type] || 0;
    }

    function promotePawn(row, col) {

        const currentPiece =
            board[row][col];

        if (
            !currentPiece ||
            currentPiece.type !== "pawn"
        ) {
            return;
        }

        if (
            currentPiece.color === "white" &&
            row === 0
        ) {

            currentPiece.type = "queen";
        }

        if (
            currentPiece.color === "black" &&
            row === 7
        ) {

            currentPiece.type = "queen";
        }
    }

    function checkForKings() {

        let whiteKing = false;
        let blackKing = false;

        for (let row = 0; row < 8; row++) {

            for (let col = 0; col < 8; col++) {

                const currentPiece =
                    board[row][col];

                if (
                    currentPiece &&
                    currentPiece.type === "king"
                ) {

                    if (
                        currentPiece.color === "white"
                    ) {
                        whiteKing = true;
                    }

                    if (
                        currentPiece.color === "black"
                    ) {
                        blackKing = true;
                    }
                }
            }
        }

        if (!whiteKing) {
            finishGame(false);
            return true;
        }

        if (!blackKing) {
            finishGame(true);
            return true;
        }

        return false;
    }

    function finishGame(playerWon) {

        gameOver = true;
        computerThinking = false;

        if (playerWon) {

            resultIcon.textContent = "🏆";

            resultTitle.textContent =
                "You Win!";

            resultText.textContent =
                "Great game! You defeated the computer.";

            messageElement.textContent =
                "🏆 Victory!";

        } else {

            resultIcon.textContent = "💥";

            resultTitle.textContent =
                "Game Over";

            resultText.textContent =
                "The computer captured your king.";

            messageElement.textContent =
                "Computer wins!";
        }

        gameOverlay.classList.remove("hidden");

        renderBoard();
    }

    function updateStats() {

        playerScoreElement.textContent =
            playerScore;

        computerScoreElement.textContent =
            computerScore;

        turnElement.textContent =
            computerThinking ? "CPU" : "YOU";
    }

    /*
     * Buttons
     */

    if (restartButton) {
        restartButton.addEventListener(
            "click",
            resetGame
        );
    }

    if (newGameButton) {
        newGameButton.addEventListener(
            "click",
            resetGame
        );
    }

    /*
     * Start game
     */

    resetGame();
});
