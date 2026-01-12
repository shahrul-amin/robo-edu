// ============================================
// Interactive Grid Demo (for interactive.html)
// ============================================
const GRID_SIZE = 20;
const CELL_SIZE = 30;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

const CELL_EMPTY = 0;
const CELL_OBSTACLE = 1;
const CELL_START = 2;
const CELL_GOAL = 3;
const CELL_PATH = 4;
const CELL_EXPLORED = 5;
const CELL_GRASS = 6;
const CELL_MUD = 7;
const CELL_WATER = 8;

const MODE_NONE = 0;
const MODE_SET_START = 1;
const MODE_SET_GOAL = 2;
const MODE_TOGGLE_OBSTACLES = 3;
const MODE_SET_GRASS = 4;
const MODE_SET_MUD = 5;
const MODE_SET_WATER = 6;

let canvas;
let ctx;
let grid = [];
let terrainGrid = [];
let startPos = null;
let goalPos = null;
let currentMode = MODE_NONE;
let isMouseDown = false;
let currentLevel = 'junior';
let gridSize = 15;
let cellSize = 40;
let terrainEnabled = false;
let animationSpeed = 5;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('grid-canvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }
  ctx = canvas.getContext('2d');
  console.log('Canvas found:', canvas);
  console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
  console.log('Context:', ctx);
  
  gridSize = 15;
  cellSize = 40;
  canvas.width = gridSize * cellSize;
  canvas.height = gridSize * cellSize;
  
  initializeGrid();
  renderGrid();
  setupLevelSelector();
  setupEventListeners();
  setLevel('junior');
});

function setupLevelSelector() {
  const levelButtons = document.querySelectorAll('.level-btn');
  console.log('Level buttons found:', levelButtons.length);
  levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const level = btn.getAttribute('data-level');
      console.log('Level button clicked:', level);
      setLevel(level);
      levelButtons.forEach(b => b.classList.remove('level-btn--active'));
      btn.classList.add('level-btn--active');
    });
  });
}

function setLevel(level) {
  console.log('setLevel called with:', level);
  currentLevel = level;
  
  const algorithmSelect = document.getElementById('algorithm-select');
  const speedControl = document.getElementById('speed-control');
  const terrainToggle = document.getElementById('terrain-toggle');
  const terrainButtons = document.getElementById('terrain-buttons');
  const challengeButtons = document.getElementById('challenge-buttons');
  
  console.log('Elements found:', {
    algorithmSelect: !!algorithmSelect,
    speedControl: !!speedControl,
    terrainToggle: !!terrainToggle,
    terrainButtons: !!terrainButtons,
    challengeButtons: !!challengeButtons
  });
  
  if (level === 'junior') {
    gridSize = 15;
    cellSize = 40;
    terrainEnabled = false;
    if (algorithmSelect) algorithmSelect.style.display = 'none';
    if (speedControl) speedControl.style.display = 'none';
    if (terrainToggle) terrainToggle.style.display = 'none';
    if (terrainButtons) terrainButtons.style.display = 'none';
    if (challengeButtons) challengeButtons.style.display = 'block';
    updateInstructions('junior');
  } else if (level === 'highschool') {
    gridSize = 20;
    cellSize = 30;
    terrainEnabled = false;
    if (algorithmSelect) algorithmSelect.style.display = 'inline-block';
    if (speedControl) speedControl.style.display = 'flex';
    if (terrainToggle) terrainToggle.style.display = 'none';
    if (terrainButtons) terrainButtons.style.display = 'none';
    if (challengeButtons) challengeButtons.style.display = 'none';
    updateInstructions('highschool');
  } else if (level === 'undergraduate') {
    gridSize = 30;
    cellSize = 20;
    terrainEnabled = false;
    if (algorithmSelect) algorithmSelect.style.display = 'inline-block';
    if (speedControl) speedControl.style.display = 'flex';
    if (terrainToggle) terrainToggle.style.display = 'block';
    if (challengeButtons) challengeButtons.style.display = 'none';
    updateInstructions('undergraduate');
  }
  
  console.log('Setting canvas size:', gridSize * cellSize);
  canvas.width = gridSize * cellSize;
  canvas.height = gridSize * cellSize;
  console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
  initializeGrid();
  console.log('Grid initialized with size:', gridSize);
  renderGrid();
  console.log('Grid initialized and rendered');
}

