class MastermindAI {
  constructor() {
    this.Q = {};               // Tabla Q
    this.alpha = 0.3;          // Tasa de aprendizaje
    this.gamma = 0.9;          // Descuento
    this.epsilon = 0.2;        // Exploración
    this.colors = [0, 1, 2, 3, 4, 5];

    this.actions = this.generateAllActions(); // 6^4 combinaciones (con repeticiones)
    this.resetEpisode();       // Inicializar episodio
  }

  // Se llama al iniciar juego nuevo
  resetEpisode() {
    this.possibleCodes = [...this.actions]; // todas las combinaciones posibles
    this.state = [0, 0, this.bucketForSize(this.possibleCodes.length)];
    this.lastAction = null;
  }

  // Todas las combinaciones posibles de 4 posiciones, 6 colores (0..5)
  generateAllActions() {
    let acts = [];
    for (let a of this.colors)
      for (let b of this.colors)
        for (let c of this.colors)
          for (let d of this.colors)
            acts.push([a, b, c, d]);
    return acts;
  }

  // Agrupa el tamaño del espacio de búsqueda para el estado
  bucketForSize(n) {
    if (n > 800) return 3;
    if (n > 200) return 2;
    if (n > 50)  return 1;
    return 0;
  }

  // Estado a partir de feedback y tamaño actual del espacio
  stateFromFeedback([blacks, whites]) {
    const sizeBucket = this.bucketForSize(this.possibleCodes.length);
    return [blacks, whites, sizeBucket];
  }

  key(state, action) {
    return JSON.stringify({ state, action });
  }

  getQ(state, action) {
    const k = this.key(state, action);
    return this.Q[k] ?? 0;
  }

  setQ(state, action, value) {
    const k = this.key(state, action);
    this.Q[k] = value;
  }

  // Elige acción usando ε-greedy sobre possibleCodes
  chooseAction() {
    const actions = this.possibleCodes.length > 0 ? this.possibleCodes : this.actions;

    // Exploración
    if (Math.random() < this.epsilon) {
      const r = Math.floor(Math.random() * actions.length);
      this.lastAction = actions[r];
      return this.lastAction;
    }

    // Explotación
    let bestQ = -Infinity;
    let bestAct = actions[0];

    for (let a of actions) {
      const q = this.getQ(this.state, a);
      if (q > bestQ) {
        bestQ = q;
        bestAct = a;
      }
    }

    this.lastAction = bestAct;
    return this.lastAction;
  }

  // Feedback entre un código candidato y una jugada (igual que gameFeedback)
  feedbackBetween(code, guess) {
    let ans = [...code];
    let gs  = [...guess];

    let blacks = 0;
    let whites = 0;

    // negros
    for (let i = 0; i < 4; i++) {
      if (gs[i] === ans[i]) {
        blacks++;
        gs[i] = ans[i] = null;
      }
    }

    // blancos
    for (let i = 0; i < 4; i++) {
      if (gs[i] != null && ans.includes(gs[i])) {
        whites++;
        ans[ans.indexOf(gs[i])] = null;
      }
    }
    return [blacks, whites];
  }

  // Filtra possibleCodes para dejar solo los que son coherentes con el feedback
  updatePossibleCodes(guess, feedback) {
    const [fbB, fbW] = feedback;

    this.possibleCodes = this.possibleCodes.filter(code => {
      const [b, w] = this.feedbackBetween(code, guess);
      return b === fbB && w === fbW;
    });

    // Evitar volver a jugar exactamente la misma combinación,
    // a menos que sea la única posible.
    if (this.possibleCodes.length > 1) {
      this.possibleCodes = this.possibleCodes.filter(code => {
        return !(
          code[0] === guess[0] &&
          code[1] === guess[1] &&
          code[2] === guess[2] &&
          code[3] === guess[3]
        );
      });
    }
  }

  // Recompensa "inteligente"
  computeReward(feedback, beforeSize, afterSize) {
    const [blacks, whites] = feedback;

    // Victoria → recompensa fuerte
    if (blacks === 4) return 20;

    // Base: cuantos aciertos tuvo
    let reward = blacks * 3 + whites * 1;

    // Bonus / castigo según cuánto redujo el espacio de búsqueda
    const reduction = beforeSize - afterSize;
    if (reduction > 0) {
      reward += Math.min(10, Math.floor(reduction / 10)); // más reducción → más premio
    } else {
      reward -= 3; // jugada que no reduce nada → castigo
    }

    return reward;
  }

  // Actualizar Q-table
  updateQ(prevState, action, reward, nextState) {
    const oldQ = this.getQ(prevState, action);
    const actions = this.possibleCodes.length > 0 ? this.possibleCodes : this.actions;

    let maxQNext = 0;
    if (actions.length > 0) {
      maxQNext = Math.max(...actions.map(a => this.getQ(nextState, a)));
    }

    const newQ = oldQ + this.alpha * (reward + this.gamma * maxQNext - oldQ);
    this.setQ(prevState, action, newQ);
  }

  // Llamar después de recibir el feedback del entorno (script.js)
  learn(action, feedback) {
    const prevState  = this.state;
    const beforeSize = this.possibleCodes.length;

    // 1) actualizar espacio de búsqueda
    this.updatePossibleCodes(action, feedback);

    const afterSize  = this.possibleCodes.length;
    const reward     = this.computeReward(feedback, beforeSize, afterSize);
    const nextState  = this.stateFromFeedback(feedback);

    // 2) actualizar Q
    this.updateQ(prevState, action, reward, nextState);

    // 3) avanzar estado interno
    this.state = nextState;
  }
}