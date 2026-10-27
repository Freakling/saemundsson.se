---
title: "Sovereign Cloud Part 2: The technical controls that make sovereignty real in a public cloud"
date: 2026-03-20T17:20:00+01:00
modified: 2026-10-07T17:30:25+01:00
slug: sovereign-cloud-part-2-technical-controls
permalink: /2026/03/20/sovereign-cloud-part-2-technical-controls/
wpId: 890
description: Sovereign cloud is not defined by a list of security features, but by whether control is enforceable under adverse conditions.
categories:
  - uncategorized
tags:
  - azure
  - azure-policy
  - encryption
  - entra-id
  - pim
  - separation-of-duties
  - sovereign-cloud
author: Vikingur Saemundsson
---

<img src="/wp-content/uploads/2026/10/image-13-1024x575.png" alt="" width="1024" height="575" loading="lazy" decoding="async">

Part 1: [What sovereignty actually means in the public cloud](/2026/03/18/what-sovereignty-actually-means-in-the-public-cloud/)

This article is a continuation on my previous article where I talk about Sovreignty, what it is and why it matters. In part 2 I want to focus on the actual controls that can grant Sovreignty in Public Cloud

“Sovereign cloud” can not be defined by a list of security features enabled, but it is instead defined by whether control is **enforceable under adverse conditions** such as (but not limited to) misconfiguration, insider threat, and privileged access scenarios. For any Cloud or PaaS/SaaS service this includes validating if the control is enforceable against the Service Providers themselves (Scary, I know).

## The Sovereign Cloud Technical Control Matrix

Think of a Sovereign Cloud Technical Control Matrix as a structured way to answer:

-   Which controls exist, and what scope they cover
-   How they are enforced (deny, allow with conditions, audit)
-   How exceptions work, who can grant them, for how long, and with what auditable evidence
-   How controls interact so you are not betting sovereignty on a single layer

Sovereignty is measured by what, and when the platform can actually technically prevent or cryptographically invalidate (hard controls). Not by user processes, intent, guidance, or documentation (soft controls).

## How sovereign controls work together (layered enforcement)

Sovereign posture in a public cloud comes from controls reinforcing each other across layers:

### Identity and access controls

These controls answer: who can change or access what, and under which conditions.

A sovereign posture generally requires:

-   No standing high privilege access for day-to-day work
-   Time-bound, approval-based elevation for privileged roles
-   Clear separation between different types of privilege:
    -   Control plane operations (platform configuration)
    -   Data plane access (reading or operating on data)
    -   Security operations (security tooling and alerts)
-   Separation of duties across privileged workflows, so no individual can act as judge, jury, and executioner for high-impact actions or privileged access.

I know it might seem tedious to enforce these things, as an operator/administrator this can be felt like an administrative overhead, but these things should be non-negotiable. In physical security we treat every warehouse and store-room with high value objects using access-card locks, we monitor, we place patrolling guards around the perimiter and inside the areas. We delegate access to employees on a strict need-only basis.

If we don’t treat our IT systems with the same respect in terms of access, then it’s not a question about if an incident occurs it’s a question of when, and how often and how much does it cost.

These controls is how you avoid a single account obtaining a “master key” without supervision or restraint.

### Policy controls

These controls answer: what can exist in your environment.

If sovereignty depends on reviews and guidance, it is still trust-based.

A sovereign baseline relies on policy that can:

-   Deny non-compliant deployments by default
-   Continuously evaluate services for drift or non-compliance
-   Require exemptions to be time-bound and auditable

### Network controls

These controls answer: where data is allowed to flow.

A sovereign posture typically needs:

-   Centrally governed ingress patterns for anything exposed publicly
-   Centrally governed egress controls so data cannot leave through unapproved paths
-   Controls that limit lateral movement between workloads and services

The goal is simple: even authorized identities should not be able to bypass the approved architecture.

### Cryptographic controls

These controls answer: what happens if access controls are bypassed.

Cryptography is the final enforcement layer because it can make data unusable even if someone gains access.

For sovereignty, the important part is not “encryption exists”. The important part is who controls the keys, and whether the customer can:

-   Rotate keys
-   Disable keys
-   Destroy keys in a way that renders data cryptographically inaccessible

### Logging and monitoring controls

These controls answer: can you prove what happened.

Sovereignty needs evidence:

-   Privileged actions must be attributable
-   Changes must be traceable to an identity, a ticket/approval, and a time window
-   Alerts must exist for sovereign boundary violations, not just availability issues

Without evidence, you do not have accountability. You have claims.

## What “good” looks like: the sovereignty litmus test

A platform is not sovereign-ready for workload onboarding if any of these are true.

### Access control

-   Privileged access cannot be fully revoked or time-bounded without changing application code or workload configuration.
-   Administrative access relies on standing permissions rather than just-in-time elevation with enforced approval and logging.

### Cryptographic control

-   The customer does not retain exclusive control over encryption keys protecting data at rest.
-   Data confidentiality depends solely on access controls rather than cryptographic enforcement.

### Data residency

-   Data location is governed by convention or documentation rather than enforceable technical controls.
-   The platform cannot prevent replication, backup, or processing outside approved regions.

### Network and service exposure

-   Public endpoint exposure can be enabled without an explicit centrally enforced control mechanism.
-   Platform teams cannot centrally restrict egress paths and service-to-service communication.

### Policy enforcement

