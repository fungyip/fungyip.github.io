---
title: "Knowledge"
permalink: /knowledge/
layout: single
author_profile: true
---

Notes compiled from my reading on agentic AI, knowledge management and data architecture. Each page links back to its original sources.

{% assign items = site.knowledge | sort: "title" %}
{% if items.size == 0 %}
No pages published yet.
{% else %}
{% for p in items %}
- [{{ p.title }}]({{ p.url | relative_url }}){% if p.type %} · {{ p.type }}{% endif %}{% if p.updated %} · updated {{ p.updated | date: "%Y-%m-%d" }}{% endif %}
{% endfor %}
{% endif %}
