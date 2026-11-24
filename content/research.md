---
title: Research
sub: Frontier ideas worth watching. Unverified claims are marked.
order: 9
---

<p class="lead">This page collects bigger ideas: what still makes sense to train as general models improve, and the newer approaches that change weights without gradient descent.</p>

## Does fine-tuning still make sense?

As base models get more capable and better connected to tools and memory, the reasons to fine-tune shift. The question stops being "how do I make the model smarter?" and becomes "what do I need that general intelligence can't reliably give me?"

| Goal | Value of fine-tuning |
|---|---|
| Adding general knowledge | Low and falling |
| Private / changing information | Low (retrieval and memory are better) |
| Consistent specialized behavior | High |
| Cheaper, faster inference | Very high |
| Small specialist models | Very high |
| Offline / sovereign AI | Very high |
| Reasoning with measurable rewards | High |

The durable assets are **data, evaluation and environments**, not a particular set of weights. Build so that a better base model can be dropped in without losing your work.

## Weight-space programming

<div class="callout" markdown="1">
**Not verified yet.** These are claims from secondhand summaries. Check each one against the actual papers before relying on it.
</div>

The idea: a capable model acts as an engineer for a smaller one. It inspects tensors, forms a hypothesis, writes a weight patch, evaluates the result, and keeps or reverts the change. No gradient updates are involved.

Claimed results (November 2026, unverified):

- An MIT-affiliated blog post reports a frontier model editing ~0.016% of Qwen3.5-0.8B's weights and raising MATH-500 from 7.9% to 48.1%. The gain mostly came from fixing a reasoning-loop failure, not from adding new knowledge.
- Follow-ups reportedly cover weight edits for robot policies and a 27B model rewriting its own weights.

<div data-diagram="wsp"></div>

What would make it practical here:

- A tool interface where the model writes Python against the tensors. You never paste weights into a context window.
- Every edit versioned, with fast probes and one-command rollback.
- Start at 0.8–3B (Qwen3.5-0.8B, Nanbeige4.2-3B), then try OLMo 3 7B, whose intermediate checkpoints show how a behavior formed.

## A hybrid optimizer

The longer-term direction is a system that **picks its own intervention** for each weakness: a weight edit, a LoRA, RL, distillation, external memory or a merge. Every attempt is backed by versioned checkpoints and evaluation.

## Data worth collecting now

If you run real workloads, record: original requests, tool calls and their results, human corrections, task success or failure, and real-world outcomes. Tag every record with its **provenance** (`human | tool | model:<name>`). The training rights for model-generated data depend on the provider's terms. See [Licensing](licensing.html).
