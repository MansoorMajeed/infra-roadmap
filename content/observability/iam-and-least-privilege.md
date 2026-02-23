---
id: iam-and-least-privilege
title: IAM and Least Privilege
zone: observability
edges:
  to:
    - id: secrets-management
      question: >-
        Permissions are locked down. But my services still need credentials to
        talk to databases and external APIs. How do I manage those safely?
      detail: >-
        IAM controls what identities can do. But services also need passwords,
        API keys, and certificates to authenticate themselves. Hardcoded secrets
        in code or config files are a critical vulnerability — secrets
        management is the safe alternative.
    - id: network-security
      question: >-
        IAM controls identity. What about network-level controls — firewalls,
        VPC isolation, WAF?
      detail: >-
        Identity-based controls (IAM) and network-based controls (VPC, security
        groups, WAF) are complementary layers. Compromising one shouldn't mean
        owning everything. Network segmentation ensures a breached service can't
        reach the database it has no business touching.
difficulty: 2
tags:
  - iam
  - aws
  - least-privilege
  - roles
  - policies
  - zero-trust
  - security
category: practice
milestones:
  - 'Understand the difference between IAM users, roles, and policies'
  - Replace long-lived access keys with IAM roles for EC2 and ECS tasks
  - >-
    Write a minimal IAM policy that grants only the permissions a service
    actually needs
  - Audit existing IAM policies and remove wildcard permissions
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
