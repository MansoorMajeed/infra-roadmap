---
id: terraform-state
title: Managing Terraform State
zone: delivery
edges:
  to: []
difficulty: 2
tags:
  - terraform
  - state
  - remote-state
  - s3
  - terraform-cloud
  - locking
  - collaboration
category: practice
milestones:
  - 'Move local state to remote storage (S3, Terraform Cloud, or equivalent)'
  - Enable state locking to prevent concurrent applies
  - Understand what happens if state becomes corrupted
  - Use workspaces or separate state files per environment
---

Terraform's local `terraform.tfstate` file is fine when you're the only one running it on one machine. The moment two people or a CI runner touch the same infrastructure, you need state that lives somewhere shared, with locking to prevent concurrent writes.

Remote state with locking is a one-time setup that prevents a class of very unpleasant incidents.

<!-- DEEP_DIVE -->

## What state is and why it matters

Terraform doesn't query your cloud provider to discover the current state of every resource on each run — that would be slow and error-prone. Instead, it maintains a state file that maps your config resources to the real-world resource IDs it created.

```json
{
  "resources": [
    {
      "type": "aws_instance",
      "name": "web",
      "instances": [
        {
          "attributes": {
            "id": "i-0abc12345def",
            "instance_type": "t3.micro",
            ...
          }
        }
      ]
    }
  ]
}
```

When you run `terraform plan`, Terraform compares this state to your config files and to the live provider API. The diff tells it what needs to change.

**Lose the state file**, and Terraform no longer knows it created `i-0abc12345def`. The next `apply` tries to create a new instance. You now have two.

**Corrupt the state file**, and the computed diff may destroy things that shouldn't be destroyed, or leave orphaned resources that are never cleaned up.

## The concurrency problem

Two engineers run `terraform apply` at the same time against the same infrastructure. Both read the state file, both compute a plan, both start making changes. Their writes to the state file interleave and corrupt it.

This also happens with CI pipelines. Two pipeline runs triggered close together both apply Terraform. Same problem.

**Locking** serializes applies. Before applying, Terraform acquires a lock. If another process holds the lock, it waits or fails rather than proceeding. The state file is only written by one process at a time.

## Remote state backends

Move the state file to shared, lockable storage.

### S3 + DynamoDB (AWS)

The most common setup for AWS users:

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

S3 stores the state file. DynamoDB provides locking (a record is written to the table while an apply is in progress and deleted after). Both are cheap — an S3 bucket and a DynamoDB table with on-demand pricing cost pennies per month.

### Terraform Cloud / HCP Terraform

HashiCorp's hosted backend. Free for small teams:

```hcl
terraform {
  cloud {
    organization = "my-org"

    workspaces {
      name = "production"
    }
  }
}
```

State storage, locking, a UI for viewing state and plan output, and run history are all included. The easiest option if you don't want to manage the backend infrastructure yourself.

### Other options

- **GCS** (Google Cloud Storage) — same idea as S3, for GCP users
- **Azure Blob Storage** — for Azure users
- **GitLab-managed state** — built into GitLab CI

## Separate state per environment

Don't put staging and production in the same state file. A mistake in a staging apply should never be able to affect production resources.

Two approaches:

**Separate directories/repos per environment:**
```
infra/
  staging/
    main.tf
    backend.tf   # key = "staging/terraform.tfstate"
  production/
    main.tf
    backend.tf   # key = "production/terraform.tfstate"
```

**Terraform workspaces:**
```bash
terraform workspace new staging
terraform workspace new production
terraform workspace select production
terraform apply
```

Workspaces use separate state files within the same backend (the key includes the workspace name). They work well when the infrastructure is identical across environments and only variable values differ. Separate directories are clearer when environments differ structurally.

## If state gets corrupted

State corruption is rare but not impossible — a failed apply, a killed process, or a bug can leave state in an inconsistent state.

`terraform state list` — see all resources in the state.
`terraform state show aws_instance.web` — inspect a specific resource.
`terraform state rm aws_instance.web` — remove a resource from state (stops Terraform from managing it, doesn't delete the real resource).
`terraform import aws_instance.web i-0abc12345` — import an existing resource into state.

The import command is your recovery tool: if state diverges from reality, import the real resource back so Terraform knows about it again.

<!-- RESOURCES -->

- [Terraform Backends Documentation](https://developer.hashicorp.com/terraform/language/backend) -- type: reference, time: 10min
- [Terraform Cloud Free Tier](https://developer.hashicorp.com/terraform/cloud-docs) -- type: reference, time: 10min
- [S3 Backend Configuration](https://developer.hashicorp.com/terraform/language/backend/s3) -- type: reference, time: 10min
