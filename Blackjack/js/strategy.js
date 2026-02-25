// ===== strategy.js =====
// Hi-Lo card counting + Basic Strategy hint engine. Exposes global: Strategy

const Strategy = (() => {
  let runningCount = 0;
  let cardsDealt   = 0;

  function reset() {
    runningCount = 0;
    cardsDealt   = 0;
  }

  // Hi-Lo system: 2-6 = +1, 7-9 = 0, 10/J/Q/K/A = -1
  function trackCard(card) {
    if (!card || card.faceDown) return;
    const v = card.numericValue;
    if (v >= 2 && v <= 6)       runningCount++;
    else if (v >= 10 || card.rank === 'A') runningCount--;
    cardsDealt++;
  }

  function getCount() { return runningCount; }

  function getCountLabel() {
    if (runningCount > 2)  return 'Player Edge';
    if (runningCount < -2) return 'House Edge';
    return 'Neutral';
  }

  // Returns: 'H' (hit), 'S' (stand), 'D' (double), 'P' (split)
  function getHint(playerHand, dealerUpcard) {
    if (!playerHand || !dealerUpcard || playerHand.cards.length < 2) return null;

    const d = dealerUpcard.numericValue;         // dealer upcard value (1-11)
    const dv = dealerUpcard.rank === 'A' ? 11 : d; // treat ace as 11 for lookup

    if (playerHand.canSplit) {
      return _pairStrategy(playerHand.cards[0].rank, dv);
    }
    if (playerHand.isSoft) {
      return _softStrategy(playerHand.visibleTotal, dv, playerHand.canDouble);
    }
    return _hardStrategy(playerHand.visibleTotal, dv, playerHand.canDouble);
  }

  function getHintText(hint) {
    const map = { H: 'HIT', S: 'STAND', D: 'DOUBLE DOWN', P: 'SPLIT' };
    return map[hint] || '--';
  }

  // ---- Pair Strategy ----
  function _pairStrategy(rank, d) {
    if (rank === 'A' || rank === '8')                         return 'P'; // always split
    if (['10', 'J', 'Q', 'K'].includes(rank))                 return 'S'; // never split 10s
    if (rank === '5')                                          return (d <= 9) ? 'D' : 'H';
    if (rank === '4')                                          return (d === 5 || d === 6) ? 'P' : 'H';
    if (rank === '2' || rank === '3')                          return (d >= 2 && d <= 7) ? 'P' : 'H';
    if (rank === '6')                                          return (d >= 2 && d <= 6) ? 'P' : 'H';
    if (rank === '7')                                          return (d >= 2 && d <= 7) ? 'P' : 'H';
    if (rank === '9') return (d === 7 || d >= 10)             ? 'S' : 'P';
    return 'H';
  }

  // ---- Soft Strategy (hand has ace counted as 11) ----
  function _softStrategy(total, d, canDouble) {
    if (total >= 19) return 'S';
    if (total === 18) {
      if (d >= 3 && d <= 6) return canDouble ? 'D' : 'S';
      if (d === 2 || d === 7 || d === 8) return 'S';
      return 'H';
    }
    // Soft 17 (A-6)
    if (total === 17) {
      if (d >= 3 && d <= 6) return canDouble ? 'D' : 'H';
      return 'H';
    }
    // Soft 13-16
    if (d >= 4 && d <= 6) return canDouble ? 'D' : 'H';
    return 'H';
  }

  // ---- Hard Strategy ----
  function _hardStrategy(total, d, canDouble) {
    if (total >= 17)           return 'S';
    if (total >= 13 && total <= 16) return (d >= 2 && d <= 6) ? 'S' : 'H';
    if (total === 12)          return (d >= 4 && d <= 6) ? 'S' : 'H';
    if (total === 11)          return canDouble ? 'D' : 'H';
    if (total === 10)          return (d <= 9) ? (canDouble ? 'D' : 'H') : 'H';
    if (total === 9)           return (d >= 3 && d <= 6) ? (canDouble ? 'D' : 'H') : 'H';
    return 'H';
  }

  return { reset, trackCard, getCount, getCountLabel, getHint, getHintText };
})();
