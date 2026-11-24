---
title: Licensing
nav_order: 6
---

# Licensing

Two separate questions:

1. **Can I modify and ship these weights?** → the model's license.
2. **Can I train on this data?** → where the training data came from (including model outputs).

## 1. Weight licenses

**Apache-2.0 / MIT** allow commercial use, fine-tuning, weight editing, merging, keeping derivatives private, and selling derivatives. When redistributing: include the license, keep notices, mark modified files. Apache-2.0 also carries a patent grant.

Always check the **exact checkpoint**, not the family name. For example, older Llama and Gemma generations use custom licenses, while Gemma 4 and Meta's Muse Glimmer are Apache-2.0. See the [watchlist](watchlist.html#license-caution).

## 2. Teacher data and API outputs

Outputs from proprietary APIs often come with terms that restrict using them to train competing models, even when you own the outputs. Using those outputs for SFT or distillation into an open model is a **contract question, not a model-license question**. Get written confirmation from the provider before you do it.

Cleaner paths:
- Use an **Apache/MIT open-weight teacher** you self-host (e.g. a 27–33B model from the catalog).
- Train on **your own data**: user requests, tool results, human corrections, task outcomes.
- Use a provider's **official** distillation/customization product within its stated scope.

Track provenance per training record (`source: human | tool | model:<name>`), so you can filter later.

*Not legal advice.*
