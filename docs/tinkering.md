---
title: Tinkering (modify models)
nav_order: 3
---

{% include grain_hero.html title="Tinkering" sub="Change models by hand, check by reading" height=150 %}

The goal here is to **get a feel for changing models**, not to benchmark them. Keep the checks lightweight: a fixed list of ~20 prompts you read yourself, plus a diff against the previous version.

Start small (3–9B on the [Mac](mac-local.html)). Every technique below runs locally.

| Technique | What you touch | Effort | Try it on |
|---|---|---|---|
| LoRA / DoRA SFT | Low-rank adapters | Low | Anything; style, format, tool-call shape |
| Adapter merging / stacking | Several LoRAs → one | Low | Two LoRAs trained on the same base |
| Model merging (linear, SLERP, TIES, DARE, task arithmetic) | Whole weights | Low | Base + instruct of the same family |
| Activation steering | Add a vector to the residual stream at inference | Low–med | 3–9B; find a direction from contrast prompts |
| Direction ablation | Project a direction out of the weights | Med | Same as steering, baked into the weights |
| Layer surgery | Drop, duplicate or reorder layers | Med | Dense models; watch quality fall off |
| Loop-count changes | Run shared layers more or fewer times | Med | **Nanbeige4.2-3B** (looped), a natural playground |
| Targeted weight edits (ROME-style, LLM-written patches) | A few tensors | High | OLMo 3 7B, whose intermediate checkpoints let you compare |
| Small GRPO run | Policy via a reward function | Med–high | 3–4B with a programmatic reward |

## Quick-check kit (not a benchmark)

- `probes.jsonl`: ~20 prompts covering what you're changing, plus a few "must not break" ones.
- Script: generate with the base model and the modified model, then show a side-by-side diff.
- Optional: perplexity on a small held-out text file to catch obvious breakage.

## Ideas worth trying

1. **Steer, then bake:** find a style direction via steering, then turn it into a weight edit (ablation/addition) and compare the result with a LoRA that learns the same thing.
2. **Loop dial:** on Nanbeige4.2-3B, change the loop count (1 / 2 / 3) and see what changes in reasoning and in output.
3. **Merge arithmetic:** take a LoRA trained for task A and one for task B, add them, and see what each contributes.
4. **Checkpoint archaeology:** on OLMo 3 7B, diff weights across intermediate checkpoints for a capability you care about.
