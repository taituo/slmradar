// slmradar technique diagrams. Inline SVG themed via CSS variables.
// Convention in every diagram: gray = frozen, blue = trained/changed.
// Usage in Markdown: <div data-diagram="lora"></div>
(function () {
  const R = (x, y, w, h, cls = 'b', rx = 6, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}" ${extra}/>`;
  const T = (x, y, s, cls = 't', a = 'middle') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${a}">${s}</text>`;
  const L = (x1, y1, x2, y2, cls = 'ln') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  function A(x1, y1, x2, y2, cls = 'ln') { // line with arrowhead
    const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
    const p1 = [x2 - s * Math.cos(a - .45), y2 - s * Math.sin(a - .45)], p2 = [x2 - s * Math.cos(a + .45), y2 - s * Math.sin(a + .45)];
    const head = cls.includes('la') ? 'ah-a' : 'ah';
    return L(x1, y1, x2 - Math.cos(a) * 2, y2 - Math.sin(a) * 2, cls) + `<polygon points="${x2},${y2} ${p1} ${p2}" class="${head}"/>`;
  }
  const grid = (x, y, w, h, step) => { let s = ''; for (let i = step; i < w; i += step) s += L(x + i, y, x + i, y + h, 'g'); for (let j = step; j < h; j += step) s += L(x, y + j, x + w, y + j, 'g'); return s; };
  const dot = (x, y, cls = 'dt', r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;

  const D = {

    train: {
      title: 'Training in one picture',
      cap: 'Forward pass: the model predicts the next token. The loss measures how wrong it was. The backward pass turns the loss into gradients, and the optimizer nudges the trainable weights. Every method on this page changes what is trainable, or what the loss rewards.',
      svg: () => T(40, 82, 'input', 'tb') + A(70, 78, 108, 78) + R(110, 50, 150, 60, 'f', 10) + T(185, 84, 'model', 'tw') +
        A(260, 78, 298, 78) + R(300, 58, 80, 40, 'b') + T(340, 82, 'prediction', 'tb') +
        R(300, 150, 80, 40, 'b') + T(340, 174, 'target', 'tb') + L(380, 78, 420, 120, 'ln') + L(380, 170, 420, 128, 'ln') +
        `<circle cx="440" cy="124" r="22" class="b"/>` + T(440, 129, 'loss', 'tb') +
        `<path d="M440,148 C440,225 185,225 185,114" class="la flow" fill="none"/>` + `<polygon points="185,112 180,122 190,122" class="ah-a"/>` +
        T(312, 232, 'backward: gradients → optimizer step', 't')
    },
    anatomy: {
      title: 'Inside a transformer block: where adapters attach',
      cap: 'Each block reads from the residual stream, runs attention and then an MLP, and adds its result back. LoRA usually targets the attention projections (q, k, v, o) and often the MLP (gate, up, down). More targets means more capacity and more memory.',
      svg: () => {
        let s = A(15, 200, 508, 200, 'ln thick') + T(505, 218, 'residual stream →', 't', 'end');
        const grp = (x, w, name, subs) => {
          let g = R(x, 30, w, 110, 'b', 10) + T(x + w / 2, 50, name, 'tb');
          const sw = (w - 20 - (subs.length - 1) * 8) / subs.length;
          subs.forEach((n, i) => { const sx = x + 10 + i * (sw + 8); g += R(sx, 66, sw, 34, 'b2', 5) + T(sx + sw / 2, 88, n, 'tb') + R(sx, 106, sw, 8, 'f', 3); });
          return g + A(x + 20, 200, x + 20, 142, 'ln') + A(x + w - 20, 142, x + w - 20, 196, 'ln') + T(x + w - 20, 165, '⊕', 'op', 'middle');
        };
        return s + grp(30, 220, 'attention', ['q', 'k', 'v', 'o']) + grp(285, 200, 'MLP', ['gate', 'up', 'down']) +
          R(30, 222, 12, 8, 'f', 2) + T(48, 230, 'LoRA adapter on that projection', 't', 'start');
      }
    },
    peft: {
      title: 'Which parts train: full vs. PEFT',
      cap: 'Every PEFT method freezes the big weights and trains something small next to them: low-rank matrices (LoRA), a small inserted layer (adapters), scaling vectors (IA³) or only the biases (BitFit). Full fine-tuning trains everything.',
      svg: () => {
        const col = (x, label, sub, extra, full) => R(x, 50, 80, 80, full ? 'f' : 'b', 6) + T(x + 40, 95, 'W', full ? 'tw' : 'tb') + extra + T(x + 40, 205, label, 'tb') + T(x + 40, 222, sub, 't');
        return col(10, 'Full FT', '100%', '', true) +
          col(112, 'LoRA', '~0.1–1%', R(196, 50, 7, 80, 'f', 2) + R(112, 136, 80, 7, 'f', 2), false) +
          col(214, 'Adapter', '~1–3%', A(254, 130, 254, 150) + R(229, 152, 50, 22, 'f', 5), false) +
          col(316, 'IA³', '~0.01%', [0, 1, 2, 3, 4, 5].map(i => dot(322 + i * 14, 142, 'dt', 4)).join(''), false) +
          col(418, 'BitFit', '~0.1%', R(418, 138, 80, 8, 'f', 3) + T(458, 160, '+ b', 't'), false);
      }
    },
    dora: {
      title: 'DoRA: magnitude and direction',
      cap: 'DoRA splits each weight column into a length (magnitude) and a direction. LoRA updates only the direction, and the magnitude gets its own small trainable vector. It often matches full fine-tuning more closely than plain LoRA at the same rank.',
      svg: () => T(30, 126, 'W′ =', 'tb', 'start') +
        [0, 1, 2, 3, 4, 5, 6, 7].map(i => R(80 + i * 14, 60 + (i * 37 % 40), 10, 80 - (i * 37 % 40), 'f', 2)).join('') + T(136, 165, 'm · magnitude', 't') + T(136, 182, '(trainable)', 't') +
        T(208, 118, '⊙', 'op') +
        R(230, 50, 110, 100, 'b') + grid(230, 50, 110, 100, 14) + T(285, 165, 'V + BA', 'tb') + T(285, 182, 'direction (LoRA)', 't') +
        R(345, 50, 7, 100, 'f', 2) + R(230, 154, 110, 0, 'f') +
        T(380, 104, '÷ ‖V + BA‖', 'tb', 'start') + T(380, 124, 'normalize each column', 't', 'start')
    },
    quant: {
      title: 'Quantization: 16 bits → 4 bits',
      cap: 'Weights are split into small groups (say 32–64 values). Each group stores one scale plus 4-bit integers (16 levels). That makes it roughly 4× smaller with a small quality loss. QLoRA trains on top of this, and MLX and llama.cpp run it directly.',
      svg: () => {
        const v = [.62, .35, .8, .15, .52, .9, .44, .27, .71, .58, .2, .84, .39, .66, .48, .12];
        let s = T(130, 24, 'bf16 · 16 bits each', 'tb') + T(390, 24, '4-bit + scale per group', 'tb');
        v.forEach((x, i) => { s += R(20 + i * 14, 150 - x * 100, 10, x * 100, 'b2', 2); });
        s += A(250, 100, 275, 100);
        v.forEach((x, i) => { const q = Math.round(x * 15) / 15; s += R(285 + i * 14, 150 - q * 100, 10, q * 100, 'f', 2); });
        for (let l = 0; l <= 15; l += 3) s += L(282, 150 - l / 15 * 100, 507, 150 - l / 15 * 100, 'g');
        return s + R(285, 160, 108, 18, 'f2', 4) + T(339, 173, 'group 1 · scale s₁', 't') + R(397, 160, 108, 18, 'f2', 4) + T(451, 173, 'group 2 · scale s₂', 't') +
          T(260, 220, 'stored: 4-bit integers + one scale per group ≈ 4.5 bits / weight', 't');
      }
    },
    checkpoint: {
      title: 'Gradient checkpointing: trade compute for memory',
      cap: 'The backward pass needs every layer\'s activations. Normally they are all kept in memory. With checkpointing only every few layers are stored, and the rest are recomputed during the backward pass. That cuts memory a lot, at roughly 20–30% more compute.',
      svg: () => {
        let s = T(18, 70, 'normal', 'tb', 'start') + T(18, 170, 'checkpointed', 'tb', 'start');
        for (let i = 0; i < 8; i++) {
          const x = 120 + i * 48;
          s += R(x, 40, 40, 22, 'b', 4) + T(x + 20, 56, 'L' + (i + 1), 'tb') + R(x + 6, 68, 28, 34, 'f2', 3);
          s += R(x, 140, 40, 22, 'b', 4) + T(x + 20, 156, 'L' + (i + 1), 'tb') + (i % 3 === 0 ? R(x + 6, 168, 28, 34, 'f2', 3) : R(x + 6, 168, 28, 34, 'b ghost', 3));
        }
        return s + T(300, 225, 'solid = stored activations · dashed = recomputed on the way back', 't');
      }
    },
    sft: {
      title: 'SFT data: only the answer is graded',
      cap: 'Training examples are whole conversations rendered with the model\'s chat template. The loss is usually masked so that only the assistant tokens count. The model learns to answer, not to repeat the prompt. A wrong chat template is the most common silent bug.',
      svg: () => {
        const toks = [['<sys>', 0], ['You', 0], ['are…', 0], ['<user>', 0], ['Fix', 0], ['this', 0], ['bug', 0], ['<asst>', 0], ['The', 1], ['issue', 1], ['is…', 1], ['<end>', 1]];
        const e = t => t.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        let s = '', x = 14;
        toks.forEach(([t, on]) => { const w = t.length * 6.2 + 12; s += R(x, 80, w, 32, on ? 'f' : 'b', 6) + T(x + w / 2, 100, e(t), on ? 'tw' : 'tb'); x += w + 3; });
        return s + L(14, 130, 300, 130, 'ln') + T(160, 150, 'masked · no loss', 't') + L(318, 130, 506, 130, 'la') + T(412, 150, 'loss on these tokens', 'tb') +
          T(260, 50, 'one training example, after the chat template', 't') + T(260, 210, 'format: {"messages": [{"role": "user", …}, {"role": "assistant", …}]}', 't');
      }
    },
    ties: {
      title: 'TIES / DARE: merge without interference',
      cap: 'Naively adding task vectors lets their signs cancel each other out. TIES trims small changes, elects one sign per parameter by majority, then averages only the values that agree. DARE randomly drops changes and rescales the rest before merging.',
      svg: () => {
        const rows = [[.8, -.2, .6, .1, -.7, .05, .5, -.3], [.6, .3, -.4, -.05, -.6, .4, .1, -.5], [-.1, -.4, .7, .5, -.5, .02, .6, .2]];
        const res = [.7, -.35, .65, .5, -.6, .4, .55, -.4];
        const cell = (x, y, v, cls) => v >= 0 ? R(x, y - v * 26, 16, Math.max(1, v * 26), cls, 2) : R(x, y, 16, -v * 26, cls, 2);
        let s = '';
        rows.forEach((r, j) => { const y = 42 + j * 56; s += T(20, y + 4, 'τ' + (j + 1), 'tb', 'start') + L(50, y, 250, y, 'g');
          r.forEach((v, i) => { s += cell(56 + i * 24, y, v, Math.abs(v) < .25 ? 'b ghost' : 'b2'); }); });
        s += A(262, 98, 300, 98, 'la') + T(281, 122, 'trim + elect sign', 't');
        const y = 98; s += L(310, y, 510, y, 'g'); res.forEach((v, i) => { s += cell(316 + i * 24, y, v, 'f'); });
        return s + T(410, 150, 'merged', 'tb') + T(150, 226, 'dashed = trimmed (too small)', 't') + T(410, 226, 'one sign per parameter', 't');
      }
    },
    rag: {
      title: 'RAG or fine-tune?',
      cap: 'RAG puts facts into the prompt at question time. It is easy to update and you can show sources. Fine-tuning changes how the model behaves: format, style, tool use, skills. Use RAG for knowledge that changes, fine-tuning for behavior, and often both.',
      svg: () => T(18, 50, 'RAG', 'tb', 'start') + T(70, 50, 'question', 't', 'start') + A(126, 46, 156, 46) +
        R(158, 28, 80, 36, 'b') + T(198, 51, 'retriever', 'tb') + A(238, 46, 266, 46) + R(268, 28, 66, 36, 'b2') + T(301, 51, 'docs', 'tb') +
        A(334, 46, 362, 46) + R(364, 28, 70, 36, 'b') + T(399, 51, 'model', 'tb') + A(434, 46, 462, 46) + T(466, 50, 'answer', 't', 'start') +
        T(18, 150, 'Fine-tune', 'tb', 'start') + T(100, 150, 'question', 't', 'start') + A(156, 146, 254, 146) +
        R(256, 124, 110, 44, 'f', 8) + T(311, 151, 'model + LoRA', 'tw') + A(366, 146, 462, 146) + T(466, 150, 'answer', 't', 'start') +
        T(260, 92, 'facts that change → retrieve them', 't') + T(260, 200, 'behavior, format, skills → train them', 't')
    },
    multilora: {
      title: 'Multi-LoRA serving: one base, many adapters',
      cap: 'Load the base model once and keep many small adapters next to it. Each request names its adapter and the server applies it on the fly (vLLM and SGLang both do this). That is how a fleet of specialists stays cheap.',
      svg: () => {
        let s = R(170, 70, 180, 100, 'b', 12) + T(260, 115, 'base model', 'tb') + T(260, 134, 'loaded once', 't');
        ['sql', 'tests', 'style', 'tools'].forEach((n, i) => { s += R(368, 40 + i * 42, 70, 30, 'f', 6) + T(403, 60 + i * 42, n, 'tw') + L(350, 120, 368, 55 + i * 42, 'ln faint'); });
        ['req · sql', 'req · tests', 'req · tools'].forEach((n, i) => { s += R(14, 60 + i * 44, 100, 28, 'b2', 6) + T(64, 78 + i * 44, n, 'tb') + A(114, 74 + i * 44, 168, 120, 'ln'); });
        return s + T(260, 215, 'adapters: a few MB each · hot-swapped per request', 't');
      }
    },
    prefixcache: {
      title: 'Prefix cache: don\'t recompute the shared start',
      cap: 'Agent calls often start with the same system prompt and tool definitions. A prefix cache (SGLang\'s radix tree, or vLLM\'s prefix caching) keeps the KV cache for that shared start and only computes the new tokens.',
      svg: () => R(20, 95, 150, 40, 'f', 8) + T(95, 113, 'system + tools', 'tw') + T(95, 127, 'cached once', 'tw2') +
        L(170, 115, 220, 55, 'la') + L(170, 115, 220, 115, 'la') + L(170, 115, 220, 175, 'la') +
        [['task A', 55], ['task B', 115], ['task C', 175]].map(([n, y]) => R(222, y - 18, 90, 36, 'b2', 6) + T(267, y + 5, n, 'tb') + L(312, y, 340, y, 'ln') + R(342, y - 14, 70, 28, 'b', 6) + T(377, y + 5, 'new', 't')).join('') +
        T(470, 105, 'blue = reused', 't') + T(470, 125, 'gray = computed', 't')
    },
    unified: {
      title: 'Unified memory vs. a discrete GPU',
      cap: 'On the Mac, CPU and GPU share one pool of memory, so a 30B model in 4-bit simply fits, with no copying. An NVIDIA card has its own fast VRAM (12–32 GB on consumer cards), and the model must fit there. Spilling over PCIe to system RAM is painfully slow.',
      svg: () => T(130, 26, 'MacBook M5 Pro', 'tb') + R(20, 40, 220, 120, 'b2', 12) + T(130, 64, 'unified memory · 48 GB', 'tb') +
        R(36, 80, 80, 60, 'b', 8) + T(76, 114, 'CPU', 'tb') + R(144, 80, 80, 60, 'f', 8) + T(184, 114, 'GPU', 'tw') + T(130, 182, 'GPU can use ~36 GB of it', 't') +
        T(390, 26, 'PC + NVIDIA', 'tb') + R(280, 40, 100, 120, 'b2', 12) + T(330, 64, 'system RAM', 'tb') + R(295, 80, 70, 60, 'b', 8) + T(330, 114, 'CPU', 'tb') +
        L(380, 100, 410, 100, 'ln dash') + T(395, 92, 'PCIe', 't') +
        R(410, 40, 100, 120, 'f', 12) + T(460, 94, 'VRAM', 'tw') + T(460, 112, '12–32 GB', 'tw2') + T(395, 182, 'model must fit in VRAM', 't')
    },
    wsp: {
      title: 'Weight-space programming loop',
      cap: 'A strong model acts as the engineer: it inspects the small model\'s tensors through tools, forms a hypothesis, writes a patch, runs the probes, and keeps or reverts the change. Every step is versioned. This is an early research direction; see Research.',
      svg: () => {
        const cx = 300, cy = 120, r = 88, steps = ['inspect', 'hypothesize', 'patch', 'probe', 'keep / revert'];
        let s = R(14, 85, 120, 70, 'b', 10) + T(74, 116, 'small model', 'tb') + T(74, 134, 'weights v1, v2…', 't') + L(134, 120, cx - r - 30, 120, 'ln dash');
        s += `<circle cx="${cx}" cy="${cy}" r="${r}" class="la flow" fill="none"/>`;
        steps.forEach((n, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a), w = n.length * 7 + 16;
          s += R(x - w / 2, y - 14, w, 28, i === 2 ? 'f' : 'b', 8) + T(x, y + 5, n, i === 2 ? 'tw' : 'tb'); });
        return s + T(cx, cy - 4, 'frontier model', 'tb') + T(cx, cy + 14, 'as engineer', 't') + T(460, 230, 'every edit versioned', 't');
      }
    },
    lora: {
      title: 'LoRA: learn a small low-rank update',
      cap: 'The big matrix W stays frozen. Two thin matrices B (d×r) and A (r×k) learn the change, so you train a few million parameters instead of billions. Afterwards BA can be merged into W.',
      svg: () => R(20, 50, 120, 120, 'b') + grid(20, 50, 120, 120, 15) + T(80, 192, 'W · frozen', 'tb') + T(80, 208, 'd × k') +
        T(158, 116, '+', 'op') +
        R(175, 50, 18, 120, 'f', 4) + T(184, 40, 'B', 'tb') + T(184, 192, 'd × r') +
        T(206, 114, '·', 'op') +
        R(218, 101, 120, 18, 'f', 4) + T(278, 92, 'A', 'tb') + T(278, 136, 'r × k') +
        T(358, 116, '=', 'op') +
        R(380, 50, 120, 120, 'b') + grid(380, 50, 120, 120, 15) + R(380, 50, 120, 120, 'f soft') + T(440, 192, 'W′ = W + BA', 'tb') +
        T(260, 236, 'rank r = 8–64 · only B and A get gradients')
    },
    qlora: {
      title: 'QLoRA: 4-bit frozen base, bf16 adapters',
      cap: 'The base model is stored in 4-bit (NF4) and never updated. LoRA adapters train in higher precision on top of it. Memory roughly halves, which is what lets a 9B model train on 12 GB, or a 33B model on the Mac.',
      svg: () => {
        let px = ''; for (let i = 0; i < 10; i++) for (let j = 0; j < 6; j++) px += R(28 + i * 18, 48 + j * 18, 14, 14, (i * 7 + j * 3) % 5 ? 'b' : 'b2', 2);
        const k = 6, bar = (y, base, rest, label, total) => R(290, y, base * k, 26, 'b', 4) + R(290 + base * k + 2, y, rest * k, 26, 'f2', 4) + T(290, y - 8, label, 'tb', 'start') + T(290 + (base + rest) * k + 8, y + 18, total, 't', 'start');
        return px + R(214, 48, 12, 104, 'f', 3) + R(230, 48, 12, 104, 'f', 3) +
          T(115, 172, 'base · 4-bit NF4 · frozen', 'tb') + T(228, 172, 'LoRA', 'tb') +
          bar(70, 18, 6, 'LoRA bf16 · 9B model', '≈24 GB') + bar(150, 5, 7, 'QLoRA · 9B model', '≈12 GB') +
          R(290, 205, 12, 12, 'b', 2) + T(308, 215, 'weights', 't', 'start') + R(370, 205, 12, 12, 'f2', 2) + T(388, 215, 'activations, optimizer', 't', 'start');
      }
    },
    steering: {
      title: 'Activation steering: add a direction',
      cap: 'Run contrasting prompts (say formal vs. casual) and take the difference of their mean activations: that gives a direction v. At inference, add α·v to the residual stream at one layer. No training, and it can be removed instantly.',
      svg: () => {
        let s = A(20, 100, 505, 100, 'ln thick') + T(505, 118, 'residual stream →', 't', 'end');
        for (let i = 0; i < 5; i++) { const x = 45 + i * 92; s += R(x, 40, 56, 30, 'b') + T(x + 28, 60, 'L' + (i + 1), 'tb') + L(x + 28, 70, x + 28, 100, 'ln'); }
        s += A(257, 175, 257, 104, 'la flow') + T(268, 150, '+ α·v', 'tb', 'start');
        s += [[40, 190], [52, 205], [62, 186], [48, 218], [70, 210]].map(p => dot(p[0], p[1], 'dt2', 4)).join('') +
          [[150, 180], [162, 196], [140, 200], [170, 214], [155, 222]].map(p => dot(p[0], p[1], 'dt', 4)).join('') +
          A(62, 204, 148, 200, 'la') + T(55, 240, 'casual', 't') + T(158, 240, 'formal', 't') + T(105, 172, 'v = mean(A) − mean(B)', 't');
        return s;
      }
    },
    ablation: {
      title: 'Direction ablation: project a direction out',
      cap: 'Steering adds v. Ablation removes it: every activation loses its component along v. Bake that into the weights (W ← W − v vᵀ W) and the behavior is gone permanently, with no runtime hook.',
      svg: () => L(140, 190, 380, 146, 'ln dash') + T(386, 146, 'direction v', 't', 'start') +
        A(140, 190, 300, 70, 'ln thick') + T(306, 66, 'h', 'tb', 'start') +
        L(300, 70, 316, 158, 'ln dash') + dot(316, 158, 'dt2', 4) + T(326, 172, '(h·v) v', 't', 'start') +
        A(140, 190, 124, 102, 'la thick') + T(116, 96, 'h′ = h − (h·v) v', 'tb', 'end') +
        dot(140, 190, 'dt2', 4) + T(140, 212, '0', 't') +
        T(372, 60, 'steering: h + α·v', 't', 'start') + T(372, 80, 'ablation: h − (h·v)v', 't', 'start') + T(372, 100, 'bake: W ← W − v vᵀW', 't', 'start')
    },
    merging: {
      title: 'Model merging: arithmetic on weights',
      cap: 'A fine-tune is a task vector τ = fine-tuned − base. Adding vectors combines skills (task arithmetic). TIES and DARE trim conflicts first, and SLERP interpolates along an arc so the weight norm doesn\'t shrink.',
      svg: () => dot(60, 190, 'dt2') + T(60, 212, 'base') +
        A(60, 190, 176, 151, 'ln thick') + T(122, 186, 'τA', 'tb') + dot(180, 150, 'dt2') + T(194, 154, 'task A', 't', 'start') +
        A(60, 190, 98, 94, 'ln thick') + T(66, 140, 'τB', 'tb', 'end') + dot(100, 90, 'dt2') + T(92, 82, 'task B', 't', 'end') +
        L(180, 150, 220, 50, 'ln dash') + L(100, 90, 220, 50, 'ln dash') + dot(220, 50, 'dt', 7) + T(232, 46, 'base + τA + τB', 'tb', 'start') +
        L(300, 190, 490, 190, 'ln dash') + `<path d="M300,190 Q395,40 490,190" class="la"/>` +
        dot(300, 190, 'dt2') + dot(490, 190, 'dt2') + T(300, 212, 'model A') + T(490, 212, 'model B') +
        dot(395, 115, 'dt', 7) + T(395, 100, 'SLERP', 'tb') + dot(395, 190, 'dt2', 4) + T(395, 178, 'linear', 't')
    },
    surgery: {
      title: 'Layer surgery: drop, duplicate, reorder',
      cap: 'Transformer layers mostly read from and write to a shared residual stream, so many tolerate being removed, repeated or swapped. Watch where quality falls off: middle layers are usually the most forgiving.',
      svg: () => {
        const col = (x, items, label) => {
          let s = '', h = 22, g = items.length > 6 ? 4 : 7;
          items.forEach((it, i) => {
            const y = 34 + i * (h + g), [l, k] = it.split(':');
            if (k === 'x') s += R(x, y, 90, h, 'b ghost', 5) + T(x + 45, y + 15, '× ' + l, 't');
            else s += R(x, y, 90, h, k === 'n' ? 'f' : 'b', 5) + T(x + 45, y + 15, l, k === 'n' ? 'tw' : 'tb');
          });
          return s + T(x + 45, 236, label, 'tb');
        };
        return col(20, ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'], 'original') + col(145, ['L1', 'L2', 'L3', 'L4:x', 'L5', 'L6'], 'drop') +
          col(270, ['L1', 'L2', 'L3', 'L4', 'L4′:n', 'L5', 'L6'], 'duplicate') + col(395, ['L1', 'L2', 'L4:n', 'L3:n', 'L5', 'L6'], 'reorder');
      }
    },
    looped: {
      title: 'Looped transformer: reuse the same layers',
      cap: 'A looped model runs a shared stack of layers more than once per token. Nanbeige4.2-3B runs its stack twice, so it gets more compute without more parameters. Changing the loop count is a cheap experiment.',
      svg: () => T(30, 112, 'tokens', 't') + A(58, 108, 88, 108) +
        R(90, 88, 70, 40, 'b') + T(125, 112, 'embed', 'tb') + A(160, 108, 198, 108) +
        R(200, 70, 160, 76, 'f', 10) + T(280, 104, 'shared layers', 'tw') + T(280, 122, 'same weights', 'tw2') +
        `<path d="M360,92 C410,92 410,30 280,30 C150,30 150,92 198,92" class="la flow" fill="none"/>` + `<polygon points="200,92 192,86 192,98" class="ah-a"/>` +
        T(280, 22, 'loop × 2 (try 1 or 3)', 'tb') +
        A(360, 108, 398, 108) + R(400, 88, 70, 40, 'b') + T(435, 112, 'head', 'tb') + A(470, 108, 500, 108) +
        T(280, 190, 'parameters: one stack', 't') + T(280, 210, 'compute: stack × loops', 't')
    },
    distill: {
      title: 'Distillation: a small model learns from a big one',
      cap: 'The student matches the teacher\'s whole probability distribution, not just its final answer. In on-policy distillation the student generates and the teacher scores its own tokens, which fixes the mistakes the student actually makes. Use a teacher whose license allows this.',
      svg: () => {
        const bars = (x, y, vals, cls) => vals.map((v, i) => R(x + i * 22, y - v, 16, v, cls, 3)).join('');
        return R(20, 50, 120, 110, 'b', 10) + T(80, 100, 'teacher', 'tb') + T(80, 118, '27–33B · frozen', 't') +
          A(140, 80, 190, 80) + bars(195, 100, [14, 52, 30, 8, 4], 'b2') + T(250, 118, 'teacher p(next token)', 't') +
          bars(195, 200, [18, 40, 34, 10, 6], 'f') + T(250, 218, 'student q(next token)', 't') +
          T(330, 150, 'minimize KL(p ‖ q)', 'tb', 'start') + A(320, 160, 300, 160, 'la') +
          R(400, 120, 90, 80, 'f', 10) + T(445, 156, 'student', 'tw') + T(445, 174, '3–9B', 'tw2') + A(400, 175, 310, 175, 'ln')
      }
    },
    dpo: {
      title: 'DPO: prefer the chosen answer',
      cap: 'Each example is a prompt with a chosen and a rejected answer. DPO raises the probability of the chosen one and lowers the rejected one, relative to a frozen reference copy. There is no reward model and no RL loop.',
      svg: () => R(20, 90, 90, 50, 'b') + T(65, 120, 'prompt', 'tb') +
        A(110, 105, 170, 70) + A(110, 125, 170, 165) +
        R(172, 48, 140, 40, 'b') + T(242, 73, '✓ chosen answer', 'tb') + R(172, 148, 140, 40, 'b') + T(242, 173, '✗ rejected answer', 'tb') +
        L(350, 118, 500, 118, 'ln dash') + T(500, 110, 'reference', 't', 'end') +
        R(380, 58, 34, 58, 'f', 4) + A(397, 100, 397, 46, 'la') + T(397, 140, 'chosen', 't') +
        R(440, 120, 34, 46, 'b2', 4) + A(457, 128, 457, 180, 'ln') + T(457, 200, 'rejected', 't') +
        T(425, 230, 'log-prob vs. reference', 't')
    },
    grpo: {
      title: 'GRPO: learn from a group of tries',
      cap: 'Sample several answers to the same prompt and score each with an automatic reward (tests pass, schema valid, answer correct). Answers that beat the group average are reinforced and the rest are pushed down. No critic model is needed.',
      svg: () => {
        const r = [1, 0, .5, 1], mean = .625;
        let s = R(20, 90, 80, 50, 'b') + T(60, 120, 'prompt', 'tb');
        r.forEach((v, i) => {
          const y = 34 + i * 46;
          s += A(100, 115, 136, y + 15, 'ln') + R(138, y, 90, 30, 'b') + T(183, y + 20, 'answer ' + (i + 1), 't') +
            T(262, y + 20, 'r = ' + v, 'tb') + L(300, y + 15, 300, y + 15, 'ln');
          const adv = (v - mean) * 60;
          s += R(adv >= 0 ? 345 : 345 + adv, y + 4, Math.abs(adv), 22, adv >= 0 ? 'f' : 'b2', 3);
        });
        return s + L(345, 26, 345, 214, 'ln') + T(345, 232, 'advantage = r − mean(r)', 't') + A(420, 120, 470, 120, 'la') + T(470, 108, 'update', 'tb', 'end') + T(480, 124, 'policy', 't', 'start');
      }
    },
    rome: {
      title: 'Weight editing: locate, then patch',
      cap: 'First find where a fact or behavior lives, for example by tracing which layer\'s MLP matters most. Then apply a tiny targeted change there (ROME-style: a rank-one update). An LLM-driven "weight-space programmer" works the same way: inspect, hypothesize, patch, check, revert if worse.',
      svg: () => {
        const heat = [.08, .1, .15, .3, .65, 1, .55, .25, .12, .08, .06, .05];
        let s = T(50, 24, 'trace', 'tb');
        heat.forEach((h, i) => { s += R(30, 32 + i * 16, 40, 13, 'f', 3, `opacity="${(.12 + h * .88).toFixed(2)}"`); });
        s += T(80, 124, '← layer ℓ', 't', 'start') + A(140, 120, 190, 120);
        s += T(205, 124, 'k', 'tb') + A(215, 120, 245, 120) +
          R(247, 70, 120, 100, 'b') + grid(247, 70, 120, 100, 14) + R(330, 70, 10, 100, 'f', 2) + R(247, 150, 120, 10, 'f', 2) +
          T(307, 190, 'W + ΔW (rank 1)', 'tb') + A(367, 120, 405, 120) + T(425, 124, 'v*', 'tb') +
          T(307, 214, 'key (subject) → new value (fact)', 't');
        return s;
      }
    },
    moe: {
      title: 'Mixture of Experts: few active, many stored',
      cap: 'A router sends each token to its top-k experts. A "35B-A3B" model stores 35B parameters but computes with about 3B per token, so it is fast to run but every expert still has to fit in memory.',
      svg: () => {
        let s = T(30, 124, 'token', 't') + A(55, 120, 90, 120) + R(92, 98, 70, 44, 'b') + T(127, 125, 'router', 'tb');
        const on = [1, 4];
        for (let i = 0; i < 6; i++) {
          const y = 24 + i * 34, a = on.includes(i);
          s += L(162, 120, 250, y + 13, a ? 'la thick' : 'ln faint') + R(252, y, 110, 26, a ? 'f' : 'b', 5) + T(307, y + 18, 'expert ' + (i + 1), a ? 'tw' : 't') +
            (a ? L(362, y + 13, 420, 120, 'la thick') : '');
        }
        return s + `<circle cx="432" cy="120" r="14" class="b"/>` + T(432, 125, 'Σ', 'tb') + A(446, 120, 495, 120) + T(470, 150, 'top-2 of 6', 't');
      }
    },
    prompt: {
      title: 'Soft prompt / prefix tuning',
      cap: 'The model stays fully frozen. A few trainable embedding vectors are put in front of every input, and only those vectors are learned. It is the smallest possible adapter, but also the least powerful.',
      svg: () => {
        let s = '';
        for (let i = 0; i < 4; i++) s += R(20 + i * 44, 60, 38, 38, 'f', 6) + T(39 + i * 44, 84, 'p' + (i + 1), 'tw');
        ['The', 'cat', 'sat', 'on', '…'].forEach((w, i) => { s += R(205 + i * 54, 60, 48, 38, 'b', 6) + T(229 + i * 54, 84, w, 'tb'); });
        return s + T(95, 120, 'trainable', 't') + T(330, 120, 'input tokens (frozen embeddings)', 't') +
          A(260, 132, 260, 158) + R(120, 160, 280, 48, 'b', 10) + T(260, 189, 'frozen model', 'tb');
      }
    },
    memory: {
      title: 'Where training memory goes',
      cap: 'Weights are only part of the cost. Full fine-tuning also stores gradients and two Adam states per parameter, so ~16 bytes/param. LoRA keeps those only for the adapters, and QLoRA also shrinks the weights to 4-bit.',
      svg: () => {
        const row = (y, label, segs) => { let x = 150, s = T(140, y + 18, label, 'tb', 'end'); segs.forEach(([w, c]) => { s += R(x, y, w, 26, c, 4); x += w + 2; }); return s; };
        return row(40, 'Full FT', [[64, 'b'], [64, 'b2'], [128, 'f2']]) + row(95, 'LoRA', [[64, 'b'], [6, 'b2'], [10, 'f2'], [40, 'f']]) +
          row(150, 'QLoRA', [[18, 'b'], [6, 'b2'], [10, 'f2'], [40, 'f']]) +
          R(150, 205, 12, 12, 'b', 2) + T(168, 215, 'weights', 't', 'start') + R(240, 205, 12, 12, 'b2', 2) + T(258, 215, 'gradients', 't', 'start') +
          R(340, 205, 12, 12, 'f2', 2) + T(358, 215, 'optimizer', 't', 'start') + R(430, 205, 12, 12, 'f', 2) + T(448, 215, 'activations', 't', 'start');
      }
    }
  };

  function render(host) {
    const d = D[host.dataset.diagram]; if (!d) return;
    const cap = host.dataset.caption !== 'false';
    host.classList.add('diagram');
    host.innerHTML = `<p class="dg-title">${d.title}</p><svg class="dg" viewBox="0 0 520 245" role="img" aria-label="${d.title}">${d.svg()}</svg>` +
      (cap ? `<p class="dg-cap">${d.cap}</p>` : '');
  }
  window.SLM_DIAGRAMS = D;
  const init = () => document.querySelectorAll('[data-diagram]').forEach(render);
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
