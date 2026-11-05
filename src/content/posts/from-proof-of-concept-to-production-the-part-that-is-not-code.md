---
title: "From proof of concept to production: the part that is not code"
date: 2026-10-21T08:02:26+01:00
modified: 2026-11-05T17:00:00+01:00
slug: from-proof-of-concept-to-production-the-part-that-is-not-code
permalink: /2026/10/21/from-proof-of-concept-to-production-the-part-that-is-not-code/
wpId: 969
description: "An app is so much more than the app. What production means beyond the code, where things actually fail, and what SaaSAllTheThings carries from your requirements to the commit, area by area."
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
image: /wp-content/uploads/2026/11/production-envelope-who-carries-it.png
imageAlt: "Eight production areas against four columns: what the brief and workshops ask, what the reference advises, what the check enforces, and what the running system shows. All eight are asked and advised, four are enforced in part by a rule, and each has something only the running system can show."
imageCaption: "The production envelope, and who carries it: what SaaSAllTheThings asks, advises and enforces, and what the running system shows."
---

*Rewritten on 5 November 2026 to match the framework, the reports and the vendors’ documentation as they stand today. First published on 21 October 2026.*

My [last post](/2026/10/21/ddd-among-ai-coding-workflows/) looked at where Director-Driven Development sits among AI coding workflows. This one looks at what comes after the code, because an app is so much more than the app. In an enterprise, a proof of concept becomes production only when the infrastructure, the identities, the monitoring, the backups, the network, the people on call and the evidence for the auditor exist around it. CodeQL finds flaws in code. The door an attacker uses is often somewhere else.

So this post takes the wider view: what production means beyond the code, where things actually fail, what the tools and platforms cover, and what SaaSAllTheThings, my framework for B2B SaaS on Azure, carries from your requirements to the commit. It comes from reading the incident reports, the vendors’ documentation and the framework’s own files. Nothing was run or deployed for it.

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

One idea runs through all of them. A repository can hold the requirement, the design and the infrastructure code. The proof comes from a running system, its logs and a test performed on it.

## Where things actually fail

The 2026 editions of the big incident reports agree on more than I expected, with two cautions: they measure different populations, so their numbers must not be added, and several figures below come from summaries because the full reports were not readable to me.

Verizon’s 2026 Data Breach Investigations Report, covering more than 22,000 confirmed breaches, puts vulnerability exploitation first among entry points at 31 percent of breaches, ahead of stolen credentials for the first time in 19 years. A third party was involved in 48 percent of breaches. Mandiant’s M-Trends 2026, from more than 500,000 hours of incident response, also puts exploits first at 32 percent, for the sixth year running, with voice phishing second. Microsoft’s 2026 Digital Defense Report counts nearly 40,000 published vulnerabilities in the first half of the year, weaponised in well under 24 hours, while enterprise remediation of critical external vulnerabilities “can take 30 to 60 days”. IBM’s 2026 Cost of a Data Breach, from 602 organisations that had a breach, puts the average cost at 4.99 million dollars and the time to identify and contain a breach at 247 days.

Read together, these say three things about people and process.

First, “exploitation” here is mostly not your application code. The named targets are edge devices, VPNs and deployed products, and the failure is a patch that took 30 to 60 days to land. That is exposure management, an operations discipline, and it comes down to ownership and change control. No report I read gives a share for flaws in the victim’s own application code, so I won’t put “code against everything else” in one number. What I can say is that much of what these reports describe sits outside code review.

Second, identity and people are the other door: valid accounts, user execution, phishing by email and by phone, and a human element in a majority of breaches. Third parties add to that, which makes onboarding, offboarding, access review and vendor management part of security.

Third, detection is slow: 247 days to identify and contain, a median dwell of 14 days, 25 days before an outsider tells you. Monitoring and an incident process belong in the plan from the start, because they are the difference between an incident and a notification to the regulator.

The Cloud Security Alliance’s 2026 Top Threats survey of more than 500 experts is opinion rather than incident data, and it points the same way: identity first, AI-enhanced attacks second, third parties and insecure interfaces next, misconfiguration and weak change control fifth, and insecure software development ninth.

## What the tools and platforms cover

AI coding tools now ship real security features. Copilot’s cloud agent runs CodeQL, secret scanning and dependency checks by default, Devin Review includes a security scan in each review it runs, and Cursor’s Bugbot and the newer scans from OpenAI and Anthropic look for vulnerabilities in source. Workflows are moving the same way: GSD has a security gate on by default. They work where the code is, in the editor and the pull request, and that is the right place for them. CodeQL’s language list doesn’t include Bicep, Terraform or ARM templates, and Bugbot doesn’t read credential files or Terraform state.

