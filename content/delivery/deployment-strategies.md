---
id: "deployment-strategies"
title: "Deploying Without Downtime"
zone: "delivery"
edges:
  from:
    - id: "container-registry"
      question: "I have a versioned image. How do I get it running in production without taking the site down?"
      detail: "Deploying a new version means stopping the old one and starting the new one. Naive deployments have a gap between those two events — users get errors. Deployment strategies eliminate that gap."
  to:
    - id: "iac-intro"
      question: "My deployments are solid. But the servers I deploy to were set up by hand. Can I automate that too?"
      detail: "You can script your deployments perfectly and still have a fragile, hand-crafted server underneath. Infrastructure as Code brings the same automation discipline to the servers themselves."
difficulty: 2
tags: ["deployment", "rolling-deploy", "blue-green", "canary", "zero-downtime", "load-balancing"]
category: "concept"
milestones:
  - "Explain the gap problem in naive deployments"
  - "Implement a rolling deployment strategy"
  - "Understand what blue-green deployment is and when to use it"
  - "Know what a canary release is"
---

Deploying a new version means the old one stops and the new one starts. In a naive deployment, there's a gap between those two events — users hit the server and get nothing. Deployment strategies eliminate that gap.

The right strategy depends on your tolerance for complexity, your infrastructure, and what "downtime" costs you.

<!-- DEEP_DIVE -->

## The gap problem

A naive deploy looks like this:

```
t=0  Stop old container
t=1  Pull new image        (users get connection refused)
t=2  Start new container
t=3  New version serving
```

Between t=0 and t=3, requests fail. For a low-traffic internal tool, a 10-second gap is fine. For anything user-facing, it's not.

## Rolling deployment

A rolling deploy updates instances one at a time, keeping others running. With two instances behind a load balancer:

```
Instance A: v1 → v2 (draining, then updated)
Instance B: v1     (still serving)
→
Instance A: v2     (now serving)
Instance B: v1 → v2 (draining, then updated)
```

Traffic is never fully cut off. The load balancer routes around the instance being updated. This is the default strategy in Kubernetes (and most orchestrators) because it requires no extra infrastructure.

**Trade-off:** During the rollout, some instances run v1 and some run v2 simultaneously. If your deployment includes a breaking database migration, v1 and v2 may be incompatible. Plan migrations carefully (expand-contract pattern).

## Blue-green deployment

You maintain two identical environments: blue (current) and green (next). You deploy to the idle environment, run smoke tests, then flip the load balancer to point all traffic at it.

```
Load balancer → blue (v1)    green (v2, idle)

Deploy v2 to green, run tests

Load balancer → green (v2)   blue (v1, idle)
```

The flip is instant — no gap. If the new version has problems, you flip back to blue in seconds.

**Trade-off:** You need two full environments running simultaneously, which doubles infrastructure cost during deployments. For stateful applications, database compatibility between blue and green is still a concern. Best suited for immutable, stateless services.

## Canary release

A canary release routes a small percentage of traffic to the new version before full rollout. If error rates spike or metrics degrade, you pull back.

```
90% of requests → v1
10% of requests → v2 (canary)

Monitor for 15 minutes...

If metrics are healthy: gradually shift more traffic to v2
If metrics degrade: route all traffic back to v1
```

Canaries catch issues that tests miss — real user traffic is different from synthetic tests. They're common at companies with significant traffic where a bad deploy affecting 100% of users is catastrophic.

**Trade-off:** More complex to implement. Requires a load balancer that supports weighted routing (nginx, Traefik, AWS ALB) and automated monitoring that can trigger rollback.

## Which to use

| Strategy | Complexity | Infra cost | Good for |
|---|---|---|---|
| Rolling | Low | Normal | General use, Kubernetes default |
| Blue-green | Medium | 2x during deploy | Stateless services, instant rollback |
| Canary | High | Slightly higher | High-traffic, risk-averse teams |

For a single server with Docker Compose, a rolling deploy is just: bring up the new container, drain the old one, remove it. Docker Compose handles this with `docker compose up -d --remove-orphans`.

For multiple servers behind a load balancer, rolling is the standard choice. Blue-green and canary are progressive steps that add safety at the cost of complexity — adopt them when you have the traffic to justify it.

<!-- RESOURCES -->

- [The Twelve-Factor App: Disposability](https://12factor.net/disposability) -- type: reference, time: 5min
- [Martin Fowler: BlueGreenDeployment](https://martinfowler.com/bliki/BlueGreenDeployment.html) -- type: reference, time: 10min
- [Martin Fowler: CanaryRelease](https://martinfowler.com/bliki/CanaryRelease.html) -- type: reference, time: 10min
