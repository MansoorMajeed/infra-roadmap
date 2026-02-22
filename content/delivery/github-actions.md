---
id: "github-actions"
title: "Your First Pipeline with GitHub Actions"
zone: "delivery"
edges:
  from:
    - id: "what-is-ci-cd"
      question: "CI/CD makes sense. How do I set one up?"
      detail: "GitHub Actions is the easiest on-ramp: it's built into GitHub, free for public repos, and triggered automatically on every push. You define your pipeline in a YAML file and GitHub runs it for you."
  to:
    - id: "build-and-test-pipeline"
      question: "I have a pipeline running. How do I make it properly test and build my code?"
      detail: "A basic 'hello world' pipeline is a start, but a real pipeline has structured stages: install dependencies, run tests, build the artifact, then deploy. Let's build that."
    - id: "pipeline-secrets"
      question: "My pipeline needs to deploy to a server — it needs credentials. Where do I put secrets?"
      detail: "Your pipeline needs to SSH into servers, push to a registry, or call APIs. Those credentials can't live in your YAML file. GitHub Actions has a built-in secrets store, and there are patterns for using them safely."
difficulty: 1
tags: ["github-actions", "ci-cd", "yaml", "pipelines", "automation"]
category: "tool"
milestones:
  - "Create a .github/workflows/ directory and write your first workflow YAML"
  - "Trigger a pipeline on push to main"
  - "Read the pipeline output in the GitHub Actions UI"
  - "Understand what a job, step, and runner are"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
