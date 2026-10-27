---
title: "From proof of concept to production: the part that is not code"
date: 2026-10-21T08:02:26+01:00
modified: 2026-10-21T08:02:26+01:00
slug: from-proof-of-concept-to-production-the-part-that-is-not-code
permalink: /2026/10/21/from-proof-of-concept-to-production-the-part-that-is-not-code/
wpId: 969
description: "My last post compared Director-Driven Development with other AI coding workflows and ended on a narrow claim: AI tools generate and review code, and my frameworks make the architecture and security requirements part of “done”. Writing it, I kept bumping into a bigger objection, my own: an app is so much more than the app."
categories:
  - director-driven-development
tags:
  - ai-coding-agents
  - azure
  - cloud-governance
  - director-driven-development
  - saasallthethings
  - security-framework
author: Vikingur Saemundsson
image: /wp-content/uploads/2026/10/production-envelope-scaled.png
imageAlt: ""
---

My last post compared Director-Driven Development with other AI coding workflows and ended on a narrow claim: AI tools generate and review code, and my frameworks make the architecture and security requirements part of “done”. Writing it, I kept bumping into a bigger objection, my own: an app is so much more than the app. In an enterprise, a proof of concept becomes production only when the infrastructure, the identities, the monitoring, the backups, the network, the people on call and the evidence for the auditor exist around it. CodeQL finds flaws in code. The door an attacker uses is often somewhere else.

So this post takes the wider view. What does production readiness mean beyond the code? What do the breach reports say about where things actually fail? What do AI coding tools cover at those layers, and what do enterprises use instead? And what does my SaaS framework, SaaSAllTheThings, actually do when you hand it your security framework, such as the ISF Standard of Good Practice? I read its latest release file by file to answer that last one, and the answer is narrower than what I had been saying. The research notes with every source are linked at the end.

## What production means, beyond the code

There is no single checklist, so I used the ones enterprises already use to name the areas: the Azure Well-Architected pillars, the Cloud Adoption Framework’s landing-zone design areas, GDPR Articles 32 and 33, and the control titles of ISO/IEC 27002. The envelope around a business-critical system comes out as eight areas.

-   **Infrastructure and change:** environments as code, reviewed change, no drift between the template and the estate.
-   **Monitoring and operations:** observability, alert routes, incident response. GDPR gives a controller 72 hours from awareness to notify, so detection and escalation have to exist before go-live.
-   **Compliance evidence:** proof that controls operated over time, not only that they were designed.
-   **Personal data:** classification, minimisation, retention, residency, deletion.
-   **Access:** identities, MFA, least privilege, just-in-time access to production, periodic reviews. In every cloud service model the customer keeps the data, the configuration and the identities.
-   **Continuity and recovery:** recovery point and time, backups, and a restore that has been tested, which GDPR Article 32 asks for in as many words.
-   **Networking:** public access off, private endpoints, local authentication off, controlled egress.
-   **Supply chain:** dependencies, third parties, pipeline identity.

One judgment runs through all of them. A repository can hold the requirement, the design and the infrastructure code. It cannot hold the proof. Each of these areas is shown by a running system, its logs and a test performed on it.

## Where things actually fail

The 2026 editions of the big incident reports agree on more than I expected, with two cautions: they measure different populations, so their numbers must not be added, and several figures below come from summaries because the full reports were not readable to me.

Verizon’s 2026 Data Breach Investigations Report, covering more than 22,000 confirmed breaches, puts vulnerability exploitation first among entry points at 31 percent of breaches, ahead of stolen credentials for the first time in 19 years. A third party was involved in 48 percent of breaches. Mandiant’s M-Trends 2026, from more than 500,000 hours of incident response, also puts exploits first at 32 percent, for the sixth year running, with voice phishing second. Microsoft’s Digital Defense Report 2026 counts nearly 40,000 published vulnerabilities in the first half of the year, weaponised in well under 24 hours, while enterprise remediation of critical external vulnerabilities “can take 30 to 60 days”. IBM’s 2026 Cost of a Data Breach, from 602 breaches, puts the average cost at 4.99 million dollars and the time to identify and contain a breach at 247 days, the first rise in five years; 53 percent of the breached organisations lacked encryption for sensitive data at rest or in transit.

