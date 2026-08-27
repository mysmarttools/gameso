let scene;
let camera;
let renderer;
let clock;

let sled;

let gameRunning = false;
let initialized = false;

let score = 0;
let giftsCollected = 0;

let speed = 0.45;

let playerX = 0;
let targetX = 0;

let obstacles = [];
let gifts = [];
let trees = [];

let spawnTimer = 0;
let giftTimer = 0;

let bestScore =
  Number(localStorage.getItem("snowRiderBest")) || 0;

const ROAD_WIDTH = 16;


/* =========================
   INIT
========================= */

function init() {

  if (initialized) return;

  initialized = true;

  scene = new THREE.Scene();

  scene.background =
    new THREE.Color(0xbfe9ff);

  scene.fog =
    new THREE.Fog(
      0xbfe9ff,
      35,
      190
    );

  clock = new THREE.Clock();

  camera =
    new THREE.PerspectiveCamera(
      60,
      window.innerWidth /
      window.innerHeight,
      0.1,
      500
    );

  camera.position.set(
    0,
    5.5,
    10
  );


  /* =========================
     RENDERER
  ========================= */

  renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      2
    )
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.outputEncoding =
    THREE.sRGBEncoding;

  document
    .getElementById("game")
    .appendChild(
      renderer.domElement
    );


  /* =========================
     LIGHT
  ========================= */

  const ambient =
    new THREE.HemisphereLight(
      0xffffff,
      0x8bb5c7,
      1.7
    );

  scene.add(ambient);


  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      2
    );

  sun.position.set(
    30,
    50,
    20
  );

  scene.add(sun);


  /* =========================
     WORLD
  ========================= */

  createSnowGround();

  createMountains();

  createSled();


  /* =========================
     TREES
  ========================= */

  for (let i = 0; i < 35; i++) {

    createTree(
      randomLane(),
      -10 -
      Math.random() * 180
    );
  }


  /* =========================
     EVENTS
  ========================= */

  window.addEventListener(
    "resize",
    onResize
  );

  window.addEventListener(
    "keydown",
    handleKeyDown
  );


  document
    .getElementById("startBtn")
    .addEventListener(
      "click",
      startGame
    );


  document
    .getElementById("restartBtn")
    .addEventListener(
      "click",
      restartGame
    );


  setupMobileControls();

  updateHUD();

  animate();
}


/* =========================
   SNOW GROUND
========================= */

function createSnowGround() {

  const geometry =
    new THREE.PlaneGeometry(
      120,
      500
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xf7fbff
    });

  const ground =
    new THREE.Mesh(
      geometry,
      material
    );

  ground.rotation.x =
    -Math.PI / 2;

  ground.position.set(
    0,
    -0.4,
    -180
  );

  scene.add(ground);
}


/* =========================
   MOUNTAINS
========================= */

function createMountains() {

  for (let i = 0; i < 18; i++) {

    const height =
      15 +
      Math.random() * 20;

    const geometry =
      new THREE.ConeGeometry(
        10 +
        Math.random() * 8,
        height,
        8
      );

    const material =
      new THREE.MeshStandardMaterial({
        color: 0xd9eff8
      });

    const mountain =
      new THREE.Mesh(
        geometry,
        material
      );

    const side =
      i % 2 === 0
        ? -30
        : 30;

    mountain.position.set(
      side +
      (Math.random() * 10 - 5),
      height / 2 - 1,
      -20 -
      Math.random() * 180
    );

    scene.add(mountain);
  }
}


/* =========================
   SLED
========================= */

function createSled() {

  sled =
    new THREE.Group();


  /* BODY */

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.8,
        0.35,
        3.2
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd71920,
        roughness: 0.7
      })
    );

  body.position.y = 0.45;

  sled.add(body);


  /* FRONT */

  const front =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.45,
        0.22,
        0.5
      ),
      new THREE.MeshStandardMaterial({
        color: 0xff3b30
      })
    );

  front.position.set(
    0,
    0.68,
    -1.2
  );

  sled.add(front);


  /* SEAT */

  const seat =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.4,
        0.25,
        1.4
      ),
      new THREE.MeshStandardMaterial({
        color: 0x222222
      })
    );

  seat.position.set(
    0,
    0.75,
    0.25
  );

  sled.add(seat);


  /* RUNNERS */

  const runnerMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x222222
    });


  [-0.65, 0.65].forEach(
    x => {

      const runner =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.12,
            0.12,
            3.7
          ),
          runnerMaterial
        );

      runner.position.set(
        x,
        0.18,
        0
      );

      sled.add(runner);
    }
  );


  sled.position.set(
    0,
    0,
    5
  );

  scene.add(sled);
}


