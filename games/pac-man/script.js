/* =========================================================
   PAC-MAN - GAMESO
========================================================= */

const canvas =
  document.getElementById("gameCanvas");

const ctx =
  canvas.getContext("2d");


/* =========================
   GAME SETTINGS
========================= */

const TILE = 28;

const ROWS = 21;
const COLS = 19;

canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;


/* =========================
   MAZE

   # = Wall
   . = Pellet
   o = Power Pellet
   P = Pac-Man
   G = Ghost
========================= */

const originalMap = [
  "###################",
  "#........#........#",
  "#.###.###.###.###.#",
  "#o###.###.###.###o#",
  "#.................#",
  "#.###.#.#####.#.###",
  "#.....#...#...#...#",
  "#####.### # ###.###",
  "    #.#       #.#  ",
  "#####.# ##G## #.###",
  "     .  #GGG#  .   ",
  "#####.# ##### #.###",
  "    #.#       #.#  ",
  "#####.# ##### #.###",
  "#........#........#",
  "#.###.###.###.###.#",
  "#o..#.....P.....#o#",
  "###.#.#.#####.#.#.#",
  "#.....#...#...#....#",
  "#.#########.#######",
  "###################"
];


/*
  Clean spaces from map.
  Spaces become empty paths.
*/

let map = [];


/* =========================
   GAME STATE
========================= */

let pacman;

let ghosts = [];

let pellets = [];

let powerPellets = [];

let score = 0;

let lives = 3;

let bestScore =
  Number(
    localStorage.getItem(
      "pacmanBest"
    )
  ) || 0;

let gameRunning = false;

let gamePaused = false;

let powerMode = false;

let powerTimer = 0;

let lastTime = 0;

let animationId;


/* =========================
   DIRECTIONS
========================= */

const directions = {

  up: {
    x: 0,
    y: -1
  },

  down: {
    x: 0,
    y: 1
  },

  left: {
    x: -1,
    y: 0
  },

  right: {
    x: 1,
    y: 0
  }

};


/* =========================
   INIT MAP
========================= */

function buildMap() {

  map = [];

  pellets = [];

  powerPellets = [];

  ghosts = [];


  for (
    let r = 0;
    r < ROWS;
    r++
  ) {

    const source =
      originalMap[r] || "";


    const row = [];


    for (
      let c = 0;
      c < COLS;
      c++
    ) {

      let char =
        source[c] || "#";


      if (char === " ") {

        char = ".";
      }


      row.push(char);


      if (char === ".") {

        pellets.push({
          x: c,
          y: r
        });

      }


      if (char === "o") {

        powerPellets.push({
          x: c,
          y: r
        });

      }

    }


    map.push(row);
  }


  createPacman();

  createGhosts();
}


/* =========================
   PACMAN
========================= */

function createPacman() {

  let px = 9;
  let py = 16;


  for (
    let r = 0;
    r < ROWS;
    r++
  ) {

    for (
      let c = 0;
      c < COLS;
      c++
    ) {

      if (
        map[r][c] === "P"
      ) {

        px = c;
        py = r;

        map[r][c] = ".";

      }

    }

  }


  pacman = {

    x: px,
    y: py,

    dir: {
      x: 0,
      y: 0
    },

    nextDir: {
      x: 0,
      y: 0
    },

    speed: 7,

    mouth: 0

  };
}


/* =========================
   GHOSTS
========================= */

function createGhosts() {

  const colors = [
    "#ff3030",
    "#ff91d7",
    "#00eaff",
    "#ff9d28"
  ];


  const positions = [

    {
      x: 9,
      y: 10
    },

    {
      x: 8,
      y: 10
    },

    {
      x: 10,
      y: 10
    },

    {
      x: 9,
      y: 9
    }

  ];


  positions.forEach(
    (position, index) => {

      ghosts.push({

        x: position.x,

        y: position.y,

        dir: {
          x: index % 2 === 0 ? 1 : -1,
          y: 0
        },

        color:
          colors[index],

        speed:
          3.3 + index * 0.15,

        scared: false,

        homeX: position.x,

        homeY: position.y

      });

    }
  );
}


/* =========================
   START
========================= */

