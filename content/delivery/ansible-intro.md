---
id: "ansible-intro"
title: "Configuration Management with Ansible"
zone: "delivery"
edges:
  from:
    - id: "iac-intro"
      question: "I want to understand how to configure servers with code before jumping into Terraform."
      detail: "Terraform provisions infrastructure, but something still has to configure what runs on it. Ansible is the dominant tool for this: it connects over SSH and applies configuration to servers using simple YAML playbooks."
  to:
    - id: "terraform-basics"
      question: "I understand Ansible for server configuration. Now I want to provision the infrastructure itself."
      detail: "Ansible can provision some infra, but Terraform is purpose-built for it and handles state much better. Knowing Ansible gives you a clearer appreciation for what Terraform does differently."
difficulty: 2
tags: ["ansible", "configuration-management", "automation", "playbooks", "idempotency"]
category: "tool"
milestones:
  - "Install Ansible and connect to a server via SSH"
  - "Write a playbook that installs a package and starts a service"
  - "Understand what idempotency means and why it matters in automation"
  - "Use variables and templates in a playbook"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
