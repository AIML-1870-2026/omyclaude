// ===== deck.js =====
// Card and Deck classes. Exposes globals: Card, Deck

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.faceDown = false;
  }

  get numericValue() {
    if (this.rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(this.rank)) return 10;
    return parseInt(this.rank, 10);
  }

  get isRed() {
    return this.suit === '♥' || this.suit === '♦';
  }
}

class Deck {
  constructor(numDecks = 6) {
    this.numDecks = numDecks;
    this.cards = [];
    this.reset();
  }

  reset() {
    this.cards = [];
    for (let d = 0; d < this.numDecks; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          this.cards.push(new Card(suit, rank));
        }
      }
    }
    this.shuffle();
  }

  // Fisher-Yates uniform shuffle
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = tmp;
    }
  }

  // Non-destructive pop — removes and returns top card; reshuffles when low
  deal(faceDown = false) {
    if (this.cards.length < 15) this.reset();
    const card = this.cards.pop();
    card.faceDown = faceDown;
    return card;
  }

  get remaining() {
    return this.cards.length;
  }
}
