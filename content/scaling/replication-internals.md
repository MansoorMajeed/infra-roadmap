---
id: "replication-internals"
title: "How Database Replication Actually Works"
zone: "scaling"
edges:
  from:
    - id: "database-replication"
      question: "How does the replica actually stay in sync with the primary? What's happening under the hood?"
      detail: "When you add a read replica in RDS or Cloud SQL, the database engine is continuously streaming every write from the primary to the replica. Understanding this mechanism — binary logs, replication lag, and what 'eventually consistent' means — helps you reason about what you can and can't do with replicas."
  to: []
difficulty: 2
tags: ["replication", "binlog", "mysql", "replication-lag", "consistency", "eventual-consistency", "database"]
category: "concept"
milestones:
  - "Explain what a binary log (binlog) is and what it contains"
  - "Describe the difference between synchronous and asynchronous replication"
  - "Explain what replication lag is and when it matters to your application"
  - "Know why you cannot use an asynchronous replica as a direct failover target without promotion"
  - "Understand what 'reading your own writes' means and how lag can break it"
---

TODO

<!-- DEEP_DIVE -->

TODO

<!-- RESOURCES -->

TODO
