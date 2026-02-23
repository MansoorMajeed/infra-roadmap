---
id: container-isolation
title: How Containers Isolate Processes
zone: containers
edges:
  to:
    - id: container-resources
      question: Okay, so processes are isolated — but what stops a container from using all the CPU and RAM?
      detail: >-
        I get that containers have their own process tree and network stack, but
        isolation alone doesn't stop a runaway container from starving everything
        else on the host. How does Docker limit what a container can actually consume?
difficulty: 2
tags:
  - containers
  - linux
  - namespaces
  - internals
category: concept
milestones:
  - Understand what Linux namespaces are and why they exist
  - "Know the six namespace types: PID, net, mnt, user, UTS, IPC"
  - Understand how PID namespaces make process 1 inside a container
  - Know what network namespace isolation means for container networking
  - Be able to explain why containers aren't VMs
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
