// ======================================
// ELEMENTOS
// ======================================

const board = document.getElementById("gameBoard");

const timerDisplay = document.getElementById("timer");
const pairsDisplay = document.getElementById("pairs");

const easyBtn = document.getElementById("easyBtn");
const hardBtn = document.getElementById("hardBtn");

const startBtn = document.getElementById("startBtn");

const winScreen = document.getElementById("winScreen");
const finalTime = document.getElementById("finalTime");
const finalRank = document.getElementById("finalRank");
const playAgain = document.getElementById("playAgain");
const rankingBtn = document.getElementById("rankingBtn");
const rankingGameOverBtn = document.getElementById("rankingGameOverBtn");
const rankingOverlay = document.getElementById("rankingOverlay");
const rankingTitle = document.getElementById("rankingTitle");
const rankingList = document.getElementById("rankingList");
const closeRankingBtn = document.getElementById("closeRankingBtn");
const namePrompt = document.getElementById("namePrompt");
const playerNameInput = document.getElementById("playerNameInput");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const RANKING_KEY_PREFIX = "memoryRanking_";
const MAX_RANKING = 10;
let rankingSource = "menu";


// ======================================
// CONFIGURAÇÕES
// ======================================

let difficulty = "easy";

let totalPairs = 6;

let cards = [];

let firstCard = null;
let secondCard = null;

let lockBoard = false;

let pairsFound = 0;


// ======================================
// TIMER
// ======================================

let seconds = 0;

let timer = null;

function startTimer(){

    clearInterval(timer);

    seconds = 0;

    updateTimer();

    timer = setInterval(()=>{

        seconds++;

        updateTimer();

    },1000);

}

function stopTimer(){

    clearInterval(timer);

}

function updateTimer(){

    const min = String(Math.floor(seconds/60)).padStart(2,"0");

    const sec = String(seconds%60).padStart(2,"0");

    timerDisplay.textContent = `${min}:${sec}`;

}


// ======================================
// BOTÕES
// ======================================

easyBtn.addEventListener("click",()=>{

    difficulty="easy";

    totalPairs=6;

    easyBtn.classList.add("active");

    hardBtn.classList.remove("active");

    pairsDisplay.textContent=`0 / ${totalPairs}`;

});

hardBtn.addEventListener("click",()=>{

    difficulty="hard";

    totalPairs=10;

    hardBtn.classList.add("active");

    easyBtn.classList.remove("active");

    pairsDisplay.textContent=`0 / ${totalPairs}`;

});

startBtn.addEventListener("click",startGame);
rankingBtn.addEventListener("click",()=>showRanking("menu"));
rankingGameOverBtn.addEventListener("click",()=>showRanking("gameover"));
closeRankingBtn.addEventListener("click",closeRanking);
saveScoreBtn.addEventListener("click",saveCurrentScore);

playAgain.addEventListener("click",()=>{

    winScreen.classList.add("hidden");

    startGame();

});


// ======================================
// EMBARALHAMENTO
// ======================================

function shuffle(array){

    for(let i=array.length-1;i>0;i--){

        const j=Math.floor(Math.random()*(i+1));

        [array[i],array[j]]=[array[j],array[i]];

    }

    return array;

}


// ======================================
// CRIA O JOGO
// ======================================

function startGame(){

    stopTimer();

    startTimer();

    pairsFound=0;

    firstCard=null;

    secondCard=null;

    lockBoard=false;

    pairsDisplay.textContent=`0 / ${totalPairs}`;

    board.innerHTML="";

    board.className="board";

    board.classList.add(difficulty);

    let selectedAnimals;

    if(difficulty==="easy"){

        selectedAnimals=animals.slice(0,6);

    }else{

        selectedAnimals=animals.slice(0,10);

    }

    cards=[...selectedAnimals,...selectedAnimals];

    shuffle(cards);

    createCards();

}


// ======================================
// CRIA AS CARTAS
// ======================================

function createCards(){

    cards.forEach((animal,index)=>{

        const card=document.createElement("div");

        card.className="card";

        card.dataset.name=animal.name;

        card.dataset.index=index;

        card.innerHTML=`

            <div class="card-inner">

                <div class="card-front">

                    <img src="${animal.image}" alt="${animal.name}">

                </div>

                <div class="card-back">

                    <img src="assets/memoria/atras.png" alt="Verso da carta">

                </div>

            </div>

        `;

        card.addEventListener("click",flipCard);

        board.appendChild(card);

    });

}

// ======================================
// VIRAR CARTAS
// ======================================

function flipCard() {

    if (lockBoard) return;

    if (this === firstCard) return;

    if (this.classList.contains("matched")) return;

    this.classList.add("flipped");

    if (!firstCard) {

        firstCard = this;
        return;

    }

    secondCard = this;

    lockBoard = true;

    checkMatch();

}


