// ===== cards.js =====
// High-fidelity card face renderer with proper pip layouts.
// Exposes global: CardRenderer

const CardRenderer = (() => {

  // Classic playing card pip positions: [x%, y%, rotated?]
  // Coordinates are % of the pip-area container; pips are centered via translate(-50%,-50%)
  // Rotated pips (bottom half) point downward on real cards
  const PIP_LAYOUTS = {
    '2':  [[50,20],       [50,80,1]],
    '3':  [[50,16],       [50,50],         [50,84,1]],
    '4':  [[27,20],[73,20],                [27,80,1],[73,80,1]],
    '5':  [[27,20],[73,20],[50,50],        [27,80,1],[73,80,1]],
    '6':  [[27,18],[73,18],[27,50],[73,50],[27,82,1],[73,82,1]],
    '7':  [[27,15],[73,15],[50,32],[27,50],[73,50],[27,82,1],[73,82,1]],
    '8':  [[27,15],[73,15],[50,31],[27,49],[73,49],[50,68,1],[27,83,1],[73,83,1]],
    '9':  [[27,13],[73,13],[27,35],[73,35],[50,50],[27,65,1],[73,65,1],[27,87,1],[73,87,1]],
    '10': [[27,11],[73,11],[50,24],[27,37],[73,37],[27,63,1],[73,63,1],[50,76,1],[27,89,1],[73,89,1]],
  };

  // Face card inner border accent colors
  const FACE_ACCENT = { J: '#1e3a8a', Q: '#7f1d1d', K: '#14532d' };

  function _pipHtml(rank, suit, isRed) {
    const col = isRed ? '#dc2626' : '#111';

    if (rank === 'A') {
      return `<div class="ace-pip" style="color:${col}">${suit}</div>`;
    }

    if (rank === 'J' || rank === 'Q' || rank === 'K') {
      const acc = FACE_ACCENT[rank];
      return `
        <div class="face-art" style="--acc:${acc}">
          <div class="face-art-inner">
            <span class="face-rank" style="color:${col}">${rank}</span>
            <span class="face-suit" style="color:${col}">${suit}</span>
          </div>
        </div>`;
    }

    const layout  = PIP_LAYOUTS[rank] || [];
    const isDense = layout.length >= 8;
    const cls     = isDense ? 'pip small' : 'pip';

    return layout.map(([x, y, rot]) => {
      const t = rot
        ? `transform:translate(-50%,-50%) rotate(180deg)`
        : `transform:translate(-50%,-50%)`;
      return `<span class="${cls}" style="left:${x}%;top:${y}%;${t};color:${col}">${suit}</span>`;
    }).join('');
  }

  function render(card) {
    const colorCls = card.isRed ? 'red' : 'black';
    const pipHtml  = _pipHtml(card.rank, card.suit, card.isRed);

    return `
      <div class="card-inner">
        <div class="card-front ${colorCls}">
          <div class="card-corner tl">
            <span class="rank">${card.rank}</span>
            <span class="suit">${card.suit}</span>
          </div>
          <div class="card-pips">${pipHtml}</div>
          <div class="card-corner br">
            <span class="rank">${card.rank}</span>
            <span class="suit">${card.suit}</span>
          </div>
        </div>
        <div class="card-back"><div class="card-back-design"></div></div>
      </div>`;
  }

  return { render };
})();
