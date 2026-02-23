---
id: services
title: Kubernetes Services
zone: kubernetes
edges:
  to:
    - id: service-types
      question: >-
        I understand Services for internal traffic. How do I expose a Service
        outside the cluster?
      detail: >-
        My Service works inside the cluster, but I need actual users to reach it
        from the internet. Is that a different type of Service, or a completely
        different kind of resource? I keep seeing 'Ingress' in the docs and I'm
        not sure where Services end and that begins.
    - id: debugging-services
      question: >-
        I created a Service but I can't reach my app through it — requests just
        time out.
      detail: >-
        kubectl get svc shows the Service is there with a ClusterIP. But when I
        try to curl it from another pod, nothing comes back. I have no idea if
        the problem is the Service itself, the labels on my pods, or something
        else entirely.
difficulty: 1
tags:
  - kubernetes
  - services
  - clusterip
  - networking
  - dns
  - load-balancing
  - k8s
category: concept
milestones:
  - Create a ClusterIP Service that routes to your Pod
  - Reach the Service from another Pod using its DNS name
  - Understand how Kubernetes DNS resolves service.namespace.svc.cluster.local
  - Use kubectl describe service to understand endpoints and selectors
---

Pods are ephemeral — their IP addresses change whenever they're replaced. A Kubernetes Service gives your workload a stable name and virtual IP that load-balances across a set of Pods, and registers it in cluster DNS so other workloads can find it without hardcoding any Pod IPs.

<!-- DEEP_DIVE -->

## The problem with Pod IPs

Every Pod gets an IP address. But Pod IPs are ephemeral. Kill a Pod and its IP is gone. The replacement Pod gets a different IP. If another service is hardcoded to the old IP, it's now pointing at nothing.

Services solve this with a level of indirection. You define a Service with a **selector** that matches your Pods by label, and Kubernetes continuously maintains the list of matching Pod IPs (the "endpoints"). The Service has a stable virtual IP (the ClusterIP) that never changes, and `kube-proxy` on each node handles routing traffic from that virtual IP to real Pod IPs.

## Writing a ClusterIP Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
  namespace: default
spec:
  selector:
    app: my-app        # matches Pods with this label
  ports:
    - port: 80         # the port the Service listens on
      targetPort: 8080 # the container's actual port
  type: ClusterIP      # this is the default, can be omitted
```

Any Pod in the cluster can now reach your app at `my-app.default.svc.cluster.local:80` — or just `my-app:80` from within the same namespace.

## Kubernetes DNS

CoreDNS runs in `kube-system` and handles DNS resolution for Services. The full DNS name pattern is:

```
<service-name>.<namespace>.svc.cluster.local
```

Within the same namespace, the short name `<service-name>` resolves. From a different namespace, you need at least `<service-name>.<namespace>`. The full form always works from anywhere.

## How traffic actually gets there

`kube-proxy` runs on every node and watches for Service and Endpoint changes. In its default iptables mode, it installs iptables rules that intercept traffic destined for the ClusterIP and rewrite the destination to a randomly selected Pod IP. The ClusterIP itself doesn't listen on anything — it's purely a routing target maintained by iptables rules.

## Inspecting a Service

```bash
kubectl describe service my-app
```

Look at the `Endpoints:` field — it shows the actual Pod IPs currently receiving traffic. If it's empty, your selector doesn't match any Pods. This is the most common cause of "my Service isn't working" — a label typo in the selector or the Pod template.

```bash
kubectl get endpoints my-app
```

## Services and readiness probes

Services only route traffic to Pods that are passing their readiness probe. A Pod that fails its readiness check is automatically removed from the Service's endpoint list until it recovers. This is how the two systems work together: the Service handles discovery and load-balancing, readiness probes control which Pods are eligible to receive traffic.

<!-- RESOURCES -->

- [Kubernetes Docs - Services](https://kubernetes.io/docs/concepts/services-networking/service/) -- type: docs, time: 25m
- [Kubernetes DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/) -- type: docs, time: 15m
- [A Guide to the Kubernetes Networking Model](https://sookocheff.com/post/kubernetes/understanding-kubernetes-networking-model/) -- type: article, time: 20m
