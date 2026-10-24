---
title: Harness Engineering
type: concept
updated: 2026-10-03
confidence: medium
---
{% raw %}
## Summary

Harness engineering is the discipline of building everything around an LLM that
makes a coding agent dependable: the tools it can call plus the rules and
controls that guide and check its work. The core framing is "Agent = Model +
Harness." <mark>A well-built harness has two goals — raise the probability the agent
gets it right the first time (feedforward) and self-correct mistakes before they
reach human review (feedback) — which together reduce review toil, raise quality,
and waste fewer tokens.</mark>

## Definition

- **Agent = Model + Harness** — a coding agent is the model plus the harness of tools and rules/controls around it; the harness is "the AI agent except the model itself."
- **Harness (anatomy view)** — "every piece of code, configuration, and execution logic that isn't the model itself"; it turns a raw model into an agent by adding state, tool execution, feedback loops, and enforceable constraints. Core components: a filesystem workspace (read data, code, docs), Git versioning (track work, roll back, branch), code execution, context injection, and up-to-date knowledge tools (web search + MCP).
- **Feedforward controls** — guides that help the agent get things right the first time (prevention-oriented, applied before or while the agent acts).
- **Feedback controls** — sensors that catch and fix mistakes early (detection-oriented, applied after the agent acts).
- **Computational controls** — fast, rule-based, deterministic checks.
- **Inferential controls** — more thoughtful, flexible, judgment-based checks.
- **Human steering loop** — the human steers the agent by iterating on the harness: whenever an issue recurs, improve the feedforward/feedback controls to make it less probable or prevent it.
- **Rule** — an engineering guideline for the AI that acts like a team's development policy: its core purpose is not to make the AI smarter but to prevent it from repeatedly making basic, avoidable mistakes (sets the baseline, enforces consistency, but cannot guarantee execution on its own).
- **Skill** — a Standard Operating Procedure (SOP) for the AI: "here is exactly how to do it," telling the AI not to improvise or re-derive the process from scratch.
- **Maturity ladder** — a five-level model of how much harness you need, from throwaway experimentation to full autonomy (see below).

### Maturity ladder (five levels)

- **Level 0 — throwaway scripts / experimentation** — no concern for maintainability; just test whether an idea works now.
- **Level 1 — Constraints** — for solo developers and MVPs; AI speeds up boilerplate while the human remains the primary architect and reviewer of every line.
- **Level 2 — Feedback Loops** — the sweet spot for production startups and small teams; AI becomes a reliable junior partner because the system (tests, CI, linters) catches errors, not just the human's eyes.
- **Level 3 — Specialization** — for complex, multi-service systems; AI roles are split (planner vs. coder vs. tester) to manage context and prevent regression.
- **Level 4 — Autonomy** — for platform-scale / AI-native organizations; the system self-heals and refactors continuously without human intervention.

## Why it matters

It moves reliability from the model (which cannot be fully controlled) to the
system around it (which can be engineered and tested). The two goals —
first-time-right and early self-correction — directly reduce human review toil,
raise system quality, and cut wasted tokens/cost. It also reframes the human's
job from writing code to engineering constraints, so trust in an agent becomes a
property of the harness rather than blind faith in the model.

## Source-backed content

