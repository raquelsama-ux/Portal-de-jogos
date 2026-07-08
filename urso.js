// ======================================================
// JOGO DA PESCARIA
// Parte 1
// ======================================================

// ===============================
// CANVAS
// ===============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 700;


// ===============================
// HUD
// ===============================

const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

const winScreen = document.getElementById("winScreen");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");


// ===============================
// IMAGENS
// ===============================

const background = new Image();
background.src = "assets/urso/fundo.jpg";

const bear = new Image();
bear.src = "assets/urso/ursopescando.png";

const fishSmallImg = new Image();
fishSmallImg.src = "assets/urso/peixep.png";

const fishMediumImg = new Image();
fishMediumImg.src = "assets/urso/peixem.png";

const fishLargeImg = new Image();
fishLargeImg.src = "assets/urso/peixeg.png";


// ===============================
// ESTADO DO JOGO
// ===============================

let score = 0;

let time = 30;

let timer;

let gameRunning = false;


// ===============================
// LINHA DE PESCA
// ===============================

const fisherman = {

    x:250,

    y:35,

    angle:35,

    minAngle:15,

    maxAngle:75,

    direction:1,

    speed:1.2,

    casting:false,

    hookLength:0,

    maxLength:950,

    retracting:false

};


// ===============================
// PEIXES
// ===============================

let fishes = [];


// ===============================
// CLASSE PEIXE
// ===============================

class Fish{

    constructor(type){

        this.type = type;

        switch(type){

            case "small":

                this.image = fishSmallImg;

                this.points = 1;

                this.width = 55;

                this.height = 32;

                this.speed = 2.8;

                this.y = random(320,390);

                break;

            case "medium":

                this.image = fishMediumImg;

                this.points = 2;

                this.width = 72;

                this.height = 42;

                this.speed = 2;

                this.y = random(420,510);

                break;

            case "large":

                this.image = fishLargeImg;

                this.points = 5;

                this.width = 105;

                this.height = 58;

                this.speed = 1.2;

                this.y = random(560,640);

                break;

        }

        this.direction = Math.random() < .5 ? 1 : -1;

        if(this.direction === 1){

            this.x = -random(100,900);

        }else{

            this.x = canvas.width + random(100,900);

        }

    }

    update(){

        this.x += this.speed * this.direction;

        if(this.direction === 1 && this.x > canvas.width + 120){

            this.x = -150;

            this.y += random(-30,30);

        }

        if(this.direction === -1 && this.x < -150){

            this.x = canvas.width + 120;

            this.y += random(-30,30);

        }

    }

    draw(){

        ctx.drawImage(

            this.image,

            this.x,

            this.y,

            this.width,

            this.height

        );

    }

}


// ===============================
// CRIA TODOS OS PEIXES
// ===============================

function createFish(){

    fishes = [];

    for(let i=0;i<8;i++){

        fishes.push(new Fish("small"));

    }

    for(let i=0;i<6;i++){

        fishes.push(new Fish("medium"));

    }

    for(let i=0;i<5;i++){

        fishes.push(new Fish("large"));

    }

}


// ===============================
// TIMER
// ===============================

function startTimer(){

    clearInterval(timer);

    time = 30;

    timerDisplay.textContent = time;

    timer = setInterval(()=>{

        time--;

        timerDisplay.textContent = time;

        if(time<=0){

            finishGame();

        }

    },1000);

}


// ===============================
// COMEÇAR
// ===============================

startBtn.addEventListener("click",()=>{

    startScreen.classList.add("hidden");

    score = 0;

    scoreDisplay.textContent = 0;

    createFish();

    startTimer();

    gameRunning = true;

});


// ===============================
// REINICIAR
// ===============================

restartBtn.addEventListener("click",()=>{

    winScreen.classList.add("hidden");

    score = 0;

    scoreDisplay.textContent = 0;

    createFish();

    startTimer();

    gameRunning = true;

});


// ===============================
// FINALIZA O JOGO
// ===============================

