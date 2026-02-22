---
id: "building-docker-images"
title: "Building Docker Images in CI"
zone: "delivery"
edges:
  from:
    - id: "build-and-test-pipeline"
      question: "Tests pass. How do I build a Docker image as part of my pipeline?"
      detail: "Instead of copying source code to a server and hoping the environment matches, you package the app into a Docker image. Build once, run anywhere — the same image runs in staging and production."
  to:
    - id: "container-registry"
      question: "I built an image. Where do I store it?"
      detail: "A built image lives on the CI runner — and disappears when the job ends. You need a container registry to store images, version them by commit, and let your servers pull exactly the version they need."
difficulty: 2
tags: ["docker", "ci-cd", "dockerfile", "images", "containers", "build"]
category: "practice"
milestones:
  - "Write a Dockerfile that builds your application"
  - "Build the Docker image in a GitHub Actions workflow"
  - "Tag the image with the git commit SHA"
  - "Understand the difference between build-time and run-time concerns in a Dockerfile"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
