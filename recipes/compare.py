#!/usr/bin/env python3
"""Side-by-side probe comparison: base model vs. base + adapter (or another model).

  python compare.py --model ./q9b --adapter ./adapters/run1 --probes data/probes.jsonl > report.md

Written against the mlx-lm Python API (load / generate). Not run in this repo's CI.
"""
import argparse
import json

from mlx_lm import generate, load


def run(model_path, adapter, probes, max_tokens):
    model, tok = load(model_path, adapter_path=adapter)
    out = {}
    for p in probes:
        prompt = tok.apply_chat_template(p["messages"], add_generation_prompt=True, tokenize=False)
        out[p["id"]] = generate(model, tok, prompt=prompt, max_tokens=max_tokens, verbose=False).strip()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--adapter", help="adapter dir for the B side (A side = plain model)")
    ap.add_argument("--model-b", help="compare against another model instead of an adapter")
    ap.add_argument("--probes", default="data/probes.jsonl")
    ap.add_argument("--max-tokens", type=int, default=200)
    a = ap.parse_args()
    probes = [json.loads(l) for l in open(a.probes) if l.strip()]
    left = run(a.model, None, probes, a.max_tokens)
    right = run(a.model_b or a.model, None if a.model_b else a.adapter, probes, a.max_tokens)
    print(f"# Probe diff\n\nA: `{a.model}`  \nB: `{a.model_b or (a.model + ' + ' + str(a.adapter))}`\n")
    for p in probes:
        same = "same" if left[p["id"]] == right[p["id"]] else "changed"
        print(f"## {p['id']} ({p.get('kind', '')}, {same})\n\n> {p['messages'][-1]['content']}\n")
        print(f"**A**\n\n{left[p['id']]}\n\n**B**\n\n{right[p['id']]}\n\n---\n")


if __name__ == "__main__":
    main()
