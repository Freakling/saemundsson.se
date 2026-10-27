---
title: "Sovereign Cloud Part 3: Disconnected operations change the sovereignty conversation for Azure Local"
date: 2026-04-22T17:21:00+01:00
modified: 2026-10-07T17:31:14+01:00
slug: sovereign-cloud-part-3-disconnected-operations
permalink: /2026/04/22/sovereign-cloud-part-3-disconnected-operations/
wpId: 891
description: "Disconnected operations shift a critical dependency boundary: operational control no longer collapses when the public control plane disappears."
categories:
  - uncategorized
tags:
  - azure-local
  - disconnected-operations
  - dora
  - foundry-local
  - nis2
  - sovereign-cloud
author: Vikingur Saemundsson
---

<img src="/wp-content/uploads/2026/10/image-14-1024x576.png" alt="" width="1024" height="576" loading="lazy" decoding="async">

February 2026 marked a major shift for Azure Local. **Disconnected Operations**.

With disconnected operations now generally available, Azure Local no longer requires continuous connectivity to the Azure public control plane to operate, govern, or run workloads. This is a major shift and enabler of sovereign operation. In practice, it creates a new responsibility: organizations can and must now design for, test, and rehearse operating without external connectivity.

This article focuses on why disconnected operations matter for sovereignty, what Azure Local actually is, and why customers should treat disconnection as a scenario to actively test rather than a theoretical edge case.

## Setting the stage: Sovereignty and Azure Local

In [part 2 of this series](/2026/03/20/sovereign-cloud-part-2-technical-controls/), an important nuance emerged in the discussion around sovereignty, one that is worth making explicit before going deeper. Shout out to Rickard Carlsson for the discourse 😘.

Even when an organization understands where workloads run, who can administer them, and which regulations apply, a fundamental dependency remains: the platform provider itself.

In public cloud platforms, sovereignty is always bounded by what the provider chooses to expose, document, and allow customers to verify. Customers do not have full insight into internal operational mechanisms, such as internal access paths, key handling implementations, or emergency procedures, unless they fully own or can independently audit the entire platform.

This does not make public cloud insecure or unusable. It simply means sovereignty in the cloud is always, to some extent, a matter of conscious risk acceptance.

As the well-known saying goes: “There is no cloud – it’s just someone else’s computer.” The value of Azure, and other hyperscale platforms, lies in convenience, speed, and access to advanced capabilities that would be unrealistic to build and operate independently. The trade-off is reduced direct control.

What is often overlooked, however, is that this trade-off does not disappear in private datacenters or so-called private clouds.

Even fully private environments are deeply dependent on vendors across the entire value chain: operating systems, hypervisors, licensing models, subscription services, development tooling, identity platforms, and documentation systems. Critical functionality can be gated, altered, or withdrawn through licensing and contractual changes, not only through technical failures. Even going fully into open-source has trade offs in integration complexity, and ultimately raises the TCO for your platform in terms of manpower requirements.

Sovereignty, therefore, is rarely, if ever, absolute.

It is about understanding and deliberately choosing which dependencies are acceptable, and under which conditions they remain acceptable.

Azure Local operates in this space intentionally. It does not claim to eliminate vendor dependency. What it changes is where the operational control boundary sits, and what continues to function when external systems, control planes, or connectivity are no longer available.

This is why disconnected operations matter.

They do not remove all risk. They reduce dependency in the scenarios where dependency matters most.

## What Azure Local is and how it differs from traditional on-premises datacenters

Azure Local allows customers to run Azure services in their own datacenters, on hardware they control, while retaining a cloud-native operational and governance model.

This is not traditional virtualization with a cloud management veneer.

Compared to classic on-premises environments, Azure Local provides:

-   Azure-native infrastructure, managed and operated using the same resource model, policies, and identity concepts as Azure.
-   A consistent governance and security model across local, hybrid, and cloud environments.
-   The ability to deploy IaaS, PaaS, and selected SaaS-like services locally, not just virtual machines.

The key difference is not physical location. It is operational alignment.

Traditional datacenters require separate tooling, separate governance models, and often separate teams. Azure Local allows organizations to extend their Azure governance and operating model into their own facilities, reducing divergence while maintaining physical and legal control.

Until recently, however, there was a critical limitation.

## What changed in February 2026: Disconnected operations

As of early 2026, Azure Local supports full disconnected operations.

This means:

-   No runtime dependency on the Azure public control plane.
-   No outbound connectivity required for infrastructure or governance.
-   No customer data leaving the environment.
-   Management, policy enforcement, and operations continue locally.

