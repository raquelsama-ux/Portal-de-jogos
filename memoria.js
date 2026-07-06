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
const playAgain = document.getElementById("playAgain");


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

    winScreen.classList.remove("hidden");

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