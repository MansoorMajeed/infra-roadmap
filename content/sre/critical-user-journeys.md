---
id: critical-user-journeys
title: Critical User Journeys
zone: sre
edges:
  to:
    - id: service-level-objectives
      question: >-
        I've mapped the user journeys. Now how do I turn them into concrete
        reliability targets?
      detail: >-
        I can describe what a user does: opens the app, searches, adds to cart,
        checks out. But I don't know how to translate that into a measurable
        number. Do I measure each step separately? What counts as a failure —
        an error response, or just being slow? And how do I know what target
        to set for each one?
difficulty: 2
tags:
  - cuj
  - critical-user-journeys
  - slo
  - sre
  - user-experience
  - reliability
category: concept
milestones:
  - Identify the top three critical user journeys for a service you own
  - Explain why "server uptime" is a poor proxy for user experience reliability
  - Map a complete user journey end-to-end including all service dependencies
  - Understand why you need separate SLOs for different user journeys
---

Your infrastructure metrics are all green, but users are filing support tickets. This happens because there's a gap between what you're measuring and what users are actually doing. A Critical User Journey (CUJ) is the sequence of steps a real user takes to accomplish something meaningful — search for a product, complete a checkout, send a message, upload a file. Reliability measured against those journeys is reliability that users actually experience.

<!-- DEEP_DIVE -->

## Why per-service metrics miss the point

Modern applications are composed of many services, each with its own dashboards and SLOs. The auth service is 99.9% available. The product catalogue is 99.9% available. The payment service is 99.9% available. So why are users unable to complete checkouts?

The problem: a user completing a checkout touches all three services sequentially. If any one of them fails, the checkout fails. Three services each at 99.9% availability combine to 99.7% availability for the checkout journey — which means users can't complete purchases 0.3% of the time. That's 3x worse than any individual service suggests.

Per-service metrics are internally coherent but externally misleading. CUJs reveal what the user actually experiences by measuring across the full dependency chain.

## Identifying your CUJs

A CUJ is typically 3-10 steps that represent a complete unit of user value. For an e-commerce site:

- **Purchase journey**: search → view product → add to cart → checkout → payment → confirmation
- **Account journey**: register → verify email → log in → manage profile
- **Return journey**: request return → print label → track status

Not all journeys are equally critical. The right question is: if this journey fails completely, what happens to the business? Payment failures lose revenue directly. Return failures create support escalations. Both matter, but the priority and SLO target should reflect the business impact.

## Measuring CUJ reliability

You have two main approaches:

**Synthetic monitoring** — write automated tests that simulate user journeys end-to-end, run them continuously from outside your infrastructure, and alert when they fail. This gives you a continuous signal independent of real traffic, and works even at low traffic volumes. Tools: Playwright, Datadog Synthetic Tests, Pingdom.

**Real user traffic analysis** — instrument each step of the journey and track the proportion that complete successfully. This reflects actual user experience but requires sufficient traffic volume to be statistically meaningful, and requires tracing across services. Tools: distributed tracing (Jaeger, Tempo), analytics events.

## Separate SLOs for separate journeys

Different journeys have different expectations and different tolerances. Search results appearing in 500ms might be a reasonable SLO. Payment confirmation appearing within 5 seconds might be fine — users expect it to take a moment. Internal admin actions might have much more forgiving targets.

Once you've defined your CUJs and how to measure them, you have the right inputs for setting SLOs. The objective should reflect user expectations for that specific journey — not an arbitrary number or an industry benchmark.

<!-- RESOURCES -->

- [Defining SLOs for User Journeys - Google SRE Workbook](https://sre.google/workbook/art-of-slos/) -- type: book, time: 45m
- [Critical User Journeys - Google Web DevRel](https://web.dev/articles/user-centric-performance-metrics) -- type: article, time: 20m
- [Synthetic Monitoring with Playwright](https://playwright.dev/docs/intro) -- type: tool, time: 30m
