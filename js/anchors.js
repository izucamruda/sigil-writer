// js/anchors.js
// III. Разложение числа на цифры. IV. Выбор якоря для цифры.
(function (O) {
  // III. Разложение числа на цифры, ноль игнорируется (3.2)
  function numberToDigits(n) {
    return String(n).split('').map(Number).filter(d => d !== 0);
  }

  // Для каждой цифры 1..9 — упорядоченный список ячеек,
  // в числах которых эта цифра встречается (4.2: ячейка считается один раз).
  const DIGIT_TO_CELLS = (() => {
    const map = {};
    for (let d = 1; d <= 9; d++) map[d] = [];
    O.MATRIX.forEach((row, r) => {
      row.forEach((num, c) => {
        const id = r * 4 + c + 1; // 1..16
        const digitsInNumber = new Set(String(num).split('').map(Number));
        digitsInNumber.forEach(d => {
          if (d >= 1 && d <= 9) map[d].push(id);
        });
      });
    });
    for (const d in map) map[d].sort((a, b) => a - b);
    return map;
  })();

  // IV. Построение последовательности якорей.
  // opts.spread === true  -> "разнесённые якоря" (вариант C):
  //   для каждой цифры сначала берутся ячейки, ещё не занятые другими цифрами
  //   в этом же сигиле; только если свободных не осталось — берутся занятые.
  // opts.spread === false -> строгий режим по документу (4.3–4.6).
  function buildAnchorSequence(digits, opts = {}) {
    const spread = !!opts.spread;
    const used = new Set();
    const result = [];
    let i = 0;

    while (i < digits.length) {
      const d = digits[i];
      let j = i;
      while (j < digits.length && digits[j] === d) j++;
      const run = j - i; // сколько раз цифра повторяется подряд
      const cells = DIGIT_TO_CELLS[d] || [];
      if (!cells.length) { i = j; continue; }

      // Пул кандидатов: в разнесённом режиме — сначала свободные, потом все
      const pool = spread
        ? [...cells.filter(c => !used.has(c)), ...cells.filter(c => used.has(c))]
        : cells;

      if (run === 1) {
        // 4.6: один раз — первый якорь (в spread-режиме — первый свободный)
        const pick = pool[0];
        result.push(pick);
        used.add(pick);
      } else {
        // 4.4 / 4.5: повтор подряд — берём run якорей; если не хватает,
        // замыкаем на первый (4.5)
        for (let k = 0; k < run; k++) {
          const pick = pool[k % pool.length];
          result.push(pick);
          used.add(pick);
        }
      }
      i = j;
    }
    return result;
  }

  O.numberToDigits = numberToDigits;
  O.DIGIT_TO_CELLS = DIGIT_TO_CELLS;
  O.buildAnchorSequence = buildAnchorSequence;
})(window.ORDEN);
