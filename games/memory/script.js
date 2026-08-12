document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS
    ========================================= */

    const board =
        document.getElementById("memoryBoard");

    const movesElement =
        document.getElementById("moves");

    const pairsElement =
        document.getElementById("pairs");

    const timerElement =
        document.getElementById("timer");

    const messageElement =
        document.getElementById("gameMessage");

    const newGameButton =
        document.getElementById("newGame");


    /* =========================================
       GAME DATA
    ========================================= */

    const symbols = [
        "🚀",
        "🎮",
        "⚽",
        "🚗",
        "🦄",
        "🐼",
        "🍕",
        "🎯"
    ];

    let cards = [];

    let firstCard = null;

    let secondCard = null;

    let lockBoard = false;

    let moves = 0;

    let matchedPairs = 0;

    let seconds = 0;

    let timerInterval = null;

    let gameStarted = false;


    /* =========================================
       SHUFFLE
    ========================================= */

    function shuffle(array) {

        const shuffled = [...array];

        for (
            let i = shuffled.length - 1;
            i > 0;
            i--
        ) {

            const randomIndex =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                shuffled[i],
                shuffled[randomIndex]
            ] = [
                shuffled[randomIndex],
                shuffled[i]
            ];
        }

        return shuffled;
    }


    /* =========================================
       START GAME
    ========================================= */

    function startGame() {

        stopTimer();

        cards = shuffle([
            ...symbols,
            ...symbols
        ]);

        firstCard = null;

        secondCard = null;

        lockBoard = false;

        moves = 0;

        matchedPairs = 0;

        seconds = 0;

        gameStarted = false;

        movesElement.textContent = "0";

        pairsElement.textContent = "0 / 8";

        timerElement.textContent = "00:00";

        messageElement.innerHTML = "";

        renderCards();
    }


    /* =========================================
       RENDER CARDS
    ========================================= */

    function renderCards() {

        board.innerHTML = "";

        cards.forEach(
            (symbol, index) => {

                const card =
                    document.createElement("button");

                card.type = "button";

                card.className =
                    "memory-card";

                card.dataset.symbol =
                    symbol;

                card.dataset.index =
                    index;


                card.innerHTML = `
                    <div class="card-inner">

                        <div class="card-back"></div>

                        <div class="card-front">
                            <span>${symbol}</span>
                        </div>

                    </div>
                `;


                card.addEventListener(
                    "click",
                    () => flipCard(card)
                );


                board.appendChild(card);
            }
        );
    }


    /* =========================================
       FLIP CARD
    ========================================= */

    function flipCard(card) {

        if (lockBoard) {
            return;
        }

        if (
            card === firstCard
        ) {
            return;
        }

        if (
            card.classList.contains(
                "matched"
            )
        ) {
            return;
        }


        /* Start timer on first click */

        if (!gameStarted) {

            gameStarted = true;

            startTimer();
        }


        card.classList.add(
            "flipped"
        );


        if (!firstCard) {

            firstCard = card;

            return;
        }


        secondCard = card;

        moves++;

        movesElement.textContent =
            moves;

        checkMatch();
    }


    /* =========================================
       CHECK MATCH
    ========================================= */

    function checkMatch() {

        const isMatch =
            firstCard.dataset.symbol ===
            secondCard.dataset.symbol;


        if (isMatch) {

            handleMatch();

        } else {

            handleMismatch();
        }
    }


    /* =========================================
       MATCH
    ========================================= */

    function handleMatch() {

        firstCard.classList.add(
            "matched"
        );

        secondCard.classList.add(
            "matched"
        );


        matchedPairs++;

        pairsElement.textContent =
            `${matchedPairs} / 8`;


        resetTurn();


        if (
            matchedPairs === symbols.length
        ) {

            finishGame();
        }
    }


    /* =========================================
       MISMATCH
    ========================================= */

    function handleMismatch() {

        lockBoard = true;


        setTimeout(() => {

            if (firstCard) {

                firstCard.classList.remove(
                    "flipped"
                );
            }

            if (secondCard) {

                secondCard.classList.remove(
                    "flipped"
                );
            }


            resetTurn();

        }, 750);
    }


    /* =========================================
       RESET TURN
    ========================================= */

    function resetTurn() {

        firstCard = null;

        secondCard = null;

        lockBoard = false;
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


    function formatTime(totalSeconds) {

        const minutes =
            Math.floor(
                totalSeconds / 60
            );

        const remainingSeconds =
            totalSeconds % 60;


        return (
            String(minutes).padStart(
                2,
                "0"
            )
            +
            ":"
            +
            String(
                remainingSeconds
            ).padStart(
                2,
                "0"
            )
        );
    }


    /* =========================================
       FINISH GAME
    ========================================= */

    function finishGame() {

        stopTimer();

        gameStarted = false;


        setTimeout(() => {

            messageElement.innerHTML = `
                🎉 <strong>You Won!</strong>
                <br>
                You found all 8 pairs in
                ${moves} moves and
                ${formatTime(seconds)}.
                <br>
                <small>
                    Great memory!
                </small>
            `;

        }, 500);
    }


    /* =========================================
       NEW GAME
    ========================================= */

    newGameButton.addEventListener(
        "click",
        startGame
    );


    /* =========================================
       YEAR
    ========================================= */

    const year =
        document.getElementById("year");

    if (year) {

        year.textContent =
            new Date().getFullYear();
    }


    /* =========================================
       START
    ========================================= */

    startGame();

});
