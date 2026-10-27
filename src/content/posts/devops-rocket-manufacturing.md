---
title: DevOps & Rocket manufacturing
date: 2021-10-01T17:21:00+01:00
modified: 2026-10-07T17:28:34+01:00
slug: devops-rocket-manufacturing
permalink: /2021/10/01/devops-rocket-manufacturing/
wpId: 892
description: Elon Musk’s 5 steps to building rockets apply to just about any process in any industry, including IT and DevOps.
categories:
  - uncategorized
tags:
  - automation
  - continuous-improvement
  - devops
  - engineering
  - spacex
author: Vikingur Saemundsson
---

<img src="/wp-content/uploads/2026/10/image-11-1024x576.png" alt="" width="1024" height="576" loading="lazy" decoding="async">

I was catching up on one of my favourite youtube channels (Everyday Astronaut) during my morning coffee. The video is a SpaceX tour with Elon Musk and basically from nowhere Elon Musk starts to describe DevOps processes and how they apply to SpaceX design process and production line.

He describes 5 steps to building rockets, but this can be implemented to just about any process in any industry. I have paraphrased the steps and taken the liberty to expand on some steps in order to apply to the industry I’m working in.

1.  Make your requirements less dumb. – “Your requirements are definitely dumb. It does not matter who gave the requirements. It’s particularly dangerous if a smart person defined the requirements”.
2.  Delete the part or process step – For IT the parts are often an infrastructure component or a part of an application (function, microservices etc.). Run tight margins on what makes it into the product. Any part or process that is not critical should be added to a backlog and re-added when needed. Build a MVP (minimum viable product), only add what you need and focus on what matters without over-engineering. Another take-away from this is that requirements and constraints must be owned by a person and never a department. You can’t ask a department why a requirement or constraint is in place since people move around or leave the organization. Design decisions, processes and products should have ownership of an individual. If we trace back to a department we might loose the detailed how and why of a part or process. Review all parts of the process, and remove what does not fit the requirements.
3.  Simplify or Optimize – “It’s very common of a smart engineer is to optimize something that should not exist”. Focus on your requirements before working on optimizing.
4.  Accelerate cycle time – “You’re moving too slowly, go faster.” But don’t go faster unless you have cycled through the first three steps. Focus on the constraining process in your delivery chain, if it is a manual process or an automated build/release process you can always go faster
5.  Automate, but only when step 1-4 are cycled through. We often go in the opposite direction. We often automate or fix the automation before we fix the process. I can attest that as a self-proclaimed automation aficionado I stumble down this rabbit hole a bit too often. Automate the part or process you have identified as the most impactful part/constraint of your delivery chain. When you’re done revert back to step 1 and work your way through the process again.

These five steps are so intuitive when read as listed above, but often extremely difficult to apply when in the middle of a project.

Now, how is this related to DevOps? What Elon is listing is a process that can be directly linked to several core concepts in DevOps, and most importantly the “three ways”.

Work always flows in one direction – Downstream. Focus on what matters and don’t optimize downstream. The concept “shift-left” is often cited here. – The process of never optimizing at the end

Create, shorten and amplify feedback loops. Here we often talk about failing fast – The process of segmenting a product into small manageable chunks that can be developed, tested, deployed and re-iterated upon without having to rebuild the whole project before testing

Continued experimentation, in order to learn from mistakes, and achive mastery. In Elon Musks 5 steps, this is highly related to his 2nd step, where we always review and re-iterate on our needs and create a mindset focused on our requirements and how to approach them. When we have a good requirement we go forward with the process of developing, optimizing and automating. I also belive that their success is part of how many rockets they launch, get telemetry and improve. Even when the rockets experience “rapid unscheduled disassembly” SpaceX considers this a success because it gaves them opportunies for destructive testing (DT).

Enough of my ramblings, check out the full video! The link to get directly to the 5 steps lecture.

[https://youtu.be/t705r8ICkRw?t=814](https://youtu.be/t705r8ICkRw?t=814)

_Originally published on [LinkedIn](https://www.linkedin.com/pulse/devops-spacex-rocket-construction-vikingur-saemundsson/) on October 1, 2021._
