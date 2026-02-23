---
id: container-logs-and-exec
title: Logs, Exec, and Inspecting Containers
zone: containers
edges:
  to:
    - id: writing-a-dockerfile
      question: I've got enough to debug basics. Now I want to build my own image.
      detail: >-
        I can run containers and poke around inside them. Time to stop using
        other people's images and package my own app.
    - id: container-debugging
      question: Logs aren't enough — the container keeps crashing and I can't tell why.
      detail: >-
        I can see the logs but they don't explain what's happening. The container
        exits with code 137 or just disappears. I need to get inside it or figure
        out how to debug something I can't directly observe.
difficulty: 1
tags:
  - docker
  - containers
  - debugging
  - logs
  - operations
category: practice
milestones:
  - Stream container logs with docker logs -f
  - Filter logs with --tail and --since
  - Open a shell inside a running container with docker exec -it
  - Inspect container metadata and config with docker inspect
  - Check resource usage in real time with docker stats
  - Use docker top to see processes running inside a container
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
