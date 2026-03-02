---
id: connection-pooling
title: Connection Pooling
zone: scaling
edges:
  to:
    - id: managed-database
      question: Connection pooling is handling the pressure. But I'm still managing MySQL on a VM myself — backups, patching, failover. What does a managed database actually buy me?
      detail: >-
        PgBouncer is absorbing the connection spikes. But I'm still on call for
        the database itself — schema migrations at 2 AM, manual backups I keep
        forgetting to test, no automatic failover. What does handing this to
        a managed service actually look like?
difficulty: 2
tags:
  - connection-pooling
  - pgbouncer
  - rds-proxy
  - database
  - postgres
  - mysql
  - scaling
category: practice
milestones:
  - Explain why each app server maintaining its own connection pool is a problem at scale
  - Know what PgBouncer does and how connection multiplexing works
  - Explain the difference between transaction mode and session mode pooling
  - Know what max_connections is in Postgres and why it is a hard limit
  - Set up PgBouncer (or RDS Proxy) in front of a database
  - Measure connection count before and after adding a pool
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
