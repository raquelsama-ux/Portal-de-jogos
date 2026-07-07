// ========================================================
// PORTAL DE JOGOS — interações
// ========================================================

// ----- dados dos jogos -----
const GAMES = {
  memoria: {
    title: 'Jogo da memória',
    desc: 'Encontre todos os pares de animais da fazenda antes que o tempo acabe. Escolha entre os modos fácil e difícil e teste sua memória.',
    image: 'assets/memoria.png',
    href: 'memoria.html'
  },

  cobrinha: {
    title: 'Jogo da cobrinha',
    desc: 'Reviva um clássico dos celulares antigos! Controle a cobrinha, colete os alimentos e tente alcançar a maior pontuação possível sem bater nas paredes ou em si mesma.',
    image: 'assets/cobra.png',
    href: 'cobrinha.html'
  },

  uvas: {
    title: 'Jogo das uvas',
    desc: 'Ajude a raposa a colher o maior número possível de cachos de uva desviando dos obstáculos pelo caminho.',
    image: 'assets/uvas.png',
    href: '#'
  },

  pescaria: {
    title: 'Jogo da pescaria',
    desc: 'Controle o urso pescador e capture o maior número de peixes antes que o tempo termine.',
    image: 'assets/urso.png',
    href: 'urso.html'
  }
};


// ========================================================
// MENU DROPDOWN
// ========================================================

const menuToggle = document.getElementById('menuToggle');
const dropdownMenu = document.getElementById('dropdownMenu');

function closeMenu() {

  dropdownMenu.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');

}

menuToggle.addEventListener('click', (e) => {

  e.stopPropagation();

  const isOpen = dropdownMenu.classList.toggle('is-open');

  menuToggle.setAttribute('aria-expanded', String(isOpen));

});

document.addEventListener('click', (e) => {

  if (!dropdownMenu.contains(e.target) && e.target !== menuToggle) {

    closeMenu();

  }

});

document.addEventListener('keydown', (e) => {

  if (e.key === 'Escape') {

    closeMenu();

  }

});


// ========================================================
// SELEÇÃO DE JOGO
// ========================================================

const orbs = document.querySelectorAll('.orb');

const panelContent = document.getElementById('panelContent');

const panelTitle = document.getElementById('panelTitle');

const panelDesc = document.getElementById('panelDesc');

const panelImage = document.getElementById('panelImage');

const btnJogar = document.getElementById('btnJogar');

let currentGame = 'cobrinha';

function selectGame(key) {

  if (key === currentGame) return;

  const data = GAMES[key];

  if (!data) return;

  currentGame = key;

  orbs.forEach(orb => {

    orb.classList.toggle('is-active', orb.dataset.game === key);

  });

  // animação de troca

  panelContent.classList.add('is-switching');

  setTimeout(() => {

    panelTitle.textContent = data.title;

    panelDesc.textContent = data.desc;

    panelImage.src = data.image;

    panelImage.alt = data.title;

    btnJogar.dataset.href = data.href;

    panelContent.classList.remove('is-switching');

  }, 220);

}

orbs.forEach(orb => {

  orb.addEventListener('click', () => {

    selectGame(orb.dataset.game);

  });

  orb.addEventListener('keydown', (e) => {

    if (e.key === 'Enter' || e.key === ' ') {

      e.preventDefault();

      selectGame(orb.dataset.game);

    }

  });

});


// ========================================================
// JOGO INICIAL
// ========================================================

selectGame(currentGame);


// ========================================================
// BOTÃO JOGAR
// ========================================================

btnJogar.addEventListener('click', () => {

  btnJogar.style.transform = 'scale(.94)';

  setTimeout(() => {

    btnJogar.style.transform = '';

    const destino = GAMES[currentGame].href;

    if (destino !== '#') {

      window.location.href = destino;

    } else {

      alert('Este jogo ainda está em desenvolvimento!');

    }

  }, 140);

});