function startGame() {

  document
    .getElementById(
      "startScreen"
    )
    .classList.add(
      "hidden"
    );


  document
    .getElementById(
      "gameOver"
    )
    .classList.add(
      "hidden"
    );


  document
    .getElementById(
      "winScreen"
    )
    .classList.add(
      "hidden"
    );


  score = 0;

  lives = 3;

  powerMode = false;

  powerTimer = 0;

  gameRunning = true;

  gamePaused = false;


  buildMap();

  updateHUD();

  lastTime =
    performance.now();


  cancelAnimationFrame(
    animationId
  );


  animationId =
    requestAnimationFrame(
      gameLoop
    );
}


/* =========================
   RESET ROUND
========================= */

function resetPositions() {

  createPacman();

  createGhosts();

  powerMode = false;

  powerTimer = 0;
}


/* =========================
   GAME LOOP
========================= */

function gameLoop(time) {

  if (!gameRunning) {

    draw();

    return;
  }


  const delta =
    Math.min(
      (time - lastTime) / 1000,
      0.05
    );


  lastTime = time;


  if (!gamePaused) {

    update(delta);

  }


  draw();


  animationId =
    requestAnimationFrame(
      gameLoop
    );
}


/* =========================
   UPDATE
========================= */

function update(delta) {

  updatePacman(delta);

  updateGhosts(delta);

  checkPellets();

  checkPowerPellets();

  checkGhostCollision();

  updatePowerMode(delta);

  checkWin();

  updateHUD();
}


/* =========================
   CAN MOVE
========================= */

function canMove(x, y) {

  if (
    x < 0 ||
    x >= COLS ||
    y < 0 ||
    y >= ROWS
  ) {

    return false;
  }


  return (
    map[y][x] !== "#"
  );
}


/* =========================
   PACMAN UPDATE
========================= */

function updatePacman(delta) {

  const speed =
    pacman.speed * delta;


  /*
    Try next direction first.
  */

  const nextX =
    pacman.x +
    pacman.nextDir.x *
    0.12;

  const nextY =
    pacman.y +
    pacman.nextDir.y *
    0.12;


  if (
    canMove(
      Math.round(nextX),
      Math.round(nextY)
    )
  ) {

    pacman.dir =
      pacman.nextDir;

  }


  const newX =
    pacman.x +
    pacman.dir.x *
    speed;

  const newY =
    pacman.y +
    pacman.dir.y *
    speed;


  if (
    canMove(
      Math.round(newX),
      Math.round(newY)
    )
  ) {

    pacman.x = newX;

    pacman.y = newY;

  } else {

    pacman.x =
      Math.round(
        pacman.x
      );

    pacman.y =
      Math.round(
        pacman.y
      );

  }


  /*
    Wrap screen horizontally.
  */

  if (pacman.x < -0.5) {

    pacman.x =
      COLS - 0.5;

  }


  if (pacman.x > COLS - 0.5) {

    pacman.x = -0.5;

  }


  pacman.mouth +=
    delta * 12;
}


/* =========================
   GHOST UPDATE
========================= */

function updateGhosts(delta) {

  ghosts.forEach(
    ghost => {

      const speed =
        ghost.speed *
        delta *
        (ghost.scared
          ? 0.55
          : 1);


      const nextX =
        ghost.x +
        ghost.dir.x *
        speed;


      const nextY =
        ghost.y +
        ghost.dir.y *
        speed;


      if (
        canMove(
          Math.round(nextX),
          Math.round(nextY)
        )
      ) {

        ghost.x = nextX;

        ghost.y = nextY;

      } else {

        chooseGhostDirection(
          ghost
        );

      }


      /*
        Change direction randomly
        at intersections.
      */

      if (
        Math.random() < 0.025
      ) {

        chooseGhostDirection(
          ghost
        );

      }


      /*
        Screen wrap.
      */

      if (ghost.x < -0.5) {

        ghost.x =
          COLS - 0.5;

      }


      if (
        ghost.x >
        COLS - 0.5
      ) {

        ghost.x = -0.5;

      }

    }
  );
}


/* =========================
   GHOST DIRECTION
========================= */

