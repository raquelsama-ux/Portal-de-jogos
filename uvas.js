// =========================
// ELEMENTOS
// =========================

const gameArea = document.getElementById("gameArea");
const kitty = document.getElementById("kitty");
const kuromi = document.getElementById("kuromi");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const timerBar = document.getElementById("timerBar");

const startOverlay =
    document.getElementById("startOverlay");

const resultOverlay = document.getElementById("resultOverlay");
const multiplayerResultOverlay = 
    document.getElementById("multiplayerResultOverlay");

const finalTitle = document.getElementById("finalTitle");
const finalScore = document.getElementById("finalScore");
const finalRank = document.getElementById("finalRank");

const multiplayerWinner = document.getElementById("multiplayerWinner");
const kittyScoreDisplay = document.getElementById("kittyScore");
const kuromiScoreDisplay = document.getElementById("kuromiScore");
const winnerImg = document.getElementById("winnerImg");

const difficultyLabel =
    document.getElementById("difficultyLabel");

const difficultySelect =
    document.getElementById("difficultySelect");

const btnStart =
    document.getElementById("startBtn");

const multiplayerBtn =
    document.getElementById("multiplayerBtn");

const rankingBtn =
    document.getElementById("rankingBtn");

const rankingOverlay =
    document.getElementById("rankingOverlay");

const rankingList =
    document.getElementById("rankingList");

const rankingBackBtn =
    document.getElementById("rankingBackBtn");

const multiplayerBackBtn =
    document.getElementById("multiplayerBackBtn");

const playerNameInput =
    document.getElementById("playerNameInput");

const saveScoreBtn =
    document.getElementById("saveScoreBtn");

const btnRestart =
    document.getElementById("restartBtn");

const STORAGE_KEY = "helloKittyRanking";
const MAX_RANKING = 10;

// =========================
// VARIÁVEIS
// =========================

let score = 0;
let timeLeft = 30;

let gameRunning = false;
let stunned = false;
let multiplayerMode = false;

let difficulty = "easy";

let kittyX = 400;
let kuromiX = 400;

let kittyScore = 0;
let kuromiScore = 0;
let kittyStunned = false;
let kuromiStunned = false;

let spawnInterval;
let timerInterval;

const keys = {};

// =========================
// CONTROLES
// =========================

document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// =========================
// BOTÕES
// =========================

btnStart.addEventListener("click", () => {
    const selectedDifficulty = difficultySelect.value || "easy";
    startGame(selectedDifficulty);
});

rankingBtn.addEventListener("click", () => {
    showRanking();
});

rankingBackBtn.addEventListener("click", () => {
    rankingOverlay.style.display = "none";
    startOverlay.style.display = "flex";
});

saveScoreBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim() || "Jogador";
    saveHighScore(name, score);
    playerNameInput.value = "";
    resultOverlay.style.display = "none";
    showRanking();
});

multiplayerBtn.addEventListener("click", () => {
    startMultiplayer();
});

multiplayerBackBtn.addEventListener("click", () => {
    multiplayerResultOverlay.style.display = "none";
    startOverlay.style.display = "flex";
});

btnRestart.addEventListener("click", () => {
    location.reload();
});

window.addEventListener("load", () => {
    startOverlay.style.display = "flex";
});

// =========================
// INICIAR JOGO
// =========================

function startGame(mode){

    difficulty = mode;

    difficultyLabel.textContent =
        mode === "easy"
        ? "🌸 Fácil"
        : "⭐ Difícil";

    startOverlay.style.display = "none";

    score = 0;
    timeLeft = 30;

    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;

    if(timerBar){
        timerBar.style.width = "100%";
    }

    kittyX =
        (gameArea.offsetWidth / 2) -
        (kitty.offsetWidth / 2);

    kitty.style.left = kittyX + "px";

    resetCharacterExpression(kitty);
    resetCharacterExpression(kuromi);

    clearObjects();

    resultOverlay.style.display = "none";
    rankingOverlay.style.display = "none";
    playerNameInput.value = "";

    gameRunning = true;

    spawnInterval = setInterval(
        spawnObject,
        mode === "easy" ? 700 : 450
    );

    timerInterval = setInterval(() => {

        timeLeft--;

        timerDisplay.textContent =
            timeLeft;

        if(timerBar){

            timerBar.style.width =
                ((timeLeft / 30) * 100) + "%";

        }

        if(timeLeft <= 0){

            endGame();

        }

    }, 1000);

    requestAnimationFrame(gameLoop);
}

// =========================
// INICIAR JOGO MULTIPLAYER
// =========================

