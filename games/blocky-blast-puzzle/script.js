"use strict";


/* =========================================
   GAME SETTINGS
========================================= */

const BOARD_SIZE = 8;

const COLORS = [
  "#ff5576",
  "#ff9f43",
  "#ffd166",
  "#2fd68a",
  "#25c5d9",
  "#518cff",
  "#8b67ff",
  "#e85bdb"
];


/* =========================================
   BLOCK SHAPES
========================================= */

const SHAPES = [

  /* Single */
  [
    [1]
  ],

  /* 2 Horizontal */
  [
    [1, 1]
  ],

  /* 2 Vertical */
  [
    [1],
    [1]
  ],

  /* 3 Horizontal */
  [
    [1, 1, 1]
  ],

  /* 3 Vertical */
  [
    [1],
    [1],
    [1]
  ],

  /* 2x2 */
  [
    [1, 1],
    [1, 1]
  ],

  /* L */
  [
    [1, 1],
    [1, 0]
  ],

  /* Reverse L */
  [
    [1, 1],
    [0, 1]
  ],

  /* Big L */
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],

  /* Reverse Big L */
  [
    [0, 1],
    [0, 1],
    [1, 1]
  ],

  /* T */
  [
    [1, 1, 1],
    [0, 1, 0]
  ],

  /* Z */
  [
    [1, 1, 0],
    [0, 1, 1]
  ],

  /* S */
  [
    [0, 1, 1],
    [1, 1, 0]
  ],

  /* 4 Horizontal */
  [
    [1, 1, 1, 1]
  ],

  /* 4 Vertical */
  [
    [1],
    [1],
    [1],
    [1]
  ],

  /* 3x2 */
  [
    [1, 1, 1],
    [1, 1, 1]
  ],

  /* 2x3 */
  [
    [1, 1],
    [1, 1],
    [1, 1]
  ]

];


/* =========================================
   DOM ELEMENTS
========================================= */

const gameBoard =
  document.getElementById("gameBoard");

const piecesContainer =
  document.getElementById("piecesContainer");

const scoreElement =
  document.getElementById("score");

const bestScoreElement =
  document.getElementById("bestScore");

const piecesCounter =
  document.getElementById("piecesCounter");

const gameMessage =
  document.getElementById("gameMessage");

const gameOver =
  document.getElementById("gameOver");

const finalScore =
  document.getElementById("finalScore");

const newGameButton =
  document.getElementById("newGameButton");

const playAgainButton =
  document.getElementById("playAgainButton");

const currentYear =
  document.getElementById("currentYear");


/* =========================================
   GAME STATE
========================================= */

let board = [];

let pieces = [];

let selectedPiece = null;

let score = 0;

let bestScore =
  Number(
    localStorage.getItem(
      "gamesoBlockyBlastBest"
    )
  ) || 0;

let combo = 0;


/* =========================================
   CREATE EMPTY BOARD
========================================= */

function createEmptyBoard() {

  return Array.from(
    {
      length: BOARD_SIZE
    },
    () =>
      Array(
        BOARD_SIZE
      ).fill(null)
  );

}


/* =========================================
   RANDOM ITEM
========================================= */

function randomItem(array) {

  return array[
    Math.floor(
      Math.random() * array.length
    )
  ];

}


/* =========================================
   CREATE RANDOM PIECE
========================================= */

function createPiece() {

  const selectedShape =
    randomItem(SHAPES);

  const shape =
    selectedShape.map(
      row => [...row]
    );

  return {

    shape,

    color:
      randomItem(COLORS),

    id:
      Math.random()
        .toString(36)
        .slice(2)

  };

}


/* =========================================
   CREATE THREE PIECES
========================================= */

function createPieces() {

  pieces = [
    createPiece(),
    createPiece(),
    createPiece()
  ];

  selectedPiece = null;

}


/* =========================================
   DRAW BOARD
========================================= */

function renderBoard() {

  gameBoard.innerHTML = "";

  for (
    let row = 0;
    row < BOARD_SIZE;
    row++
  ) {

    for (
      let col = 0;
      col < BOARD_SIZE;
      col++
    ) {

      const cell =
        document.createElement("div");

      cell.className =
        "game-cell";

      cell.dataset.row =
        row;

      cell.dataset.col =
        col;


      /* Filled cell */

      if (
        board[row][col]
      ) {

        cell.classList.add(
          "filled"
        );

        cell.style.background =
          board[row][col];

      }


      /* Mouse preview */

      cell.addEventListener(
        "mouseenter",
        () => {

          showPreview(
            row,
            col
          );

        }
      );


      cell.addEventListener(
        "mouseleave",
        () => {

          removePreview();

        }
      );


      /* Click */

      cell.addEventListener(
        "click",
        () => {

          placeSelectedPiece(
            row,
            col
          );

        }
      );


      gameBoard.appendChild(
        cell
      );

    }

  }

}


/* =========================================
   RENDER PIECES
========================================= */

