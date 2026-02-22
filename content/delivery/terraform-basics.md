---
id: "terraform-basics"
title: "Infrastructure as Code with Terraform"
zone: "delivery"
edges:
  from:
    - id: "iac-intro"
      question: "IaC makes sense — show me Terraform."
      detail: "Terraform is the dominant IaC tool. Write HCL configs that declare what infrastructure should exist, run terraform apply, and it figures out what to create, change, or destroy. Works with every major cloud provider."
    - id: "ansible-intro"
      question: "I understand Ansible for config management. Now I want to provision the infrastructure itself."
      detail: "Ansible can provision servers, but Terraform is purpose-built for it. Terraform's state model, plan/apply workflow, and provider ecosystem make it the standard tool for managing cloud infrastructure as code."
  to:
    - id: "terraform-state"
      question: "Terraform works locally. How does state work when a team or CI pipeline uses it?"
      detail: "Terraform tracks what it manages in a state file. Locally that's fine. But when two people or two CI runs apply Terraform at the same time, state conflicts corrupt everything. Remote state with locking solves this."
difficulty: 2
tags: ["terraform", "iac", "hcl", "infrastructure-as-code", "cloud", "automation"]
category: "tool"
milestones:
  - "Install Terraform and authenticate with a cloud provider"
  - "Write a config that provisions a server"
  - "Run terraform plan and understand the output"
  - "Run terraform apply and verify the resource was created"
  - "Run terraform destroy to clean up"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