- **Source-backed:** A coding agent is made of a model plus a harness of tools and rules that guide and check the agent's work.
- **Source-backed:** The harness uses feedforward guides (get it right the first time) and feedback sensors (catch and fix mistakes early).
- **Source-backed:** Controls come in two kinds — computational (fast, rule-based) and inferential (more thoughtful, flexible).
- **Source-backed:** A well-built harness raises first-time-right probability and self-corrects issues before human eyes, reducing review toil and increasing system quality while wasting fewer tokens.
- **Source-backed:** Humans improve the harness by testing, adding rules, and using AI to make it smarter and more reliable over time.
- **Source-backed:** The human's job is to steer the agent by iterating on the harness; recurring issues should become improved feedforward/feedback controls.
- **Source-backed:** Not all projects are equally controllable, but good harness design builds trust and focuses human effort where it matters.
- **Source-backed:** Harness engineering is graded on a five-level maturity ladder — Level 0 (throwaway scripts/experimentation), Level 1 (Constraints, solo/MVP), Level 2 (Feedback Loops, production startups/small teams), Level 3 (Specialization, complex multi-service), Level 4 (Autonomy, platform-scale self-healing).
- **Source-backed:** At Level 1 the human remains the primary architect and reviewer of every line; at Level 2 the system (tests, CI, linters) catches errors; at Level 3 AI roles split (planner/coder/tester) to manage context and prevent regression; at Level 4 the system self-heals and refactors without human intervention.
- **Source-backed:** A Rule is a set of engineering guidelines whose core purpose is to prevent the AI from repeatedly making basic, avoidable mistakes — it functions like a team's development policy, eliminating chaos and enforcing consistency.
- **Source-backed:** Rules are foundational but insufficient: they set a baseline but cannot guarantee execution, so the rest of the harness framework is needed.
- **Source-backed:** A Skill is a Standard Operating Procedure (SOP) that tells the AI "don't improvise — follow these exact steps"; if a Rule says "this must be done," a Skill says "here is exactly how to do it."
- **Source-backed:** A harness is "every piece of code, configuration, and execution logic that isn't the model itself"; a raw model becomes an agent when the harness adds state, tool execution, feedback loops, and enforceable constraints.
- **Source-backed:** Harness components include a filesystem workspace (read data, code, documentation), Git (versioning, rollback, branching), code execution, context injection, and web search/MCP tools for up-to-date knowledge.
- **Source-backed:** Models have no knowledge beyond their weights and current context, so — short of editing weights — context injection is the only way to add knowledge.
- **Source-backed:** As models improve, harness features may move into the model, but harness engineering will likely remain useful, much as prompt engineering remains valuable today.

## Practical implications

- **Inference:** Feedforward ≈ prevention (deterministic guides, instructions, scaffolding); feedback ≈ detection (tests, validators, reviewers).
- **Inference:** Computational controls likely map to deterministic checks (tests, linters, type/schema checks) and inferential controls to judgment checks (LLM-as-reviewer, heuristic review) — the source names the categories but the captured text does not list concrete examples.
- **Inference:** The steering loop is a compounding improvement process: each recurring failure becomes a durable control, so the harness gets stronger with use.
- **Inference:** Harness quality has a direct cost dimension ("fewer wasted tokens"), making it a business concern as much as an engineering one.
- **Inference:** Rules map to the feedforward/prevention controls and Skills to the reusable how-to procedures of Böckeler's framing; Kusnadi's maturity ladder lets a team diagnose where it sits (Level 0–4) and what capability to add next — climbing toward Autonomy is a governance decision as much as a technical one.
- **Inference:** Trivedy's "anatomy" is the concrete component inventory (workspace, Git, execution, context, retrieval) on which the feedforward/feedback controls operate; the two framings are complementary — one describes what the harness is made of, the other how it is steered.

## Evidence and provenance

- [Harness Engineering for Coding Agent Users](https://martinfowler.com/articles/harness-engineering.html)
- [How to Implement Harness Engineering](https://levelup.gitconnected.com/how-to-implement-harness-engineering-fe70c558bb7f)
- [The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)

## Related pages

- Harness-Engineering-for-Coding-Agent-Users-Summary
- How-to-Implement-Harness-Engineering-Summary
- Agent-Harness-Engineering-Part-1-Summary
- Agent-Loop-Engineering-Part-2-Summary
- The-Anatomy-of-an-Agent-Harness-Summary
- Agent-Memory
- AI Agents

## Open questions

- Concrete examples distinguishing computational vs inferential controls are shown in remote diagrams not captured as text in this source.
- How "using AI to improve the harness" is operationalized (auto-generating rules, LLM-based review) is not detailed in the captured highlights.
{% endraw %}
