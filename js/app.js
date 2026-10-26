// js/app.js
(function (O) {
  const $ = id => document.getElementById(id);
  const svg = $('sigilSvg');
  const readout = $('readout');
  const wordInput = $('wordInput');
  const greekInput = $('greekInput');

  let current = null;   // метаданные для книги сигилов
  let currentOpts = null;

  O.render.drawMatrix(svg);

  // Мгновенная транслитерация при вводе слова
  wordInput.addEventListener('input', () => {
    greekInput.value = O.transliterateWithDict(wordInput.value);
    updateReadoutPreview();
  });

  greekInput.addEventListener('input', updateReadoutPreview);

  function updateReadoutPreview() {
    const g = greekInput.value.trim();
    if (!g) { readout.textContent = '—'; return; }
    const { sum, unknown } = O.isopsephy(g);
    const digits = O.numberToDigits(sum);
    let txt = `<b>${g}</b>\nСумма: <b>${sum}</b>  ·  Цифры: <b>${digits.join(', ') || '—'}</b>`;
    if (unknown.length) txt += `\nБез числа (вне таблицы): ${unknown.join(', ')}`;
    readout.innerHTML = txt;
  }

  function getOpts() {
    return {
      kipos: $('optKipos').checked,
      perst: $('optPerst').checked,
      rod:   $('optRod').checked,
      spread: $('optSpread').checked,
    };
  }

  function build() {
    const g = greekInput.value.trim();
    if (!g) { readout.textContent = 'Введите слово.'; return; }
    const { sum } = O.isopsephy(g);
    const digits = O.numberToDigits(sum);
    if (!digits.length) { readout.textContent = 'Число без ненулевых цифр.'; return; }

    const opts = getOpts();
    // IV: выбор якорей (с учётом spread)
    const anchors = O.buildAnchorSequence(digits, { spread: opts.spread });
    // VI: отрисовка
    O.render.drawSigil(svg, anchors, opts);

    current = {
      word: wordInput.value.trim() || g,
      greek: g,
      sum,
      digits,
      anchors,
      opts: { kipos: opts.kipos, perst: opts.perst, rod: opts.rod, spread: opts.spread },
    };
    currentOpts = opts;

    const uniqueCount = new Set(anchors).size;
    readout.innerHTML =
      `<b>${g}</b> = <b>${sum}</b>\n` +
      `Цифры: ${digits.join(', ')}\n` +
      `Якоря: ${anchors.join(' → ')}\n` +
      `Уникальных якорей: ${uniqueCount}`;
  }

  function downloadSvg() {
    if (!current) { build(); if (!current) return; }
    const clone = svg.cloneNode(true);
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = [...document.styleSheets]
      .filter(s => s.href && s.href.includes('style.css'))
      .map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n'); } catch { return ''; } })
      .join('\n');
    clone.insertBefore(style, clone.firstChild);
    const data = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sigil-${current.sum}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Книга сигилов
  const STORE = 'orden.sigils.v1';
  const loadBook = () => { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } };
  const saveBook = b => localStorage.setItem(STORE, JSON.stringify(b));

  function renderBook() {
    const list = $('grimoireList');
    const book = loadBook();
    list.innerHTML = '';
    if (!book.length) {
      list.innerHTML = '<div class="empty-note">Пока пусто. Постройте сигил и нажмите «Сохранить в книгу».</div>';
      return;
    }
    book.slice().reverse().forEach((e, idx) => {
      const div = document.createElement('div');
      div.className = 'entry';
      const spreadMark = e.opts && e.opts.spread ? ' · разнесённый' : ' · строгий';
      div.innerHTML = `
        <div>
          <span class="name">${e.word}</span>
          <span class="meta"> · ${e.greek} · ${e.sum} · якоря: ${e.anchors.join('→')}${spreadMark} · ${e.date}</span>
        </div>
        <button data-i="${book.length - 1 - idx}">Удалить</button>`;
      list.appendChild(div);
    });
    list.querySelectorAll('button[data-i]').forEach(b => {
      b.onclick = () => {
        const b2 = loadBook();
        b2.splice(+b.dataset.i, 1);
        saveBook(b2);
        renderBook();
      };
    });
  }

  // Чипы-примеры из раздела IX
  function renderExamples() {
    const host = $('examples');
    if (!host) return;
    const ex = ['Род', 'Егор', 'Шура', 'Демиург', 'Кверти', 'Люцифер'];
    ex.forEach(w => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = w;
      b.onclick = () => {
        wordInput.value = w;
        wordInput.dispatchEvent(new Event('input'));
        build();
      };
      host.appendChild(b);
    });
  }

  $('btnBuild').onclick = build;
  $('btnDownload').onclick = downloadSvg;
  $('btnSave').onclick = () => {
    if (!current) build();
    if (!current) return;
    const book = loadBook();
    book.push({ ...current, date: new Date().toISOString().slice(0, 10) });
    saveBook(book);
    renderBook();
  };

  // Переключение опций (spread/kipos/perst/rod) перерисовывает, если уже есть слово
  ['optSpread', 'optKipos', 'optPerst', 'optRod'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', () => {
      if (greekInput.value.trim()) build();
    });
  });

  renderExamples();
  renderBook();
})(window.ORDEN);