function updateInstructions(level) {
  const instructionCards = document.querySelectorAll('#instructions-section .card');
  
  if (instructionCards.length < 4) return;
  
  if (level === 'junior') {
    instructionCards[0].querySelector('.card__title').textContent = '🚀 Place Your Robot';
    instructionCards[0].querySelector('.card__text').textContent = 'Click the button with the rocket, then click on the grid to put your robot there!';
    instructionCards[1].querySelector('.card__title').textContent = '🎯 Choose Your Target';
    instructionCards[1].querySelector('.card__text').textContent = 'Click the target button, then click where you want your robot to go!';
    instructionCards[2].querySelector('.card__title').textContent = '🧱 Add Walls';
    instructionCards[2].querySelector('.card__text').textContent = 'Click the wall button, then draw walls by clicking on the grid!';
    instructionCards[3].querySelector('.card__title').textContent = '✨ Find the Path';
    instructionCards[3].querySelector('.card__text').textContent = 'Press Find Path and watch your robot find the best way to reach the target!';
  } else if (level === 'highschool') {
    instructionCards[0].querySelector('.card__title').textContent = 'Set Start Point';
    instructionCards[0].querySelector('.card__text').textContent = 'Click the Set Start button, then select a position on the grid for the starting location.';
    instructionCards[1].querySelector('.card__title').textContent = 'Set Goal Point';
    instructionCards[1].querySelector('.card__text').textContent = 'Click the Set Goal button, then select the target destination on the grid.';
    instructionCards[2].querySelector('.card__title').textContent = 'Add Obstacles';
    instructionCards[2].querySelector('.card__text').textContent = 'Click Toggle Obstacles, then click cells to create barriers. Compare how different algorithms handle obstacles.';
    instructionCards[3].querySelector('.card__title').textContent = 'Compare Algorithms';
    instructionCards[3].querySelector('.card__text').textContent = 'Select different algorithms and observe their search patterns, path lengths, and explored cells.';
  } else {
    instructionCards[0].querySelector('.card__title').textContent = 'Configure Start & Goal';
    instructionCards[0].querySelector('.card__text').textContent = 'Set start and goal positions, considering optimal placement for complex scenarios.';
    instructionCards[1].querySelector('.card__title').textContent = 'Design Environment';
    instructionCards[1].querySelector('.card__text').textContent = 'Add obstacles and terrain types with varying traversal costs for realistic simulations.';
    instructionCards[2].querySelector('.card__title').textContent = 'Enable Terrain Costs';
    instructionCards[2].querySelector('.card__text').textContent = 'Activate weighted terrain to see how algorithms handle non-uniform movement costs.';
    instructionCards[3].querySelector('.card__title').textContent = 'Analyze Results';
    instructionCards[3].querySelector('.card__text').textContent = 'Compare path optimality, computational complexity, and algorithm efficiency metrics.';
  }
}

function initializeGrid() {
  console.log('initializeGrid called, gridSize:', gridSize);
  grid = [];
  terrainGrid = [];
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    terrainGrid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      grid[y][x] = CELL_EMPTY;
      terrainGrid[y][x] = CELL_EMPTY;
    }
  }
  const startX = Math.floor(gridSize * 0.15);
  const startY = Math.floor(gridSize * 0.15);
  const goalX = Math.floor(gridSize * 0.85);
  const goalY = Math.floor(gridSize * 0.85);
  
  startPos = { x: startX, y: startY };
  goalPos = { x: goalX, y: goalY };
  grid[startPos.y][startPos.x] = CELL_START;
  grid[goalPos.y][goalPos.x] = CELL_GOAL;
  console.log('Grid initialized. Start:', startPos, 'Goal:', goalPos);
  console.log('Sample grid cells:', grid[0][0], grid[startPos.y][startPos.x], grid[goalPos.y][goalPos.x]);
}

