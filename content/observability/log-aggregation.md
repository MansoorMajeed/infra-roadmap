---
id: log-aggregation
title: Centralised Log Aggregation
zone: observability
edges:
  to:
    - id: querying-logs-effectively
      question: >-
        All my logs are in one place but I don't really know how to search
        them. I'm just scrolling.
      detail: >-
        I got everything centralized but now I'm staring at a wall of log lines
        and doing the same grep I was doing before. I know the query tool is
        more powerful than that — I just don't know how to use it well.
    - id: log-costs-and-retention
      question: My log bill is getting alarming. I'm logging everything and it adds up.
      detail: >-
        Every service is shipping logs and apparently I've been keeping 90 days
        of everything. The cost is growing faster than my traffic and I have no
        idea what I'm actually paying to store versus what I actually look at.
    - id: metrics-and-monitoring
      question: >-
        Logs tell me what happened. What tells me how the system is performing
        right now?
      detail: >-
        Logs are great for specific events but every performance question I want
        to ask — what's my error rate, how many requests per second, is latency
        getting worse — means querying and counting log lines. That can't be
        the right way to answer real-time performance questions.
difficulty: 1
tags:
  - logging
  - log-aggregation
  - cloudwatch
  - loki
  - elk
  - opensearch
  - fluentd
  - observability
category: practice
milestones:
  - >-
    Ship logs from an application to a central store (CloudWatch Logs, Loki, or
    equivalent)
  - >-
    Write a query to find all error logs from a specific service in the last
    hour
  - >-
    Filter logs by correlation ID to trace a single request across multiple
    services
  - Understand the cost implications of log retention and volume
---

