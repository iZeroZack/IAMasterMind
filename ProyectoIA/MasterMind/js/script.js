/* ============================================
   MASTER MIND – SCRIPT PRINCIPAL (Jugador + IA)
   IA por Q-Learning (archivo IAscript.js)
   ============================================ */

let answerChoices = ["red", "blue", "green", "yellow", "purple", "orange"];

// -----------------------------
//        IA Q-LEARNING
// -----------------------------
let ai = new MastermindAI();

// -----------------------------
//     VARIABLES DEL JUEGO
// -----------------------------
let answer = [];
let guess = [];
let indexOfCorrect = [];
let black = 0;
let white = 0;
let round = 1;
let results = [];
let feedback = $(".feedback_container");
let win;
let selectedGuessPin;
let col_id;
let emptyPin;

/* ============================================
   FUNCIÓN PARA GENERAR COMBINACIÓN SECRETA
   (Con repeticiones – Mastermind clásico)
   ============================================ */
function setAnswer() {
    answer = [];
    for (let x = 0; x < 4; x++) {
        let colorIndex = Math.floor(Math.random() * 6);
        answer.push(colorIndex);
    }
}

// Inicializamos respuesta secreta al cargar
setAnswer();

/* ============================================
   FUNCIONES AUXILIARES GRÁFICAS
   ============================================ */
function changePinColor(pinNum, colorInd, id) {
    let pin = document.querySelector(`${id} div:nth-child(${pinNum})`);
    switch (answerChoices[colorInd]) {
        case "red": pin.style.backgroundColor = "#ff002fff"; break;
        case "orange": pin.style.backgroundColor = "#ff6600ff"; break;
        case "yellow": pin.style.backgroundColor = "#fffb00ff"; break;
        case "blue": pin.style.backgroundColor = "#19d7f9ff"; break;
        case "green": pin.style.backgroundColor = "#3cf12cff"; break;
        case "purple": pin.style.backgroundColor = "#3d1696ff"; break;
    }
}

function colorClicked(id) {
    switch (id) {
        case "red": guess.push(0); break;
        case "blue": guess.push(1); break;
        case "green": guess.push(2); break;
        case "yellow": guess.push(3); break;
        case "purple": guess.push(4); break;
        case "orange": guess.push(5); break;
    }
}

function checkGuessLength() {
    return guess.length == answer.length;
}

// Limpia fila actual después de probar
function changeBackToBlack() {
    for (let x = 1; x < 5; x++) {
        let pin = $(`#guess div:nth-child(${x})`);
        pin.css("background-color", "rgb(207, 187, 165)");
    }
}

function removeLastGuess() {
    guess.pop();
    let x = guess.length;
    let id = $(`#${x + 1}`);
    id.css("background-color", "rgb(207, 187, 165)");
}
$("#clear").click(removeLastGuess);

/* ============================================
   FEEDBACK (negros / blancos) – usado por IA y jugador
   ============================================ */
