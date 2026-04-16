// ===== agent.js =====
// AIAgent — OpenAI integration with structured JSON output.
// Exposes global: AIAgent

const RISK_PROFILES = {
  conservative: 'Play conservatively. Prefer standing over hitting, avoid doubles unless very favorable, never split marginal pairs.',
  balanced:     'Follow perfect basic strategy based on standard blackjack tables.',
  aggressive:   'Play aggressively. Double more liberally, split more often, deviate toward higher EV plays even with slight risk.',
};

const EXPLAIN_LEVELS = {
  basic:       'Give a one-sentence explanation.',
  statistical: 'Include the key probabilities and expected value reasoning in 2-3 sentences.',
  'in-depth':  'Provide a thorough analysis including deck composition implications, the running count impact, and alternative action comparison.',
};

class AIAgent {
  constructor() {
    this.apiKey      = '';
    this.model       = 'gpt-4o-mini';
    this.profile     = 'balanced';
    this.explainLevel = 'statistical';
    this.stats = { hands: 0, wins: 0, losses: 0, pushes: 0 };
    this.lastResult  = null;
  }

  isReady() { return !!this.apiKey; }

  loadKey(key) {
    this.apiKey = key.trim();
  }

  loadEnvContent(content) {
    const match = content.match(/OPENAI_API_KEY\s*=\s*["']?([^\n\r"'\s]+)["']?/i);
    if (match) { this.loadKey(match[1]); return true; }
    return false;
  }

  // ── Main Query ──
  // Returns: { action, analysis, confidence, probabilities }
  async query(gameState, availableActions) {
    if (!this.apiKey) throw new Error('No API key loaded');
    if (!availableActions.length) throw new Error('No available actions');

    const systemPrompt = [
      'You are an expert blackjack AI agent trained in optimal play.',
      RISK_PROFILES[this.profile],
      EXPLAIN_LEVELS[this.explainLevel],
      '',
      'You MUST respond with ONLY valid JSON in this exact format — no other text:',
      '{',
      '  "action": "<one of: ' + availableActions.join('|') + '>",',
      '  "analysis": "<your reasoning>",',
      '  "confidence": <0.0-1.0>,',
      '  "probabilities": { "win": <0-1>, "lose": <0-1>, "push": <0-1> }',
      '}',
      '',
      'The "action" field MUST be exactly one of: ' + availableActions.join(', ') + '.',
      'Never output an action that is not in that list.',
    ].join('\n');

    const userPrompt = [
      'Current blackjack hand:',
      `  Player hand  : ${gameState.playerCards.join(', ')} (total: ${gameState.playerTotal}${gameState.isSoft ? ', soft' : ', hard'})`,
      `  Dealer upcard: ${gameState.dealerUpcard}`,
      `  Hi-Lo count  : ${gameState.count >= 0 ? '+' : ''}${gameState.count} (${gameState.countLabel})`,
      `  Deck used    : ${gameState.deckUsedPct}%`,
      `  Bet          : $${gameState.bet}`,
      `  Bankroll     : $${gameState.bankroll}`,
      `  Available    : ${availableActions.join(', ')}`,
      '',
      'What is the optimal action?',
    ].join('\n');

    console.group('%c[AI Agent] Query', 'color:#00e5c8;font-weight:bold');
    console.log('Game State:', gameState);
    console.log('Available Actions:', availableActions);
    console.log('Profile:', this.profile, '| Detail:', this.explainLevel);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model:           this.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   },
        ],
        max_tokens:  350,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${res.status}`;
      console.error('[AI Agent] Error:', msg);
      console.groupEnd();
      throw new Error(msg);
    }

    const data    = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    console.log('Raw JSON:', content);

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('[AI Agent] JSON parse failed:', e);
      console.groupEnd();
      throw new Error('Invalid JSON from API');
    }

    // Safety: ensure action is valid
    if (!availableActions.includes(parsed.action)) {
      console.warn(`[AI Agent] Invalid action "${parsed.action}" — defaulting to first available`);
      parsed.action = availableActions[0];
    }

    // Normalize confidence
    parsed.confidence = Math.max(0, Math.min(1, parseFloat(parsed.confidence) || 0.5));

    console.log('%cAction: ' + parsed.action.toUpperCase(), 'color:#00ff78;font-weight:bold');
    console.log('Analysis:', parsed.analysis);
    console.log('Confidence:', (parsed.confidence * 100).toFixed(0) + '%');
    console.log('Probabilities:', parsed.probabilities);
    console.groupEnd();

    this.lastResult = parsed;
    this.stats.hands++;
    return parsed;
  }

  recordOutcome(outcome) {
    if (outcome === 'WIN' || outcome === 'BLACKJACK') this.stats.wins++;
    else if (outcome === 'LOSE' || outcome === 'BUST') this.stats.losses++;
    else this.stats.pushes++;
  }

  getWinRate() {
    const total = this.stats.wins + this.stats.losses + this.stats.pushes;
    if (!total) return null;
    return Math.round((this.stats.wins / total) * 100);
  }
}
