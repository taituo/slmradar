---
title: Explained
sub: How each technique works, one picture per idea.
order: 3.5
---

<p class="lead">Every diagram uses the same key, so you can compare them at a glance. <b>Gray is frozen, blue is what you train or change.</b> Start with LoRA and steering: between them they cover most of what you'll do on the Mac.</p>

<div class="legend-key"><span><i style="background:var(--muted);border:1px solid var(--ring)"></i>frozen</span><span><i style="background:var(--series-1)"></i>trained / changed</span><span><i style="background:var(--seq-2)"></i>supporting (activations, optimizer)</span></div>

## LoRA

<div data-diagram="lora"></div>

**Try it:** `mlx_lm.lora` on Qwen3.5-4B with 200 examples of your preferred answer format. Compare the outputs before and after on your probe prompts.

## QLoRA

<div data-diagram="qlora"></div>

**Try it:** the same run as above, but on a 4-bit `mlx_lm.convert -q` copy of a 27B model. Note the memory use and how much slower it is.

## Where memory goes

<div data-diagram="memory"></div>

This is why the [catalog](catalog.html) lists two training numbers: QLoRA and LoRA bf16.

## Activation steering

<div data-diagram="steering"></div>

**Try it:** take 20 formal/casual prompt pairs, collect activations at a middle layer, then add α·v while generating and sweep α from 0 to 8.

## Direction ablation

<div data-diagram="ablation"></div>

**Try it:** use the same v as in steering, but project it out instead. Then bake it into the weights and compare the result with the runtime hook.

## Model merging

<div data-diagram="merging"></div>

**Try it:** take two LoRAs trained on the same base, fuse each one, then interpolate between them at 0.3 / 0.5 / 0.7.

## Layer surgery

<div data-diagram="surgery"></div>

**Try it:** on a dense 7–9B model, drop one middle layer at a time and plot perplexity on a small text file.

## Looped transformer

<div data-diagram="looped"></div>

**Try it:** run Nanbeige4.2-3B with loop counts of 1, 2 and 3 and see what changes in reasoning.

## Soft prompt / prefix

<div data-diagram="prompt"></div>

The cheapest adapter there is. It's useful as a baseline: if a soft prompt already fixes the behavior, you don't need a LoRA.

## Mixture of Experts

<div data-diagram="moe"></div>

This matters for picking models: MoE models such as Qwen3.5-35B-A3B and gpt-oss-20b are fast to run, but every expert still has to fit in memory.

## Distillation

<div data-diagram="distill"></div>

**Try it:** a 27–33B Apache-licensed teacher on the Mac (4-bit) generating answers for a 4B student. See [Licensing](licensing.html) before using an API model as the teacher.

## DPO

<div data-diagram="dpo"></div>

Best for tone and style, where "better" is easy to judge but hard to write down as a rule.

## GRPO

<div data-diagram="grpo"></div>

Needs an automatic reward: tests, schema validation or exact-match answers. Small runs on 3–4B models are possible locally; bigger ones belong in the cloud.

## Weight editing

<div data-diagram="rome"></div>

The most surgical option, and the closest to "programming" a model. OLMo 3's intermediate checkpoints let you check where a behavior formed before you edit it.
