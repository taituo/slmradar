---
title: Recipes
sub: "Copy, run, read the diff. Minimal starting points for the Mac."
order: 3.7
---

<p class="lead">Everything here lives in <a href="https://github.com/taituo/slmradar/tree/main/recipes"><code>recipes/</code></a> in the repo. The scripts target the <code>mlx-lm</code> Python API and haven't been run in this repo's CI yet, so treat them as starting points and fix them where your mlx-lm version differs.</p>

## 1. First LoRA in ten minutes

<div data-diagram="lora" data-caption="false"></div>

```bash
pip install -U mlx-lm
mlx_lm.convert --hf-path Qwen/Qwen3.5-4B -q --q-bits 4 --mlx-path ./q4b
mlx_lm.lora --model ./q4b --train --data recipes/data --iters 200 \
  --batch-size 1 --num-layers 8 --adapter-path ./adapters/sum-v1
python recipes/compare.py --model ./q4b --adapter ./adapters/sum-v1 \
  --probes recipes/data/probes.jsonl > report.md
```

Three examples won't teach much. Replace `train.jsonl` with 100–500 of your own, and keep `valid.jsonl` separate.

## 2. Data format

<div data-diagram="sft" data-caption="false"></div>

```json
{"messages": [
  {"role": "user", "content": "Summarize: The build failed because the lockfile was stale."},
  {"role": "assistant", "content": "Build failed: stale lockfile. Fix: regenerate and rebuild."}
]}
```

One JSON object per line. mlx-lm applies the model's own chat template, so don't hand-write special tokens.

## 3. Probe prompts, not benchmarks

`probes.jsonl` mixes **target** prompts (what you're changing) with **must-not-break** prompts (math, general writing). `compare.py` runs the base model and the adapted one on every probe and writes a Markdown report marking each probe as *same* or *changed*. Read it yourself.

## 4. Blend two fine-tunes

<div data-diagram="merging" data-caption="false"></div>

```bash
mlx_lm.fuse --model ./base --adapter-path ./adapters/a --save-path ./fused-a --dequantize
mlx_lm.fuse --model ./base --adapter-path ./adapters/b --save-path ./fused-b --dequantize
python recipes/blend.py ./fused-a ./fused-b ./blend-05 --t 0.5
```

Both models must be **de-quantized**: 4-bit integers can't be averaged. Check `mlx_lm.fuse --help` for the exact flag name in your version.

## 5. Steering vector

<div data-diagram="steering" data-caption="false"></div>

```bash
python recipes/steer.py --model ./q4b --layer 14 --alpha 8 \
  --pos "Write formally: thank the team." --pos "Write formally: decline the meeting." \
  --neg "Write casually: thank the team." --neg "Write casually: decline the meeting." \
  --prompt "Thank the team for shipping the release."
```

This prints the output at α = 0, +α and −α. Hidden-state scales differ by model, so sweep α from about 2 to 20 and try middle layers first. The script assumes a `model.model.layers` list (Llama/Qwen3/Mistral style). Hybrid and looped models may need changes.

## Gotchas

<div data-viz="gotchas"></div>

### General pitfalls

- **Wrong chat template:** training data rendered with a different template than the one used at inference. This is the most common silent bug.
- **Thinking mode:** reasoning models (e.g. Qwen3.5) emit `<think>` blocks by default. Decide whether your SFT data includes them.
- **Learning rate too high or too many iterations:** the model parrots the training set. Watch the validation loss and your must-not-break probes.
- **Evaluating on training data:** keep probes out of `train.jsonl`.
- **Fusing into a quantized model:** fine for inference, but you can't merge or blend it afterwards. Keep a de-quantized copy.
- **New architectures:** mlx-lm and llama.cpp support can lag weeks behind a release. Check the tooling table in the [catalog](catalog.html#runtime-support).