function renderPieces() {

  piecesContainer.innerHTML =
    "";


  pieces.forEach(
    (piece, index) => {

      const holder =
        document.createElement(
          "div"
        );

      holder.className =
        "piece-option";


      if (
        selectedPiece === index
      ) {

        holder.classList.add(
          "selected"
        );

      }


      if (!piece) {

        holder.style.visibility =
          "hidden";

        piecesContainer.appendChild(
          holder
        );

        return;

      }


      holder.addEventListener(
        "click",
        () => {

          selectedPiece =
            index;

          renderPieces();

          updateMessage(
            "Now choose a place for your block."
          );

        }
      );


      const miniGrid =
        document.createElement(
          "div"
        );

      miniGrid.className =
        "mini-grid";


      miniGrid.style.gridTemplateColumns =
        `repeat(
          ${piece.shape[0].length},
          18px
        )`;


      piece.shape.forEach(
        row => {

          row.forEach(
            value => {

              const miniCell =
                document.createElement(
                  "div"
                );

              miniCell.className =
                "mini-cell";


              if (value) {

                miniCell.style.background =
                  piece.color;

              } else {

                miniCell.style.background =
                  "transparent";

                miniCell.style.boxShadow =
                  "none";

              }


              miniGrid.appendChild(
                miniCell
              );

            }
          );

        }
      );


      holder.appendChild(
        miniGrid
      );

      piecesContainer.appendChild(
        holder
      );

    }
  );


  const remaining =
    pieces.filter(
      piece => piece !== null
    ).length;


  piecesCounter.textContent =
    `${remaining} / 3`;

}


/* =========================================
   GET PIECE CELLS
========================================= */

function getPieceCells(
  shape,
  startRow,
  startCol
) {

  const cells = [];


  for (
    let row = 0;
    row < shape.length;
    row++
  ) {

    for (
      let col = 0;
      col < shape[row].length;
      col++
    ) {

      if (
        shape[row][col]
      ) {

        cells.push(
          [
            startRow + row,
            startCol + col
          ]
        );

      }

    }

  }


  return cells;

}


/* =========================================
   CHECK PIECE FIT
========================================= */

function canPlacePiece(
  piece,
  row,
  col
) {

  const cells =
    getPieceCells(
      piece.shape,
      row,
      col
    );


  return cells.every(
    ([r, c]) => {

      return (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c] === null
      );

    }
  );

}


/* =========================================
   SHOW PREVIEW
========================================= */

function showPreview(
  row,
  col
) {

  if (
    selectedPiece === null
  ) {
    return;
  }


  const piece =
    pieces[selectedPiece];


  if (!piece) {
    return;
  }


  removePreview();


  if (
    !canPlacePiece(
      piece,
      row,
      col
    )
  ) {

    return;

  }


  const cells =
    getPieceCells(
      piece.shape,
      row,
      col
    );


  cells.forEach(
    ([r, c]) => {

      const index =
        r * BOARD_SIZE + c;

      const cell =
        gameBoard.children[
          index
        ];


      if (cell) {

        cell.classList.add(
          "preview"
        );

        cell.style.background =
          piece.color;

      }

    }
  );

}


/* =========================================
   REMOVE PREVIEW
========================================= */

function removePreview() {

  const cells =
    gameBoard.querySelectorAll(
      ".preview"
    );


  cells.forEach(
    cell => {

      cell.classList.remove(
        "preview"
      );

      const row =
        Number(
          cell.dataset.row
        );

      const col =
        Number(
          cell.dataset.col
        );


      if (
        board[row][col]
      ) {

        cell.style.background =
          board[row][col];

      } else {

        cell.style.background =
          "";

      }

    }
  );

}


/* =========================================
   PLACE SELECTED PIECE
========================================= */

function placeSelectedPiece(
  row,
  col
) {

  if (
    selectedPiece === null
  ) {

    updateMessage(
      "Choose a block first."
    );

    return;

  }


  const piece =
    pieces[selectedPiece];


  if (!piece) {
    return;
  }


  if (
    !canPlacePiece(
      piece,
      row,
      col
    )
  ) {

    updateMessage(
      "That block does not fit there."
    );

    return;

  }


  const cells =
    getPieceCells(
      piece.shape,
      row,
      col
    );


  /* Place blocks */

  cells.forEach(
    ([r, c]) => {

      board[r][c] =
        piece.color;

    }
  );


  /* Score for placed blocks */

  score +=
    cells.length * 5;


  /* Remove used piece */

  pieces[selectedPiece] =
    null;

  selectedPiece =
    null;


  removePreview();


  /* Check lines */

  const result =
    findCompleteLines();


  if (
    result.total > 0
  ) {

    combo++;

    const comboBonus =
      (
        result.total *
        result.total *
        50
      ) +
      (
        Math.max(
          0,
          combo - 1
        ) * 25
      );


    score +=
      comboBonus;


    if (
      result.total > 1
    ) {

      updateMessage(
        `🔥 ${result.total} lines cleared! +${comboBonus}`
      );

    } else {

      updateMessage(
        `✨ Line cleared! +${comboBonus}`
      );

    }

  } else {

    combo = 0;

    updateMessage(
      "Nice move! Keep building."
    );

  }


  updateBestScore();

  renderBoard();

  renderPieces();


  /* New pieces */

  if (
    pieces.every(
      piece => piece === null
    )
  ) {

    setTimeout(
      () => {

        createPieces();

        renderBoard();

        renderPieces();

        updateMessage(
          "New blocks ready!"
        );

        checkGameOver();

      },
      180
    );

    return;

  }


  checkGameOver();

}


