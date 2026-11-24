---
title: Tinkering
sub: Change models by hand, then check the result by reading it.
order: 3
---

<p class="lead">The goal is to develop a feel for how models respond when you change them. Keep the checking light: a fixed set of ~20 prompts you read yourself, and a side-by-side diff against the previous version.</p>

## Where to start

<div data-viz="quadrant"></div>

## The toolbox

Each technique has a picture on the [Explained](explained.html) page.

| Technique | What you touch | Effort | Try it on |
|---|---|---|---|
| LoRA / DoRA SFT | Low-rank adapters | Low | Anything: style, format, tool-call shape |
| Adapter merging / stacking | Several LoRAs → one | Low | Two LoRAs trained on the same base |
| Model merging | Whole weights (SLERP, TIES, DARE, task arithmetic) | Low | Base + instruct of the same family |
| Activation steering | A vector added to the residual stream | Low–med | 3–9B models; find a direction from contrast prompts |
| Direction ablation | That direction, projected out of the weights | Med | Same as steering, baked into the weights |
| Layer surgery | Drop, duplicate or reorder layers | Med | Dense models; watch where quality falls off |
| Loop-count changes | How often shared layers run | Med | **Nanbeige4.2-3B** (looped), a natural playground |
| Targeted weight edits | A few tensors (ROME-style or LLM-written patches) | High | OLMo 3 7B; compare against intermediate checkpoints |
| Small GRPO run | The policy, via a reward function | Med–high | 3–4B with a programmatic reward |

## The quick-check kit

You don't need a benchmark suite:

- `probes.jsonl`: ~20 prompts covering what you're changing, plus a few "must not break" ones.
- A script that generates from the base and the modified model and shows a side-by-side diff.
- Optional: perplexity on a small held-out text to catch obvious breakage.

## Experiments worth an evening

### Steer, then bake

<div data-diagram="steering" data-caption="false"></div>

Find a style direction with activation steering. Then turn it into a weight edit (ablation or addition) and compare it with a LoRA that learned the same thing.

### Turn the loop dial

<div data-diagram="looped" data-caption="false"></div>

On Nanbeige4.2-3B, run the shared stack 1, 2 or 3 times and see what changes in reasoning and in output.

### Merge arithmetic

<div data-diagram="merging" data-caption="false"></div>

Add a task-A LoRA and a task-B LoRA together. What does each one contribute, and where do they interfere?

### Checkpoint archaeology

<div data-diagram="rome" data-caption="false"></div>

On OLMo 3 7B, diff the weights across intermediate checkpoints for one capability you care about.
