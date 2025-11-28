/* ============================================
   MASTER MIND – SCRIPT PRINCIPAL (Jugador + IA)
   IA por Q-Learning puro
   ============================================ */

let answerChoices = ["red", "blue", "green", "yellow", "purple", "orange"];
let ai = new MastermindAI();   // IA definida en IAscript.js
let lastState = [0, 0];

/* ============================================
   VARIABLES DE JUEGO
   ============================================ */
let answer = [];
let guess = [];
let indexOfCorrect = [];
let results = [];
let round = 1;
let win = false;

let feedback = $(".feedback_container");
let selectedGuessPin = null;

/* ============================================
   CONSOLA PARA LOGS (panel derecho)
   ============================================ */
function logToConsole(msg) {
    // La dejamos vacía para no mezclar con la consola nueva
    // Si quieres, podrías mandar esto a otro div oculto.
}

/* ============================================
   BLOQUEAR / DESBLOQUEAR CONTROLES HUMANO
   ============================================ */
function bloquearJugador() {
    $(".selector_pin").css("pointer-events", "none");
    $("#menu").addClass("disabled_btn").css("pointer-events", "none");
    $("#check").prop("disabled", true).addClass("disabled_btn");
    $("#clear").prop("disabled", true).addClass("disabled_btn");
    $("#reset").prop("disabled", true).addClass("disabled_btn");
}

function desbloquearJugador() {
    $(".selector_pin").css("pointer-events", "auto");
    $("#menu").removeClass("disabled_btn").css("pointer-events", "auto");
    $("#check").prop("disabled", false).removeClass("disabled_btn");
    $("#clear").prop("disabled", false).removeClass("disabled_btn");
    $("#reset").prop("disabled", false).removeClass("disabled_btn");
}

/* ============================================
   GENERAR RESPUESTA SECRETA
   ============================================ */
function setAnswer() {
    answer = [];
    for (let i = 0; i < 4; i++)
        answer.push(Math.floor(Math.random() * 6));
}
setAnswer();

/* ============================================
   CAMBIAR COLOR DE PIN
   ============================================ */
function changePinColor(pinNum, colorInd, id) {
    let pin = document.querySelector(`${id} div:nth-child(${pinNum})`);
    if (!pin) return;

    const colors = {
        0: "#ff002fff", 1: "#19d7f9ff", 2: "#3cf12cff",
        3: "#fffb00ff", 4: "#3d1696ff", 5: "#ff6600ff"
    };

    pin.style.backgroundColor = colors[colorInd];
}

/* ============================================
   SELECCIÓN DEL JUGADOR
   ============================================ */
$("body").click(e => selectedGuessPin = e.target.id);

$(".selector_pin").click(function () {
    let col = this.id;
    let colorMap = { red:0, blue:1, green:2, yellow:3, purple:4, orange:5 };
    let c = colorMap[col];

    if (selectedGuessPin >= 1 && selectedGuessPin <= 4) {
        let pos = Number(selectedGuessPin) - 1;
        guess[pos] = c;
        changePinColor(selectedGuessPin, c, "#guess");
    } else {
        if (guess.length >= 4) return;
        guess.push(c);
        changePinColor(guess.length, c, "#guess");
    }
});

/* ============================================
   BORRAR PIN
   ============================================ */
$("#clear").click(() => {
    if (guess.length < 1) return;
    guess.pop();
    changeBackToBlack();
    guess.forEach((c, i) => changePinColor(i + 1, c, "#guess"));
});

/* ============================================
   FEEDBACK NEGROS / BLANCOS
   ============================================ */
function gameFeedback(gs) {
    let ans = [...answer];
    gs = [...gs];

    let blacks = 0, whites = 0;

    for (let i = 0; i < 4; i++) {
        if (gs[i] === ans[i]) {
            blacks++;
            gs[i] = ans[i] = null;
        }
    }
    for (let i = 0; i < 4; i++) {
        if (gs[i] != null && ans.includes(gs[i])) {
            whites++;
            ans[ans.indexOf(gs[i])] = null;
        }
    }
    return [blacks, whites];
}

/* ============================================
   PINTAR RESULTADOS JUGADOR
   ============================================ */
function changeResultPins() {
    results.forEach((el, i) => {
        $(`#ans${round} div:nth-child(${i + 1})`)
            .css("background-color", el);
    });
}

