/* ============================================================
   IA DE MASTERMIND – Q-LEARNING PURO
   Mejoras ML:
   ✔ Memoria por episodio (evitar repetir jugadas)
   ✔ Epsilon decreciente
   ✔ Penalización a jugadas sin información
   ============================================================ */

class MastermindAI {
    constructor(alpha = 0.3, gamma = 0.9, epsilon = 0.5, epsilonDecay = 0.995, minEpsilon = 0.05) {

        this.alpha = alpha;               // tasa de aprendizaje
        this.gamma = gamma;               // descuento futuro
        this.epsilon = epsilon;           // exploración inicial
        this.epsilonDecay = epsilonDecay; // decrecimiento por episodio
        this.minEpsilon = minEpsilon;

        this.colors = [0, 1, 2, 3, 4, 5];

        // TODAS las combinaciones posibles (6^4 = 1296)
        this.actions = this.generateAllActions();
        this.Q = {};  // Tabla Q

        // Memoria de jugadas usadas durante el episodio actual
        this.usedActions = new Set();
    }

    /* -----------------------------------------
       Genera todas las combinaciones posibles
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
       KEY para la tabla Q
       ----------------------------------------- */
    key(state, action) {
        return JSON.stringify({ state, action });
    }

    /* -----------------------------------------
       Obtener Q(s, a)
       ----------------------------------------- */
    getQ(state, action) {
        const k = this.key(state, action);
        return this.Q[k] ?? 0;
    }

    /* -----------------------------------------
       Asignar Q(s, a)
       ----------------------------------------- */
    setQ(state, action, value) {
        const k = this.key(state, action);
        this.Q[k] = value;
    }

    /* -----------------------------------------
       Elegir acción con Política ε-greedy
       ----------------------------------------- */
    chooseAction(state) {

        // ------------------------------------
        // A) Evitar acciones repetidas dentro del episodio
        // ------------------------------------
        let availableActions = this.actions.filter(a =>
            !this.usedActions.has(JSON.stringify(a))
        );

        // Si usamos todas las acciones (casi imposible), reiniciar memoria
        if (availableActions.length === 0) {
            this.usedActions.clear();
            availableActions = this.actions.slice();
        }

        // ------------------------------------
        // EXPLORACIÓN (ε)
        // ------------------------------------
        if (Math.random() < this.epsilon) {
            const idx = Math.floor(Math.random() * availableActions.length);
            const action = availableActions[idx];

            // agregar a memoria del episodio
            this.usedActions.add(JSON.stringify(action));
            return action;
        }

        // ------------------------------------
        // EXPLOTACIÓN (max Q)
        // ------------------------------------
        let bestQ = -Infinity;
        let bestAct = availableActions[0];

        for (let a of availableActions) {
            const q = this.getQ(state, a);
            if (q > bestQ) {
                bestQ = q;
                bestAct = a;
            }
        }

        this.usedActions.add(JSON.stringify(bestAct));
        return bestAct;
    }

    /* -----------------------------------------
       Actualizar Q-Learning
       ----------------------------------------- */
    updateQ(state, action, reward, nextState) {

        const oldQ = this.getQ(state, action);

        let maxQNext = 0;

        // max Q en siguiente estado
        for (let a of this.actions) {
            const q = this.getQ(nextState, a);
            if (q > maxQNext) maxQNext = q;
        }

        // Fórmula Q-learning
        const newQ =
            oldQ +
            this.alpha *
            (reward + this.gamma * maxQNext - oldQ);

        this.setQ(state, action, newQ);
    }

    /* -----------------------------------------
       Fin de un episodio → Reducir epsilon
       ----------------------------------------- */
    endEpisode() {
        this.epsilon = Math.max(
            this.minEpsilon,
            this.epsilon * this.epsilonDecay
        );

        // Vaciar memoria del episodio
        this.usedActions.clear();
    }
}