let scene;
let camera;
let renderer;
let clock;

let sled;

let gameRunning = false;

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

let bestScore = Number(localStorage.getItem("snowRiderBest")) || 0;

const ROAD_WIDTH = 16;


/* =========================
   INIT
========================= */

function init() {

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0xbfe9ff);

  scene.fog = new THREE.Fog(
    0xbfe9ff,
    40,
    180
  );

  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  camera.position.set(0, 5, 10);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  document
    .getElementById("game")
    .appendChild(renderer.domElement);


  /* LIGHT */

  const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x8bb5c7,
    1.6
  );

  scene.add(ambient);


  const sun = new THREE.DirectionalLight(
    0xffffff,
    2
  );

  sun.position.set(30, 50, 20);

  scene.add(sun);


  /* WORLD */

  createSnowGround();
  createMountains();

  createSled();


  /* TREES */

  for (let i = 0; i < 30; i++) {

    createTree(
      randomLane(),
      -10 - Math.random() * 170
    );

  }


  /* EVENTS */

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
   SNOW
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

  ground.position.y = -0.4;

  ground.position.z = -180;

  scene.add(ground);
}


/* =========================
   MOUNTAINS
========================= */

function createMountains() {

  for (let i = 0; i < 14; i++) {

    const height =
      15 + Math.random() * 20;

    const geometry =
      new THREE.ConeGeometry(
        10 + Math.random() * 8,
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

    mountain.position.set(
      i % 2 === 0 ? -30 : 30,
      height / 2 - 1,
      -20 - Math.random() * 180
    );

    scene.add(mountain);
  }
}


/* =========================
   SLED
========================= */

function createSled() {

  sled = new THREE.Group();


  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.8,
        0.35,
        3.2
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd71920
      })
    );

  body.position.y = 0.45;

  sled.add(body);


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


  const runnerMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x222222
    });


  [-0.65, 0.65].forEach(x => {

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

  });


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
          1.5 - i * 0.25,
          2.4,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x1d8c57
        })
      );

    leaves.position.y =
      2.4 + i * 1.2;

    tree.add(leaves);
  }


  tree.position.set(
    x,
    0,
    z
  );

  tree.scale.setScalar(
    0.8 + Math.random() * 0.6
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


  const ribbon =
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

  gift.add(ribbon);


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
    Math.random() * 12 - 6
  );
}


/* =========================
   SPAWN
========================= */

function spawnObjects(delta) {

  spawnTimer += delta;

  giftTimer += delta;


  if (spawnTimer >= 1) {

    spawnTimer = 0;

    const x = randomLane();

    if (Math.random() < 0.5) {

      createRock(
        x,
        -120
      );

    } else {

      createSnowman(
        x,
        -120
      );

    }
  }


  if (giftTimer >= 1.5) {

    giftTimer = 0;

    createGift(
      randomLane(),
      -140
    );
  }
}


/* =========================
   UPDATE OBJECTS
========================= */

function updateObjects(delta) {

  const movement =
    speed * delta * 60;


  /* OBSTACLES */

  for (
    let i = obstacles.length - 1;
    i >= 0;
    i--
  ) {

    const object =
      obstacles[i];

    object.position.z += movement;


    if (
      object.position.z > 15
    ) {

      scene.remove(object);

      obstacles.splice(i, 1);

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

    gift.position.z += movement;

    gift.rotation.y +=
      delta * 3;


    const distance =
      gift.position.distanceTo(
        sled.position
      );


    if (distance < 2) {

      giftsCollected++;

      score += 25;

      scene.remove(gift);

      gifts.splice(i, 1);

      continue;
    }


    if (
      gift.position.z > 15
    ) {

      scene.remove(gift);

      gifts.splice(i, 1);
    }
  }
}


/* =========================
   PLAYER
========================= */

function updatePlayer(delta) {

  playerX +=
    (targetX - playerX) *
    Math.min(delta * 8, 1);


  playerX =
    THREE.MathUtils.clamp(
      playerX,
      -6,
      6
    );


  sled.position.x =
    playerX;


  sled.rotation.z =
    THREE.MathUtils.lerp(
      sled.rotation.z,
      (targetX - playerX) * -0.08,
      delta * 8
    );


  camera.position.x =
    THREE.MathUtils.lerp(
      camera.position.x,
      playerX * 0.3,
      delta * 3
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


  for (const object of obstacles) {

    const objectBox =
      new THREE.Box3()
        .setFromObject(object);


    if (
      playerBox.intersectsBox(
        objectBox
      )
    ) {

      endGame();

      break;
    }
  }
}


/* =========================
   KEYBOARD
========================= */

function handleKeyDown(event) {

  if (!gameRunning) return;


  if (
    event.key === "ArrowLeft" ||
    event.key.toLowerCase() === "a"
  ) {

    targetX -= 2;
  }


  if (
    event.key === "ArrowRight" ||
    event.key.toLowerCase() === "d"
  ) {

    targetX += 2;
  }


  targetX =
    THREE.MathUtils.clamp(
      targetX,
      -6,
      6
    );
}


/* =========================
   MOBILE
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
    "touchstart",
    function(e) {

      e.preventDefault();

      if (!gameRunning) return;

      targetX -= 2;

      targetX =
        THREE.MathUtils.clamp(
          targetX,
          -6,
          6
        );
    },
    { passive: false }
  );


  right.addEventListener(
    "touchstart",
    function(e) {

      e.preventDefault();

      if (!gameRunning) return;

      targetX += 2;

      targetX =
        THREE.MathUtils.clamp(
          targetX,
          -6,
          6
        );
    },
    { passive: false }
  );
}


/* =========================
   START
========================= */

function startGame() {

  document
    .getElementById("startScreen")
    .classList.add("hidden");


  document
    .getElementById("gameOver")
    .classList.add("hidden");


  gameRunning = true;


  score = 0;

  giftsCollected = 0;

  speed = 0.45;

  playerX = 0;

  targetX = 0;

  spawnTimer = 0;

  giftTimer = 0;


  updateHUD();
}


/* =========================
   RESTART
========================= */

function restartGame() {

  clearObjects();

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
      bestScore
    );
  }


  document
    .getElementById("finalScore")
    .textContent =
      finalScore;


  document
    .getElementById("bestScore")
    .textContent =
      bestScore;


  document
    .getElementById("gameOver")
    .classList.remove("hidden");
}


/* =========================
   CLEAR
========================= */

function clearObjects() {

  obstacles.forEach(
    object => scene.remove(object)
  );

  gifts.forEach(
    gift => scene.remove(gift)
  );


  obstacles = [];

  gifts = [];
}


/* =========================
   HUD
========================= */

function updateHUD() {

  document
    .getElementById("score")
    .textContent =
      Math.floor(score);


  document
    .getElementById("gifts")
    .textContent =
      giftsCollected;


  document
    .getElementById("speed")
    .textContent =
      (speed / 0.45).toFixed(1) + "x";
}


/* =========================
   GAME UPDATE
========================= */

function updateGame(delta) {

  score += delta * 4;


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
   START GAME ENGINE
========================= */

init();