Read together, these say three things about people and process.

First, “exploitation” here is mostly not your application code. The named targets are edge devices, VPNs and deployed products, and the failure is a patch that took 30 to 60 days to land. That is exposure management, an operations discipline, and it fails for reasons of ownership and change control rather than coding skill. No report I read gives a share for flaws in the victim’s own application code, so I cannot put “code against everything else” in one number. What I can say is that code review alone addresses a minority of what these reports describe.

Second, identity and people are the other door: valid accounts, user execution, phishing by email and by phone, and a human element in a majority of breaches. Third-party involvement rose from 30 to 48 percent of breaches in one year. Those are process failures in onboarding, offboarding, access review and vendor management, and they happen in organisations with good code.

Third, detection is slow. 247 days to identify and contain, a median dwell of 14 days, 25 days before an outsider tells you. Monitoring and an incident process are not nice-to-haves after launch. They are the difference between an incident and a notification to the regulator.

On misconfiguration specifically, the only source that ranks it first is the Cloud Security Alliance’s survey of more than 500 experts, which is perception rather than incident data. I include it because its order matches what I see in practice: misconfiguration and weak change control, identity, insecure interfaces, and only in sixth place insecure software development.

## What the tools cover at these layers

My earlier post found that the AI coding tools now ship real security features: Copilot’s cloud agent runs CodeQL, secret scanning and dependency checks by default; Devin reviews every pull request for security flaws and cannot be switched off; Cursor’s Bugbot and the newer Codex and Claude Code security scans look for vulnerabilities in source. Looked at against the envelope, they all sit in the same place: the editor and the pull request, on source code. CodeQL does not list Bicep, Terraform or ARM templates among its languages. Bugbot deliberately does not read credential-like files or Terraform state. Codex Security’s own documentation says a scan with no findings can still miss vulnerabilities, and none of them mentions infrastructure configuration, identity or runtime.

Enterprises close that gap with different tools at different stages. Azure Policy has built-in definitions such as “Cosmos DB should disable public network access” and “Key Vault should disable public network access”, and its Deny effect refuses the deployment before the resource provider ever sees it, while existing resources are only marked non-compliant. Microsoft Security DevOps scans infrastructure as code in the pipeline with Template Analyzer, Checkov and Terrascan. Defender for Cloud assesses the deployed estate continuously against standards such as ISO/IEC 27001 and NIST SP 800-53, and is honest that some controls cannot be assessed automatically. GitHub exports an SBOM from its dependency graph.

Neither set replaces the other. CodeQL cannot see a public endpoint, and Azure Policy cannot see an injection flaw. That is the first correction to my framing: a production-grade pipeline is a stack of gates at commit, at deploy and at run time, and no coding tool, mine included, covers more than one of them.

## What SaaSAllTheThings does with your security framework

SaaSAllTheThings is my framework for B2B SaaS on Azure, built on the idea that the customer’s own security framework and control requirements live in the repository and shape every architecture decision. I had been describing that as a full supply-chain view that brings more security and easier compliance proof than other tools. Here is what the latest release actually does, from its files.

The path starts with a human. You name your security framework and the control frameworks that apply in the director brief, with the version, what applies and what evidence is expected from whom, and you put the requirement text or your own control list in a compliance folder. Nothing parses it. An assessment procedure reads the brief, scores nine dimensions, including configuration and secrets, identity, and delivery and operations, and picks workshops. The workshops cover vision and constraints, tenancy and identity with the security officer and the data protection officer in the room, integration and credentials, and operations: just-in-time production access, managed identities, Key Vault, a threat review of the target picture, recovery point and time, support and cost. Their outputs go into the requirements document, the decision log and draft architecture decision records.

Every architecture session then reads the compliance folder and the requirements document’s Data and Compliance section, flags a conflict between a requirement and the reference design, weighs each option against OWASP, least privilege, defence in depth, zero trust, data minimisation and “any standard named in the compliance requirements”, and states the security and compliance impact of each option. Only the human accepts the decision. The research procedure treats the customer’s security framework as the top-tier source, traces each requirement to a control, labels the trace as direct, partial, interpretive or unverified, and never lets text from the compliance folder into a public search.

