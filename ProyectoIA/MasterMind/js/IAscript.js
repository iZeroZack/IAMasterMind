class MastermindAI {
    constructor(alpha = 0.3, gamma = 0.9, epsilon = 0.5, epsilonDecay = 0.995, minEpsilon = 0.05) {
        this.lastPolicy = "-";
        this.alpha = alpha;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.epsilonDecay = epsilonDecay;
        this.minEpsilon = minEpsilon;

        this.colors = [0, 1, 2, 3, 4, 5];

        // All possible combinations (6^4 = 1296)
        this.actions = this.generateAllActions();
        this.Q = {};  // Q-table

        // Actions already used during the current episode
        this.usedActions = new Set();
    }

    /* Choose all possible combinations */
    generateAllActions() {
        let acts = [];
        for (let a of this.colors)
            for (let b of this.colors)
                for (let c of this.colors)
                    for (let d of this.colors)
                        acts.push([a, b, c, d]);
        return acts;
    }

    /* Key referencia Q-table */
    key(state, action) {
        return JSON.stringify({ state, action });
    }

    /* Get and set Q */
    getQ(state, action) {
        return this.Q[this.key(state, action)] ?? 0;
    }

    setQ(state, action, value) {
        this.Q[this.key(state, action)] = value;
    }

    /* Choose action with intelligent ε-greedy */
    chooseAction(state) {
    // Filter actions not used in this episode
    let availableActions = this.actions.filter(a =>
        !this.usedActions.has(JSON.stringify(a))
    );

    if (availableActions.length === 0) {
        this.usedActions.clear();
        availableActions = this.actions.slice();
    }

    // Exploration
    if (Math.random() < this.epsilon) {
        const idx = Math.floor(Math.random() * availableActions.length);
        const action = availableActions[idx];
        this.usedActions.add(JSON.stringify(action));
        this.lastPolicy = "Exploration";
        return action;
    }

    // Exploitation
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
    this.lastPolicy = "Exploitation";
    return bestAction;
}

    /* Update Q-table */
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

    /* End of episode */
    endEpisode() {
        // Decrease epsilon --- explores less each time
        this.epsilon = Math.max(this.minEpsilon, this.epsilon * this.epsilonDecay);

        // Clear memory of moves in the episode
        this.usedActions.clear();

        logToConsole(`--- End of episode | new ε=${this.epsilon.toFixed(3)} ---`);
    }
}

AI.prototype.chooseActionVerbose = function(state) {
    let availableActions = this.actions.filter(a =>
        !this.usedActions.has(JSON.stringify(a))
    );

    let policy = "";

    // Exploration
    if (Math.random() < this.epsilon) {
        let idx = Math.floor(Math.random() * availableActions.length);
        let action = availableActions[idx];
        policy = "Exploration";
        this.usedActions.add(JSON.stringify(action));
        return { action, policy };
    }

    // Exploitation
    let bestQ = -Infinity;
    let bestAction = availableActions[0];

    for (let act of availableActions) {
        let q = this.getQ(state, act);
        if (q > bestQ) {
            bestQ = q;
            bestAction = act;
        }
    }

    policy = "Exploitation";
    this.usedActions.add(JSON.stringify(bestAction));
    return { action: bestAction, policy };
};