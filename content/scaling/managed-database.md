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
        Moving to a managed database is step one. Step two is adding read
        replicas so read-heavy traffic — product listings, searches, category
        pages — doesn't hammer the primary. And Multi-AZ / high availability
        gives you automatic failover if the primary goes down.
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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
