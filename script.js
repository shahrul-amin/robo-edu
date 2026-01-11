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

const MODE_NONE = 0;
const MODE_SET_START = 1;
const MODE_SET_GOAL = 2;
const MODE_TOGGLE_OBSTACLES = 3;

let canvas;
let ctx;
let grid = [];
let startPos = null;
let goalPos = null;
let currentMode = MODE_NONE;
let isMouseDown = false;

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('grid-canvas');
  if (!canvas) return; // Not on interactive page
  ctx = canvas.getContext('2d');
  
  initializeGrid();
  renderGrid();
  setupEventListeners();
});

function initializeGrid() {
  grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x] = CELL_EMPTY;
    }
  }
  startPos = { x: 2, y: 2 };
  goalPos = { x: 17, y: 17 };
  grid[startPos.y][startPos.x] = CELL_START;
  grid[goalPos.y][goalPos.x] = CELL_GOAL;
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
  if (isMouseDown && currentMode === MODE_TOGGLE_OBSTACLES) {
    handleCanvasClick(e);
  }
}

function handleMouseUp() {
  isMouseDown = false;
}

function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  // Account for CSS scaling - calculate the ratio between actual canvas size and displayed size
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE);
  
  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
  
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
    if (grid[y][x] === CELL_OBSTACLE) {
      grid[y][x] = CELL_EMPTY;
    } else if (grid[y][x] === CELL_EMPTY) {
      grid[y][x] = CELL_OBSTACLE;
    }
    renderGrid();
  }
}

function renderGrid() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cellType = grid[y][x];
      
      if (cellType === CELL_EMPTY) {
        ctx.fillStyle = '#FFFFFF';
      } else if (cellType === CELL_OBSTACLE) {
        ctx.fillStyle = '#37352F';
      } else if (cellType === CELL_START) {
        ctx.fillStyle = '#0F7B6C';
      } else if (cellType === CELL_GOAL) {
        ctx.fillStyle = '#D44C47';
      } else if (cellType === CELL_PATH) {
        ctx.fillStyle = '#2383E2';
      } else if (cellType === CELL_EXPLORED) {
        ctx.fillStyle = '#E8F3FF';
      }
      
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 1;
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function clearPath() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === CELL_PATH || grid[y][x] === CELL_EXPLORED) {
        grid[y][x] = CELL_EMPTY;
      }
    }
  }
  hidePathInfo();
  renderGrid();
}

function clearGrid() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
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
  const obstacleCount = Math.floor(GRID_SIZE * GRID_SIZE * 0.25);
  let placed = 0;
  
  while (placed < obstacleCount) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    if (grid[y][x] === CELL_EMPTY) {
      grid[y][x] = CELL_OBSTACLE;
      placed++;
    }
  }
  
  renderGrid();
}

function findPath() {
  if (!startPos || !goalPos) {
    showPathInfo('Please set both start and goal positions');
    return;
  }
  
  clearPath();
  
  const algorithmSelect = document.getElementById('algorithm-select');
  const selectedAlgorithm = algorithmSelect.value;
  
  let result;
  
  if (selectedAlgorithm === 'astar') {
    result = astar(startPos, goalPos);
  } else if (selectedAlgorithm === 'dijkstra') {
    result = dijkstra(startPos, goalPos);
  } else if (selectedAlgorithm === 'bfs') {
    result = bfs(startPos, goalPos);
  } else if (selectedAlgorithm === 'dfs') {
    result = dfs(startPos, goalPos);
  }
  
  if (result.path.length > 0) {
    showPathInfo(`Path found! Length: ${result.path.length} steps, Explored: ${result.explored} cells`);
  } else {
    showPathInfo('No path found. The goal is unreachable.');
  }
}

function astar(start, goal) {
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
      return {
        path: reconstructPath(cameFrom, current),
        explored: exploredCount
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
      
      const tentativeGScore = gScore.get(currentKey) + 1;
      
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
  }
  
  renderGrid();
  return { path: [], explored: exploredCount };
}

function reconstructPath(cameFrom, current) {
  const path = [];
  let currentKey = `${current.x},${current.y}`;
  
  while (cameFrom.has(currentKey)) {
    const pos = cameFrom.get(currentKey);
    if (grid[pos.y][pos.x] !== CELL_START) {
      grid[pos.y][pos.x] = CELL_PATH;
      path.push(pos);
    }
    currentKey = `${pos.x},${pos.y}`;
  }
  
  renderGrid();
  return path;
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
    
    if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
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

function dijkstra(start, goal) {
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
      return {
        path: reconstructPath(cameFrom, current),
        explored: exploredCount
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
      
      const tentativeDistance = distance.get(currentKey) + 1;
      
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
  }
  
  renderGrid();
  return { path: [], explored: exploredCount };
}

function bfs(start, goal) {
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
      return {
        path: reconstructPath(cameFrom, current),
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
  }
  
  renderGrid();
  return { path: [], explored: exploredCount };
}

function dfs(start, goal) {
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
      return {
        path: reconstructPath(cameFrom, current),
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
  }
  
  renderGrid();
  return { path: [], explored: exploredCount };
}
