---
id: container-filesystem
title: Image Layers and the Union Filesystem
zone: containers
edges:
  to:
    - id: docker-first-container
      question: I get how Docker works internally. Let me actually start using it.
      detail: >-
        I understand namespaces, cgroups, and how image layers are stored. Now
        I want to put that into practice — pull an image and run my first container.
difficulty: 2
tags:
  - containers
  - linux
  - overlayfs
  - internals
  - images
category: concept
milestones:
  - Understand what a union filesystem is and why Docker uses one
  - Know how image layers are stacked (read-only layers + writable layer on top)
  - Understand copy-on-write and what it means for container filesystem changes
  - Know where Docker stores layers on disk (/var/lib/docker)
  - Understand why layer sharing makes pulling images efficient
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
