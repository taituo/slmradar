# slmradar

Curated catalog of **open-weight models (3B–35B)** for hands-on tuning and modification: primarily on a **48 GB M5 Pro MacBook (MLX)**, then on **12–32 GB NVIDIA cards** or **cloud GPUs**.

📖 Site: https://taituo.github.io/slmradar/

## Layout

```
data/models.yml       ← the catalog: single source of truth
data/watchlist.yml    unverified claims + license-caution families
data/methods.yml      effort/payoff estimates (Tinkering chart)
data/hardware.yml     memory budgets (Hardware chart)
content/*.md          articles (front matter: title, sub, order)
templates/page.html   page shell
assets/               theme CSS, grain shader, charts/tables (plain JS + SVG, no deps)
scripts/build.py      content + data → _site/
scripts/validate.py   schema/scope check
src/                  reserved for company tooling
```

Charts and tables are filled from the data: put `<div data-viz="fit-scatter"></div>` in any article. Available: `stats`, `fit-scatter`, `fit-matrix`, `timeline`, `quadrant`, `budgets`, `catalog`, `notes`, `watch-unverified`, `watch-license`.

## Build locally

```
pip install markdown pyyaml
python3 scripts/validate.py && python3 scripts/build.py
open _site/index.html
```

## Deploy

GitHub Actions builds and deploys on every push to `main`. One-time setup: **Settings → Pages → Source: GitHub Actions**.

## Adding or updating a model

1. Check the **official** Hugging Face repo / announcement: license, params, context, release date.
2. Edit `data/models.yml` with `status`, `checked` and `sources`.
3. Not confirmed from a first-party source? Put it in `data/watchlist.yml` instead.
