---
title: Catalog
sub: Every tracked model. Sort, filter, and see where each one trains.
order: 4
---

<p class="lead">Generated from <code>data/models.yml</code>. Click a column header to sort, use the chips to filter by architecture, or show only models that train comfortably on the Mac.</p>

<div data-viz="catalog"></div>

## Runtime support

Which tools can load each model today. New architectures (looped, hybrid) often need forks or PR branches for weeks after release.

<div data-viz="tooling"></div>

## Fit matrix

The same models against each memory budget. Cells show the best adapter method that fits. Darker means more headroom.

<div data-viz="fit-matrix"></div>

## Release timeline

<div data-viz="timeline"></div>

## Model notes

<div data-viz="notes"></div>

## Below 3B

Outside the catalog's range, but handy for edge devices and very fast iteration.

<div data-viz="edge"></div>

## How to read the numbers

- **QLoRA GB**: 4-bit base model + LoRA, sequence length 2–4K, batch 1, gradient checkpointing.
- **LoRA GB**: bf16 base model + LoRA, same settings.
- **\*** after a license: not yet confirmed on the model card.
- **verified**: license and size checked against the official repo or announcement. **partial**: the official repo exists, but some fields still need confirming.
- These are planning estimates. Long context and RL rollouts need much more memory.
