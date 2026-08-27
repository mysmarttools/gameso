const suits = ["♠", "♥", "♦", "♣"];
const ranks = [
    "2", "3", "4", "5", "6",
    "7", "8", "9", "10",
    "J", "Q", "K", "A"
];

const playerNames = [
    "You",
    "West",
    "North",
    "East"
];

let deck = [];
let hands = [[], [], [], []];

let currentPlayer = 0;

let trick = [];

let tricksWon = [0, 0, 0, 0];

let bids = [0, 0, 0, 0];

let teamScores = [0, 0];

let gamePhase = "bid";

let spadesBroken = false;

let trickNumber = 0;


const playerCards =
    document.getElementById("playerCards");

const northCards =
    document.getElementById("northCards");

const westCards =
    document.getElementById("westCards");

const eastCards =
    document.getElementById("eastCards");

const trickArea =
    document.getElementById("trickArea");

const status =
    document.getElementById("status");

const bidPanel =
    document.getElementById("bidPanel");

const bidButtons =
    document.getElementById("bidButtons");

const playerScore =
    document.getElementById("playerScore");

const aiScore =
    document.getElementById("aiScore");

const trickCount =
    document.getElementById("trickCount");

const newGameBtn =
    document.getElementById("newGameBtn");

document.getElementById("year")
    .textContent =
    new Date().getFullYear();


/* =========================
   CARD CREATION
========================= */

function createDeck() {

    const newDeck = [];

    for (const suit of suits) {

        for (const rank of ranks) {

            newDeck.push({
                suit,
                rank
            });

        }

    }

    return newDeck;
}


/* =========================
   SHUFFLE
========================= */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];

    }

    return array;
}


/* =========================
   CARD VALUE
========================= */

function cardValue(card) {

    const values = {
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "8": 8,
        "9": 9,
        "10": 10,
        "J": 11,
        "Q": 12,
        "K": 13,
        "A": 14
    };

    return values[card.rank];
}


/* =========================
   DEAL
========================= */

function dealCards() {

    deck = shuffle(createDeck());

    hands = [
        [],
        [],
        [],
        []
    ];

    for (let i = 0; i < 52; i++) {

        hands[i % 4].push(
            deck[i]
        );

    }

    hands.forEach(hand => {

        hand.sort(
            sortCards
        );

    });
}


/* =========================
   SORT
========================= */

function sortCards(a, b) {

    const suitOrder = {
        "♣": 0,
        "♦": 1,
        "♥": 2,
        "♠": 3
    };

    if (
        suitOrder[a.suit] !==
        suitOrder[b.suit]
    ) {

        return (
            suitOrder[b.suit] -
            suitOrder[a.suit]
        );

    }

    return (
        cardValue(b) -
        cardValue(a)
    );
}


/* =========================
   RENDER HANDS
========================= */

function renderHands() {

    playerCards.innerHTML = "";

    northCards.innerHTML = "";

    westCards.innerHTML = "";

    eastCards.innerHTML = "";


    /* PLAYER */

    hands[0].forEach(
        (card, index) => {

            const element =
                createCardElement(
                    card
                );

            element.dataset.index =
                index;

            element.addEventListener(
                "click",
                () => {

                    playPlayerCard(
                        index
                    );

                }
            );

            playerCards.appendChild(
                element
            );

        }
    );


    /* AI CARD BACKS */

    for (let i = 0; i < 13; i++) {

        northCards.appendChild(
            createCardBack()
        );

    }


    for (let i = 0; i < 13; i++) {

        westCards.appendChild(
            createCardBack()
        );

        eastCards.appendChild(
            createCardBack()
        );

    }

}


/* =========================
   CARD ELEMENT
========================= */

function createCardElement(card) {

    const button =
        document.createElement("button");

    button.className =
        "hand-card " +
        (
            card.suit === "♥" ||
            card.suit === "♦"
                ? "red"
                : "black"
        );


    button.innerHTML = `

        <span class="card-rank">
            ${card.rank}
        </span>

        <span class="card-suit">
            ${card.suit}
        </span>

        <span class="card-bottom">
            ${card.rank}
        </span>

    `;


    return button;
}


/* =========================
   CARD BACK
========================= */

function createCardBack() {

    const card =
        document.createElement("div");

    card.className =
        "card-back";

    return card;
}


/* =========================
   BIDDING
========================= */

