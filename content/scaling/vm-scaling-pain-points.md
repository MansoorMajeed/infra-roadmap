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

The VM-based scaling architecture we've built — ASG, ALB, RDS, ElastiCache — works and handles serious traffic. But operating it is slow and expensive in ways that compound as the system grows. Understanding these pain points is what motivates the move to containers and eventually Kubernetes.

<!-- DEEP_DIVE -->

## Slow deployments

The AMI bake-and-roll cycle is the biggest operational drag. A code change that takes 30 seconds to write requires:
1. A CI build that runs tests (5-10 minutes)
2. A Packer AMI bake (5-10 minutes)
3. An ASG instance refresh (10-30 minutes for the fleet to roll)

Total: 20-50 minutes from merge to deployed. For urgent fixes or rapid iteration, this feels impossibly slow. Containers (Docker images) build in seconds and deploy with a rolling update in 1-2 minutes.

## Resource waste from always-on VMs

VMs boot once and run until terminated. The minimum ASG size is always running, even at 3 AM when traffic is near zero. Each instance has a full Linux OS consuming memory and CPU, plus your application, plus all the background processes that come with a full OS. The actual utilization of the underlying hardware might be 5-15%.

Container orchestration (Kubernetes) runs many containers on fewer VMs, packing workloads tightly and dramatically improving utilization. You pay for the same EC2 instances but run far more on each one.

## OS management at scale

With a fleet of VMs, you are responsible for the OS of each one. CVEs get published, kernel patches come out, package updates arrive. A fleet of 20 instances means patching 20 instances (or baking and rolling a new AMI, which takes an hour). You're also running 20 identical Linux installations, each of which can drift — different package versions, inconsistent configs — if you're not careful.

Containers solve this at the application layer (the container image is immutable and identical everywhere) while managed Kubernetes reduces OS concerns to node groups that are managed by AWS/GCP.

## Deployment complexity per service

Everything above describes the complexity for *one* application. As the business grows and the monolith is broken into services, you multiply this complexity by the number of services. Each service needs its own ASG, its own AMI pipeline, its own Launch Template, its own ALB target group. Managing a dozen services this way is painful; managing a hundred is effectively impossible without container orchestration.

## What containers fix

Container images are small (tens to hundreds of MB) compared to AMIs (gigabytes). They build in seconds. A `docker run` starts a container in under a second. You can run many containers on one VM. Kubernetes adds the orchestration layer: scheduling containers onto nodes, health checking and restarting failed containers, rolling deploys, resource limits, service discovery. The operational model is fundamentally simpler at scale.

<!-- RESOURCES -->

- [Docker vs Virtual Machines - Explained](https://www.docker.com/resources/what-container/) -- type: article, time: 10m
- [CNCF Annual Survey - Container adoption trends](https://www.cncf.io/reports/cncf-annual-survey-2023/) -- type: article, time: 15m
