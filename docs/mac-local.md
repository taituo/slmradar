---
title: Local Mac (M5 Pro 48 GB)
nav_order: 2
---

{% include grain_hero.html title="Local Mac" sub="M5 Pro · 48 GB unified memory · MLX" height=150 %}

The main workbench. Fast iteration, and no cloud bill for experiments. Move to a cloud GPU only for long runs or anything >~14B that needs many steps.

## Memory budget

- 48 GB unified memory is shared between the GPU and the OS. By default macOS allows the GPU roughly ~70–75% of it (≈ 34–36 GB).
- That limit can be raised for a session: `sudo sysctl iogpu.wired_limit_mb=40960` (resets on reboot). Leave headroom for the OS.
- Practical working budget: **~34–40 GB**.

## What fits (MLX-LM, LoRA on a 4-bit base)

| Size | Feel | Examples |
|---|---|---|
| 3–4B | Instant. Many runs per hour, bf16 LoRA also fine | Nanbeige4.2-3B, Qwen3.5-4B, Ministral 3 3B |
| 7–9B | Comfortable. The sweet spot | OLMo 3 7B, Ministral 3 8B, Qwen3.5-9B |
| 14B | Fine for short runs | Ministral 3 14B |
| 27–35B | Fits 4-bit, slow. Use for inference, merging and teacher work, not long training runs | Qwen3.6/3.8-27B, Muse Glimmer 30B, Nanbeige4.3-33B |

The catalog's **Mac 48 GB** column uses the same rule.

## Tooling (library-level, scriptable)

- **mlx-lm**: `mlx_lm.lora` (LoRA / DoRA / full fine-tune, 4-bit base = QLoRA-style), `mlx_lm.fuse` (merge adapter into weights), `mlx_lm.convert -q` (quantize), `mlx_lm.generate` / `mlx_lm.server`.
- **mlx** directly: load weights as arrays, inspect them, edit them in place, save safetensors. This is the path for [hands-on modification](tinkering.html).
- **PyTorch + MPS**: fallback when a model needs `trust_remote_code` code that has no MLX port yet.

```bash
# minimal loop
mlx_lm.convert --hf-path Qwen/Qwen3.5-9B -q --q-bits 4 --mlx-path ./q9b
mlx_lm.lora --model ./q9b --train --data ./data --iters 300 --batch-size 1 \
  --num-layers 16 --adapter-path ./adapters/run1
mlx_lm.generate --model ./q9b --adapter-path ./adapters/run1 --prompt "..."
mlx_lm.fuse --model ./q9b --adapter-path ./adapters/run1 --save-path ./q9b-run1
```

`data/` holds `train.jsonl` and `valid.jsonl`, in chat (`messages`) or `text` format.

## Architecture support: check first

New architectures (hybrid Gated DeltaNet in Qwen3.5/3.6/3.8, looped Nanbeige4.2, vision towers) may land in mlx-lm later than in transformers. Before picking a model, try `mlx_lm.convert` on it. If that fails, use PyTorch/MPS or pick a Llama-architecture model (e.g. Nanbeige4.3-33B, OLMo 3).

## When to go to the cloud

- Runs longer than an evening.
- LoRA in bf16 at ≥14B, or anything RL with many rollouts.
- You need CUDA-only kernels (Unsloth, FlashAttention, vLLM).
