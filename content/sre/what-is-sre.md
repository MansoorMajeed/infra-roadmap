---
id: what-is-sre
title: What Is SRE?
zone: sre
edges:
  to:
    - id: measuring-reliability
      question: >-
        We have alerts everywhere but things still feel unpredictable. How do
        I actually measure reliability properly?
      detail: >-
        We get paged when things are obviously broken. But I have no idea if
        we're trending better or worse over time. There's no shared definition
        of 'working well enough.' I feel like we're flying blind between
        incidents.
    - id: toil-and-automation
      question: >-
        Operations is drowning in manual work and it's not getting better. How
        do I fix that systematically?
      detail: >-
        Half the team's time goes to repetitive manual tasks — restarting
        services, running the same scripts, processing the same tickets every
        week. It's not making anything more reliable. I want a principled way
        to get this under control.
    - id: too-many-incidents
      question: >-
        We keep having incidents and I don't think we're handling them well.
        Where do I even start?
      detail: >-
        Something goes wrong and it's chaos every time — no clear process, no
        clear owner, everyone talking over each other. Then we patch it and move
        on. A week later it happens again. I want a real process, not just
        winging it every time.
difficulty: 1
tags:
  - sre
  - devops
  - site-reliability-engineering
  - toil
  - philosophy
  - culture
category: concept
milestones:
  - Explain the difference between SRE and traditional operations
  - Describe what Google meant by 'hire software engineers to do operations'
  - Understand why SRE is not just DevOps with a different name
  - 'Explain the core tension SRE manages: reliability vs feature velocity'
---

Site Reliability Engineering is the discipline Google invented when they realized that hiring traditional sysadmins to run internet-scale systems wasn't going to work. The core idea: software engineers should run software. Only people who can write code can automate away the operational work that would otherwise crush a team. SRE isn't just a job title or a team structure — it's a set of principles for how software-driven organizations should think about reliability as a product requirement, not an afterthought.

<!-- DEEP_DIVE -->

## The Google origin story

In 2003, Google VP of Engineering Ben Treynor Sloss was handed a production team and told to run it. He gave it to a group of software engineers with one mandate: you are responsible for the availability, latency, performance, efficiency, change management, monitoring, emergency response, and capacity planning of the products you run. That mandate became Site Reliability Engineering.

The insight was simple: if you hire software engineers to do operations, they will automate themselves out of the jobs they hate. They'll build tooling to eliminate repetitive work. They'll write code that makes the system more observable. They'll treat operational problems as engineering problems. This is fundamentally different from hiring people whose job is to operate the system — those people will keep operating it manually forever.

## SRE vs DevOps

DevOps and SRE are often compared because they're solving the same underlying problem: the dev/ops divide. But they approach it differently.

DevOps is a philosophy and culture change: tear down the wall between development and operations, make developers responsible for what they ship, create shared ownership. It deliberately doesn't prescribe how to implement that culture change.

SRE is a prescriptive implementation: here's a specific set of practices (SLOs, error budgets, toil reduction, blameless post-mortems) that Google found effective. Ben Treynor Sloss's own description: "SRE is what happens when you ask a software engineer to design an operations function."

The two are compatible. Many organizations describe their approach as "DevOps culture with SRE practices."

## The core tension SRE manages

The fundamental tension in software organizations is between reliability and velocity. More frequent deployments mean more opportunities to break things. More reliability work means fewer features shipped. Left unmanaged, this tension becomes a political fight: operations wants a feature freeze, product wants to ship faster, and no one is making principled decisions — just fighting.

SRE resolves this tension with a concrete mechanism: the **error budget**. If you define how unreliable your service is allowed to be (say, 0.1% of requests can fail), everything above 99.9% success is a budget you can spend on risk. Deploy fast and burn through it? Slow down until it recovers. Deploy conservatively and have budget left over? Ship more aggressively. The budget converts a political argument into an engineering decision.

## What SRE is not

SRE is not a rebrand of sysadmin. The SRE model explicitly expects engineers to spend at most 50% of their time on operational work — the rest goes to engineering projects that reduce that operational load. An SRE who spends 80% of their time on tickets and incidents is doing it wrong, and that's a management failure, not a personal one.

SRE is also not a silver bullet. The practices only work if there's organizational buy-in — particularly from product management, who needs to understand what error budgets mean for feature velocity. SRE without that relationship is just rebranded ops.

<!-- RESOURCES -->

- [Google SRE Book (free online)](https://sre.google/sre-book/table-of-contents/) -- type: book, time: varies
- [Google SRE Workbook (free online)](https://sre.google/workbook/table-of-contents/) -- type: book, time: varies
- [What is SRE? - Ben Treynor Sloss](https://landing.google.com/sre/interview/ben-treynor-sloss/) -- type: article, time: 15m
- [SRE vs DevOps - Google Cloud Blog](https://cloud.google.com/blog/products/gcp/sre-vs-devops-competing-standards-or-close-friends) -- type: article, time: 10m
- [The SRE Book Chapter 1 - Introduction](https://sre.google/sre-book/introduction/) -- type: book, time: 20m
