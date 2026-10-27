---
title: "Knowledge"
permalink: /knowledge/
layout: single
author_profile: true
analytics_page_type: knowledge_index
analytics_content_id: knowledge
---

Notes compiled from my reading on agentic AI, knowledge management and data architecture. Each page links back to its original sources.

{% assign items = site.knowledge | sort: "title" %}
{% if items.size == 0 %}
No pages published yet.
{% else %}
{% for p in items %}
{% assign target_id = p.analytics_content_id | default: p.slug | replace: "-", "_" %}
- <a href="{{ p.url | relative_url }}" data-analytics-event="portfolio_navigation" data-analytics-placement="knowledge_list" data-analytics-link-id="knowledge_{{ target_id | escape }}" data-analytics-target="{{ target_id | escape }}">{{ p.title | escape }}</a>{% if p.type %} · {{ p.type }}{% endif %}{% if p.updated %} · updated {{ p.updated | date: "%Y-%m-%d" }}{% endif %}
{% endfor %}
{% endif %}
