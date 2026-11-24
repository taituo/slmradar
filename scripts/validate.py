#!/usr/bin/env python3
"""Validate docs/_data/models.yml. Usage: python3 scripts/validate.py"""
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = ["id", "name", "publisher", "hf", "params_total", "arch", "license", "status", "checked"]
ARCH = {"dense", "moe", "looped", "hybrid"}
STATUS = {"verified", "partial"}


def main() -> int:
    models = yaml.safe_load((ROOT / "docs/_data/models.yml").read_text())
    errors, seen = [], set()
    for i, m in enumerate(models):
        tag = m.get("id", f"#{i}")
        for f in REQUIRED:
            if m.get(f) in (None, ""):
                errors.append(f"{tag}: missing {f}")
        if m.get("id") in seen:
            errors.append(f"{tag}: duplicate id")
        seen.add(m.get("id"))
        if m.get("arch") not in ARCH:
            errors.append(f"{tag}: arch must be one of {sorted(ARCH)}")
        if m.get("status") not in STATUS:
            errors.append(f"{tag}: status must be one of {sorted(STATUS)} (unverified goes to watchlist.yml)")
        p = m.get("params_total")
        if isinstance(p, (int, float)) and not 2.5 <= p <= 36:
            errors.append(f"{tag}: params_total {p}B outside 3–35B scope")
        if m.get("status") == "verified" and not m.get("sources"):
            errors.append(f"{tag}: verified entries need at least one source")
    yaml.safe_load((ROOT / "docs/_data/watchlist.yml").read_text())
    for e in errors:
        print("ERROR", e)
    print(f"{len(models)} models, {len(errors)} errors")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
