---
id: multi-env-k8s
title: Multi-Environment Promotion
zone: kubernetes-production
edges:
  to:
    - id: resource-requests-limits
      question: >-
        My app is deployed across environments — but how do I make sure it
        doesn't starve or take down other pods?
      detail: >-
        In staging I don't care much about resource usage. But in production I
        worry that one misbehaving pod could consume all the memory and take
        everything else down with it. How do I actually prevent that?
    - id: service-mesh-problems
      question: >-
        Everything is running. But how do services talk to each other securely,
        and how do I know what's going wrong?
      detail: >-
        My services communicate over plain HTTP inside the cluster. I've heard
        that's not great from a security standpoint. And when a request fails
        somewhere in the chain, I have no visibility into which service is
        responsible.
    - id: namespace-strategy
      question: >-
        Should I use separate namespaces or separate clusters for each
        environment?
      detail: >-
        I've been using namespaces to separate staging and production but I'm
        not sure that's actually providing real isolation. What's actually
        stopping a misconfigured staging pod from hitting the production
        database?
    - id: network-policies
      question: >-
        How do I stop services in one environment from accidentally talking to
        services in another?
      detail: >-
        Staging and production are in the same cluster. I keep worrying that a
        misconfigured service in staging could accidentally call the production
        API or database. Right now there's nothing at the network level stopping
        that from happening.
difficulty: 3
tags:
  - kubernetes
  - environments
  - staging
  - production
  - gitops
  - promotion
  - k8s
category: practice
milestones:
  - Separate staging and production into distinct namespaces or clusters
  - Promote a release from staging to production via a pull request
  - >-
    Understand environment-specific config using Helm values or Kustomize
    overlays
  - Require manual approval before production deployments
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
