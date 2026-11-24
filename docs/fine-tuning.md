---
title: Fine-tuning
nav_order: 4
---

# Which fine-tuning is worth it

Base models are replaced every few months. Spend on things that survive a base-model swap: **data, evals, environments**. Weights are a cheap, re-runnable output.

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

## Minimum loop

1. Baseline eval on **your** tasks (before any training).
2. LoRA + SFT on a 3–9B model (fits 12–16 GB).
3. Add RLVR only where a reward is automatic.
4. Re-eval: gains, regressions, latency, cost.
5. Version adapter + dataset + eval together.

## Tooling

Unsloth (memory-efficient LoRA/QLoRA), Hugging Face TRL + PEFT (SFT/DPO/GRPO), Axolotl (config-driven), torchtune (plain PyTorch), SkyRL / verl / OpenRLHF (RL at scale).
