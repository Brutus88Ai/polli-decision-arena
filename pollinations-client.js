// Integration with Pollinations Decision Models & Typed Decisions API
const POLLINATIONS_DECISIONS_ENDPOINT = "https://gen.pollinations.ai/alpha/decisions";

class PollinationsClient {
  constructor() {
    this.apiBase = 'https://gen.pollinations.ai';
    this.decisionsEndpoint = 'https://gen.pollinations.ai/alpha/decisions';
  }

  getApiKey() {
    const el = document.getElementById('polliConnect');
    if (el && el.apiKey) return el.apiKey;
    return localStorage.getItem('polli_key') || null;
  }

  async getDecision(model, state, options) {
    const key = this.getApiKey();
    if (!key) {
      return this.simulateOfflineDecision(state, options);
    }

    try {
      const res = await fetch(this.decisionsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: model,
          context: `You are controlling a tactical combat drone in a 2D arena.
Current HP: ${state.hp}, Enemy HP: ${state.enemyHp}, Distance: ${state.distance}px, Angle: ${state.angle}deg.
Choose the best action from the given choices based on tactical win rate.`,
          choices: options
        })
      });

      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch (e) {
      console.warn('Fallback to offline decision model:', e);
      return this.simulateOfflineDecision(state, options);
    }
  }

  simulateOfflineDecision(state, options) {
    // Decision heuristics simulating Jev and Decider probabilities
    let probs = {};
    if (state.distance > 250) {
      probs['Thrust Forward'] = 0.55;
      probs['Laser Blast'] = 0.30;
      probs['Shield Charge'] = 0.15;
    } else if (state.hp < 40) {
      probs['Shield Charge'] = 0.50;
      probs['Evasive Flank'] = 0.35;
      probs['Laser Blast'] = 0.15;
    } else {
      probs['Laser Blast'] = 0.65;
      probs['EMP Shockwave'] = 0.25;
      probs['Evasive Flank'] = 0.10;
    }

    const keys = Object.keys(probs);
    const chosen = keys[0];
    return {
      choice: chosen,
      probabilities: probs
    };
  }
}
window.pollinationsClient = new PollinationsClient();
