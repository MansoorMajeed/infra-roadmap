---
id: managed-database
title: Managed Databases
zone: scaling
edges:
  to:
    - id: database-replication
      question: >-
        We're on RDS/Cloud SQL. Now how do we scale reads and add high
        availability?
      detail: >-
        We're on RDS now and it's much better than self-managing MySQL. But
        the database is still a single point of failure — if it goes down,
        everything goes down. And reads are starting to pile up. I don't know
        if I need replicas, Multi-AZ, both, or something else entirely.
difficulty: 2
tags:
  - rds
  - aws
  - database
  - managed-database
  - multi-az
  - read-replicas
  - postgresql
  - mysql
category: practice
milestones:
  - Create an RDS instance and connect to it from an EC2 instance
  - Understand what Multi-AZ deployment does (and what it doesn't do)
  - Create a read replica and configure your app to use it for reads
  - Understand the shared responsibility model for managed databases
---

Running your own database on a VM works, but it means you're responsible for everything: installing MySQL or Postgres, configuring it, taking backups, testing restores, patching CVEs, tuning replication, handling failover. Managed databases (RDS on AWS, Cloud SQL on GCP) hand most of this operational burden back to the cloud provider in exchange for a monthly fee and somewhat less control.

<!-- DEEP_DIVE -->

## What a managed database gives you

**Automated backups**: RDS takes daily snapshots and archives transaction logs continuously, giving you point-in-time restore to any second in your retention window (up to 35 days). Testing restores is a one-click operation.

**Automated patching**: Minor version patches and security updates are applied automatically during your maintenance window. You control when, but not whether.

**Multi-AZ deployments**: RDS can maintain a synchronous replica in a second availability zone. If the primary fails, RDS detects it and fails over to the replica — typically in 60-120 seconds — automatically. You don't need to write any failover logic; your connection string points to an endpoint that always resolves to the current primary.

**Monitoring built-in**: CPU, disk I/O, connection count, replication lag, and dozens of other metrics are available in CloudWatch without configuring anything.

**Storage auto-scaling**: RDS can automatically grow your storage when it's running low. No waking up at 3 AM because the disk filled up.

## What you still own

Managed doesn't mean zero responsibility. The **shared responsibility model** means:

- **You own**: schema design, index selection, query optimization, connection management, access control, deciding which parameter group settings to change
- **AWS owns**: the hardware, OS patching, daemon health, hardware failure replacement, backup infrastructure

Performance problems caused by missing indexes, N+1 queries, or poor schema design are still your problem. RDS will faithfully run your slow queries very reliably.

## RDS vs self-managed: the cost question

RDS is more expensive than running MySQL on an EC2 instance of equivalent size. An `r7g.large` RDS instance costs roughly 2x a self-managed MySQL on an equivalent EC2 instance. Whether that's worth it depends on how much you value your time and how much operational risk you want to carry. For most teams: the operational overhead of self-managed databases costs more in engineer time than the RDS premium.

## Multi-AZ vs read replicas

These are often confused because they both involve a second database:

- **Multi-AZ**: synchronous replication to a standby in another AZ, used only for failover. You cannot read from the standby — it exists purely to take over if the primary fails.
- **Read replicas**: asynchronous replication to one or more replicas. You can and should point read-heavy queries at these. They reduce read load on the primary. They are not hot standbys — promoting a replica to primary requires a manual step.

Multi-AZ is for availability. Read replicas are for read scaling. You often want both.

## Creating an RDS instance

Key decisions when creating:
- **Engine and version**: use the latest minor version of your engine. Postgres 16, MySQL 8.0, etc.
- **Instance class**: start smaller than you think you need (you can scale up with a short restart); `db.t3.medium` is a reasonable starting point for dev/staging
- **Storage type**: `gp3` (general purpose SSD) is fine for most workloads; `io1` for IOPS-intensive workloads
- **Multi-AZ**: enable it from the start in production; retrofitting it later causes a storage conversion
- **Parameter group**: start with the default; tune specific settings only when you have evidence they matter
- **Security group**: restrict database access to only your application servers — the database should never be publicly accessible

<!-- RESOURCES -->

- [AWS RDS Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html) -- type: docs, time: 30m
- [AWS RDS Multi-AZ Deployments](https://aws.amazon.com/rds/features/multi-az/) -- type: article, time: 10m
- [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) -- type: article, time: 10m
