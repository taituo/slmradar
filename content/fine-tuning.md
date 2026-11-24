---
title: Fine-tuning
order: 6
sub: Which methods are worth the effort, and the minimum loop.
---

Base models are replaced every few months. Spend on things that survive a base-model swap: **data, evals, environments**. Weights are a cheap, re-runnable output.
{: .lead}

| Method | Verdict | When |
|---|---|---|
| LoRA / QLoRA + SFT | **Do** | Your tool-calling formats, workflows, structured output, house style |
| GRPO / RLVR | **Do, if you have a checker** | Tests, schema validation, E2E pass/fail — anything with automatic reward |
| On-policy distillation | Good | Teacher must be a model whose license allows training (see [Licensing](licensing.html)) |
| DPO / KTO | Sometimes | Subjective preferences with real chosen/rejected pairs |
| Continued pretraining | Rarely | New language or truly missing domain; start from a `-Base` checkpoint |
| Full fine-tune | Rarely | Lots of data, LoRA measurably insufficient |
| Direct weight editing / steering | Research | Small models (3–7B), OLMo for traceability |
| General-assistant SFT | **Don't** | Next base model will beat it |

<div data-diagram="memory"></div>

## Minimum loop

1. Write ~20 probe prompts and save the base model's answers.
2. LoRA + SFT on a 3–9B model, locally on the [Mac](mac-local.html) or on a 12–16 GB card.
3. Diff the probe answers and read them. Iterate.
4. Add RLVR only where a reward is automatic.
5. Version adapter + dataset + probes together. Run heavier evals only when something goes to real use.

## Tooling

Unsloth (memory-efficient LoRA/QLoRA), Hugging Face TRL + PEFT (SFT/DPO/GRPO), Axolotl (config-driven), torchtune (plain PyTorch), SkyRL / verl / OpenRLHF (RL at scale).
