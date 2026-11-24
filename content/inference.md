---
title: Inference
order: 8
sub: Serving options, from laptop to GPU fleet.
---


| Engine | Use when |
|---|---|
| **vLLM** | Default for GPU serving. Broadest model support, multi-LoRA, OpenAI-compatible API. |
| **SGLang** | Agentic / multi-turn workloads with shared prefixes (RadixAttention prefix cache). Often gets new architectures early. |
| **llama.cpp** | Local GGUF, consumer GPUs, CPU fallback. |
| **MLX-LM** | Apple Silicon (dev laptop experiments). |
| **TensorRT-LLM / NVIDIA Dynamo** | Max throughput on NVIDIA datacenter GPUs, disaggregated prefill/decode. |

## Pattern: one base, many adapters

Serve one base model with **multi-LoRA** (vLLM or SGLang) and hot-swap per-task adapters. This fits a fleet of small specialists better than one model per task.

## Checklist before picking a model

- Engine supports the architecture (hybrid / looped / MoE models may need a recent or nightly build, sometimes `trust_remote_code`).
- Quantized checkpoint exists for your target (FP8, NVFP4, AWQ, GGUF).
- Tool-call and reasoning parsers exist for the model's chat template.
- Benchmark on **your** prompts and concurrency; published engine benchmarks rarely transfer.
