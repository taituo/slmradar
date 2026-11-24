---
title: Catalog
sub: Every tracked model. Sort, filter, and see where each one trains.
order: 4
---

<p class="lead">Generated from <code>data/models.yml</code>. Click a column header to sort, use the chips to filter by architecture, or show only models that train comfortably on the Mac.</p>

<div data-viz="catalog"></div>

## Fit matrix

The same models against each memory budget. Cells show the best adapter method that fits. Darker means more headroom.

<div data-viz="fit-matrix"></div>

## Release timeline

<div data-viz="timeline"></div>

## Model notes

<div data-viz="notes"></div>

## How to read the numbers

- **QLoRA GB**: 4-bit base model + LoRA, sequence length 2–4K, batch 1, gradient checkpointing.
- **LoRA GB**: bf16 base model + LoRA, same settings.
- **\*** after a license: not yet confirmed on the model card.
- **verified**: license and size checked against the official repo or announcement. **partial**: the official repo exists, but some fields still need confirming.
- These are planning estimates. Long context and RL rollouts need much more memory.
