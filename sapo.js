// ==========================================================
// JOGO DO SAPO
// Parte 1 - Inicialização
// ==========================================================

// ==========================================================
// CANVAS
// ==========================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ==========================================================
// ELEMENTOS HTML
// ==========================================================

const startScreen = document.getElementById("startScreen");
const phaseScreen = document.getElementById("phaseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const rankingScreen = document.getElementById("rankingScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const rankingBtn = document.getElementById("rankingBtn");
const closeRankingBtn = document.getElementById("closeRankingBtn");

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const remainingDisplay = document.getElementById("remaining");

const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");

const phaseTitle = document.getElementById("phaseTitle");

const resultMessage = document.getElementById("resultMessage");

const rankingList = document.getElementById("rankingList");
const rankingOnlyList = document.getElementById("rankingOnlyList");

const saveArea = document.getElementById("saveArea");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const playerName = document.getElementById("playerName");

// ==========================================================
// MENU HAMBÚRGUER
// ==========================================================

const menuBtn = document.getElementById("menuBtn");
const dropdown = document.getElementById("dropdown");

menuBtn.addEventListener("click", () => {

    dropdown.classList.toggle("show");

});

document.addEventListener("click", e => {

    if (!menuBtn.contains(e.target) &&
        !dropdown.contains(e.target)) {

        dropdown.classList.remove("show");

    }

});

// ==========================================================
// IMAGENS
// ==========================================================

const background = new Image();
background.src = "assets/sapo/fundosapo.jpg";

const frogImg = new Image();
frogImg.src = "assets/sapo/sapo.png";

const flyImg = new Image();
flyImg.src = "assets/sapo/mosca.png";

const spiderImg = new Image();
spiderImg.src = "assets/sapo/aranha.png";

const turtleImg = new Image();
turtleImg.src = "assets/sapo/tartaruga.png";

const fireflyImg = new Image();
fireflyImg.src = "assets/sapo/vagalume.png";

// ==========================================================
// CONSTANTES
// ==========================================================

const FROG_WIDTH = 90;
const FROG_HEIGHT = 90;

const TONGUE_SPEED = 18;

const FLY_POINTS = 1;
const SPIDER_POINTS = 2;
const FIREFLY_POINTS = 5;

const BASE_ENEMY_SPEED = 1.3;

// ==========================================================
// VARIÁVEIS DO JOGO
// ==========================================================

let score = 0;
let level = 1;

let gameRunning = false;

let enemies = [];
let turtles = [];
let fireflies = [];

let tongue = null;

let enemyDirection = 1;

let enemySpeed = BASE_ENEMY_SPEED;

let enemyDropDistance = 28;

let lastFirefly = 0;

// ==========================================================
// TECLADO
// ==========================================================

const keys = {

    left: false,
    right: false,
    space: false

};

document.addEventListener("keydown", e => {

    switch (e.code) {

        case "ArrowLeft":

            keys.left = true;
            break;

        case "ArrowRight":

            keys.right = true;
            break;

        case "Space":

            e.preventDefault();
            keys.space = true;
            break;

    }

});

document.addEventListener("keyup", e => {

    switch (e.code) {

        case "ArrowLeft":

            keys.left = false;
            break;

        case "ArrowRight":

            keys.right = false;
            break;

        case "Space":

            keys.space = false;
            break;

    }

});

// ==========================================================
// SAPO
// ==========================================================

const frog = {

    x: WIDTH / 2 - FROG_WIDTH / 2,

    y: 35,

    width: FROG_WIDTH,

    height: FROG_HEIGHT,

    speed: 8

};

// ==========================================================
// RESET
// ==========================================================

function resetGame() {

    score = 0;
    level = 1;

    enemySpeed = BASE_ENEMY_SPEED;

    enemyDirection = 1;

    enemies = [];
    turtles = [];
    fireflies = [];

    tongue = null;

    frog.x = WIDTH / 2 - FROG_WIDTH / 2;

    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;

}

// ==========================================================
// HUD
// ==========================================================

function updateHUD() {

    scoreDisplay.textContent = score;

    levelDisplay.textContent = level;

    remainingDisplay.textContent = enemies.length;

}

// ==========================================================
// INÍCIO DO JOGO
// ==========================================================

startBtn.addEventListener("click", () => {

    startScreen.classList.add("hidden");

    resetGame();

    createLevel();

    gameRunning = true;

});

restartBtn.addEventListener("click", () => {

    gameOverScreen.classList.add("hidden");

    resetGame();

    createLevel();

    gameRunning = true;

});

// ==========================================================
// PARTE 2A
// Classes do jogo
// ==========================================================

// ==========================================================
// MOSCA
// ==========================================================

class Fly{

    constructor(x,y){

        this.x=x;
        this.y=y;

        this.width=42;
        this.height=42;

        this.points=1;

        this.type="fly";

    }

    draw(){

        ctx.drawImage(
            flyImg,
            this.x,
            this.y,
            this.width,
            this.height
        );

    }

}

// ==========================================================
// ARANHA
// ==========================================================

class Spider{

    constructor(x,y){

        this.x=x;
        this.y=y;

        this.width=50;
        this.height=50;

        this.points=2;

        this.type="spider";

    }

    draw(){

        ctx.drawImage(
            spiderImg,
            this.x,
            this.y,
            this.width,
            this.height
        );

    }

}

// ==========================================================
// VAGA-LUME
// ==========================================================

class Firefly{

    constructor(){

        this.width=40;
        this.height=40;

        this.x=-this.width;

        this.y=HEIGHT*0.55+
               Math.random()*HEIGHT*0.30;

        this.speed=6;

        this.active=true;

    }

    update(){

        this.x+=this.speed;

        if(this.x>WIDTH+60){

            this.active=false;

        }

    }

    draw(){

        ctx.drawImage(
            fireflyImg,
            this.x,
            this.y,
            this.width,
            this.height
        );

    }

}

// ==========================================================
// TARTARUGA
// ==========================================================

class Turtle{

    constructor(index){

        this.width=95;
        this.height=60;

        this.x=Math.random()*(WIDTH-150);

        this.y=250+(index*45);

        this.speed=2+(index*.25);

        this.direction=1;

    }

    update(){

        this.x+=this.speed*this.direction;

        if(this.x<20){

            this.direction=1;

        }

        if(this.x+this.width>WIDTH-20){

            this.direction=-1;

        }

    }

    draw(){

        ctx.save();

        // Aplica flip horizontal se a tartaruga estiver andando para a direita
        if(this.direction === 1){

            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(turtleImg, 0, 0, this.width, this.height);

        } else {

            ctx.drawImage(turtleImg, this.x, this.y, this.width, this.height);

        }

        ctx.restore();

    }

}

// ==========================================================
// LÍNGUA
// ==========================================================

class Tongue{

    constructor(){

        this.x=frog.x+frog.width/2;

        this.y=frog.y+frog.height*0.20;

        this.length=0;

        this.speed=TONGUE_SPEED;

        this.returning=false;

        this.active=true;

    }

    update(){

        if(!this.returning){

            this.length+=this.speed;

            if(this.y+this.length>=HEIGHT){

                this.returning=true;

            }

        }else{

            this.length-=this.speed;

            if(this.length<=0){

                this.active=false;

            }

        }

    }

    draw(){

    // posição visual da boca do sapo
    const mouthX = frog.x + frog.width * 0.50;
   const mouthY = frog.y + frog.height * 0.20;

    ctx.strokeStyle = "#ff6fa8";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(mouthX, mouthY);
    ctx.lineTo(mouthX, mouthY + this.length);

    ctx.stroke();

}

}

// ==========================================================
// CRIA UMA NOVA FASE
// ==========================================================

function createLevel(){

    enemies=[];

    turtles=[];

    fireflies=[];

    tongue=null;

    enemyDirection=1;

    enemySpeed=BASE_ENEMY_SPEED+(level-1)*0.35;

    // ---------- moscas ----------

    for(let r=0;r<3;r++){

        for(let c=0;c<4;c++){

            enemies.push(

                new Fly(

                    170+c*130,

                    340+r*60

                )

            );

        }

    }

    // ---------- aranhas ----------

    for(let i=0;i<3+Math.floor(level/3);i++){

        enemies.push(

            new Spider(

                220+Math.random()*500,

                330+Math.random()*160

            )

        );

    }

    // ---------- tartarugas ----------

    for(let i=0;i<level;i++){

        turtles.push(

            new Turtle(i)

        );

    }

    updateHUD();

}

// ==========================================================
// PARTE 2B
// Lógica do jogo
// ==========================================================

// ==========================================================
// MOVIMENTO DO SAPO
// ==========================================================

function updateFrog(){

    if(keys.left){

        frog.x-=frog.speed;

    }

    if(keys.right){

        frog.x+=frog.speed;

    }

    if(frog.x<0){

        frog.x=0;

    }

    if(frog.x+frog.width>WIDTH){

        frog.x=WIDTH-frog.width;

    }

    // lança língua

    if(keys.space && !tongue){

        tongue=new Tongue();

    }

}

// ==========================================================
// MOVIMENTO DOS INIMIGOS
// ==========================================================

function updateEnemies(){

    let changeDirection=false;

    for(const enemy of enemies){

        enemy.x+=enemySpeed*enemyDirection;

        if(enemy.x<10 ||
           enemy.x+enemy.width>WIDTH-10){

            changeDirection=true;

        }

    }

    if(changeDirection){

        enemyDirection*=-1;

        for(const enemy of enemies){

            enemy.y-=enemyDropDistance;

        }

    }

    // ficaram poucos? ficam mais rápidos

    if(enemies.length<=6){

        enemySpeed+=0.002;

    }

}

// ==========================================================
// TARTARUGAS
// ==========================================================

function updateTurtles(){

    for(const turtle of turtles){

        turtle.update();

    }

}

// ==========================================================
// VAGA-LUME
// ==========================================================

function updateFireflies(){

    if(Math.random()<0.0015){

        fireflies.push(

            new Firefly()

        );

    }

    fireflies=fireflies.filter(f=>{

        f.update();

        return f.active;

    });

}

// ==========================================================
// LÍNGUA
// ==========================================================

function updateTongue(){

    if(!tongue){

        return;

    }

    tongue.update();

    const tipY=tongue.y+tongue.length;

    // ---------- moscas e aranhas ----------

    for(let i=enemies.length-1;i>=0;i--){

        const e=enemies[i];

        if(

            tongue.x>e.x &&

            tongue.x<e.x+e.width &&

            tipY>e.y &&

            tipY<e.y+e.height

        ){

            score+=e.points;

            enemies.splice(i,1);

            tongue.returning=true;

            updateHUD();

            return;

        }

    }

    // ---------- tartarugas ----------

    for(const turtle of turtles){

        if(

            tongue.x>turtle.x &&

            tongue.x<turtle.x+turtle.width &&

            tipY>turtle.y &&

            tipY<turtle.y+turtle.height

        ){

            tongue.returning=true;

            return;

        }

    }

    // ---------- vaga-lumes ----------

    for(let i=fireflies.length-1;i>=0;i--){

        const f=fireflies[i];

        if(

            tongue.x>f.x &&

            tongue.x<f.x+f.width &&

            tipY>f.y &&

            tipY<f.y+f.height

        ){

            score+=FIREFLY_POINTS;

            fireflies.splice(i,1);

            tongue.returning=true;

            updateHUD();

            return;

        }

    }

    if(!tongue.active){

        tongue=null;

    }

}

// ==========================================================
// GAME OVER
// ==========================================================

function checkGameOver(){

    for(const enemy of enemies){

        if(enemy.y<=frog.y+frog.height){

            finishGame();

            return;

        }

    }

}

// ==========================================================
// NOVA FASE
// ==========================================================

function checkNextLevel(){

    if(enemies.length===0){

        gameRunning=false;

        level++;

        levelDisplay.textContent=level;

        phaseTitle.textContent=
        "Fase "+level;

        phaseScreen.classList.remove("hidden");

        setTimeout(()=>{

            phaseScreen.classList.add("hidden");

            createLevel();

            gameRunning=true;

        },2000);

    }

}

// ==========================================================
// UPDATE GERAL
// ==========================================================

function update(){

    if(!gameRunning){

        return;

    }

    updateFrog();

    updateEnemies();

    updateTurtles();

    updateFireflies();

    updateTongue();

    checkGameOver();

    checkNextLevel();

}


// ==========================================================
// PARTE 3A
// Renderização
// ==========================================================

// ==========================================================
// DESENHA O SAPO
// ==========================================================

function drawFrog(){

    ctx.drawImage(

        frogImg,

        frog.x,

        frog.y,

        frog.width,

        frog.height

    );

}

// ==========================================================
// DESENHA O CENÁRIO
// ==========================================================

function drawBackground(){

    ctx.clearRect(0,0,WIDTH,HEIGHT);

    ctx.drawImage(

        background,

        0,

        0,

        WIDTH,

        HEIGHT

    );

}

// ==========================================================
// DESENHA OS INIMIGOS
// ==========================================================

function drawEnemies(){

    for(const enemy of enemies){

        enemy.draw();

    }

}

// ==========================================================
// DESENHA AS TARTARUGAS
// ==========================================================

function drawTurtles(){

    for(const turtle of turtles){

        turtle.draw();

    }

}

// ==========================================================
// DESENHA OS VAGA-LUMES
// ==========================================================

function drawFireflies(){

    for(const firefly of fireflies){

        firefly.draw();

    }

}

// ==========================================================
// DESENHA A LÍNGUA
// ==========================================================

function drawTongue(){

    if(tongue){

        tongue.draw();

    }

}

// ==========================================================
// DESENHA TUDO
// ==========================================================

function draw(){

    drawBackground();

    drawEnemies();

    drawFireflies();

    drawTurtles();

    drawTongue();

    drawFrog();

}

// ==========================================================
// GAME OVER
// ==========================================================

function finishGame(){

    gameRunning=false;

    finalScore.textContent=score;

    finalLevel.textContent=level;

    playerName.value="";

    saveScoreBtn.disabled=false;

    updateRanking();

    if(isTopTen(score)){

        resultMessage.innerHTML=

        `🐸 Excelente!<br>
        Você entrou para o <strong>Top 10</strong>!`;

        saveArea.style.display="block";

    }else{

        resultMessage.innerHTML=

        `Fim de jogo!<br>
        Você fez <strong>${score}</strong> pontos
        e chegou à fase <strong>${level}</strong>.`;

        saveArea.style.display="none";

    }

    gameOverScreen.classList.remove("hidden");

}

// ==========================================================
// LOOP PRINCIPAL
// ==========================================================

function gameLoop(){

    update();

    draw();

    requestAnimationFrame(gameLoop);

}

// ==========================================================
// INICIA O LOOP
// ==========================================================

gameLoop();

// ==========================================================
// PARTE 3B
// Ranking e Menus
// ==========================================================

// ==========================================================
// LOCAL STORAGE
// ==========================================================

const RANKING_KEY = "rankingSapo";

function getRanking(){

    return JSON.parse(localStorage.getItem(RANKING_KEY)) || [];

}

function saveRanking(ranking){

    localStorage.setItem(

        RANKING_KEY,

        JSON.stringify(ranking)

    );

}

// ==========================================================
// VERIFICA TOP 10
// ==========================================================

function isTopTen(score){

    const ranking=getRanking();

    if(ranking.length<10){

        return true;

    }

    ranking.sort((a,b)=>b.score-a.score);

    return score>ranking[9].score;

}

// ==========================================================
// ATUALIZA RANKING
// ==========================================================

function updateRanking(highlightPlayer=null){

    const ranking=getRanking();

    ranking.sort((a,b)=>b.score-a.score);

    ranking.splice(10);

    rankingList.innerHTML="";
    rankingOnlyList.innerHTML="";

    ranking.forEach((player,index)=>{

        const li=document.createElement("li");

        if(player===highlightPlayer){

            li.classList.add("ranking-highlight");

        }

        let medal="";

        if(index===0) medal="🥇 ";
        else if(index===1) medal="🥈 ";
        else if(index===2) medal="🥉 ";

        li.innerHTML=`

            <span>

                ${medal}${player.name}

                <small>

                    (Fase ${player.level})

                </small>

            </span>

            <strong>

                ${player.score}

            </strong>

        `;

        rankingList.appendChild(li);

        rankingOnlyList.appendChild(li.cloneNode(true));

    });

}

// ==========================================================
// SALVAR PONTUAÇÃO
// ==========================================================

saveScoreBtn.addEventListener("click",()=>{

    const name=playerName.value.trim();

    if(name===""){

        alert("Digite seu nome.");

        return;

    }

    let ranking=getRanking();

    const newPlayer={

        name:name,

        score:score,

        level:level

    };

    ranking.push(newPlayer);

    ranking.sort((a,b)=>b.score-a.score);

    ranking.splice(10);

    saveRanking(ranking);

    updateRanking(newPlayer);

    saveArea.style.display="none";

    saveScoreBtn.disabled=true;

});

// ==========================================================
// BOTÃO TOP 10
// ==========================================================

rankingBtn.addEventListener(()=>{

    updateRanking();

    rankingScreen.classList.remove("hidden");

});

closeRankingBtn.addEventListener("click",()=>{

    rankingScreen.classList.add("hidden");

});

// ==========================================================
// REINICIAR
// ==========================================================

restartBtn.addEventListener("click",()=>{

    gameOverScreen.classList.add("hidden");

    resetGame();

    createLevel();

    gameRunning=true;

});

// ==========================================================
// PRIMEIRA CARGA
// ==========================================================

updateRanking();