Then there is the check. It fails the build on nine rules: layering, domain purity, two tenant-isolation rules, secrets patterns, file and host size, message versioning and cost-driven SKU choice. The only way past a failing rule is an accepted decision record naming the rule and the file, and a proposed decision does not count. That part holds, and I found nothing like it in the other tools.

Now the gaps, area by area against the envelope.

<figure><img src="/wp-content/uploads/2026/10/production-envelope-scaled.png" alt="The production envelope against SaaSAllTheThings at its latest release: what the workshops ask, what the reference advises, what the check enforces, and what is not found." loading="lazy" decoding="async"><figcaption>The production envelope against SaaSAllTheThings at its latest release: what the workshops ask, what the reference advises, what the check enforces, and what is not found.</figcaption></figure>

| Area | What the release has | Form | What is missing |
| --- | --- | --- | --- |
| Infrastructure and change | Bicep conventions, dev and prod separation, prod from a tag behind approval, what-if first, Bicep compiled in the check | Reference text, one Bicep rule | No shipped pipeline; network, tags and diagnostics not checked |
| Monitoring | Structured logs with tenant and correlation ids, no personal data in logs, alerts in Bicep, a health endpoint | Advised | Incident response, runbooks, on-call, log retention, SIEM |
| Compliance evidence | Requirements, decision log, decision records, items with outcomes, assessment and workshop notes, research notes | Records | Operating evidence; check results are not kept unless the project adds CI |
| Personal data | Retention, residency and personal fields decided in the requirements; personal data kept out of logs and keys; deletion as a capability | Advised | No rule in the check; no classification scheme, DPIA or deletion test |
| Access | Token validation, managed identities, no client secrets, groups not individuals, just-in-time where the customer has it; hooks block force-push, resource deletion, reading secret values | Three rules enforced, the rest advised | Role assignments, MFA and conditional access live in the tenant, not the repository |
| Continuity | Continuous backup by default, one region, scaling up by decision record; the workshop asks for recovery point and time | Defaults and prompts | DR design, failover, restore test, runbook |
| Networking | Outbound-only or VPN for integrations; local authentication off | Absent as a requirement | Private endpoints, egress control; the default Service Bus tier cannot be private-only, so private networking is a decision-record-with-exception path, not the default |
| Supply chain | Domain and contract layers take no external packages; local Bicep modules only; one contract per external system | Partly enforced | Dependency scanning, SBOM, provenance, supplier assessment |

Two more limits belong here. The gate is a local pre-commit hook and, in Claude Code, a stop hook; no CI ships with the framework, so a passing check leaves no record off the developer’s machine unless the project adds one. And “only the human accepts a decision” rests on a rule and a hook that asks before writing “accepted”. The status is a line of text. Branch protection and pull request review are what make it binding, and the framework does not set those up for you.

## The claims, checked

-   **“A full supply-chain view.”** Does not hold. For the delivery chain, requirement to commit, it holds in part: the records link a requirement to a decision to an item to a commit. For components and vendors, there is no SBOM, no dependency scanning, no provenance and no supplier assessment. I will stop saying it.
-   **“More security than others.”** Not as stated. The narrow version holds: tenant source, tenant branching, secret patterns and layering are enforced where other tools advise. The wide version fails: Copilot ships code scanning, secret scanning and dependency checks by default, and SaaSAllTheThings ships none of those. Proving “more” would take a measured comparison on sample applications and a penetration test.
-   **“Easier compliance proof.”** Plausible for design-stage evidence, unproven beyond it. The requirements and the named framework are in the repository, every architecture session reads them, and every deviation is a decision you accepted. No release maps a rule or a test to a control identifier, no auditor has read these records, and the operating evidence, access reviews, pipeline approvals, restore tests, comes from the running system.
-   **“Cannot exfiltrate through public endpoints.”** Not on the records. There is no network requirement and no rule for it.
-   **“Production-ready.”** No. Same answer as last time: that needs a deployment and an audit.

What does hold, in sentences I am comfortable publishing: your security and architecture requirements become design records and a build gate; the customer’s framework lives in the repository and every architecture session reads it; every decision and change leaves a record a reviewer can read; and the running system, not the repository, provides the operating evidence.

## Does this change the equation?

