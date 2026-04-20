# Case Study: Jordan — AI-Powered Competitive Intelligence for a Custom Woodshop

---

## The Problem

A small custom woodworking business, Fox in the Sawdust, needed to stay competitive against larger regional players — companies like John Thomas Furniture and Modern Home Idaho — who have dedicated marketing teams and pricing analysts. The owner had no bandwidth to manually track competitor pricing, messaging shifts, or market positioning on a weekly basis. Decisions about what to charge, how to position products, and where to invest effort were driven by gut feel rather than data.

## The Approach

We built **Jordan**, a fully autonomous multi-agent intelligence pipeline that runs weekly research briefs on demand. Rather than a monolithic LLM prompt, the system decomposes competitive research into a 10-agent pipeline that collects, extracts, analyzes, strategizes, validates, and reports — end to end — from a single button click.

| Stage | Agent(s) | Role |
|-------|----------|------|
| Collection | `own_scout`, `comp_scout` | Crawl the owner's site and competitor sites for raw content |
| Extraction | `own_extractor`, `extractor`, `wood_expert` | Parse product listings, pricing, materials, and woodworking-specific details |
| Analysis | `site_analysis`, `analyst` | Evaluate site structure, messaging tone, and competitive positioning |
| Strategy | `recommender` | Generate prioritized, actionable recommendations with effort/impact tags |
| Validation | `guardrail` | Flag hallucinated claims, verify pricing math, enforce factual grounding |
| Output | `report_gen` | Compile a structured intelligence report with citations |

Each agent has its own system prompt, context cap, output schema, and rate limit. Agents run sequentially where dependent, and in parallel where independent (e.g., `extractor` and `wood_expert` run simultaneously). A sliding-window rate limiter and per-agent context cap system prevent token blowout and keep API costs predictable.

---

## The Agents

### 1. Own Scout — `own_scout`

**Model:** gpt-4o-mini · **Context Cap:** 50K · **LLM Calls:** None

The own scout is the only agent in the pipeline that makes zero LLM calls. It's a pure fetch-and-discover agent: it hits Jordan's homepage plus known category pages (`/dining-tables/`, `/dining-chairs/`, `/custom-projects/`), then uses regex to discover product URLs under `/store/`. The output is a raw inventory of the client's own web presence — page content and product URLs — which feeds directly into the extractor.

The design choice here was intentional. The client's own site doesn't need interpretation — it needs scraping. Spending tokens to "understand" your own product pages is waste. A fetch-and-regex approach is faster, cheaper, and deterministic.

### 2. Own Extractor — `own_extractor`

**Model:** gpt-5.4-mini · **Context Cap:** 50K · **LLM Calls:** 1

The own extractor receives the raw page content from the own scout and pulls out every unique product listing with its price. Its system prompt is deliberately narrow: *"You are a product listing extractor. You read website content and extract every unique product with its price. Respond with valid JSON only."*

It enforces deduplication, skips items under $50 (to filter out accessories and hardware), and outputs a clean `[{ name, price }]` array. If the LLM call fails for any reason, the agent falls back to a regex-based extraction — a pattern repeated nowhere else in the pipeline, because Jordan's own listings are the one dataset where the format is predictable enough for regex to work.

This is the foundation of the pricing engine. Every downstream pricing comparison starts from this list.

### 3. Competitor Scout — `comp_scout`

**Model:** gpt-4o-mini · **Context Cap:** 50K · **LLM Calls:** 3

The most complex agent in the pipeline. The competitor scout doesn't just fetch pages — it navigates competitor sites intelligently using a three-phase crawl:

1. **Phase 1 — Homepage fetch.** Grabs the competitor's root page and extracts all internal links.
2. **Phase 2 — Link picker.** An LLM call reviews the discovered URLs and picks up to 8 category or listing pages most likely to contain product links. The prompt: *"Given a list of URLs from a furniture website, pick the CATEGORY or LISTING pages most likely to contain links to individual products with prices."*
3. **Phase 3 — Product page picker.** A second LLM call reviews the pages found in Phase 2 and selects up to 12 individual product detail pages — the ones most likely to have actual dollar amounts.

After all three phases of fetching, a third LLM call performs the main competitive analysis. Its prompt is specific to the domain: *"You are a competitive intelligence scout for Fox in the Saw Dust... Your PRIMARY mission is to find competitor pricing — exact dollar amounts, price ranges, starting prices, or confirmation that a competitor hides all prices."*

