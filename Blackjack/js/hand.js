// ===== hand.js =====
// Hand class — scoring, Ace paradox, state detection. Exposes global: Hand

class Hand {
  constructor(bet = 0) {
    this.cards = [];
    this.bet = bet;
    this.stood = false;
    this.doubled = false;
  }

  addCard(card) {
    this.cards.push(card);
  }

  // Total of ALL cards (including face-down) — used for game logic
  get total() {
    let total = 0;
    let aces = 0;
    for (const card of this.cards) {
      if (card.rank === 'A') { aces++; total += 11; }
      else if (['J', 'Q', 'K'].includes(card.rank)) total += 10;
      else total += parseInt(card.rank, 10);
    }
    // Ace Paradox: reduce aces from 11 → 1 while busting
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  // Total of visible (face-up) cards only — used for display
  get visibleTotal() {
    let total = 0;
    let aces = 0;
    for (const card of this.cards) {
      if (card.faceDown) continue;
      if (card.rank === 'A') { aces++; total += 11; }
      else if (['J', 'Q', 'K'].includes(card.rank)) total += 10;
      else total += parseInt(card.rank, 10);
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  // True if at least one ace is still counted as 11 (soft hand)
  get isSoft() {
    let total = 0;
    let acesAs11 = 0;
    for (const card of this.cards) {
      if (card.faceDown) continue;
      if (card.rank === 'A') { acesAs11++; total += 11; }
      else if (['J', 'Q', 'K'].includes(card.rank)) total += 10;
      else total += parseInt(card.rank, 10);
    }
    while (total > 21 && acesAs11 > 0) { total -= 10; acesAs11--; }
    return acesAs11 > 0;
  }

  get isBust()      { return this.total > 21; }
  get isBlackjack() { return this.cards.length === 2 && this.total === 21; }
  get isDone()      { return this.stood || this.isBust || this.doubled; }

  get canSplit() {
    return this.cards.length === 2 &&
      this.cards[0].numericValue === this.cards[1].numericValue;
  }

  get canDouble() { return this.cards.length === 2; }
}