function finishGame(){

    clearInterval(timer);

    gameRunning = false;

    finalScore.textContent = score;

    winScreen.classList.remove("hidden");

}


// ===============================
// UTILIDADES
// ===============================

function random(min,max){

    return Math.random()*(max-min)+min;

}

// ======================================================
// PARTE 2A
// CONTROLE DA VARA E DA LINHA
// ======================================================

let spacePressed = false;

let hook = {

    x: fisherman.x,

    y: fisherman.y,

    fish:null

};

let floatingTexts = [];


// =======================================
// TECLADO
// =======================================

window.addEventListener("keydown",(e)=>{

    if(e.code==="Space"){

        e.preventDefault();

        if(!gameRunning) return;

        if(fisherman.casting) return;

        spacePressed=true;

    }

});

window.addEventListener("keyup",(e)=>{

    if(e.code==="Space"){

        e.preventDefault();

        if(!gameRunning) return;

        if(fisherman.casting) return;

        spacePressed=false;

        fisherman.casting=true;

        fisherman.retracting=false;

        fisherman.hookLength=0;

        hook.fish=null;

    }

});


// =======================================
// OSCILAÇÃO DO ÂNGULO
// =======================================

function updateAngle(){

    if(!spacePressed) return;

    fisherman.angle += fisherman.speed*fisherman.direction;

    if(fisherman.angle>=fisherman.maxAngle){

        fisherman.direction=-1;

    }

    if(fisherman.angle<=fisherman.minAngle){

        fisherman.direction=1;

    }

}


// =======================================
// LANÇAMENTO
// =======================================

function updateHook(){

    if(!fisherman.casting) return;

    if(!fisherman.retracting){

        fisherman.hookLength+=12;

        if(fisherman.hookLength>=fisherman.maxLength){

            fisherman.retracting=true;

        }

    }else{

        fisherman.hookLength-=14;

        if(fisherman.hookLength<=0){

            fisherman.hookLength=0;

            fisherman.casting=false;

            fisherman.retracting=false;

            hook.fish=null;

        }

    }

    const rad=fisherman.angle*Math.PI/180;

    hook.x=fisherman.x+Math.cos(rad)*fisherman.hookLength;

    hook.y=fisherman.y+Math.sin(rad)*fisherman.hookLength;

    checkCollision();

}


// =======================================
// COLISÃO
// =======================================

function checkCollision(){

    if(hook.fish) return;

    for(const fish of fishes){

        const cx=fish.x+fish.width/2;

        const cy=fish.y+fish.height/2;

        const dx=hook.x-cx;

        const dy=hook.y-cy;

        const dist=Math.sqrt(dx*dx+dy*dy);

        if(dist<fish.width/2){

            hook.fish=fish;

            fisherman.retracting=true;

            break;

        }

    }

}


// =======================================
// PEIXE PRESO NO ANZOL
// =======================================

function updateCaughtFish(){

    if(!hook.fish) return;

    hook.fish.x=hook.x-hook.fish.width/2;

    hook.fish.y=hook.y-hook.fish.height/2;

    if(fisherman.hookLength<=8){

        score+=hook.fish.points;

        scoreDisplay.textContent=score;

        floatingTexts.push({

            x:hook.fish.x,

            y:hook.fish.y,

            text:"+"+hook.fish.points,

            alpha:1,

            vy:-1

        });

        const index=fishes.indexOf(hook.fish);

        if(index>-1){

            const type=hook.fish.type;

            fishes.splice(index,1);

            setTimeout(()=>{

                fishes.push(new Fish(type));

            },1500);

        }

        hook.fish=null;

    }

}


// =======================================
// TEXTOS FLUTUANTES
// =======================================

function updateFloatingTexts(){

    for(let i=floatingTexts.length-1;i>=0;i--){

        const t=floatingTexts[i];

        t.y+=t.vy;

        t.alpha-=0.02;

        if(t.alpha<=0){

            floatingTexts.splice(i,1);

        }

    }

}


// =======================================
// VELOCIDADE FINAL
// =======================================