Every signal must follow a strict format: `"[Competitor domain] [what they do] — [why that matters for Jordan]"`. The agent is explicitly told never to fabricate pricing data — if a competitor hides prices, that itself becomes a signal.

The three-call architecture is a deliberate trade-off: it costs more per competitor, but it means the agent actually finds product pages instead of guessing from homepage copy. On a typical run with 3 competitors, this agent accounts for ~9 LLM calls — the most of any single agent.

### 4. Extractor — `extractor`

**Model:** gpt-5.4-mini · **Context Cap:** 2M · **LLM Calls:** 1 · **Toggleable**

The extractor takes the raw signals from the competitor scout and normalizes them into a structured comparison schema. Where the scout produces free-text observations, the extractor produces rows in a table: `competitor`, `offerFocus`, `pricingVisibility` (Low/Medium/High), `trustSignal`, `messagingShift`, `sourceType`.

Its context cap is 2M — the largest tier — because it receives the full raw crawl data from the scout, which can be substantial when competitors have rich product pages. The system prompt is terse: *"You are a structured data extraction agent. You receive raw competitive intelligence signals and normalise them into a strict comparison schema."*

This normalization step is what makes downstream analysis possible. The analyst and recommender don't parse free text — they work with structured competitor profiles.

### 5. Wood Expert — `wood_expert`

**Model:** gpt-5.4-mini · **Context Cap:** 2M · **LLM Calls:** 1

This is the domain-specific agent — the one that knows the difference between white oak and red oak, understands why a mortise-and-tenon joint costs more than a pocket-screw joint, and can tell whether two tables from different makers are actually comparable.

The wood expert receives Jordan's product catalog (from the own extractor) and the competitor product listings (from the competitor scout) and identifies comparable products. Its prompt: *"You are a woodworking and furniture expert. You know wood species, joinery methods, furniture dimensions, and construction techniques. Your job is to compare Jordan's product catalog with competitor product listings and identify COMPARABLE products."*

Two products are considered comparable if they share the same category and similar characteristics. The output includes a similarity score (minimum 0.5), match reason, and category — which feeds directly into the pricing engine. Without this agent, the system would be comparing a $4,000 custom dining table to a $200 particle-board desk and calling it a pricing insight.

### 6. Site Analysis — `site_analysis`

**Model:** Global default · **Context Cap:** 50K · **LLM Calls:** 1 · **Toggleable**

The site analysis agent turns the lens inward. Given the client's own website content and the structured competitor benchmark, it performs a SWOT-style evaluation: `strengths[]`, `weaknesses[]`, `opportunities[]`, and a `summary`.

Its system prompt: *"You are an internal website analyst for a small craft and trade business. Given information about the client's own website and a structured competitor benchmark, you identify current strengths, clear weaknesses, and priority improvement opportunities. Be specific and honest — this analysis drives the recommendations."*

The "be specific and honest" instruction matters. Early iterations produced generic advice ("improve your SEO"). The current prompt forces the agent to ground every observation in the actual site content and competitor data it received. If Jordan's site already has a gallery but a competitor's gallery is above the fold while Jordan's is buried, that's a weakness — not a strength.

### 7. Analyst — `analyst`

**Model:** gpt-5.4-mini · **Context Cap:** 2M · **LLM Calls:** 1

The analyst is the strategic brain. It cross-references the structured competitor data (from the extractor) with the internal site analysis and produces exactly 5 insights — each with a `theme`, `evidence`, `impact`, `priority`, and `source` URL.

The key constraint in its prompt: *"Every insight tells Jordan what HIS site does, what competitors do differently, and what he should do about it. Never describe a competitor without also describing what Jordan currently does. Skip any theme where Jordan is already doing what competitors are doing."*

This comparative framing was a deliberate design decision. Early versions of the analyst would say things like "John Thomas Furniture has strong trust messaging." That's interesting but not actionable. The current version says "Jordan's site has no trust block on the homepage. John Thomas Furniture has a craftsmanship guarantee above the fold. Adding a similar block would address this gap." Same data, completely different utility.

Priorities must be distributed — the agent can't mark everything as High. This prevents the action queue from becoming a wall of equal-urgency items.

### 8. Recommender — `recommender`

**Model:** gpt-5.4-mini · **Context Cap:** 2M · **LLM Calls:** 1

