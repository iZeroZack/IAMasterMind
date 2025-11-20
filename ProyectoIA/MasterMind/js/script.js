/* ============================================
   MASTER MIND – SCRIPT PRINCIPAL (Jugador + IA)
   IA por Q-Learning puro (MastermindAI en IAscript.js)
   ============================================ */

let answerChoices = ["red", "blue", "green", "yellow", "purple", "orange"];

// -----------------------------
//            IA
// -----------------------------
let ai = new MastermindAI();   // definida en IAscript.js
let lastState = [0, 0];        // estado inicial (feedback previo)

// -----------------------------
//     VARIABLES DEL JUEGO
// -----------------------------
let answer = [];
let guess = [];
let indexOfCorrect = [];
let results = [];
let round = 1;
let win = false;

let feedback = $(".feedback_container");
let selectedGuessPin = null;

// ============================================
// BLOQUEAR / DESBLOQUEAR CONTROLES DEL JUGADOR
// ============================================
function bloquearJugador() {
    $(".selector_pin").css("pointer-events", "none");
    $("#check").prop("disabled", true).addClass("disabled_btn");
    $("#clear").prop("disabled", true).addClass("disabled_btn");
    $("#reset").prop("disabled", true).addClass("disabled_btn");
}

function desbloquearJugador() {
    $(".selector_pin").css("pointer-events", "auto");
    $("#check").prop("disabled", false).removeClass("disabled_btn");
    $("#clear").prop("disabled", false).removeClass("disabled_btn");
    $("#reset").prop("disabled", false).removeClass("disabled_btn");
}

/* ============================================
   Generar combinación secreta (con repeticiones)
   ============================================ */
function setAnswer() {
    answer = [];
    for (let x = 0; x < 4; x++) {
        let colorIndex = Math.floor(Math.random() * 6);
        answer.push(colorIndex);
    }
}
setAnswer();

/* ============================================
   CAMBIAR COLOR DE PIN
   ============================================ */
function changePinColor(pinNum, colorInd, id) {
    let pin = document.querySelector(`${id} div:nth-child(${pinNum})`);
    if (!pin) return;
    switch (answerChoices[colorInd]) {
        case "red": pin.style.backgroundColor = "#ff002fff"; break;
        case "orange": pin.style.backgroundColor = "#ff6600ff"; break;
        case "yellow": pin.style.backgroundColor = "#fffb00ff"; break;
        case "blue": pin.style.backgroundColor = "#19d7f9ff"; break;
        case "green": pin.style.backgroundColor = "#3cf12cff"; break;
        case "purple": pin.style.backgroundColor = "#3d1696ff"; break;
    }
}

/* ============================================
   SELECCIÓN DE PINES POR EL JUGADOR
   ============================================ */
$("body").click(function (event) {
    selectedGuessPin = event.target.id;
});

$(".selector_pin").click(function () {
    let col = this.id;
    let color = ({
        red: 0, blue: 1, green: 2, yellow: 3, purple: 4, orange: 5
    })[col];

    if (selectedGuessPin >= 1 && selectedGuessPin <= 4) {
        let pos = Number(selectedGuessPin) - 1;
        guess[pos] = color;
        changePinColor(selectedGuessPin, color, "#guess");
    } else {
        if (guess.length >= 4) return;
        guess.push(color);
        changePinColor(guess.length, color, "#guess");
    }
});

/* ============================================
   BORRAR ÚLTIMO COLOR DEL JUGADOR
   ============================================ */
$("#clear").click(function () {
    if (guess.length === 0) return;
    guess.pop();
    changeBackToBlack();
    guess.forEach((c, i) => changePinColor(i + 1, c, "#guess"));
});

/* ============================================
   FEEDBACK (negros, blancos)
   ============================================ */