function setupEventListeners() {
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
  
  document.getElementById('btn-set-start').addEventListener('click', () => {
    currentMode = MODE_SET_START;
    updateButtonStates();
  });
  
  document.getElementById('btn-set-goal').addEventListener('click', () => {
    currentMode = MODE_SET_GOAL;
    updateButtonStates();
  });
  
  document.getElementById('btn-toggle-obstacles').addEventListener('click', () => {
    currentMode = MODE_TOGGLE_OBSTACLES;
    updateButtonStates();
  });
  
  document.getElementById('btn-find-path').addEventListener('click', findPath);
  document.getElementById('btn-clear-path').addEventListener('click', clearPath);
  document.getElementById('btn-clear-grid').addEventListener('click', clearGrid);
  document.getElementById('btn-random-obstacles').addEventListener('click', generateRandomObstacles);
  
  const terrainToggle = document.getElementById('btn-toggle-terrain');
  if (terrainToggle) {
    terrainToggle.addEventListener('click', toggleTerrain);
  }
  
  const grassBtn = document.getElementById('btn-set-grass');
  const mudBtn = document.getElementById('btn-set-mud');
  const waterBtn = document.getElementById('btn-set-water');
  
  if (grassBtn) grassBtn.addEventListener('click', () => { currentMode = MODE_SET_GRASS; updateButtonStates(); });
  if (mudBtn) mudBtn.addEventListener('click', () => { currentMode = MODE_SET_MUD; updateButtonStates(); });
  if (waterBtn) waterBtn.addEventListener('click', () => { currentMode = MODE_SET_WATER; updateButtonStates(); });
  
  const challengeSelect = document.getElementById('challenge-select');
  if (challengeSelect) {
    challengeSelect.addEventListener('change', (e) => {
      const challengeNum = parseInt(e.target.value);
      if (challengeNum) {
        loadChallenge(challengeNum);
      }
    });
  }
  
  const speedSlider = document.getElementById('speed-slider');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      animationSpeed = parseInt(e.target.value);
    });
  }
}

function toggleTerrain() {
  terrainEnabled = !terrainEnabled;
  const btn = document.getElementById('btn-toggle-terrain');
  const terrainButtons = document.getElementById('terrain-buttons');
  
  if (terrainEnabled) {
    btn.textContent = 'Disable Terrain Costs';
    btn.classList.add('btn--primary');
    btn.classList.remove('btn--secondary');
    terrainButtons.style.display = 'block';
    document.getElementById('legend-grass').style.display = 'flex';
    document.getElementById('legend-mud').style.display = 'flex';
    document.getElementById('legend-water').style.display = 'flex';
  } else {
    btn.textContent = 'Enable Terrain Costs';
    btn.classList.remove('btn--primary');
    btn.classList.add('btn--secondary');
    terrainButtons.style.display = 'none';
    document.getElementById('legend-grass').style.display = 'none';
    document.getElementById('legend-mud').style.display = 'none';
    document.getElementById('legend-water').style.display = 'none';
    clearTerrainFromGrid();
  }
}

function clearTerrainFromGrid() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x] >= CELL_GRASS) {
        grid[y][x] = CELL_EMPTY;
      }
    }
  }
  renderGrid();
}