function updateDifficulty(){

    if(time>10) return;

    fishes.forEach(f=>{

        if(f.type==="small"){

            f.speed=3.6;

        }

        if(f.type==="medium"){

            f.speed=2.8;

        }

        if(f.type==="large"){

            f.speed=1.8;

        }

    });

}


// =======================================
// ATUALIZAÇÃO GERAL
// =======================================

function update(){

    if(!gameRunning) return;

    updateAngle();

    updateHook();

    updateCaughtFish();

    updateFloatingTexts();

    updateDifficulty();

    fishes.forEach(f=>f.update());

}

// ======================================================
// PARTE 2B
// RENDERIZAÇÃO E GAME LOOP
// ======================================================


// =======================================
// DESENHA FUNDO
// =======================================

function drawBackground(){

    ctx.drawImage(
        background,
        0,
        0,
        canvas.width,
        canvas.height
    );

}


// =======================================
// DESENHA PEIXES
// =======================================

function drawFish(){

    fishes.forEach(fish=>{

        ctx.save();

        if(fish.direction===-1){

            ctx.translate(
                fish.x + fish.width,
                fish.y
            );

            ctx.scale(-1,1);

            ctx.drawImage(
                fish.image,
                0,
                0,
                fish.width,
                fish.height
            );

        }else{

            ctx.drawImage(
                fish.image,
                fish.x,
                fish.y,
                fish.width,
                fish.height
            );

        }

        ctx.restore();

    });

}


// =======================================
// DESENHA URSO
// =======================================

function drawBear(){

   ctx.drawImage(
    bear,
    30,     // mais para a esquerda
    15,     // sobe para sentar no banco de areia
    220,    // largura menor
    220     // altura menor
);

}


// =======================================
// DESENHA LINHA
// =======================================

function drawFishingLine(){

    const startX = fisherman.x;
    const startY = fisherman.y;

    const rad = fisherman.angle * Math.PI / 180;

    const endX = startX + Math.cos(rad) * fisherman.hookLength;
    const endY = startY + Math.sin(rad) * fisherman.hookLength;

    ctx.strokeStyle = "#222";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(startX,startY);

    ctx.lineTo(endX,endY);

    ctx.stroke();

    // anzol

    ctx.fillStyle="#444";

    ctx.beginPath();

    ctx.arc(
        endX,
        endY,
        8,
        0,
        Math.PI*2
    );

    ctx.fill();

}


// =======================================
// PEIXE NO ANZOL
// =======================================

function drawCaughtFish(){

    if(!hook.fish) return;

    ctx.drawImage(

        hook.fish.image,

        hook.fish.x,

        hook.fish.y,

        hook.fish.width,

        hook.fish.height

    );

}


// =======================================
// TEXTO DE PONTUAÇÃO
// =======================================

function drawFloatingTexts(){

    floatingTexts.forEach(text=>{

        ctx.save();

        ctx.globalAlpha = text.alpha;

        ctx.fillStyle = "#F95738";

        ctx.font = "bold 32px Baloo 2";

        ctx.textAlign = "center";

        ctx.fillText(

            text.text,

            text.x,

            text.y

        );

        ctx.restore();

    });

}


// =======================================
// MIRA DE ÂNGULO
// =======================================

function drawAngleIndicator(){

    if(fisherman.casting) return;

    const rad = fisherman.angle * Math.PI / 180;

    const x =
        fisherman.x +
        Math.cos(rad)*90;

    const y =
        fisherman.y +
        Math.sin(rad)*90;

    ctx.fillStyle="#F4D35E";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        12,
        0,
        Math.PI*2
    );

    ctx.fill();

}


// =======================================
// TEXTO AUXILIAR
// =======================================

function drawInstructions(){

    if(fisherman.casting) return;

    ctx.fillStyle="rgba(255,255,255,.85)";

    ctx.font="bold 24px Baloo 2";

    ctx.textAlign="center";

    ctx.fillText(

        "Segure ESPAÇO para escolher o ângulo",

        canvas.width/2,

        40

    );

}


// =======================================
// RENDERIZAÇÃO
// =======================================

