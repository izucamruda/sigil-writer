// js/anchors.js
(function (O) {
  // III. Разложение числа на цифры, ноль игнорируется (3.2)
  function numberToDigits(n) {
    return String(n).split('').map(Number).filter(d => d !== 0);
  }

  // Предварительно: для каждой цифры 1..9 — упорядоченный список ячеек,
  // в числах которых эта цифра встречается (раздел 4.2: ячейка считается
  // один раз, даже если цифра внутри числа повторяется).
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
    // сортировка по id (правило 4.3 — первое вхождение по порядку ячеек)
    for (const d in map) map[d].sort((a, b) => a - b);
    return map;
  })();

  // IV. Выбор якорей для последовательности цифр.
  // Возвращает массив id ячеек в порядке цифр числа.
  function digitsToAnchors(digits) {
    const anchors = [];
    for (const d of digits) {
      const cells = DIGIT_TO_CELLS[d] || [];
      // 4.6: одна цифра — первый якорь.
      // 4.3: повторяющаяся цифра — первые N ячеек по порядку.
      // Но здесь важный нюанс: правило 4.3 говорит "пока не наберётся
      // столько якорей, сколько раз цифра встречается в числе слова".
      // Это про случай, когда ОДНА цифра повторяется подряд (222).
      // Реализуем это на уровне группировки ниже.
      anchors.push(cells);
    }
    return anchors; // массив массивов-кандидатов
  }

  // Объединяем: проходим по цифрам, для повторяющихся подряд берём
  // последовательные ячейки (правило 4.4/4.5), для одиночных — первый (4.6).
  function buildAnchorSequence(digits) {
    const result = [];
    let i = 0;
    while (i < digits.length) {
      const d = digits[i];
      let j = i;
      while (j < digits.length && digits[j] === d) j++;
      const run = j - i; // сколько раз цифра повторяется подряд
      const cells = DIGIT_TO_CELLS[d] || [];
      if (cells.length === 0) {
        // цифры нет в матрице — по 3.3 ближайшая, но для 1..9 все есть;
        // на всякий случай пропускаем
        i = j; continue;
      }
      if (run === 1) {
        result.push(cells[0]);           // 4.6
      } else {
        // 4.4 / 4.5: берём первые min(run, cells.length) ячеек,
        // если не хватает — замыкаем на первую (4.5)
        for (let k = 0; k < run; k++) {
          result.push(cells[k % cells.length]);
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