function loadChallenge(num) {
  clearGrid();
  
  if (num === 1) {
    for (let x = 5; x < 10; x++) {
      if (x !== 7) grid[7][x] = CELL_OBSTACLE;
    }
  } else if (num === 2) {
    for (let y = 3; y < 12; y++) {
      if (y !== 7) grid[y][7] = CELL_OBSTACLE;
    }
    for (let x = 3; x < 10; x++) {
      if (x !== 7) grid[7][x] = CELL_OBSTACLE;
    }
  } else if (num === 3) {
    for (let i = 0; i < gridSize - 4; i += 2) {
      for (let j = 2; j < gridSize - 2; j++) {
        if ((i / 2) % 2 === 0) {
          if (j < gridSize - 4) grid[j][i + 2] = CELL_OBSTACLE;
        } else {
          if (j > 3) grid[j][i + 2] = CELL_OBSTACLE;
        }
      }
    }
  }
  
  // Re-set start and goal positions after loading challenge
  grid[startPos.y][startPos.x] = CELL_START;
  grid[goalPos.y][goalPos.x] = CELL_GOAL;
  
  renderGrid();
}

function updateButtonStates() {
  const buttons = [
    document.getElementById('btn-set-start'),
    document.getElementById('btn-set-goal'),
    document.getElementById('btn-toggle-obstacles')
  ];
  
  buttons.forEach(btn => {
    btn.classList.remove('btn--primary');
    btn.classList.add('btn--secondary');
  });
  
  if (currentMode === MODE_SET_START) {
    buttons[0].classList.remove('btn--secondary');
    buttons[0].classList.add('btn--primary');
  } else if (currentMode === MODE_SET_GOAL) {
    buttons[1].classList.remove('btn--secondary');
    buttons[1].classList.add('btn--primary');
  } else if (currentMode === MODE_TOGGLE_OBSTACLES) {
    buttons[2].classList.remove('btn--secondary');
    buttons[2].classList.add('btn--primary');
  }
}

function handleMouseDown(e) {
  isMouseDown = true;
  handleCanvasClick(e);
}

function handleMouseMove(e) {
  if (isMouseDown && (currentMode === MODE_TOGGLE_OBSTACLES || currentMode >= MODE_SET_GRASS)) {
    handleCanvasClick(e);
  }
}

function handleMouseUp() {
  isMouseDown = false;
}

function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX / cellSize);
  const y = Math.floor((e.clientY - rect.top) * scaleY / cellSize);
  
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
  
  if (currentMode === MODE_SET_START) {
    if (grid[y][x] !== CELL_GOAL) {
      if (startPos) {
        grid[startPos.y][startPos.x] = CELL_EMPTY;
      }
      startPos = { x, y };
      grid[y][x] = CELL_START;
      currentMode = MODE_NONE;
      updateButtonStates();
      renderGrid();
    }
  } else if (currentMode === MODE_SET_GOAL) {
    if (grid[y][x] !== CELL_START) {
      if (goalPos) {
        grid[goalPos.y][goalPos.x] = CELL_EMPTY;
      }
      goalPos = { x, y };
      grid[y][x] = CELL_GOAL;
      currentMode = MODE_NONE;
      updateButtonStates();
      renderGrid();
    }
  } else if (currentMode === MODE_TOGGLE_OBSTACLES) {
    if (grid[y][x] !== CELL_START && grid[y][x] !== CELL_GOAL) {
      grid[y][x] = grid[y][x] === CELL_OBSTACLE ? CELL_EMPTY : CELL_OBSTACLE;
      renderGrid();
    }
  } else if (currentMode === MODE_SET_GRASS) {
    if (grid[y][x] !== CELL_START && grid[y][x] !== CELL_GOAL && grid[y][x] !== CELL_OBSTACLE) {
      terrainGrid[y][x] = CELL_GRASS;
      if (grid[y][x] === CELL_EMPTY) {
        grid[y][x] = CELL_GRASS;
      }
      renderGrid();
    }
  } else if (currentMode === MODE_SET_MUD) {
    if (grid[y][x] !== CELL_START && grid[y][x] !== CELL_GOAL && grid[y][x] !== CELL_OBSTACLE) {
      terrainGrid[y][x] = CELL_MUD;
      if (grid[y][x] === CELL_EMPTY) {
        grid[y][x] = CELL_MUD;
      }
      renderGrid();
    }
  } else if (currentMode === MODE_SET_WATER) {
    if (grid[y][x] !== CELL_START && grid[y][x] !== CELL_GOAL && grid[y][x] !== CELL_OBSTACLE) {
      terrainGrid[y][x] = CELL_WATER;
      if (grid[y][x] === CELL_EMPTY) {
        grid[y][x] = CELL_WATER;
      }
      renderGrid();
    }
  }
}

