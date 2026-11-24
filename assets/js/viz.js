// slmradar charts + tables. Plain SVG, no dependencies. Data: window.SLM (from data/*.yml).
(function () {
  const D = window.SLM || {};
  const M = (D.models || []).slice();
  const NS = 'http://www.w3.org/2000/svg';
  const MAC_USABLE = 36;
  const SHORT = new Set(['nanbeige4.2-3b', 'qwen3.5-9b', 'olmo-3-7b', 'qwen3.6-27b', 'muse-glimmer-30b', 'nanbeige4.3-33b']);

  // ---------- helpers ----------
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const txt = (parent, x, y, s, cls = '', anchor = 'start', extra = {}) => {
    const t = el('text', Object.assign({ x, y, class: cls, 'text-anchor': anchor }, extra), parent);
    t.textContent = s; return t;
  };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const loraGB = m => m.vram_lora || Math.round(m.params_total * 2 + 6);
  const fmtP = m => m.params_total + 'B' + (m.params_active ? ` · ${m.params_active}B active` : '');

  let tip;
  function showTip(e, html) {
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); }
    tip.innerHTML = html; tip.style.opacity = 1;
    const r = tip.getBoundingClientRect();
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14;
    if (y + r.height > innerHeight - 8) y = e.clientY - r.height - 14;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  const hideTip = () => { if (tip) tip.style.opacity = 0; };
  const hover = (node, html) => {
    node.addEventListener('pointermove', e => showTip(e, typeof html === 'function' ? html() : html));
    node.addEventListener('pointerleave', hideTip);
  };
  const modelTip = m => `<b>${esc(m.name)}</b><br><span class="m">${esc(m.publisher)}</span><br>` +
    `${fmtP(m)} · ${esc(m.arch)}<br>QLoRA ≈ ${m.vram_qlora ?? '?'} GB · LoRA bf16 ≈ ${loraGB(m)} GB<br>` +
    `<span class="m">${esc(m.license)} · ${esc(m.released || 'date ?')} · ${esc(m.status)}</span>`;

  function frame(host, title, sub, h) {
    host.innerHTML = '';
    if (title) { const t = document.createElement('p'); t.className = 'viz-title'; t.textContent = title; host.appendChild(t); }
    if (sub) { const s = document.createElement('p'); s.className = 'viz-sub'; s.textContent = sub; host.appendChild(s); }
    const W = Math.max(320, host.clientWidth - 36);
    const svg = el('svg', { viewBox: `0 0 ${W} ${h}`, role: 'img', 'aria-label': title || '' });
    host.appendChild(svg);
    return { svg, W };
  }
  function legend(host, items) {
    const d = document.createElement('div'); d.className = 'legend';
    d.innerHTML = items.map(([c, l]) => `<span><i style="background:${c};${c === 'transparent' ? 'border:1px solid var(--border)' : ''}"></i>${esc(l)}</span>`).join('');
    host.appendChild(d);
  }

  // Place a direct label next to a dot without hitting other dots or labels.
  function placeLabel(svg, cx, cy, s, dots, placed, bounds) {
    const w = s.length * 6.4 + 4, h = 13;
    const cands = [[cx + 9, cy + 4, 'start'], [cx - 9, cy + 4, 'end'], [cx, cy - 11, 'middle'], [cx, cy + 18, 'middle'],
      [cx + 9, cy - 9, 'start'], [cx - 9, cy - 9, 'end'], [cx + 9, cy + 17, 'start'], [cx - 9, cy + 17, 'end']];
    const box = ([x, y, a]) => { const x0 = a === 'start' ? x : a === 'end' ? x - w : x - w / 2; return { x0, x1: x0 + w, y0: y - h + 2, y1: y + 2 }; };
    const hit = b => dots.some(d => !(d.x === cx && d.y === cy) && d.x + 6 > b.x0 && d.x - 6 < b.x1 && d.y + 6 > b.y0 && d.y - 6 < b.y1) ||
      placed.some(q => q.x0 < b.x1 && q.x1 > b.x0 && q.y0 < b.y1 && q.y1 > b.y0) ||
      b.x0 < bounds[0] || b.x1 > bounds[1] || b.y0 < bounds[2] || b.y1 > bounds[3];
    let c = cands.find(c => !hit(box(c))) || cands[0];
    placed.push(box(c));
    txt(svg, c[0], c[1], s, 'label', c[2], { 'pointer-events': 'none' });
  }

  // ---------- 1. size vs. memory scatter ----------
  function fitScatter(host) {
    const H = 420, pad = { l: 44, r: 150, t: 26, b: 40 };
    const { svg, W } = frame(host, 'Model size vs. memory to train (QLoRA)',
      'Each dot is a model. Dashed lines are memory budgets. A dot below a line fits that budget. Hover for details.', H);
    const xMax = 36, yMax = 40;
    const X = v => pad.l + v / xMax * (W - pad.l - pad.r);
    const Y = v => H - pad.b - v / yMax * (H - pad.t - pad.b);
    for (let v = 0; v <= yMax; v += 10) { el('line', { x1: pad.l, x2: W - pad.r, y1: Y(v), y2: Y(v), class: 'gridline' }, svg); txt(svg, pad.l - 8, Y(v) + 4, v + '', 'axis-label', 'end'); }
    for (let v = 0; v <= xMax; v += 6) txt(svg, X(v), H - pad.b + 18, v + 'B', 'axis-label', 'middle');
    txt(svg, (pad.l + W - pad.r) / 2, H - 4, 'Total parameters', 'axis-label', 'middle');
    txt(svg, pad.l - 8, Y(yMax) - 12, 'GB', 'axis-label', 'end');
    [[12, '12 GB · RTX 3060/4070'], [16, '16 GB · 4080/5080'], [24, '24 GB · 3090/4090'], [32, '32 GB · RTX 5090'], [MAC_USABLE, 'Mac 48 GB (~36 usable)']].forEach(([v, l]) => {
      el('line', { x1: pad.l, x2: W - pad.r + 6, y1: Y(v), y2: Y(v), class: 'ref' }, svg);
      txt(svg, W - pad.r + 10, Y(v) + 4, l, 'ref-label');
    });
    const pts = M.filter(m => m.vram_qlora).sort((a, b) => a.params_total - b.params_total);
    const placed = [], dots = pts.map(m => ({ x: X(m.params_total), y: Y(m.vram_qlora) }));
    pts.forEach(m => {
      const cx = X(m.params_total), cy = Y(m.vram_qlora);
      const hit = el('circle', { cx, cy, r: 12, fill: 'transparent' }, svg);
      const dot = el('circle', { cx, cy, r: 5.5, class: 'mark' }, svg);
      hover(hit, () => modelTip(m));
      hit.addEventListener('pointerenter', () => dot.classList.add('hi'));
      hit.addEventListener('pointerleave', () => dot.classList.remove('hi'));
      if (SHORT.has(m.id)) placeLabel(svg, cx, cy, m.name, dots, placed, [pad.l, W - pad.r, pad.t, H - pad.b]);
    });
  }

  // ---------- 2. fit matrix (heatmap) ----------
  const TIERS = [['12 GB', 12], ['16 GB', 16], ['24 GB', 24], ['32 GB', 32], ['Mac 48 GB', MAC_USABLE], ['L40S 48 GB', 46], ['H100 80 GB', 78]];
  function level(m, b) {
    if (loraGB(m) <= b) return 3;
    if (m.vram_qlora && m.vram_qlora <= b * .85) return 2;
    if (m.vram_qlora && m.vram_qlora <= b) return 1;
    return 0;
  }
  const LV = [['', 'Doesn’t fit'], ['tight', 'QLoRA, tight'], ['QLoRA', 'QLoRA'], ['LoRA', 'LoRA bf16']];
  function fitMatrix(host) {
    const rows = M.slice().sort((a, b) => a.params_total - b.params_total);
    const rh = 26, top = 34, H = top + rows.length * rh + 4;
    const { svg, W } = frame(host, 'What you can train where',
      'Best adapter method per model and memory budget. Mac uses ~36 GB of the 48 GB unified memory.', H);
    const left = Math.min(200, W * .32), cw = (W - left) / TIERS.length;
    const fills = ['transparent', 'var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)'];
    TIERS.forEach(([l], i) => txt(svg, left + cw * i + cw / 2, 18, l, 'axis-label', 'middle'));
    rows.forEach((m, r) => {
      const y = top + r * rh;
      txt(svg, left - 10, y + rh / 2 + 4, m.name, '', 'end');
      TIERS.forEach(([l, b], i) => {
        const v = level(m, b), x = left + cw * i;
        const rect = el('rect', { x: x + 1, y: y + 1, width: cw - 2, height: rh - 2, rx: 4, fill: fills[v], stroke: v ? 'none' : 'var(--grid)' }, svg);
        txt(svg, x + cw / 2, y + rh / 2 + 4, v ? LV[v][0] : '—', 'cell-text' + (v === 3 ? ' on-dark' : ''), 'middle', { 'pointer-events': 'none' });
        hover(rect, `<b>${esc(m.name)}</b> on ${l}<br>${LV[v][1]}<br><span class="m">QLoRA ≈ ${m.vram_qlora} GB · LoRA ≈ ${loraGB(m)} GB</span>`);
      });
    });
    legend(host, [['transparent', 'Doesn’t fit'], ['var(--seq-1)', 'QLoRA, tight'], ['var(--seq-2)', 'QLoRA'], ['var(--seq-3)', 'LoRA bf16']]);
  }

  // ---------- 3. release timeline (dot plot) ----------
  function timeline(host) {
    const rows = M.filter(m => m.released).sort((a, b) => String(a.released).localeCompare(String(b.released)));
    const toN = s => { const [y, mo] = String(s).split('-').map(Number); return y * 12 + (mo - 1); };
    const lo = toN(rows[0].released) - 1, hi = toN('2026-12');
    const rh = 24, top = 10, H = top + rows.length * rh + 34;
    const { svg, W } = frame(host, 'Release timeline', 'When each catalog model came out (month).', H);
    const left = Math.min(200, W * .32), right = 16;
    const X = n => left + (n - lo) / (hi - lo) * (W - left - right);
    for (let n = lo + 1; n <= hi; n++) {
      if ((n % 12) % 3 !== 0) continue;
      el('line', { x1: X(n), x2: X(n), y1: top, y2: H - 30, class: 'gridline' }, svg);
      const y = Math.floor(n / 12), mo = n % 12 + 1;
      txt(svg, X(n), H - 12, `${y}-${String(mo).padStart(2, '0')}`, 'axis-label', 'middle');
    }
    rows.forEach((m, r) => {
      const y = top + r * rh + rh / 2;
      txt(svg, left - 10, y + 4, m.name, '', 'end');
      el('line', { x1: left, x2: X(toN(m.released)), y1: y, y2: y, class: 'gridline' }, svg);
      const hit = el('circle', { cx: X(toN(m.released)), cy: y, r: 11, fill: 'transparent' }, svg);
      el('circle', { cx: X(toN(m.released)), cy: y, r: 5, class: 'mark', 'pointer-events': 'none' }, svg);
      hover(hit, () => modelTip(m));
    });
  }

  // ---------- 4. effort vs payoff (methods) ----------
  function quadrant(host) {
    const pts = D.methods || [];
    const H = 430, pad = { l: 46, r: 24, t: 14, b: 44 };
    const { svg, W } = frame(host, 'Effort vs. payoff',
      'Editorial estimate for a solo tinkerer on local hardware. Top-left = start here.', H);
    const X = v => pad.l + (v - .5) / 5 * (W - pad.l - pad.r);
    const Y = v => H - pad.b - (v - 1) / 4.2 * (H - pad.t - pad.b);
    el('rect', { x: X(.5), y: Y(5.2), width: X(3) - X(.5), height: Y(3.4) - Y(5.2), fill: 'var(--seq-1)', opacity: .45, rx: 8 }, svg);
    txt(svg, X(.6), Y(5.2) + 16, 'Start here', 'label');
    for (let v = 1; v <= 5; v++) {
      if (v > 1) el('line', { x1: pad.l, x2: W - pad.r, y1: Y(v), y2: Y(v), class: 'gridline' }, svg);
      el('line', { x1: X(v), x2: X(v), y1: pad.t, y2: H - pad.b, class: 'gridline' }, svg);
    }
    txt(svg, (pad.l + W - pad.r) / 2, H - 10, 'Effort →', 'axis-label', 'middle');
    txt(svg, 14, (pad.t + H - pad.b) / 2, 'Payoff →', 'axis-label', 'middle', { transform: `rotate(-90 14 ${(pad.t + H - pad.b) / 2})` });
    const placed = [], dots = pts.map(p => ({ x: X(p.effort), y: Y(p.payoff) }));
    pts.forEach(p => {
      const cx = X(p.effort), cy = Y(p.payoff);
      const hit = el('circle', { cx, cy, r: 13, fill: 'transparent' }, svg);
      el('circle', { cx, cy, r: 6, class: 'mark', 'pointer-events': 'none' }, svg);
      hover(hit, `<b>${esc(p.name)}</b><br>${esc(p.what)}<br><span class="m">effort ${p.effort}/5 · payoff ${p.payoff}/5${p.local ? ' · runs on the Mac' : ''}</span>`);
      placeLabel(svg, cx, cy, p.name, dots, placed, [pad.l, W - pad.r, pad.t, H - pad.b]);
    });
  }

  // ---------- 5. memory budgets (bars) ----------
  function budgets(host) {
    const rows = D.hardware || [];
    const rh = 34, top = 6, H = top + rows.length * rh + 26;
    const { svg, W } = frame(host, 'Memory per device', 'GB available to the model. The Mac bar shows usable (solid) vs. total unified memory.', H);
    const left = Math.min(190, W * .34), right = 54, max = Math.max(...rows.map(r => r.gb));
    const X = v => left + v / max * (W - left - right);
    [0, 40, 80, 120].filter(v => v <= max).forEach(v => { el('line', { x1: X(v), x2: X(v), y1: top, y2: H - 22, class: 'gridline' }, svg); txt(svg, X(v), H - 6, v + ' GB', 'axis-label', 'middle'); });
    rows.forEach((r, i) => {
      const y = top + i * rh + 7, bh = rh - 14;
      txt(svg, left - 10, y + bh / 2 + 4, r.name, '', 'end');
      if (r.usable) el('rect', { x: left, y, width: X(r.gb) - left, height: bh, rx: 4, fill: 'var(--seq-1)' }, svg);
      const bar = el('rect', { x: left, y, width: X(r.usable || r.gb) - left, height: bh, rx: 4, class: 'bar' }, svg);
      txt(svg, X(r.gb) + 6, y + bh / 2 + 4, r.usable ? `${r.usable}/${r.gb}` : r.gb + '', 'label');
      hover(bar, `<b>${esc(r.name)}</b><br>${r.gb} GB${r.usable ? ` (≈${r.usable} usable)` : ''}<br><span class="m">${esc(r.kind)}</span>`);
    });
  }

  // ---------- 6. stat tiles ----------
  function stats(host) {
    const n = M.length, ver = M.filter(m => m.status === 'verified').length;
    const perm = M.filter(m => /^(Apache|MIT)/.test(m.license)).length;
    const mac = M.filter(m => m.vram_qlora && m.vram_qlora <= 20).length;
    host.className = 'cards';
    host.innerHTML = [[n, 'models tracked', '3B–35B, open weights'], [ver, 'verified', 'license + size checked at source'],
      [perm, 'Apache / MIT', 'permissive, commercial use OK'], [mac, 'train well on the Mac', 'QLoRA ≤ 20 GB']]
      .map(([v, k, d]) => `<div class="card stat"><div class="v">${v}</div><div class="k">${k}</div><div class="d">${d}</div></div>`).join('');
  }

  // ---------- 7. catalog table ----------
  function catalog(host) {
    const cols = [
      ['name', 'Model'], ['params_total', 'Params', 'num'], ['arch', 'Arch'], ['modalities', 'Input'], ['context', 'Context'],
      ['license', 'License'], ['released', 'Released'], ['mac', 'Mac 48 GB'], ['vram_qlora', 'QLoRA GB', 'num'], ['lora', 'LoRA GB', 'num'], ['status', 'Status']];
    const macFit = m => !m.vram_qlora ? 0 : m.vram_qlora <= 14 ? 3 : m.vram_qlora <= 20 ? 2 : m.vram_qlora <= 34 ? 1 : 0;
    const MAC = ['—', 'infer / slow', 'train', 'train, fast'];
    let sortKey = 'params_total', dir = 1, q = '', arch = 'all', macOnly = false;
    host.className = '';
    const archs = ['all', ...new Set(M.map(m => m.arch))];
    host.innerHTML = `<div class="toolbar"><input type="search" placeholder="Filter: name, publisher, tag…" aria-label="Filter models">
      ${archs.map(a => `<button class="chip" data-arch="${a}" aria-pressed="${a === 'all'}">${a}</button>`).join('')}
      <button class="chip" data-mac aria-pressed="false">trains on Mac</button><span class="count"></span></div>
      <div class="table-wrap"><table><thead><tr>${cols.map(([k, l, c]) => `<th class="sortable ${c || ''}" data-k="${k}">${l}</th>`).join('')}</tr></thead><tbody></tbody></table></div>`;
    const tb = host.querySelector('tbody');
    const val = (m, k) => k === 'mac' ? macFit(m) : k === 'lora' ? loraGB(m) : m[k];
    function render() {
      const rows = M.filter(m => (arch === 'all' || m.arch === arch) && (!macOnly || macFit(m) >= 2) &&
        (!q || [m.name, m.publisher, m.license, (m.tags || []).join(' '), m.notes].join(' ').toLowerCase().includes(q)))
        .sort((a, b) => { const x = val(a, sortKey), y = val(b, sortKey); return (x > y ? 1 : x < y ? -1 : 0) * dir; });
      tb.innerHTML = rows.map(m => `<tr>
        <td><a class="model-name" href="${esc(m.hf)}">${esc(m.name)}</a>${m.base ? ` · <a href="${esc(m.base)}">base</a>` : ''}<span class="model-sub">${esc(m.publisher)}</span></td>
        <td class="num">${m.params_total}B${m.params_active ? `<span class="model-sub">${m.params_active}B act.</span>` : ''}</td>
        <td>${esc(m.arch)}</td><td>${esc(m.modalities)}</td><td>${esc(m.context || '?')}</td><td>${esc(m.license.replace(' (confirm on card)', '*'))}</td><td>${esc(m.released || '?')}</td>
        <td><span class="badge ${macFit(m) >= 2 ? 'good' : macFit(m) === 1 ? 'warn' : ''}"><span class="dot"></span>${MAC[macFit(m)]}</span></td>
        <td class="num">${m.vram_qlora ?? '—'}</td><td class="num">${loraGB(m)}</td>
        <td><span class="badge ${m.status === 'verified' ? 'good' : 'warn'}"><span class="dot"></span>${esc(m.status)}</span></td></tr>`).join('');
      host.querySelector('.count').textContent = `${rows.length} of ${M.length}`;
      host.querySelectorAll('th').forEach(th => th.dataset.dir = th.dataset.k === sortKey ? (dir > 0 ? 'asc' : 'desc') : '');
    }
    host.querySelector('input').addEventListener('input', e => { q = e.target.value.toLowerCase().trim(); render(); });
    host.querySelectorAll('[data-arch]').forEach(b => b.addEventListener('click', () => {
      arch = b.dataset.arch; host.querySelectorAll('[data-arch]').forEach(x => x.setAttribute('aria-pressed', x === b)); render(); }));
    host.querySelector('[data-mac]').addEventListener('click', e => { macOnly = !macOnly; e.target.setAttribute('aria-pressed', macOnly); render(); });
    host.querySelectorAll('th').forEach(th => th.addEventListener('click', () => {
      if (sortKey === th.dataset.k) dir = -dir; else { sortKey = th.dataset.k; dir = 1; } render(); }));
    render();
  }

  // ---------- 8. watchlist + notes ----------
  function listTable(host, rows, cols) {
    host.className = 'table-wrap plain';
    host.innerHTML = `<table><thead><tr>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead><tbody>${
      rows.map(r => `<tr>${cols.map(c => `<td>${esc(r[c[0]])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    host.querySelector('table').style.minWidth = '0';
  }
  function notes(host) {
    host.className = 'cards';
    host.innerHTML = M.filter(m => m.notes).map(m => `<a class="card" href="${esc(m.hf)}"><div class="k">${esc(m.publisher)}</div><div class="v">${esc(m.name)}</div><div class="d">${esc(m.notes)}</div></a>`).join('');
  }

  const R = {
    'fit-scatter': fitScatter, 'fit-matrix': fitMatrix, timeline, quadrant, budgets, stats, catalog, notes,
    'watch-unverified': h => listTable(h, (D.watchlist || {}).unverified || [], [['name', 'Model / claim'], ['reason', 'Why it’s here'], ['checked', 'Checked']]),
    'watch-license': h => listTable(h, (D.watchlist || {}).license_caution || [], [['family', 'Family'], ['license', 'License'], ['note', 'Note']])
  };
  const STATIC = new Set(['stats', 'catalog', 'notes', 'watch-unverified', 'watch-license']);
  function renderAll(resizeOnly) {
    document.querySelectorAll('[data-viz]').forEach(h => {
      const k = h.dataset.viz;
      if (resizeOnly && STATIC.has(k)) return;
      if (!STATIC.has(k)) h.classList.add('viz');
      try { R[k] && R[k](h); } catch (e) { console.warn('viz', k, e); }
    });
  }

  function init() {
    renderAll(false);
    let w = innerWidth, t;
    addEventListener('resize', () => { if (innerWidth === w) return; w = innerWidth; clearTimeout(t); t = setTimeout(() => renderAll(true), 150); });
    const tt = document.querySelector('.theme-toggle');
    tt && tt.addEventListener('click', () => {
      const dark = getComputedStyle(document.documentElement).colorScheme.includes('dark');
      const next = dark ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('slm-theme', next); } catch (e) {}
    });
    const LOOKS = ['solid', 'glass', 'pure'], lt = document.querySelector('.look-toggle');
    if (lt) {
      const cur = () => document.documentElement.dataset.look || 'solid';
      lt.textContent = cur();
      lt.addEventListener('click', () => {
        const next = LOOKS[(LOOKS.indexOf(cur()) + 1) % LOOKS.length];
        if (next === 'solid') delete document.documentElement.dataset.look; else document.documentElement.dataset.look = next;
        lt.textContent = next;
        try { localStorage.setItem('slm-look', next); } catch (e) {}
      });
    }
    const rr = document.querySelector('.reroll');
    rr && rr.addEventListener('click', () => document.dispatchEvent(new Event('slm-reroll')));
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