The recommender turns insights into specific, approval-ready actions. It receives the analyst's insights, the extractor's competitor data, and the original input context, then produces exactly 9 actions: 3 UX improvements, 3 pricing recommendations, and 3 quoting workflow changes.

Every recommendation must start with hedged language: *"Suggest testing:"*, *"Consider adding:"*, or *"Review whether:"*. This isn't timidity — it's a design constraint that prevents the system from generating directives that sound like commands. The business owner approves actions; the system suggests them.

Pricing recommendations are required to reference Jordan's actual dollar figures — e.g., *"Suggest testing: raising the Farmhouse Dining Table from $1,757 to $1,895, since comparable tables from John Thomas start at $2,100."* This grounds every pricing suggestion in real data rather than abstract percentages.

Each action includes `impact` (High/Medium/Low), `effort` (High/Medium/Low), `owner` (Website/Content), `category` (ux/pricing/quoting), `rationale`, and a `source` URL. The action queue in the UI surfaces all of this as an approvable card with tags.

### 9. Guardrail — `guardrail`

**Model:** gpt-5.4-mini · **Context Cap:** 2M · **LLM Calls:** 1 · **Toggleable**

The guardrail is the final validation gate before report generation. It receives the complete output of all preceding agents and checks for policy violations.

The first pass is regex-based — four patterns that catch the most common LLM overstatements:
- `/guarantee[sd]?\s+\d+\s*%/i` — percentage guarantees
- `/will\s+definitely\s+(increase|improve|convert)/i` — certainty claims
- `/always\s+works/i` — absolute claims
- `/proven\s+to\s+(double|triple|increase)/i` — unverified proof claims

If any action text matches these patterns, it's flagged before the LLM even sees it.

The second pass is an LLM review against the full policy constraints: JSON format preserved, context budgets enforced, recommendations framed as suggestions (not commands), no unsourced pricing claims, and human approval required for all actions.

The output is binary: `"passed"` or `"review-needed"`. If any claims are blocked, the guardrail reports them with specific flags, and the report generator includes the guardrail status in its output. The business owner sees exactly what was flagged and why.

### 10. Report Generator — `report_gen`

**Model:** gpt-5.4-mini · **Context Cap:** 50K · **LLM Calls:** 1

The final agent synthesizes everything — approved actions, strategic insights, site analysis, competitor overview, and guardrail status — into a polished weekly intelligence report.

Its system prompt: *"You are a senior strategist writing a polished weekly competitive intelligence report for a small business owner. The report should be clear, direct, and immediately useful — no filler. The client is Jordan Tait, owner of Fox in the Saw Dust, a custom woodworking business in Rexburg, Idaho."*

The output is structured as `reportTitle`, `executiveSummary`, `strategicContext`, and `nextSteps[]` (top 3 priority actions). The report is rendered in the dashboard as a multi-page document with cover, sections, insight cards, action rows, and guardrail status — all styled with the dark woodshop theme.

The context cap here is intentionally lower (50K vs. 2M for the analysts) because the report agent should be working with already-distilled insights, not re-processing raw data. This is also the one area flagged for improvement — a dedicated summarization pass before report generation would further reduce token cost.

---

## Pipeline Architecture

```
own_scout ──→ own_extractor ──→ comp_scout ──→ extractor ──┬──→ site_analysis ──→ analyst ──→ recommender ──→ guardrail ──→ report_gen
                                                            └──→ wood_expert ──┘
```

The pipeline is mostly sequential, with one parallel fork: `extractor` and `wood_expert` run simultaneously since they depend on the same upstream data (competitor scout output) but don't depend on each other. All other stages are strictly sequential — each agent's output feeds into the next.

Every agent call is wrapped by the `executeAgent` runner, which:
1. Checks the sliding-window rate limiter (per-agent, 60-second window)
2. Serializes the payload and checks against the agent's context cap
3. Executes the agent's `run()` function
4. Validates the output against the agent's declared schema
5. Returns a metadata envelope: `agentId`, `contextCap`, `originalChars`, `usedChars`, `truncated`, `remainingThisMin`, `schemaValid`, `schemaViolations`

| Agent | Model | Context Cap | Rate Limit |
|-------|-------|-------------|------------|
| `own_scout` | gpt-4o-mini | 50K | 12/min |
| `own_extractor` | gpt-5.4-mini | 50K | 20/min |
| `comp_scout` | gpt-4o-mini | 50K | 12/min |
| `extractor` | gpt-5.4-mini | 2M | 20/min |
| `wood_expert` | gpt-5.4-mini | 2M | 12/min |
| `site_analysis` | global default | 50K | 10/min |
| `analyst` | gpt-5.4-mini | 2M | 10/min |
| `recommender` | gpt-5.4-mini | 2M | 8/min |
| `guardrail` | gpt-5.4-mini | 2M | 30/min |
| `report_gen` | gpt-5.4-mini | 50K | 6/min |

