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

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
