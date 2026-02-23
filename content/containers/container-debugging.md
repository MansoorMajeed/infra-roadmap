---
id: container-debugging
title: Debugging Containers That Crash or Misbehave
zone: containers
edges:
  to:
    - id: writing-a-dockerfile
      question: I can debug running containers. Now I want to build my own image.
      detail: >-
        I've got the debugging tools down. Time to stop using other people's
        images and package my own app.
difficulty: 2
tags:
  - docker
  - containers
  - debugging
  - operations
category: practice
milestones:
  - Understand common exit codes (0, 1, 137, 139) and what they mean
  - Debug a container that exits immediately by overriding the entrypoint
  - Use docker run --rm -it <image> sh to explore an image interactively
  - Debug networking issues between containers with docker network inspect
  - Understand why you can't exec into a stopped container and what to do instead
  - Use a temporary debug sidecar to inspect a broken container's filesystem
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