function renderGrid() {
  console.log('renderGrid called. Canvas:', canvas.width, 'x', canvas.height, 'GridSize:', gridSize, 'CellSize:', cellSize);
  
  ctx.fillStyle = '#1a2332';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log('Background filled');
  
  let cellsDrawn = 0;
  let startDrawn = false;
  let goalDrawn = false;
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cellType = grid[y][x];
      const terrainType = terrainGrid && terrainGrid[y] ? terrainGrid[y][x] : CELL_EMPTY;
      cellsDrawn++;
      
      // Draw base terrain first
      if (terrainType === CELL_GRASS) {
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (terrainType === CELL_MUD) {
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (terrainType === CELL_WATER) {
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else {
        ctx.fillStyle = '#0f1419';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
      
      // Then draw overlay (path, explored, obstacles, start, goal)
      if (cellType === CELL_OBSTACLE) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (cellType === CELL_START) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        startDrawn = true;
        console.log('Drawing START at', x, y);
      } else if (cellType === CELL_GOAL) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        goalDrawn = true;
        console.log('Drawing GOAL at', x, y);
      } else if (cellType === CELL_PATH) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (cellType === CELL_EXPLORED) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
      
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
  
  console.log('Grid rendered. Cells drawn:', cellsDrawn, 'Start drawn:', startDrawn, 'Goal drawn:', goalDrawn);
}

function getCellCost(cellType) {
  if (!terrainEnabled) return 1;
  
  switch(cellType) {
    case CELL_GRASS: return 1.5;
    case CELL_MUD: return 2.5;
    case CELL_WATER: return 4.0;
    default: return 1.0;
  }
}

function clearPath() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x] === CELL_PATH || grid[y][x] === CELL_EXPLORED) {
        grid[y][x] = terrainGrid[y][x];
      }
    }
  }
  hidePathInfo();
  renderGrid();
}

function clearGrid() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      grid[y][x] = CELL_EMPTY;
    }
  }
  if (startPos) {
    grid[startPos.y][startPos.x] = CELL_START;
  }
  if (goalPos) {
    grid[goalPos.y][goalPos.x] = CELL_GOAL;
  }
  hidePathInfo();
  renderGrid();
}

function generateRandomObstacles() {
  clearGrid();
  const obstacleCount = Math.floor(gridSize * gridSize * 0.25);
  let placed = 0;
  
  while (placed < obstacleCount) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    
    if (grid[y][x] === CELL_EMPTY) {
      grid[y][x] = CELL_OBSTACLE;
      placed++;
    }
  }
  
  renderGrid();
}

async function findPath() {
  if (!startPos || !goalPos) {
    showPathInfo('Please set both start and goal positions');
    return;
  }
  
  clearPath();
  
  const algorithmSelect = document.getElementById('algorithm-select');
  const selectedAlgorithm = algorithmSelect.value;
  
  let result;
  
  if (selectedAlgorithm === 'astar') {
    result = await astar(startPos, goalPos);
  } else if (selectedAlgorithm === 'dijkstra') {
    result = await dijkstra(startPos, goalPos);
  } else if (selectedAlgorithm === 'bfs') {
    result = await bfs(startPos, goalPos);
  } else if (selectedAlgorithm === 'dfs') {
    result = await dfs(startPos, goalPos);
  }
  
  if (result && result.path && result.path.length > 0) {
    let message = `Path found! Length: ${result.path.length} steps`;
    if (currentLevel !== 'junior') {
      message += `, Explored: ${result.explored} cells`;
    }
    if (terrainEnabled && result.cost) {
      message += `, Total Cost: ${result.cost.toFixed(1)}`;
    }
    showPathInfo(message);
  } else {
    showPathInfo(currentLevel === 'junior' ? 'No path found! Try removing some walls.' : 'No path found. The goal is unreachable.');
  }
}