function gameFeedback(guessArr) {
    let ans = [...answer];
    let gs = [...guessArr];

    let blacks = 0, whites = 0;

    // Negros
    for (let i = 0; i < 4; i++) {
        if (gs[i] === ans[i]) {
            blacks++;
            gs[i] = ans[i] = null;
        }
    }
    // Blancos
    for (let i = 0; i < 4; i++) {
        if (gs[i] != null && ans.includes(gs[i])) {
            whites++;
            ans[ans.indexOf(gs[i])] = null;
        }
    }
    return [blacks, whites];
}

/* ============================================
   MOSTRAR RESULTADOS JUGADOR (negros/blancos)
   ============================================ */
function changeResultPins() {
    results.forEach((el, i) => {
        let pin = $(`#ans${round} div:nth-child(${i + 1})`);
        pin.css("background-color", el);
    });
}

/* Asignar pins negros/blancos (modo jugador) */
function getGuessResults() {
    let ans = Array.from(answer);
    let gs = Array.from(guess);

    // Negros
    gs.forEach((el, i) => {
        if (el === ans[i]) {
            indexOfCorrect.push(i);
            results.push("black");
        }
    });

    // Eliminar los negros
    indexOfCorrect.reverse().forEach(el => {
        ans.splice(el, 1);
        gs.splice(el, 1);
    });

    // Blancos
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
   CHECK DE VICTORIA DEL JUGADOR
   ============================================ */
function checkWin() {
    const [blacks] = gameFeedback(guess);

    if (blacks === 4) {
        feedback.text("¡Ganaste!");
        answer.forEach((el, i) => changePinColor(i + 1, el, "#answer"));
        $("#answer .big_pin").text("");
        return true;
    }

    if (round === 10) {
        feedback.text("F en el chat");
        answer.forEach((el, i) => changePinColor(i + 1, el, "#answer"));
        $("#answer .big_pin").text("");
    }

    return false;
}

/* ============================================
   PASAR JUGADA DEL JUGADOR AL TABLERO
   ============================================ */
function changeRoundPins() {
    guess.forEach((el, i) =>
        changePinColor(i + 1, el, `#guess${round}`)
    );
}

function changeBackToBlack() {
    for (let i = 1; i <= 4; i++) {
        $(`#guess div:nth-child(${i})`)
            .css("background-color", "rgb(207,187,165)");
    }
}

/* ============================================
   BOTÓN PROBAR – turno del jugador
   ============================================ */
function check() {
    if (guess.length !== 4) {
        feedback.text("Elige 4 colores");
        return;
    }

    getGuessResults();
    changeRoundPins();
    changeBackToBlack();

    if (checkWin()) {
        $("#check").off("click");
        return;
    }

    round++;
    guess = [];
}
$("#check").click(check);

/* ============================================
   LIMPIAR TABLERO COMPLETO (pistas + jugadas)
   ============================================ */
function changeAllToBlack() {
    for (let i = 1; i <= 10; i++) {
        for (let x = 1; x <= 4; x++) {
            $(`#guess${i} div:nth-child(${x})`)
                .css("background-color", "rgb(207,187,165)");
            $(`#ans${i} div:nth-child(${x})`)
                .css("background-color", "rgb(162,160,160)");
        }
    }

    for (let i = 1; i <= 4; i++) {
        let pin = $(`#answer div:nth-child(${i})`);
        pin.css("background-color", "rgb(207,187,165)");
        pin.text("?");
    }
}

/* ============================================
   RESET PARA UN EPISODIO DE IA (solo tablero)
   ============================================ */
function resetBoardForAI() {
    round = 1;
    guess = [];
    indexOfCorrect = [];
    results = [];
    win = false;
    selectedGuessPin = null;

    setAnswer();
    changeAllToBlack();
    changeBackToBlack();

    lastState = [0, 0];
}

/* ============================================
   BOTÓN RESET GENERAL
   ============================================ */
$("#reset").click(function () {
    // Si quieres que el reset NO borre lo aprendido, comenta la siguiente línea:
    ai = new MastermindAI();
    lastState = [0, 0];

    resetBoardForAI();
    feedback.text("Juego Reiniciado");

    desbloquearJugador();

    $("#check").off("click");
    $("#check").click(check);
});

/* ============================================
   MOSTRAR JUGADA DE LA IA EN EL PANEL INFERIOR
   ============================================ */
function mostrarJugadaIAEnPanel(action) {
    changeBackToBlack();
    for (let i = 0; i < 4; i++) {
        changePinColor(i + 1, action[i], "#guess");
    }
}

/* ============================================
   PASAR JUGADA IA AL TABLERO (fila de turno)
   ============================================ */
function changeRoundPinsAI(action) {
    for (let i = 0; i < 4; i++) {
        changePinColor(i + 1, action[i], `#guess${round}`);
    }
}

function changeResultPinsAI([blacks, whites]) {
    let pos = 1;
    for (let i = 0; i < blacks; i++) {
        $(`#ans${round} div:nth-child(${pos})`).css("background-color", "black");
        pos++;
    }
    for (let i = 0; i < whites; i++) {
        $(`#ans${round} div:nth-child(${pos})`).css("background-color", "white");
        pos++;
    }
}

/* ============================================
   REWARD PARA Q-LEARNING
   ============================================ */
function computeReward([blacks, whites]) {
    if (blacks === 4) return 20;
    if (blacks === 0 && whites === 0) return -3; // penalizar jugadas sin info
    return blacks * 3 + whites * 1 - 1;
}

/* ============================================
   UNA JUGADA DE LA IA (Q-Learning puro)
   ============================================ */
function aiTurn() {
    let action = ai.chooseAction(lastState); // usa epsilon-greedy + memoria episodio
    mostrarJugadaIAEnPanel(action);

    let fb = gameFeedback(action);
    let reward = computeReward(fb);
    let nextState = fb;

    ai.updateQ(lastState, action, reward, nextState);

    changeRoundPinsAI(action);
    changeResultPinsAI(fb);

    lastState = nextState;

    if (fb[0] === 4) {
        feedback.text("¡La IA ha ganado esta partida!");
        answer.forEach((el, i) =>
            changePinColor(i + 1, el, "#answer")
        );
        $("#answer .big_pin").text("");

        ai.endEpisode();   // FIN DE EPISODIO (GANÓ)

        return true;
    }

    round++;
    setTimeout(() => changeBackToBlack(), 300);

    return false;
}

/* ============================================
   ENTRENAMIENTO IA (muchos episodios seguidos)
   ============================================ */
let aiRunning = false;
let aiEpisodes = 0;

$("#aiPlay").click(function () {
    if (aiRunning) return;
    aiRunning = true;
    aiEpisodes = 0;

    bloquearJugador();
    feedback.text("IA entrenando...");

    let delayMove = 600;
    let delayEpisode = 400;

    function playEpisode() {
        aiEpisodes++;
        resetBoardForAI();

        let moves = 0;
        let maxMoves = 10;

        function step() {
            const finished = aiTurn();
            moves++;

            if (finished) {
                feedback.text("¡La IA ganó tras " + aiEpisodes + " partidas!");
                aiRunning = false;
                desbloquearJugador();
                return;
            }

            if (moves >= maxMoves) {
                // Perdió esta partida → fin de episodio
                ai.endEpisode();
                setTimeout(playEpisode, delayEpisode);
                return;
            }

            setTimeout(step, delayMove);
        }

        step();
    }

    playEpisode();
});

$("#instructions").click(function () {
    swal({
        content: "text",
        title: "Instrucciones",
        text: "Este Proyecto esta pensado para que un algoritmo de Machine Learning aprenda a jugar al MasterMind. Las reglas son simples, adivinar una combinación secreta de 4 colores entre 6 posibles, en un máximo de 10 intentos. Cuando las pistas se iluminan de negro, significa que un color está en la posición correcta, y cuando se iluminan de blanco, significa que un color está en la combinación pero en la posición incorrecta.",
        buttons: {
            confirm: { text: "Volver", className: "sweet-hover" }
        }
    });
});