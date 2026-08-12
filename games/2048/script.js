document.addEventListener("DOMContentLoaded", () => {

    const boardElement =
        document.getElementById("gameBoard");

    const scoreElement =
        document.getElementById("score");

    const bestScoreElement =
        document.getElementById("bestScore");

    const newGameButton =
        document.getElementById("newGame");

    const messageElement =
        document.getElementById("gameMessage");

    const cells =
        document.querySelectorAll(".cell");


    /* =====================================================
       GAME DATA
    ===================================================== */

    const SIZE = 4;

    let board = [];

    let score = 0;

    let bestScore =
        Number(
            localStorage.getItem(
                "gameso2048Best"
            ) || 0
        );

    let gameOver = false;

    let won = false;


    bestScoreElement.textContent =
        bestScore;


    /* =====================================================
       START GAME
    ===================================================== */

    function startGame() {

        board = createEmptyBoard();

        score = 0;

        gameOver = false;

        won = false;

        messageElement.innerHTML = "";

        updateScore();

        addRandomTile();

        addRandomTile();

        renderBoard();
    }


    /* =====================================================
       EMPTY BOARD
    ===================================================== */

    function createEmptyBoard() {

        return Array.from(
            { length: SIZE },
            () => Array(SIZE).fill(0)
        );
    }


    /* =====================================================
       RANDOM TILE
    ===================================================== */

    function addRandomTile() {

        const emptyCells = [];

        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            for (
                let col = 0;
                col < SIZE;
                col++
            ) {

                if (
                    board[row][col] === 0
                ) {

                    emptyCells.push({
                        row,
                        col
                    });
                }
            }
        }


        if (
            emptyCells.length === 0
        ) {
            return;
        }


        const randomCell =
            emptyCells[
                Math.floor(
                    Math.random() *
                    emptyCells.length
                )
            ];


        /*
         * 90% = 2
         * 10% = 4
         */

        board[
            randomCell.row
        ][
            randomCell.col
        ] =
            Math.random() < 0.9
                ? 2
                : 4;
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderBoard() {

        cells.forEach(
            (cell, index) => {

                const row =
                    Math.floor(index / SIZE);

                const col =
                    index % SIZE;

                const value =
                    board[row][col];


                cell.className = "cell";

                cell.textContent = "";


                if (value !== 0) {

                    cell.classList.add(
                        "tile"
                    );

                    if (
                        value <= 2048
                    ) {

                        cell.classList.add(
                            `tile-${value}`
                        );

                    } else {

                        cell.classList.add(
                            "tile-super"
                        );
                    }

                    cell.textContent =
                        value;
                }

            }
        );


        updateScore();
    }


    /* =====================================================
       SCORE
    ===================================================== */

    function updateScore() {

        scoreElement.textContent =
            score;

        bestScoreElement.textContent =
            bestScore;
    }


    /* =====================================================
       MOVE LEFT
    ===================================================== */

    function moveLeft() {

        let moved = false;

        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            const original =
                [...board[row]];

            const line =
                board[row].filter(
                    value => value !== 0
                );

            const merged =
                mergeLine(line);


            while (
                merged.length < SIZE
            ) {

                merged.push(0);
            }


            board[row] = merged;


            if (
                JSON.stringify(original) !==
                JSON.stringify(merged)
            ) {

                moved = true;
            }
        }


        return moved;
    }


    /* =====================================================
       MOVE RIGHT
    ===================================================== */

    function moveRight() {

        let moved = false;

        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            const original =
                [...board[row]];

            const reversed =
                board[row]
                    .filter(
                        value => value !== 0
                    )
                    .reverse();


            const merged =
                mergeLine(reversed)
                    .reverse();


            while (
                merged.length < SIZE
            ) {

                merged.unshift(0);
            }


            board[row] = merged;


            if (
                JSON.stringify(original) !==
                JSON.stringify(merged)
            ) {

                moved = true;
            }
        }


        return moved;
    }


    /* =====================================================
       MOVE UP
    ===================================================== */

    function moveUp() {

        let moved = false;

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            const original = [];

            for (
                let row = 0;
                row < SIZE;
                row++
            ) {

                original.push(
                    board[row][col]
                );
            }


            const line =
                original.filter(
                    value => value !== 0
                );


            const merged =
                mergeLine(line);


            while (
                merged.length < SIZE
            ) {

                merged.push(0);
            }


            for (
                let row = 0;
                row < SIZE;
                row++
            ) {

                board[row][col] =
                    merged[row];
            }


            if (
                JSON.stringify(original) !==
                JSON.stringify(merged)
            ) {

                moved = true;
            }
        }


        return moved;
    }


    /* =====================================================
       MOVE DOWN
    ===================================================== */

    function moveDown() {

        let moved = false;

        for (
            let col = 0;
            col < SIZE;
            col++
        ) {

            const original = [];

            for (
                let row = 0;
                row < SIZE;
                row++
            ) {

                original.push(
                    board[row][col]
                );
            }


            const reversed =
                original
                    .filter(
                        value => value !== 0
                    )
                    .reverse();


            const merged =
                mergeLine(reversed)
                    .reverse();


            while (
                merged.length < SIZE
            ) {

                merged.unshift(0);
            }


            for (
                let row = 0;
                row < SIZE;
                row++
            ) {

                board[row][col] =
                    merged[row];
            }


            if (
                JSON.stringify(original) !==
                JSON.stringify(merged)
            ) {

                moved = true;
            }
        }


        return moved;
    }


    /* =====================================================
       MERGE LINE
    ===================================================== */

    function mergeLine(line) {

        const result = [];

        let i = 0;


        while (
            i < line.length
        ) {

            if (
                i + 1 < line.length &&
                line[i] === line[i + 1]
            ) {

                const newValue =
                    line[i] * 2;


                result.push(
                    newValue
                );


                score += newValue;


                if (
                    newValue === 2048 &&
                    !won
                ) {

                    won = true;

                    showWinMessage();
                }


                i += 2;

            } else {

                result.push(
                    line[i]
                );

                i++;
            }
        }


        return result;
    }


    /* =====================================================
       HANDLE MOVE
    ===================================================== */

    function handleMove(direction) {

        if (gameOver) {
            return;
        }


        let moved = false;


        if (
            direction === "left"
        ) {

            moved = moveLeft();

        } else if (
            direction === "right"
        ) {

            moved = moveRight();

        } else if (
            direction === "up"
        ) {

            moved = moveUp();

        } else if (
            direction === "down"
        ) {

            moved = moveDown();
        }


        if (!moved) {
            return;
        }


        addRandomTile();

        renderBoard();


        if (
            !hasAvailableMoves()
        ) {

            endGame();
        }
    }


    /* =====================================================
       KEYBOARD
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            const keyMap = {

                ArrowLeft: "left",

                ArrowRight: "right",

                ArrowUp: "up",

                ArrowDown: "down"

            };


            const direction =
                keyMap[event.key];


            if (!direction) {
                return;
            }


            event.preventDefault();

            handleMove(direction);
        }
    );


    /* =====================================================
       MOBILE SWIPE
    ===================================================== */

    let touchStartX = 0;

    let touchStartY = 0;


    boardElement.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.changedTouches[0];

            touchStartX =
                touch.clientX;

            touchStartY =
                touch.clientY;

        },
        {
            passive: true
        }
    );


    boardElement.addEventListener(
        "touchend",
        event => {

            const touch =
                event.changedTouches[0];

            const deltaX =
                touch.clientX -
                touchStartX;

            const deltaY =
                touch.clientY -
                touchStartY;


            const minSwipe =
                30;


            if (
                Math.abs(deltaX) <
                    minSwipe &&
                Math.abs(deltaY) <
                    minSwipe
            ) {

                return;
            }


            if (
                Math.abs(deltaX) >
                Math.abs(deltaY)
            ) {

                if (
                    deltaX > 0
                ) {

                    handleMove(
                        "right"
                    );

                } else {

                    handleMove(
                        "left"
                    );
                }

            } else {

                if (
                    deltaY > 0
                ) {

                    handleMove(
                        "down"
                    );

                } else {

                    handleMove(
                        "up"
                    );
                }
            }

        },
        {
            passive: true
        }
    );


    /* =====================================================
       CHECK AVAILABLE MOVES
    ===================================================== */

    function hasAvailableMoves() {

        /* Empty cell exists */

        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            for (
                let col = 0;
                col < SIZE;
                col++
            ) {

                if (
                    board[row][col] === 0
                ) {

                    return true;
                }
            }
        }


        /* Horizontal match */

        for (
            let row = 0;
            row < SIZE;
            row++
        ) {

            for (
                let col = 0;
                col < SIZE - 1;
                col++
            ) {

                if (
                    board[row][col] ===
                    board[row][col + 1]
                ) {

                    return true;
                }
            }
        }


        /* Vertical match */

        for (
            let row = 0;
            row < SIZE - 1;
            row++
        ) {

            for (
                let col = 0;
                col < SIZE;
                col++
            ) {

                if (
                    board[row][col] ===
                    board[row + 1][col]
                ) {

                    return true;
                }
            }
        }


        return false;
    }


    /* =====================================================
       GAME OVER
    ===================================================== */

    function endGame() {

        gameOver = true;


        messageElement.innerHTML = `
            <div>
                💥 <strong>Game Over!</strong>
                <br>
                No more moves available.
                <br>
                <small>
                    Score: ${score}
                </small>
            </div>
        `;
    }


    /* =====================================================
       WIN MESSAGE
    ===================================================== */

    function showWinMessage() {

        messageElement.innerHTML = `
            🎉 <strong>You reached 2048!</strong>
            Keep playing and try for a higher score.
        `;
    }


    /* =====================================================
       NEW GAME BUTTON
    ===================================================== */

    newGameButton.addEventListener(
        "click",
        startGame
    );


    /* =====================================================
       BEST SCORE
    ===================================================== */

    function saveBestScore() {

        if (
            score > bestScore
        ) {

            bestScore = score;

            localStorage.setItem(
                "gameso2048Best",
                bestScore
            );
        }
    }


    /*
     * Save best score before leaving page
     */

    window.addEventListener(
        "beforeunload",
        saveBestScore
    );


    /* =====================================================
       YEAR
    ===================================================== */

    const yearElement =
        document.getElementById("year");

    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();
    }


    /* =====================================================
       START
    ===================================================== */

    startGame();

});