function chooseGhostDirection(
  ghost
) {

  const possible = [];


  Object.values(
    directions
  ).forEach(
    direction => {

      const x =
        Math.round(
          ghost.x
        ) +
        direction.x;


      const y =
        Math.round(
          ghost.y
        ) +
        direction.y;


      if (
        canMove(x, y)
      ) {

        /*
          Avoid immediately
          reversing direction.
        */

        if (
          direction.x ===
            -ghost.dir.x &&
          direction.y ===
            -ghost.dir.y
        ) {

          return;
        }


        possible.push(
          direction
        );

      }

    }
  );


  if (
    possible.length === 0
  ) {

    ghost.dir = {
      x: -ghost.dir.x,
      y: -ghost.dir.y
    };

    return;
  }


  /*
    Scared ghosts move randomly.
  */

  if (
    ghost.scared
  ) {

    ghost.dir =
      possible[
        Math.floor(
          Math.random() *
          possible.length
        )
      ];

    return;
  }


  /*
    Normal ghosts try to
    move toward Pac-Man.
  */

  possible.sort(
    (a, b) => {

      const da =
        Math.hypot(
          ghost.x +
            a.x -
            pacman.x,

          ghost.y +
            a.y -
            pacman.y
        );


      const db =
        Math.hypot(
          ghost.x +
            b.x -
            pacman.x,

          ghost.y +
            b.y -
            pacman.y
        );


      return da - db;
    }
  );


  /*
    Sometimes choose randomly
    to make the game less predictable.
  */

  if (
    Math.random() < 0.35
  ) {

    ghost.dir =
      possible[
        Math.floor(
          Math.random() *
          possible.length
        )
      ];

  } else {

    ghost.dir =
      possible[0];

  }
}


/* =========================
   PELLETS
========================= */

function checkPellets() {

  for (
    let i = pellets.length - 1;
    i >= 0;
    i--
  ) {

    const pellet =
      pellets[i];


    const distance =
      Math.hypot(
        pacman.x -
          pellet.x,

        pacman.y -
          pellet.y
      );


    if (
      distance < 0.45
    ) {

      score += 10;

      pellets.splice(
        i,
        1
      );

    }

  }
}


/* =========================
   POWER PELLETS
========================= */

function checkPowerPellets() {

  for (
    let i =
      powerPellets.length - 1;
    i >= 0;
    i--
  ) {

    const pellet =
      powerPellets[i];


    const distance =
      Math.hypot(
        pacman.x -
          pellet.x,

        pacman.y -
          pellet.y
      );


    if (
      distance < 0.55
    ) {

      score += 50;

      powerMode = true;

      powerTimer = 8;


      ghosts.forEach(
        ghost => {
          ghost.scared = true;
        }
      );


      powerPellets.splice(
        i,
        1
      );

    }

  }
}


/* =========================
   POWER MODE
========================= */

function updatePowerMode(
  delta
) {

  if (!powerMode) {

    return;
  }


  powerTimer -= delta;


  if (
    powerTimer <= 0
  ) {

    powerMode = false;


    ghosts.forEach(
      ghost => {
        ghost.scared = false;
      }
    );

  }
}


/* =========================
   GHOST COLLISION
========================= */

function checkGhostCollision() {

  ghosts.forEach(
    ghost => {

      const distance =
        Math.hypot(
          pacman.x -
            ghost.x,

          pacman.y -
            ghost.y
        );


      if (
        distance < 0.65
      ) {

        if (
          ghost.scared
        ) {

          score += 200;

          ghost.x =
            ghost.homeX;

          ghost.y =
            ghost.homeY;

          ghost.scared =
            false;

        } else {

          loseLife();

        }

      }

    }
  );
}


/* =========================
   LOSE LIFE
========================= */

function loseLife() {

  lives--;

  updateHUD();


  if (
    lives <= 0
  ) {

    endGame();

    return;
  }


  resetPositions();
}


/* =========================
   WIN
========================= */

function checkWin() {

  if (
    pellets.length === 0 &&
    powerPellets.length === 0
  ) {

    gameWin();

  }
}


/* =========================
   GAME OVER
========================= */

