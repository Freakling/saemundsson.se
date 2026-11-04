---
title: "What a task costs, and how many fit in a month"
date: 2026-11-04T12:00:00+01:00
slug: what-a-task-costs
permalink: /2026/11/04/what-a-task-costs/
description: "About 1,100 product tasks measured: $1 to $12 of API-equivalent per task by size, design included, and what that means in tasks per month on Pro, Max 5x and Max 20x."
categories:
  - director-driven-development
tags:
  - ai-coding-agents
  - claude-code
  - director-driven-development
  - token-cost
author: Vikingur Saemundsson
image: /wp-content/uploads/2026/11/cost-per-task-by-size.png
imageAlt: "Cost per task by size: XS $1.05, S $1.55, M $3.55, L $12.10"
imageCaption: "Cost per task by size, across 1,100 product tasks"
---

This post is meant as a hint on what you need for your own project, and as guidance on your velocity. The numbers further down are mine; the choices below are yours.

**The plan follows the project.** How much subscription you need comes down to how big your project is and how fast you want to finish it. A few nights a week on a hobby project, writing design in the evening and letting the agents build through the night, is very doable on the $20 Pro plan.

**Your own hours are a limit too.** Tasks come out of design, and design comes out of the time you have to write it. If you can spend a few hours a week on that, it will often limit you before the plan does.

**Start small.** Build a proof of concept and evaluate it. You get quite far on Pro, and you can move up when you actually hit the limit. An expensive subscription you don't use is money spent on allowance that goes to waste.

**Write the design first.** Before any setup, put as much design as you can into the templates. Details known in advance save tokens twice: in the AI-driven design sessions, and in the rework when a project's scope changes later. You can even do AI-assisted design and UX mockups on the free Claude plan, which is quite capable.

With that in mind, here are the numbers.

In October I [measured what directing AI agents costs](/2026/10/19/what-directing-ai-agents-costs/) across three projects. That post gave one number per task. This one asks the next question: what does a task cost by size, how much of that is design, and how many tasks fit in a month on each Claude plan?

The projects all run on [Director-Driven Development](/2026/10/07/director-driven-development/): I direct, agents build, one check decides when a task is done. Every task is sized XS to XL before it is built, and the size picks the builder's model. That makes the sizes a useful unit.

## How I measured

The method is the one from the first post: every token in the Claude Code transcripts, priced at the pay-as-you-go API rates, dated 4 November 2026. **Nothing here was billed per token.** The dollars are a measure of the size of the work.

The sample is 1,100 product tasks from four projects: Lantern, the indie game from the first post; PKSEI; Stairwell, a codename for a web service for housing cooperatives; and one smaller app. A task's cost is its builders and reviewers plus a share of the orchestrating session, the one I talk to.

I removed the design work I ran on Fable. I only did that because I had capacity left over, so it isn't how I'd plan a month.

## What a task costs

The chart at the top of this post has the figures: from $1.05 for an XS to $12.10 for an L. At the real mix of sizes, a task averages **$3.44**.

No task in the sample was sized XL. That's what sizing is for: anything that large gets split.

An L costs about eight times an S, so the size is doing real work. The first post's $2 to $3 per task still holds for the small end, and the average has risen as the projects grew and took on larger items.

Framework work costs far more. In this repository, an M averages $12 and an L $54, because a change to a shared guard runs through hundreds of test cases and is ported to three repositories. Treat these figures as the cost of product work.

## Does that include design?

Yes. The orchestrating session's cost goes to the next task that commits, so a design conversation is carried by the tasks that follow it.

To size it, I split every turn in the orchestrating sessions: a turn that started a builder or a reviewer is build, and any other turn counts as design. That's an approximation, since record keeping and plain questions land on the design side and my sessions mix the two. On that measure, design is about a sixth of the total.

So design doesn't come on top of these figures. It's already in them.

## Sonnet or Opus for design

Design on Sonnet cost half of design on Opus per turn, in sessions with about the same amount of context.

| Lantern and Stairwell | Turns | Mean per turn | Median per turn | Median context | Median output |
|---|---|---|---|---|---|
| Opus | 737 | $0.90 | $0.39 | 268k | 2,590 tokens |
| Sonnet | 94 | $0.45 | $0.19 | 266k | 1,636 tokens |

