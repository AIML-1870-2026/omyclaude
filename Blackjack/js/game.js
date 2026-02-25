// ===== game.js =====
// GameEngine state machine. Exposes globals: STATE, GameEngine

const STATE = Object.freeze({
  BETTING:     'BETTING',
  INSURANCE:   'INSURANCE',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  RESOLUTION:  'RESOLUTION',
});

class GameEngine {
  constructor() {
    this.deck             = new Deck(6);
    this.bankroll         = 1000;
    this.currentBet       = 0;
    this.state            = STATE.BETTING;
    this.playerHands      = [];
    this.dealerHand       = null;
    this.currentHandIndex = 0;
    this.insuranceBet     = 0;
    this.results          = [];
    Strategy.reset();
  }

  // ---- Computed ----

  get currentHand() {
    return this.playerHands[this.currentHandIndex] || null;
  }

  get dealerUpcard() {
    return this.dealerHand ? this.dealerHand.cards[0] : null;
  }

  get allHandsDone() {
    return this.currentHandIndex >= this.playerHands.length;
  }

  // ---- Betting Phase ----

  placeBet(amount) {
    if (this.state !== STATE.BETTING) return false;
    if (this.currentBet + amount > this.bankroll) return false;
    this.currentBet += amount;
    return true;
  }

  clearBet() {
    if (this.state !== STATE.BETTING) return;
    this.currentBet = 0;
  }

  // ---- Deal ----

  deal() {
    if (this.state !== STATE.BETTING || this.currentBet <= 0) return false;

    this.bankroll -= this.currentBet;
    this.playerHands      = [new Hand(this.currentBet)];
    this.dealerHand       = new Hand(0);
    this.currentHandIndex = 0;
    this.insuranceBet     = 0;
    this.results          = [];

    const ph = this.playerHands[0];
    const dh = this.dealerHand;

    // Deal order: Player, Dealer, Player, Dealer (hole card face-down)
    const c1 = this.deck.deal();       ph.addCard(c1); Strategy.trackCard(c1);
    const c2 = this.deck.deal();       dh.addCard(c2); Strategy.trackCard(c2);
    const c3 = this.deck.deal();       ph.addCard(c3); Strategy.trackCard(c3);
    const c4 = this.deck.deal(true);   dh.addCard(c4); // hole card — counted on reveal

    // Determine next state
    if (dh.cards[0].rank === 'A') {
      // Offer insurance; peek happens after player decides
      this.state = STATE.INSURANCE;
    } else {
      // American rules: silently peek for BJ when dealer shows 10-value
      if (dh.cards[0].numericValue === 10 && dh.total === 21) {
        // Dealer has blackjack — reveal and resolve immediately
        dh.cards[1].faceDown = false;
        Strategy.trackCard(dh.cards[1]);
        this._resolveAll();
        this.state = STATE.RESOLUTION;
      } else if (ph.isBlackjack) {
        // Player blackjack, dealer no BJ (or non-10 upcard)
        dh.cards[1].faceDown = false;
        Strategy.trackCard(dh.cards[1]);
        this._resolveAll();
        this.state = STATE.RESOLUTION;
      } else {
        this.state = STATE.PLAYER_TURN;
      }
    }

    return true;
  }

  // ---- Insurance Phase ----

  takeInsurance() {
    if (this.state !== STATE.INSURANCE) return { dealerBlackjack: false };
    const amount = Math.min(Math.floor(this.currentBet / 2), this.bankroll);
    if (amount > 0) {
      this.insuranceBet = amount;
      this.bankroll    -= amount;
    }
    return this._peek();
  }

  declineInsurance() {
    if (this.state !== STATE.INSURANCE) return { dealerBlackjack: false };
    return this._peek();
  }

  _peek() {
    const dh = this.dealerHand;
    // Reveal hole card to peek
    dh.cards[1].faceDown = false;
    Strategy.trackCard(dh.cards[1]);
    const dealerBJ = dh.isBlackjack;

    if (dealerBJ) {
      // Insurance pays 2:1 on side bet
      if (this.insuranceBet > 0) {
        this.bankroll += this.insuranceBet * 3; // original + 2× profit
      }
      this._resolveAll();
      this.state = STATE.RESOLUTION;
      return { dealerBlackjack: true };
    }

    // No dealer BJ — re-hide hole card; check for player BJ
    dh.cards[1].faceDown = true;

    if (this.playerHands[0].isBlackjack) {
      // Player BJ, dealer no BJ — resolve immediately
      dh.cards[1].faceDown = false; // will show on result screen
      this._resolveAll();
      this.state = STATE.RESOLUTION;
      return { dealerBlackjack: false };
    }

    this.state = STATE.PLAYER_TURN;
    return { dealerBlackjack: false };
  }