-   Compliance depends on reviews or manual approvals rather than deny-by-default policy enforcement.
-   Deviations from the sovereign baseline are not time-bound, tracked, and auditable.

If any of these conditions exist, the platform may be well secured, but it does not provide sovereign assurance.

## The operational reality behind “toxic combinations”

Even with a strong sovereign architecture and the right technical controls in place, there is often a limiting factor that determines whether sovereignty actually holds in practice.

That factor is people and organization.

Technical controls can enforce boundaries, but they do not operate themselves. A sovereign posture depends on having highly qualified engineers covering distinct areas of responsibility, without overlap of duties that would undermine those controls.

This is where the concept often referred to as a “toxic combination” becomes critical.

### Why toxic combinations matter

A toxic combination exists when the same individuals can both:

-   grant themselves access to workloads or storage, and
-   access, modify, or disable the encryption keys protecting that data.

When this happens, sovereignty no longer rests on enforceable control. It collapses into trust in individuals.

No matter how strong the technical platform is, if one person or one team can act unilaterally across control, access, and protection, the system is no longer sovereign in any meaningful sense.

### What a sovereign operating model requires

In a sovereign design, responsibilities must be deliberately separated and staffed by different roles with no practical ability to override each other:

-   Platform operators can build, run, and maintain the platform, but cannot decrypt or access data.
-   Key administrators can control cryptographic keys, but cannot grant themselves access to workloads or data.
-   Security operators can monitor, investigate, and enforce response, but do not operate workloads or manage keys.

This separation is not theoretical. It is an operational safeguard designed to ensure that no single role becomes all-powerful.

If an exception is required where an individual must temporarily assume a toxic combination of privileges, that elevation must be governed by a formal process requiring explicit approval, full traceability, and continuous monitoring. All actions performed under such elevation must be independently audited to ensure accountability.

### Why people matter as much as controls

For this model to work, organizations must invest in:

-   sufficiently skilled engineers in each domain,
-   clear role definitions and responsibility boundaries,
-   staffing models that avoid role concentration out of convenience or cost.

Sovereignty fails quietly when organizations collapse roles “temporarily” or “for efficiency”. Those shortcuts are rarely reversed, and they erode control faster than any technical misconfiguration.

### From technical sovereignty to operational sovereignty

True sovereignty is not achieved when controls exist. It is achieved when they are:

-   operated by different people,
-   continuously monitored,
-   independently auditable.

In regulated environments, this is why external oversight matters. Regulatory institutions, auditors, and supervisory authorities play a critical role in verifying that sovereignty is not just declared in architecture diagrams, but upheld in day-to-day operations.

Sovereignty is therefore not only a technical posture. It is an operational discipline, sustained by people, process, and scrutiny over time.

## Concrete control areas for Azure public cloud

The controls for Azure Platforms can be summarised as follows. Keep in mind that these controls might not be complete, as there is no peer-review on this article, and this is written using a point in time (early 2026) and the security landscape is ever evolving and expanding.

### Identity and access (Entra ID)

-   Centralized tenant governance for identity, conditional access, and privileged workflows
-   No standing privileged access for administrators
-   Break-glass accounts defined, tested, and monitored
-   Privileged Identity Management for time-bound elevation (approval + logging)
-   Custom RBAC roles for consumers with explicit denial of sensitive platform actions
-   Separation of duties between control plane, data plane, and security operations

### Management group and subscription topology

-   A management group hierarchy that supports consistent enforcement
-   Clear ownership boundaries between platform and consumer scopes
-   A rule that platform consumers cannot assign roles or policies which override governance policies.

### Policy baseline (deny-by-default)

-   Allowed locations, enforced
-   Allowed services, enforced
-   Network architecture requirements, enforced
-   Encryption requirements where supported (prefer customer-managed keys for sensitive data)
-   Exemptions that are time-bound, tracked, and auditable
-   Policy changes via version-controlled code and peer review

### Network boundary controls

-   Approved ingress patterns (and no “click-to-public” endpoints without governance)
-   Central egress restrictions and service-to-service controls
-   Mandatory monitoring for boundary violations

### Cryptography and key control

-   Customer-controlled keys for sensitive data, with the ability to disable or destroy keys
-   Operational separation between key administrators and platform administrators
-   Evidence that key access is approved, time-bound, and logged

### Evidence and auditability

-   Logs bound to identity, time, and approval context
-   Monitoring that detects both configuration drift and boundary violations
-   Reporting that supports audits without relying on verbal assurance

## Why this matters right now in Europe

Sovereignty requirements in Sweden and the EU are increasingly shaped by an uncomfortable reality: many organizations must assume distrust.

Even if you use the big public cloud providers (Microsoft, Amazon, Google) with EU data residency, the provider is still a company under foreign sovereignty. That pushes buyers toward controls that are enforceable and provable, not promises.

The controls outlined in this article apply equally to local private cloud providers and privately operated datacenters. Sovereignty is defined by control, not proximity. If effective control cannot be exercised, sovereignty does not exist.

In a later part, I will explore **private cloud sovereignty and Azure Local with Disconnected Operations**, and why the ability to operate without reliance on public cloud control planes is becoming a real requirement for certain organizations and workloads.

_Originally published on [LinkedIn](https://www.linkedin.com/pulse/sovereign-cloud-part-2-technical-controls-make-real-saemundsson-sq11e/) on March 20, 2026._
