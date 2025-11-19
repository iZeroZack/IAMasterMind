class MastermindAI {
  constructor() {
    this.Q = {}; // tabla Q
    this.alpha = 0.3; // aprendizaje
    this.gamma = 0.9; // descuento
    this.epsilon = 0.2; // exploración
    this.colors = [0,1,2,3,4,5];
    this.actions = this.generateAllActions();
  }

  generateAllActions() {
    let acts = [];
    for (let a of this.colors)
    for (let b of this.colors)
    for (let c of this.colors)
    for (let d of this.colors)
      acts.push([a,b,c,d]);
    return acts;
  }

  key(state, action) {
    return JSON.stringify({state, action});
  }

  getQ(state, action) {
    let k = this.key(state, action);
    return this.Q[k] ?? 0;
  }

  setQ(state, action, value) {
    let k = this.key(state, action);
    this.Q[k] = value;
  }

  chooseAction(state) {
    // exploración
    if (Math.random() < this.epsilon) {
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    }
    // explotación
    let best = -Infinity;
    let bestAct = null;
    for (let a of this.actions) {
      let q = this.getQ(state, a);
      if (q > best) {
        best = q;
        bestAct = a;
      }
    }
    return bestAct;
  }

  updateQ(state, action, reward, nextState) {
    let oldQ = this.getQ(state, action);

    // encontrar el mejor Q futuro
    let maxQNext = Math.max(...this.actions.map(a => this.getQ(nextState, a)));

    let newQ = oldQ + this.alpha * (reward + this.gamma * maxQNext - oldQ);

    this.setQ(state, action, newQ);
  }
}