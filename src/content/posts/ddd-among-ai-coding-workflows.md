---
title: Where Director-Driven Development sits among AI coding workflows
date: 2026-10-21T08:00:51+01:00
modified: 2026-10-21T08:01:04+01:00
slug: ddd-among-ai-coding-workflows
permalink: /2026/10/21/ddd-among-ai-coding-workflows/
wpId: 966
description: What the AI coding tools and workflows of 2026 ship, what Director-Driven Development shares with them, where it stands alone, and which of my own claims survive the vendors’ documentation and the evidence on AI-generated code.
categories:
  - director-driven-development
tags:
  - ai-coding-agents
  - claude-code
  - developer-workflow
  - director-driven-development
  - software-architecture
author: Vikingur Saemundsson
image: /wp-content/uploads/2026/10/comparison-matrix-scaled.png
imageAlt: "What each way of working ships, on nine dimensions. The colours mean enforced by a check or hook, described in docs or process, or not found on the pages read; they are not a ranking, and the rows are DDD's own concepts. From vendor documentation read in October 2026."
imageCaption: "What each way of working ships, on nine dimensions. The colours mean enforced by a check or hook, described in docs or process, or not found on the pages read; they are not a ranking, and the rows are DDD’s own concepts. From vendor documentation read in October 2026."
---

I built Director-Driven Development because the second prompt kept going wrong: the fix after the demo, the feature on top of something that already worked. Since then the tools have moved fast, and I owed myself an honest look at what the alternatives do now, what my way of working shares with them, where it stands alone, and where it claims too much. This post is that look. It comes from reading the vendors’ own documentation and best-practice guides in October 2026, not from benchmarks, so it says what each one ships or prescribes, not how well it works.

The alternatives, in four groups: plain agent use (Claude Code, Cursor, Copilot’s agent mode, Codex, Gemini CLI); spec-driven workflows (Kiro, GitHub’s spec-kit, the BMAD method, and published practitioner methods such as Addy Osmani’s and Harper Reed’s); agent harnesses (Aider, Cline, Roo Code, OpenHands); and autonomous agents (Devin, Codex cloud, Jules, Copilot’s cloud agent).

## What is common practice now

Most of the ideas I started from are mainstream in 2026, and that is good news, not bad.

-   **Verification as the core loop.** Anthropic’s Claude Code guide opens with “give Claude a way to verify its work”; Devin’s guide asks for tests, linters and concrete pass conditions; Aider re-runs tests after every edit and tries to fix what fails. DDD’s check is the same idea with a fixed name and exit codes.
-   **Spec first, small tasks, fresh contexts.** Osmani, Reed, Kiro, spec-kit and the Claude guide (“interview you, write SPEC.md, start a fresh session”) all say it. DDD’s one-item-one-context is the same move.
-   **Instruction files.** AGENTS.md is read by Cursor, Codex and Jules, so my choice of it is no longer a choice.
-   **Review in a fresh context.** The Claude guide recommends an adversarial reviewer subagent in nearly the words of DDD’s review rule.
-   **Hooks for guarantees.** The same guide draws the line I draw: instruction files are advisory, hooks are deterministic.

If you are doing those five things with any tool, you are most of the way to this way of working already.

## Where it stands alone, as far as I could find

Reading overview pages, not every sub-page, these were not found anywhere else:

-   **A decision log tied to dated research notes**, each with its sources, confidence and a “verified as of” date, so a later session reuses the evidence instead of redoing it.
-   **A size-keyed model map with a one-step escalation and a two-attempt stop.** Cline and Roo pick a model per mode, Osmani per task; none ties it to a written size scale with a retry rule.
-   **A named drift reset that only the director can start**, beside a routine alignment pass over the records and the code. Kiro and spec-kit check a spec’s internal consistency, which is narrower.
-   **An ownership table with placeholders** for what the human owns, backed by a hook that blocks the agent from the director’s own workspace.
-   **Architecture rules inside the build check**, with an accepted decision record as the only way past them. The Claude guide tells you to write such hooks yourself; spec-kit’s gates are checkboxes in a template that the model fills in.

The honest qualifier: “not found” on the pages I read, and vendors ship monthly.

## Where others do more

-   **Isolation and scale:** OS-level sandboxes, cloud runs, parallel worktrees, agent teams and batch fan-out in Claude Code; Copilot’s ephemeral cloud environment; Jules’s virtual machine. DDD runs where you run it.
-   **Autonomous loops with an evaluator** and a permissions classifier.
-   **Spec depth:** Kiro’s wave-based parallel tasks and property-based tests, spec-kit’s presets and extensions, BMAD’s multi-role sessions.
-   **Team enforcement:** Cursor’s enforced team rules, Copilot’s organisation instructions and rulesets.
-   **Rewind:** checkpoints that restore both the conversation and the code.
-   **Tool reach:** IDE integration, MCP servers, plugin marketplaces. DDD ships as Markdown, shell and skills, with no IDE surface, and its enforcement exists only in the three domains it has frameworks for: Godot games, small apps, B2B SaaS on Azure.