function startMultiplayer(){

    multiplayerMode = true;
    difficulty = "easy";

    startOverlay.style.display = "none";

    kittyScore = 0;
    kuromiScore = 0;
    timeLeft = 30;

    scoreDisplay.textContent = "🐱 " + kittyScore + " | 🖤 " + kuromiScore;
    timerDisplay.textContent = timeLeft;

    if(timerBar){
        timerBar.style.width = "100%";
    }

    kittyX = 150;
    kuromiX = gameArea.offsetWidth - 150;

    kitty.style.display = "block";
    kuromi.style.display = "block";

    kitty.style.left = kittyX + "px";
    kuromi.style.left = kuromiX + "px";

    resetCharacterExpression(kitty);
    resetCharacterExpression(kuromi);

    kittyStunned = false;
    kuromiStunned = false;

    clearObjects();

    resultOverlay.style.display = "none";
    multiplayerResultOverlay.style.display = "none";
    playerNameInput.value = "";

    gameRunning = true;

    spawnInterval = setInterval(
        spawnObject,
        600
    );

    timerInterval = setInterval(() => {

        timeLeft--;

        timerDisplay.textContent = timeLeft;

        if(timerBar){
            timerBar.style.width =
                ((timeLeft / 30) * 100) + "%";
        }

        if(timeLeft <= 0){
            endMultiplayer();
        }

    }, 1000);

    requestAnimationFrame(gameLoop);
}

// =========================
// LOOP PRINCIPAL
// =========================

function gameLoop(){

    if(!gameRunning) return;

    if(multiplayerMode){
        moveKitty();
        moveKuromi();
    } else {
        moveKitty();
    }

    moveObjects();

    requestAnimationFrame(gameLoop);
}

// =========================
// MOVIMENTO KITTY
// =========================

function moveKitty(){

    if(stunned) return;

    let speed =
        difficulty === "easy"
        ? 8
        : 10;

    if(keys["a"] || (!multiplayerMode && keys["arrowleft"])){

        kittyX -= speed;

    }

    if(keys["d"] || (!multiplayerMode && keys["arrowright"])){

        kittyX += speed;

    }

    const max =
        gameArea.offsetWidth -
        kitty.offsetWidth;

    if(kittyX < 0){
        kittyX = 0;
    }

    if(kittyX > max){
        kittyX = max;
    }

    kitty.style.left =
        kittyX + "px";
}

// =========================
// MOVIMENTO KUROMI
// =========================

function moveKuromi(){

    if(kuromiStunned) return;

    let speed = 8;

    if(keys["arrowleft"]){
        kuromiX -= speed;
    }

    if(keys["arrowright"]){
        kuromiX += speed;
    }

    const max =
        gameArea.offsetWidth -
        kuromi.offsetWidth;

    if(kuromiX < 0){
        kuromiX = 0;
    }

    if(kuromiX > max){
        kuromiX = max;
    }

    kuromi.style.left =
        kuromiX + "px";
}

// =========================
// CRIAR OBJETOS
// =========================

function spawnObject(){

    if(!gameRunning) return;

    const random = Math.random();

    const obj =
        document.createElement("img");

    let type;

    if(random < 0.10){

        type = "gold";

        obj.src =
            "assets/uvas/uvagold.png";

        obj.className =
            "goldRibbon";

    }
    else if(random < 0.18){

        type = "lagarta";

        obj.src =
            "assets/uvas/lagarta.png";

        obj.className =
            "bat";

    }
    else{

        type = "ribbon";

        obj.src =
            "assets/uvas/uva.png";

        obj.className =
            "ribbon";

    }

    obj.dataset.type = type;

    obj.style.left =
        Math.random() *
        (gameArea.offsetWidth - 60)
        + "px";

    obj.style.top = "-60px";

    gameArea.appendChild(obj);
}

// =========================
// MOVIMENTO OBJETOS
// =========================

function moveObjects(){

    const objects =
        document.querySelectorAll(
            ".ribbon, .goldRibbon, .bat"
        );

    objects.forEach((obj)=>{

        let speed =
            difficulty === "easy"
            ? 5
            : 8;

        if(obj.classList.contains("bat")){

            speed += 1;

        }

        const currentTop =
            parseFloat(obj.style.top);

        obj.style.top =
            (currentTop + speed) + "px";

        if(checkCollision(obj, kitty)){

            collectObject(obj, multiplayerMode ? "kitty" : "single");

        } else if(multiplayerMode && checkCollision(obj, kuromi)){

            collectObject(obj, "kuromi");

        }

        if(currentTop >
            gameArea.offsetHeight){

            obj.remove();

        }

    });
}

