// js/isopsephy.js
(function (O) {
  // Приведение к нижнему регистру; финальная сигма ς уже учтена в таблице
  function normalizeGreek(word) {
    return word.trim().toLowerCase().replace(/\s+/g, '');
  }

  // Раздел 2.5: сумма чисел букв. Возвращает {sum, letters: [{ch, val}], unknown: []}
  function isopsephy(greekWord) {
    const w = normalizeGreek(greekWord);
    const letters = [];
    const unknown = [];
    let sum = 0;
    for (const ch of w) {
      const v = O.GREEK_TABLE[ch];
      if (v === undefined) {
        unknown.push(ch);
        continue;
      }
      letters.push({ ch, val: v });
      sum += v;
    }
    return { sum, letters, unknown };
  }

  // Черновая транслитерация (кириллица/латиница -> греческий)
  // Раздел 2.4: буквы вне таблицы берутся по ближайшему звуку — здесь это
  // отражено таблицами, а ручная правка остаётся за адептом.
  function transliterate(text) {
    const lower = text.trim().toLowerCase();
    const isCyr = /[а-яё]/.test(lower);
    const isLat = /[a-z]/.test(lower);
    const map = isCyr ? O.TRANSLIT_RU_TO_GR : isLat ? O.TRANSLIT_LAT_TO_GR : null;
    if (!map) return lower; // уже греческий — оставляем как есть
    let out = '';
    for (const ch of lower) {
      if (ch === ' ') { out += ' '; continue; }
      out += (map[ch] !== undefined ? map[ch] : ch);
    }
    return out;
  }

  O.isopsephy = isopsephy;
  O.transliterate = transliterate;
})(window.ORDEN);