# Kubernetes in Production: Hardening Plan

## What we're solving

The current `kubernetes-production` zone covers the **delivery pipeline** story:
manifests → Kustomize/Helm → GitOps → ArgoCD → CI/CD → multi-env.

This plan adds the **operational hardening** story: the cluster is running, apps are
deploying, now how do you make it actually production-grade. These are different
concerns and they need to live in different parts of the graph.

---

## Groupings

### Group 1 — Cluster Architecture (before you deploy anything)

These are decisions that should be made before you commit to a cluster setup.
They sit early in the zone, branching off `k8s-for-production` in parallel with
the existing manifest management track.

| Topic | What it covers |
|---|---|
| Managed vs self-managed | EKS/GKE/AKS vs kubeadm. Why managed is almost always the answer. What "managed" actually buys you: control plane HA, etcd backups, upgrade tooling, node OS patching. Cost tradeoffs. |
| Cluster topology | One cluster or many? Per-environment clusters (dev/staging/prod isolated) vs namespaces in one cluster. Blast radius, cost, operational overhead. When monoculture makes sense vs when isolation is worth it. |
| Node pools | What a node pool is. Why you'd have multiple: system vs workload pools, spot vs on-demand, GPU nodes, memory-optimised. Sizing mental model: many small vs few large. What to put on spot and what not to. |
| Node autoscaling | Cluster Autoscaler vs Karpenter. What triggers scale-up (pending pods). What allows scale-down (and what blocks it — PDBs, do not evict annotations). Min/max configuration. |

These four nodes form a short linear chain that a learner can read before
touching manifests. They answer "what kind of cluster am I even building?"

---

### Group 2 — Workload Reliability (your pods need to be robust)

These are workload-level concerns. They apply to every deployment you run and
should be tackled after the delivery pipeline is working — but before you call
anything "production." They form a natural sequence where each concept builds on
the previous.

| Topic | What it covers |
|---|---|
| Resource requests and limits | Requests = what the scheduler uses. Limits = what the runtime enforces. CPU throttling vs memory OOM kill. QoS classes (Guaranteed / Burstable / BestEffort). The noisy neighbour problem. Why no limits is dangerous, why limits set too tight are also dangerous. Mention HPA and VPA briefly as "the next level." |
| Health checks (concrete) | Three probe types: liveness (restart if dead), readiness (pull from LB if not ready), startup (give slow starters time). Concrete examples: HTTP, TCP, exec. The critical mistake: liveness probe too aggressive causes restart loops. No readiness probe means traffic hits pods that aren't ready. Startup probe for JVM/heavy frameworks. |
| Graceful pod shutdown | SIGTERM → app should finish in-flight requests and exit. SIGKILL comes after terminationGracePeriodSeconds. The preStop hook sleep trick (why you need it: endpoints are removed async, not instantaneous). Application-level: handle the signal, drain connections, close DB pools. |
| Pod disruption budgets | Voluntary vs involuntary disruptions. A PDB tells the cluster "never take down more than N% of my pods at once." Protects during node drains, cluster upgrades, Cluster Autoscaler scale-down. Without PDB + autoscaler = all pods evicted simultaneously. minAvailable vs maxUnavailable. |
| Pod scheduling: affinity and spread | Anti-affinity: don't run two replicas of the same app on the same node or zone. topologySpreadConstraints as the modern way. Node affinity: pin workloads to specific pools (e.g. GPU jobs to GPU pool). Required vs preferred (hard constraint vs best-effort). Real availability requires pods on different physical nodes. |

These five nodes form a linear chain. Each one makes the previous one more robust:
resources prevent eviction → probes enable intelligent routing/restarts →
graceful shutdown makes restarts safe → PDBs control how many restart at once →
affinity rules ensure restarts don't all land on the same node.

---

### Group 3 — Secrets Management

Secrets surface naturally during the CI/CD pipeline phase: your pipeline deploys
everything — but how do credentials get into pods safely?

Base64 encoding is not encryption. It is trivially reversible. This is the
misconception to clear up first.

| Topic | What it covers |
|---|---|
| Secrets in production | Why native K8s Secrets are not secure by default (etcd is unencrypted unless you configure encryption at rest). The spectrum of options: Sealed Secrets (encrypt in Git, simple, self-contained) → External Secrets Operator (pull from AWS Secrets Manager / GCP Secret Manager / Vault, best for teams already on cloud providers) → HashiCorp Vault (multi-cloud, powerful, significant ops overhead). Which to reach for: ESO + cloud secret store is the most common production pattern. |

