#!/usr/bin/env python3
"""Activation steering sketch for mlx-lm models with a `model.model.layers` list
(Llama / Qwen3 / Mistral style). Hybrid and looped architectures may differ.

  python steer.py --model ./q4b --layer 14 --alpha 6 \
      --pos "Write formally: thank the team." --neg "Write casually: thank the team." \
      --prompt "Thank the team for shipping the release."

Not run in this repo's CI: treat it as a starting point.
"""
import argparse

import mlx.core as mx
import mlx.nn as nn
from mlx_lm import generate, load


class Tap(nn.Module):
    """Wraps a decoder layer: records its output, optionally adds a vector."""

    def __init__(self, inner):
        super().__init__()
        self.inner, self.vec, self.alpha, self.record = inner, None, 0.0, None

    def __call__(self, x, *args, **kwargs):
        h = self.inner(x, *args, **kwargs)
        if self.record is not None:
            self.record.append(h.mean(axis=1))  # mean over tokens
        if self.vec is not None and self.alpha:
            h = h + self.alpha * self.vec
        return h


def mean_act(model, tok, tap, texts):
    tap.record = []
    for t in texts:
        ids = tok.apply_chat_template([{"role": "user", "content": t}], add_generation_prompt=True)
        model(mx.array(ids)[None])
    v = mx.concatenate(tap.record, axis=0).mean(axis=0)
    tap.record = None
    return v


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--layer", type=int, default=12)
    ap.add_argument("--alpha", type=float, default=4.0)
    ap.add_argument("--pos", action="append", required=True)
    ap.add_argument("--neg", action="append", required=True)
    ap.add_argument("--prompt", required=True)
    a = ap.parse_args()
    model, tok = load(a.model)
    layers = model.model.layers
    tap = Tap(layers[a.layer])
    layers[a.layer] = tap
    v = mean_act(model, tok, tap, a.pos) - mean_act(model, tok, tap, a.neg)
    tap.vec = v / (mx.linalg.norm(v) + 1e-6)
    prompt = tok.apply_chat_template([{"role": "user", "content": a.prompt}], add_generation_prompt=True, tokenize=False)
    for alpha in (0.0, a.alpha, -a.alpha):
        tap.alpha = alpha
        print(f"--- alpha={alpha}\n" + generate(model, tok, prompt=prompt, max_tokens=120, verbose=False).strip() + "\n")


if __name__ == "__main__":
    main()
