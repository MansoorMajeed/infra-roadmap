---
id: chaos-engineering
title: Chaos Engineering
zone: sre
edges:
  to:
    - id: graceful-degradation
      question: >-
        Chaos tests keep revealing that my services fall over completely instead
        of degrading gracefully.
      detail: >-
        Every fault injection test ends the same way — the whole service goes
        down instead of shedding load or serving partial results. Users get a
        hard error instead of something degraded but functional. I want to
        design for partial failure, not just crash-and-recover.
    - id: game-days
      question: >-
        We're finding failures with chaos tests. But I'm not sure the team
        actually knows how to respond when they happen.
      detail: >-
        The last drill revealed that people didn't know what to do, who to
        call, or how to use the runbooks under pressure. The technical systems
        are getting more resilient but the human response is still unreliable.
        I want to practice the response, not just find the failure.
    - id: capacity-planning
      question: >-
        I've stress-tested the failure modes. Now I'm worried about what
        happens when traffic just keeps growing.
      detail: >-
        Chaos tests have found a bunch of weaknesses that I've fixed. But
        they're all about fault tolerance — not about growth. I don't know if
        the system can handle 3x current traffic, and I'd rather find out
        before users do.
difficulty: 3
tags:
  - chaos-engineering
  - resilience
  - game-days
  - fault-injection
  - reliability
  - netflix
  - chaos-monkey
category: practice
milestones:
  - 'Run a game day: define a failure scenario, inject it, observe and recover'
  - >-
    Verify your auto-scaling and self-healing actually work by terminating
    instances
  - >-
    Test your failover path: does Multi-AZ failover work in practice, not just
    in theory?
  - >-
    Understand the difference between chaos experiments and breaking production
    carelessly
---

Every system has failure modes that haven't been discovered yet. Post-mortems and monitoring find failures after they happen. Chaos engineering finds them before. The discipline is straightforward in principle: inject controlled failures into your system to observe how it behaves, identify unexpected weaknesses, and fix them before users find them. Netflix's Chaos Monkey — which randomly terminates production instances — made this famous, but the practice applies at every scale.

<!-- DEEP_DIVE -->

## The hypothesis-driven approach

Chaos engineering is not random destruction. It's a scientific practice with a specific structure:

1. **Form a hypothesis**: "If we terminate one of the three checkout service instances, the load balancer will route traffic to the other two and response time will increase by less than 50ms."

2. **Define success criteria**: what outcome confirms the hypothesis? What outcome refutes it?

3. **Inject the failure**: terminate the instance, introduce latency on a network call, exhaust a connection pool, fill a disk.

4. **Observe the system**: what actually happened? Did the load balancer behave as expected? Were there unexpected cascading effects?

5. **Analyze and act**: if the hypothesis was confirmed, the system is more resilient than you thought. If it was refuted, you've found a weakness — fix it before it becomes a production incident.

The difference between chaos engineering and breaking production carelessly: the hypothesis, the criteria, and the plan for what to do if things go wrong.

## Start with simple experiments

Before Chaos Monkey, there are simpler experiments that reveal a lot:

**Instance termination**: can your service handle losing one instance? Most properly configured auto-scaling groups handle this, but it's worth confirming. The failure reveals whether your health checks work, whether the load balancer routes correctly, and whether your instance startup is fast enough.

**Network partition**: what happens if your service can't reach its primary database? Does it fail fast with a clear error, or does it hang indefinitely? Does it try the replica? Does it serve stale cached data?

**Slow dependencies**: what happens if a downstream API takes 10 seconds to respond instead of 100ms? Does your service time out correctly? Does it circuit-break? Or does it hold connections open until it runs out of threads?

**Resource exhaustion**: what happens when the connection pool is full? When memory is at 95%? When the disk is full? These are often the most revealing experiments — the system behavior is usually worse than expected.

## Blast radius control

The cardinal rule: every chaos experiment has a defined blast radius — the maximum user impact if the experiment goes wrong. In early experiments, keep the blast radius small:

- Test in staging first
- Test a single instance, not the whole cluster
- Test non-peak traffic times
- Have a prepared rollback (stop the failure injection immediately if things go badly)
- Monitor SLOs during the experiment and abort if error budget starts burning faster than expected

As you build confidence in your system's resilience, you can run experiments with larger blast radii — and eventually, in production during peak traffic, which is where Netflix and Google run theirs.

## From experiments to game days

Individual chaos experiments validate specific failure modes. Game days combine multiple failure scenarios with a focus on the human response: does the team detect the failure? Do they follow the right runbook? Do incident roles work under pressure? Do escalation policies fire correctly?

Game days are intentional, scheduled events. They combine technical fault injection with incident response practice.

<!-- RESOURCES -->

- [Principles of Chaos Engineering](https://principlesofchaos.org/) -- type: article, time: 10m
- [Chaos Engineering - O'Reilly Book (free online)](https://www.oreilly.com/library/view/chaos-engineering/9781491988459/) -- type: book, time: varies
- [Gremlin - Chaos Engineering Platform](https://www.gremlin.com/) -- type: tool, time: 30m
- [Netflix Tech Blog - Chaos Monkey](https://netflixtechblog.com/the-netflix-simian-army-16e57fbab116) -- type: article, time: 15m