Enterprises cover the rest with different tools at different stages. Azure Policy has built-in definitions such as “Azure Cosmos DB should disable public network access” and “Azure Key Vault should disable public network access”, and its Deny effect refuses a deployment before the resource provider sees it, while existing resources are marked non-compliant. Microsoft Security DevOps scans infrastructure as code in the pipeline with Template Analyzer, Checkov and Terrascan. Defender for Cloud assesses the deployed estate continually against standards such as ISO/IEC 27001 and NIST SP 800-53, and shows which controls it can’t assess automatically. GitHub exports an SBOM from its dependency graph.

Each set does its own job. CodeQL can’t see a public endpoint, and Azure Policy can’t see an injection flaw. A production-grade pipeline is a stack of gates at commit, at deploy and at run time.

## What SaaSAllTheThings carries

SaaSAllTheThings is built on the idea that the customer’s own security framework and control requirements live in the repository and shape every architecture decision. It is anchored in that framework; it isn’t compliance as code. Here is what it does with your requirements, from the first brief to the release.

-   **The brief and the questions.** You name your security framework and the control frameworks that apply, with the version, what applies and what evidence is expected from whom. If that part is blank or vague, onboarding and the assessment ask: which framework, which markets and whose data, which regulations such as GDPR, NIS2, DORA, SOC 2, PCI DSS or HIPAA, and who audits. The requirement text or your own control list goes in a compliance folder.
-   **Assessment and workshops.** An assessment scores nine dimensions, including configuration and secrets, identity, and delivery and operations, and picks the workshops. Tenancy and identity puts the security officer and the data protection officer in the room. Operations covers just-in-time production access, managed identities, Key Vault, a threat review of the target picture, recovery point and time, support and cost.
-   **Architecture sessions.** Every session reads the compliance folder, the requirements and the mapping table, and flags any conflict with the reference design. Each option states its effect on the OWASP baseline, item by item, and is weighed against least privilege, defence in depth, zero trust, data minimisation and “any standard named in the compliance requirements”. Only the human accepts the decision.
-   **Research.** The customer’s framework is the top-tier source. Each requirement is traced to a control, and the trace is labelled direct, partial, interpretive or unverified.
-   **The mapping table.** It ties each control to the rule, workflow job, decision or test that meets it, with a label and where the evidence is. The ten OWASP rows are there from the start. The controls of your own framework come from you or from a document you provide, and reviews and alignment passes report rows that have gone stale.
-   **The check.** It fails the build on ten rules: layering, domain purity, two tenant-isolation rules, secrets patterns, file and host size, message versioning, cost-driven SKU choice, and public network access and local authentication in Bicep. The only way past a failing rule is an accepted decision record naming the rule and the file.
-   **The security assessment.** `/security` runs the check’s rules, dependency audits and Semgrep where it is installed, then a fresh reader goes through the OWASP checklist. Findings become bug items, and what only people can do comes to you as a list. It runs before a release, and an open high OWASP bug stops the release unless you accept a deviation from that item.
-   **The workflow.** Onboarding offers a template that runs the check on every pull request and keeps its output as evidence, reviews the dependencies a pull request changes, and exports an SBOM on each push to main.

## Who carries what, area by area

No framework carries all eight areas alone, and it shouldn’t try. This is what SaaSAllTheThings brings to each, and what stays with your platform and your people.

| Area | What the framework brings | Form | What your platform and people bring |
| --- | --- | --- | --- |
| Infrastructure and change | Bicep conventions, dev and prod separation, prod from a tag behind approval, what-if first, smoke test after, Bicep compiled in the check | Reference, two rules | The pipeline, the landing zone, Azure Policy |
| Monitoring | Structured logs with tenant and correlation ids, no personal data in logs, alerts in Bicep, a health endpoint | Advised | Alert routes, on-call, incident response, log retention, SIEM |
| Compliance evidence | Requirements, decision log, decision records, mapping table, security reports, research notes, and the check’s output as a CI artifact | Records | Operating evidence over time: access reviews, pipeline approvals, restore tests |
| Personal data | Retention, residency and personal fields decided in the requirements; personal data kept out of logs and keys; deletion as a capability | Advised | Classification, DPIA, a deletion that ran |
| Access | Token validation, managed identities, no client secrets, groups not individuals, just-in-time where the customer has it; hooks block force-push, resource deletion and reading secret values | Three rules, the rest advised | Role assignments, MFA and conditional access in your tenant, access reviews |
| Continuity | Continuous backup by default, one region, scaling up by decision record; the workshop asks for recovery point and time | Defaults and prompts | DR design, failover, a restore test, a runbook |
| Networking | Public access off and local authentication off on Service Bus, Cosmos DB, Key Vault and Storage; private endpoints; outbound-only integrations | A rule on Bicep, on for new apps | The virtual network, private DNS, egress control, Azure Policy |
| Supply chain | Domain and contract layers take no external packages; local Bicep modules; dependency review and an SBOM in the workflow; dependency audits in `/security` | A rule, workflow jobs, audits | Vulnerability response, provenance, supplier assessment |

