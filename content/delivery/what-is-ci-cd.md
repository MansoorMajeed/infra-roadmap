---
id: "what-is-ci-cd"
title: "What Is CI/CD?"
zone: "delivery"
edges:
  from:
    - id: "manual-deploy-is-painful"
      question: "I'm tired of manual deploys. What is this CI/CD thing?"
      detail: "Every deploy is a six-step SSH marathon. CI/CD automates the whole chain — from code commit to running in production — so you never have to SSH-and-pray again."
  to:
    - id: "github-actions"
      question: "I get it. How do I actually build a pipeline?"
      detail: "GitHub Actions is the most approachable place to start. It's free for public repos, built into GitHub, and uses a simple YAML syntax to define what runs when you push code."
difficulty: 1
tags: ["ci-cd", "continuous-integration", "continuous-delivery", "pipelines", "automation"]
category: "concept"
milestones:
  - "Explain the difference between Continuous Integration and Continuous Delivery"
  - "Describe what a pipeline stage is"
  - "Understand why fast feedback loops matter"
---

CI/CD stands for Continuous Integration and Continuous Delivery. CI means every code commit automatically triggers a build and test run. CD means passing code automatically gets delivered to production (or staged there, ready to deploy with one click).

Together they replace the manual deploy ritual with a pipeline: push to Git, tests run, image builds, deployment happens — no one SSHes into anything.

<!-- DEEP_DIVE -->

## Continuous Integration

The "integration" problem is old: multiple engineers working on the same codebase tend to diverge. Their branches work individually but break when merged. CI solves this by integrating constantly — every push triggers an automated build and test run.

If it passes: the code is good, move on.
If it fails: you know immediately, while the context is fresh, not three weeks later.

The discipline is: **the main branch is always green.** Small, frequent commits. Tests run on every push. Broken builds get fixed before anything else.

## Continuous Delivery

Delivery is getting that tested code to production. CD means the pipeline doesn't stop at "tests pass" — it keeps going. Build the artifact, push it to a registry, deploy to staging, run smoke tests, promote to production.

There's a distinction between Continuous Delivery and Continuous Deployment:
- **Continuous Delivery** — the pipeline prepares a deployment, but a human approves the final push to production.
- **Continuous Deployment** — everything is automatic, no human in the loop. Every green commit reaches production.

Most organizations start with Continuous Delivery (human approval for production) and move toward Continuous Deployment as they build confidence in their test coverage and rollback mechanisms.

## The pipeline

A pipeline is a sequence of automated stages. Each stage can fail, which stops the pipeline and notifies the team. A typical pipeline:

```
push → install deps → run tests → build image → push to registry → deploy to staging → smoke test → deploy to production
```

Each arrow represents a stage. If tests fail, nothing after that runs. You never push a broken image to production.

## Why fast feedback loops matter

The further a bug travels from where it was written, the more expensive it is to fix. A failing test in CI costs five minutes. The same bug discovered by a user costs an incident, a rollback, and a post-mortem.

Fast feedback — tests that run in seconds, pipelines that complete in minutes — keeps bugs cheap. Slow feedback keeps bugs expensive.

<!-- RESOURCES -->

- [CI/CD Overview (Atlassian)](https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment) -- type: reference, time: 10min
- [The Twelve-Factor App: Build, Release, Run](https://12factor.net/build-release-run) -- type: reference, time: 5min
