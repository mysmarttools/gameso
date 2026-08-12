document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS
    ========================================= */

    const board =
        document.getElementById("mineBoard");

    const mineCountElement =
        document.getElementById("mineCount");

    const flagCountElement =
        document.getElementById("flagCount");

    const timerElement =
        document.getElementById("timer");

    const messageElement =
        document.getElementById("gameMessage");

    const newGameButton =
        document.getElementById("newGame");

    const flagModeButton =
        document.getElementById("flagMode");


    /* =========================================
       GAME SETTINGS
    ========================================= */

    const ROWS = 10;
    const COLS = 10;
    const MINES = 10;

    const TOTAL_CELLS =
        ROWS * COLS;


    /* =========================================
       GAME STATE
    ========================================= */

    let cells = [];

    let mines = [];

    let flags = 0;

    let revealed = 0;

    let gameOver = false;

    let gameStarted = false;

    let flagMode = false;

    let seconds = 0;

    let timerInterval = null;


    /* =========================================
       CREATE BOARD
    ========================================= */

    function createBoard() {

        cells = [];

        mines = [];

        flags = 0;

        revealed = 0;

        gameOver = false;

        gameStarted = false;

        flagMode = false;

        seconds = 0;


        stopTimer();


        timerElement.textContent =
            "00:00";

        mineCountElement.textContent =
            MINES;

        flagCountElement.textContent =
            "0";

        messageElement.textContent =
            "Clear all safe cells to win!";

        messageElement.className =
            "game-message";


        flagModeButton.classList.remove(
            "active"
        );

        flagModeButton.textContent =
            "🚩 Flag Mode: OFF";


        board.innerHTML = "";


        /* Create cells */

        for (
            let i = 0;
            i < TOTAL_CELLS;
            i++
        ) {

            const cell = {
                index: i,
                mine: false,
                revealed: false,
                flagged: false,
                adjacent: 0
            };

            cells.push(cell);
        }


        /* Place mines */

        placeMines();


        /* Calculate numbers */

        calculateNumbers();


        /* Render */

        renderBoard();
    }


    /* =========================================
       PLACE MINES
    ========================================= */

    function placeMines() {

        let placed = 0;


        while (placed < MINES) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    TOTAL_CELLS
                );


            if (
                cells[randomIndex].mine
            ) {
                continue;
            }


            cells[randomIndex].mine =
                true;

            mines.push(randomIndex);

            placed++;
        }
    }


    /* =========================================
       CALCULATE ADJACENT MINES
    ========================================= */

    function calculateNumbers() {

        cells.forEach((cell) => {

            if (cell.mine) {
                return;
            }


            const neighbors =
                getNeighbors(cell.index);


            let count = 0;


            neighbors.forEach(
                (neighborIndex) => {

                    if (
                        cells[neighborIndex].mine
                    ) {
                        count++;
                    }

                }
            );


            cell.adjacent = count;
        });
    }


    /* =========================================
       GET NEIGHBORS
    ========================================= */

    function getNeighbors(index) {

        const row =
            Math.floor(index / COLS);

        const col =
            index % COLS;


        const neighbors = [];


        for (
            let rowOffset = -1;
            rowOffset <= 1;
            rowOffset++
        ) {

            for (
                let colOffset = -1;
                colOffset <= 1;
                colOffset++
            ) {

                if (
                    rowOffset === 0 &&
                    colOffset === 0
                ) {
                    continue;
                }


                const newRow =
                    row + rowOffset;

                const newCol =
                    col + colOffset;


                if (
                    newRow >= 0 &&
                    newRow < ROWS &&
                    newCol >= 0 &&
                    newCol < COLS
                ) {

                    neighbors.push(
                        newRow * COLS +
                        newCol
                    );
                }
            }
        }


        return neighbors;
    }


    /* =========================================
       RENDER BOARD
    ========================================= */

    function renderBoard() {

        board.innerHTML = "";


        cells.forEach((cell) => {

            const element =
                document.createElement("button");


            element.type = "button";

            element.className =
                "mine-cell";


            element.dataset.index =
                cell.index;


            updateCellElement(
                element,
                cell
            );


            /* Left click */

            element.addEventListener(
                "click",
                () => {

                    handleCellClick(
                        cell.index
                    );

                }
            );


            /* Right click */

            element.addEventListener(
                "contextmenu",
                (event) => {

                    event.preventDefault();

                    toggleFlag(
                        cell.index
                    );

                }
            );


            board.appendChild(element);
        });
    }


    /* =========================================
       UPDATE CELL
    ========================================= */

    function updateCellElement(
        element,
        cell
    ) {

        element.className =
            "mine-cell";


        element.textContent = "";


        if (cell.flagged) {

            element.classList.add(
                "flagged"
            );

            element.textContent =
                "🚩";

            return;
        }


        if (!cell.revealed) {
            return;
        }


        element.classList.add(
            "revealed"
        );


        if (cell.mine) {

            element.classList.add(
                "mine"
            );

            element.textContent =
                "💣";

            return;
        }


        if (cell.adjacent > 0) {

            element.classList.add(
                `number-${cell.adjacent}`
            );

            element.textContent =
                cell.adjacent;
        }
    }


    /* =========================================
       GET DOM CELL
    ========================================= */

    function getCellElement(index) {

        return board.querySelector(
            `[data-index="${index}"]`
        );
    }


    /* =========================================
       CELL CLICK
    ========================================= */

    function handleCellClick(index) {

        if (gameOver) {
            return;
        }


        const cell =
            cells[index];


        if (
            cell.revealed
        ) {
            return;
        }


        /* Mobile flag mode */

        if (flagMode) {

            toggleFlag(index);

            return;
        }


        /* Flagged cells cannot open */

        if (cell.flagged) {
            return;
        }


        /* Start timer */

        if (!gameStarted) {

            gameStarted = true;

            startTimer();
        }


        /* Mine */

        if (cell.mine) {

            loseGame(index);

            return;
        }


        /* Reveal */

        revealCell(index);


        /* Check win */

        checkWin();
    }


    /* =========================================
       REVEAL CELL
    ========================================= */

    function revealCell(index) {

        const cell =
            cells[index];


        if (
            cell.revealed ||
            cell.flagged ||
            cell.mine
        ) {
            return;
        }


        cell.revealed = true;

        revealed++;


        const element =
            getCellElement(index);


        updateCellElement(
            element,
            cell
        );


        /* Open empty area */

        if (
            cell.adjacent === 0
        ) {

            const neighbors =
                getNeighbors(index);


            neighbors.forEach(
                (neighborIndex) => {

                    if (
                        !cells[
                            neighborIndex
                        ].revealed
                    ) {

                        revealCell(
                            neighborIndex
                        );
                    }

                }
            );
        }
    }


    /* =========================================
       TOGGLE FLAG
    ========================================= */

    function toggleFlag(index) {

        if (gameOver) {
            return;
        }


        const cell =
            cells[index];


        if (cell.revealed) {
            return;
        }


        if (
            !cell.flagged &&
            flags >= MINES
        ) {

            return;
        }


        cell.flagged =
            !cell.flagged;


        if (cell.flagged) {

            flags++;

        } else {

            flags--;
        }


        flagCountElement.textContent =
            flags;


        const element =
            getCellElement(index);


        updateCellElement(
            element,
            cell
        );


        if (!gameStarted) {

            gameStarted = true;

            startTimer();
        }
    }


    /* =========================================
       LOSE GAME
    ========================================= */

    function loseGame(
        clickedMine
    ) {

        gameOver = true;

        stopTimer();


        /* Reveal all mines */

        cells.forEach((cell) => {

            if (cell.mine) {

                cell.revealed = true;

                cell.flagged = false;
            }
        });


        /* Update board */

        cells.forEach((cell) => {

            const element =
                getCellElement(
                    cell.index
                );

            updateCellElement(
                element,
                cell
            );
        });


        const clickedElement =
            getCellElement(
                clickedMine
            );


        if (clickedElement) {

            clickedElement.classList.add(
                "mine"
            );
        }


        messageElement.innerHTML =
            "💥 <strong>Game Over!</strong> You hit a mine. Try again!";

        messageElement.className =
            "game-message lose";
    }


    /* =========================================
       CHECK WIN
    ========================================= */

    function checkWin() {

        const safeCells =
            TOTAL_CELLS - MINES;


        if (
            revealed !== safeCells
        ) {
            return;
        }


        gameOver = true;

        stopTimer();


        /* Flag remaining mines */

        cells.forEach((cell) => {

            if (cell.mine) {

                cell.flagged = true;
            }


            const element =
                getCellElement(
                    cell.index
                );

            updateCellElement(
                element,
                cell
            );
        });


        flags = MINES;

        flagCountElement.textContent =
            MINES;


        messageElement.innerHTML =
            `🎉 <strong>You Win!</strong> You cleared the board in ${formatTime(seconds)}.`;

        messageElement.className =
            "game-message win";
    }


    /* =========================================
       TIMER
    ========================================= */

    function startTimer() {

        stopTimer();


        timerInterval =
            setInterval(() => {

                seconds++;


                timerElement.textContent =
                    formatTime(seconds);


                /* Prevent absurdly long timer */

                if (seconds >= 999) {

                    stopTimer();
                }

            }, 1000);
    }


    function stopTimer() {

        if (timerInterval) {

            clearInterval(
                timerInterval
            );

            timerInterval = null;
        }
    }


    function formatTime(
        totalSeconds
    ) {

        const minutes =
            Math.floor(
                totalSeconds / 60
            );


        const remaining =
            totalSeconds % 60;


        return (
            String(minutes).padStart(
                2,
                "0"
            )
            +
            ":"
            +
            String(remaining).padStart(
                2,
                "0"
            )
        );
    }


    /* =========================================
       FLAG MODE
    ========================================= */

    flagModeButton.addEventListener(
        "click",
        () => {

            flagMode =
                !flagMode;


            if (flagMode) {

                flagModeButton.classList.add(
                    "active"
                );

                flagModeButton.textContent =
                    "🚩 Flag Mode: ON";

            } else {

                flagModeButton.classList.remove(
                    "active"
                );

                flagModeButton.textContent =
                    "🚩 Flag Mode: OFF";
            }
        }
    );


    /* =========================================
       NEW GAME
    ========================================= */

    newGameButton.addEventListener(
        "click",
        createBoard
    );


    /* =========================================
       FOOTER YEAR
    ========================================= */

    const year =
        document.getElementById("year");


    if (year) {

        year.textContent =
            new Date().getFullYear();
    }


    /* =========================================
       START GAME
    ========================================= */

    createBoard();

});