function endGame() {

  gameRunning = false;


  const finalScore =
    Math.floor(score);


  if (
    finalScore > bestScore
  ) {

    bestScore =
      finalScore;

    localStorage.setItem(
      "pacmanBest",
      bestScore
    );

  }


  document
    .getElementById(
      "finalScore"
    )
    .textContent =
      finalScore;


  document
    .getElementById(
      "finalBestScore"
    )
    .textContent =
      bestScore;


  document
    .getElementById(
      "gameOver"
    )
    .classList.remove(
      "hidden"
    );
}


/* =========================
   WIN SCREEN
========================= */

function gameWin() {

  gameRunning = false;


  document
    .getElementById(
      "winScore"
    )
    .textContent =
      Math.floor(score);


  document
    .getElementById(
      "winScreen"
    )
    .classList.remove(
      "hidden"
    );
}


/* =========================
   DRAW
========================= */

function draw() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  drawMaze();

  drawPellets();

  drawPowerPellets();

  drawGhosts();

  drawPacman();
}


/* =========================
   MAZE
========================= */

function drawMaze() {

  for (
    let r = 0;
    r < ROWS;
    r++
  ) {

    for (
      let c = 0;
      c < COLS;
      c++
    ) {

      if (
        map[r][c] === "#"
      ) {

        drawWall(
          c,
          r
        );

      }

    }
  }
}


/* =========================
   WALL
========================= */

function drawWall(
  col,
  row
) {

  const x =
    col * TILE;

  const y =
    row * TILE;


  ctx.fillStyle =
    "#1010a8";

  ctx.fillRect(
    x,
    y,
    TILE,
    TILE
  );


  ctx.strokeStyle =
    "#3434ff";

  ctx.lineWidth = 2;

  ctx.strokeRect(
    x + 2,
    y + 2,
    TILE - 4,
    TILE - 4
  );
}


/* =========================
   PELLETS DRAW
========================= */

function drawPellets() {

  ctx.fillStyle =
    "#ffe7a0";


  pellets.forEach(
    pellet => {

      ctx.beginPath();

      ctx.arc(
        pellet.x * TILE +
          TILE / 2,

        pellet.y * TILE +
          TILE / 2,

        2.5,

        0,
        Math.PI * 2
      );

      ctx.fill();

    }
  );
}


/* =========================
   POWER PELLETS
========================= */

function drawPowerPellets() {

  const pulse =
    5 +
    Math.sin(
      performance.now() * 0.008
    ) * 2;


  ctx.fillStyle =
    "#fff";


  powerPellets.forEach(
    pellet => {

      ctx.beginPath();

      ctx.arc(
        pellet.x * TILE +
          TILE / 2,

        pellet.y * TILE +
          TILE / 2,

        pulse,

        0,
        Math.PI * 2
      );

      ctx.fill();

    }
  );
}


/* =========================
   PACMAN DRAW
========================= */

function drawPacman() {

  const x =
    pacman.x * TILE +
    TILE / 2;

  const y =
    pacman.y * TILE +
    TILE / 2;


  let angle = 0;


  if (
    pacman.dir.x === 1
  ) {

    angle = 0;

  } else if (
    pacman.dir.x === -1
  ) {

    angle = Math.PI;

  } else if (
    pacman.dir.y === -1
  ) {

    angle = -Math.PI / 2;

  } else if (
    pacman.dir.y === 1
  ) {

    angle = Math.PI / 2;

  }


  const mouth =
    0.18 +
    Math.abs(
      Math.sin(
        pacman.mouth
      )
    ) * 0.25;


  ctx.fillStyle =
    "#ffd900";


  ctx.beginPath();


  ctx.moveTo(
    x,
    y
  );


  ctx.arc(
    x,
    y,
    TILE * 0.43,

    angle + mouth,

    angle +
      Math.PI * 2 -
      mouth
  );


  ctx.closePath();

  ctx.fill();
}


/* =========================
   GHOSTS
========================= */

