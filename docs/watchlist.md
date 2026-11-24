---
title: Watchlist
nav_order: 9
---

{% include grain_hero.html title="Watchlist" sub="Unverified claims and license caution" height=150 %}

Generated from [`docs/_data/watchlist.yml`](https://github.com/taituo/slmradar/blob/main/docs/_data/watchlist.yml).

## Unverified

Claims seen somewhere (often in AI chat answers) but not confirmed from a first-party source. **Don't build on these.**

| Model | Why it's here | Checked |
|---|---|---|
{% for m in site.data.watchlist.unverified %}| {{ m.name }} | {{ m.reason }} | {{ m.checked }} |
{% endfor %}

## License caution

| Family | License | Note |
|---|---|---|
{% for f in site.data.watchlist.license_caution %}| {{ f.family }} | {{ f.license }} | {{ f.note }} |
{% endfor %}
