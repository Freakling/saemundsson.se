---
title: "Director-Driven Development: A New Way of Working with AI Coding Agents"
date: 2026-10-07T15:59:06+01:00
modified: 2026-10-13T07:57:05+01:00
slug: director-driven-development
permalink: /2026/10/07/director-driven-development/
wpId: 871
description: "Director-Driven Development is a new way of working with AI coding agents: small context, surgical tasks and automated checks. You direct, the AI builds."
categories:
  - director-driven-development
tags:
  - agents-md
  - ai-coding-agents
  - azure
  - claude-code
  - developer-workflow
  - godot
  - software-architecture
author: Vikingur Saemundsson
image: /wp-content/uploads/2026/10/Figure-1-Who-owns-what@2x.png
imageAlt: ""
---

**Our role as developers in the AI coding assistant world has changed.** We no longer write most of the code. We direct it.

A single prompt can build an app. The trouble starts with the second prompt: the fix, the new feature, the change to something that already works. I call it the second prompt problem. That is where results start to vary from session to session. Context fills up and the agent loses track. The design drifts as it quietly decides things nobody agreed to. “Done” means “it compiled”. Every new session reinterprets the project from scratch.

That isn’t a flaw in the model. AI is a non-deterministic tool, and that is also where its creativity comes from. The cause is a codebase and a workflow built for humans. Director-Driven Development is the way of working I built to fix that: creativity, inside a frame. Small context, small tasks, and automated proof that every task works.

## The principle

> A director doesn’t need to act. A director needs to recognize a good take.

You don’t write the implementation. You decide what gets built, judge the result and own the design. Left alone, an agent makes every prompt work as fast as you ask, and every change looks reasonable on its own. That is exactly how a codebase rots. Someone has to hold the whole picture. That’s the director.

Four roles:

-   **Director** (you): design, priorities, acceptance. Final say.
-   **Orchestrator** (main session): picks tasks, records decisions, hands off builds. Never reads the code being changed.
-   **Builder**: builds one task in a fresh context and reports back.
-   **Reviewer**: independent, read-only review of every change against its task and the tests.

## Code shaped for agents

Agent quality drops as context grows. So the codebase is shaped to keep every task’s context small.

-   **Small, separate units.** Even a small app becomes a set of internal services and functions. One function per file, and every file works like a small service: input in, output out.
-   **Read only what the task needs.** Each task names the files it may touch. The builder greps for the exact rows it needs and reads nothing else.
-   **Surgical edits.** One task, one atomic change, one commit. Large tasks are split before they start.
-   **Rules live in testable code.** Agents are strong at UI because UI is easy to verify, and weak at complex rules. So rules live in plain classes that tests build directly, and the check fails when the UI holds logic.
-   **State lives in files, not chat.** A design document, a decision log, a task queue and an architecture table hold everything. Each fact has one home. Clearing the session loses nothing.

<figure><img src="/wp-content/uploads/2026/10/image-1024x320.png" alt="" width="1024" height="320" loading="lazy" decoding="async"><figcaption>Two tasks, sized and names the exact files it may touch.</figcaption></figure>

<figure><img src="/wp-content/uploads/2026/10/image-4.png" alt="" width="798" height="818" loading="lazy" decoding="async"><figcaption>On request, claude runs /next-task and starts grabbing tasks according to specification.</figcaption></figure>

## The loop

Every change runs the same four steps.

### 1\. Decide

The agent proposes. The director decides. Design calls come to you as 2-4 options with a recommendation, and you can always write your own answer. Only your choice is recorded, in a decision log in the repo, so the next session starts from what was agreed rather than a fresh guess. Anything undecided goes on an open-questions list, and values you haven’t set stay marked as placeholders. The agent never guesses intent.

<figure><img src="/wp-content/uploads/2026/10/image-6-727x1024.png" alt="" width="727" height="1024" loading="lazy" decoding="async"><figcaption>Design calls come back as options. Only the director’s choice is recorded. Custom answers can be given if none of the recommendations match director expectations.</figcaption></figure>

### 2\. Build

The orchestrator hands one sized task to a builder with a fresh, empty context. The builder returns a short structured report. The orchestrator never reads the changed code, so ten tasks cost about as much context as one.

Each task size maps to its own model: Haiku for XS and S, Sonnet for M, Opus for L and XL, with Fable as an alternative for the largest tasks. A failed build retries once on the next size up. Cost follows complexity, not habit.

<figure><img src="/wp-content/uploads/2026/10/image-5-1024x928.png" alt="" width="1024" height="928" loading="lazy" decoding="async"><figcaption>The orchestrator sees the report, not the code.<br>nb: L tasks were mapped to Sonnet to save tokens.</figcaption></figure>

### 3\. Prove

One check defines done: the project builds, the tests pass and the architecture rules hold. “It compiled” is not an answer. Large changes, and medium ones that touch contracts, stored data or other risky boundaries, also get an independent, read-only reviewer in a fresh context before they are committed.