// =========================
// COLISÕES
// =========================

function checkCollision(a, b){

    const rect1 =
        a.getBoundingClientRect();

    const rect2 =
        b.getBoundingClientRect();

    return !(

        rect1.top >
        rect2.bottom ||

        rect1.bottom <
        rect2.top ||

        rect1.left >
        rect2.right ||

        rect1.right <
        rect2.left

    );
}

function collectObject(obj, player = "single"){

    const type =
        obj.dataset.type;

    let points = 0;

    if(type === "ribbon"){

        points = 1;

        if(player === "kitty") kittyScore += 1;
        else if(player === "kuromi") kuromiScore += 1;
        else score += 1;

    }

    if(type === "gold"){

        points = 3;

        if(player === "kitty") kittyScore += 3;
        else if(player === "kuromi") kuromiScore += 3;
        else score += 3;

    }

    if(type === "lagarta"){

        if(player === "kitty") {
            setCharacterExpression(kitty, "sad", 3000);
            stunKitty();
        }
        else if(player === "kuromi") {
            setCharacterExpression(kuromi, "sad", 3000);
            stunKuromi();
        }
        else {
            setCharacterExpression(kitty, "sad", 3000);
            stunKitty();
        }

        obj.remove();

        return;
    }

    if(player === "kitty" || player === "single"){
        setCharacterExpression(kitty, "happy", 450);
    } else if(player === "kuromi"){
        setCharacterExpression(kuromi, "happy", 450);
    }

    if(player === "single" || player === "kitty"){
        showFloatingText("+" + points, kitty);
    } else if(player === "kuromi"){
        showFloatingText("+" + points, kuromi);
    }

    if(multiplayerMode){
        scoreDisplay.textContent = "🐱 " + kittyScore + " | 🖤 " + kuromiScore;
    } else {
        scoreDisplay.textContent = score;
    }

    obj.remove();
}

// =========================
// EXPRESSÃO DO PERSONAGEM
// =========================

function setCharacterExpression(character, expression, duration = 450){

    const neutralSrc = "assets/uvas/raposaneutra.png";
    const happySrc = "assets/uvas/raposafeliz.png";
    const sadSrc = "assets/uvas/raposatriste.png";

    let nextSrc = neutralSrc;

    if(expression === "happy"){
        nextSrc = happySrc;
    }
    else if(expression === "sad"){
        nextSrc = sadSrc;
    }

    character.src = nextSrc;

    clearTimeout(character.expressionTimer);

    character.expressionTimer = setTimeout(() => {
        character.src = neutralSrc;
    }, duration);
}

function resetCharacterExpression(character){

    clearTimeout(character.expressionTimer);
    character.src = "assets/uvas/raposaneutra.png";
}

// =========================
// TONTURA
// =========================

function stunKitty(){

    if(stunned) return;

    stunned = true;

    const stars =
        document.createElement("img");

    stars.src =
        "assets/uvas/stars.gif";

    stars.className =
        "stars";

    gameArea.appendChild(stars);

    function updateStars(){

        if(!stunned){

            stars.remove();
            return;

        }

        stars.style.left =
            (kitty.offsetLeft - 10)
            + "px";

        stars.style.top =
            (kitty.offsetTop - 40)
            + "px";

        requestAnimationFrame(
            updateStars
        );
    }

    updateStars();

    setTimeout(() => {

        stunned = false;

        stars.remove();

    }, 3000);
}

// =========================
// TONTURA KUROMI
// =========================

function stunKuromi(){

    if(kuromiStunned) return;

    kuromiStunned = true;

    const stars =
        document.createElement("img");

    stars.src =
        "assets/uvas/stars.gif";

    stars.className =
        "stars";

    gameArea.appendChild(stars);

    function updateStars(){

        if(!kuromiStunned){

            stars.remove();
            return;

        }

        stars.style.left =
            (kuromi.offsetLeft - 10)
            + "px";

        stars.style.top =
            (kuromi.offsetTop - 40)
            + "px";

        requestAnimationFrame(
            updateStars
        );
    }

    updateStars();

    setTimeout(() => {

        kuromiStunned = false;

        stars.remove();

    }, 3000);
}

// =========================
// TEXTO FLUTUANTE
// =========================

