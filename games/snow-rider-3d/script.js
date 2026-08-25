/* =========================================================
   SNOW RIDER 3D
   Gameso
========================================================= */

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

let roadSegments = [];

let spawnTimer = 0;
let giftTimer = 0;

let bestScore = Number(localStorage.getItem("snowRiderBest")) || 0;

/* Game dimensions */

const ROAD_WIDTH = 16;
const ROAD_LENGTH = 180;

/* =========================================================
   INITIALIZE
========================================================= */

function init() {

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0xbfe9ff);

  scene.fog = new THREE.Fog(
    0xbfe9ff,
    45,
    190
  );

  clock = new THREE.Clock();

  /* Camera */

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  camera.position.set(
    0,
    5.5,
    10
  );

  camera.lookAt(
    0,
    1,
    -20
  );

  /* Renderer */

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

  renderer.shadowMap.enabled = true;

  document
    .getElementById("game")
    .appendChild(renderer.domElement);

  /* Lighting */

  const ambientLight =
    new THREE.HemisphereLight(
      0xffffff,
      0x8bb5c7,
      1.5
    );

  scene.add(ambientLight);

  const sun =
    new THREE.DirectionalLight(
      0xffffff,
      1.8
    );

  sun.position.set(
    30,
    50,
    20
  );

  sun.castShadow = true;

  scene.add(sun);

  /* World */

  createSnowGround();
  createMountains();

  /* Player */

  createSled();

  /* Initial trees */

  for (let i = 0; i < 35; i++) {
    createTree(
      randomLane(),
      -10 - Math.random() * 170
    );
  }

  /* Events */

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

  animate();
}


/* =========================================================
   SNOW GROUND
========================================================= */

function createSnowGround() {

  const geometry =
    new THREE.PlaneGeometry(
      150,
      500
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xf7fbff,
      roughness: 0.95
    });

  const ground =
    new THREE.Mesh(
      geometry,
      material
    );

  ground.rotation.x =
    -Math.PI / 2;

  ground.position.y = -0.35;

  ground.position.z = -180;

  ground.receiveShadow = true;

  scene.add(ground);

}


/* =========================================================
   MOUNTAINS
========================================================= */

function createMountains() {

  for (let i = 0; i < 12; i++) {

    const height =
      15 + Math.random() * 18;

    const radius =
      10 + Math.random() * 8;

    const geometry =
      new THREE.ConeGeometry(
        radius,
        height,
        8
      );

    const material =
      new THREE.MeshStandardMaterial({
        color: 0xd9eff8,
        roughness: 1
      });

    const mountain =
      new THREE.Mesh(
        geometry,
        material
      );

    mountain.position.set(
      (Math.random() < 0.5 ? -1 : 1) *
        (25 + Math.random() * 25),

      height / 2 - 1,

      -20 - Math.random() * 180
    );

    scene.add(mountain);
  }
}


/* =========================================================
   SLED
========================================================= */

function createSled() {

  sled = new THREE.Group();

  /* Sled body */

  const bodyGeometry =
    new THREE.BoxGeometry(
      1.8,
      0.35,
      3.2
    );

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd71920,
      roughness: 0.4
    });

  const body =
    new THREE.Mesh(
      bodyGeometry,
      bodyMaterial
    );

  body.position.y = 0.45;

  body.castShadow = true;

  sled.add(body);


  /* Seat */

  const seatGeometry =
    new THREE.BoxGeometry(
      1.4,
      0.25,
      1.4
    );

  const seatMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x242424
    });

  const seat =
    new THREE.Mesh(
      seatGeometry,
      seatMaterial
    );

  seat.position.y = 0.75;
  seat.position.z = 0.25;

  sled.add(seat);


  /* Front nose */

  const noseGeometry =
    new THREE.ConeGeometry(
      0.9,
      1.2,
      4
    );

  const noseMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xf22d36
    });

  const nose =
    new THREE.Mesh(
      noseGeometry,
      noseMaterial
    );

  nose.rotation.x =
    Math.PI / 2;

  nose.rotation.z =
    Math.PI / 4;

  nose.position.y = 0.45;
  nose.position.z = -1.9;

  sled.add(nose);


  /* Runners */

  const runnerMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.5,
      roughness: 0.3
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


/* =========================================================
   TREES
========================================================= */

function createTree(x, z) {

  const tree =
    new THREE.Group();

  /* Trunk */

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


  /* Leaves */

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


/* =========================================================
   ROCK
========================================================= */

function createRock(x, z) {

  const geometry =
    new THREE.DodecahedronGeometry(
      0.9,
      0
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x77848b,
      roughness: 1
    });

  const rock =
    new THREE.Mesh(
      geometry,
      material
    );

  rock.position.set(
    x,
    0.6,
    z
  );

  rock.scale.set(
    1.2,
    0.8,
    1
  );

  rock.castShadow = true;

  scene.add(rock);

  obstacles.push(rock);
}


/* =========================================================
   SNOWMAN
========================================================= */

function createSnowman(x, z) {

  const snowman =
    new THREE.Group();

  const white =
    new THREE.MeshStandardMaterial({
      color: 0xffffff
    });

  /* Body */

  const body =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.8,
        16,
        16
      ),
      white
    );

  body.position.y = 0.8;

  snowman.add(body);


  /* Head */

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.55,
        16,
        16
      ),
      white
    );

  head.position.y = 1.9;

  snowman.add(head);


  /* Nose */

  const nose =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        0.12,
        0.6,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0xff7a00
      })
    );

  nose.rotation.z =
    -Math.PI / 2;

  nose.position.set(
    0,
    1.9,
    -0.55
  );

  snowman.add(nose);


  snowman.position.set(
    x,
    0,
    z
  );

  scene.add(snowman);

  obstacles.push(snowman);
}


