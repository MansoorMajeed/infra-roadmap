---
id: replication-internals
title: How Database Replication Actually Works
zone: scaling
edges:
  to: []
difficulty: 2
tags:
  - replication
  - binlog
  - mysql
  - replication-lag
  - consistency
  - eventual-consistency
  - database
category: concept
milestones:
  - Explain what a binary log (binlog) is and what it contains
  - Describe the difference between synchronous and asynchronous replication
  - Explain what replication lag is and when it matters to your application
  - >-
    Know why you cannot use an asynchronous replica as a direct failover target
    without promotion
  - Understand what 'reading your own writes' means and how lag can break it
---

Database replication is not magic — it's a stream of changes from one node applied to another. Understanding the mechanism (binary logs, replication threads, async vs sync modes) lets you reason about what replication guarantees and what it doesn't, when lag matters, and why you can't use an async replica as a zero-downtime failover target.

<!-- DEEP_DIVE -->

## The binary log (binlog)

MySQL and Postgres both implement replication through a persistent log of all changes made to the database. In MySQL, this is the **binary log (binlog)**. Every `INSERT`, `UPDATE`, and `DELETE` that commits successfully is written to the binlog as an event. The binlog is the authoritative record of what happened and in what order.

A replica works by reading these events from the primary's binlog and applying them in order. The replica has two threads:
- **I/O thread**: connects to the primary, reads binlog events, writes them to the replica's local relay log
- **SQL thread**: reads events from the relay log and applies them (executes the SQL) on the replica's data

Replication lag is the difference in time between when an event is written to the primary's binlog and when the SQL thread finishes applying it on the replica.

## Asynchronous replication

The default replication mode for MySQL read replicas (and Postgres streaming replication) is **asynchronous**. The primary writes to the binlog, acknowledges the write to the client, and separately sends the events to replicas. The primary doesn't wait for replicas to confirm they received anything.

Implications:
- **Low write latency**: no replica round-trip in the write path
- **Data loss risk on failover**: if the primary crashes after writing to the binlog but before the replica received those events, those writes are lost when the replica is promoted

This is why you cannot safely promote an async replica to primary during a crash without potentially losing the last few transactions. You're accepting that replicas might be slightly behind.

## Synchronous replication

**Synchronous replication** means the primary waits for at least one replica to confirm it has received (and optionally written to its relay log) the event before acknowledging the write to the client.

MySQL's **semi-synchronous replication** (a middle ground) requires at least one replica to acknowledge receipt of the event before the primary commits. This eliminates the data loss window but adds latency to every write — the primary must wait for a replica round-trip.

AWS RDS Multi-AZ uses synchronous replication. The standby must confirm every write before RDS acknowledges it. This is why Multi-AZ has no data loss on failover — the standby has every committed transaction.

## Replication lag in practice

Lag accumulates when:
- The primary is handling large transactions (an UPDATE touching 10 million rows generates a lot of binlog events that take time to apply on the replica)
- The replica's SQL thread can't keep up with the I/O thread (the replica instance is undersized)
- Network congestion between primary and replica

**Reading your own writes**: the classic lag problem. A user writes data and then immediately reads it from a replica that hasn't received the write yet. They see stale data — their write appears missing. Solutions:
- After writes, read from the primary for a brief window
- Route users to a replica only after confirming the replica is caught up to the point of their last write (track the binlog position)
- For anything where freshness is critical, always read from the primary

## The promotion cost

Promoting a replica to primary is not instant:
1. Stop replication (so the replica stops being a follower)
2. Wait for all relay log events to be applied (if there's lag, this takes time)
3. Update the replica's role to primary
4. Update your connection configuration to point at the new primary

With async replication, step 2 might be impossible if the primary crashed — you may have to promote with acknowledged lag and accept losing those transactions. This is the unavoidable trade-off of async replication.

<!-- RESOURCES -->

- [MySQL Binary Log](https://dev.mysql.com/doc/refman/8.0/en/binary-log.html) -- type: docs, time: 20m
- [PostgreSQL Streaming Replication](https://www.postgresql.org/docs/current/warm-standby.html) -- type: docs, time: 20m
- [Designing Data-Intensive Applications - Ch. 5 (Replication)](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/) -- type: book, time: 1h