The scouts use `gpt-4o-mini` — a smaller, faster model suited for page discovery and link picking where deep reasoning isn't needed. Everything from extraction onward uses `gpt-5.4-mini` for the heavier analytical work.

---

## The Interface

The dashboard was built as a single-page vanilla JS application — no React, no framework — intentionally. The priorities were:

- **Zero build step**: Edit, save, refresh. The Node server auto-serves static files by extension.
- **Full visibility into agent execution**: A brain-network visualization renders all 10 agents as 3D sphere nodes with SVG radial gradients, live status coloring (pending → active → complete/capped/error), and animated edge connections showing data flow.
- **Actionable output, not just reports**: An Action Queue surfaces each recommendation as an approvable/dismissable card with impact and effort tags. The owner can edit recommendations before applying them.
- **Pricing dashboard**: Per-product cards showing current vs. recommended pricing, percentage diffs, source citations, and expandable rationale.

The UI was rebuilt as a dark woodshop theme — `#0e0b09` background, amber `#d4883e` accents, glassmorphism panels with `backdrop-filter: blur(24px)`, JetBrains Mono for data, Lato for headings. Everything inline in a single `<style>` block for zero-dependency deployment.

## Key Technical Decisions

1. **No framework by design** — The entire client is ~4,000 lines in one `app.js`. For a tool with one user and one purpose, the overhead of React/Vue adds complexity without value. DOM manipulation is direct and predictable.

2. **Context caps per agent, not globally** — Each agent has a tuned context cap. The `executeAgent` function checks metadata size, but real data truncation happens inside each agent's `run()` function via `capJson()` and `.slice()` — giving each agent control over what it keeps and what it drops.

3. **Guardrail as a pipeline stage, not a wrapper** — Instead of post-hoc filtering, the guardrail agent receives the full recommendation set and validates pricing math, source attribution, and factual claims before the report is generated. It's a first-class citizen in the pipeline, not an afterthought.

4. **Three-phase competitor crawling** — Rather than dumping a homepage into an LLM and asking "what do you see?", the comp_scout navigates intelligently: discover links → pick category pages → pick product pages → analyze. This dramatically improves the quality of pricing data captured.

5. **Domain expert in the loop** — The wood expert agent exists because generic LLMs don't know that a white oak trestle table and a red oak farmhouse table aren't comparable products. Injecting domain expertise at the extraction layer prevents garbage comparisons from propagating through the entire pipeline.

6. **SVG over Canvas for the network viz** — CSS-styleable, inspectable, and animatable without a rendering loop. Radial gradients fake 3D sphere lighting. Shadow and specular-highlight ellipses sell the depth.

## Results

- **Weekly research time**: From ~3 hours of manual browsing → one button click and a 2-minute pipeline run
- **Pricing confidence**: Recommendations grounded in actual competitor URLs and comparable product matching, not intuition
- **Action conversion**: The queue format (approve/dismiss/edit) turned a passive report into an active workflow
- **Deployment**: Single `node server.js` on any machine. No Docker, no cloud dependency, no build pipeline
- **Cost per run**: ~15 LLM calls total across 10 agents. Scouts use the cheaper model. Heavy analysis uses the capable one. Context caps prevent runaway token usage.

## What I'd Do Differently

- **Summarize-for-report LLM step**: Currently the report agent receives the full data payload. A dedicated summarization pass before report generation would reduce token cost and improve coherence on large runs.
- **Incremental diffing**: The system re-crawls everything each run. A diff layer that highlights *what changed* since last week would dramatically increase signal density.
- **Persistent action tracking**: Applied actions currently have no memory. Tying them back into the next run's context ("you already added a trust block last week") would prevent redundant recommendations.
- **Parallel scout execution**: The own scout and comp scout could run simultaneously since they don't depend on each other. Currently they're sequential because the pipeline was built incrementally, but parallelizing them would cut ~30 seconds off the total run time.

---

*Built as a solo internal tool. No users to onboard, no scale to plan for, no abstraction tax to pay. Just a woodworker who needed to know what the competition was doing.*
