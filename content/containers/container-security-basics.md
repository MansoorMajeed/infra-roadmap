---
id: container-security-basics
title: Container Security Basics
zone: containers
edges:
  to:
    - id: docker-compose-dev
      question: My images are optimized and reasonably secure. How do I run multiple services together locally?
      detail: >-
        I've got my app containerized properly. Now I need Postgres and Redis
        running alongside it — I'm starting everything separately and it's
        getting messy.
difficulty: 2
tags:
  - docker
  - containers
  - security
  - dockerfile
category: practice
milestones:
  - Add a USER instruction to run the container process as a non-root user
  - Understand why running as root inside a container is a real risk even with namespace isolation
  - Never bake secrets or credentials into an image layer
  - Use read-only filesystems with --read-only where possible
  - Scan images for known CVEs with docker scout or trivy
  - Understand what --cap-drop and --cap-add do and why dropping capabilities matters
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