Your application writes structured logs to stdout. Great. But right now those logs only exist in two places: the terminal where you ran the process (if it's still running) and the container's ephemeral buffer (if it's containerised). When the process restarts, that history is gone. When you have 30 container replicas spread across 10 nodes, you'd need to SSH into each one individually to read logs. This is why centralised log aggregation exists: to collect logs from everywhere they're generated and make them searchable from a single place.

The basic flow is straightforward. A log shipping agent runs alongside your applications — either as a sidecar container, a DaemonSet on each Kubernetes node, or a system service. It reads the stdout of your containers or processes, buffers the log lines, and forwards them to a central log store. The central store indexes the logs and provides a query interface. When something breaks at 2am, you open one browser tab and search across every service and every instance from one place.

The choice of tooling depends on where you're running and how much operational complexity you want to take on. The three main approaches are: a managed cloud service (CloudWatch Logs on AWS, Cloud Logging on GCP), a self-hosted lightweight option (Grafana Loki), or the traditional ELK/EFK stack (Elasticsearch or OpenSearch with Logstash or Fluentd and Kibana). Each has tradeoffs in cost, query power, and operational burden.

<!-- DEEP_DIVE -->

## How logs flow from app to query UI

Understanding the pipeline helps you debug it when something goes wrong and make informed decisions about each component.

```
Application stdout
      │
      ▼
Log Shipping Agent (Fluent Bit / Fluentd / CloudWatch Agent)
      │  (reads, buffers, optionally filters/transforms)
      ▼
Log Store (CloudWatch Logs / Loki / Elasticsearch)
      │  (indexes, stores, provides query API)
      ▼
Query UI (CloudWatch Logs Insights / Grafana / Kibana)
```

Each stage has a job:

**The shipping agent** reads log output from your applications, optionally enriches or filters them (adding Kubernetes metadata like pod name and namespace, dropping debug logs, parsing multi-line stack traces), and forwards them to the central store. It usually runs with buffering and retry logic so it doesn't lose logs if the destination is temporarily unavailable.

**The log store** is responsible for ingesting log data, indexing it for fast querying, and storing it durably. Indexing is what makes search fast — instead of scanning every log line every time you query, the index lets the store jump directly to lines matching your filters.

**The query UI** sits on top of the store and gives you a way to write queries, view results, build dashboards, and set up alerts. In many stacks, this is where you'll spend most of your time during an incident.

## The main options

### CloudWatch Logs (AWS)

If you're running on AWS, CloudWatch Logs is the path of least resistance. EC2 instances, ECS containers, and Lambda functions can all be configured to ship logs to CloudWatch with minimal setup. You don't run any infrastructure for it — Amazon manages the collection and storage layer.

The query interface, CloudWatch Logs Insights, is capable of field-level filtering, aggregation, and even visualization. The tradeoff is cost — CloudWatch charges per GB ingested and per GB stored, and those costs add up faster than most people expect.

### Grafana Loki

Loki is a log aggregation system designed by the Grafana team that takes a deliberately different approach to indexing. Traditional systems like Elasticsearch index every field in every log line, which is powerful but expensive. Loki indexes only labels (like `service`, `host`, and `environment`) and stores the log content compressed but unindexed. This makes Loki much cheaper to run at scale, with the tradeoff that queries against unindexed fields are slower.

If you're already running Grafana (or want to), Loki is a natural fit. Fluent Bit can ship to Loki with a straightforward configuration, and the query language (LogQL) is readable and powerful for field-filtered searches.

### ELK / EFK Stack

Elasticsearch is the most powerful option for log search — it indexes every field, making arbitrary queries fast. Kibana is a full-featured UI for searching logs, building dashboards, and configuring alerts. Logstash or Fluentd sits in the middle doing log parsing and routing.

The tradeoff is operational complexity. Running Elasticsearch reliably requires real work — it's memory-hungry, needs careful tuning, and can be difficult to operate at scale without experience. For small teams, this overhead often isn't worth it. OpenSearch is the open-source fork of Elasticsearch and is functionally equivalent for most purposes.

## Shipping agents: Fluent Bit vs. Fluentd

**Fluent Bit** is a lightweight log forwarder written in C. It's fast, has a small memory footprint, and is the recommended choice for most Kubernetes setups. It runs as a DaemonSet (one instance per node), reads container logs, applies filters, and forwards to your chosen backend.

**Fluentd** is the older, heavier sibling. It supports a much larger plugin ecosystem, which is useful if you need complex parsing or routing. But it uses more memory and CPU than Fluent Bit. A common pattern: Fluent Bit on each node for collection, Fluentd as a centralised aggregator for complex processing before forwarding to the store.

## A practical Fluent Bit configuration for Kubernetes + Loki

```ini
[SERVICE]
    Flush     5
    Log_Level info

[INPUT]
    Name              tail
    Path              /var/log/containers/*.log
    Parser            docker
    Tag               kube.*
    Refresh_Interval  5

[FILTER]
    Name                kubernetes
    Match               kube.*
    Kube_Tag_Prefix     kube.var.log.containers.
    Merge_Log           On
    Keep_Log            Off

[OUTPUT]
    Name        loki
    Match       *
    Host        loki.monitoring.svc.cluster.local
    Port        3100
    Labels      job=fluentbit, namespace=$kubernetes['namespace_name'], pod=$kubernetes['pod_name']
```

This reads container logs, enriches them with Kubernetes metadata (namespace, pod name, labels), and forwards to Loki with meaningful labels.

## Retention: what to think about before you set it up

Most log stores let you configure retention — how long logs are kept before they're automatically deleted. The default in many managed services is 90 days, which is almost certainly longer than you need for most logs. Retention drives storage costs directly.

A reasonable starting point for small teams:
- ERROR and WARN logs: 30–90 days (you'll need these for incident retrospectives)
- INFO logs: 14–30 days (useful for recent investigations, rarely needed beyond that)
- DEBUG logs: 3–7 days at most (almost never needed after the fact)

Set these deliberately before you start generating volume. It's much easier to configure short retention upfront than to delete 6 months of stored logs later.

<!-- RESOURCES -->

- [Fluent Bit Documentation](https://docs.fluentbit.io/) -- type: article, time: 30m
- [Grafana Loki Getting Started](https://grafana.com/docs/loki/latest/get-started/) -- type: tutorial, time: 30m
- [CloudWatch Logs Insights — Getting Started](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_AnalyzeLogData_RunSampleQuery.html) -- type: tutorial, time: 15m
- [Elasticsearch: The Definitive Guide (free online)](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html) -- type: book, time: 300m
