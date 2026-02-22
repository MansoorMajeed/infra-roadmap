---
id: "terraform-state"
title: "Managing Terraform State"
zone: "delivery"
edges:
  from:
    - id: "terraform-basics"
      question: "Terraform works great locally. How do I manage state when a team or CI pipeline uses it?"
      detail: "Terraform's local state file is fine for solo experiments. The moment a second person or a CI runner applies Terraform, you risk state conflicts and corruption. Remote state with locking is the standard answer."
  to: []
difficulty: 2
tags: ["terraform", "state", "remote-state", "s3", "terraform-cloud", "locking", "collaboration"]
category: "practice"
milestones:
  - "Move local state to remote storage (S3, Terraform Cloud, or equivalent)"
  - "Enable state locking to prevent concurrent applies"
  - "Understand what happens if state becomes corrupted"
  - "Use workspaces or separate state files per environment"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
