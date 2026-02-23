---
id: network-security
title: Network Security
zone: observability
edges:
  to:
    - id: secrets-management
      question: >-
        Network is locked down. Now what about the credentials services use to
        authenticate to each other?
      detail: >-
        VPC isolation and security groups control which services can talk. But
        they can't prove identity — services still need credentials. Secrets
        management is how you distribute those credentials safely: no hardcoded
        passwords, automatic rotation, and audit trails for every access.
difficulty: 2
tags:
  - vpc
  - security-groups
  - network-acl
  - waf
  - aws
  - firewall
  - network-security
  - zero-trust
category: practice
milestones:
  - 'Design a VPC with public, private, and database subnets'
  - Configure security groups with minimal ingress rules
  - Understand the difference between security groups and network ACLs
  - Set up a WAF rule to block common attack patterns
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
