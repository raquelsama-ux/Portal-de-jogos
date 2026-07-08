// ========================================================
// JOGO DA COBRINHA — lógica do jogo
// ========================================================

/* ---------------------------------------------------------
   Orientação padrão da arte:
   - cobracabeca.png  -> focinho apontando para a ESQUERDA
     (na prática a arte ficou apontando para o corpo, por isso
     o HEAD_BASE_OFFSET abaixo já soma 180° de correção)
   - cobracauda.png   -> ponta apontando para a DIREITA
   Se a sua arte for diferente, ajuste os valores abaixo
   (em graus, some/troque por 90/180/270 até ficar correto).
--------------------------------------------------------- */
const HEAD_BASE_OFFSET = 180;
const TAIL_BASE_OFFSET = 0;

// ---- menu dropdown do header (igual ao index.html) ----
const menuToggle   = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');
menuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = dropdownMenu.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
document.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target) && e.target !== menuToggle){
    dropdownMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

// ---- config do grid ----
const COLS = 20;
const ROWS = 20;
const CELL = 600 / COLS; // 30px em resolução interna do canvas

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const menuOverlay     = document.getElementById('menuOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const scoreValueEl    = document.getElementById('scoreValue');
const finalScoreEl    = document.getElementById('finalScore');
const btnStart        = document.getElementById('btnStart');
const btnRetry        = document.getElementById('btnRetry');

// ---- carregamento das imagens ----
const IMG_SRC = {
  cabeca:   '/assets/cobrinha/cobracabeca.png',
  cauda:    '/assets/cobrinha/cobracauda.png',
  corpoH:   '/assets/cobrinha/cobracorpoH.png',
  corpoV:   '/assets/cobrinha/cobracorpoV.png',
  curvaLD:  '/assets/cobrinha/cobracurvaLD.png',
  curvaRD:  '/assets/cobrinha/cobracurvaRD.png',
  curvaTL:  '/assets/cobrinha/cobracurvaTL.png',
  curvaTR:  '/assets/cobrinha/cobracurvaTR.png',
  ratinho:  '/assets/cobrinha/ratinho.png',
  espinho:  '/assets/cobrinha/espinho.png',
  fundo:    '/assets/cobrinha/fundocobra.jpg'
};
const images = {};
let assetsReady = false;

function loadImages(sources){
  const entries = Object.entries(sources);
  let loaded = 0;
  return new Promise((resolve) => {
    entries.forEach(([key, src]) => {
      const img = new Image();
      img.onload  = () => { loaded++; if (loaded === entries.length) resolve(); };
      img.onerror = () => { loaded++; if (loaded === entries.length) resolve(); };
      img.src = src;
      images[key] = img;
    });
  });
}

const DIRS = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1  },
  left:  { x: -1, y: 0  },
  right: { x: 1,  y: 0  }
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

// cobracabeca.png aponta para a ESQUERDA por padrão -> ângulo de rotação
// necessário para apontar em cada direção de viagem:
const HEAD_ANGLE = { left: 0, up: 90, right: 180, down: 270 };

// cobracauda.png aponta para a DIREITA por padrão -> ângulo de rotação
// necessário para apontar na direção de onde a cobra "veio" (dirIn):
const TAIL_ANGLE = { right: 0, down: 90, left: 180, up: 270 };

// escolhe a imagem de curva certa (sem rotação) a partir do par de
// direções que o segmento conecta
const CURVE_IMAGE = {
  'up|left':   'curvaTL',
  'left|up':   'curvaTL',
  'up|right':  'curvaTR',
  'right|up':  'curvaTR',
  'left|down': 'curvaLD',
  'down|left': 'curvaLD',
  'right|down':'curvaRD',
  'down|right':'curvaRD'
};

// ---- estado do jogo ----
let snake, direction, nextDirection, food, obstacles, score, tickMs, acc, lastTime;
let state = 'menu'; // 'menu' | 'playing' | 'gameover'
let rafId = null;

function resetGame(){
  const startY = Math.floor(ROWS / 2);
  snake = [
    { x: 9, y: startY },
    { x: 8, y: startY },
    { x: 7, y: startY }
  ];
  direction = 'right';
  nextDirection = 'right';
  score = 0;
  tickMs = 150;
  acc = 0;
  lastTime = null;
  obstacles = generateObstacles(8);
  food = spawnFood();
  scoreValueEl.textContent = '0';
}

function cellFree(x, y, extraOccupied = []){
  const occupied = [...snake, ...obstacles, ...extraOccupied];
  return !occupied.some(c => c.x === x && c.y === y);
}

function generateObstacles(count){
  const list = [];
  let attempts = 0;
  while (list.length < count && attempts < 500){
    attempts++;
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    // mantém uma área segura ao redor do ponto de partida da cobra
    const nearStart = Math.abs(y - Math.floor(ROWS / 2)) <= 2 && x <= 12;
    if (nearStart) continue;
    if (list.some(o => o.x === x && o.y === y)) continue;
    list.push({ x, y });
  }
  return list;
}

function spawnFood(){
  let x, y, safety = 0;
  do {
    x = Math.floor(Math.random() * COLS);
    y = Math.floor(Math.random() * ROWS);
    safety++;
  } while (!cellFree(x, y) && safety < 500);
  return { x, y };
}

// ---- input ----
const KEY_TO_DIR = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'
};
window.addEventListener('keydown', (e) => {
  const dir = KEY_TO_DIR[e.key];
  if (!dir) return;
  if (state === 'playing') e.preventDefault();
  if (state !== 'playing') return;
  // impede reverter diretamente sobre o próprio corpo
  if (OPPOSITE[dir] === direction) return;
  nextDirection = dir;
});

