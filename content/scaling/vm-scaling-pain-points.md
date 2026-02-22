---
id: "vm-scaling-pain-points"
title: "The Pain of Scaling VMs"
zone: "scaling"
edges:
  from:
    - id: "application-caching"
      question: "LocalMart can handle serious traffic now. But what's still painful about this setup?"
      detail: "The stack works. But operating it at scale reveals a set of friction points that never fully go away with VMs: slow deployments, wasted capacity, operational complexity, and a growing gap between 'it works on my machine' and 'it works in production'. Understanding these pain points is what motivates the next evolution."
    - id: "launch-templates-and-amis"
      question: "AMI baking is slow and brittle. Is this really the best way to ship code?"
      detail: "Every code change means rebuilding a machine image, waiting minutes, updating the launch template, and slowly rolling it out across the fleet. There's a better way to package and deploy applications — and understanding why AMIs are painful is exactly what motivates it."
  to: []
difficulty: 1
tags: ["vms", "pain-points", "ami", "scaling", "kubernetes", "containers", "deployment", "operations"]
category: "concept"
milestones:
  - "List the operational pain points of a VM-based scaling architecture"
  - "Explain why AMI-based deployments are slow compared to container images"
  - "Understand the resource efficiency problem with always-on VMs"
  - "Describe how idle capacity costs money in an ASG / MIG setup"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