function showFloatingText(text, character){

    const floatingText = document.createElement("div");
    floatingText.textContent = text;
    floatingText.className = "floating-text";

    const charRect = character.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();

    floatingText.style.left = (charRect.left - gameAreaRect.left + charRect.width / 2 - 15) + "px";
    floatingText.style.top = (charRect.top - gameAreaRect.top - 50) + "px";

    gameArea.appendChild(floatingText);

    let opacity = 1;
    let positionY = charRect.top - gameAreaRect.top - 50;

    const floatInterval = setInterval(() => {

        positionY -= 2;
        opacity -= 0.05;

        floatingText.style.top = positionY + "px";
        floatingText.style.opacity = opacity;

        if(opacity <= 0){
            clearInterval(floatInterval);
            floatingText.remove();
        }

    }, 30);
}

// =========================
// RANKING
// =========================

function getRank(){

    if(difficulty === "easy"){

        if(score >= 45)
            return "👑 Rainha dos Laços";

        if(score >= 35)
            return "💖 Princesa Kawaii";

        if(score >= 25)
            return "🌸 Amiga da Hello Kitty";

        if(score >= 15)
            return "🎀 Colecionadora de Laços";

        return "🐱 Aprendiz Sanrio";
    }

    if(score >= 60)
        return "👑 Rainha dos Laços";

    if(score >= 45)
        return "💖 Princesa Kawaii";

    if(score >= 30)
        return "🌸 Amiga da Hello Kitty";

    if(score >= 20)
        return "🎀 Colecionadora de Laços";

    return "🐱 Aprendiz Sanrio";
}

// =========================
// FINAL
// =========================

function endGame(){

    gameRunning = false;

    clearInterval(spawnInterval);
    clearInterval(timerInterval);

    finalTitle.textContent =
        "🎉 Tempo Esgotado!";

    finalScore.textContent =
        "Pontuação: " + score;

    finalRank.textContent =
        getRank();

    if(isHighScore(score)){
        document.getElementById("namePrompt").style.display = "block";
        playerNameInput.value = "";
        playerNameInput.focus();
        btnRestart.style.display = "none";
    } else {
        document.getElementById("namePrompt").style.display = "none";
        btnRestart.style.display = "inline-block";
    }

    resultOverlay.style.display =
        "flex";
}

// =========================
// FIM DO JOGO MULTIPLAYER
// =========================

function endMultiplayer(){

    gameRunning = false;
    multiplayerMode = false;

    clearInterval(spawnInterval);
    clearInterval(timerInterval);

    kitty.style.display = "block";
    kuromi.style.display = "none";

    kittyScoreDisplay.textContent = "Pontuação: " + kittyScore;
    kuromiScoreDisplay.textContent = "Pontuação: " + kuromiScore;

    if(kittyScore > kuromiScore){
        multiplayerWinner.textContent = "🎉 Hello Kitty venceu!";
        winnerImg.src = "assets/uvas/raposafeliz.png";
    } else if(kuromiScore > kittyScore){
        multiplayerWinner.textContent = "🎉 Kuromi venceu!";
        winnerImg.src = "assets/uvas/raposatriste.png";
    } else {
        multiplayerWinner.textContent = "🤝 Empate!";
        winnerImg.src = "";
    }

    multiplayerResultOverlay.style.display = "flex";
}

function getRanking(){
    const data = localStorage.getItem(STORAGE_KEY);
    if(!data) return [];

    try{
        const parsed = JSON.parse(data);
        if(!Array.isArray(parsed)) return [];
        return parsed.sort((a,b)=> b.score - a.score).slice(0,MAX_RANKING);
    } catch {
        return [];
    }
}

function setRanking(ranking){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ranking.slice(0,MAX_RANKING)));
}

function isHighScore(value){
    const ranking = getRanking();
    return ranking.length < MAX_RANKING || value >= ranking[ranking.length - 1].score;
}

function saveHighScore(name, value){
    const ranking = getRanking();
    ranking.push({ name, score: value });
    setRanking(ranking.sort((a,b)=> b.score - a.score));
}

function showRanking(){
    const ranking = getRanking();
    rankingList.innerHTML = "";

    if(ranking.length === 0){
        const item = document.createElement("li");
        item.textContent = "Sem pontuações ainda.";
        rankingList.appendChild(item);
    } else {
        ranking.forEach((entry, index) => {
            const item = document.createElement("li");
            item.textContent = `${entry.name} - ${entry.score}`;
            rankingList.appendChild(item);
        });
    }

    startOverlay.style.display = "none";
    resultOverlay.style.display = "none";
    rankingOverlay.style.display = "flex";
}

// =========================
// LIMPEZA
// =========================

function clearObjects(){

    document.querySelectorAll(
        ".ribbon, .goldRibbon, .bat, .stars"
    ).forEach(el => el.remove());

}
