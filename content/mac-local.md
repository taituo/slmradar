---
title: Local Mac
sub: MacBook M5 Pro with 48 GB unified memory, the main workbench for changing models.
order: 2
---

<p class="lead">Iteration speed beats raw power when you're learning how models change. A 48 GB Mac runs LoRA on 3–9B models in minutes, holds a 4-bit 30B model in memory, and never sends you a cloud bill.</p>

## The memory budget

Unified memory is shared between the GPU and macOS. By default the GPU gets roughly three quarters of it, which is about **34–36 GB** on a 48 GB machine. You can raise the limit for a session (it resets on reboot):

```bash
sudo sysctl iogpu.wired_limit_mb=40960   # ~40 GB for the GPU; leave the OS some room
```

<div data-viz="budgets"></div>

<div data-diagram="unified" data-caption="false"></div>

## What it feels like at each size

| Size | Feel | Good models |
|---|---|---|
| 3–4B | Instant. Many runs per hour, bf16 LoRA is fine too | Nanbeige4.2-3B, Qwen3.5-4B, Ministral 3 3B |
| 7–9B | Comfortable: **the sweet spot** | OLMo 3 7B, Ministral 3 8B, Qwen3.5-9B |
| 14B | Fine for short runs | Ministral 3 14B |
| 27–35B | Fits in 4-bit but slow. Use for inference, merging and teacher work | Qwen3.6/3.8-27B, Muse Glimmer 30B, Nanbeige4.3-33B |

## The loop

Everything runs through `mlx-lm`, a library you script, plus plain `mlx` for touching tensors directly.

```bash
mlx_lm.convert --hf-path Qwen/Qwen3.5-9B -q --q-bits 4 --mlx-path ./q9b
mlx_lm.lora --model ./q9b --train --data ./data --iters 300 --batch-size 1 \
  --num-layers 16 --adapter-path ./adapters/run1
mlx_lm.generate --model ./q9b --adapter-path ./adapters/run1 --prompt "..."
mlx_lm.fuse --model ./q9b --adapter-path ./adapters/run1 --save-path ./q9b-run1
```

`data/` holds `train.jsonl` and `valid.jsonl`, in chat (`messages`) or `text` format. `mlx_lm.lora` also does DoRA and full fine-tuning.

To edit weights by hand, load the safetensors as `mlx` arrays, change them, and save. See [Tinkering](tinkering.html).

## Check architecture support first

New architectures can reach mlx-lm later than transformers. Examples: the hybrid Gated DeltaNet in Qwen3.5/3.6/3.8, the looped Nanbeige4.2, and vision towers. Before planning around a model, run `mlx_lm.convert` on it. If that fails, use PyTorch on MPS, or pick a Llama-architecture model like Nanbeige4.3-33B or OLMo 3.

## When to leave the laptop

- A run won't finish in an evening.
- bf16 LoRA at 14B or more, or RL with many rollouts.
- You need CUDA-only kernels (Unsloth, FlashAttention, vLLM). See [Hardware](hardware.html).
