# slmradar

Curated catalog of **open-weight models (3B–35B)** that are realistic to fine-tune and serve on **cloud GPUs** or **12–32 GB NVIDIA cards**.

📖 Docs: https://taituo.github.io/slmradar/

## Layout

```
docs/                 GitHub Pages site (Jekyll, just-the-docs)
  _data/models.yml    ← the catalog: single source of truth
  _data/watchlist.yml ← unverified claims + license-caution families
scripts/validate.py   schema/scope check (runs in CI)
src/                  reserved for company tooling (training, evals, serving glue)
```

## Adding or updating a model

1. Check the **official** Hugging Face repo / announcement: license, params, context, release date.
2. Add or edit the entry in `docs/_data/models.yml` with `status`, `checked` and `sources`.
3. Not confirmed from a first-party source? Put it in `watchlist.yml` instead.
4. `pip install pyyaml && python3 scripts/validate.py`

## Enable Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / `/docs`.

## Preview locally

```
cd docs
bundle init && bundle add github-pages --group jekyll_plugins
bundle exec jekyll serve
```
