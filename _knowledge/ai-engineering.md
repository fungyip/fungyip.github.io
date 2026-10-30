---
title: AI Engineering
type: concept
updated: 2026-10-18
confidence: medium
---
{% raw %}
## Summary

AI engineering is the discipline of not just building software but *shaping the
build*: actively deciding what to build next and driving it to completion as
traditional product-manager, designer, and developer roles blur under modern AI
tooling. It spans four meta-skills — driving the build loop, making product
decisions, communicating and leading, and high-agency ownership — plus six
technical skill areas (the "skills map in detail"): LLM foundations, grounding
models with data, building agentic systems, evaluation-driven development,
operating in production, and machine learning foundations.

## Definition

- **Driving the build loop** — repeatedly moving a project forward through the
  write-code → get-feedback → decide-next-step cycle with a bias for action and
  <mark>high velocity</mark>; choosing whether the next step is a quick prototype, an MVP,
  added features, an enterprise-grade system, or a technical experiment.
- **Making product decisions** — grounded in user empathy, honed through
  interviews, surveys, A/B tests, and behavioral analysis; weighing product
  vision, project stage, technical feasibility, risks, effort, and budget.
- **Communicating and leading** — the collaboration and leadership dimension of
  shaping the build (named but not elaborated in the captured source).
- **High-agency ownership** — identifying opportunities, prioritizing what
  matters, acting on them, and continuously investing in skills and workflows.

### Technical skill map (six areas)

- **LLM foundations** — how models tokenize input and generate output, so you
  know when to count on them and when they fail; when to use a multimodal model;
  context-window tradeoffs; and reasoning about cache hits, knowledge cutoff,
  reasoning effort, sampling parameters, and special features such as tool
  calling.
- **Grounding models with data** — giving an LLM relevant context: RAG with
  vector search was an early approach, but techniques have broadened to include
  choosing what to put in the prompt vs. let the model retrieve via tools, and
  which representation fits the data (vector index, knowledge graph, or a
  semantic layer over structured data); turning documents into LLM-ready inputs
  and engineering pipelines that keep data clean and fresh.
- **Building agentic systems** — systems range from predefined workflows to an
  agent harness that lets an LLM repeatedly decide its own next step; choosing
  the architecture (what to chain vs. parallelize, when to use code vs. an LLM),
  engineering the workflow/harness with fallbacks, deciding which tools the
  model can call (MCP, CLI, sandbox), the memory architecture, how to manage
  context over long sessions, and when multi-agent orchestration beats a single
  agent; then hardening prototypes with guardrails, adversarial-input handling,
  data-exfiltration protection, and governance.
- **Evaluation-driven development** — building good evals is a deep technical
  skill: inspecting traces and outputs, exploratory data analysis, combining
  that with product/business insight, and choosing between deterministic
  (code-based) evals, LLM-as-a-judge, and human-in-the-loop, plus evaluating
  your evals to keep evolving them.
- **Operating in production** — (named in the map but not elaborated in the
  captured highlights).
- **Machine learning foundations** — (named in the map but not elaborated in the
  captured highlights).

### Four-key-skills summary (The Batch)

Andrew Ng's *The Batch* (issue 366) distills AI engineering into four
most-important skills — a compact hiring/learning rubric that cross-cuts the
four meta-skills and six technical areas above:

- **Building and deploying AI applications** — knowing the building blocks
  (LLMs, context engineering, RAG, agentic workflows, machine/deep learning)
  and using statistical techniques to measure, steer, and govern systems so
  unpredictable outputs behave more predictably.
- **Software engineering fundamentals** — the tradeoff language (cost,
  scalability, reliability, speed, security, privacy) that lets you steer a
  coding agent precisely, because engineering software is always a tradeoff.
- **Using coding agents** — knowing an agent's limits and how to steer it to
  save time and build better software.
- **Shaping the build** — deciding what to build next and when to prioritize
  speed vs. quality against business goals (the same loop-driving framing as
  the meta-skills above).

## Why it matters

