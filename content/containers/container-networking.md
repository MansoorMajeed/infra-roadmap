---
id: container-networking
title: Container Networking
zone: containers
edges:
  to:
    - id: building-images-in-ci
      question: I understand how containers talk to each other. How do I automate building images in CI?
      detail: >-
        The networking model makes sense now. The next thing I need is to stop
        building images manually — I want this to happen automatically when I push code.
difficulty: 2
tags:
  - docker
  - networking
  - containers
  - docker-compose
category: concept
milestones:
  - Understand Docker's default bridge network and its limitations
  - Know how user-defined bridge networks enable container DNS
  - Understand how Compose creates a network per project automatically
  - Know the difference between publishing a port (-p) and exposing one (EXPOSE)
  - Understand when to use host networking and why it's usually the wrong choice
  - Debug connectivity between containers with docker network inspect
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