function render(){

    drawBackground();

    drawFish();

    drawFishingLine();

    drawCaughtFish();

    drawBear();

    drawFloatingTexts();

    drawAngleIndicator();

    drawInstructions();

}


// =======================================
// LOOP PRINCIPAL
// =======================================

function gameLoop(){

    update();

    render();

    requestAnimationFrame(gameLoop);

}


// =======================================
// MENU DROPDOWN
// =======================================

const menuToggle =
document.getElementById("menuToggle");

const dropdownMenu =
document.getElementById("dropdownMenu");

if(menuToggle){

    menuToggle.addEventListener("click",()=>{

        dropdownMenu.classList.toggle("is-open");

    });

}


// =======================================
// INICIA
// =======================================

createFish();

gameLoop();


const rankingBtn =
document.getElementById("rankingBtn");

const rankingScreen =
document.getElementById("rankingScreen");

const rankingOnlyList =
document.getElementById("rankingOnlyList");

const closeRankingBtn =
document.getElementById("closeRankingBtn");

const rankingList =
document.getElementById("rankingList");

const saveScoreBtn =
document.getElementById("saveScoreBtn");

const playerName =
document.getElementById("playerName");

function getRanking(){

    return JSON.parse(

        localStorage.getItem("rankingPescaria")

    ) || [];

}

function saveRanking(list){

    localStorage.setItem(

        "rankingPescaria",

        JSON.stringify(list)

    );

}


function updateRanking(highlightName = "") {

    const ranking = getRanking();

    ranking.sort((a, b) => b.score - a.score);

    ranking.splice(10);

    rankingList.innerHTML = "";
    rankingOnlyList.innerHTML = "";

    ranking.forEach((player, index) => {

        const highlight = player.name === highlightName
            ? ' class="ranking-highlight"'
            : "";

        const html = `
            <li${highlight}>
                <span>${index + 1}. ${player.name}</span>
                <strong>${player.score}</strong>
            </li>
        `;

        rankingList.innerHTML += html;
        rankingOnlyList.innerHTML += html;

    });

}



saveScoreBtn.addEventListener("click",()=>{

    let name = playerName.value.trim();

    if(name===""){

        name="Anônimo";
    saveArea.style.display = "none";

    }

    const ranking = getRanking();

    ranking.push({

        name,

        score

    });

    ranking.sort((a,b)=>b.score-a.score);

    ranking.splice(10);

    saveRanking(ranking);

    updateRanking();

    saveScoreBtn.disabled=true;

});

rankingBtn.addEventListener("click",()=>{

    updateRanking();

    rankingScreen.classList.remove("hidden");

});

closeRankingBtn.addEventListener("click",()=>{

    rankingScreen.classList.add("hidden");

});

function finishGame(){

    clearInterval(timer);

    gameRunning=false;

    finalScore.textContent=score;

    playerName.value="";

    saveScoreBtn.disabled=false;

    updateRanking();

    winScreen.classList.remove("hidden");

}


restartBtn.addEventListener("click",()=>{

    winScreen.classList.add("hidden");

    playerName.value="";

    score=0;

    scoreDisplay.textContent=0;

    createFish();

    startTimer();

    gameRunning=true;

});

function isTopTen(score){

    const ranking = getRanking();

    if(ranking.length < 10){

        return true;

    }

    ranking.sort((a,b)=>b.score-a.score);

    return score > ranking[9].score;

}

const resultMessage =
document.getElementById("resultMessage");

const saveArea =
document.getElementById("saveArea");

function finishGame(){

    clearInterval(timer);

    gameRunning = false;

    finalScore.textContent = score;

    playerName.value = "";

    saveScoreBtn.disabled = false;

    updateRanking();

    if(isTopTen(score)){

        resultMessage.textContent =
        "Você conquistou um lugar no Top 10!";

        saveArea.style.display = "block";

    }else{

        resultMessage.textContent =
        "Você não entrou no Top 10 desta vez.";

        saveArea.style.display = "none";

    }

    winScreen.classList.remove("hidden");

}

