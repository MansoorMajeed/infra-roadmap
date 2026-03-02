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

Each application server maintains a pool of persistent database connections. With one app server, this is fine. With ten app servers, each holding twenty connections open, you're at two hundred connections — and when the ASG scales out during a spike, you can hit Postgres's connection ceiling before the new servers have handled a single user request. Connection pooling solves this by multiplexing many application connections through far fewer actual database connections.

<!-- DEEP_DIVE -->

## Why connections are expensive

A Postgres connection is not a cheap resource. Each connection spawns a backend process (forked from the postmaster), consuming roughly 5-10 MB of memory per connection. Postgres has a hard `max_connections` limit, defaulting to 100 on small instances and configurable up to a few hundred on larger ones. Beyond that limit, new connection attempts fail with `FATAL: sorry, too many clients already`.

The naïve scaling math is brutal: 10 app servers × 20 connections each = 200 connections, and that's before considering database monitoring tools, migrations, read replicas, and admin sessions that also need connections.

## What a connection pool does

A connection pool like PgBouncer sits between your application servers and the database. Applications connect to PgBouncer (which looks like a normal Postgres endpoint). PgBouncer maintains a small, fixed pool of actual connections to the database. When an application "connection" needs to run a query, PgBouncer assigns it one of the real database connections, runs the query, and returns the connection to the pool.

The result: 500 application-level connections multiplexed through 20 real database connections. The database sees 20 connections; your application servers see their own private-looking connection pools.

## PgBouncer pooling modes

**Session mode**: a real database connection is assigned to an application connection for its entire lifetime. Least disruptive but least efficient — no real multiplexing, just limits the max connections.

**Transaction mode**: a real database connection is only held for the duration of a transaction. Between transactions, the real connection is returned to the pool and can be reused by other application connections. This is the most efficient mode — one real connection can serve many application connections as long as they're not all in transactions simultaneously.

**Statement mode**: connections are returned to the pool between every statement. Most efficient but breaks any application that uses transactions, session-level settings, or prepared statements. Generally not usable for production applications.

Transaction mode is the standard choice for web applications. The caveat: features that are tied to a specific connection — `LISTEN/NOTIFY`, prepared statements, session-level `SET` commands — either break or need special handling.

## RDS Proxy

AWS offers a managed connection pooler: **RDS Proxy**. It serves the same function as PgBouncer (connection multiplexing) but is fully managed, supports IAM authentication, integrates with Secrets Manager for credential rotation, and has native multi-AZ support. It's more expensive than self-hosting PgBouncer but removes the operational burden.

For Lambda functions that make burst database connections (Lambdas can scale to thousands of instances, each opening connections), RDS Proxy is the standard solution.

## Measuring the impact

Before and after adding a connection pool, measure:
- `SELECT count(*) FROM pg_stat_activity` — the number of actual connections to the database
- Connection error rate in your application logs (`too many clients`)
- Response time for database-bound requests under load

A well-configured PgBouncer should let you run 10× more application server capacity without changing the database's connection count.

## Configuration example

A minimal PgBouncer config:

```ini
[databases]
mydb = host=rds-endpoint.us-east-1.rds.amazonaws.com port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
listen_addr = 0.0.0.0
listen_port = 5432
```

Your application connects to PgBouncer (`pgbouncer-host:5432`) instead of the RDS endpoint directly. PgBouncer maintains 20 real database connections and multiplexes up to 1000 application connections through them.

<!-- RESOURCES -->

- [PgBouncer Documentation](https://www.pgbouncer.org/config.html) -- type: docs, time: 20m
- [AWS RDS Proxy](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html) -- type: docs, time: 15m
- [Postgres max_connections and Why It Matters](https://www.postgresql.org/docs/current/runtime-config-connection.html) -- type: docs, time: 10m