function showBidding() {

    gamePhase = "bid";

    bidPanel.classList.remove(
        "hidden"
    );

    bidButtons.innerHTML = "";


    for (let i = 0; i <= 13; i++) {

        const button =
            document.createElement("button");

        button.className =
            "bid-btn";

        button.textContent =
            i;

        button.addEventListener(
            "click",
            () => {

                makePlayerBid(i);

            }
        );

        bidButtons.appendChild(
            button
        );

    }


    status.textContent =
        "🎯 Choose how many tricks you expect to win";

}


/* =========================
   PLAYER BID
========================= */

function makePlayerBid(bid) {

    bids[0] = bid;

    bidPanel.classList.add(
        "hidden"
    );


    /* AI BIDS */

    bids[1] =
        aiBid(1);

    bids[2] =
        aiBid(2);

    bids[3] =
        aiBid(3);


    status.textContent =
        `Your bid: ${bid} | ` +
        `AI bids: ${bids[1]}, ${bids[2]}, ${bids[3]}`;


    setTimeout(
        startTricks,
        1000
    );

}


/* =========================
   AI BID
========================= */

function aiBid(player) {

    let bid = 0;

    hands[player].forEach(
        card => {

            if (
                card.suit === "♠"
            ) {

                if (
                    cardValue(card) >= 12
                ) {
                    bid += 1;
                }

            }

            else if (
                cardValue(card) === 14
            ) {

                bid += 1;

            }

        }
    );


    return Math.min(
        bid,
        7
    );
}


/* =========================
   START TRICKS
========================= */

function startTricks() {

    gamePhase = "play";

    currentPlayer = 0;

    trick = [];

    tricksWon = [0, 0, 0, 0];

    trickNumber = 0;

    spadesBroken = false;

    trickArea.innerHTML = "";

    renderHands();

    updateTrickCounter();

    status.textContent =
        "Your turn — play a card";

}


/* =========================
   VALID CARDS
========================= */

function getValidCards(player) {

    const hand =
        hands[player];


    if (
        trick.length === 0
    ) {

        if (!spadesBroken) {

            const nonSpades =
                hand.filter(
                    card =>
                        card.suit !== "♠"
                );

            if (
                nonSpades.length > 0
            ) {

                return nonSpades;

            }

        }

        return hand;

    }


    const ledSuit =
        trick[0].card.suit;


    const sameSuit =
        hand.filter(
            card =>
                card.suit ===
                ledSuit
        );


    if (
        sameSuit.length > 0
    ) {

        return sameSuit;

    }


    return hand;
}


/* =========================
   PLAYER PLAY
========================= */

function playPlayerCard(index) {

    if (
        gamePhase !== "play"
    ) {
        return;
    }

    if (
        currentPlayer !== 0
    ) {
        return;
    }


    const card =
        hands[0][index];


    const valid =
        getValidCards(0);


    if (
        !valid.includes(card)
    ) {

        status.textContent =
            "❌ You must follow the suit!";

        return;
    }


    hands[0].splice(
        index,
        1
    );


    playCard(
        0,
        card
    );

}


/* =========================
   PLAY CARD
========================= */

function playCard(
    player,
    card
) {

    trick.push({
        player,
        card
    });


    if (
        card.suit === "♠"
    ) {

        spadesBroken = true;

    }


    renderPlayedCard(
        player,
        card
    );


    renderHands();


    if (
        trick.length === 4
    ) {

        setTimeout(
            resolveTrick,
            900
        );

        return;
    }


    currentPlayer =
        (currentPlayer + 1) %
        4;


    if (
        currentPlayer === 0
    ) {

        status.textContent =
            "Your turn";

    }

    else {

        status.textContent =
            `${playerNames[currentPlayer]} is thinking...`;

        setTimeout(
            aiPlay,
            600
        );

    }

}


/* =========================
   AI PLAY
========================= */

function aiPlay() {

    if (
        gamePhase !== "play"
    ) {
        return;
    }


    const valid =
        getValidCards(
            currentPlayer
        );


    if (
        valid.length === 0
    ) {
        return;
    }


    const card =
        chooseAICard(
            valid
        );


    const index =
        hands[currentPlayer]
            .indexOf(card);


    hands[currentPlayer]
        .splice(index, 1);


    playCard(
        currentPlayer,
        card
    );

}


/* =========================
   AI STRATEGY
========================= */

function chooseAICard(cards) {

    /* If leading, play high spade / ace */

    if (
        trick.length === 0
    ) {

        return cards[
            cards.length - 1
        ];

    }


    const ledSuit =
        trick[0].card.suit;


    const spades =
        cards.filter(
            card =>
                card.suit === "♠"
        );


    if (
        spades.length > 0 &&
        ledSuit !== "♠"
    ) {

        return spades[
            spades.length - 1
        ];

    }


    return cards[0];
}


