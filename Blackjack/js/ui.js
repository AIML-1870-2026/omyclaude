// ===== ui.js =====
// UI class — DOM rendering, animations, ambient systems, event coordination.

class UI {
  constructor(game) {
    this.game         = game;
    this.showCount    = false;
    this.showHint     = false;
    this._DELAY       = 400;
    this._roundsPlayed = 0;
    this._heatPct     = 0;
    this._startBankroll = game.bankroll;
  }

  init() {
    this._query();
    this._bindEvents();
    this._startClock();
    this._startParticles();
    this._updateBankroll();
    this._updateBet();
    this._updateProfitBar();
    this._updateShoeBar();
    this._updateButtons();
    this._setTableState('');
  }

  // ====================================================
  // DOM ELEMENT CACHE
  // ====================================================

  _query() {
    const $ = id => document.getElementById(id);
    this.el = {
      muteBtn:       $('mute-btn'),
      bankroll:      $('bankroll-display'),
      bet:           $('bet-display'),
      dealerCards:   $('dealer-cards'),
      dealerTotal:   $('dealer-total'),
      playerHands:   $('player-hands'),
      msgOverlay:    $('message-overlay'),
      msgText:       $('message-text'),
      msgSub:        $('message-sub'),
      countHud:      $('count-hud'),
      countValue:    $('count-value'),
      countLabel:    $('count-label'),
      hintHud:       $('hint-hud'),
      hintValue:     $('hint-value'),
      dealBtn:       $('deal-btn'),
      hitBtn:        $('hit-btn'),
      standBtn:      $('stand-btn'),
      doubleBtn:     $('double-btn'),
      splitBtn:      $('split-btn'),
      insureBtn:     $('insurance-btn'),
      noInsureBtn:   $('no-insure-btn'),
      newGameBtn:    $('new-game-btn'),
      clearBtn:      $('clear-btn'),
      chips:         document.querySelectorAll('.chip'),
      toggleCount:   $('toggle-count'),
      toggleHint:    $('toggle-hint'),
      // Ambient
      table:         $('table'),
      termLog:       $('terminal-log'),
      ekgGroup:      $('ekg-group'),
      bpmValue:      $('bpm-value'),
      hrStatus:      $('hr-status'),
      heatFill:      $('heat-bar-fill'),
      heatLabel:     $('heat-label'),
      roundsValue:   $('rounds-value'),
      profitDisplay: $('profit-display'),
      shoeIntegrity: $('shoe-integrity'),
      bottomCount:   $('bottom-count'),
      bustBar:       $('bust-bar'),
      bustPct:       $('bust-pct'),
      shoeBar:       $('shoe-bar'),
      shoePct:       $('shoe-pct'),
      sysTime:       $('sys-time'),
      rcTimestamp:   $('rc-timestamp'),
      particleCanvas:$('particle-canvas'),
    };
  }

  // ====================================================
  // EVENT BINDINGS
  // ====================================================

