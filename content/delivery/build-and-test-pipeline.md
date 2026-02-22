---
id: "build-and-test-pipeline"
title: "Build and Test in Your Pipeline"
zone: "delivery"
edges:
  from:
    - id: "github-actions"
      question: "I have a basic pipeline. What stages should it have?"
      detail: "A real pipeline isn't just 'run the app' — it has distinct stages: install dependencies, run the test suite, build the artifact. Each stage should fail fast and tell you exactly what broke."
    - id: "pipeline-secrets"
      question: "Secrets are handled. Now how do I build a proper test and build pipeline?"
      detail: "With credentials sorted, you can now focus on the actual pipeline structure: run tests on every push, fail the pipeline if tests fail, and only build and deploy when everything passes."
  to:
    - id: "building-docker-images"
      question: "Tests pass and code is built. How do I package this as a Docker image in CI?"
      detail: "The build artifact from a modern deployment is usually a Docker image. Building it in CI means every image is built the same way, tagged with the commit SHA, and ready to deploy anywhere Docker runs."
difficulty: 1
tags: ["ci-cd", "testing", "pipelines", "automation", "github-actions"]
category: "practice"
milestones:
  - "Run your test suite automatically on every push"
  - "Fail the pipeline if any test fails"
  - "Cache dependencies so the pipeline doesn't reinstall everything from scratch"
  - "Understand what a pipeline artifact is"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