function drawGhosts() {

  ghosts.forEach(
    ghost => {

      const x =
        ghost.x * TILE +
        TILE / 2;

      const y =
        ghost.y * TILE +
        TILE / 2;


      const radius =
        TILE * 0.4;


      ctx.fillStyle =
        ghost.scared
          ? "#174cff"
          : ghost.color;


      ctx.beginPath();


      ctx.arc(
        x,
        y - 2,
        radius,
        Math.PI,
        0
      );


      ctx.lineTo(
        x + radius,
        y + radius
      );


      /*
        Ghost bottom
      */

      const bottom =
        y + radius;


      const wave =
        TILE * 0.18;


      ctx.lineTo(
        x + radius * 0.5,
        bottom - wave
      );

      ctx.lineTo(
        x,
        bottom
      );

      ctx.lineTo(
        x - radius * 0.5,
        bottom - wave
      );

      ctx.lineTo(
        x - radius,
        bottom
      );

      ctx.closePath();

      ctx.fill();


      /*
        Eyes
      */

      if (
        !ghost.scared
      ) {

        drawGhostEyes(
          x,
          y,
          ghost.dir
        );

      }

    }
  );
}


/* =========================
   GHOST EYES
========================= */

function drawGhostEyes(
  x,
  y,
  direction
) {

  ctx.fillStyle =
    "#fff";


  ctx.beginPath();

  ctx.arc(
    x - 5,
    y - 3,
    4,
    0,
    Math.PI * 2
  );

  ctx.arc(
    x + 5,
    y - 3,
    4,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "#1717a8";


  ctx.beginPath();

  ctx.arc(
    x - 5 +
      direction.x * 2,

    y - 3 +
      direction.y * 2,

    2,

    0,
    Math.PI * 2
  );

  ctx.arc(
    x + 5 +
      direction.x * 2,

    y - 3 +
      direction.y * 2,

    2,

    0,
    Math.PI * 2
  );

  ctx.fill();
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  function(event) {

    const key =
      event.key.toLowerCase();


    if (
      key === "arrowup" ||
      key === "w"
    ) {

      pacman.nextDir =
        directions.up;

      event.preventDefault();

    }


    if (
      key === "arrowdown" ||
      key === "s"
    ) {

      pacman.nextDir =
        directions.down;

      event.preventDefault();

    }


    if (
      key === "arrowleft" ||
      key === "a"
    ) {

      pacman.nextDir =
        directions.left;

      event.preventDefault();

    }


    if (
      key === "arrowright" ||
      key === "d"
    ) {

      pacman.nextDir =
        directions.right;

      event.preventDefault();

    }


    /*
      Pause
    */

    if (
      key === "p"
    ) {

      gamePaused =
        !gamePaused;

    }

  }
);


/* =========================
   MOBILE BUTTONS
========================= */

function mobileDirection(
  direction
) {

  if (
    !pacman
  ) {

    return;
  }


  pacman.nextDir =
    direction;
}


document
  .getElementById(
    "upBtn"
  )
  .addEventListener(
    "click",
    () => {
      mobileDirection(
        directions.up
      );
    }
  );


document
  .getElementById(
    "downBtn"
  )
  .addEventListener(
    "click",
    () => {
      mobileDirection(
        directions.down
      );
    }
  );


document
  .getElementById(
    "leftBtn"
  )
  .addEventListener(
    "click",
    () => {
      mobileDirection(
        directions.left
      );
    }
  );


document
  .getElementById(
    "rightBtn"
  )
  .addEventListener(
    "click",
    () => {
      mobileDirection(
        directions.right
      );
    }
  );


/* =========================
   BUTTONS
========================= */

document
  .getElementById(
    "startBtn"
  )
  .addEventListener(
    "click",
    startGame
  );


document
  .getElementById(
    "restartBtn"
  )
  .addEventListener(
    "click",
    startGame
  );


document
  .getElementById(
    "nextBtn"
  )
  .addEventListener(
    "click",
    startGame
  );


/* =========================
   HUD
========================= */

function updateHUD() {

  document
    .getElementById(
      "score"
    )
    .textContent =
      Math.floor(score);


  document
    .getElementById(
      "lives"
    )
    .textContent =
      lives;


  document
    .getElementById(
      "bestScore"
    )
    .textContent =
      bestScore;
}


/* =========================
   INITIAL DRAW
========================= */

buildMap();

updateHUD();

draw();
