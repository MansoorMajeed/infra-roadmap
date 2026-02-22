---
id: "secrets-management"
title: "Secrets Management"
zone: "observability"
edges:
  from:
    - id: "iam-and-least-privilege"
      question: "IAM is locked down. But my services still need database passwords and API keys. Where do those go?"
      detail: "A service's IAM role says what it can do in AWS. But the database still needs a username and password. Hardcoding credentials in environment variables, config files, or source code is one of the most common causes of security incidents. Secrets management is the right answer."
    - id: "network-security"
      question: "Network is isolated. But services still need credentials to authenticate to each other."
      detail: "Network controls stop unsolicited connections. But legitimate connections still need authentication — and that means credentials. Secrets management centralises credential storage, enforces access control, enables automatic rotation, and provides an audit trail of every secret access."
  to: []
difficulty: 2
tags: ["secrets", "aws-secrets-manager", "vault", "rotation", "credentials", "security", "devops"]
category: "practice"
milestones:
  - "Move a hardcoded database password into AWS Secrets Manager"
  - "Update the application to fetch the secret at startup using the SDK"
  - "Enable automatic rotation for the secret"
  - "Audit which services have access to which secrets and why"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
