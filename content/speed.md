---
title: Speed
sub: "How fast will it feel? An honest estimate, plus your own measurements."
order: 4.5
---

<p class="lead">Decoding is mostly limited by memory bandwidth: every generated token reads all active weights once. That gives a hard upper bound you can calculate. Real speeds land below it. Measured numbers go into <code>data/speed.yml</code> and show up as dots on the chart.</p>

<div data-viz="speed"></div>

## The rule of thumb

**tokens/s ≲ bandwidth ÷ (active parameters × bytes per weight)**

- MacBook M5 Pro: 307 GB/s. A 9B model in 4-bit reads ~5 GB per token, so the ceiling is ~60 tok/s and real speed is ~30–45.
- MoE models read only their **active** parameters, which is why a 35B-A3B model can decode faster than a dense 9B.
- Prefill (reading the prompt) is compute-bound, not bandwidth-bound. Long prompts feel slow on any laptop.

## Measure it yourself

```bash
mlx_lm.generate --model ./q9b --prompt "Explain LoRA in 200 words." --max-tokens 256
# prints prompt and generation tokens-per-second
```

Then add a line to `data/speed.yml`:

```yaml
- {model: qwen3.5-9b, device: "MacBook M5 Pro", runtime: "mlx-lm 4-bit", decode_tps: 41, prefill_tps: 380, date: 2026-11-24}
```

The `model` value must match an `id` in `data/models.yml`, and `device` must match a name in `data/devices.yml`.