  // ---- Player Actions ----

  hit() {
    if (this.state !== STATE.PLAYER_TURN) return null;
    const hand = this.currentHand;
    if (!hand) return null;

    const card = this.deck.deal();
    hand.addCard(card);
    Strategy.trackCard(card);

    if (hand.isBust) this._advanceHand();
    return card;
  }

  stand() {
    if (this.state !== STATE.PLAYER_TURN) return;
    const hand = this.currentHand;
    if (hand) hand.stood = true;
    this._advanceHand();
  }

  double() {
    if (this.state !== STATE.PLAYER_TURN) return null;
    const hand = this.currentHand;
    if (!hand || !hand.canDouble || this.bankroll < hand.bet) return null;

    this.bankroll -= hand.bet;
    hand.bet     *= 2;
    hand.doubled  = true;

    const card = this.deck.deal();
    hand.addCard(card);
    Strategy.trackCard(card);

    this._advanceHand();
    return card;
  }

  split() {
    if (this.state !== STATE.PLAYER_TURN) return false;
    const hand = this.currentHand;
    if (!hand || !hand.canSplit || this.bankroll < hand.bet) return false;

    this.bankroll -= hand.bet;

    const h1 = new Hand(hand.bet);
    const h2 = new Hand(hand.bet);

    h1.addCard(hand.cards[0]);
    h2.addCard(hand.cards[1]);

    // Each split hand gets one fresh card
    const d1 = this.deck.deal(); h1.addCard(d1); Strategy.trackCard(d1);
    const d2 = this.deck.deal(); h2.addCard(d2); Strategy.trackCard(d2);

    this.playerHands.splice(this.currentHandIndex, 1, h1, h2);
    return true;
  }

  _advanceHand() {
    this.currentHandIndex++;
    if (this.allHandsDone) {
      this.state = STATE.DEALER_TURN;
    }
  }

  // ---- Dealer Turn (UI calls these with animation timing) ----

  revealHoleCard() {
    const holeCard = this.dealerHand.cards[1];
    holeCard.faceDown = false;
    Strategy.trackCard(holeCard);
    return holeCard;
  }

  dealerHit() {
    if (this.dealerHand.total >= 17) return null;
    const card = this.deck.deal();
    this.dealerHand.addCard(card);
    Strategy.trackCard(card);
    return card;
  }

  resolve() {
    this._resolveAll();
    this.state = STATE.RESOLUTION;
  }

  // ---- Resolution ----

  _resolveAll() {
    const dh        = this.dealerHand;
    const dealerBJ  = dh.isBlackjack;
    const dealerTot = dh.total;
    this.results    = [];

    for (const hand of this.playerHands) {
      const r = { outcome: '', profit: 0, hand };

      if (hand.isBust) {
        r.outcome = 'BUST';

      } else if (hand.isBlackjack && dealerBJ) {
        this.bankroll += hand.bet;
        r.outcome = 'PUSH';

      } else if (hand.isBlackjack) {
        const winnings = Math.floor(hand.bet * 1.5);
        this.bankroll += hand.bet + winnings;
        r.outcome = 'BLACKJACK';
        r.profit  = winnings;

      } else if (dealerBJ) {
        r.outcome = 'LOSE';

      } else if (dealerTot > 21) {
        this.bankroll += hand.bet * 2;
        r.outcome = 'WIN';
        r.profit  = hand.bet;

      } else if (hand.total > dealerTot) {
        this.bankroll += hand.bet * 2;
        r.outcome = 'WIN';
        r.profit  = hand.bet;

      } else if (hand.total === dealerTot) {
        this.bankroll += hand.bet;
        r.outcome = 'PUSH';

      } else {
        r.outcome = 'LOSE';
      }

      this.results.push(r);
    }
  }

  // ---- New Round ----

  newGame() {
    if (this.bankroll <= 0) this.bankroll = 1000; // reload
    this.currentBet       = 0;
    this.playerHands      = [];
    this.dealerHand       = null;
    this.currentHandIndex = 0;
    this.insuranceBet     = 0;
    this.results          = [];
    this.state            = STATE.BETTING;

    if (this.deck.remaining < 52) {
      this.deck.reset();
      Strategy.reset();
    }
  }
}
