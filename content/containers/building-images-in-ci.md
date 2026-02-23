---
id: "building-images-in-ci"
title: "Building Docker Images in CI"
zone: "containers"
edges:
  from:
    - id: "docker-compose-dev"
      question: "Local setup works. How do I build the image automatically on every commit?"
  to:
    - id: "container-registry"
      question: "I built an image in CI. Where does it go?"
      detail: "The build finishes and the image just disappears when the CI runner shuts down. I need somewhere to actually store it so my server can pull it later — but I'm not sure what that looks like."
difficulty: 2
tags: ["docker", "ci-cd", "dockerfile", "images", "github-actions", "containers"]
category: "practice"
milestones:
  - "Build a Docker image in a GitHub Actions workflow"
  - "Tag the image with the git commit SHA"
  - "Use multi-stage builds to keep production images small"
  - "Cache Docker layers in CI to speed up builds"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