Two things sit with your organisation by design. The check runs in a pre-commit hook and, in Claude Code, a stop hook, and the workflow takes it to every pull request once you add it. And an accepted decision is binding because of branch protection and pull request review, which the security assessment puts on your list.

## What you get from it

No framework can guarantee stability or compliance, and this one doesn’t try to. It is a tool, and its loops help you on that journey. Your security and architecture requirements become design records and a build gate. The customer’s framework lives in the repository, and every architecture session reads it. Every decision and change leaves a record a reviewer can read. The running system then provides the operating evidence.

The incident reports make the case for that structure. The failures that cost the most are failures of ownership, change control, access review and detection, and a workflow built on written requirements, named owners, accepted decisions and a gate is aimed at exactly those. On the pages I read for my last post, no other package asks which regulation applies to your product, or has architecture rules in the check with an accepted decision record as the only way past them.

## What comes next

The next step is a pilot. I will deploy the example app to an Azure sandbox with Azure Policy deny assignments and Defender for Cloud on, test it from outside and write down what I find. An auditor reading the records is the step after that.

If you run a platform or a security function and would like to be part of that, I would like to hear from you on [LinkedIn](https://www.linkedin.com/in/vikingur-saemundsson/). And if you take an app built with SaaSAllTheThings to production, I would love to interview you about it.

## Sources

Breach and incident reports: [Verizon, 2026 Data Breach Investigations Report](https://www.verizon.com/business/resources/reports/dbir/) and its [news release](https://www.verizon.com/about/news/breach-industry-wide-dbir-finds); [IBM, Cost of a Data Breach 2026](https://www.ibm.com/reports/data-breach); [Microsoft, 2026 Digital Defense Report](https://www.microsoft.com/en-us/security/security-insider/threat-landscape/2026-digital-defense-report); [Mandiant M-Trends 2026](https://cloud.google.com/blog/topics/threat-intelligence/m-trends-2026); [Cloud Security Alliance, Top Threats 2026](https://cloudsecurityalliance.org/press-releases/2026/08/13/ai-emerges-as-an-attack-enabler-and-target-in-csa-2026-top-threats-report). Several figures (human element, breach count, external notification, IBM’s time to contain) come from secondary summaries of these reports; the full reports were too large or unreadable in my tools.

Platform and standards: [Azure Well-Architected pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars); [Cloud Adoption Framework landing zone design areas](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/design-areas); [Shared responsibility in the cloud](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility); [Azure Policy deny effect](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-deny) and the [Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging/policy-reference) and [Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/policy-reference) built-in definitions; [Scan infrastructure as code with Microsoft Security DevOps](https://learn.microsoft.com/en-us/azure/defender-for-cloud/iac-vulnerabilities); [Service Bus private endpoints](https://learn.microsoft.com/en-us/azure/service-bus-messaging/private-link-service); [Cosmos DB continuous backup](https://learn.microsoft.com/en-us/azure/cosmos-db/continuous-backup-restore-introduction); [GDPR Articles 32](https://gdpr-info.eu/art-32-gdpr/) and [33](https://gdpr-info.eu/art-33-gdpr/); [ISF Standard of Good Practice](https://www.securityforum.org/solutions-and-insights/standard-of-good-practice-for-information-security/).

Tool documentation: [CodeQL supported languages](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/); [GitHub secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) and [SBOM export](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/exporting-a-software-bill-of-materials-for-your-repository); [Cursor Bugbot](https://cursor.com/docs/bugbot); [Devin Review](https://docs.devin.ai/work-with-devin/devin-review); [Codex Security](https://learn.chatgpt.com/docs/security); [GSD](https://github.com/open-gsd/gsd-core).

SaaSAllTheThings, read at its latest release on 5 November 2026: [v0.16.1](https://github.com/Freakling/SaaSAllTheThings/tree/v0.16.1). Nothing was run and no deployment was made.

The research notes behind this post, with their sources, tiers and open gaps, are in the Director-Driven Development repository: [the facts in this post, checked on 5 November 2026](https://github.com/Freakling/Director-Driven-Development/blob/main/product/research/2026-11-05-outside-facts-of-the-production-post.md), [from proof of concept to production in an enterprise](https://github.com/Freakling/Director-Driven-Development/blob/main/product/research/2026-10-21-production-readiness-operating-envelope-and-saasallthethings.md) and [production readiness of AI coding tools](https://github.com/Freakling/Director-Driven-Development/blob/main/product/research/2026-10-20-production-readiness-of-ai-coding-tools.md). The earlier post this one extends: [Where Director-Driven Development sits among AI coding workflows](/2026/10/21/ddd-among-ai-coding-workflows/).
