---
id: "writing-a-dockerfile"
title: "Writing a Dockerfile"
zone: "containers"
edges:
  from:
    - id: "containerization"
      question: "I understand containers. How do I build one for my app?"
  to:
    - id: "docker-compose-dev"
      question: "I can build an image. My app needs a database too — how do I run them together?"
      detail: "I've got my app containerized, but it needs Postgres running alongside it. Right now I'm starting them separately by hand every time. There has to be a way to declare the whole stack and spin everything up together."
difficulty: 2
tags: ["docker", "dockerfile", "containers", "build"]
category: "practice"
milestones:
  - "Write a Dockerfile for your application"
  - "Build the image locally with docker build"
  - "Run the container with docker run and verify it works"
  - "Use a multi-stage build to keep the final image small"
  - "Understand which files to exclude with .dockerignore"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
