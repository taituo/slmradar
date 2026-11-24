---
title: slmradar
nav: Home
sub: Open-weight models from 3B to 35B that you can tune and modify yourself. Mac first, then NVIDIA cards and the cloud.
order: 1
---

<p class="lead">A maintained radar of small and mid-size open models, aimed at getting hands-on: training adapters, merging, steering and editing weights on your own machine. It's not a benchmark leaderboard.</p>

<div data-viz="stats"></div>

## Where things fit

The main question for every model here is *where can I actually change it?* The chart puts every catalog model against the memory budgets of a 48 GB MacBook and the common NVIDIA cards.

<div data-viz="fit-scatter"></div>

## Shortlist

<div class="cards" markdown="0">
  <a class="card" href="mac-local.html"><div class="k">Small agent · 3B</div><div class="v">Nanbeige4.2-3B</div><div class="d">Strong agentic 3B with a looped transformer. Change the loop count and see what happens.</div></a>
  <a class="card" href="catalog.html"><div class="k">Control model · 4B</div><div class="v">Qwen3.5-4B</div><div class="d">Mainstream architecture and broad tooling. The baseline for small experiments.</div></a>
  <a class="card" href="tinkering.html"><div class="k">Transparent · 7B</div><div class="v">OLMo 3 7B</div><div class="d">Data, code and intermediate checkpoints released. Lets you trace where a behavior came from.</div></a>
  <a class="card" href="mac-local.html"><div class="k">Sweet spot · 9B</div><div class="v">Qwen3.5-9B</div><div class="d">Best quality per GB at ~9B. Fast LoRA runs on the Mac.</div></a>
  <a class="card" href="catalog.html"><div class="k">Workhorse · 27–33B</div><div class="v">Qwen3.6/3.8-27B · Nanbeige4.3-33B</div><div class="d">Strong agentic/coding teachers with Apache-2.0 licenses. Fit 4-bit on the Mac.</div></a>
  <a class="card" href="catalog.html"><div class="k">Local agent · 30B</div><div class="v">Muse Glimmer 30B</div><div class="d">Meta's Apache-2.0 model, built to run in a 24–32 GB envelope.</div></a>
</div>

## What's in here

<div class="cards" markdown="0">
  <a class="card" href="mac-local.html"><div class="v">Local Mac</div><div class="d">48 GB M5 Pro: memory budget, MLX loop, what fits.</div></a>
  <a class="card" href="tinkering.html"><div class="v">Tinkering</div><div class="d">LoRA, merging, steering, layer surgery, weight edits.</div></a>
  <a class="card" href="explained.html"><div class="v">Explained</div><div class="d">One diagram per technique: LoRA, steering, merging, GRPO and more.</div></a>
  <a class="card" href="recipes.html"><div class="v">Recipes</div><div class="d">First LoRA, probe diffs, blending, steering, plus gotchas.</div></a>
  <a class="card" href="speed.html"><div class="v">Speed</div><div class="d">Bandwidth-based tok/s estimate per device, plus your own measurements.</div></a>
  <a class="card" href="methods.html"><div class="v">Methods</div><div class="d">Every fine-tuning and modification method, by family.</div></a>
  <a class="card" href="catalog.html"><div class="v">Catalog</div><div class="d">Sortable table, fit matrix and release timeline.</div></a>
  <a class="card" href="hardware.html"><div class="v">Hardware</div><div class="d">NVIDIA 12–32 GB cards and cloud GPUs.</div></a>
  <a class="card" href="research.html"><div class="v">Research</div><div class="d">Weight-space programming and other frontier ideas.</div></a>
</div>

## Selection rules

1. Downloadable weights with a **permissive license** (Apache-2.0 / MIT). Exceptions are listed under [license caution](watchlist.html).
2. Between 3B and 35B total parameters.
3. Every entry has a status and a checked date. Anything not confirmed from a first-party source goes to the [watchlist](watchlist.html), not the catalog.
