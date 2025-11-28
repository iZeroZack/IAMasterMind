/* ============================================================
   IA DE MASTERMIND – Q-LEARNING
   Mejoras ML:
   ✔ Memoria por episodio (evitar repetir jugadas)
   ✔ Epsilon decreciente
   ✔ Penalización a jugadas sin información (desde script.js)
   ✔ Logging detallado al panel .console
   ============================================================ */

class MastermindAI {
    constructor(alpha = 0.3, gamma = 0.9, epsilon = 0.5, epsilonDecay = 0.995, minEpsilon = 0.05) {
        this.lastPolicy = "-"; // solo para mostrar en consola
        this.alpha = alpha;               // tasa de aprendizaje
        this.gamma = gamma;               // descuento futuro
        this.epsilon = epsilon;           // probabilidad de explorar
        this.epsilonDecay = epsilonDecay; // decrecimiento por episodio
        this.minEpsilon = minEpsilon;

        this.colors = [0, 1, 2, 3, 4, 5];

        // TODAS las combinaciones posibles (6^4 = 1296)
        this.actions = this.generateAllActions();
        this.Q = {};  // Tabla Q

        // Acciones ya usadas durante el episodio actual
        this.usedActions = new Set();
    }

    /* -----------------------------------------
       Generar todas las combinaciones posibles
       ----------------------------------------- */
    generateAllActions() {
        let acts = [];
        for (let a of this.colors)
            for (let b of this.colors)
                for (let c of this.colors)
                    for (let d of this.colors)
                        acts.push([a, b, c, d]);
        return acts;
    }

    /* -----------------------------------------
       KEY referencia Q-table
       ----------------------------------------- */
    key(state, action) {
        return JSON.stringify({ state, action });
    }

    /* -----------------------------------------
       Obtener y guardar Q
       ----------------------------------------- */
    getQ(state, action) {
        return this.Q[this.key(state, action)] ?? 0;
    }

    setQ(state, action, value) {
        this.Q[this.key(state, action)] = value;
    }

    /* -----------------------------------------
       Elegir acción con ε-greedy inteligente
       ----------------------------------------- */
    chooseAction(state) {
    // Filtrar acciones no usadas en este episodio
    let availableActions = this.actions.filter(a =>
        !this.usedActions.has(JSON.stringify(a))
    );

    if (availableActions.length === 0) {
        this.usedActions.clear();
        availableActions = this.actions.slice();
    }

    // EXPLORACIÓN
    if (Math.random() < this.epsilon) {
        const idx = Math.floor(Math.random() * availableActions.length);
        const action = availableActions[idx];
        this.usedActions.add(JSON.stringify(action));
        this.lastPolicy = "Exploración";
        return action;
    }

    // EXPLOTACIÓN
    let bestQ = -Infinity;
    let bestAction = availableActions[0];

    for (let act of availableActions) {
        const q = this.getQ(state, act);
        if (q > bestQ) {
            bestQ = q;
            bestAction = act;
        }
    }

    this.usedActions.add(JSON.stringify(bestAction));
    this.lastPolicy = "Explotación";
    return bestAction;
}

    /* -----------------------------------------
       Actualizar tabla Q
       ----------------------------------------- */
    updateQ(state, action, reward, nextState) {

        const oldQ = this.getQ(state, action);

        let maxQNext = 0;
        for (let a of this.actions) {
            const q = this.getQ(nextState, a);
            if (q > maxQNext) maxQNext = q;
        }

        const newQ =
            oldQ +
            this.alpha *
            (reward + this.gamma * maxQNext - oldQ);

        this.setQ(state, action, newQ);

        logToConsole(
            `    Q-update: old=${oldQ.toFixed(2)} → new=${newQ.toFixed(2)} | reward=${reward}`
        );
    }

    /* -----------------------------------------
       Cierre de episodio
       ----------------------------------------- */
    endEpisode() {
        // Bajar epsilon --- cada vez explora menos
        this.epsilon = Math.max(this.minEpsilon, this.epsilon * this.epsilonDecay);

        // limpiar memoria de jugadas del episodio
        this.usedActions.clear();

        logToConsole(`--- Fin del episodio | nuevo ε=${this.epsilon.toFixed(3)} ---`);
    }
}

AI.prototype.chooseActionVerbose = function(state) {
    let availableActions = this.actions.filter(a =>
        !this.usedActions.has(JSON.stringify(a))
    );

    let policy = "";

    // Exploración
    if (Math.random() < this.epsilon) {
        let idx = Math.floor(Math.random() * availableActions.length);
        let action = availableActions[idx];
        policy = "Exploración";
        this.usedActions.add(JSON.stringify(action));
        return { action, policy };
    }

    // Explotación
    let bestQ = -Infinity;
    let bestAction = availableActions[0];

    for (let act of availableActions) {
        let q = this.getQ(state, act);
        if (q > bestQ) {
            bestQ = q;
            bestAction = act;
        }
    }

    policy = "Explotación";
    this.usedActions.add(JSON.stringify(bestAction));
    return { action: bestAction, policy };
};