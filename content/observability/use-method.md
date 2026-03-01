---
id: use-method
title: The USE Method
zone: observability
edges:
  to:
    - id: prometheus-basics
      question: >-
        I know what USE means now. How do I actually collect utilization,
        saturation, and error metrics from my infrastructure?
      detail: >-
        USE makes sense in theory but I don't know how to get these numbers.
        Is CPU utilization something I instrument in my app, or does something
        scrape it from the host? Who collects disk saturation? I'm not sure
        where the boundary is between app metrics and infra metrics.
difficulty: 1
tags:
  - metrics
  - use-method
  - utilization
  - saturation
  - infrastructure
  - observability
category: concept
milestones:
  - Define Utilization, Saturation, and Errors for a resource
  - Apply USE to at least two resources (CPU and disk) for a running service
  - Know when to apply RED vs USE — services vs resources
  - Understand what "saturation" means and why it matters more than utilization alone
---

When your application metrics look fine but the server feels slow, you're asking questions about infrastructure — and the USE method is how you answer them systematically. Coined by Brendan Gregg, USE stands for Utilization, Saturation, and Errors. For every resource in your system — CPU, memory, disk, network — you ask those three questions. The answers tell you whether a resource is the bottleneck and how close it is to failing.

The most important signal is saturation, and it's the most commonly overlooked. Utilization tells you how busy a resource is — a CPU at 80% is fairly loaded. But saturation tells you whether there's work piling up, waiting for that resource. A CPU at 80% with no run queue is handling load well. A CPU at 80% with a run queue of 10 means processes are queued and waiting — and your application is slower than it needs to be. High saturation means you've hit capacity even if utilization isn't at 100%.

The USE method is for resources, not services. For services (APIs, databases, microservices), you use the RED method — Rate, Errors, Duration. The two methods complement each other: RED alerts you that your service is slow, USE tells you why. If p99 latency is spiking and the CPU run queue is growing, you've found your bottleneck.

<!-- DEEP_DIVE -->

## The three signals

### Utilization: how busy is the resource?

Utilization is the percentage of time a resource is busy, or the percentage of capacity in use. It's the number most people already monitor — "CPU is at 70%", "disk is 85% full."

High utilization is worth watching but not inherently alarming. Resources can run at high utilization and still perform well, as long as there's no queuing (saturation). The problems start when utilization approaches 100% — at that point, any additional load causes queuing.

### Saturation: is there work queued and waiting?

Saturation measures whether requests for a resource are queuing up. This is the critical signal that utilization alone misses.

- **CPU saturation**: run queue length — how many processes are waiting for a CPU turn
- **Memory saturation**: swap usage — if the system is using swap, it's paging memory to disk, which is extremely slow
- **Disk saturation**: I/O queue depth — how many disk operations are waiting
- **Network saturation**: packet drops and interface errors — if the network buffer is full, packets get dropped

A resource at 60% utilization with a persistent queue is already saturated. You may need to add capacity or reduce load even though the utilization number looks fine.

### Errors: is the resource reporting errors?

Hardware errors, driver errors, ECC memory errors, disk read errors — things the OS and hardware report about the resource itself. These are different from application errors. A disk with a growing number of reallocated sectors is about to fail. A network card with a rising CRC error count has a hardware problem.

In practice, infrastructure errors are often detected late or not at all. Setting up monitoring for hardware-level errors (via SMART data, IPMI, or kernel logs) is a mark of mature infrastructure operations.

## Applying USE to common resources

### CPU

| Metric | Tool / Prometheus metric |
|--------|--------------------------|
| Utilization | `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)` |
| Saturation | `node_load1` (1-minute load average) or `node_schedstat_waiting_seconds_total` |
| Errors | Rare — CPU errors are hardware events, typically in kernel logs |

A CPU that's 80% utilized with a load average equal to the number of cores is fine. The same CPU with a load average 2x the core count is saturated — processes are queuing.

### Memory

| Metric | Tool / Prometheus metric |
|--------|--------------------------|
| Utilization | `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100` |
| Saturation | `node_memory_SwapTotal_bytes - node_memory_SwapFree_bytes` (swap in use) |
| Errors | ECC memory errors (from `node_edac_*` metrics if available) |

Memory utilization near 100% is a warning. Memory saturation (active swap usage, especially increasing swap usage) is an emergency — disk is orders of magnitude slower than RAM, and swap usage causes severe application slowdowns.

### Disk I/O

| Metric | Tool / Prometheus metric |
|--------|--------------------------|
| Utilization | `rate(node_disk_io_time_seconds_total[5m])` — time the disk was busy |
| Saturation | `rate(node_disk_io_time_weighted_seconds_total[5m])` — I/O wait time |
| Errors | `rate(node_disk_read_errors_total[5m])`, `rate(node_disk_write_errors_total[5m])` |

A disk at 100% I/O utilization for extended periods indicates the disk is the bottleneck. SSDs typically handle saturation much better than spinning disks.

### Network

| Metric | Tool / Prometheus metric |
|--------|--------------------------|
| Utilization | `rate(node_network_transmit_bytes_total[5m])` vs interface capacity |
| Saturation | `rate(node_network_transmit_drop_total[5m])` — dropped packets |
| Errors | `rate(node_network_transmit_errs_total[5m])` |

Network saturation manifests as packet drops and increased retransmission at the TCP layer, which causes application-level latency spikes.

## How to collect USE metrics

You almost never instrument USE metrics in your application code. These come from the host — the operating system, kernel, and hardware. The standard tool for Prometheus is **node_exporter**:

```bash
# Run node_exporter on each host
docker run -d \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  prom/node-exporter \
  --path.rootfs=/host
```

node_exporter exposes hundreds of host-level metrics. A Prometheus scrape config to collect them:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']  # node_exporter default port
```

For Kubernetes environments, the Prometheus kube-state-metrics and metrics-server expose cluster-level resource metrics. Cloud environments have managed equivalents — CloudWatch, Cloud Monitoring, Azure Monitor — that collect host metrics without running your own exporter.

## USE in practice: diagnosing a slow service

Scenario: your API's p99 latency jumped from 120ms to 800ms an hour ago.

Using USE to diagnose:

1. **CPU utilization**: 78% (up from 45%) — elevated but not extreme
2. **CPU saturation** (load average): 12 on a 4-core host — 3x the core count. Processes are queuing for CPU time.
3. **Memory utilization**: 65% (normal)
4. **Memory saturation** (swap): 0 bytes (fine)
5. **Disk I/O**: low

Diagnosis: the CPU is saturated. Something caused a 3x increase in CPU load. The latency increase is caused by processes queuing for CPU time. Next step: profile which code is consuming the CPU.

This is the USE method doing its job — a systematic walk through resources that leads you to the bottleneck rather than guessing.

<!-- RESOURCES -->

- [The USE Method — Brendan Gregg](https://www.brendangregg.com/usemethod.html) -- type: article, time: 15m
- [Linux Performance — Brendan Gregg](https://www.brendangregg.com/linuxperf.html) -- type: article, time: 20m
- [node_exporter — Prometheus host metrics exporter](https://github.com/prometheus/node_exporter) -- type: article, time: 10m
- [Systems Performance: Enterprise and Cloud (Brendan Gregg)](https://www.brendangregg.com/systems-performance-2nd-edition-book.html) -- type: book, time: 600m
- [RED Method vs USE Method](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/) -- type: article, time: 10m
