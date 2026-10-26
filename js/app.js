// js/app.js
(function (O) {
  const $ = id => document.getElementById(id);
  const svg = $('sigilSvg');
  const readout = $('readout');
  const wordInput = $('wordInput');
  const greekInput = $('greekInput');

  let current = null; // {word, greek, sum, digits, anchors, opts}

  // Инициализация матрицы
  O.render.drawMatrix(svg);

  // Мгновенная транслитерация при вводе слова
  wordInput.addEventListener('input', () => {
    const g = O.transliterate(wordInput.value);
    greekInput.value = g;
    updateReadoutPreview();
  });

  greekInput.addEventListener('input', updateReadoutPreview);

  function updateReadoutPreview() {
    const g = greekInput.value.trim();
    if (!g) { readout.textContent = '—'; return; }
    const { sum, letters, unknown } = O.isopsephy(g);
    const digits = O.numberToDigits(sum);
    let txt = `<b>${g}</b>\nСумма: <b>${sum}</b>  ·  Цифры: <b>${digits.join(', ') || '—'}</b>`;
    if (unknown.length) txt += `\nБез числа (вне таблицы): ${unknown.join(', ')}`;
    readout.innerHTML = txt;
  }

  function getOpts() {
    return { kipos: $('optKipos').checked, perst: $('optPerst').checked, rod: $('optRod').checked };
  }

  function build() {
    const g = greekInput.value.trim();
    if (!g) { readout.textContent = 'Введите слово.'; return; }
    const { sum } = O.isopsephy(g);
    const digits = O.numberToDigits(sum);
    if (digits.length === 0) { readout.textContent = 'Число без ненулевых цифр.'; return; }
    const anchors = O.buildAnchorSequence(digits);
    const opts = getOpts();
    O.render.drawSigil(svg, anchors, opts);

    current = { word: wordInput.value.trim() || g, greek: g, sum, digits, anchors, opts };
    readout.innerHTML =
      `<b>${g}</b> = <b>${sum}</b>\nЦифры: ${digits.join(', ')}\nЯкоря: ${anchors.join(' → ')}`;
  }

  function downloadSvg() {
    if (!current) { build(); if (!current) return; }
    const clone = svg.cloneNode(true);
    // чтобы стили попали в файл — вставляем <style> внутрь SVG
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

  // Книга сигилов (localStorage)
  const STORE = 'orden.sigils.v1';
  function loadBook() { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } }
  function saveBook(b) { localStorage.setItem(STORE, JSON.stringify(b)); }

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
      div.innerHTML = `
        <div>
          <span class="name">${e.word}</span>
          <span class="meta"> · ${e.greek} · ${e.sum} · якоря: ${e.anchors.join('→')} · ${e.date}</span>
        </div>
        <button data-i="${book.length - 1 - idx}">Удалить</button>`;
      list.appendChild(div);
    });
    list.querySelectorAll('button[data-i]').forEach(b => {
      b.onclick = () => {
        const book2 = loadBook();
        book2.splice(+b.dataset.i, 1);
        saveBook(book2);
        renderBook();
      };
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

  renderBook();
})(window.ORDEN);