This matters because sovereignty has always struggled with a simple question:

What happens if connectivity is lost, restricted, or intentionally removed?

Disconnected operations answer that question directly.

Infrastructure, governance, and now AI workloads can continue to operate entirely within the customer’s sovereign boundary. Control does not degrade when connectivity disappears.

This is a significant change from earlier hybrid models where loss of connectivity often meant loss of control.

## AI in disconnected environments: Completing the sovereign stack

Another important development is the expansion of Foundry Local.

Foundry Local now supports large, enterprise-grade AI models in disconnected environments. Not only small edge models, but multimodal models capable of meaningful inference workloads.

Crucially:

-   Models, prompts, and inference results remain local.
-   No prompts or metadata are sent externally.
-   AI can run close to sensitive, regulated, or operational data.

For many organizations, this removes a major blocker.

Customers that previously could not use AI due to sovereignty, data protection, or control plane dependency concerns can now do so without introducing external reliance.

At this point, the sovereign private cloud stack becomes complete:

-   Infrastructure runs locally.
-   Governance is enforced locally.
-   Productivity and AI workloads operate locally.
-   No runtime dependency on public cloud services.

## What disconnected means in practice

Disconnected operations are not only about air-gapped military environments. They are relevant whenever reliance on external control planes is unacceptable.

Typical scenarios include:

-   Intentionally isolated or restricted environments.
-   Security policies that forbid dependency on public control planes.
-   AI workloads handling sensitive or classified data.
-   Mission-critical systems that must continue through prolonged network outages.
-   Environments with extreme latency requirements or near real-time control systems.

From a sovereignty perspective, this changes the dependency question.

The organization can now clearly answer what it depends on to keep running. That answer no longer includes continuous access to the public cloud.

## Why fire drills matter

Disconnected capability is only sovereign if it is proven.

Too many organizations assume disconnection “would probably work” without ever testing it. Sovereignty fails in the gap between theory and reality.

Fire drills should be mandatory.

Organizations using Azure Local in a sovereign context should intentionally test:

-   Loss of all outbound connectivity.
-   Extended operation in fully disconnected mode.
-   Recovery, updates, and governance enforcement without cloud access.
-   Operational readiness of staff when cloud backstops are unavailable.

If disconnected operations only exist on a slide, sovereignty is assumed, not enforced.

## Relevance for Swedish and European customers

In Sweden and across the EU, sovereignty requirements are becoming stricter, not looser.

Regulatory frameworks such as EDPB guidance, DORA, NIS2, and sector-specific requirements increasingly require:

-   Clear control boundaries.
-   Evidence of operational independence.
-   Reduced reliance on foreign jurisdictions for critical systems.

Azure Local with disconnected operations does not eliminate all trust considerations. Microsoft is still a vendor. Software supply chains still matter.

What it does provide is the ability for the customer to retain operational control even when trust is questioned, connectivity is lost, or conditions change.

That distinction is increasingly important.

## For decision makers and the owners of corporate IT capabilities and platforms

Disconnected Azure Local is particularly relevant when you say or hear statements like:

-   “Data must not leave Sweden.”
-   “The environment must not be connected.”
-   “We cannot rely on public AI services.”
-   “AI must not send prompts or metadata externally.”
-   “We need modern capabilities without cloud dependency.”

These are not edge cases. They are becoming mainstream requirements in public sector, critical infrastructure, and regulated industries.

## Closing thoughts

Sovereignty is not about eliminating all dependency. That has never been realistic.

It is about understanding dependencies, choosing them deliberately, and ensuring that control holds when conditions are no longer ideal.

Disconnected operations in Azure Local do not claim to make environments magically independent of vendors, software supply chains, or commercial relationships. What they do is shift a critical dependency boundary. Operational control no longer collapses when connectivity to a public control plane disappears.

That shift matters for organizations where availability, trust, jurisdiction, or accountability cannot be conditional.

The real value of disconnected Azure Local is therefore not the feature itself, but what it forces organizations to confront: what they actually depend on to keep running, and whether those dependencies are acceptable under stress.

Sovereignty is never proven in architecture diagrams or procurement slides. It is proven when assumptions fail.

If sovereignty matters to you, treat disconnection as a first class scenario. Test it deliberately. Operate through it. Learn from it.

Anything less is trust by assumption, not control by design.

_Originally published on [LinkedIn](https://www.linkedin.com/pulse/sovereign-cloud-part-3-disconnected-operations-change-saemundsson-wfkme/) on April 22, 2026._
