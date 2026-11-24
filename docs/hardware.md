---
title: Hardware (NVIDIA / cloud)
nav_order: 5
---

# Hardware

Planning estimates for **adapter training at seq 2–4K, batch 1, gradient checkpointing** (Unsloth/TRL-style). Long context, bigger batches and RL rollouts all need more. Measure before buying.

## Rules of thumb

| Mode | Memory per billion params | Plus |
|---|---|---|
| Inference, 4-bit | ~0.55–0.6 GB | KV cache |
| QLoRA (4-bit base) | ~0.6 GB | 4–8 GB activations/optimizer |
| LoRA (bf16 base) | ~2 GB | 4–8 GB |
| Full fine-tune (bf16 + Adam) | ~16 GB | — (cloud only at this size range) |

MoE models: count **total** params for memory, active params for speed.

## Consumer NVIDIA cards (12–32 GB)

| VRAM | Example cards | QLoRA up to | LoRA bf16 up to | Comfortable picks |
|---|---|---|---|---|
| 12 GB | RTX 3060 12G, 4070, 5070 | ~9B (tight) | ~3B | Nanbeige4.2-3B, Qwen3.5-4B, Qwen3.5-9B (QLoRA) |
| 16 GB | 4060 Ti 16G, 4080, 5060 Ti 16G, 5080 | ~14B | ~4–7B | + Ministral 3 8B/14B, OLMo 3 7B |
| 24 GB | 3090, 4090 | ~27B (tight) | ~9B | + Qwen3.6-27B QLoRA (short seq) |
| 32 GB | 5090 | ~33B | ~14B | + Muse Glimmer 30B, Nanbeige4.3-33B, 35B-A3B MoE (QLoRA) |

Notes:
- Blackwell consumer cards (50-series) need recent CUDA/PyTorch builds.
- 2× 24 GB cards help for inference (tensor parallel) more than for single-GPU QLoRA tooling.

## Cloud

| GPU | Memory | Good for |
|---|---|---|
| L40S (AWS g6e) | 48 GB | Cheap QLoRA/LoRA up to ~27B, small-model serving |
| H100 / H200 | 80 / 141 GB | LoRA on 27–35B, bf16 serving of 27–31B |
| B200 (AWS P6-B200, 8×) | 8 × 180 GB | Full fine-tune of 27–35B, RL at scale |

Check region availability (EU vs US) and current pricing before committing — cloud GPU prices moved up during 2026.