async function astar(start, goal) {
  const openSet = [];
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();
  
  const startKey = `${start.x},${start.y}`;
  const goalKey = `${goal.x},${goal.y}`;
  
  openSet.push(start);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, goal));
  
  let exploredCount = 0;
  
  while (openSet.length > 0) {
    openSet.sort((a, b) => {
      const aKey = `${a.x},${a.y}`;
      const bKey = `${b.x},${b.y}`;
      return fScore.get(aKey) - fScore.get(bKey);
    });
    
    const current = openSet.shift();
    const currentKey = `${current.x},${current.y}`;
    
    if (currentKey === goalKey) {
      const pathResult = reconstructPath(cameFrom, current, gScore);
      return {
        path: pathResult.path,
        explored: exploredCount,
        cost: pathResult.cost
      };
    }
    
    closedSet.add(currentKey);
    
    if (grid[current.y][current.x] !== CELL_START && grid[current.y][current.x] !== CELL_GOAL) {
      grid[current.y][current.x] = CELL_EXPLORED;
      exploredCount++;
    }
    
    const neighbors = getNeighbors(current);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      if (closedSet.has(neighborKey)) continue;
      
      const moveCost = getCellCost(terrainGrid[neighbor.y][neighbor.x]);
      const tentativeGScore = gScore.get(currentKey) + moveCost;
      
      const neighborInOpen = openSet.some(n => `${n.x},${n.y}` === neighborKey);
      
      if (!neighborInOpen) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= gScore.get(neighborKey)) {
        continue;
      }
      
      cameFrom.set(neighborKey, current);
      gScore.set(neighborKey, tentativeGScore);
      fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, goal));
    }
    
    renderGrid();
    await sleep(100 / animationSpeed);
  }
  
  renderGrid();
  return { path: [], explored: exploredCount, cost: 0 };
}

function reconstructPath(cameFrom, current, gScore = null) {
  const path = [];
  let currentKey = `${current.x},${current.y}`;
  let totalCost = gScore ? gScore.get(currentKey) : 0;
  
  // Add the goal position to the path
  path.push(current);
  
  while (cameFrom.has(currentKey)) {
    const pos = cameFrom.get(currentKey);
    path.push(pos);
    if (grid[pos.y][pos.x] !== CELL_START && grid[pos.y][pos.x] !== CELL_GOAL) {
      grid[pos.y][pos.x] = CELL_PATH;
    }
    currentKey = `${pos.x},${pos.y}`;
  }
  
  renderGrid();
  return { path, cost: totalCost };
}

function getNeighbors(pos) {
  const neighbors = [];
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ];
  
  for (const dir of directions) {
    const newX = pos.x + dir.x;
    const newY = pos.y + dir.y;
    
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
      if (grid[newY][newX] !== CELL_OBSTACLE) {
        neighbors.push({ x: newX, y: newY });
      }
    }
  }
  
  return neighbors;
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function showPathInfo(message) {
  const infoBox = document.getElementById('path-info');
  const infoText = document.getElementById('path-info-text');
  infoText.textContent = message;
  infoBox.style.display = 'block';
}

function hidePathInfo() {
  const infoBox = document.getElementById('path-info');
  infoBox.style.display = 'none';
}

