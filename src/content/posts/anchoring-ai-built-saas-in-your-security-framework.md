---
title: Anchoring AI-built SaaS in your security framework
date: 2026-10-13T07:44:33+01:00
modified: 2026-10-13T07:55:23+01:00
slug: anchoring-ai-built-saas-in-your-security-framework
permalink: /2026/10/13/anchoring-ai-built-saas-in-your-security-framework/
wpId: 922
description: "When an AI agent writes most of your code, your security framework has to live where the agent works. How SaaSAllTheThings anchors a B2B SaaS in your control framework: enforce what’s critical, audit the rest."
categories:
  - director-driven-development
tags:
  - adr
  - agents-md
  - ai-coding-agents
  - azure
  - claude-code
  - cloud-governance
  - director-driven-development
  - entra-id
  - gdpr
  - iso-27001
  - multi-tenancy
  - saasallthethings
  - security-framework
  - software-architecture
author: Vikingur Saemundsson
image: /wp-content/uploads/2026/10/Anchoring-post-Figure-2-An-architecture-call@2x.png
imageAlt: ""
imageCaption: "<em>Figure 2: An architecture call. Requirements and related ADRs read first, a requirements conflict flagged, options rated on security and compliance impact, and the director deciding.</em>"
---

**When an AI agent writes most of your code, your security framework can’t sit in a document the agent never sees. It has to live where the agent works: in the repo, in the decisions it brings to you, and in the checks it can’t get past.**

I’ve spent the last five years building cloud platforms for banks, insurance and government. The principle that runs through all of it is simple: trust, but verify. We anchor the platform in a control framework, enforce the controls that matter most, and audit the rest. Nobody has to remember every control. The platform does.

AI coding agents need the same thing, and more urgently. An agent works fast, never gets tired and never reads the wiki. Every change it makes looks reasonable on its own, and that is exactly how a platform slowly drifts away from its security framework.