/* =========================================================
   GIFT
========================================================= */

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
        0.18,
        1.05,
        1.05
      ),
      new THREE.MeshStandardMaterial({
        color: 0xffd21f
      })
    );

  gift.add(ribbon);


  const ribbon2 =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.05,
        1.05,
        0.18
      ),
      new THREE.MeshStandardMaterial({
        color: 0xffd21f
      })
    );

  gift.add(ribbon2);


  gift.position.set(
    x,
    1,
    z
  );

  scene.add(gift);

  gifts.push(gift);
}


/* =========================================================
   RANDOM LANE
========================================================= */

function randomLane() {

  return (
    Math.random() *
      (ROAD_WIDTH - 3) -
    (ROAD_WIDTH - 3) / 2
  );
}


/* =========================================================
   SPAWN OBJECTS
========================================================= */

function spawnObjects(delta) {

  spawnTimer += delta;
  giftTimer += delta;

  /* Obstacles */

  if (spawnTimer > 0.8) {

    spawnTimer = 0;

    const x =
      randomLane();

    const type =
      Math.random();

    if (type < 0.5) {

      createRock(
        x,
        -150
      );

    } else {

      createSnowman(
        x,
        -150
      );
    }
  }


  /* Gifts */

  if (giftTimer > 1.3) {

    giftTimer = 0;

    createGift(
      randomLane(),
      -160
    );
  }
}


/* =========================================================
   UPDATE OBJECTS
========================================================= */

function updateObjects(delta) {

  const movement =
    speed * delta * 60;


  /* Obstacles */

  for (let i = obstacles.length - 1; i >= 0; i--) {

    const object =
      obstacles[i];

    object.position.z += movement;

    object.rotation.y +=
      delta * 0.5;


    if (
      object.position.z > 15
    ) {

      scene.remove(object);

      obstacles.splice(i, 1);

      score += 5;
    }
  }


  /* Gifts */

  for (let i = gifts.length - 1; i >= 0; i--) {

    const gift =
      gifts[i];

    gift.position.z += movement;

    gift.rotation.y +=
      delta * 3;

    gift.position.y =
      1 + Math.sin(
        performance.now() * 0.004
      ) * 0.2;


    /* Gift collision */

    const distance =
      gift.position.distanceTo(
        sled.position
      );

    if (distance < 2.2) {

      giftsCollected++;

      score += 25;

      updateHUD();

      scene.remove(gift);

      gifts.splice(i);

      continue;
    }


    if (
      gift.position.z > 15
    ) {

      scene.remove(gift);

      gifts.splice(i);
    }
  }
}


/* =========================================================
   COLLISION
========================================================= */

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

      return;
    }
  }
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

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

  /* Tilt sled */

  const tilt =
    (targetX - playerX) * -0.08;

  sled.rotation.z =
    THREE.MathUtils.lerp(
      sled.rotation.z,
      tilt,
      delta * 8
    );

  /* Camera follows */

  camera.position.x =
    THREE.MathUtils.lerp(
      camera.position.x,
      playerX * 0.35,
      delta * 3
    );

  camera.lookAt(
    playerX * 0.25,
    1,
    -20
  );
}


/* =========================================================
   KEYBOARD
========================================================= */

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


/* =========================================================
   MOBILE CONTROLS
========================================================= */

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
    e => {

      e.preventDefault();

      targetX -= 2;

      targetX =
        THREE.MathUtils.clamp(
          targetX,
          -6,
          6
        );

    }
  );


  right.addEventListener(
    "touchstart",
    e => {

      e.preventDefault();

      targetX += 2;

      targetX =
        THREE.MathUtils.clamp(
          targetX,
          -6,
          6
        );

    }
  );
}


/* =========================================================
   GAME START
========================================================= */

function startGame() {

  document
    .getElementById(
      "startScreen"
    )
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


/* =========================================================
   RESTART
========================================================= */

function restartGame() {

  clearObjects();

  document
    .getElementById(
      "gameOver"
    )
    .classList.add("hidden");

  startGame();
}


/* =========================================================
   END GAME
========================================================= */

function endGame() {

  gameRunning = false;

  const final =
    Math.floor(score);

  if (final > bestScore) {

    bestScore = final;

    localStorage.setItem(
      "snowRiderBest",
      bestScore
    );
  }

  document
    .getElementById(
      "finalScore"
    )
    .textContent = final;

  document
    .getElementById(
      "bestScore"
    )
    .textContent = bestScore;

  document
    .getElementById(
      "gameOver"
    )
    .classList.remove("hidden");
}


/* =========================================================
   CLEAR OBJECTS
========================================================= */

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


/* =========================================================
   SCORE / SPEED
========================================================= */

function updateGame(delta) {

  score += delta * 4;

  /* Increase speed */

  speed +=
    delta * 0.006;

  speed =
    Math.min(
      speed,
      1.5
    );

  updateHUD();
}


/* =========================================================
   HUD
========================================================= */

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
      (speed / 0.45).toFixed(1) + "x";
}


/* =========================================================
   RESIZE
========================================================= */

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


/* =========================================================
   MAIN LOOP
========================================================= */

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


/* =========================================================
   START
========================================================= */

init();