Half is what the price list predicts, since Sonnet costs half of Opus per token. Sonnet also wrote about a third less per turn, and these figures don't say whether that's tighter answers or thinner ones. The sample is small too, 94 turns against 737, and I chose which model to use for which session.

Moving all design to Sonnet would take about 8 percent off the bill. That's real, and modest. Design is where a wrong call costs the most to undo, so I'd pick the model on the quality of its calls first. These numbers don't measure that, and I'm leaving the decision to the next comparison.

## How many tasks fit in a month

A full week of Max 20x is worth about **$3,500 of API-equivalent**. That comes from two readings of the weekly limit, 44 and 63 percent, against everything spent since the weekly reset: they give $3,513 and $3,494. A $200 plan delivers about $15,000 a month, roughly 1.3 cents on the API dollar.

Pro and Max 5x are scaled from that figure: 5x is a quarter of 20x, and Pro a twentieth.

| Plan | Price a month | API value a week | API value a month | Tasks a month, at the limit | Tasks a month, to plan on |
|---|---|---|---|---|---|
| Pro | $20 | about $175 | about $760 | 220 | 150 |
| Max 5x | $100 | about $875 | about $3,800 | 1,100 | 750 |
| Max 20x | $200 | about $3,500 | about $15,000 | 4,400 | 3,000 |

The planning figure is 70 percent of the limit, which leaves room for rebuilds and exploring. By size, at the limit:

| Tasks a month, only this size | Pro | Max 5x | Max 20x |
|---|---|---|---|
| XS | 720 | 3,600 | 14,400 |
| S | 490 | 2,450 | 9,800 |
| M | 210 | 1,070 | 4,270 |
| L | 60 | 310 | 1,250 |

The numbers hold for clean product work. My own weeks run higher per task: framework work is expensive, and not every session ends in a task. A heavy framework week took me 63 percent of Max 20x in under three days, while a normal week uses about 40 percent. Plans also have shorter usage limits, which these figures leave out.

What that means for a whole project, at the planning figures, if your own design time keeps up:

| Project | Pro | Max 5x | Max 20x |
|---|---|---|---|
| 100 tasks | 3 weeks | under a week | a day or two |
| 500 tasks | 3.3 months | 3 weeks | under a week |
| 2,000 tasks | 13 months | 2.7 months | 3 weeks |

This is the fastest each plan allows. Your own hours for design often set the real pace.

A bigger plan only pays when you use it. The same 150 tasks a month cost $0.13 each on Pro and $1.33 each on Max 20x.

<figure><img src="/wp-content/uploads/2026/11/unused-allowance.png" alt="Subscription cost per task at 150 tasks a month: $0.13 on Pro, $0.67 on Max 5x, $1.33 on Max 20x" width="2560" height="1440" loading="lazy" decoding="async"><figcaption>The same 150 tasks a month, on each plan</figcaption></figure>

Max 20x is the only step with a better rate. Pro and Max 5x give the same value per dollar, so Max 5x is simply more volume. Max 20x gives twice the allowance per dollar.

## What I'd take from this

**Size is a good predictor of cost.** From $1 to $12 across four projects, it's enough to plan a month from a queue.

**Design is cheap compared with what it steers.** A sixth of the bill decides what the other five sixths build.

**Most people need less than they think.** At 150 tasks a month, Pro covers a serious side project, and 750 on Max 5x is more than one person can usefully direct.

These numbers don't show what the tasks were worth, or that another way of working would cost more. There's still no baseline for that.

## Measure your own

The script behind these numbers is `tools/usage.py` in the [Director-Driven Development repository](https://github.com/Freakling/Director-Driven-Development). Paste this prompt into Claude Code, in the project you want to measure:

```
Measure what this project's Claude Code sessions cost. Download
https://raw.githubusercontent.com/Freakling/Director-Driven-Development/main/tools/usage.py
to a temporary folder, read it, and tell me what it does before you run it. Then run it
with Python on this project's folder under ~/.claude/projects. If this repository has a
TASKS.md with sized items, also run its --tasks mode for the cost per size. Change nothing
in this repository. Report the total, the share by token kind, my hours at the keyboard
and the cost by size, and say that the figures are API-equivalent prices, not what I was
billed.
```

It reads only the transcripts on your own machine and sends nothing anywhere.
