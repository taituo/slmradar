---
title: Methods
sub: Every way to change a model, grouped by what you train and how.
order: 5
---

<p class="lead">Fine-tuning comes down to three choices: <b>which parameters change</b>, <b>what objective drives the change</b>, and <b>whether you train at all</b>. Most real pipelines combine one from each.</p>

## 1. Which parameters change

| Method | What changes | Cost |
|---|---|---|
| Full fine-tuning | All weights | Very high |
| Partial fine-tuning / LISA | Selected layers | High |
| **LoRA** | Low-rank weight deltas | Low |
| **QLoRA** | LoRA on a 4-bit base | Very low |
| DoRA | Magnitude + direction | Low |
| AdaLoRA / DyLoRA | Adaptive or dynamic rank | Low |
| rsLoRA / LoRA+ / PiSSA / OLoRA | Better scaling, learning rates or initialization | Low |
| VeRA | Shared frozen matrices + trainable scaling vectors | Very low |
| LoHa / LoKr | Hadamard / Kronecker products | Low |
| OFT / BOFT | Orthogonal transforms | Low |
| Adapters | Small inserted layers | Low |
| Prefix / soft prompt / P-tuning | Trainable prompt embeddings | Very low |
| IA³ | Activation scaling vectors | Very low |
| BitFit / LayerNorm tuning | Biases / norm parameters | Very low |
| ReFT | Internal representations | Low |
| Trainable tokens | Selected token embeddings | Very low |
| GaLore | Low-rank *gradient* projection (full-rank weights) | Medium |

Most of these live in Hugging Face PEFT. On the Mac, `mlx-lm` covers LoRA, DoRA and full fine-tuning.

## 2. What drives the change

### Supervised
SFT, instruction tuning, conversation tuning, completion tuning, reasoning distillation, tool-use tuning, multimodal tuning.

### Preferences
DPO, IPO, KTO, ORPO, SimPO, CPO, APO, BCO, NCA, RSO, online DPO. Best for style, personality and response quality.

### Reinforcement learning
PPO, GRPO, Dr. GRPO, DAPO, GSPO, REINFORCE(++), RLOO. The umbrella terms are RLHF, RLAIF, RLVR and RFT. These work best where success is measurable, as in maths, code, tool use and agents.

### Knowledge and domain
Continued pretraining (CPT), domain- and task-adaptive pretraining (DAPT/TAPT), language adaptation, continual learning, knowledge distillation and self-distillation, synthetic data, curriculum learning, multi-task learning, contrastive tuning.

## 3. Changes without classic training

| Method | Purpose |
|---|---|
| Model merging (SLERP, TIES, DARE, task arithmetic) | Combine models or task vectors |
| Adapter composition / mixture of LoRA experts | Combine or route between adapters |
| Activation steering | Change behavior at inference |
| ROME / MEMIT | Targeted factual edits |
| Ablation / layer surgery | Remove or rearrange components |
| Model expansion | Add layers or capacity, then train |
| Hypernetworks | Generate weight deltas |
| Test-time training | Adapt during inference |
| RAG / GraphRAG / prompting / in-context learning | Change behavior without touching weights |

## Goal → method

| Goal | Start with |
|---|---|
| Your writing style | QLoRA + SFT |
| A custom personality | SFT + DPO |
| New domain knowledge | RAG first; CPT + SFT if retrieval isn't enough |
| A new language (e.g. Finnish) | Language-adaptive CPT + SFT |
| Better coding | SFT + GRPO with tests as reward |
| Math reasoning | GRPO + verifiable rewards |
| An agent | Tool-use SFT + RL |
| A small specialist | Distillation from an open teacher |
| Limited memory | QLoRA |
| Combining specialists | Adapter composition or merging |
| Fixing specific facts | RAG or knowledge editing |

## How the stages stack

Base model → *(optional)* knowledge adaptation → SFT → preference tuning and/or RL → quantize and deploy. You can choose full, LoRA or QLoRA at every stage, and you rarely need all of them.

## Frameworks

Unsloth (memory-efficient LoRA/QLoRA on CUDA), PEFT + TRL (methods and objectives), Axolotl (config-driven), LLaMA-Factory, torchtune, MLX-LM (Apple Silicon), DeepSpeed and Megatron-LM (large scale), OpenRLHF / verl / SkyRL (RL), MergeKit (merging).