// ======================================
// VERIFICA PAR
// ======================================

function checkMatch() {

    const match = firstCard.dataset.name === secondCard.dataset.name;

    if (match) {

        disableCards();

    } else {

        unflipCards();

    }

}


// ======================================
// PAR ENCONTRADO
// ======================================

function disableCards() {

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    pairsFound++;

    pairsDisplay.textContent = `${pairsFound} / ${totalPairs}`;

    resetTurn();

    if (pairsFound === totalPairs) {

        stopTimer();

        setTimeout(showWinScreen, 700);

    }

}


// ======================================
// NÃO É PAR
// ======================================

function unflipCards() {

    setTimeout(() => {

        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");

        resetTurn();

    }, 900);

}


// ======================================
// RESETA A RODADA
// ======================================

function resetTurn() {

    firstCard = null;
    secondCard = null;

    lockBoard = false;

}


// ======================================
// TELA DE VITÓRIA
// ======================================

function showWinScreen() {

    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");

    finalTime.textContent =
        `Você encontrou todos os pares em ${min}:${sec}!`;

    finalRank.textContent = getMemoryRank(seconds);

    if (isHighScore(seconds)) {
        namePrompt.style.display = "block";
        playerNameInput.value = "";
        playerNameInput.focus();
        playAgain.style.display = "none";
    } else {
        namePrompt.style.display = "none";
        playAgain.style.display = "inline-block";
    }

    winScreen.classList.remove("hidden");

}

function getMemoryRank(timeInSeconds) {
    if (timeInSeconds <= 20) return "Mestre dos Animais";
    if (timeInSeconds <= 35) return "Caçador de Pares";
    if (timeInSeconds <= 50) return "Memória em Foco";
    return "Aprendiz da Memória";
}

function getRankingKey() {
    return `${RANKING_KEY_PREFIX}${difficulty}`;
}

function getRanking() {
    const key = getRankingKey();
    const data = localStorage.getItem(key);
    if (!data) return [];

    try {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) return [];
        return parsed.sort((a, b) => a.time - b.time).slice(0, MAX_RANKING);
    } catch {
        return [];
    }
}

function isHighScore(timeInSeconds) {
    const ranking = getRanking();
    return ranking.length < MAX_RANKING || timeInSeconds < ranking[ranking.length - 1].time;
}

function saveHighScore(name, timeInSeconds) {
    const key = getRankingKey();
    const ranking = getRanking();
    ranking.push({ name, time: timeInSeconds });
    ranking.sort((a, b) => a.time - b.time);
    const trimmed = ranking.slice(0, MAX_RANKING);
    localStorage.setItem(key, JSON.stringify(trimmed));
}

function saveCurrentScore() {
    const name = playerNameInput.value.trim() || "Jogador";
    saveHighScore(name, seconds);
    playerNameInput.value = "";
    namePrompt.style.display = "none";
    playAgain.style.display = "inline-block";
    showRanking("gameover");
}

function showRanking(source) {
    rankingSource = source;
    rankingOverlay.classList.remove("hidden");
    rankingTitle.textContent = `🏆 Ranking da Memória — ${difficulty === "easy" ? "Fácil" : "Difícil"}`;
    const ranking = getRanking();
    rankingList.innerHTML = "";

    if (ranking.length === 0) {
        const item = document.createElement("li");
        item.textContent = "Ainda não há pontuações registradas.";
        rankingList.appendChild(item);
        return;
    }

    ranking.forEach((entry, index) => {
        const item = document.createElement("li");
        const minutes = String(Math.floor(entry.time / 60)).padStart(2, "0");
        const secondsPart = String(entry.time % 60).padStart(2, "0");
        item.textContent = `${index + 1}. ${entry.name} — ${minutes}:${secondsPart}`;
        rankingList.appendChild(item);
    });
}

function closeRanking() {
    rankingOverlay.classList.add("hidden");

    if (rankingSource === "gameover") {
        winScreen.classList.remove("hidden");
    }
}


// ======================================
// INICIALIZAÇÃO
// ======================================

pairsDisplay.textContent = `0 / ${totalPairs}`;
updateTimer();

//==============================
// MENU
//==============================

const menuBtn = document.getElementById("menuBtn");

const closeMenu = document.getElementById("closeMenu");

const sideMenu = document.getElementById("menu");

const overlay = document.getElementById("overlay");

menuBtn.addEventListener("click",()=>{

    sideMenu.classList.add("open");

    overlay.classList.add("show");

});

closeMenu.addEventListener("click",closeSideMenu);

overlay.addEventListener("click",closeSideMenu);

function closeSideMenu(){

    sideMenu.classList.remove("open");

    overlay.classList.remove("show");

}