btnStart.addEventListener('click', startGame);
btnRetry.addEventListener('click', startGame);

function startGame(){
  resetGame();
  state = 'playing';
  menuOverlay.classList.add('is-hidden');
  gameOverOverlay.classList.add('is-hidden');
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function endGame(){
  state = 'gameover';
  finalScoreEl.textContent = String(score);
  gameOverOverlay.classList.remove('is-hidden');
}

// ---- loop principal ----
function loop(timestamp){
  if (lastTime === null) lastTime = timestamp;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (state === 'playing'){
    acc += delta;
    while (acc >= tickMs){
      acc -= tickMs;
      tick();
      if (state !== 'playing') break;
    }
  }

  render(timestamp);

  if (state !== 'gameover' || true){
    rafId = requestAnimationFrame(loop);
  }
}

function tick(){
  direction = nextDirection;
  const dir = DIRS[direction];
  const head = snake[0];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  // colisão com a parede
  if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS){
    endGame();
    return;
  }

  // colisão com espinho
  if (obstacles.some(o => o.x === newHead.x && o.y === newHead.y)){
    endGame();
    return;
  }

  const ateFood = newHead.x === food.x && newHead.y === food.y;

  // colisão consigo mesma (o último segmento libera espaço se não crescer)
  const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
  if (bodyToCheck.some(s => s.x === newHead.x && s.y === newHead.y)){
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (ateFood){
    score += 1;
    scoreValueEl.textContent = String(score);
    scoreValueEl.classList.remove('is-bumped');
    void scoreValueEl.offsetWidth; // reinicia a animação
    scoreValueEl.classList.add('is-bumped');
    food = spawnFood();
    tickMs = Math.max(75, tickMs - 3); // acelera levemente a cada rato
  } else {
    snake.pop();
  }
}

// ---- desenho ----
function drawRotated(img, gx, gy, angleDeg){
  const cx = gx * CELL + CELL / 2;
  const cy = gy * CELL + CELL / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.drawImage(img, -CELL / 2, -CELL / 2, CELL, CELL);
  ctx.restore();
}

function render(timestamp){
  // fundo
  if (images.fundo && images.fundo.complete){
    ctx.drawImage(images.fundo, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#f6c94a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // espinhos
  obstacles.forEach(o => {
    if (images.espinho) drawRotated(images.espinho, o.x, o.y, 0);
  });

  // comida (com leve pulsação)
  const pulse = 1 + Math.sin(timestamp / 180) * 0.08;
  if (images.ratinho){
    const cx = food.x * CELL + CELL / 2;
    const cy = food.y * CELL + CELL / 2;
    const size = CELL * pulse;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.drawImage(images.ratinho, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // cobra
  snake.forEach((seg, i) => {
    if (i === 0){
      drawRotated(images.cabeca, seg.x, seg.y, HEAD_ANGLE[direction] + HEAD_BASE_OFFSET);
      return;
    }
    if (i === snake.length - 1){
      const prev = snake[i - 1];
      const dirIn = dirBetween(prev, seg); // direção de entrada nesta célula
      drawRotated(images.cauda, seg.x, seg.y, TAIL_ANGLE[dirIn] + TAIL_BASE_OFFSET);
      return;
    }
    const prev = snake[i - 1];
    const next = snake[i + 1];
    const dirIn  = dirBetween(prev, seg);   // de onde a cobra veio
    const dirOut = dirBetween(seg, next);   // para onde a cobra vai

    if (dirIn === dirOut){
      const img = (dirIn === 'left' || dirIn === 'right') ? images.corpoH : images.corpoV;
      drawRotated(img, seg.x, seg.y, 0);
    } else {
      const openingA = OPPOSITE[dirIn]; // abertura voltada para o segmento anterior
      const openingB = dirOut;          // abertura voltada para o próximo segmento
      const key = `${openingA}|${openingB}`;
      const imgKey = CURVE_IMAGE[key];
      drawRotated(images[imgKey], seg.x, seg.y, 0);
    }
  });
}

function dirBetween(a, b){
  if (b.x > a.x) return 'right';
  if (b.x < a.x) return 'left';
  if (b.y > a.y) return 'down';
  return 'up';
}

// ---- inicialização ----
loadImages(IMG_SRC).then(() => {
  assetsReady = true;
  resetGame();
  rafId = requestAnimationFrame(loop);
});
