---
id: you-cant-debug-what-you-cant-see
title: You Can't Debug What You Can't See
zone: observability
edges:
  to:
    - id: what-is-observability
      question: What does "observability" even mean? I just know my service breaks and I can't see why.
      detail: >-
        I keep hearing logs, metrics, and traces but I don't really understand
        how they're different or why I'd need all three. I just want to be able
        to tell what my service is doing when something goes wrong.
difficulty: 1
tags:
  - observability
  - logging
  - metrics
  - tracing
  - three-pillars
  - debugging
category: concept
milestones:
  - 'Explain the three pillars of observability: logs, metrics, and traces'
  - >-
    Describe what each pillar answers: what happened, how is it performing, why
    is it slow
  - Understand why you need all three — no single signal tells the full story
---

Picture this: it's 2am, your phone is buzzing, users are reporting that your service is down. You SSH into your server, stare at a process that appears to be running, and have absolutely no idea what is happening inside it. Is it crashing and restarting? Is it hanging on a database query? Is it throwing errors for every user or just some? You have no way to answer any of those questions. That feeling — of being completely blind to a system you're supposed to be responsible for — is what the observability problem is about.

This happens more often than people admit. Services get built, they work in development, they get deployed, and then the question of "how do I know what this thing is doing in production?" gets kicked down the road indefinitely. Until something breaks. The hard truth is that debugging a system you can't see is just guessing. You try things, restart processes, roll back deploys, and hope something changes — without ever knowing what actually fixed it or whether it'll happen again.

The goal of observability is simple: make your systems legible. Give yourself the ability to look inside a running system and answer real questions — not just "is it up?" but "which users are affected?", "when did this start?", "which part of the code is responsible?", and "has this happened before?" Those questions are unanswerable without the right signals in place.

<!-- DEEP_DIVE -->

## What happens when something breaks and you have no visibility

Let's walk through a realistic scenario. A user opens a support ticket: "The checkout page is broken." You check your monitoring dashboard — if you have one — and the uptime check is green. The process is running. Nothing looks obviously wrong.

So you start guessing:

- Did a recent deploy break something? You check the deploy history. Nothing deployed in the last 6 hours.
- Is the database down? You try connecting manually. It connects fine.
- Is it broken for everyone? You don't know. You have no request logs, no error rate, nothing.
- When did it start? You have no idea. The user says "about an hour ago" but you can't verify.

This is the flying-blind problem. Every step of the investigation is a guess. You're not debugging — you're fumbling.

Now contrast that with having basic observability in place. The user files a ticket. You open your log viewer, filter to `service=checkout level=error`, and immediately see a wall of errors that started 73 minutes ago. The error message says `payment_gateway: connection timeout`. You didn't need to guess at all — the system told you.

## The questions you can't answer without observability

The absence of observability means you can't answer the most basic operational questions:

**Is it down?** An uptime check tells you if a port is open. It doesn't tell you if requests are failing. You can have a service that accepts connections but returns 500 for every single request — and a simple ping-based uptime check will say it's healthy.

**Which users are affected?** Without logging, you have no idea if the problem is hitting everyone or just a subset. Maybe it's only users who signed up before a certain date. Maybe it's only users in a specific region. Without logs that record who made each request, you can't even begin to answer this.

**For how long?** If you don't have timestamped logs or metrics with history, you're relying on user reports to tell you when something started. Users don't report problems the moment they happen. You might have been broken for hours before anyone noticed.

**Is it getting worse or better?** Without a time series of error rates or request counts, you can't tell if a problem is stable, trending up, or resolving on its own. A restart might have fixed it — or it might have fixed it temporarily and it's about to break again.

**Which part is broken?** Modern applications aren't a single process. They're APIs calling other APIs, background workers, database queries, external services. Without tracing, a "slow request" could be caused by any one of a dozen things, and you're left timing things manually and guessing.

## Knowing it's broken vs. knowing why

There's an important distinction between knowing your service is broken and knowing why it's broken.

Traditional monitoring systems — uptime checks, process monitors, basic health endpoints — are good at the first part. They can tell you something is wrong. But they stop there. The moment you need to understand *why* something is wrong, you need to look inside the system.

That's the difference between monitoring and observability. Monitoring is about alerting on known failure modes. Observability is about being able to answer questions you didn't know to ask in advance. You can't write an uptime check for "the payment gateway is timing out specifically for users with European billing addresses" — but if you have good logs and traces, you can discover that on your own once an alert fires.

The practical takeaway: monitoring gets you woken up. Observability gets you back to sleep.

<!-- RESOURCES -->

- [Observability Engineering (book overview)](https://www.oreilly.com/library/view/observability-engineering/9781492076438/) -- type: book, time: 360m
- [What is Observability? (Honeycomb)](https://www.honeycomb.io/blog/so-you-want-to-build-an-observable-system) -- type: article, time: 12m
- [The Three Pillars of Observability (Splunk)](https://www.splunk.com/en_us/blog/learn/observability-pillars-logs-metrics-traces.html) -- type: article, time: 8m
