document.addEventListener("DOMContentLoaded", () => {

    const cells = document.querySelectorAll(".cell");

    const turnMessage =
        document.getElementById("turnMessage");

    const restartButton =
        document.getElementById("restartButton");

    const xScoreElement =
        document.getElementById("xScore");

    const oScoreElement =
        document.getElementById("oScore");

    const drawScoreElement =
        document.getElementById("drawScore");

    const playerX =
        document.getElementById("playerX");

    const playerO =
        document.getElementById("playerO");


    /* =========================================
       GAME DATA
    ========================================= */

    let board = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];

    let currentPlayer = "X";

    let gameActive = true;

    let xScore = 0;
    let oScore = 0;
    let drawScore = 0;


    /* =========================================
       WINNING COMBINATIONS
    ========================================= */

    const winningCombinations = [

        [0, 1, 2],

        [3, 4, 5],

        [6, 7, 8],

        [0, 3, 6],

        [1, 4, 7],

        [2, 5, 8],

        [0, 4, 8],

        [2, 4, 6]

    ];


    /* =========================================
       CELL CLICK
    ========================================= */

    cells.forEach((cell) => {

        cell.addEventListener("click", () => {

            const index =
                Number(cell.dataset.index);

            makeMove(index);

        });

    });


    /* =========================================
       MAKE MOVE
    ========================================= */

    function makeMove(index) {

        if (!gameActive) {
            return;
        }

        if (board[index] !== "") {
            return;
        }


        /* Save move */

        board[index] = currentPlayer;


        /* Update cell */

        cells[index].textContent =
            currentPlayer;

        cells[index].classList.add(
            currentPlayer.toLowerCase()
        );


        /* Check winner */

        const result =
            checkWinner();


        if (result) {

            endGame(result);

            return;
        }


        /* Check draw */

        if (!board.includes("")) {

            endDraw();

            return;
        }


        /* Switch player */

        currentPlayer =
            currentPlayer === "X"
                ? "O"
                : "X";


        updateTurn();
    }


    /* =========================================
       CHECK WINNER
    ========================================= */

    function checkWinner() {

        for (
            const combination
            of winningCombinations
        ) {

            const [a, b, c] =
                combination;


            if (
                board[a] !== "" &&
                board[a] === board[b] &&
                board[a] === board[c]
            ) {

                return {
                    player: board[a],
                    combination: combination
                };
            }
        }


        return null;
    }


    /* =========================================
       END GAME
    ========================================= */

    function endGame(result) {

        gameActive = false;


        /* Highlight winning cells */

        result.combination.forEach(
            index => {

                cells[index].classList.add(
                    "winner"
                );

            }
        );


        /* Update score */

        if (result.player === "X") {

            xScore++;

            xScoreElement.textContent =
                xScore;

        } else {

            oScore++;

            oScoreElement.textContent =
                oScore;
        }


        /* Message */

        turnMessage.innerHTML = `
            🎉 Player
            <strong>${result.player}</strong>
            Wins!
        `;


        /* Active player */

        playerX.classList.toggle(
            "active",
            result.player === "X"
        );

        playerO.classList.toggle(
            "active",
            result.player === "O"
        );
    }


    /* =========================================
       DRAW
    ========================================= */

    function endDraw() {

        gameActive = false;

        drawScore++;

        drawScoreElement.textContent =
            drawScore;


        turnMessage.innerHTML =
            "🤝 It's a Draw!";


        playerX.classList.remove(
            "active"
        );

        playerO.classList.remove(
            "active"
        );


        /* Highlight full board */

        cells.forEach(
            cell => {

                cell.classList.add(
                    "draw-cell"
                );

            }
        );
    }


    /* =========================================
       UPDATE TURN
    ========================================= */

    function updateTurn() {

        turnMessage.innerHTML = `
            Player
            <strong>${currentPlayer}</strong>
            's Turn
        `;


        playerX.classList.toggle(
            "active",
            currentPlayer === "X"
        );

        playerO.classList.toggle(
            "active",
            currentPlayer === "O"
        );
    }


    /* =========================================
       NEW GAME
    ========================================= */

    function newGame() {

        board = [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ];


        currentPlayer = "X";

        gameActive = true;


        /* Clear cells */

        cells.forEach(
            cell => {

                cell.textContent = "";

                cell.classList.remove(
                    "x",
                    "o",
                    "winner",
                    "draw-cell"
                );

            }
        );


        updateTurn();
    }


    /* =========================================
       RESTART BUTTON
    ========================================= */

    restartButton.addEventListener(
        "click",
        newGame
    );


    /* =========================================
       KEYBOARD ACCESSIBILITY
    ========================================= */

    cells.forEach(
        cell => {

            cell.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        cell.click();

                    }

                }
            );

        }
    );


    /* =========================================
       INITIAL STATE
    ========================================= */

    updateTurn();

});
