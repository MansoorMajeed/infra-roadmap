---
id: "docker-or-native"
title: "Docker or Install Natively?"
zone: "self-hosting"
edges:
  from:
    - id: "ssh-into-your-server"
      question: "I'm in. How do I actually install software on this thing?"
  to:
    - id: "docker-for-self-hosting"
      question: "Docker it is — how do I get started?"
      detail: "Docker is how almost every self-hosted service is distributed and run. One command to pull an image, one file to configure it."
    - id: "i-want-pain"
      question: "I want to install everything manually from source"
      detail: "This is the hard path. It's educational, but you'll spend more time fighting dependencies than running services."
difficulty: 1
tags: ["self-hosting", "docker", "linux", "package-management"]
category: "concept"
milestones:
  - "Understand why Docker is the standard for self-hosting"
  - "Make the call: Docker (recommended) or native install"
---

TODO: Write content for this node. Cover:
- The native install path: apt install, compiling from source, managing config files scattered across /etc
- Why this gets painful fast: dependency conflicts, version mismatches, upgrading breaks things
- Docker's pitch for self-hosting: each service is isolated, upgrading is just pulling a new image, rollback is trivial
- The recommendation: use Docker. This guide only covers Docker.

<!-- DEEP_DIVE -->

<!-- RESOURCES -->