/* =========================
   RENDER TRICK
========================= */

function renderPlayedCard(
    player,
    card
) {

    const element =
        document.createElement("div");

    element.className =
        "played-card " +
        (
            card.suit === "♥" ||
            card.suit === "♦"
                ? "red"
                : "black"
        );


    element.innerHTML = `

        <span>
            ${card.rank}
            ${card.suit}
        </span>

        <strong>
            ${card.suit}
        </strong>

    `;


    const positions = [
        "trick-south",
        "trick-west",
        "trick-north",
        "trick-east"
    ];


    element.classList.add(
        positions[player]
    );


    trickArea.appendChild(
        element
    );

}


/* =========================
   TRICK WINNER
========================= */

function resolveTrick() {

    const winner =
        determineWinner();


    tricksWon[winner]++;

    trickNumber++;


    status.textContent =
        `${playerNames[winner]} wins the trick!`;


    updateTrickCounter();


    setTimeout(
        () => {

            trick = [];

            trickArea.innerHTML = "";

            currentPlayer =
                winner;


            if (
                trickNumber >= 13
            ) {

                finishRound();

                return;

            }


            renderHands();


            if (
                currentPlayer === 0
            ) {

                status.textContent =
                    "Your turn — lead a card";

            }

            else {

                status.textContent =
                    `${playerNames[currentPlayer]} leads`;

                setTimeout(
                    aiPlay,
                    600
                );

            }

        },
        800
    );

}


/* =========================
   DETERMINE WINNER
========================= */

function determineWinner() {

    const ledSuit =
        trick[0].card.suit;


    let winner =
        trick[0];


    for (
        let i = 1;
        i < trick.length;
        i++
    ) {

        const current =
            trick[i];


        if (
            beats(
                current.card,
                winner.card,
                ledSuit
            )
        ) {

            winner =
                current;

        }

    }


    return winner.player;
}


/* =========================
   CARD COMPARISON
========================= */

function beats(
    cardA,
    cardB,
    ledSuit
) {

    if (
        cardA.suit === "♠" &&
        cardB.suit !== "♠"
    ) {

        return true;

    }


    if (
        cardA.suit !== "♠" &&
        cardB.suit === "♠"
    ) {

        return false;

    }


    if (
        cardA.suit !==
        cardB.suit
    ) {

        return (
            cardA.suit ===
            ledSuit
        );

    }


    return (
        cardValue(cardA) >
        cardValue(cardB)
    );
}


/* =========================
   SCORE
========================= */

function finishRound() {

    const yourTeamTricks =
        tricksWon[0] +
        tricksWon[2];

    const opponentTricks =
        tricksWon[1] +
        tricksWon[3];


    const yourBid =
        bids[0] +
        bids[2];

    const opponentBid =
        bids[1] +
        bids[3];


    if (
        yourTeamTricks >=
        yourBid
    ) {

        teamScores[0] +=
            yourBid * 10 +
            (
                yourTeamTricks -
                yourBid
            );

    }

    else {

        teamScores[0] -=
            yourBid * 10;

    }


    if (
        opponentTricks >=
        opponentBid
    ) {

        teamScores[1] +=
            opponentBid * 10 +
            (
                opponentTricks -
                opponentBid
            );

    }

    else {

        teamScores[1] -=
            opponentBid * 10;

    }


    playerScore.textContent =
        teamScores[0];

    aiScore.textContent =
        teamScores[1];


    if (
        teamScores[0] >= 100 ||
        teamScores[1] >= 100
    ) {

        gamePhase = "end";


        if (
            teamScores[0] >
            teamScores[1]
        ) {

            status.textContent =
                "🏆 YOU WIN!";

        }

        else {

            status.textContent =
                "💥 AI TEAM WINS!";

        }


        return;
    }


    setTimeout(
        newRound,
        1600
    );

}


/* =========================
   NEW ROUND
========================= */

function newRound() {

    trick = [];

    tricksWon =
        [0, 0, 0, 0];

    bids =
        [0, 0, 0, 0];

    dealCards();

    renderHands();

    showBidding();

    updateTrickCounter();

}


/* =========================
   COUNTER
========================= */

function updateTrickCounter() {

    trickCount.textContent =
        `${trickNumber} / 13`;

}


/* =========================
   NEW GAME
========================= */

function newGame() {

    teamScores =
        [0, 0];

    playerScore.textContent =
        "0";

    aiScore.textContent =
        "0";

    trickNumber = 0;

    dealCards();

    renderHands();

    showBidding();

    updateTrickCounter();

}


newGameBtn.addEventListener(
    "click",
    newGame
);


newGame();
