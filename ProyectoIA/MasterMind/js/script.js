let answerChoices = ["red", "blue", "green", "yellow", "purple", "orange"];
let ai = new MastermindAI();
let lastState = [0, 0];
let answer = [];
let guess = [];
let indexOfCorrect = [];
let results = [];
let round = 1;
let win = false;

let feedback = $(".feedback_container");
let selectedGuessPin = null;

/* Console for Logs (right panel) */
function logToConsole(msg) {
    // Empty so as not to mix with the new console
}

/* Block / Unblock Player Controls */
function BlockPlayer() {
    $(".selector_pin").css("pointer-events", "none");
    $("#menu").addClass("disabled_btn").css("pointer-events", "none");
    $("#check").prop("disabled", true).addClass("disabled_btn");
    $("#clear").prop("disabled", true).addClass("disabled_btn");
    $("#reset").prop("disabled", true).addClass("disabled_btn");
}

function UnblockPlayer() {
    $(".selector_pin").css("pointer-events", "auto");
    $("#menu").removeClass("disabled_btn").css("pointer-events", "auto");
    $("#check").prop("disabled", false).removeClass("disabled_btn");
    $("#clear").prop("disabled", false).removeClass("disabled_btn");
    $("#reset").prop("disabled", false).removeClass("disabled_btn");
}

/* Generate Secret Answer */
function setAnswer() {
    answer = [];
    for (let i = 0; i < 4; i++)
        answer.push(Math.floor(Math.random() * 6));
}
setAnswer();

/* Change the color of the pins */
function changePinColor(pinNum, colorInd, id) {
    let pin = document.querySelector(`${id} div:nth-child(${pinNum})`);
    if (!pin) return;

    const colors = {
        0: "#ff002fff", 1: "#0077ff", 2: "#3cf12cff",
        3: "#fffb00ff", 4: "#8100cbff", 5: "#ff6600ff"
    };

    pin.style.backgroundColor = colors[colorInd];
}

/* Player Selection */
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

/* Clear last selected color */
$("#clear").click(() => {
    if (guess.length < 1) return;
    guess.pop();
    changeBackToBlack();
    guess.forEach((c, i) => changePinColor(i + 1, c, "#guess"));
});

/* Black / White Feedback */
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

/* Paint Player Results */
function changeResultPins() {
    results.forEach((el, i) => {
        $(`#ans${round} div:nth-child(${i + 1})`)
            .css("background-color", el);
    });
}

/* Black and white pins */
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

/* Check Win */
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

/* Apply the player's move to the board */
function changeRoundPins() {
    guess.forEach((c, i) => changePinColor(i + 1, c, `#guess${round}`));
}

function changeBackToBlack() {
    for (let i = 1; i <= 4; i++)
        $(`#guess div:nth-child(${i})`).css("background-color", "rgb(207,187,165)");
}

/* Button to check the move*/
function check() {
    if (guess.length !== 4) {
        feedback.text("Choose 4 colors");
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

/* Reset General */
$("#reset").click(function () {
    ai = new MastermindAI();
    lastState = [0, 0];

    resetBoardForAI();
    feedback.text("Restarting");
    UnblockPlayer();
});

/* Reset Board Only (episode) // This is an option for the AI Method */
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

/* Clear the Entire Board */
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

/* Show the AI Move */
function showAIMoveInPanel(action) {
    changeBackToBlack();
    action.forEach((c, i) => changePinColor(i + 1, c, "#guess"));
}

/* Move in the board */
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

/* Reward */
function computeReward([blacks, whites]) {
    if (blacks === 4) return 20;
    if (blacks === 0 && whites === 0) return -3;
    return blacks * 3 + whites - 1;
}

/* AI Play */
function aiTurn() {
    let action = ai.chooseAction(lastState);
    showAIMoveInPanel(action);

    let fb = gameFeedback(action);
    let reward = computeReward(fb);

    updateAIConsole({
        episode: aiEpisodes,
        move: moves + 1,
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

/* Automatic Training */
let aiRunning = false;
let aiEpisodes = 0;

$("#aiPlay").click(function () {
    if (aiRunning) return;
    
    BlockPlayer();
    $("#menu").addClass("disabled_btn").css("pointer-events", "none");
    aiRunning = true;
    aiEpisodes = 0;
    feedback.text("AI training...");

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
                feedback.text("The AI discovered the code after " + aiEpisodes + " episodes");
                UnblockPlayer();
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

/* Start Panel – Mode Selection */
$("#btnModePlayer").click(function () {
    $("#startPanel").hide();
    feedback.text("Choose a pattern and press Check");
    UnblockPlayer();
});

$("#btnModeAI").click(function () {
    $("#startPanel").hide();
    BlockPlayer();
    $("#aiPlay").click();
});

/* Instructions Button */
$("#instructions").click(function () {
    swal({
        title: "Instructions",
        text: "This project implements a Reinforcement Learning (Q-Learning) algorithm that learns to play MasterMind.\n\nGame rules:\n- The secret combination has 4 colors.\n- The possible colors are 6.\n- You have up to 10 attempts.\n\nHints:\n- Black pin: correct color in the correct position.\n- White pin: correct color in the wrong position.\n\nThe AI tries moves, receives rewards based on how good its move was, and updates its Q values to improve over time.",
        icon: "info",
        buttons: {
            confirm: { 
                text: "Return to game", 
                className: "sweet-hover" 
            }
        }
    });
});

function updatAIConsole(data) {
    $("#logEpisode").text(data.episode);
    $("#logMove").text(data.move);
    $("#logAction").text("[" + data.action.join(", ") + "]");
    $("#logPolicy").text(data.policy);
    $("#logFeedback").text(`${data.fb[0]} Black, ${data.fb[1]} White`);
    $("#logReward").text(data.reward);
    $("#logEpsilon").text(data.epsilon.toFixed(3));
}

function ActivatePlayerMode() {
    $("#menu").show();
    $("#instructions").show();
    $("#aiPlay").hide();
    $("#aiStatus").hide();
    $("#playerControls").show();
    $("#playerActions").show();

    $("#aiControls").hide();
    $("#reset").show();
    $("#check").show();
    $("#clear").show();
}

function ActivateAIMode() {
    $("#menu").hide();
    $("#instructions").show();
    $("#aiPlay").show();
    $("#reset").hide();
    $("#check").hide();
    $("#clear").hide();
    $("#colorBoard").hide();
    $("#playerActions").hide();

    $("#aiStatus").show();
    BlockPlayer();
}

$("#btnModePlayer").click(function () {
    $("#startPanel").hide();
    ActivatePlayerMode();
});

$("#btnModeAI").click(function () {
    $("#startPanel").hide();
    ActivateAIMode();
});

function updateAIConsole(data) {
    $("#logEpisode").text(data.episode);
    $("#logMove").text(data.move);
    $("#logAction").text(JSON.stringify(data.action));
    $("#logPolicy").text(data.policy);
    $("#logFeedback").text(`${data.fb[0]} Black, ${data.fb[1]} White`);
    $("#logReward").text(data.reward);
    $("#logEpsilon").text(data.epsilon.toFixed(3));
}

$("#menu").click(function () {
    if (aiRunning) return;
    location.reload();
});