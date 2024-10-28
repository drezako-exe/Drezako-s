let player;
let terrain = new Map();
let trees = new Map();
let enemies = new Map();
let collectibles = new Map();

function setup() {
  createCanvas(800, 600, WEBGL);
  player = createVector(0, 0, 0);
  generateChunk(0, 0);
}

function draw() {
  background(135, 206, 235);
  orbitControl();
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  ambientLight(150);

  let chunkSize = 400;
  let currentChunkX = floor(player.x / chunkSize) * chunkSize;
  let currentChunkZ = floor(player.z / chunkSize) * chunkSize;

  renderWater();

  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      let chunkX = currentChunkX + i * chunkSize;
      let chunkZ = currentChunkZ + j * chunkSize;
      if (!terrain.has(`${chunkX},${chunkZ}`)) {
        generateChunk(chunkX, chunkZ);
      }
      renderChunk(chunkX, chunkZ);
    }
  }

  renderTrees();
  renderEnemies();
  renderCollectibles();
  movePlayer();
  renderPlayer();
}

function renderWater() {
  push();
  fill(0, 0, 255, 100); // Azul com transparência para simular a água
  translate(0, 200, 0);
  box(4000, 20, 4000);
  pop();
}

function renderTrees() {
  for (let [key, treePositions] of trees) {
    for (let tree of treePositions) {
      let { x, y, z } = tree;
      push();
      fill(139, 69, 19);
      translate(x, y - 40, z);
      box(20, 80, 20);
      fill(34, 139, 34);
      translate(0, -60, 0);
      sphere(50);
      pop();
    }
  }
}

function renderEnemies() {
  for (let [key, enemyPositions] of enemies) {
    for (let enemy of enemyPositions) {
      let { x, y, z } = enemy;
      push();
      fill(255, 0, 0);
      translate(x, y - 20, z);
      sphere(20);
      pop();
    }
  }
}

function renderCollectibles() {
  for (let [key, collectiblePositions] of collectibles) {
    for (let collectible of collectiblePositions) {
      let { x, y, z } = collectible;
      push();
      fill(255, 215, 0);
      translate(x, y - 10, z);
      box(20, 20, 20);
      pop();
    }
  }
}

function movePlayer() {
  let stepSize = 5;
  if (keyIsDown(UP_ARROW)) player.z -= stepSize;
  if (keyIsDown(DOWN_ARROW)) player.z += stepSize;
  if (keyIsDown(LEFT_ARROW)) player.x -= stepSize;
  if (keyIsDown(RIGHT_ARROW)) player.x += stepSize;
  player.y = -getHeight(player.x, player.z) / 2 + 100;
}

function renderPlayer() {
  push();
  fill(0, 0, 255);
  translate(player.x, player.y, player.z);
  rotateX(HALF_PI);
  rotateZ(PI);
  beginShape();
  vertex(0, -20);
  vertex(20, 20);
  vertex(-20, 20);
  endShape(CLOSE);
  pop();
}

function generateChunk(chunkX, chunkZ) {
  let chunkSize = 400;
  let rows = [];
  let treePositions = [];
  let enemyPositions = [];
  let collectiblePositions = [];

  for (let i = 0; i < chunkSize / 40; i++) {
    let row = [];
    for (let j = 0; j < chunkSize / 40; j++) {
      let x = chunkX + i * 40;
      let z = chunkZ + j * 40;

      // Cálculo da distância do centro
      let distanceToCenter = dist(chunkX + chunkSize / 2, chunkZ + chunkSize / 2, x, z);
      let maxDistance = chunkSize * 4;

      // Ajuste da altura para criar uma variedade de terreno
      let h = map(noise(x * 0.005, z * 0.005), 0, 1, 50, 200);
      h *= map(distanceToCenter, 0, maxDistance, 1.5, 0);

      // Adicionando variações de bioma
      let biome = noise(x * 0.01, z * 0.01);
      if (biome > 0.7) {
        h *= 1.5; // Montanhas
      } else if (biome < 0.3) {
        h *= 0.5; // Planícies
      }

      row.push(h);
      if (random() < 0.1 && h > 80) {
        treePositions.push({ x: x, y: -h / 2 + 100, z: z });
      }
      if (random() < 0.05) {
        enemyPositions.push({ x: x, y: -h / 2 + 100, z: z });
      }
      if (random() < 0.02) {
        collectiblePositions.push({ x: x, y: -h / 2 + 100, z: z });
      }
    }
    rows.push(row);
  }
  terrain.set(`${chunkX},${chunkZ}`, rows);
  trees.set(`${chunkX},${chunkZ}`, treePositions);
  enemies.set(`${chunkX},${chunkZ}`, enemyPositions);
  collectibles.set(`${chunkX},${chunkZ}`, collectiblePositions);
}

function renderChunk(chunkX, chunkZ) {
  let rows = terrain.get(`${chunkX},${chunkZ}`);
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      let x = chunkX + i * 40;
      let z = chunkZ + j * 40;
      let y = rows[i][j];
      push();
      fill(150, 100, 50);
      translate(x, -y / 2 + 100, z);
      box(40, y, 40);
      pop();
    }
  }
}

function getHeight(x, z) {
  let chunkSize = 400;
  let chunkX = floor(x / chunkSize) * chunkSize;
  let chunkZ = floor(z / chunkSize) * chunkSize;
  if (terrain.has(`${chunkX},${chunkZ}`)) {
    let rows = terrain.get(`${chunkX},${chunkZ}`);
    let i = floor((x - chunkX) / 40);
    let j = floor((z - chunkZ) / 40);
    if (i >= 0 && i < rows.length && j >= 0 && j < rows[i].length) {
      return rows[i][j];
    }
  }
  return 0;
}

