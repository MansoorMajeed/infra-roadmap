---
id: one-server-is-not-enough
title: One Server Is Not Enough
zone: scaling
edges:
  to:
    - id: horizontal-vs-vertical-scaling
      question: >-
        My server can't keep up. Do I just make it bigger, or is that the
        wrong approach?
      detail: >-
        I've been bumping up CPU and RAM every few months but I feel like I'm
        running out of road — and if this server goes down, everything goes
        down. I don't know if I should keep scaling up or start thinking about
        this completely differently.
difficulty: 1
tags:
  - scaling
  - reliability
  - single-point-of-failure
  - availability
  - capacity
category: concept
milestones:
  - Identify the failure modes of a single-server deployment
  - Explain what a single point of failure is
  - Understand the difference between performance headroom and high availability
---

A single server is the simplest possible deployment. It's also the most fragile. When the store gets featured in a newsletter or hits the front page of a social media site and thousands of users arrive at once, the server hits its limits fast. This node is about understanding exactly what those limits are and why they matter before you start solving them.

<!-- DEEP_DIVE -->

## What actually breaks under load

When a server gets more traffic than it can handle, it doesn't gracefully slow down — it degrades unpredictably. CPU climbs toward 100%. The process queue backs up. MySQL starts queuing queries. Gunicorn workers exhaust their pool. Requests that would normally take 50ms start taking 5 seconds. Eventually the server starts dropping connections entirely or the OOM killer starts killing processes.

The particularly bad version: a traffic spike hits at 3 AM, crashes the server, and the store is down until someone wakes up and notices. With a single server there's no automatic recovery, no redundancy, and no graceful degradation.

## Two separate problems: performance headroom and availability

These are often confused but they're different problems with different solutions.

**Performance headroom** is about having enough capacity for expected traffic. A bigger server (more CPU, more RAM) can handle more concurrent users. But you're always chasing a ceiling — there's a maximum size for any single machine, and it's expensive.

**High availability** is about surviving failures. Even a server with infinite CPU will go down eventually: hardware fails, kernels crash, you need to apply security patches. If there's only one server, every failure is an outage.

Scaling up (a bigger server) helps with headroom but does nothing for availability. You need multiple servers to have real redundancy — and once you have multiple servers, you need a way to distribute traffic between them.

## Single points of failure

Every component in a single-server deployment is a single point of failure:
- The server itself (hardware, kernel, network interface)
- The MySQL process running on that server
- The Python app process
- Nginx
- The disk

Any one of these failing takes down the whole store simultaneously. The more components on one machine, the more ways that machine can fail.

## What you actually need

To handle more traffic *and* be resilient to failures, you need:
1. Multiple application servers that can each handle requests independently
2. Something in front to distribute traffic across them
3. Data stores (database, sessions) that are shared and accessible from any server

This is what the rest of the zone builds toward.

<!-- RESOURCES -->

- [The Architecture of Open Source Applications - Scalability](https://aosabook.org/en/v2/distsys.html) -- type: article, time: 30m
- [AWS EC2 Instance Types - Understanding vertical limits](https://aws.amazon.com/ec2/instance-types/) -- type: docs, time: 10m