/* =========================================
   FIND COMPLETE LINES
========================================= */

function findCompleteLines() {

  const rows = [];

  const columns = [];


  /* Rows */

  for (
    let row = 0;
    row < BOARD_SIZE;
    row++
  ) {

    if (
      board[row].every(
        cell => cell !== null
      )
    ) {

      rows.push(row);

    }

  }


  /* Columns */

  for (
    let col = 0;
    col < BOARD_SIZE;
    col++
  ) {

    let complete =
      true;


    for (
      let row = 0;
      row < BOARD_SIZE;
      row++
    ) {

      if (
        board[row][col] === null
      ) {

        complete =
          false;

        break;

      }

    }


    if (complete) {

      columns.push(col);

    }

  }


  if (
    rows.length === 0 &&
    columns.length === 0
  ) {

    return {
      total: 0
    };

  }


  /* Unique cells */

  const cellsToClear =
    new Set();


  rows.forEach(
    row => {

      for (
        let col = 0;
        col < BOARD_SIZE;
        col++
      ) {

        cellsToClear.add(
          `${row},${col}`
        );

      }

    }
  );


  columns.forEach(
    col => {

      for (
        let row = 0;
        row < BOARD_SIZE;
        row++
      ) {

        cellsToClear.add(
          `${row},${col}`
        );

      }

    }
  );


  /* Animation */

  cellsToClear.forEach(
    key => {

      const [
        row,
        col
      ] =
        key
          .split(",")
          .map(Number);


      const index =
        row * BOARD_SIZE + col;


      const cell =
        gameBoard.children[
          index
        ];


      if (cell) {

        cell.classList.add(
          "clearing"
        );

      }

    }
  );


  /* Clear after animation */

  cellsToClear.forEach(
    key => {

      const [
        row,
        col
      ] =
        key
          .split(",")
          .map(Number);


      board[row][col] =
        null;

    }
  );


  return {

    total:
      rows.length +
      columns.length

  };

}


/* =========================================
   CHECK AVAILABLE MOVES
========================================= */

function hasAnyAvailableMove() {

  return pieces.some(
    piece => {

      if (!piece) {
        return false;
      }


      for (
        let row = 0;
        row < BOARD_SIZE;
        row++
      ) {

        for (
          let col = 0;
          col < BOARD_SIZE;
          col++
        ) {

          if (
            canPlacePiece(
              piece,
              row,
              col
            )
          ) {

            return true;

          }

        }

      }


      return false;

    }
  );

}


/* =========================================
   GAME OVER CHECK
========================================= */

function checkGameOver() {

  if (
    !hasAnyAvailableMove()
  ) {

    setTimeout(
      endGame,
      250
    );

  }

}


/* =========================================
   END GAME
========================================= */

function endGame() {

  finalScore.textContent =
    score.toLocaleString();

  gameOver.hidden =
    false;

}


/* =========================================
   UPDATE BEST SCORE
========================================= */

function updateBestScore() {

  if (
    score > bestScore
  ) {

    bestScore =
      score;


    localStorage.setItem(
      "gamesoBlockyBlastBest",
      String(bestScore)
    );

  }


  scoreElement.textContent =
    score.toLocaleString();

  bestScoreElement.textContent =
    bestScore.toLocaleString();

}


/* =========================================
   UPDATE MESSAGE
========================================= */

function updateMessage(
  message
) {

  gameMessage.textContent =
    message;

}


/* =========================================
   START NEW GAME
========================================= */

function startNewGame() {

  board =
    createEmptyBoard();

  pieces = [];

  selectedPiece =
    null;

  score = 0;

  combo = 0;

  gameOver.hidden =
    true;

  createPieces();

  renderBoard();

  renderPieces();

  scoreElement.textContent =
    "0";

  bestScoreElement.textContent =
    bestScore.toLocaleString();

  updateMessage(
    "Complete a row or column to blast blocks!"
  );

}


/* =========================================
   BUTTONS
========================================= */

newGameButton.addEventListener(
  "click",
  startNewGame
);

playAgainButton.addEventListener(
  "click",
  startNewGame
);


/* =========================================
   YEAR
========================================= */

currentYear.textContent =
  new Date().getFullYear();


/* =========================================
   START
========================================= */

startNewGame();