## The claim I wanted to make, and what survives

My working line was: others help you make something that works; DDD gets you to software you can prove is stable, tested and compliant. Checked against what the vendors ship, half of that is wrong.

**“Others stop at working” is false.** GitHub’s Copilot cloud agent runs CodeQL, secret scanning and dependency checks by default, needs a human to approve its workflow runs, and cannot approve or merge its own pull request. Devin’s review scans every pull request for security issues and cannot be turned off. Claude Code’s hooks can fail a turn until a check passes. Every vendor also puts the final review of the output with you, in writing.

**What they don’t ship** is the package: architecture rules as part of “done”, exceptions only through a decision record you accept, and the customer’s own security framework living in the repository where every architecture session reads it. That is what SaaSAllTheThings does, and I did not find it elsewhere.

**“Provably stable” and “compliant” don’t survive either.** I have no production deployment data, no independent quality measurement and no audit. The vendors’ SOC 2 and ISO 27001 certificates cover their services, not the software built with them, and no regulation I read requires a particular gate on AI-written code; a customer’s control framework and its auditor decide what evidence counts. My own earlier post said that people own compliance, not the framework. It still does.

The evidence that a gate matters, though, is real and independent of me. Veracode found security flaws in 45 percent of its tests of AI-generated code, with newer and larger models no better. CodeRabbit counted 1.7 times the issues per AI co-authored pull request, and 1.6 times the security issues, in 470 pull requests with authorship inferred. DORA associates a 25 percent rise in AI adoption with 7 percent less delivery stability. A study of 4,022 agent pull requests found a security smell in 39 percent, and that human review missed 81 percent of the hard-coded credentials among them. Review alone does not catch this; a deterministic check does, which is the whole argument for putting the rules in the check.

So the line that holds is shorter: **AI tools generate and review; Director-Driven Development makes the architecture and security requirements part of done, and leaves records a reviewer can read.** Anything stronger needs a production run or an audit, and I will write that post when I have one.

## Sources

Vendor documentation, read 19 and 20 October 2026: [Anthropic, Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) and [Claude Code security](https://code.claude.com/docs/en/security); [GitHub, about the Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent) and its risks and mitigations page; [GitHub spec-kit](https://github.com/github/spec-kit) and its [spec-driven.md](https://github.com/github/spec-kit/blob/main/spec-driven.md); [Kiro specs](https://kiro.dev/docs/specs/) and [hooks](https://kiro.dev/docs/hooks); [BMAD method](https://github.com/bmad-code-org/BMAD-METHOD); [Cursor rules](https://cursor.com/docs/context/rules) and [Bugbot](https://cursor.com/docs/bugbot); [OpenAI Codex, AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) and [security](https://learn.chatgpt.com/docs/security); [Jules](https://jules.google/docs); [Devin, instructing Devin](https://docs.devin.ai/essential-guidelines/instructing-devin-effectively) and [Devin Review](https://docs.devin.ai/work-with-devin/devin-review); [Cline, plan and act](https://docs.cline.bot/features/plan-and-act); [Roo Code modes](https://roocodeinc.github.io/Roo-Code/basic-usage/using-modes); [Aider, lint and test](https://aider.chat/docs/usage/lint-test.html); [Gemini CLI context files](https://google-gemini.github.io/gemini-cli/docs/cli/gemini-md.html); [OpenHands](https://docs.openhands.dev/).

Practitioner methods: [Addy Osmani, my AI coding workflow](https://addyosmani.com/blog/ai-coding-workflow/); [Harper Reed, my LLM codegen workflow](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/).

Evidence on AI-generated code: [Veracode, GenAI Code Security Report 2025](https://www.veracode.com/resources/analyst-reports/2025-genai-code-security-report/); [CodeRabbit, State of AI vs human code](https://coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report); [GitClear, AI code quality 2025](https://www.gitclear.com/ai_assistant_code_quality_2025_research); [DORA, the impact of generative AI in software development](https://dora.dev/ai/gen-ai-report); [security smells in agent pull requests, arXiv 2607.12428](https://arxiv.org/abs/2607.12428); [Perry et al., do users write more insecure code with AI assistants, arXiv 2211.03622](https://arxiv.org/abs/2211.03622). Regulation and standards consulted: [NIST SP 800-218A](https://csrc.nist.gov/pubs/sp/800/218/a/final), [EU AI Act, Article 15](https://artificialintelligenceact.eu/article/15/).

The two research notes behind this post, with the full comparison matrix and the gaps in what was read, are in the Director-Driven Development repository: [the comparison](https://github.com/Freakling/Director-Driven-Development/blob/main/product/research/2026-10-20-ddd-compared-with-other-ai-coding-workflows.md) and [production readiness](https://github.com/Freakling/Director-Driven-Development/blob/main/product/research/2026-10-20-production-readiness-of-ai-coding-tools.md).
