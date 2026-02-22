---
id: "iac-intro"
title: "Infrastructure as Code"
zone: "delivery"
edges:
  from:
    - id: "deployment-strategies"
      question: "My deploy pipeline is solid. But the infrastructure it deploys to was set up by hand. What's Infrastructure as Code?"
      detail: "You've automated deployments, but the servers, networks, and load balancers underneath were clicked into existence in a cloud console. When something breaks, you can't recreate it. Infrastructure as Code brings the same rigor to infra that CI/CD brings to code."
  to:
    - id: "terraform-basics"
      question: "IaC makes sense. Show me Terraform."
      detail: "Terraform is the dominant IaC tool. You write declarative configs describing your infrastructure, and Terraform figures out what to create, change, or destroy. Works with AWS, GCP, Azure, DigitalOcean, and more."
    - id: "ansible-intro"
      question: "What about configuring the servers themselves? I've heard of Ansible."
      detail: "Terraform provisions infrastructure — it creates servers. Ansible configures what's on them — it installs packages, writes config files, manages services. They solve different problems and are often used together."
difficulty: 1
tags: ["iac", "infrastructure-as-code", "terraform", "ansible", "automation", "devops"]
category: "concept"
milestones:
  - "Explain what 'snowflake servers' are and why they're a problem"
  - "Describe the difference between declarative and imperative IaC"
  - "Understand the difference between provisioning (Terraform) and configuration (Ansible)"
---

You've automated your deployments — but the servers they deploy to were created by hand. Someone logged into a cloud console, clicked through a wizard, and tweaked things until it worked. That server exists nowhere except in AWS (or Hetzner, or DigitalOcean) and in its creator's memory.

Infrastructure as Code means describing your infrastructure in version-controlled files. The same discipline CI/CD brings to application code, applied to the servers themselves.

<!-- DEEP_DIVE -->

## The snowflake server problem

A server that was set up manually accumulates changes over time. A package installed to debug an issue. A config file tweaked to fix a problem. An extra port opened and forgotten. Over months, the server drifts from any documented state.

This is called a **snowflake server** — unique, fragile, and irreproducible. When it dies, you spend days trying to recreate what you had. When you need a second one (staging, load balancing), you can't.

IaC solves this by making the code the truth. The server is always reproducible because the code that creates it is in version control. If it dies, you run the code again and get an identical replacement.

## Declarative vs imperative

**Declarative IaC** (Terraform, Pulumi): you describe the desired end state. "I want a server with 2 CPUs, 4GB RAM, Ubuntu 24.04, in us-east-1." The tool figures out what actions to take to get there.

**Imperative IaC** (Ansible, shell scripts): you describe the steps to take. "Run apt update. Install nginx. Copy this config file. Restart the service." You control the sequence.

Both have their place. Declarative is better for provisioning (what resources should exist). Imperative is better for configuration (what should be running on them).

## Two problems, two tools

There's a common source of confusion: Terraform and Ansible seem to overlap. They don't — they solve adjacent problems.

**Terraform** provisions infrastructure. It creates cloud resources: servers, networks, load balancers, DNS records, storage buckets. It knows nothing about what's running inside those servers.

**Ansible** configures what's on a server. It connects over SSH and runs tasks: install nginx, write a config file, enable a systemd service. It doesn't provision the server — it expects the server to already exist.

In practice, they're often used together: Terraform creates the infrastructure, Ansible configures it. Or one without the other, depending on what you need.

## IaC in CI/CD

Once your infrastructure is code, you can run it in your pipeline. A `terraform plan` on every pull request shows what infrastructure changes would result. A `terraform apply` on merge actually makes those changes. Your infrastructure gets the same review, testing, and audit trail as your application code.

This is the end goal: your entire stack — application code and infrastructure — reproduced from Git, deployed automatically, and never hand-configured.

<!-- RESOURCES -->

- [HashiCorp: What is IaC?](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code) -- type: reference, time: 10min
- [Pets vs Cattle (concept)](https://cloudscaling.com/blog/cloud-computing/the-history-of-pets-vs-cattle/) -- type: reference, time: 5min