/* =========================
   TREE
========================= */

function createTree(x, z) {

  const tree =
    new THREE.Group();


  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.25,
        0.35,
        2.5,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0x795548
      })
    );

  trunk.position.y = 1.25;

  tree.add(trunk);


  for (let i = 0; i < 3; i++) {

    const leaves =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          1.5 -
          i * 0.25,
          2.4,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x1d8c57
        })
      );

    leaves.position.y =
      2.4 +
      i * 1.2;

    tree.add(leaves);
  }


  tree.position.set(
    x,
    0,
    z
  );

  tree.scale.setScalar(
    0.8 +
    Math.random() * 0.6
  );

  scene.add(tree);

  trees.push(tree);
}


/* =========================
   ROCK
========================= */

function createRock(x, z) {

  const rock =
    new THREE.Mesh(
      new THREE.DodecahedronGeometry(
        0.9,
        0
      ),
      new THREE.MeshStandardMaterial({
        color: 0x77848b
      })
    );

  rock.position.set(
    x,
    0.6,
    z
  );

  scene.add(rock);

  obstacles.push(rock);
}


/* =========================
   SNOWMAN
========================= */

function createSnowman(x, z) {

  const snowman =
    new THREE.Group();


  const material =
    new THREE.MeshStandardMaterial({
      color: 0xffffff
    });


  const body =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.8,
        16,
        16
      ),
      material
    );

  body.position.y = 0.8;

  snowman.add(body);


  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.55,
        16,
        16
      ),
      material
    );

  head.position.y = 1.9;

  snowman.add(head);


  snowman.position.set(
    x,
    0,
    z
  );

  scene.add(snowman);

  obstacles.push(snowman);
}


/* =========================
   GIFT
========================= */

function createGift(x, z) {

  const gift =
    new THREE.Group();


  const box =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
        1,
        1
      ),
      new THREE.MeshStandardMaterial({
        color: 0xff3366
      })
    );

  gift.add(box);


  const ribbonVertical =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.2,
        1.1,
        1.1
      ),
      new THREE.MeshStandardMaterial({
        color: 0xffd21f
      })
    );

  gift.add(ribbonVertical);


  const ribbonHorizontal =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.1,
        0.2,
        1.1
      ),
      new THREE.MeshStandardMaterial({
        color: 0xffd21f
      })
    );

  gift.add(ribbonHorizontal);


  gift.position.set(
    x,
    1,
    z
  );

  scene.add(gift);

  gifts.push(gift);
}


/* =========================
   RANDOM LANE
========================= */

function randomLane() {

  return (
    Math.random() *
    (ROAD_WIDTH - 4) -
    (ROAD_WIDTH - 4) / 2
  );
}


/* =========================
   SPAWN
========================= */

function spawnObjects(delta) {

  spawnTimer += delta;

  giftTimer += delta;


  /* OBSTACLE */

  if (spawnTimer >= 0.9) {

    spawnTimer = 0;

    const x =
      randomLane();

    if (
      Math.random() < 0.55
    ) {

      createRock(
        x,
        -100
      );

    } else {

      createSnowman(
        x,
        -100
      );
    }
  }


  /* GIFTS */

  if (giftTimer >= 1.35) {

    giftTimer = 0;

    createGift(
      randomLane(),
      -125
    );
  }
}


/* =========================
   UPDATE OBJECTS
========================= */

function updateObjects(delta) {

  const movement =
    speed *
    delta *
    60;


  /* OBSTACLES */

  for (
    let i = obstacles.length - 1;
    i >= 0;
    i--
  ) {

    const object =
      obstacles[i];

    object.position.z +=
      movement;


    if (
      object.position.z > 15
    ) {

      scene.remove(object);

      obstacles.splice(
        i,
        1
      );

      score += 5;
    }
  }


  /* GIFTS */

  for (
    let i = gifts.length - 1;
    i >= 0;
    i--
  ) {

    const gift =
      gifts[i];

    gift.position.z +=
      movement;

    gift.rotation.y +=
      delta * 3;


    const dx =
      gift.position.x -
      sled.position.x;

    const dz =
      gift.position.z -
      sled.position.z;


    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );


    if (
      distance < 1.8
    ) {

      giftsCollected++;

      score += 25;

      scene.remove(gift);

      gifts.splice(
        i,
        1
      );

      continue;
    }


    if (
      gift.position.z > 15
    ) {

      scene.remove(gift);

      gifts.splice(
        i,
        1
      );
    }
  }
}


/* =========================
   PLAYER
========================= */