<figure><img src="/wp-content/uploads/2026/10/image-7-1024x375.png" alt="" width="1024" height="375" loading="lazy" decoding="async"><figcaption>check.sh failing on a rule in a screen file, then passing after the fix.</figcaption></figure>

### 4\. Commit

A passing check gates every commit. Run a single task and you approve it. Work through the queue and commits land automatically, listed in the final report.

<figure><img src="/wp-content/uploads/2026/10/image-8.png" alt="" width="635" height="337" loading="lazy" decoding="async"><figcaption>One task, one commit.</figcaption></figure>

## What makes it different

None of the building blocks are new. Small batches, a single source of truth, a definition of done, decision records and an orchestrator delegating to sub-agents are all established practice. In regulated industries we have long run platforms the same way: trust, but verify. Enforce what’s critical, audit the rest. Director-Driven Development combines these for AI agents and adds four things:

-   **Rules are enforced, not suggested.** Most AI workflows guide the agent with prompts and templates, and prompts can be ignored. Here the check fails the build: a rule inside the UI, a tenant ID read from a request, logic in the wrong layer.
-   **Deviation is a decision.** Where the framework owns the architecture, the only way past a rule is an architecture decision record the director accepts. The check excuses only the exceptions an accepted record names. Builders and reviewers have limited autonomy: anything they find outside their task is flagged for the director, not fixed on the spot.
-   **Context discipline is a rule, not a tip.** The orchestrator never reads the code being changed. Its context holds decisions and reports, so a long session stays as sharp as a short one.
-   **Ownership is enforced by tools.** The director’s own workspace is protected by a hook: the agent can read it, but never write to it. Areas the director owns, like art and audio, get placeholders until they are ready to be replaced with production-ready assets.

<figure><img src="/wp-content/uploads/2026/10/image-10.png" alt="" width="778" height="477" loading="lazy" decoding="async"><figcaption>The agent reads the director’s workspace but can’t write to it.</figcaption></figure>

## When the design drifts

Agents don’t break your design. They drift. Complex rule systems drift in interpretation: a principle that can be read two ways gets read two ways. I handle that at two levels.

**Align often.** `/align` is a routine consistency pass. It checks that everything is accounted for: every design rule has a task, every decision is reflected in the design document, every part of the architecture points at something real. Mechanical drift gets fixed; anything that touches the design comes back to the director. When the same conflict comes back, or one conflict spans several design principles, align recommends a reset.

**Reset when you have to.** Sometimes everything is accounted for, but the same principle has been built two different ways. Don’t patch. Reset. `/drift-reset` walks the director through it, and only the director can start it:

1.  Analyse the system as built, area by area, with read-only reviewers in fresh contexts.
2.  Map how each design principle was actually interpreted, and where.
3.  Rewrite the design document, one design call at a time. Only the director’s choices are recorded.
4.  Plan the rebuild as ordinary sized tasks. The rebuild itself runs through `/next-task`.
5.  Run `/drift-reset postmortem` against the old failure modes. Drift a script could have caught becomes a proposed check rule, for the director to approve.

It means throwing work away. That is the price of keeping the design yours, and the routine align pass is what keeps the price rare.

## Three frameworks, one model

All are MIT licensed and run locally. Designed to work with any AI coding assistant that reads AGENTS.md. Built and tested on Claude Code.

-   [**Godot-Director**](https://github.com/Freakling/Godot-Director): games in Godot 4. The check fails if a screen script holds game rules.
-   [**App-Director**](https://github.com/Freakling/App-Director): small web, mobile and desktop apps, with TypeScript, Flutter and Python stacks.
-   [**SaaSAllTheThings**](https://github.com/Freakling/SaaSAllTheThings): B2B SaaS on Azure. You own the product, the framework owns the architecture, the agent builds. Tenancy, identity and cost rules are machine-checked. Deviation requires an ADR you accept.

The same loop runs all three, and all three ship `/align` and `/drift-reset`. Only the rules the check enforces change. Directing scales by turning repeated judgment into checks.

## Who it’s for

Anyone who can judge the design of code, even without writing it. You need design judgment, the discipline to keep documents authoritative, and the willingness to throw work away when it no longer matches intent.

AI didn’t remove the need for engineering judgment. It concentrated it.

**In the docs**  
This post is the why. The how, step by step, is in the [Director-Driven Development docs](https://freakling.github.io/Director-Driven-Development/).

-   [Roles](https://freakling.github.io/Director-Driven-Development/concept/roles/)
-   [Code shaped for agents](https://freakling.github.io/Director-Driven-Development/concept/code-shape/)
-   [Agent development flow](https://freakling.github.io/Director-Driven-Development/concept/agent-flow/)
-   [Align and drift reset](https://freakling.github.io/Director-Driven-Development/concept/drift/)
-   [The three frameworks compared](https://freakling.github.io/Director-Driven-Development/frameworks/)
