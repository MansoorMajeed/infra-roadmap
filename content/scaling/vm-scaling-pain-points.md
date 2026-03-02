---
id: vm-scaling-pain-points
title: The Pain of Scaling VMs
zone: scaling
edges:
  to:
    - id: containerization
      zone: containers
      question: All this VM management is exhausting. Every deploy is a slow AMI bake and a rolling ASG update. Is there a better model for packaging and running my app?
      detail: >-
        Every code change means a new AMI bake, a new launch template version,
        and waiting for the ASG to roll it out. VMs take minutes to boot.
        I'm patching the OS on every machine in the fleet. I keep hearing that
        containers solve this — but I don't really understand how or whether
        the migration is worth the effort.
difficulty: 1
tags:
  - vms
  - pain-points
  - ami
  - scaling
  - kubernetes
  - containers
  - deployment
  - operations
category: concept
milestones:
  - List the operational pain points of a VM-based scaling architecture
  - Explain why AMI-based deployments are slow compared to container images
  - Understand the resource efficiency problem with always-on VMs
  - Describe how idle capacity costs money in an ASG / MIG setup
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
