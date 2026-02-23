---
id: debugging-dockerfile-builds
title: Debugging Dockerfile Builds
zone: containers
edges:
  to:
    - id: docker-compose-dev
      question: Builds are working. How do I run my app alongside its dependencies locally?
      detail: >-
        I can build and debug images now. But I'm still starting Postgres and
        Redis separately by hand every time I work on the app — that's getting old.
difficulty: 2
tags:
  - docker
  - dockerfile
  - debugging
  - builds
category: practice
milestones:
  - Read docker build output and understand which step failed
  - Use docker build --no-cache to rule out stale cache as the cause
  - Inspect intermediate layers by running a shell at a failed build step
  - Understand what goes into the build context and why large contexts slow builds down
  - Use docker history to see what each layer in an image actually contains
  - Debug ENTRYPOINT/CMD mismatches by overriding them at run time
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