function updatePlayer(delta) {

  playerX +=
    (targetX - playerX) *
    Math.min(
      delta * 10,
      1
    );


  playerX =
    THREE.MathUtils.clamp(
      playerX,
      -6,
      6
    );


  sled.position.x =
    playerX;


  const tilt =
    (targetX - playerX) *
    -0.08;


  sled.rotation.z =
    THREE.MathUtils.lerp(
      sled.rotation.z,
      tilt,
      Math.min(
        delta * 10,
        1
      )
    );


  camera.position.x =
    THREE.MathUtils.lerp(
      camera.position.x,
      playerX * 0.3,
      Math.min(
        delta * 4,
        1
      )
    );


  camera.lookAt(
    playerX * 0.25,
    1,
    -20
  );
}


/* =========================
   COLLISION
========================= */

function checkCollisions() {

  const playerBox =
    new THREE.Box3()
      .setFromObject(sled);


  for (
    const object of obstacles
  ) {

    const objectBox =
      new THREE.Box3()
        .setFromObject(object);


    if (
      playerBox.intersectsBox(
        objectBox
      )
    ) {

      endGame();

      return;
    }
  }
}


/* =========================
   KEYBOARD
========================= */

function moveLeft() {

  if (!gameRunning) return;

  targetX -= 2;

  targetX =
    THREE.MathUtils.clamp(
      targetX,
      -6,
      6
    );
}


function moveRight() {

  if (!gameRunning) return;

  targetX += 2;

  targetX =
    THREE.MathUtils.clamp(
      targetX,
      -6,
      6
    );
}


function handleKeyDown(event) {

  if (!gameRunning) return;


  if (
    event.key === "ArrowLeft" ||
    event.key.toLowerCase() === "a"
  ) {

    event.preventDefault();

    moveLeft();
  }


  if (
    event.key === "ArrowRight" ||
    event.key.toLowerCase() === "d"
  ) {

    event.preventDefault();

    moveRight();
  }
}


/* =========================
   MOBILE CONTROLS
========================= */

function setupMobileControls() {

  const left =
    document.getElementById(
      "leftBtn"
    );

  const right =
    document.getElementById(
      "rightBtn"
    );


  left.addEventListener(
    "pointerdown",
    function(event) {

      event.preventDefault();

      moveLeft();
    }
  );


  right.addEventListener(
    "pointerdown",
    function(event) {

      event.preventDefault();

      moveRight();
    }
  );
}


/* =========================
   START
========================= */

function startGame() {

  clearObjects();


  gameRunning = true;


  score = 0;

  giftsCollected = 0;

  speed = 0.45;

  playerX = 0;

  targetX = 0;

  spawnTimer = 0;

  giftTimer = 0;


  sled.position.set(
    0,
    0,
    5
  );

  sled.rotation.set(
    0,
    0,
    0
  );


  camera.position.set(
    0,
    5.5,
    10
  );


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


  updateHUD();

  clock.start();
}


/* =========================
   RESTART
========================= */

function restartGame() {

  startGame();
}


/* =========================
   GAME OVER
========================= */

function endGame() {

  if (!gameRunning) return;

  gameRunning = false;


  const finalScore =
    Math.floor(score);


  if (
    finalScore > bestScore
  ) {

    bestScore =
      finalScore;

    localStorage.setItem(
      "snowRiderBest",
      String(bestScore)
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
      "bestScore"
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
   CLEAR OBJECTS
========================= */

function clearObjects() {

  for (
    const object of obstacles
  ) {

    scene.remove(object);
  }


  for (
    const gift of gifts
  ) {

    scene.remove(gift);
  }


  obstacles = [];

  gifts = [];
}


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
      "gifts"
    )
    .textContent =
      giftsCollected;


  document
    .getElementById(
      "speed"
    )
    .textContent =
      (speed / 0.45)
        .toFixed(1) +
      "x";
}


/* =========================
   GAME UPDATE
========================= */

function updateGame(delta) {

  score +=
    delta * 4;


  speed +=
    delta * 0.006;


  speed =
    Math.min(
      speed,
      1.5
    );


  updateHUD();
}


/* =========================
   RESIZE
========================= */

function onResize() {

  if (!camera || !renderer) {
    return;
  }


  camera.aspect =
    window.innerWidth /
    window.innerHeight;


  camera.updateProjectionMatrix();


  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
}


/* =========================
   ANIMATION
========================= */

function animate() {

  requestAnimationFrame(
    animate
  );


  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  if (gameRunning) {

    updatePlayer(delta);

    spawnObjects(delta);

    updateObjects(delta);

    updateGame(delta);

    checkCollisions();
  }


  renderer.render(
    scene,
    camera
  );
}


/* =========================
   START ENGINE
========================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

} else {

  init();
}
