document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTS
    ========================================= */

    const choiceButtons =
        document.querySelectorAll(
            ".choice-button"
        );

    const playerChoiceElement =
        document.getElementById(
            "playerChoice"
        );

    const computerChoiceElement =
        document.getElementById(
            "computerChoice"
        );

    const playerScoreElement =
        document.getElementById(
            "playerScore"
        );

    const computerScoreElement =
        document.getElementById(
            "computerScore"
        );

    const resultElement =
        document.getElementById(
            "result"
        );

    const gameMessageElement =
        document.getElementById(
            "gameMessage"
        );

    const resetButton =
        document.getElementById(
            "resetGame"
        );


    /* =========================================
       GAME DATA
    ========================================= */

    const choices = [
        "rock",
        "paper",
        "scissors"
    ];


    const emojis = {
        rock: "✊",
        paper: "✋",
        scissors: "✌️"
    };


    const names = {
        rock: "Rock",
        paper: "Paper",
        scissors: "Scissors"
    };


    let playerScore = 0;

    let computerScore = 0;


    /* =========================================
       COMPUTER MOVE
    ========================================= */

    function getComputerChoice() {

        const randomIndex =
            Math.floor(
                Math.random() *
                choices.length
            );

        return choices[randomIndex];
    }


    /* =========================================
       WIN CHECK
    ========================================= */

    function getWinner(
        player,
        computer
    ) {

        if (player === computer) {
            return "draw";
        }


        if (
            (player === "rock" &&
                computer === "scissors")
            ||
            (player === "paper" &&
                computer === "rock")
            ||
            (player === "scissors" &&
                computer === "paper")
        ) {

            return "player";
        }


        return "computer";
    }


    /* =========================================
       PLAY ROUND
    ========================================= */

    function playRound(
        playerChoice
    ) {

        const computerChoice =
            getComputerChoice();


        /* Update choices */

        playerChoiceElement.textContent =
            emojis[playerChoice];

        computerChoiceElement.textContent =
            emojis[computerChoice];


        playerChoiceElement.classList.add(
            "active"
        );

        computerChoiceElement.classList.add(
            "active"
        );


        setTimeout(() => {

            playerChoiceElement.classList.remove(
                "active"
            );

            computerChoiceElement.classList.remove(
                "active"
            );

        }, 300);


        /* Winner */

        const winner =
            getWinner(
                playerChoice,
                computerChoice
            );


        /* Draw */

        if (winner === "draw") {

            resultElement.innerHTML = `
                <strong>It's a Draw! 🤝</strong>
                <span>
                    Both chose ${names[playerChoice]}
                </span>
            `;

            gameMessageElement.textContent =
                "Try again!";

            gameMessageElement.className =
                "game-message draw";

            return;
        }


        /* Player wins */

        if (winner === "player") {

            playerScore++;

            playerScoreElement.textContent =
                playerScore;


            resultElement.innerHTML = `
                <strong>You Win! 🎉</strong>
                <span>
                    ${names[playerChoice]}
                    beats
                    ${names[computerChoice]}
                </span>
            `;

            gameMessageElement.textContent =
                "Great move!";

            gameMessageElement.className =
                "game-message win";

            return;
        }


        /* Computer wins */

        computerScore++;

        computerScoreElement.textContent =
            computerScore;


        resultElement.innerHTML = `
            <strong>Computer Wins! 🤖</strong>
            <span>
                ${names[computerChoice]}
                beats
                ${names[playerChoice]}
            </span>
        `;

        gameMessageElement.textContent =
            "The computer got this round!";

        gameMessageElement.className =
            "game-message lose";
    }


    /* =========================================
       BUTTON EVENTS
    ========================================= */

    choiceButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const choice =
                        button.dataset.choice;


                    /* Selected animation */

                    choiceButtons.forEach(
                        (btn) => {

                            btn.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    playRound(choice);
                }
            );
        }
    );


    /* =========================================
       RESET GAME
    ========================================= */

    resetButton.addEventListener(
        "click",
        () => {

            playerScore = 0;

            computerScore = 0;


            playerScoreElement.textContent =
                "0";

            computerScoreElement.textContent =
                "0";


            playerChoiceElement.textContent =
                "❔";

            computerChoiceElement.textContent =
                "❔";


            resultElement.innerHTML = `
                <strong>
                    Make your move!
                </strong>

                <span>
                    Choose Rock, Paper or Scissors
                </span>
            `;


            gameMessageElement.textContent =
                "";


            gameMessageElement.className =
                "game-message";


            choiceButtons.forEach(
                (button) => {

                    button.classList.remove(
                        "selected"
                    );

                }
            );
        }
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

});
