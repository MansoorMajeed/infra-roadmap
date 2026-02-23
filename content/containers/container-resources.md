---
id: container-resources
title: Limiting Container Resources with cgroups
zone: containers
edges:
  to:
    - id: container-filesystem
      question: Namespaces and cgroups explain isolation and limits — but how do image layers actually work on disk?
      detail: >-
        I understand processes are isolated and resources are capped. But I'm
        curious how Docker stores images — every image seems to share layers with
        others and I don't understand how that works or what it means for my disk.
difficulty: 2
tags:
  - containers
  - linux
  - cgroups
  - internals
  - resources
category: concept
milestones:
  - Understand what cgroups are and what problem they solve
  - Know how Docker uses cgroups to enforce --memory and --cpus limits
  - Understand what happens when a container hits its memory limit (OOM kill)
  - Know how to inspect a container's resource usage with docker stats
  - Understand why resource limits matter in shared environments
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
