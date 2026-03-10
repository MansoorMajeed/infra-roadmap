---
id: coredns
title: CoreDNS and Cluster DNS
zone: kubernetes
edges:
  to:
    - id: dns-debugging-k8s
      question: >-
        My DNS lookups are randomly slow — some take 5 seconds, some fail
        entirely. Where do I even start?
      detail: >-
        Pods resolve service names most of the time, but under load, DNS gets
        flaky. Sometimes lookups time out. I also noticed that resolving
        `api.stripe.com` from inside a pod takes way longer than it should. I
        don't know if it's CoreDNS, my resolv.conf, or something else.
difficulty: 2
tags:
  - kubernetes
  - coredns
  - dns
  - service-discovery
  - k8s
category: concept
milestones:
  - >-
    Know that CoreDNS runs as pods in kube-system and is the cluster's DNS
    server
  - >-
    Understand that every pod's /etc/resolv.conf is configured to point at the
    CoreDNS Service IP
  - >-
    Know the naming convention:
    <service>.<namespace>.svc.cluster.local
  - >-
    Understand headless Services: DNS returns pod IPs directly instead of a
    single ClusterIP
  - >-
    Know how CoreDNS watches the API server for Service and Endpoint changes to
    keep DNS records up to date
  - >-
    Understand ExternalName Services: a DNS CNAME that points to an external
    hostname
---

Every Kubernetes cluster runs a DNS server — CoreDNS. It's what lets you reach a Service by name instead of by IP. When a pod curls `my-service.default.svc.cluster.local`, CoreDNS resolves that name to the Service's ClusterIP. It runs as pods in `kube-system`, watches the Kubernetes API for Service changes, and automatically keeps DNS records in sync. Everything in your cluster depends on it working.

<!-- DEEP_DIVE -->

## How pods find CoreDNS

When kubelet creates a pod, it configures the pod's `/etc/resolv.conf` to point at the CoreDNS Service IP. You can see this from inside any pod:

```bash
kubectl exec my-pod -- cat /etc/resolv.conf
```

```
nameserver 10.96.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

The `nameserver` is the ClusterIP of the `kube-dns` Service in `kube-system` (the Service is still called `kube-dns` for historical reasons, even though CoreDNS replaced kube-dns years ago). Every DNS lookup from inside a pod goes to this IP.

## The naming convention

CoreDNS creates DNS records for every Service in the cluster. The full format is:

```
<service-name>.<namespace>.svc.cluster.local
```

From a pod in the same namespace, you can use just the service name:

```bash
# All of these resolve to the same ClusterIP
curl my-service                                    # same namespace
curl my-service.default                            # explicit namespace
curl my-service.default.svc                        # explicit subdomain
curl my-service.default.svc.cluster.local          # fully qualified
```

The short forms work because of the `search` domains in `resolv.conf`. When you look up `my-service`, the resolver appends each search domain in order until it gets a result: first `my-service.default.svc.cluster.local`, then `my-service.svc.cluster.local`, and so on.

## How CoreDNS stays in sync

CoreDNS runs a Kubernetes plugin that watches the API server for Service and Endpoint changes. When you create, delete, or modify a Service, CoreDNS picks up the change within seconds and updates its DNS records. There's no manual configuration — everything is automatic.

You can see CoreDNS running:

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get svc -n kube-system kube-dns
```

CoreDNS typically runs as a Deployment with 2 replicas for availability.

## Headless Services and DNS

A normal Service has a ClusterIP, and its DNS record resolves to that single IP. A headless Service (`clusterIP: None`) works differently — its DNS record returns the IP addresses of all the individual pods behind it.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-db
spec:
  clusterIP: None    # headless
  selector:
    app: my-db
  ports:
    - port: 5432
```

```bash
# Normal Service: resolves to one ClusterIP
dig my-app.default.svc.cluster.local
# → 10.96.0.15

# Headless Service: resolves to individual pod IPs
dig my-db.default.svc.cluster.local
# → 10.244.1.5
# → 10.244.2.8
# → 10.244.1.12
```

Headless Services are used by StatefulSets, where each pod needs to be individually addressable (like database replicas that need to find each other).

## ExternalName Services

An ExternalName Service is just a DNS alias — a CNAME record that points to an external hostname:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-database
spec:
  type: ExternalName
  externalName: mydb.example.com
```

When a pod looks up `my-database.default.svc.cluster.local`, CoreDNS returns a CNAME pointing to `mydb.example.com`. This is useful for pointing internal service names at external databases or APIs without hardcoding hostnames in your application config.

## Pod DNS records

CoreDNS can also create DNS records for individual pods, using the pod's IP with dots replaced by dashes:

```
10-244-1-5.default.pod.cluster.local
```

This is mostly used by StatefulSets, where each pod gets a stable DNS name through the headless Service:

```
my-db-0.my-db.default.svc.cluster.local
my-db-1.my-db.default.svc.cluster.local
```

## What happens if CoreDNS goes down

If both CoreDNS replicas crash, new DNS lookups fail cluster-wide. Pods that have already resolved a name and are holding a TCP connection will keep working. But any new connection attempt that needs DNS resolution will hang or fail.

This is why CoreDNS runs as a Deployment with multiple replicas, has resource requests to prevent eviction, and is treated as critical infrastructure. Monitoring CoreDNS health is essential.

<!-- RESOURCES -->

- [Kubernetes Docs - DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/) -- type: docs, time: 15m
- [CoreDNS Manual](https://coredns.io/manual/toc/) -- type: docs, time: 20m
- [Customizing DNS Service](https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/) -- type: docs, time: 10m
