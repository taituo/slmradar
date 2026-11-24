---
title: Catalog
nav_order: 2
---

# Catalog

Generated from [`docs/_data/models.yml`](https://github.com/taituo/slmradar/blob/main/docs/_data/models.yml). Edit the YAML, not this page.

VRAM columns are rough GB estimates — see [Hardware](hardware.html) for assumptions. `—` = needs more than 32 GB or not estimated (use cloud).

<table>
  <thead>
    <tr>
      <th>Model</th><th>Params</th><th>Arch</th><th>Modalities</th><th>Context</th><th>License</th><th>Released</th>
      <th>QLoRA</th><th>LoRA bf16</th><th>Infer 4-bit</th><th>Status</th>
    </tr>
  </thead>
  <tbody>
  {% for m in site.data.models %}
    <tr>
      <td><a href="{{ m.hf }}">{{ m.name }}</a>{% if m.base %} · <a href="{{ m.base }}">base</a>{% endif %}<br><small>{{ m.publisher }}</small></td>
      <td>{{ m.params_total }}B{% if m.params_active %} / {{ m.params_active }}B act.{% endif %}</td>
      <td>{{ m.arch }}</td>
      <td>{{ m.modalities }}</td>
      <td>{{ m.context | default: "?" }}</td>
      <td>{{ m.license }}</td>
      <td>{{ m.released | default: "?" }}</td>
      <td>{% if m.vram_qlora %}{{ m.vram_qlora }}{% else %}—{% endif %}</td>
      <td>{% if m.vram_lora and m.vram_lora <= 32 %}{{ m.vram_lora }}{% else %}—{% endif %}</td>
      <td>{% if m.vram_infer %}{{ m.vram_infer }}{% else %}—{% endif %}</td>
      <td>{{ m.status }}<br><small>{{ m.checked }}</small></td>
    </tr>
  {% endfor %}
  </tbody>
</table>

## Notes

{% for m in site.data.models %}{% if m.notes %}
- **{{ m.name }}** — {{ m.notes }}{% endif %}{% endfor %}

## Status legend

- **verified** — license and size checked against the official repo or announcement.
- **partial** — official repo exists; some fields (date, license text, context) still to confirm.
- **unverified** — lives on the [watchlist](watchlist.html), not here.