Yes, in both directions. It makes the case for structure stronger: the breach reports say the failures that cost the most are failures of ownership, change control, access review and detection, and a workflow whose whole point is written requirements, named owners, accepted decisions and a gate is aimed at exactly that. It also makes my framework’s reach smaller than I was claiming. Of the eight areas, it enforces parts of three, advises on six, and is silent on networking and the component supply chain.

So the work is clear, and it is the same work for anyone taking an AI-built proof of concept toward production. On the framework side: a network posture topic with a rule on public network access and local authentication, a shipped CI workflow that keeps the check’s output as evidence, a seeded mapping table from control identifier to requirement to rule or test, a continuity topic with a restore-test item, and a dependency view. On the proof side: a pilot deployment with Azure Policy deny assignments and Defender for Cloud, tested from outside, and then an auditor reading the records. Until that pilot exists, the honest sentence is that the framework carries the requirements and the design to the commit, and the enterprise’s own platform controls and people carry them the rest of the way.

If you run a platform or a security function and would like to be that pilot, I would like to hear from you.

## Sources

Breach and incident reports, read 21 October 2026: [Verizon, 2026 Data Breach Investigations Report](https://www.verizon.com/business/resources/reports/dbir/) and its [news release](https://www.verizon.com/about/news/breach-industry-wide-dbir-finds); [IBM, Cost of a Data Breach 2026](https://www.ibm.com/reports/data-breach); [Microsoft Digital Defense Report 2026](https://www.microsoft.com/en-us/security/security-insider/intelligence-reports/microsoft-digital-defense-report-2026); [Mandiant M-Trends 2026](https://cloud.google.com/security/resources/m-trends); [Cloud Security Alliance, Top Threats to Cloud Computing 2024](https://cloudsecurityalliance.org/artifacts/top-threats-to-cloud-computing-2024). Several figures (human element, credential abuse, dwell time, IBM root causes) come from secondary summaries of these reports; the full reports were too large or unreadable in my tools.

Platform and standards: [Azure Well-Architected pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars); [Cloud Adoption Framework landing zone design areas](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-areas); [Shared responsibility in the cloud](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility); [Azure Policy deny effect](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-deny) and the [Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging/policy-reference) and [Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/policy-reference) built-in definitions; [Scan infrastructure as code with Microsoft Security DevOps](https://learn.microsoft.com/en-us/azure/defender-for-cloud/iac-vulnerabilities); [Service Bus private endpoints](https://learn.microsoft.com/en-us/azure/service-bus-messaging/private-link-service); [Cosmos DB continuous backup](https://learn.microsoft.com/en-us/azure/cosmos-db/continuous-backup-restore-introduction); [GDPR Articles 32](https://gdpr-info.eu/art-32-gdpr/) and [33](https://gdpr-info.eu/art-33-gdpr/); [ISF Standard of Good Practice](https://www.securityforum.org/solutions-and-insights/standard-of-good-practice-for-information-security/).

Tool documentation: [CodeQL supported languages](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/); [GitHub secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) and [SBOM export](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/exporting-a-software-bill-of-materials-for-your-repository); [Cursor Bugbot](https://cursor.com/docs/bugbot); [Devin Review](https://docs.devin.ai/work-with-devin/devin-review); [Codex Security](https://learn.chatgpt.com/docs/security); [Claude Code Security](https://www.anthropic.com/news/claude-code-security).

SaaSAllTheThings at its latest release: [the repository](https://github.com/Freakling/SaaSAllTheThings), read file by file: rules, procedures, workshops, reference pages, templates, the check and its hooks. Nothing was run and no deployment was made; “not found” means not found in those files.

The research notes behind this post, with every claim, source, tier and confidence, and the open gaps: [production readiness of AI coding tools](https://github.com/Freakling/Director-Driven-Development/blob/main/product/research/2026-10-20-production-readiness-of-ai-coding-tools.md) and [from proof of concept to production in an enterprise](https://github.com/Freakling/Director-Driven-Development/blob/main/product/research/2026-10-21-production-readiness-operating-envelope-and-saasallthethings.md). The earlier post this one extends: [Where Director-Driven Development sits among AI coding workflows](/2026/10/21/ddd-among-ai-coding-workflows/).