This post shows how [SaaSAllTheThings](https://github.com/Freakling/SaaSAllTheThings), my open-source framework for building B2B SaaS on Azure with [Director-Driven Development](/2026/10/07/director-driven-development/), anchors a product in your security framework, in two layers:

-   **Enforce what’s critical.** A small set of rules is checked by machine, on every change, and an agent cannot get past them.
-   **Audit the rest.** Everything that needs judgement is put in front of you, the director, with the requirements quoted, before the decision is made.

If you’re new to the framework, the [step-by-step guide](/2026/10/09/build-a-b2b-saas-on-azure-with-director-driven-development/) covers the basics.

<figure><img src="/wp-content/uploads/2026/10/Anchoring-post-Figure-1-Anchored-in-your-control-framework@2x-1024x576.png" alt="" width="1024" height="576" loading="lazy" decoding="async"><figcaption><em>Figure 1: Anchored in your control framework. The framework in compliance/ feeds two layers: what the check and the hooks enforce, and what the director decides with the requirements in front of them.</em></figcaption></figure>

## 1\. Give requirements a home

An agent can only respect a requirement it can find. In SaaSAllTheThings, compliance requirements live in plain files in the app’s own repo, next to the code:

-   **`product/prd.md` › Data and Compliance:** data residency, retention, which data is personal, audit needs, and export and deletion when a customer leaves.
-   **`compliance/`:** the control framework you’re held to, such as the ISF Standard of Good Practice or ISO 27001, and the security requirements in your customer contracts. This is the anchor every architecture decision is checked against.
-   **`product/requirements/`:** user stories and feature specs, when you have them.

The framework asks for these early. Onboarding includes data and compliance in its product interview, and the tenancy and identity workshop ends with a data map: each kind of data, who owns it, whether it’s personal and how long it’s kept.

Anything you haven’t decided stays visibly undecided. The reference is explicit: until the PRD decides retention, residency and which fields are personal, they’re open questions, not guesses. An agent never picks a retention period because it seemed reasonable.

## 2\. Enforce what’s critical

A handful of security controls are too important to depend on anyone remembering them, human or agent. SaaSAllTheThings builds them into the architecture and enforces them by machine, in two places. These are built into the check and the hooks: the small set of controls every SaaS on this architecture needs, whatever framework you answer to.

**The check** runs before every commit that touches code, and in Claude Code also before the agent ends its turn. Among its architecture rules, these carry the security weight:

| Rule | What it stops |
| --- | --- |
| secrets | Secrets in code, configuration or apps |
| tenant-source | Reading the tenant from the request instead of the validated token |
| tenant-branching | Tenant-specific code: customers differ by data in a registry, never by code |
| layers | Clients reaching past the contracts, and layers depending on what they shouldn’t |
| cost-sku | Infrastructure outside the agreed cost tiers |

**The hooks** stop commands before they run. An agent can’t read a Key Vault secret into its session, create a client secret (it has to use a federated credential), delete Azure resources, run a complete-mode deployment, force-push, or skip the check with `--no-verify`. Two more actions don’t block but ask you first: editing the framework’s own files, and marking an ADR as accepted.

None of this depends on the agent following instructions. A prompt can be ignored; a failing build can’t.

## 3\. Audit the rest

Most compliance questions can’t be reduced to a pattern a script can match. Should this data be stored in another region? Is this integration allowed to see personal data? Those need judgement, and in Director-Driven Development judgement belongs to the director. The framework’s job is to make sure you never decide blind.

When an architecture question comes up, `/architect` prepares the call before it offers anything:

1.  **It reads your requirements.** The reference topic in question, every related ADR, `compliance/`, `product/requirements/` and the PRD’s Data and Compliance section.
2.  **It classifies the question:** an open choice, a deviation from the reference, a gap in the framework, or a _requirements conflict_, where the compliant architecture would break a stated requirement, or a requirement forces a deviation.
3.  **It shows you the context first.** The rule in question, the classification, related ADRs, and any conflict stated explicitly, before a single option is on the table.
4.  **It offers 2-4 options,** each with its effort, monthly Azure cost, risk, security and compliance impact, and how hard it is to undo.
5.  **It checks every option against a standing baseline:** OWASP Top 10, least privilege, defence in depth, zero trust, data minimisation, and the control framework in `compliance/`, whether that’s the ISF Standard of Good Practice, ISO 27001, SOC 2 or GDPR.
6.  **It recommends one,** preferring the option that complies, the one that can be undone, and the stronger security posture when the effort is similar. Then it waits for you.

The same discipline continues into the build. Large items, and any medium item that touches tenant isolation, identity, a contract or a stored schema, get an independent, read-only reviewer in a fresh context before they are committed.

## 4\. Build personal data in from the start

GDPR-style requirements are hard to retrofit, so the reference architecture bakes the basics in from the first commit:

-   **No personal data in logs, traces or metrics.** Log ids, not names, email addresses or document contents. No secrets or tokens either.
-   **No personal data in partition keys,** where it would be copied into indexes and hard to erase.
-   **Events carry personal data only where a consumer needs it.** Messages travel further than you think.
-   **Deletion is a platform capability.** Deleting a tenant’s or a person’s data is built as part of the platform, not a script someone runs by hand.
-   **Export and deletion are a milestone.** The roadmap’s second-tenant stage isn’t done until a second customer sees none of the first one’s data, and export and deletion work.
-   **Isolation is tested before a customer arrives.** `/tenant` won’t call a new customer ready unless every store has a tenant-isolation test. A missing one is a high-severity bug.

And when a customer needs more than pooled tenancy allows, such as dedicated infrastructure for a regulated tenant, the architecture is ready for it: a tenant can move to its own deployment. Whether that’s worth the cost is a product decision, made by you, with the price on the table.

## 5\. Make every deviation leave a trail

In a regulated environment, the question is rarely “did you follow the rule?” It’s “when you didn’t, who decided, why, and what did it cost?” SaaSAllTheThings answers that from the repo itself:

| An auditor asks | Where the answer lives |
| --- | --- |
| Why does this deviate from the standard architecture? | An ADR in `adr/`: context, the options with “comply” always first, and the decision |
| Who approved it? | The ADR’s status. Only the director accepts one, and in Claude Code a hook asks before it’s marked accepted |
| Is the exception still limited to what was approved? | The ADR’s “Exception:” lines. The check excuses a violation only while an accepted ADR names it |
| Is the deviation temporary? | Its removal item in `TASKS.md`. `/align` reports any temporary deviation without one |
| Why was this product rule chosen? | One line per decision in `product/decisions.md` |
| When did it change, and who approved the change? | The git history: one item, one commit, each approved by the director |

`/align` keeps the trail honest between audits. It reports stale ADR exceptions, proposed ADRs that have waited more than a week, and decisions the PRD no longer reflects.

The point isn’t paperwork. Every record is something the agent needs anyway to work in a fresh context, so the audit trail costs nothing extra to keep.

## 6\. Treat drift in tenancy as a security finding

Agents don’t break your design in one go. They drift: a principle that can be read two ways eventually gets read two ways. For product rules, that’s a design problem. For tenancy and identity, it’s a security problem, and the framework treats it as one.

When you start a design drift reset with `/drift-reset`, the analysis of the system as built always includes **tenancy and identity as an area of its own**: where the tenant comes from at every entry point, whether every store, query, blob path, cache key and message carries it, how tokens are validated, and anything that reads across tenants. Drift found there is marked as a security finding and reported to you at once.

It doesn’t become a design question, because the reference has already settled it. It goes straight into the queue as a high-severity bug, ahead of everything else in the rebuild. Accepted ADRs are checked the same way: each one must still be honoured, and a reset can never drop one without a new ADR.

Three things a reset is never allowed to do: propose a change to the tenancy, identity or cost rules, relax a rule in the check, or add an exception. The postmortem goes the other way. It repeats the tenancy and identity analysis on everything the rebuild touched, and turns drift a script could have caught into proposed new check rules for you to approve. Repeated judgement becomes a check.

<figure><img src="/wp-content/uploads/2026/10/Anchoring-post-Figure-3-Two-kinds-of-drift@2x-1024x576.png" alt="" width="1024" height="576" loading="lazy" decoding="async"><figcaption><em>Figure 3: Two kinds of drift. Product drift becomes a design call for the director; tenancy and identity drift becomes a high-severity bug.</em></figcaption></figure>

## What stays human

A framework doesn’t make a product compliant. People do. What SaaSAllTheThings does is make sure the human decisions are the ones that count, and that they can be found again:

-   **You decide the data rules:** residency, retention, what’s personal, what an auditor needs to see.
-   **You accept every deviation,** with its cost and risk in front of you.
-   **You approve every commit,** and production deployments are yours to run.
-   **You onboard customers.** Consent, role assignments and the registry entry are steps the framework writes out for you, not steps it takes.

Everything else is either enforced by the build or put in front of you before it matters. Enforce what’s critical, audit the rest.

It’s the same principle we’ve used on regulated cloud platforms for years. The difference is that an agent only knows what’s in front of it, so your requirements have to live in the repo, and your critical controls in the build.

SaaSAllTheThings is free and MIT licensed: [github.com/Freakling/SaaSAllTheThings](https://github.com/Freakling/SaaSAllTheThings). If you’re building SaaS for a regulated industry and want to compare notes, I’m happy to talk.

Trust the agent. Verify with the build.

**In the docs**

-   [SaaSAllTheThings](https://freakling.github.io/Director-Driven-Development/frameworks/saasallthethings/): install, the check and every command
-   [What the check enforces](https://freakling.github.io/Director-Driven-Development/frameworks/saasallthethings/#what-the-check-enforces): section 2
-   [Reviews](https://freakling.github.io/Director-Driven-Development/concept/reviews/): section 3
-   [Deviation is an ADR](https://freakling.github.io/Director-Driven-Development/frameworks/saasallthethings/#deviation-is-an-adr) and [Records in files](https://freakling.github.io/Director-Driven-Development/concept/records/): section 5
-   [/align](https://freakling.github.io/Director-Driven-Development/skills/align/) and [/drift-reset](https://freakling.github.io/Director-Driven-Development/skills/drift-reset/): sections 5 and 6
-   [Ownership](https://freakling.github.io/Director-Driven-Development/concept/ownership/): what stays human