async function dijkstra(start, goal) {
  const openSet = [];
  const closedSet = new Set();
  const cameFrom = new Map();
  const distance = new Map();
  
  const startKey = `${start.x},${start.y}`;
  const goalKey = `${goal.x},${goal.y}`;
  
  openSet.push(start);
  distance.set(startKey, 0);
  
  let exploredCount = 0;
  
  while (openSet.length > 0) {
    openSet.sort((a, b) => {
      const aKey = `${a.x},${a.y}`;
      const bKey = `${b.x},${b.y}`;
      return distance.get(aKey) - distance.get(bKey);
    });
    
    const current = openSet.shift();
    const currentKey = `${current.x},${current.y}`;
    
    if (currentKey === goalKey) {
      const pathResult = reconstructPath(cameFrom, current, distance);
      return {
        path: pathResult.path,
        explored: exploredCount,
        cost: pathResult.cost
      };
    }
    
    closedSet.add(currentKey);
    
    if (grid[current.y][current.x] !== CELL_START && grid[current.y][current.x] !== CELL_GOAL) {
      grid[current.y][current.x] = CELL_EXPLORED;
      exploredCount++;
    }
    
    const neighbors = getNeighbors(current);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      if (closedSet.has(neighborKey)) continue;
      
      const moveCost = getCellCost(terrainGrid[neighbor.y][neighbor.x]);
      const tentativeDistance = distance.get(currentKey) + moveCost;
      
      const neighborInOpen = openSet.some(n => `${n.x},${n.y}` === neighborKey);
      
      if (!neighborInOpen) {
        openSet.push(neighbor);
        distance.set(neighborKey, tentativeDistance);
      } else if (tentativeDistance >= distance.get(neighborKey)) {
        continue;
      } else {
        distance.set(neighborKey, tentativeDistance);
      }
      
      cameFrom.set(neighborKey, current);
    }
    
    renderGrid();
    await sleep(100 / animationSpeed);
  }
  
  renderGrid();
  return { path: [], explored: exploredCount, cost: 0 };
}

async function bfs(start, goal) {
  const queue = [start];
  const visited = new Set();
  const cameFrom = new Map();
  
  const startKey = `${start.x},${start.y}`;
  const goalKey = `${goal.x},${goal.y}`;
  
  visited.add(startKey);
  
  let exploredCount = 0;
  
  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = `${current.x},${current.y}`;
    
    if (currentKey === goalKey) {
      const pathResult = reconstructPath(cameFrom, current);
      return {
        path: pathResult.path,
        explored: exploredCount
      };
    }
    
    if (grid[current.y][current.x] !== CELL_START && grid[current.y][current.x] !== CELL_GOAL) {
      grid[current.y][current.x] = CELL_EXPLORED;
      exploredCount++;
    }
    
    const neighbors = getNeighbors(current);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        queue.push(neighbor);
      }
    }
    
    renderGrid();
    await sleep(100 / animationSpeed);
  }
  
  renderGrid();
  return { path: [], explored: exploredCount };
}

async function dfs(start, goal) {
  const stack = [start];
  const visited = new Set();
  const cameFrom = new Map();
  
  const startKey = `${start.x},${start.y}`;
  const goalKey = `${goal.x},${goal.y}`;
  
  visited.add(startKey);
  
  let exploredCount = 0;
  
  while (stack.length > 0) {
    const current = stack.pop();
    const currentKey = `${current.x},${current.y}`;
    
    if (currentKey === goalKey) {
      const pathResult = reconstructPath(cameFrom, current);
      return {
        path: pathResult.path,
        explored: exploredCount
      };
    }
    
    if (grid[current.y][current.x] !== CELL_START && grid[current.y][current.x] !== CELL_GOAL) {
      grid[current.y][current.x] = CELL_EXPLORED;
      exploredCount++;
    }
    
    const neighbors = getNeighbors(current);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        stack.push(neighbor);
      }
    }
    
    renderGrid();
    await sleep(100 / animationSpeed);
  }
  
  renderGrid();
  return { path: [], explored: exploredCount };
}
