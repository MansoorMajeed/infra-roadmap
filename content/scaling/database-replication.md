---
id: database-replication
title: Database Replication
zone: scaling
edges:
  to:
    - id: application-caching
      question: >-
        Read replicas help. But we're still querying the database for the same
        product list on every request. What eliminates those round-trips
        entirely?
      detail: >-
        Even with replicas, every request still hits the database. For data that
        rarely changes — product listings, category pages, configuration —
        you're doing the same work over and over. An application cache stores
        results in memory so most requests never touch the database.
    - id: replication-internals
      question: >-
        How does the replica actually stay in sync? What's happening under the
        hood?
      detail: >-
        When you add a read replica, the database engine streams every write
        from the primary using a binary log. Understanding this mechanism —
        replication lag, async vs sync, what 'eventually consistent' really
        means — helps you reason about what you can and can't do with replicas.
    - id: browser-caching
      question: >-
        My servers are still sending the same images, CSS, and JS on every
        request. Can the browser just cache those?
      detail: >-
        Every page load fetches your logo, CSS, and JavaScript bundle — even if
        nothing has changed. HTTP has built-in mechanisms for this: cache
        headers that tell browsers to hold onto files they've already
        downloaded. This reduces server load and makes pages load faster for
        returning users.
difficulty: 2
tags:
  - replication
  - database
  - read-replicas
  - multi-az
  - failover
  - lag
  - consistency
category: concept
milestones:
  - Explain the difference between synchronous and asynchronous replication
  - Describe what replication lag is and when it matters
  - Understand what happens to in-flight writes during a Multi-AZ failover
  - >-
    Know why you can't use a read replica as a direct failover target without
    promotion
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
