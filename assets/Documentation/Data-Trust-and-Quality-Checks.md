# Data Trust & Quality Checks

**Internal Document**  
**Leo Consult**

---

## Purpose

Data quality is non-negotiable at Leo Consult. We do not build analysis on data we do not trust.

This document defines when to stop, when to pause, and what standards we hold for any data we use.

---

## Core Principle

Bad data leads to bad decisions. Our job is to prevent that.

If we cannot trust the data, we do not proceed. We tell the client clearly and help them understand why.

---

## Data Quality Standards

For any data we use in analysis, we need acceptable answers to:

**Accuracy**

- Is this data capturing what it claims to capture?
- Are there known errors or systematic issues?
- When was it last validated?

**Completeness**

- Is critical information missing?
- Are there gaps that would mislead analysis?
- Do we have the full picture or just a slice?

**Consistency**

- Does this data contradict itself?
- Are definitions stable over time?
- Do different sources tell the same story?

**Timeliness**

- Is this data current enough for the decision?
- Has the underlying reality changed since collection?
- Are we looking at stale information?

**Accessibility**

- Can we actually get the data we need?
- Is it in a usable format?
- Are there political or technical barriers?

If we cannot get acceptable answers, we have a data quality problem.

---

## When to Pause Analysis

Pause immediately if:

**Data contradicts itself in material ways**

Example: Revenue figures from two authoritative sources differ by more than 10%.

**Critical data is missing and cannot be obtained quickly**

Example: Client wants sales analysis but half the transactions have no customer identifiers.

**We discover systematic collection errors**

Example: Key field was misconfigured for the past six months.

**Source systems are known to be unreliable**

Example: Client mentions that their CRM "has never been clean."

**Data definitions changed mid-period without documentation**

Example: What counts as a "lead" changed three times this year.

When pausing:

- Stop analysis work
- Document the specific issue
- Present options to client (fix data, adjust scope, or stop)
- Do not proceed until resolved

---

## When to Stop the Engagement

Stop if:

**Data quality cannot be fixed in reasonable time**

The problems are too deep, the client lacks resources to fix them, or the timeline does not allow remediation.

**Client is not willing to address data issues**

They want us to "just work with what we have" despite material quality problems.

**Fixing the data is more valuable than the analysis**

Sometimes the best recommendation is: "Fix your data infrastructure before doing this analysis."

**Trust is fundamentally broken**

If we cannot believe the numbers, we cannot deliver credible recommendations.

Stopping is not failure. Stopping is good judgment.

---

## Data Quality Assessment Process

**Early in every engagement, complete this check:**

**Step 1: Source identification**

- Where does this data come from?
- Who collects it and why?
- What systems are involved?

**Step 2: Spot check**

- Pull a sample and review it manually
- Look for obvious errors, inconsistencies, or gaps
- Cross-reference with other sources if available

**Step 3: Validation**

- Test key assumptions with the client
- Ask about known issues or limitations
- Verify definitions and measurement approaches

**Step 4: Document findings**

- Write down what we found
- Rate quality as: acceptable, needs remediation, or unworkable
- Share with client

**Step 5: Decide**

- Proceed if quality is acceptable
- Pause and remediate if fixable
- Stop if unworkable

Do this before heavy analysis begins.

---

## Red Flags for Data Quality

Watch for these warning signs:

**In conversations:**

- Client cannot explain where data comes from
- Multiple people give different answers about the same metric
- Client casually mentions "the data is messy"
- Lots of hedging: "I think this is right, but..."

**In the data itself:**

- Excessive nulls or blanks in critical fields
- Implausible values (negative revenue, 200% conversion rates)
- Round numbers where you would expect precision
- Inconsistent formatting or units
- Unexplained spikes or drops in trends

**In documentation:**

- No documentation of data definitions
- Conflicting definitions across sources
- No clear data ownership or stewardship
- No testing or validation history

Any of these should trigger deeper investigation.

---

## Communicating Data Quality Issues to Clients

Use this language:

> "We have reviewed the data and found some quality issues that could affect the analysis. Specifically: [describe the issue clearly].
>
> This matters because [explain the impact on the decision].
>
> We have three options:
>
> 1. Pause and fix the data issues, then continue the analysis
> 2. Adjust the scope to work around the limitations
> 3. Stop here and focus on improving data quality first
>
> We recommend [option] because [rationale]."

Be direct. Be clear. Do not sugarcoat.

---

## Building Client Data Trust

We help clients improve their data by:

**Documenting what we find**

Clear, honest assessment of data quality issues. This is valuable even if we do not proceed with analysis.

**Explaining why it matters**

Help clients understand the connection between data quality and decision quality.

**Recommending next steps**

Point them toward fixable problems and realistic solutions.

**Modeling good practice**

Show them what good data stewardship looks like by how we handle their data.

Do not fix their data infrastructure for them (unless that is the engagement). But do help them see what needs fixing.

---

## Internal Data Quality Standards

**For our own work:**

- Document all data sources and transformations
- Keep raw data separate from analysis
- Version control key datasets
- Test calculations before using them
- Peer review critical analysis

**For client deliverables:**

- Clearly label data sources
- Note limitations and confidence levels
- Explain any assumptions or adjustments
- Provide enough detail for verification

We hold ourselves to the standard we expect from clients.

---

## Common Situations

**Client says "just give us your best guess with the data we have"**

Response: "We do not guess. If the data is not reliable enough to support a confident recommendation, we will tell you that instead of delivering something we do not believe in."

**Data is 80% good, 20% problematic**

Evaluate whether the 20% affects the decision. If yes, pause and fix. If no, proceed but clearly document limitations.

**Client has been told their data is fine by other consultants**

Trust your own assessment. If you see problems, name them. Do not defer to past consultants who may have had lower standards.

**We discover the problem mid-analysis**

Stop immediately. Do not continue hoping it will resolve. Document the issue and bring it to the client.

---

## What This Protects

This system protects:

- Our reputation (we do not deliver bad analysis)
- Client outcomes (they do not make decisions based on bad data)
- Our team (we do not put people in impossible situations)
- Long-term relationships (clients respect honesty more than speed)

Data quality is where we draw the line. Hold it.

---

## Evolution

As the firm grows:

- Build a library of common data quality issues and solutions
- Develop lightweight tooling for standard quality checks
- Train team members on red flags and decision rules
- Document industry-specific data quality patterns

Stay vigilant. Data quality problems only get more costly if ignored.
