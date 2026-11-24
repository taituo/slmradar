---
title: Home
nav_order: 1
---

# slmradar

A maintained radar of **open-weight models in the 3B–35B range** that are realistic to **tune and modify yourself**. The focus is the hands-on experience of changing models, not benchmarking.

Where it runs, in priority order:

1. **Local: MacBook M5 Pro, 48 GB** (MLX). The main workbench.
2. **12–32 GB NVIDIA cards** (RTX 3060 12 GB … RTX 5090 32 GB).
3. **Cloud** (L40S / H100 / H200 / B200) for long or large runs.

## Selection rules

1. Weights downloadable, **permissive license** (Apache-2.0 / MIT) unless listed under [license caution](watchlist.html#license-caution).
2. Size 3B–35B total parameters.
3. Every entry has a `status` and a `checked` date. Anything not confirmed from a first-party source goes to the [watchlist](watchlist.html), not the catalog.

## Pages

| Page | What |
|---|---|
| [Local Mac](mac-local.html) | M5 Pro 48 GB: what fits, MLX-LM loop |
| [Tinkering](tinkering.html) | LoRA, merging, steering, layer surgery, weight edits |
| [Catalog](catalog.html) | The model table (generated from `docs/_data/models.yml`) |
| [Hardware](hardware.html) | NVIDIA 12 / 16 / 24 / 32 GB and cloud |
| [Fine-tuning](fine-tuning.html) | Which methods are actually worth it |
| [Inference](inference.html) | Serving stack options |
| [Licensing](licensing.html) | Weight licenses vs. teacher-data restrictions |
| [Watchlist](watchlist.html) | Unverified claims and license-caution families |

## Current shortlist (2026-11-24)

| Role | Pick | Why |
|---|---|---|
| Small agent / experiments | Nanbeige4.2-3B | Strong 3B agentic model, Apache-2.0, looped architecture |
| Small control model | Qwen3.5-4B | Mainstream architecture, broad tooling |
| Transparent research | OLMo 3 7B | Data, code and intermediate checkpoints released |
| Cheap specialist | Qwen3.5-9B | Best quality/VRAM at ~9B, QLoRA on 12 GB |
| 27–33B workhorse / teacher | Qwen3.6/3.8-27B, Nanbeige4.3-33B | Strong agentic/coding, Apache-2.0 |
| Agent on one consumer GPU | Muse Glimmer 30B | Built to run in a 24–32 GB envelope |
