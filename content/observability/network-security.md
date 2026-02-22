---
id: "network-security"
title: "Network Security"
zone: "observability"
edges:
  from:
    - id: "iam-and-least-privilege"
      question: "IAM locks down what identities can do. What about network-level controls?"
      detail: "IAM says 'this service is allowed to call that API'. Security groups say 'this server is allowed to receive traffic on this port'. VPC isolation says 'this subnet can't talk to that subnet at all'. Defence in depth means both layers — a breached identity shouldn't mean your database is reachable."
  to:
    - id: "secrets-management"
      question: "Network is locked down. Now what about the credentials services use to authenticate to each other?"
      detail: "VPC isolation and security groups control which services can talk. But they can't prove identity — services still need credentials. Secrets management is how you distribute those credentials safely: no hardcoded passwords, automatic rotation, and audit trails for every access."
difficulty: 2
tags: ["vpc", "security-groups", "network-acl", "waf", "aws", "firewall", "network-security", "zero-trust"]
category: "practice"
milestones:
  - "Design a VPC with public, private, and database subnets"
  - "Configure security groups with minimal ingress rules"
  - "Understand the difference between security groups and network ACLs"
  - "Set up a WAF rule to block common attack patterns"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
