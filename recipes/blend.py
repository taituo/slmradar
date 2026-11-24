#!/usr/bin/env python3
"""Linear blend of two fused models that share the same base: out = (1-t)*A + t*B.

  mlx_lm.fuse --model ./base --adapter-path ./adapters/a --save-path ./fused-a --dequantize
  mlx_lm.fuse --model ./base --adapter-path ./adapters/b --save-path ./fused-b --dequantize
  python blend.py ./fused-a ./fused-b ./blend-0.5 --t 0.5

Both inputs must be de-quantized (float weights): quantized integers can't be averaged.
Check `mlx_lm.fuse --help` for the exact de-quantize flag in your version.
Written against mlx.core (load / save_safetensors). Not run in this repo's CI.
"""
import argparse
import shutil
from pathlib import Path

import mlx.core as mx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a"); ap.add_argument("b"); ap.add_argument("out")
    ap.add_argument("--t", type=float, default=0.5)
    a = ap.parse_args()
    A, B, O = Path(a.a), Path(a.b), Path(a.out)
    O.mkdir(parents=True, exist_ok=True)
    for f in A.iterdir():  # copy config, tokenizer, index files
        if f.suffix != ".safetensors" and f.is_file():
            shutil.copy(f, O / f.name)
    for shard in sorted(A.glob("*.safetensors")):
        wa, wb = mx.load(str(shard)), mx.load(str(B / shard.name))
        out = {}
        for k, va in wa.items():
            vb = wb[k]
            if mx.issubdtype(va.dtype, mx.floating):
                out[k] = ((1 - a.t) * va.astype(mx.float32) + a.t * vb.astype(mx.float32)).astype(va.dtype)
            else:
                out[k] = va  # non-float tensors: keep A
        mx.save_safetensors(str(O / shard.name), out, metadata={"format": "mlx"})
        print("blended", shard.name)


if __name__ == "__main__":
    main()