/* QUE SE VEAN PINS NEGROS Y BLANCOS */
function getGuessResults() {
    let ans = [...answer];
    let gs = [...guess];

    gs.forEach((color, i) => {
        if (color === ans[i]) {
            indexOfCorrect.push(i);
            results.push("black");
        }
    });

    indexOfCorrect.reverse().forEach(i => {
        ans.splice(i, 1);
        gs.splice(i, 1);
    });

    gs.sort();
    ans.sort();

    gs.forEach(el => {
        if (ans.includes(el)) {
            results.push("white");
            ans.splice(ans.indexOf(el), 1);
        }
    });

    changeResultPins();
    indexOfCorrect = [];
    results = [];
}

/* ============================================
   VICTORIA DEL JUGADOR
   ============================================ */
function checkWin() {
    const [blacks] = gameFeedback(guess);

    if (blacks === 4) {
        feedback.text("¡Has ganado!");
        answer.forEach((e, i) => changePinColor(i + 1, e, "#answer"));
        $("#answer .big_pin").text("");
        return true;
    }

    if (round === 10) {
        feedback.text("Perdiste");
        answer.forEach((e, i) => changePinColor(i + 1, e, "#answer"));
        return true;
    }

    return false;
}

/* ============================================
   APLICAR JUGADA JUGADOR AL TABLERO
   ============================================ */
function changeRoundPins() {
    guess.forEach((c, i) => changePinColor(i + 1, c, `#guess${round}`));
}

function changeBackToBlack() {
    for (let i = 1; i <= 4; i++)
        $(`#guess div:nth-child(${i})`).css("background-color", "rgb(207,187,165)");
}

/* ============================================
   BOTÓN PROBAR
   ============================================ */
function check() {
    if (guess.length !== 4) {
        feedback.text("Elige 4 colores");
        return;
    }

    getGuessResults();
    changeRoundPins();
    changeBackToBlack();

    if (checkWin()) return;

    round++;
    guess = [];
}
$("#check").click(check);

/* ============================================
   RESET GENERAL
   ============================================ */
$("#reset").click(function () {
    ai = new MastermindAI();
    lastState = [0, 0];

    resetBoardForAI();
    feedback.text("Reiniciado");
    desbloquearJugador();
});

/* ============================================
   RESET SOLO DEL TABLERO (episodio)
   ============================================ */
function resetBoardForAI() {
    round = 1;
    guess = [];
    indexOfCorrect = [];
    results = [];
    setAnswer();
    changeAllToBlack();
    changeBackToBlack();
    lastState = [0, 0];
}

/* BORRAR TODO EL TABLERO */
function changeAllToBlack() {
    for (let i = 1; i <= 10; i++) {
        for (let j = 1; j <= 4; j++) {
            $(`#guess${i} div:nth-child(${j})`)
                .css("background-color", "rgb(207,187,165)");
            $(`#ans${i} div:nth-child(${j})`)
                .css("background-color", "rgb(162,160,160)");
        }
    }
    for (let i = 1; i <= 4; i++) {
        let p = $(`#answer div:nth-child(${i})`);
        p.css("background-color", "rgb(207,187,165)");
        p.text("?");
    }
}

/* ============================================
   MOSTRAR JUGADA IA ABAJO
   ============================================ */
function mostrarJugadaIAEnPanel(action) {
    changeBackToBlack();
    action.forEach((c, i) => changePinColor(i + 1, c, "#guess"));
}

/* JUGADA EN EL TABLERO */
function changeRoundPinsAI(a) {
    a.forEach((c, i) => changePinColor(i + 1, c, `#guess${round}`));
}

function changeResultPinsAI([b, w]) {
    let pos = 1;
    for (let i = 0; i < b; i++)
        $(`#ans${round} div:nth-child(${pos++})`).css("background-color", "black");
    for (let i = 0; i < w; i++)
        $(`#ans${round} div:nth-child(${pos++})`).css("background-color", "white");
}

/* ============================================
   REWARD
   ============================================ */
function computeReward([blacks, whites]) {
    if (blacks === 4) return 20;
    if (blacks === 0 && whites === 0) return -3;
    return blacks * 3 + whites - 1;
}

/* ============================================
   UNA JUGADA DE IA
   ============================================ */
function aiTurn() {
    let action = ai.chooseAction(lastState);
    mostrarJugadaIAEnPanel(action);

    let fb = gameFeedback(action);
    let reward = computeReward(fb);

    updateIAConsole({
        episode: aiEpisodes,
        move: moves + 1,             // moves lo incrementas en playEpisode
        action: action,
        policy: ai.lastPolicy || "-",
        fb: fb,
        reward: reward,
        epsilon: ai.epsilon
    });

    ai.updateQ(lastState, action, reward, fb);
    changeRoundPinsAI(action);
    changeResultPinsAI(fb);

    lastState = fb;

    if (fb[0] === 4) {
        answer.forEach((e, i) => changePinColor(i + 1, e, "#answer"));
        ai.endEpisode();
        return true;
    }

    round++;
    setTimeout(changeBackToBlack, 200);
    return false;
}