function gameFeedback(guessArr) {
    let ans = [...answer];
    let gs = [...guessArr];

    let blacks = 0;
    let whites = 0;

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
   FEEDBACK VISUAL PARA EL JUGADOR HUMANO
   ============================================ */
function changeResultPins() {
    results.forEach((el, i) => {
        let pin = $(`#ans${round} div:nth-child(${i + 1})`);
        pin.css("background-color", el);
    });
}

/* ============================================
   RESULTADOS HUMANOS (negros/blancos)
   ============================================ */
function getGuessResults() {
    let ans = Array.from(answer);
    let gs = Array.from(guess);

    // Negros
    gs.forEach((el, i) => {
        if (el == ans[i]) {
            indexOfCorrect.push(i);
            results.push("black");
        }
    });

    // Eliminamos emparejamientos negros
    let removeItems = indexOfCorrect.reverse();
    removeItems.forEach(el => {
        ans.splice(el, 1);
        gs.splice(el, 1);
    });

    gs.sort();
    ans.sort();

    gs.forEach((el, i) => {
        if (ans.includes(el)) {
            results.push("white");
            let indOfEl = ans.indexOf(el);
            ans.splice(indOfEl, 1);
        }
    });

    changeResultPins();
    results = [];
    indexOfCorrect = [];
}

/* ============================================
   CHECK DE VICTORIA PARA EL HUMANO
   ============================================ */
function checkWin() {
    const [blacks, whites] = gameFeedback(guess);

    if (blacks === 4) {
        feedback.text("¡Ganaste!");

        // Revelar la combinación secreta
        answer.forEach((el, i) =>
            changePinColor(i + 1, el, "#answer")
        );
        $("#answer .big_pin").text("");

        return true;
    }

    if (round === 10) {
        feedback.text("F en el chat");

        // Revelar combinación secreta al perder
        answer.forEach((el, i) =>
            changePinColor(i + 1, el, "#answer")
        );
        $("#answer .big_pin").text("");

        return false;
    }

    // No ganó, no perdió
    feedback.text("Intenta de nuevo");
    return false;
}

/* ============================================
   CAMBIAR PINS HUMANOS
   ============================================ */
function changeRoundPins() {
    guess.forEach((el, i) => {
        let id = "#guess" + round;
        changePinColor(i + 1, el, id);
    });
}

/* ============================================
   BOTÓN "PROBAR" – JUGADOR HUMANO
   ============================================ */
function check() {
    if (!checkGuessLength()) {
        feedback.text("Elige 4 colores");
        return;
    }

    getGuessResults();
    changeRoundPins();
    changeBackToBlack();

    if (checkWin()) {
        $("#check").off("click");
    } else if (round < 10) {
        round++;
        guess = [];              // 🔹 importante: vaciar la jugada previa
        selectedGuessPin = null; // (opcional) limpiar selección
    }
}

$("#check").click(check);

/* ============================================
   RESETEAR TABLERO
   ============================================ */
function changeAllToBlack() {
    for (let i = 1; i < 11; i++) {
        for (let x = 1; x < 5; x++) {
            $(`#guess${i} div:nth-child(${x})`)
                .css("background-color", "rgb(207, 187, 165)");
            $(`#ans${i} div:nth-child(${x})`)
                .css("background-color", "rgb(162, 160, 160)");
        }
    }

    for (let i = 1; i <= 4; i++) {
        let ans = $(`#answer div:nth-child(${i})`);
        ans.css("background-color", "rgb(207, 187, 165)");
        ans.text("?");
    }
}

$("#reset").click(function () {
    // Reset de variables
    black = 0;
    white = 0;
    round = 1;
    answer = [];
    guess = [];
    indexOfCorrect = [];
    results = [];
    win = undefined;
    selectedGuessPin = undefined;
    col_id = undefined;

    // Reset IA
    ai.resetEpisode();

    setAnswer();
    changeAllToBlack();

    feedback.text("Juego Reiniciado");

    $("#check").off("click");
    $("#check").click(check);
});

/* ============================================
   SELECCIÓN DE COLORES PARA EL HUMANO
   ============================================ */
$("body").click(function (event) {
    selectedGuessPin = event.target.id;
});

$(".selector_pin").click(function () {
    let pin = selectedGuessPin;
    let clickedId = this.id;
    let pushToGuess = indexOfClickedColor(clickedId);

    if (pin >= "1" && pin <= "4") {
        let index = Number(pin) - 1;
        guess[index] = pushToGuess;
        changePinColor(pin, pushToGuess, "#guess");
    } else {
        guess.push(pushToGuess);
        changePinColor(guess.length, pushToGuess, "#guess");
    }
});

function mostrarJugadaIAEnPanel(action) {
    for (let i = 0; i < 4; i++) {
        changePinColor(i + 1, action[i], "#guess");
    }
}

function indexOfClickedColor(clickedId) {
    switch (clickedId) {
        case "red": return 0;
        case "blue": return 1;
        case "green": return 2;
        case "yellow": return 3;
        case "purple": return 4;
        case "orange": return 5;
    }
}

/* ============================================
   IA TURN — UNA SOLA JUGADA
   ============================================ */
function changeRoundPinsAI(action) {
    let id = "#guess" + round;
    for (let i = 0; i < 4; i++) {
        changePinColor(i + 1, action[i], id);
    }
}

function changeResultPinsAI([blacks, whites]) {
    let id = "#ans" + round;
    let pos = 1;

    for (let i = 0; i < blacks; i++) {
        $(`${id} div:nth-child(${pos})`).css("background-color", "black");
        pos++;
    }
    for (let i = 0; i < whites; i++) {
        $(`${id} div:nth-child(${pos})`).css("background-color", "white");
        pos++;
    }
}

function aiTurn() {
    let action = ai.chooseAction();

    // 🔹 Mostrar jugada de IA en el panel inferior
    mostrarJugadaIAEnPanel(action);

    let fb = gameFeedback(action);
    ai.learn(action, fb);

    // 🔹 Poner esa jugada en la fila correspondiente del tablero
    changeRoundPinsAI(action);
    changeResultPinsAI(fb);

    if (fb[0] === 4) {
        feedback.text("¡La IA ha ganado!");
        answer.forEach((el, i) => changePinColor(i + 1, el, "#answer"));
        $("#answer .big_pin").text("");
        return true;
    }

    round++;

    // 🔹 Limpiar panel inferior para siguiente jugada
    setTimeout(() => {
        changeBackToBlack();
    }, 400);

    return false;
}

/* ============================================
   BOTÓN IA – PASO A PASO
   ============================================ */
let aiRunning = false;

$("#aiPlay").click(function () {
    if (aiRunning) return;
    aiRunning = true;

    feedback.text("IA jugando...");

    let moves = 0;
    let maxMoves = 10;
    let delay = 800;

    function playStep() {
        const finished = aiTurn();
        moves++;

        if (finished || moves >= maxMoves) {
            aiRunning = false;
            return;
        }

        setTimeout(playStep, delay);
    }

    playStep();
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