One node. It branches off `argocd-setup` since that's the moment the question
becomes real: "ArgoCD is deploying my app — but where do the passwords live?"

---

### Group 4 — Service Mesh (optional / advanced)

Most teams don't need a service mesh. It solves real problems — mTLS between
services, advanced traffic management, request-level observability — but adds
significant operational complexity. It belongs as a late optional branch, not
on the main path.

| Topic | What it covers |
|---|---|
| Service mesh intro | What problems it solves: automatic mTLS between pods, fine-grained traffic policies, circuit breaking, request tracing without code changes. Options: Istio (full-featured, complex), Linkerd (simple, fast, great defaults), Cilium Service Mesh (eBPF-based, no sidecar). Honest cost: CPU overhead per pod, operational complexity, steep learning curve. When you actually need it vs when you're over-engineering. |

One node. Optional branch off the end of the reliability chain
(`pod-scheduling-spread`) or off `multi-env-k8s`. It's a leaf — nothing
builds on it in this zone.

---

## Proposed Node Count

| Group | New nodes |
|---|---|
| Cluster architecture | 4 |
| Workload reliability | 5 |
| Secrets | 1 |
| Service mesh | 1 |
| **Total** | **11** |

---

## Proposed Graph

```
k8s-for-production
  │
  ├─→ managed-vs-self-managed          [new — cluster architecture branch]
  │     └─→ cluster-topology
  │           └─→ node-pools
  │                 └─→ node-autoscaling
  │
  └─→ managing-k8s-manifests           [existing — deployment pipeline branch]
        ├─→ kustomize-basics            [existing]
        └─→ helm-for-cluster-tools      [existing]
              both →
              gitops-intro              [existing]
                └─→ argocd-setup        [existing]
                      ├─→ k8s-secrets-management   [new — secrets branch]
                      └─→ k8s-cicd-pipeline        [existing]
                            └─→ multi-env-k8s       [existing]
                                  └─→ resource-requests-limits    [new — reliability chain]
                                        └─→ health-checks-k8s     [new]
                                              └─→ graceful-shutdown [new]
                                                    └─→ pod-disruption-budgets  [new]
                                                          └─→ pod-scheduling-spread [new]
                                                                └─→ service-mesh-intro [new, optional]
```

The cluster architecture branch and the deployment branch are **parallel** off
`k8s-for-production`. A learner can do them in either order. Both are needed
before the reliability chain makes sense.

---

## Node IDs (proposed)

| ID | Title |
|---|---|
| `managed-vs-self-managed` | Managed vs Self-Managed Kubernetes |
| `cluster-topology` | One Cluster or Many? |
| `node-pools` | Node Pools and Sizing |
| `node-autoscaling` | Node Autoscaling |
| `resource-requests-limits` | Resource Requests and Limits |
| `health-checks-k8s` | Health Checks: Liveness, Readiness, Startup |
| `graceful-shutdown` | Graceful Pod Shutdown |
| `pod-disruption-budgets` | Pod Disruption Budgets |
| `pod-scheduling-spread` | Pod Affinity, Anti-Affinity, and Spread |
| `k8s-secrets-management` | Secrets Management in Kubernetes |
| `service-mesh-intro` | Service Meshes |

---

## Open Questions

1. **Does the cluster architecture chain need to merge back into the deployment
   chain?** Currently it's a standalone branch with `node-autoscaling` as a leaf.
   Alternative: `node-pools` → `managing-k8s-manifests` (you design your cluster,
   then deploy to it). This would make the architecture track a prerequisite
   rather than parallel, which is arguably more honest.

   my answer: yes do it

2. **Where does service mesh live?** Off `pod-scheduling-spread` makes it feel
   like a progression. Off `multi-env-k8s` makes it feel more optional and
   parallel. The latter is probably more accurate.

   maybe we can have a new node that talks about problems that service mesh solves and then link it to it. you decide for now. I will review afterwards.

3. **HPA / VPA** — Horizontal and Vertical Pod Autoscaler aren't on the list but
   are related to `resource-requests-limits`. Mention inside that node, or
   separate nodes? They're probably worth a brief mention rather than full nodes
   at this stage.

   definitely separate nodes. 

4. **`node-autoscaling` vs `resource-requests-limits`** — these are closely
   related (the autoscaler reacts to pending pods, which only exist when requests
   exceed available resources). The connection should be made explicit in the
   content even if the nodes are in different parts of the graph.

   yeah sure!
