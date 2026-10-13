const BOARD_SIZE = 4;
const boardElement = document.getElementById('board');
const currentPlayerElement = document.getElementById('current-player');

const PIECES = {
  'r': '♜', 'n': '♞', 'k': '♚', 'p': '♟', // Black
  'R': '♖', 'N': '♘', 'K': '♔', 'P': '♙'  // White
};

let initialBoard = [
  ['r', 'n', 'k', 'r'],
  ['p', 'p', 'p', 'p'],
  ['P', 'P', 'P', 'P'],
  ['R', 'N', 'K', 'R']
];

let boardState = [];
let turn = 'white';
let selectedSquare = null;
let validMoves = [];

function initGame() {
  boardState = JSON.parse(JSON.stringify(initialBoard));
  turn = 'white';
  selectedSquare = null;
  validMoves = [];
  updateStatus();
  renderBoard();
}

function renderBoard() {
  boardElement.innerHTML = '';
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((r + c) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = r;
      square.dataset.col = c;

      const piece = boardState[r][c];
      if (piece) {
        square.textContent = PIECES[piece];
        square.style.color = piece === piece.toUpperCase() ? '#ffffff' : '#000000';
      }

      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        square.classList.add('selected');
      }

      if (validMoves.some(m => m.r === r && m.c === c)) {
        square.classList.add('valid-move');
      }

      square.addEventListener('click', () => handleSquareClick(r, c));
      boardElement.appendChild(square);
    }
  }
}

function handleSquareClick(r, c) {
  const piece = boardState[r][c];
  const isWhiteTurn = turn === 'white';

  if (piece && ((isWhiteTurn && piece === piece.toUpperCase()) || (!isWhiteTurn && piece === piece.toLowerCase()))) {
    selectedSquare = { r, c };
    validMoves = calculateValidMoves(r, c, piece);
    renderBoard();
    return;
  }

  if (selectedSquare && validMoves.some(m => m.r === r && m.c === c)) {
    movePiece(selectedSquare.r, selectedSquare.c, r, c);
    selectedSquare = null;
    validMoves = [];
    
    if (checkGameOver()) return;

    turn = turn === 'white' ? 'black' : 'white';
    updateStatus();
    renderBoard();
  }
}

function movePiece(fromR, fromC, toR, toC) {
  boardState[toR][toC] = boardState[fromR][fromC];
  boardState[fromR][fromC] = '';
}

function calculateValidMoves(r, c, piece) {
  const moves = [];
  const type = piece.toLowerCase();
  const isWhite = piece === piece.toUpperCase();

  const addMoveIfValid = (targetR, targetC) => {
    if (targetR >= 0 && targetR < BOARD_SIZE && targetC >= 0 && targetC < BOARD_SIZE) {
      const targetPiece = boardState[targetR][targetC];
      if (!targetPiece) {
        moves.push({ r: targetR, c: targetC });
        return true;
      } else {
        const isTargetWhite = targetPiece === targetPiece.toUpperCase();
        if (isWhite !== isTargetWhite) {
          moves.push({ r: targetR, c: targetC });
        }
        return false;
      }
    }
    return false;
  };

  if (type === 'p') {
    const dir = isWhite ? -1 : 1;
    if (r + dir >= 0 && r + dir < BOARD_SIZE && !boardState[r + dir][c]) {
      moves.push({ r: r + dir, c });
    }
    [-1, 1].forEach(dc => {
      let targetR = r + dir, targetC = c + dc;
      if (targetR >= 0 && targetR < BOARD_SIZE && targetC >= 0 && targetC < BOARD_SIZE) {
        let tp = boardState[targetR][targetC];
        if (tp && (isWhite ? tp === tp.toLowerCase() : tp === tp.toUpperCase())) {
          moves.push({ r: targetR, c: targetC });
        }
      }
    });
  }

  if (type === 'r') {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    directions.forEach(([dr, dc]) => {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (!addMoveIfValid(nr, nc)) break;
        nr += dr; nc += dc;
      }
    });
  }

  if (type === 'n') {
    const kMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    kMoves.forEach(([dr, dc]) => addMoveIfValid(r + dr, c + dc));
  }

  if (type === 'k') {
    const kMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    kMoves.forEach(([dr, dc]) => addMoveIfValid(r + dr, c + dc));
  }

  return moves;
}

function checkGameOver() {
  let whiteKing = false;
  let blackKing = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (boardState[r][c] === 'K') whiteKing = true;
      if (boardState[r][c] === 'k') blackKing = true;
    }
  }

  if (!whiteKing || !blackKing) {
    const winner = whiteKing ? 'White' : 'Black';
    document.getElementById('status').innerHTML = `🎉 <strong>${winner} Wins!</strong>`;
    renderBoard();
    return true;
  }
  return false;
}

function updateStatus() {
  currentPlayerElement.textContent = turn.charAt(0).toUpperCase() + turn.slice(1);
}

function resetGame() {
  document.getElementById('status').innerHTML = `Turn: <span id="current-player">White</span>`;
  initGame();
}

initGame();