/* ============================================
   ENTRENAMIENTO AUTOMÁTICO IA
   ============================================ */
let aiRunning = false;
let aiEpisodes = 0;

$("#aiPlay").click(function () {
    if (aiRunning) return;
    
    bloquearJugador();
    $("#menu").addClass("disabled_btn").css("pointer-events", "none");
    aiRunning = true;
    aiEpisodes = 0;
    feedback.text("IA entrenando...");

    function playEpisode() {
        aiEpisodes++;
        resetBoardForAI();
        lastState = [0, 0];
        moves = 0;
        round = 1;

        function step() {
            const done = aiTurn();
            moves++;

            if (done) {
                feedback.text("La IA descubrió el código tras " + aiEpisodes + " episodios");
                desbloquearJugador();
                aiRunning = false;
                return;
            }

            if (moves >= 10) {
                ai.endEpisode();
                setTimeout(playEpisode, 700);
                return;
            }

            setTimeout(step, 700);
        }
        step();
    }
    playEpisode();
});

/* ============================================
   PANEL DE INICIO – ELECCIÓN DE MODO
   ============================================ */

$("#btnModePlayer").click(function () {
    $("#startPanel").hide();
    feedback.text("Elige un patrón y presiona Probar");
    desbloquearJugador();
});

$("#btnModeAI").click(function () {
    $("#startPanel").hide();
    bloquearJugador();         // humano bloqueado
    $("#iaPlay").click();      // inicia modo IA automáticamente
});

/* ============================================
   BOTÓN INSTRUCCIONES
   ============================================ */
$("#instructions").click(function () {
    swal({
        title: "Instrucciones",
        text: "Este proyecto implementa un algoritmo de Aprendizaje por Refuerzo (Q-Learning) que aprende a jugar MasterMind.\n\nReglas del juego:\n- La combinación secreta tiene 4 colores.\n- Los colores posibles son 6.\n- Tienes hasta 10 intentos.\n\nPistas:\n- Pin negro: color correcto en la posición correcta.\n- Pin blanco: color correcto en la posición incorrecta.\n\nLa IA va probando jugadas, recibiendo recompensas según qué tan buena fue su jugada, y va actualizando sus valores Q para mejorar con el tiempo.",
        icon: "info",
        buttons: {
            confirm: { 
                text: "Volver al juego", 
                className: "sweet-hover" 
            }
        }
    });
});

function updateIAConsole(data) {
    $("#logEpisode").text(data.episode);
    $("#logMove").text(data.move);
    $("#logAction").text("[" + data.action.join(", ") + "]");
    $("#logPolicy").text(data.policy);
    $("#logFeedback").text(`${data.fb[0]} Black, ${data.fb[1]} White`);
    $("#logReward").text(data.reward);
    $("#logEpsilon").text(data.epsilon.toFixed(3));
}

function activarModoJugador() {
    $("#menu").show();
    $("#instructions").show();
    $("#aiPlay").hide();
    $("#iaStatus").hide();
    $("#playerControls").show();
    $("#playerActions").show();

    $("#iaControls").hide();
    $("#reset").show();
    $("#check").show();
    $("#clear").show();
}

function activarModoIA() {
    $("#menu").show();
    $("#instructions").show();
    $("#aiPlay").show();
    $("#reset").hide();
    $("#check").hide();
    $("#clear").hide();
    $("#colorBoard").hide();
    $("#playerActions").hide();

    $("#iaStatus").show();
    bloquearJugador(); // ya existe
}

$("#btnModePlayer").click(function () {
    $("#startPanel").hide();
    activarModoJugador();
});

$("#btnModeAI").click(function () {
    $("#startPanel").hide();
    activarModoIA();
});

function updateIAConsole(data) {
    $("#logEpisode").text(data.episode);
    $("#logMove").text(data.move);
    $("#logAction").text(JSON.stringify(data.action));
    $("#logPolicy").text(data.policy);
    $("#logFeedback").text(`${data.fb[0]} Black, ${data.fb[1]} White`);
    $("#logReward").text(data.reward);
    $("#logEpsilon").text(data.epsilon.toFixed(3));
}

$("#menu").click(function () {
    if (aiRunning) return; // evita volver al menú mientras IA entrena
    location.reload(); // vuelve al panel de selección de modos
});