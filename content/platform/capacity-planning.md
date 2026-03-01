---
id: capacity-planning
title: Capacity Planning
zone: platform
edges:
  to:
    - id: load-testing
      question: >-
        I have capacity estimates on paper. How do I actually verify them before
        real traffic hits?
      detail: >-
        I've done the maths and we should handle 3x current traffic. But the
        last time I said that, I was wrong. I want to actually simulate the load
        and find the bottlenecks myself before users find them for me.
    - id: platform-engineering
      question: >-
        My systems are reliable and well-provisioned. How do I make the
        infrastructure accessible and productive for the rest of my engineering
        organisation?
      detail: >-
        I can run reliable infrastructure. But now the question is: how do I
        make this accessible to the rest of the engineering org? Every team
        reinventing infra from scratch, every new hire spending weeks on
        Kubernetes setup — that's not sustainable. There must be a better way to
        share what I've built.
difficulty: 2
tags:
  - capacity-planning
  - load-testing
  - forecasting
  - scaling
  - resource-management
  - sre
category: practice
milestones:
  - >-
    Run a load test that simulates your expected traffic at 2x and 5x current
    volume
  - >-
    Identify which resource hits its limit first: CPU, memory, database
    connections, or network
  - Build a traffic forecast from historical data and planned growth
  - >-
    Set up proactive alerts that fire when you have weeks of runway left, not
    hours
---

Traffic keeps growing. New features increase per-request resource usage. Marketing plans a campaign that will double traffic overnight. At some point, the system you have won't be enough for the system you need. Capacity planning is the practice of understanding how your systems scale and making sure you don't find the limits in production. The goal isn't unlimited resources — it's knowing where the ceiling is, how much headroom you have, and how to get ahead of it.

<!-- DEEP_DIVE -->

## What capacity planning answers

Capacity planning addresses three questions:

1. **Where will we hit a wall?** Which resource — CPU, memory, database connections, network throughput, storage — hits its limit first as traffic grows?

2. **When will we hit it?** Based on current growth trends and planned demand, how many weeks or months until that resource is exhausted?

3. **What do we need to do about it?** Scale horizontally, optimize code, add caching, renegotiate a dependency SLO, increase infrastructure?

These questions can't be answered theoretically. They require measurements of how the system currently behaves under load.

## The four resource constraints

Most capacity problems live in one of these four places:

**CPU**: request processing is too compute-intensive for the available cores. Manifests as increased latency at high traffic, eventually timeouts. Solved by horizontal scaling (more instances) or profiling and optimizing hot code paths.

**Memory**: each request uses significant memory (object allocation, caching, session state) and the system runs out. Manifests as GC pauses, OOM kills, increasingly long memory cleanup cycles. Solved by reducing per-request memory footprint or adding RAM/instances.

**Database connections**: connection pools have a fixed size. At high concurrency, requests queue waiting for a connection. Manifests as latency spikes proportional to traffic. Solved by connection pool sizing, connection multiplexing (PgBouncer), or reducing database calls per request.

**Throughput / network**: the volume of data transferred hits the limits of the network interface, load balancer, or upstream provider. Manifests as packet loss, retransmits, and latency. Solved by caching, reducing response sizes, or upgrading network capacity.

## Traffic forecasting

Historical traffic data has patterns: daily cycles, weekly patterns, seasonal spikes, growth trends. Extract these:

**Daily/weekly baseline**: what's the typical traffic curve? When is peak? What's the ratio of peak to average?

**Growth trend**: fit a trend line to your historical traffic data. At the current growth rate, when does traffic reach 2x? 5x? This gives you a timeline.

**Known demand events**: product launches, marketing campaigns, seasonal events. These require separate analysis — a campaign that promises 10x traffic for 48 hours is a different problem from gradual growth.

Most capacity planning tools (CloudWatch, Datadog, Google Cloud Monitoring) can project forward from historical trends. The projection is an estimate, not a guarantee, but it gives you a defensible number to plan against.

## The headroom principle

Don't plan to run at 100% of capacity. Plan to run at a defined maximum utilization — typically 60-70% for most resources — and treat anything above that as the trigger for capacity action.

Running at 70% CPU on average means you have 30% headroom for traffic spikes and load variability. Running at 95% CPU means any spike causes latency degradation, and any traffic variability causes incidents.

The headroom percentage depends on the volatility of your traffic and the cost of going over. For databases (where connection pool exhaustion cascades badly), maintain more headroom. For stateless compute (where scaling is fast), less headroom is acceptable.

<!-- RESOURCES -->

- [Google SRE Book - Handling Overload](https://sre.google/sre-book/handling-overload/) -- type: book, time: 20m
- [Capacity Planning for SREs - Google SRE Workbook](https://sre.google/workbook/capacity-planning/) -- type: book, time: 30m
