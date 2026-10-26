// js/render.js
(function (O) {
  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs = {}, parent) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Отрисовка статической матрицы (числа в ячейках) + сетки.
  // Возвращает <g id="matrixLayer">, к которому потом добавим якоря и линию.
  function drawMatrix(svg) {
    const g = el('g', { id: 'matrixLayer', class: 'matrix' }, svg);
    const { size, padding, cell } = O.SVG;

    // Лёгкая рамка поля
    el('rect', {
      x: padding - cell * 0.6,
      y: padding - cell * 0.6,
      width: cell * 3 + cell * 1.2,
      height: cell * 3 + cell * 1.2,
      class: 'matrix-border',
    }, g);

    // Сетка (тонкие линии между центрами)
    for (let i = 0; i < 4; i++) {
      const p = padding + i * cell;
      el('line', { x1: padding, y1: p, x2: padding + 3*cell, y2: p, class: 'grid' }, g);
      el('line', { x1: p, y1: padding, x2: p, y2: padding + 3*cell, class: 'grid' }, g);
    }

    // Числа в ячейках
    O.MATRIX.forEach((row, r) => row.forEach((num, c) => {
      const { x, y } = O.cellCenter(r * 4 + c + 1);
      el('text', {
        x, y: y - 6, 'text-anchor': 'middle', class: 'matrix-num'
      }, g).textContent = num;
      // номер ячейки мелко под числом
      el('text', {
        x, y: y + 20, 'text-anchor': 'middle', class: 'matrix-id'
      }, g).textContent = r * 4 + c + 1;
    }));

    return g;
  }

  // Слой с якорями (точки) и линией сигила.
  function drawSigil(svg, anchors, opts = {}) {
    // удаляем предыдущий слой, если был
    const old = svg.querySelector('#sigilLayer');
    if (old) old.remove();

    const g = el('g', { id: 'sigilLayer' }, svg);
    const pts = anchors.map(id => O.cellCenter(id));

    // Линия сигила
    if (pts.length >= 2) {
      const d = 'M ' + pts.map(p => `${p.x} ${p.y}`).join(' L ');
      el('path', {
        d,
        class: 'sigil-line',
        fill: 'none',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }, g);
    }

    // Якоря-точки
    pts.forEach((p, i) => {
      el('circle', {
        cx: p.x, cy: p.y, r: 10, class: 'anchor',
      }, g);
      // номер порядка в линии
      el('text', {
        x: p.x + 16, y: p.y - 14, class: 'anchor-order'
      }, g).textContent = i + 1;
    });

    // VI. Дополнительные слои
    const cx = O.SVG.size / 2, cy = O.SVG.size / 2;

    if (opts.kipos) { // 6.3 — окружность защиты
      el('circle', {
        cx, cy, r: O.SVG.size / 2 - 20, class: 'kipos',
      }, g);
    }
    if (opts.rod) { // 6.5 — точка средоточия
      el('circle', { cx, cy, r: 6, class: 'rod' }, g);
    }
    if (opts.perst) { // 6.4 — черта основания
      const y = O.SVG.size - 30;
      el('line', { x1: 40, y1: y, x2: O.SVG.size - 40, y2: y, class: 'perst' }, g);
    }

    return g;
  }

  function clearSigil(svg) {
    const old = svg.querySelector('#sigilLayer');
    if (old) old.remove();
  }

  O.render = { drawMatrix, drawSigil, clearSigil };
})(window.ORDEN);