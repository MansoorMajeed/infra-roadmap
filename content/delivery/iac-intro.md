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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
