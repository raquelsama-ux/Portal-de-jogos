//=========================================================
// JOANINHA - ARKANOID
// Parte 1
//=========================================================

//=============================
// CANVAS
//=============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//=============================
// IMAGENS
//=============================

const imgBackground = new Image();
imgBackground.src = "assets/joaninha/fundojoaninha.jpg";

const imgLadybug = new Image();
imgLadybug.src = "assets/joaninha/joaninha.png";

const imgBar = new Image();
imgBar.src = "assets/joaninha/barra.png";

const imgDragonfly = new Image();
imgDragonfly.src = "assets/joaninha/libelula.png";

const imgFirefly = new Image();
imgFirefly.src = "assets/joaninha/vagalume.png";

const imgHeart = new Image();
imgHeart.src = "assets/joaninha/coracao.png";

//=============================
// HUD
//=============================

const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const levelDisplay = document.getElementById("level");
const ballsDisplay = document.getElementById("balls");

//=============================
// MENUS
//=============================

const startScreen = document.getElementById("startScreen");
const phaseScreen = document.getElementById("phaseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const rankingScreen = document.getElementById("rankingScreen");

const phaseTitle = document.getElementById("phaseTitle");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const rankingBtn = document.getElementById("rankingBtn");
const closeRankingBtn = document.getElementById("closeRankingBtn");

const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");

const rankingList = document.getElementById("rankingList");
const rankingOnlyList = document.getElementById("rankingOnlyList");

const playerName = document.getElementById("playerName");
const saveScoreBtn = document.getElementById("saveScoreBtn");

//=============================
// MENU SANDUICHE
//=============================

const menuToggle = document.getElementById("menuToggle");
const dropdownMenu = document.getElementById("dropdownMenu");

menuToggle.addEventListener("click", () => {

    dropdownMenu.classList.toggle("is-open");

});

document.addEventListener("click", e=>{

    if(
        !dropdownMenu.contains(e.target) &&
        e.target!==menuToggle
    ){

        dropdownMenu.classList.remove("is-open");

    }

});

//=============================
// CONFIGURAÇÕES
//=============================

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const BRICK_ROWS = 6;
const BRICK_COLS = 10;

const BRICK_WIDTH = 86;
const BRICK_HEIGHT = 28;

const BRICK_GAP = 8;

const TOP_MARGIN = 80;

const PADDLE_WIDTH = 170;
const PADDLE_HEIGHT = 26;

const BALL_SIZE = 22;

const POWER_TIME = 8000;

//=============================
// ESTADO DO JOGO
//=============================

let score = 0;
let level = 1;
let lives = 3;

let gameRunning = false;

let powerMode = false;
let powerTimer = 0;

let lastTime = 0;

//=============================
// OBJETOS
//=============================

let paddle;

let balls = [];

let bricks = [];

let powerUps = [];

let dragonfly = null;

//=============================
// TECLADO
//=============================

const keys = {};

window.addEventListener("keydown", e=>{

    keys[e.code]=true;

});

window.addEventListener("keyup", e=>{

    keys[e.code]=false;

});

//=============================
// RANKING
//=============================

function getRanking(){

    return JSON.parse(
        localStorage.getItem("rankingJoaninha") || "[]"
    );

}

function saveRanking(name,score,level){

    const ranking = getRanking();

    ranking.push({

        name,
        score,
        level

    });

    ranking.sort((a,b)=>{

        if(b.score!==a.score)
            return b.score-a.score;

        return b.level-a.level;

    });

    ranking.splice(10);

    localStorage.setItem(

        "rankingJoaninha",

        JSON.stringify(ranking)

    );

}

function showRanking(listElement){

    const ranking = getRanking();

    listElement.innerHTML="";

    ranking.forEach((player,index)=>{

        const li=document.createElement("li");

        li.innerHTML=`
            <strong>${index+1}.</strong>
            ${player.name}
            <span>
                ${player.score} pts
                (Fase ${player.level})
            </span>
        `;

        listElement.appendChild(li);

    });

}

//=============================
// ATUALIZA HUD
//=============================

function updateHUD(){

    scoreDisplay.textContent=score;

    levelDisplay.textContent=level;

    ballsDisplay.textContent=balls.length;

    livesDisplay.textContent="❤️".repeat(lives);

}

//=========================================================
// PARTE 2A
// Classes principais
//=========================================================

//=============================
// BARRA
//=============================

class Paddle{

    constructor(){

        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;

        this.x = WIDTH/2 - this.width/2;
        this.y = HEIGHT - 55;

        this.speed = 9;

    }

    update(){

        if(keys["ArrowLeft"]){

            this.x -= this.speed;

        }

        if(keys["ArrowRight"]){

            this.x += this.speed;

        }

        if(this.x < 0){

            this.x = 0;

        }

        if(this.x + this.width > WIDTH){

            this.x = WIDTH - this.width;

        }

    }

    draw(){

        ctx.drawImage(

            imgBar,

            this.x,

            this.y,

            this.width,

            this.height

        );

    }

}

//=============================
// JOANINHA
//=============================

class Ball{

    constructor(x,y,dx,dy){

        this.radius = BALL_SIZE/2;

        this.x = x;
        this.y = y;

        this.dx = dx;
        this.dy = dy;

        this.rotation = 0;

        this.rotationSpeed = 0;

        this.power = false;

    }

    update(){

        this.rotation += this.rotationSpeed;

        this.x += this.dx;
        this.y += this.dy;

        // parede esquerda

        if(this.x < this.radius){

            this.x = this.radius;
            this.dx *= -1;

        }

        // parede direita

        if(this.x > WIDTH - this.radius){

            this.x = WIDTH - this.radius;
            this.dx *= -1;

        }

        // teto

        if(this.y < this.radius){

            this.y = this.radius;
            this.dy *= -1;

        }

        // barra

        if(

            this.y + this.radius >= paddle.y &&
            this.y - this.radius <= paddle.y + paddle.height &&
            this.x >= paddle.x &&
            this.x <= paddle.x + paddle.width &&
            this.dy > 0

        ){

            this.y = paddle.y - this.radius;

            let hit =

                (this.x - paddle.x) / paddle.width;

            hit -= 0.5;

            this.dx = hit * 10;

            this.dy =

                -Math.sqrt(

                    Math.max(

                        8,

                        36 - this.dx*this.dx

                    )

                );

            this.rotationSpeed = this.dx * 0.08;

        }

    }

    draw(){

        ctx.save();

        ctx.translate(

            this.x,

            this.y

        );

        ctx.rotate(this.rotation);

        ctx.drawImage(

            imgLadybug,

            -this.radius,

            -this.radius,

            BALL_SIZE,

            BALL_SIZE

        );

        if(this.power){

            ctx.shadowBlur = 18;
            ctx.shadowColor = "#ffd93b";

        }

        ctx.restore();

    }

}

//=============================
// BLOCO
//=============================

class Brick{

    constructor(x,y,color){

        this.x = x;
        this.y = y;

        this.width = BRICK_WIDTH;
        this.height = BRICK_HEIGHT;

        this.color = color;

        this.alive = true;

    }

    draw(){

        if(!this.alive) return;

        ctx.fillStyle = this.color;

        ctx.beginPath();

        ctx.roundRect(

            this.x,

            this.y,

            this.width,

            this.height,

            8

        );

        ctx.fill();

        ctx.strokeStyle="rgba(255,255,255,.35)";
        ctx.lineWidth=2;
        ctx.stroke();

    }

}

//=============================
// CORES DOS BLOCOS
//=============================

const brickColors=[

    "#F95738",

    "#EE964B",

    "#F4D35E",

    "#7BC96F",

    "#63ADF2",

    "#A66DD4"

];

//=========================================================
// PARTE 2B
// Power-ups e Inimigos Especiais
//=========================================================

//=============================
// LIBÉLULA
//=============================

class Dragonfly{

    constructor(){

        this.width = 70;
        this.height = 50;

        this.x = -this.width;

        this.y = 170 + Math.random()*220;

        this.speed = 4;

        this.active = true;

    }

    update(){

        this.x += this.speed;

        if(this.x > WIDTH + this.width){

            this.active = false;

        }

    }

    draw(){

    ctx.save();

    ctx.translate(this.x + this.width, this.y);

    ctx.scale(-1,1);

    ctx.drawImage(

        imgDragonfly,

        0,

        0,

        this.width,

        this.height

    );

    ctx.restore();

}

}

//=============================
// POWER-UP
//=============================

class PowerUp{

    constructor(type,x,y){

        this.type = type;

        this.x = x;
        this.y = y;

        this.width = 34;
        this.height = 34;

        this.speed = 3;

        this.active = true;

    }

    update(){

        this.y += this.speed;

        if(this.y > HEIGHT){

            this.active = false;

        }

    }

    draw(){

        let img;

        if(this.type==="firefly"){

            img = imgFirefly;

        }else{

            img = imgHeart;

        }

        ctx.drawImage(

            img,

            this.x,

            this.y,

            this.width,

            this.height

        );

    }

}

//=============================
// GERA POWER-UP
//=============================

function spawnPowerUp(x,y){

    const r = Math.random();

    // 1% vaga-lume

    if(r < 0.01){

        powerUps.push(

            new PowerUp(

                "firefly",

                x,

                y

            )

        );

        return;

    }

    // 0,5% coração

    if(r < 0.015){

        powerUps.push(

            new PowerUp(

                "heart",

                x,

                y

            )

        );

    }

}

//=============================
// GERA LIBÉLULA
//=============================

let dragonflyTimer = 0;

function updateDragonfly(delta){

    dragonflyTimer += delta;

    if(

        dragonfly===null &&

        dragonflyTimer >

        18000 + Math.random()*12000

    ){

        dragonfly = new Dragonfly();

        dragonflyTimer = 0;

    }

    if(dragonfly){

        dragonfly.update();

        if(!dragonfly.active){

            dragonfly = null;

        }

    }

}

//=============================
// POWERUPS
//=============================

function updatePowerUps(){

    for(const p of powerUps){

        p.update();

    }

    powerUps = powerUps.filter(

        p=>p.active

    );

}

//=============================
// DESENHA POWERUPS
//=============================

function drawPowerUps(){

    for(const p of powerUps){

        p.draw();

    }

}

//=============================
// DESENHA LIBÉLULA
//=============================

function drawDragonfly(){

    if(dragonfly){

        dragonfly.draw();

    }

}

//=========================================================
// PARTE 3A
// Mecânica do jogo
//=========================================================

//=============================
// CRIA FASE
//=============================

function createLevel(){

    bricks=[];

    const rows=Math.min(5+level,10);

    const offsetX=

        (WIDTH-(BRICK_COLS*BRICK_WIDTH+(BRICK_COLS-1)*BRICK_GAP))/2;

    for(let r=0;r<rows;r++){

        for(let c=0;c<BRICK_COLS;c++){

            bricks.push(

                new Brick(

                    offsetX+c*(BRICK_WIDTH+BRICK_GAP),

                    TOP_MARGIN+r*(BRICK_HEIGHT+BRICK_GAP),

                    brickColors[r%brickColors.length]

                )

            );

        }

    }

}

//=============================
// MULTIBALL
//=============================

function splitBall(ball){

    const speed=Math.sqrt(ball.dx*ball.dx+ball.dy*ball.dy);

    const angle=Math.atan2(ball.dy,ball.dx);

    const a1=angle-0.35;
    const a2=angle+0.35;

    ball.dx=Math.cos(a1)*speed;
    ball.dy=Math.sin(a1)*speed;

    balls.push(

        new Ball(

            ball.x,

            ball.y,

            Math.cos(a2)*speed,

            Math.sin(a2)*speed

        )

    );

}

//=============================
// COLISÃO COM BLOCOS
//=============================

function updateBricks(){

    for(const ball of balls){

        for(const brick of bricks){

            if(!brick.alive) continue;

            if(

                ball.x+ball.radius>brick.x &&
                ball.x-ball.radius<brick.x+brick.width &&
                ball.y+ball.radius>brick.y &&
                ball.y-ball.radius<brick.y+brick.height

            ){

                brick.alive=false;

                score+=10;

                spawnPowerUp(

                    brick.x+brick.width/2,

                    brick.y

                );

                if(!ball.power){

                    ball.dy*=-1;

                }

            }

        }

    }

    bricks=bricks.filter(b=>b.alive);

}

//=============================
// COLISÃO LIBÉLULA
//=============================

function updateDragonflyCollision(){

    if(!dragonfly) return;

    for(const ball of balls){

        if(

            ball.x>dragonfly.x &&
            ball.x<dragonfly.x+dragonfly.width &&
            ball.y>dragonfly.y &&
            ball.y<dragonfly.y+dragonfly.height

        ){

            score+=100;

            splitBall(ball);

            dragonfly.active=false;

            dragonfly=null;

            return;

        }

    }

}

//=============================
// POWERUPS
//=============================

function updatePowerCollision(){

    for(const p of powerUps){

        if(

            p.y+p.height>=paddle.y &&
            p.x+p.width>=paddle.x &&
            p.x<=paddle.x+paddle.width

        ){

            if(p.type==="firefly"){

                powerMode=true;

                powerTimer=performance.now()+POWER_TIME;

                balls.forEach(

                    b=>b.power=true

                );

            }

            if(p.type==="heart"){

                if(lives<5){

                    lives++;

                }

            }

            p.active=false;

        }

    }

}

//=============================
// MODO PODEROSO
//=============================

function updatePowerMode(){

    if(

        powerMode &&

        performance.now()>powerTimer

    ){

        powerMode=false;

        balls.forEach(

            b=>b.power=false

        );

    }

}

//=============================
// VIDAS
//=============================

function checkLives(){

    balls=balls.filter(

        b=>b.y<HEIGHT+50

    );

    if(balls.length>0) return;

    lives--;

    if(lives<=0){

        finishGame();

        return;

    }

    balls=[

        new Ball(

            paddle.x+paddle.width/2,

            paddle.y-25,

            4+level*0.4,

            -5-level*0.3

        )

    ];

}

//=============================
// PRÓXIMA FASE
//=============================

function nextLevel(){

    if(bricks.length>0) return;

    score+=500*level;

    level++;

    phaseTitle.textContent=

        "Fase "+level;

    phaseScreen.classList.remove("hidden");

    setTimeout(()=>{

        phaseScreen.classList.add("hidden");

    },1800);

    createLevel();

    balls=[

        new Ball(

            paddle.x+paddle.width/2,

            paddle.y-25,

            4+level*0.4,

            -5-level*0.3

        )

    ];

}

//=========================================================
// PARTE 3B
// Loop principal, menus e ranking
//=========================================================

//=============================
// DESENHA BLOCOS
//=============================

function drawBricks(){

    for(const brick of bricks){

        brick.draw();

    }

}

//=============================
// DESENHA TODAS AS JOANINHAS
//=============================

function drawBalls(){

    for(const ball of balls){

        ball.draw();

    }

}

//=============================
// UPDATE GERAL
//=============================

function update(){

    if(!gameRunning) return;

    paddle.update();

    for(const ball of balls){

        ball.update();

    }

    updateBricks();

    updateDragonfly(16);

    updateDragonflyCollision();

    updatePowerUps();

    updatePowerCollision();

    updatePowerMode();

    checkLives();

    nextLevel();

    updateHUD();

}

//=============================
// DRAW
//=============================

function draw(){

    ctx.clearRect(0,0,WIDTH,HEIGHT);

    ctx.drawImage(

        imgBackground,

        0,

        0,

        WIDTH,

        HEIGHT

    );

    drawBricks();

    drawDragonfly();

    drawPowerUps();

    paddle.draw();

    drawBalls();

}

//=============================
// LOOP
//=============================

function gameLoop(time){

    const delta=time-lastTime;

    lastTime=time;

    update(delta);

    draw();

    requestAnimationFrame(gameLoop);

}

//=============================
// GAME OVER
//=============================

function finishGame(){

    gameRunning=false;

    finalScore.textContent=score;

    finalLevel.textContent=level;

    playerName.value="";

    rankingList.innerHTML="";

    showRanking(rankingList);

    gameOverScreen.classList.remove("hidden");

}

//=============================
// NOVO JOGO
//=============================

function newGame(){

    score=0;

    level=1;

    lives=3;

    powerMode=false;

    dragonfly=null;

    powerUps=[];

    paddle=new Paddle();

    balls=[

        new Ball(

            paddle.x+paddle.width/2,

            paddle.y-25,

            5,

            -5

        )

    ];

    createLevel();

    updateHUD();

}

//=============================
// BOTÃO COMEÇAR
//=============================

startBtn.addEventListener("click",()=>{

    startScreen.classList.add("hidden");

    newGame();

    gameRunning=true;

});

//=============================
// REINICIAR
//=============================

restartBtn.addEventListener("click",()=>{

    gameOverScreen.classList.add("hidden");

    newGame();

    gameRunning=true;

});

//=============================
// SALVAR RANKING
//=============================

saveScoreBtn.addEventListener("click",()=>{

    const name=playerName.value.trim();

    if(name===""){

        alert("Digite seu nome.");

        return;

    }

    saveRanking(

        name,

        score,

        level

    );

    showRanking(rankingList);

    showRanking(rankingOnlyList);

    saveScoreBtn.disabled=true;

});

//=============================
// MENU TOP 10
//=============================

rankingBtn.addEventListener("click",()=>{

    showRanking(rankingOnlyList);

    rankingScreen.classList.remove("hidden");

});

closeRankingBtn.addEventListener("click",()=>{

    rankingScreen.classList.add("hidden");

});

//=============================
// PAUSA
//=============================

window.addEventListener("keydown",e=>{

    if(e.code==="Escape"){

        gameRunning=!gameRunning;

    }

});

//=============================
// ESPAÇO
//=============================

window.addEventListener("keydown",e=>{

    if(e.code==="Space" && !gameRunning){

        gameRunning=true;

    }

});

//=============================
// INICIALIZAÇÃO
//=============================

newGame();

showRanking(rankingOnlyList);

requestAnimationFrame(gameLoop);