  _bindEvents() {
    const g = this.game;

    this.el.chips.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFX.click();
        if (g.placeBet(parseInt(btn.dataset.value, 10))) {
          this._updateBet();
          this._updateButtons();
          this._log('log', `BET_ADD +$${btn.dataset.value} (TOTAL: $${g.currentBet})`);
        }
      });
    });

    this.el.muteBtn?.addEventListener('click', () => {
      SoundFX.setEnabled(!SoundFX.isEnabled());
      const muted = !SoundFX.isEnabled();
      this.el.muteBtn.textContent = muted ? 'SFX Off' : 'SFX On';
      this.el.muteBtn.classList.toggle('active', !muted);
    });

    this.el.clearBtn.addEventListener('click', () => {
      g.clearBet();
      this._updateBet();
      this._updateButtons();
      this._log('sys', 'BET_CLEARED');
    });

    this.el.dealBtn.addEventListener('click',    () => this._onDeal());
    this.el.hitBtn.addEventListener('click',     () => this._onHit());
    this.el.standBtn.addEventListener('click',   () => this._onStand());
    this.el.doubleBtn.addEventListener('click',  () => this._onDouble());
    this.el.splitBtn.addEventListener('click',   () => this._onSplit());
    this.el.insureBtn.addEventListener('click',  () => this._onInsurance(true));
    this.el.noInsureBtn.addEventListener('click',() => this._onInsurance(false));
    this.el.newGameBtn.addEventListener('click', () => this._onNewGame());

    this.el.toggleCount.addEventListener('click', () => {
      this.showCount = !this.showCount;
      this.el.countHud.classList.toggle('hidden', !this.showCount);
      this.el.toggleCount.classList.toggle('active', this.showCount);
      this.el.toggleCount.textContent = this.showCount ? 'Hide Count' : 'Show Count';
      if (this.showCount) this._updateCountHud();
    });

    this.el.toggleHint.addEventListener('click', () => {
      this.showHint = !this.showHint;
      this.el.hintHud.classList.toggle('hidden', !this.showHint);
      this.el.toggleHint.classList.toggle('active', this.showHint);
      this.el.toggleHint.textContent = this.showHint ? 'Hide Hint' : 'Show Hint';
      if (this.showHint) this._updateHintHud();
    });
  }

  // ====================================================
  // GAME HANDLERS
  // ====================================================

  async _onDeal() {
    const g = this.game;
    if (!g.deal()) return;

    this._disableAll();
    this._clearTable();
    this._log('sys', `DEALING SHOE (${g.deck.remaining} CARDS LEFT)`);

    await this._animateDeal();

    this._updateBankroll();
    this._updateCountHud();
    this._updateShoeBar();
    this._logDealCards();

    if (g.state === STATE.INSURANCE) {
      this._setTableState('state-insurance');
      this._showMessage('Insurance?', 'Dealer shows Ace', 'insurance');
      this._log('warn', 'DEALER_ACE — INSURANCE OFFERED');
      this._updateButtons();
      return;
    }

    if (g.state === STATE.RESOLUTION) {
      this._flipDealerHoleCard();
      await this._pause(500);
      this._showResult();
      return;
    }

    this._setTableState('state-player');
    this._highlightActiveHand();
    this._updateDealerTotal();
    this._updateHintHud();
    this._updateHeartRate(g.playerHands[0].visibleTotal);
    this._updateBustBar(g.playerHands[0].visibleTotal);
    this._updateButtons();
  }

  async _onHit() {
    const g = this.game;
    const prevIdx = g.currentHandIndex;
    this._disableAll();

    const card = g.hit();
    if (!card) { this._updateButtons(); return; }

    SoundFX.deal();
    this._appendCardToHand(prevIdx, card);
    this._updateHandTotal(prevIdx);
    this._updateCountHud();
    this._updateShoeBar();
    this._log('log', `DRAW: ${card.rank}${card.suit} (VAL:${card.numericValue}) — HAND: ${g.playerHands[prevIdx].visibleTotal}`);

    const hand = g.playerHands[prevIdx];
    this._updateHeartRate(hand.total);
    this._updateBustBar(hand.total);

    if (hand.isBust) this._log('warn', `BUST — TOTAL:${hand.total} > 21`);

    await this._pause(150);

    if (g.allHandsDone) {
      await this._runDealerTurn();
    } else {
      this._highlightActiveHand();
      this._updateHintHud();
      this._updateButtons();
    }
  }

  async _onStand() {
    const g = this.game;
    this._disableAll();
    this._log('log', `STAND — PLAYER HOLDS AT ${g.currentHand?.visibleTotal}`);
    g.stand();

    if (g.allHandsDone) {
      await this._runDealerTurn();
    } else {
      this._highlightActiveHand();
      this._updateHintHud();
      this._updateButtons();
    }
  }

  async _onDouble() {
    const g = this.game;
    const prevIdx = g.currentHandIndex;
    this._disableAll();

    const card = g.double();
    if (!card) { this._updateButtons(); return; }

    this._appendCardToHand(prevIdx, card);
    this._updateHandTotal(prevIdx);
    this._updateBankroll();
    this._updateCountHud();
    this._updateShoeBar();
    const hand = g.playerHands[prevIdx];
    this._log('log', `DOUBLE_DOWN — DRAW: ${card.rank}${card.suit} — HAND: ${hand.total}`);
    this._updateHeartRate(hand.total);
    this._updateBustBar(hand.total);

    await this._pause(300);
    await this._runDealerTurn();
  }

  async _onSplit() {
    const g = this.game;
    this._disableAll();

    if (!g.split()) { this._updateButtons(); return; }

    this._log('warn', `SPLIT EXECUTED — 2 HANDS ACTIVE`);
    this._rerenderPlayerHands();
    this._updateBankroll();
    this._highlightActiveHand();
    this._updateHintHud();
    this._updateButtons();
  }

  async _onInsurance(take) {
    const g = this.game;
    this._disableAll();

    const result = take ? g.takeInsurance() : g.declineInsurance();
    this.el.msgOverlay.classList.add('hidden');
    this._updateBankroll();

    this._log(take ? 'warn' : 'log', take ? `INSURANCE_TAKEN ($${g.insuranceBet})` : 'INSURANCE_DECLINED');

    if (result.dealerBlackjack) {
      this._log('warn', 'DEALER_BLACKJACK CONFIRMED');
      this._flipDealerHoleCard();
      await this._pause(600);
      this._showResult();
    } else if (g.state === STATE.RESOLUTION) {
      this._flipDealerHoleCard();
      await this._pause(500);
      this._showResult();
    } else {
      this._setTableState('state-player');
      this._highlightActiveHand();
      this._updateDealerTotal();
      this._updateHintHud();
      this._updateButtons();
    }
  }

  _onNewGame() {
    const wasLow = this.game.deck.remaining < 52;
    this.game.newGame();
    if (wasLow) SoundFX.shuffle();
    this._clearTable();
    this._updateBankroll();
    this._updateBet();
    this._setTableState('');
    this._setHeartRate(60);
    this._updateBustBar(0);
    this._updateShoeBar();
    this._updateButtons();
    this.el.msgOverlay.classList.add('hidden');
    this._log('sys', 'NEW_ROUND — AWAITING BET INPUT...');
  }

  // ====================================================
  // DEALER TURN SEQUENCE
  // ====================================================

  async _runDealerTurn() {
    const g = this.game;
    this._setTableState('state-dealer');
    await this._pause(300);

    g.revealHoleCard();
    SoundFX.flip();
    this._flipDealerHoleCard();
    this._updateDealerTotal();
    this._updateCountHud();
    this._updateShoeBar();
    this._log('sys', `DEALER_REVEAL — HOLE: ${g.dealerHand.cards[1].rank}${g.dealerHand.cards[1].suit} — TOTAL: ${g.dealerHand.total}`);
    await this._pause(600);

    let card;
    while ((card = g.dealerHit()) !== null) {
      SoundFX.deal();
      const cardEl = this._makeCardEl(card);
      this.el.dealerCards.appendChild(cardEl);
      this._updateDealerTotal();
      this._updateCountHud();
      this._updateShoeBar();
      this._log('log', `DEALER_DRAW: ${card.rank}${card.suit} — TOTAL: ${g.dealerHand.total}`);
      await this._pause(this._DELAY);
    }
    this._log('log', `DEALER_STANDS at ${g.dealerHand.total}`);

    g.resolve();
    this._showResult();
  }

  // ====================================================
  // CARD DEAL ANIMATION
  // ====================================================

  async _animateDeal() {
    const g  = this.game;
    const ph = g.playerHands[0];
    const dh = g.dealerHand;

    const handEl      = this._makeHandEl(0);
    this.el.playerHands.appendChild(handEl);
    const playerCardsEl = handEl.querySelector('.card-row');

    const sequence = [
      { target: playerCardsEl,       card: ph.cards[0] },
      { target: this.el.dealerCards, card: dh.cards[0] },
      { target: playerCardsEl,       card: ph.cards[1] },
      { target: this.el.dealerCards, card: dh.cards[1] },
    ];

    for (const { target, card } of sequence) {
      SoundFX.deal();
      target.appendChild(this._makeCardEl(card));
      await this._pause(this._DELAY);
    }

    this._updateHandTotal(0);
  }

  // ====================================================
  // DOM HELPERS
  // ====================================================

  _makeCardEl(card) {
    const el = document.createElement('div');
    el.className = 'card' + (card.faceDown ? ' face-down' : '');
    el.innerHTML = CardRenderer.render(card);
    return el;
  }

  _makeHandEl(index) {
    const el = document.createElement('div');
    el.className = 'player-hand';
    el.dataset.handIndex = index;
    el.innerHTML = `<div class="card-row"></div><div class="hand-total"></div>`;
    return el;
  }

  _flipDealerHoleCard() {
    const cards = this.el.dealerCards.querySelectorAll('.card');
    if (cards[1]) cards[1].classList.remove('face-down');
  }

  _appendCardToHand(handIndex, card) {
    const handEls = this.el.playerHands.querySelectorAll('.player-hand');
    const handEl  = handEls[handIndex];
    if (!handEl) return;
    handEl.querySelector('.card-row').appendChild(this._makeCardEl(card));
  }

  _updateHandTotal(handIndex) {
    const handEls = this.el.playerHands.querySelectorAll('.player-hand');
    const handEl  = handEls[handIndex];
    if (!handEl) return;
    const hand = this.game.playerHands[handIndex];
    if (!hand) return;
    handEl.querySelector('.hand-total').textContent = hand.visibleTotal || '';
    handEl.classList.toggle('bust', hand.isBust);
  }

  _highlightActiveHand() {
    const g       = this.game;
    const handEls = this.el.playerHands.querySelectorAll('.player-hand');
    handEls.forEach((el, i) => {
      el.classList.toggle('active', i === g.currentHandIndex && g.state === STATE.PLAYER_TURN);
    });
  }

  _updateDealerTotal() {
    const g  = this.game;
    const dh = g.dealerHand;
    if (!dh) { this.el.dealerTotal.textContent = ''; return; }

    if (g.state === STATE.DEALER_TURN || g.state === STATE.RESOLUTION) {
      const t = dh.total;
      this.el.dealerTotal.textContent = t > 0 ? t : '';
    } else {
      const up = dh.cards[0];
      this.el.dealerTotal.textContent = up ? up.numericValue : '';
    }
  }

  _rerenderPlayerHands() {
    this.el.playerHands.innerHTML = '';
    this.game.playerHands.forEach((hand, i) => {
      const handEl  = this._makeHandEl(i);
      const cardsEl = handEl.querySelector('.card-row');
      const totalEl = handEl.querySelector('.hand-total');

      hand.cards.forEach(card => cardsEl.appendChild(this._makeCardEl(card)));
      totalEl.textContent = hand.visibleTotal || '';
      handEl.classList.toggle('bust', hand.isBust);

      this.el.playerHands.appendChild(handEl);
    });
  }

  _clearTable() {
    this.el.dealerCards.innerHTML = '';
    this.el.playerHands.innerHTML = '';
    this.el.dealerTotal.textContent = '';
    this.el.msgOverlay.classList.add('hidden');
  }

  // ====================================================
  // RESULT DISPLAY
  // ====================================================

  _showResult() {
    const g       = this.game;
    const results = g.results;

    this._updateBankroll();
    this._updateDealerTotal();
    this._updateProfitBar();
    this._setHeartRate(60);

    // Result sounds
    const outcome = g.results[0]?.outcome;
    if      (outcome === 'BLACKJACK') SoundFX.blackjack();
    else if (outcome === 'WIN')       SoundFX.win();
    else if (outcome === 'BUST')      SoundFX.bust();
    else if (outcome === 'LOSE')      SoundFX.bust();
    else if (outcome === 'PUSH')      SoundFX.push();

    // Increment round counter + heat
    this._roundsPlayed++;
    this._heatPct = Math.min(100, this._heatPct + 4);
    this.el.roundsValue.textContent = this._roundsPlayed;
    this.el.heatFill.style.width    = this._heatPct + '%';
    this.el.heatLabel.textContent   = this._heatPct + '%';

    // Mark hand outcomes visually
    const handEls = this.el.playerHands.querySelectorAll('.player-hand');
    handEls.forEach((el, i) => {
      const r = results[i];
      if (!r) return;
      el.classList.remove('active', 'bust');
      if (r.outcome === 'WIN' || r.outcome === 'BLACKJACK') el.classList.add('won');
      if (r.outcome === 'BUST' || r.outcome === 'LOSE')     el.classList.add('bust');
    });

    // Set table glow state
    const primary = results[0]?.outcome || '';
    if      (primary === 'BLACKJACK') this._setTableState('state-bj');
    else if (primary === 'WIN')       this._setTableState('state-win');
    else if (primary === 'LOSE' || primary === 'BUST') this._setTableState('state-lose');
    else if (primary === 'PUSH')      this._setTableState('state-push');

    // Build message
    if (results.length === 1) {
      const r = results[0];
      let text = r.outcome, sub = '';
      switch (r.outcome) {
        case 'WIN':       text = 'YOU WIN!';     sub = `+$${r.profit}`;         break;
        case 'BLACKJACK': text = 'BLACKJACK!';   sub = `+$${r.profit} (3:2)`;   break;
        case 'PUSH':      text = 'PUSH';         sub = 'Bet returned';           break;
        case 'BUST':      text = 'BUST';         sub = `-$${r.hand.bet}`;        break;
        case 'LOSE':      text = 'DEALER WINS';  sub = `-$${r.hand.bet}`;        break;
      }
      this._showMessage(text, sub, r.outcome.toLowerCase());
      this._log('res', `RESULT: ${r.outcome}${r.profit ? ` (+$${r.profit})` : ''}`);
    } else {
      const netDelta = results.reduce((acc, r) => {
        if (r.outcome === 'WIN' || r.outcome === 'BLACKJACK') return acc + r.profit;
        if (r.outcome === 'BUST' || r.outcome === 'LOSE')     return acc - r.hand.bet;
        return acc;
      }, 0);
      const sign = netDelta >= 0 ? '+' : '';
      const lines = results.map((r, i) => `H${i+1}:${r.outcome}`).join(' ');
      this._showMessage('RESULTS', `${lines}  (${sign}$${Math.abs(netDelta)})`, netDelta >= 0 ? 'win' : 'lose');
      this._log('res', `SPLIT_RESULT: ${lines} NET:${sign}$${Math.abs(netDelta)}`);
    }

    this._updateButtons();
  }

  _showMessage(text, sub = '', type = '') {
    this.el.msgText.textContent = text;
    this.el.msgSub.textContent  = sub;
    this.el.msgOverlay.className = type;
    this.el.msgOverlay.classList.remove('hidden');
  }

  // ====================================================
  // TERMINAL LOG
  // ====================================================

  _log(tag, message) {
    if (!this.el.termLog) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const tagMap = { sys: '[SYSTEM]', log: '[LOG]', calc: '[CALC]', warn: '[WARN]', res: '[RESULT]' };
    entry.innerHTML = `<span class="log-tag ${tag}">${tagMap[tag] || '[LOG]'}</span><span class="log-msg">${message}</span>`;
    this.el.termLog.prepend(entry);

    // Keep log bounded to 120 entries
    while (this.el.termLog.children.length > 120) {
      this.el.termLog.removeChild(this.el.termLog.lastChild);
    }
  }

  _logDealCards() {
    const g  = this.game;
    const ph = g.playerHands[0];
    const dh = g.dealerHand;
    if (!ph || !dh) return;
    this._log('log', `P_CARD_1: ${ph.cards[0].rank}${ph.cards[0].suit} (VAL:${ph.cards[0].numericValue})`);
    this._log('log', `D_CARD_1: ${dh.cards[0].rank}${dh.cards[0].suit} (VAL:${dh.cards[0].numericValue})`);
    this._log('log', `P_CARD_2: ${ph.cards[1].rank}${ph.cards[1].suit} (VAL:${ph.cards[1].numericValue})`);
    this._log('log', `D_CARD_2: [HOLE_CARD]`);
    this._log('calc', `P_TOTAL: ${ph.visibleTotal}  |  D_UPCARD: ${dh.cards[0].numericValue}`);

    const bustPct = this._bustProbability(ph.visibleTotal);
    this._log('calc', `BUST_RISK: ${bustPct}%`);
  }

  // ====================================================
  // HEART RATE MONITOR
  // ====================================================

  _updateHeartRate(handTotal) {
    let bpm, status, duration;
    if (handTotal >= 21)      { bpm = 160; status = 'CRITICAL'; duration = '0.6s'; }
    else if (handTotal >= 19) { bpm = 130; status = 'ELEVATED'; duration = '0.9s'; }
    else if (handTotal >= 17) { bpm = 100; status = 'HIGH';     duration = '1.2s'; }
    else if (handTotal >= 13) { bpm = 80;  status = 'NOMINAL';  duration = '1.5s'; }
    else                      { bpm = 60;  status = 'NOMINAL';  duration = '2s';   }

    this._setHeartRate(bpm, status, duration);
  }

  _setHeartRate(bpm, status = 'NOMINAL', duration = '2s') {
    if (this.el.bpmValue)  this.el.bpmValue.textContent = bpm;
    if (this.el.hrStatus)  this.el.hrStatus.textContent = status;
    if (this.el.ekgGroup)  this.el.ekgGroup.style.animationDuration = duration;
  }

  // ====================================================
  // BUST PROBABILITY BAR
  // ====================================================

  _bustProbability(total) {
    const table = { 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0,
                    12:31, 13:38, 14:46, 15:54, 16:62, 17:69,
                    18:77, 19:85, 20:92, 21:100 };
    if (total <= 11) return 0;
    return table[Math.min(total, 21)] || 0;
  }

  _updateBustBar(total) {
    const pct = this._bustProbability(total);
    if (this.el.bustBar)  this.el.bustBar.style.width = pct + '%';
    if (this.el.bustPct)  this.el.bustPct.textContent = pct + '%';
    const logMsg = total > 0 ? `BUST_PROB(${total}): ${pct}%` : 'BUST_PROB: 0%';
    if (total >= 12) this._log('calc', logMsg);
  }

  // ====================================================
  // ANALYTICS HUD
  // ====================================================

  _updateCountHud() {
    if (!this.showCount) return;
    const count = Strategy.getCount();
    const label = Strategy.getCountLabel();
    this.el.countValue.textContent = count >= 0 ? `+${count}` : `${count}`;
    this.el.countLabel.textContent = label;
    this.el.countLabel.className   = '';
    if (count > 2)       this.el.countLabel.classList.add('positive');
    else if (count < -2) this.el.countLabel.classList.add('negative');

    // Also update bottom bar
    if (this.el.bottomCount) {
      this.el.bottomCount.textContent = count >= 0 ? `+${count}` : `${count}`;
    }
  }

  _updateHintHud() {
    if (!this.showHint) return;
    const g    = this.game;
    const hand = g.currentHand;
    const up   = g.dealerUpcard;
    if (!hand || !up || g.state !== STATE.PLAYER_TURN) {
      this.el.hintValue.textContent = '--';
      return;
    }
    const hint = Strategy.getHint(hand, up);
    this.el.hintValue.textContent = Strategy.getHintText(hint);
  }

  // ====================================================
  // TABLE STATE BORDER
  // ====================================================

  _setTableState(cls) {
    if (!this.el.table) return;
    this.el.table.className = '';
    if (cls) this.el.table.classList.add(cls);
  }

  // ====================================================
  // SHOE / PROFIT / BOTTOM BAR
  // ====================================================

  _updateShoeBar() {
    const g   = this.game;
    const max = g.deck.numDecks * 52;
    const rem = g.deck.remaining;
    const pct = Math.round((rem / max) * 100);

    if (this.el.shoeBar)      this.el.shoeBar.style.width = pct + '%';
    if (this.el.shoePct)      this.el.shoePct.textContent = pct + '%';
    if (this.el.shoeIntegrity) this.el.shoeIntegrity.textContent = pct + '%';
  }

  _updateProfitBar() {
    const delta = this.game.bankroll - this._startBankroll;
    const sign  = delta >= 0 ? '+' : '';
    if (!this.el.profitDisplay) return;
    this.el.profitDisplay.textContent = `${sign}$${delta}`;
    this.el.profitDisplay.className   = '';
    if (delta > 0)      this.el.profitDisplay.classList.add('positive');
    else if (delta < 0) this.el.profitDisplay.classList.add('negative');
    else                this.el.profitDisplay.classList.add('neutral');
  }

  // ====================================================
  // DISPLAY UPDATES
  // ====================================================

  _updateBankroll() {
    this.el.bankroll.textContent = `$${this.game.bankroll.toLocaleString()}`;
  }

  _updateBet() {
    this.el.bet.textContent = `$${this.game.currentBet}`;
  }

  // ====================================================
  // BUTTON GATING
  // ====================================================

  _updateButtons() {
    const g         = this.game;
    const isBetting = g.state === STATE.BETTING;
    const isPlayer  = g.state === STATE.PLAYER_TURN;
    const isInsure  = g.state === STATE.INSURANCE;
    const isDone    = g.state === STATE.RESOLUTION;
    const hand      = g.currentHand;

    this.el.chips.forEach(b => { b.disabled = !isBetting; });
    this.el.clearBtn.disabled = !isBetting || g.currentBet === 0;

    this._toggle(this.el.dealBtn, isBetting);
    this.el.dealBtn.disabled = isBetting && g.currentBet <= 0;

    this._toggle(this.el.hitBtn,      isPlayer);
    this._toggle(this.el.standBtn,    isPlayer);
    this._toggle(this.el.doubleBtn,   isPlayer && !!hand?.canDouble && g.bankroll >= (hand?.bet || 0));
    this._toggle(this.el.splitBtn,    isPlayer && !!hand?.canSplit  && g.bankroll >= (hand?.bet || 0));
    this._toggle(this.el.insureBtn,   isInsure);
    this._toggle(this.el.noInsureBtn, isInsure);
    this._toggle(this.el.newGameBtn,  isDone);
  }

  _toggle(el, visible) {
    if (!el) return;
    el.classList.toggle('hidden', !visible);
    el.disabled = !visible;
  }

  // ====================================================
  // CLOCK
  // ====================================================

  _startClock() {
    const update = () => {
      const now = new Date();
      const hh  = String(now.getHours()).padStart(2, '0');
      const mm  = String(now.getMinutes()).padStart(2, '0');
      const ss  = String(now.getSeconds()).padStart(2, '0');
      const ts  = `${hh}:${mm}:${ss}`;
      if (this.el.sysTime)    this.el.sysTime.textContent    = ts;
      if (this.el.rcTimestamp) this.el.rcTimestamp.innerHTML = `<span class="dim">TIME:</span> ${ts}`;
    };
    update();
    setInterval(update, 1000);
  }

  // ====================================================
  // PARTICLE SYSTEM
  // ====================================================

  _startParticles() {
    const canvas = this.el.particleCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 55;
    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      a:  Math.random(),
      va: (Math.random() - 0.5) * 0.004,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x  += p.vx;
        p.y  += p.vy;
        p.a  += p.va;
        if (p.a > 0.7) p.va *= -1;
        if (p.a < 0)   p.va *= -1;
        if (p.x < 0)   p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0)   p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,120,${p.a * 0.35})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  // ====================================================
  // UTILITY
  // ====================================================

  _disableAll() {
    [
      this.el.dealBtn, this.el.hitBtn, this.el.standBtn, this.el.doubleBtn,
      this.el.splitBtn, this.el.insureBtn, this.el.noInsureBtn, this.el.newGameBtn,
      this.el.clearBtn,
    ].forEach(el => { if (el) el.disabled = true; });
    this.el.chips.forEach(el => { el.disabled = true; });
  }

  _pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