AI engineering shifts the source of leverage from coding output to
decision-making: when one engineer can produce far more with AI tools, the
binding constraint moves to *what* to build and *when* to ship. The role-blurring
accelerates development because an engineer no longer waits on a PM or designer
to specify each step. The six technical areas name the concrete competencies an
AI engineer must hold to build reliable systems around a model whose output is
inherently unpredictable.

## Source-backed content

- **Source-backed:** Skilled AI engineers actively shape the build rather than merely implementing a spec.
- **Source-backed:** PM/designer/developer roles are blurring, and this vastly accelerates software development.
- **Source-backed:** The four defining meta-skills are driving the build loop, making product decisions, communicating and leading, and high-agency ownership.
- **Source-backed:** Most software is built via a write-code / get-feedback / decide-next-step loop that the skilled engineer drives at high velocity.
- **Source-backed:** Product decisions are rooted in user empathy honed through methods from 2–3-user interviews up to analyzing millions of users' behavior.
- **Source-backed:** High-agency engineers identify opportunities, prioritize, act, and keep learning (tracking the technology frontier, adopting new tools, tuning workflows).
- **Source-backed:** The key difference between AI and non-AI software is that the former's output is less predictable — you don't know in advance what an LLM will output or what a supervised model will predict.
- **Source-backed:** Skilled AI engineers repeatedly build, examine, and decide what to try next, taking steps highly influenced by intermediate results.
- **Source-backed:** The detailed skills map has six areas: LLM foundations, grounding models with data, building agentic systems, evaluation-driven development, operating in production, and machine learning foundations.
- **Source-backed:** Grounding techniques have grown well beyond early RAG vector search; you must choose prompt-vs-tool retrieval and the right representation (vector index, knowledge graph, or semantic layer).
- **Source-backed:** Agentic systems span predefined workflows to self-directing agent harnesses; designing the agent loop means deciding tools (MCP/CLI/sandbox), memory, context management, and single- vs. multi-agent orchestration, then hardening with guardrails, adversarial-input handling, and data-exfiltration protection.
- **Source-backed:** Anthropic formalizes agentic systems as a spectrum — workflows (LLMs and tools orchestrated through predefined code paths) versus agents (LLMs that dynamically direct their own process and tool use) — and recommends starting with simple prompts, optimizing with evaluation, and adding multi-step agentic machinery only when simpler solutions fall short, with a carefully documented and tested agent-computer interface (ACI).
- **Source-backed:** Building good evals means combining trace/output inspection, exploratory analysis, and product/business insight, and choosing deterministic, LLM-as-a-judge, or human-in-the-loop approaches.
- **Source-backed:** The four most important AI engineering skills (per The Batch) are building/deploying AI applications, software engineering fundamentals, using coding agents, and shaping the build.
- **Source-backed:** Engineering software requires tradeoffs among cost, scalability, reliability, speed, and more (security and privacy add further complexity); software engineering fundamentals let you steer coding agents using the precise language of software engineering.
- **Source-backed:** Skilled AI engineers understand business goals to decide when to build quickly vs. take more time for quality.

## Practical implications

- **Inference:** The four meta-skills form a self-assessment and hiring rubric: loop-driving, product judgment, communication/leadership, and agency are separable capabilities.
- **Inference:** The six technical areas are a curriculum and gap-analysis checklist for building a production AI engineer; "operating in production" and "machine learning foundations" are the two areas this source names but does not elaborate, so they remain the least-defined parts of the map.
- **Inference:** For team design, the blurring of roles suggests evaluating people on end-to-end "shape-and-ship" ability rather than a fixed developer/PM split.

## Evidence and provenance

- [Subscribe to the Batch](https://www.deeplearning.ai/the-batch/issue-366)
- [Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents)

## Related pages

- Driving-the-Build-Is-Now-an-Essential-AI-Engineering-Skill-Summary
- The-AI-Engineering-Skills-Map-in-Detail-Summary
- Subscribe-to-the-Batch-AI-Engineering-Skills-Map-Summary
- Building-Effective-AI-Agents-Summary

## Open questions

- How "communicating and leading" and "high-agency ownership" are operationalized is named but not detailed in the "Driving the Build" source.
- "Operating in production" and "machine learning foundations" are listed in the skills map but not elaborated in the captured highlights; they remain to be filled in from the full course/series.
{% endraw %}
