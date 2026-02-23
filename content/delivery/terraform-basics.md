---
id: terraform-basics
title: Infrastructure as Code with Terraform
zone: delivery
edges:
  to:
    - id: terraform-state
      question: >-
        Terraform works locally. How does state work when a team or CI pipeline
        uses it?
      detail: >-
        Terraform tracks what it manages in a state file. Locally that's fine.
        But when two people or two CI runs apply Terraform at the same time,
        state conflicts corrupt everything. Remote state with locking solves
        this.
difficulty: 2
tags:
  - terraform
  - iac
  - hcl
  - infrastructure-as-code
  - cloud
  - automation
category: tool
milestones:
  - Install Terraform and authenticate with a cloud provider
  - Write a config that provisions a server
  - Run terraform plan and understand the output
  - Run terraform apply and verify the resource was created
  - Run terraform destroy to clean up
---

Terraform lets you describe infrastructure in code and apply it to the real world. You write HCL (HashiCorp Configuration Language) files declaring what should exist — a server, a DNS record, a database — and Terraform figures out what API calls to make to create, update, or delete resources to match.

It works with every major cloud provider and hundreds of third-party services, all through the same workflow: `plan`, `apply`, `destroy`.

<!-- DEEP_DIVE -->

## The core workflow

```bash
terraform init      # download provider plugins
terraform plan      # show what will change
terraform apply     # make it so
terraform destroy   # tear everything down
```

`plan` is your safety net. It shows exactly what Terraform intends to do before doing it — which resources will be created, modified, or destroyed. Review the plan before applying, always.

## HCL basics

A Terraform configuration has three main constructs:

**Providers** — the cloud or service you're targeting:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
```

**Resources** — the infrastructure you want:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}
```

**Variables** — parameterize your config:

```hcl
variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.micro"
}

resource "aws_instance" "web" {
  instance_type = var.instance_type
  ...
}
```

## Reading a plan

```
Terraform will perform the following actions:

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami           = "ami-0c55b159cbfafe1f0"
      + instance_type = "t3.micro"
      + id            = (known after apply)
      ...
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

`+` = create, `~` = modify in place, `-/+` = destroy and recreate, `-` = destroy. `-/+` is the dangerous one — it means the resource will be deleted and a new one created. For databases and stateful resources, that's a data-destroying change. Read plans carefully before applying.

## A minimal example: provision a DigitalOcean droplet

```hcl
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

variable "do_token" {
  description = "DigitalOcean API token"
  sensitive   = true
}

resource "digitalocean_droplet" "web" {
  name   = "web-server"
  region = "nyc3"
  size   = "s-1vcpu-1gb"
  image  = "ubuntu-24-04-x64"
}

output "ip_address" {
  value = digitalocean_droplet.web.ipv4_address
}
```

Run `terraform apply`, enter the token when prompted, confirm the plan. Terraform creates the droplet. The output block prints the IP when done.

## Outputs and references

Resources can reference each other. Add a DNS record pointing to the droplet:

```hcl
resource "digitalocean_domain" "example" {
  name = "example.com"
}

resource "digitalocean_record" "www" {
  domain = digitalocean_domain.example.name
  type   = "A"
  name   = "www"
  value  = digitalocean_droplet.web.ipv4_address
}
```

Terraform resolves dependencies automatically — it creates the droplet before the DNS record, because the record depends on the droplet's IP.

## State

Terraform tracks what it has created in a **state file** (`terraform.tfstate`). This is how it knows that `aws_instance.web` corresponds to instance `i-0abc1234` in AWS. It uses the state to compute the diff between desired config and current reality.

The state file is critical. Lose it, and Terraform can no longer manage the resources it created. Corrupt it, and the next apply may create duplicates or make destructive changes. For solo local use, the local state file is fine. For teams and CI, you need remote state — that's the next node.

<!-- RESOURCES -->

- [Terraform Documentation: Getting Started](https://developer.hashicorp.com/terraform/tutorials/aws-get-started) -- type: guide, time: 30min
- [Terraform Language Reference](https://developer.hashicorp.com/terraform/language) -- type: reference, time: ongoing
- [DigitalOcean Terraform Provider](https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs) -- type: reference, time: 10min
