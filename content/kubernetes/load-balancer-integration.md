---
id: load-balancer-integration
title: Load Balancers and Kubernetes
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - load-balancer
  - metallb
  - cloud
  - external-dns
  - k8s
category: concept
milestones:
  - >-
    Understand what type: LoadBalancer actually does — it talks to the cloud
    provider to provision a real load balancer
  - >-
    Know what the cloud controller manager is: the component that bridges
    Kubernetes and cloud provider APIs
  - >-
    Understand the cost reality: every LoadBalancer Service creates a separate
    cloud LB, which adds up fast
  - >-
    Know why Ingress exists as a pattern: one LoadBalancer fronting one Ingress
    controller that routes to many Services
  - >-
    Understand MetalLB: LoadBalancer support for bare metal and on-prem clusters
    using ARP or BGP mode
  - >-
    Know what ExternalDNS does: automatically creates DNS records for
    LoadBalancer Services
---

When you set a Service to `type: LoadBalancer` on a cloud cluster, an external IP appears within seconds. On a local cluster, the same thing just shows `<pending>` forever. The difference is the cloud controller manager — a component that bridges Kubernetes and cloud provider APIs. Understanding this mechanism explains how external traffic enters your cluster, why it costs money, and what to do when there's no cloud.

<!-- DEEP_DIVE -->

## What type: LoadBalancer actually does

A LoadBalancer Service is a superset of NodePort. When you create one:

1. Kubernetes assigns a ClusterIP (like any Service)
2. Kubernetes opens a NodePort on every node (like a NodePort Service)
3. Kubernetes tells the cloud controller manager: "I need an external load balancer for this Service"
4. The cloud controller manager calls the cloud provider's API (AWS ELB, GCP Network LB, Azure LB) to provision a real load balancer
5. The cloud LB is configured to forward traffic to the NodePort on all nodes
6. The external IP is written back to the Service's `status.loadBalancer.ingress`

```
Internet → Cloud Load Balancer → NodePort (on any node) → kube-proxy → Pod
```

The whole chain happens automatically. You create a Service, and within a minute you have a public IP backed by a cloud load balancer.

## The cloud controller manager

The cloud controller manager is the component that makes this work. It runs as pods in `kube-system` and is specific to your cloud provider:

- On EKS, it's the AWS cloud controller manager — it creates ELBs/NLBs
- On GKE, it's the GCE cloud controller — it creates Google Cloud Load Balancers
- On AKS, it's the Azure cloud controller — it creates Azure Load Balancers

When it sees a new Service of type LoadBalancer, it:
1. Creates a load balancer through the cloud API
2. Configures health checks against the NodePort
3. Adds all cluster nodes as targets
4. Reports the external IP back to Kubernetes

You can influence the load balancer type with annotations:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
  annotations:
    # AWS: use an NLB instead of a Classic ELB
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    # AWS: make it internal (no public IP)
    service.beta.kubernetes.io/aws-load-balancer-internal: "true"
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 8080
  selector:
    app: my-app
```

## The cost problem

Every LoadBalancer Service creates a separate cloud load balancer. On AWS, a Network Load Balancer costs ~$16/month plus data processing charges. If you have 10 services, that's $160/month just for load balancers — before any traffic.

This is why Ingress exists as a pattern:
- One LoadBalancer Service → one ingress controller
- The ingress controller routes HTTP traffic to many backend Services based on hostname/path
- You pay for one load balancer instead of ten

For non-HTTP services (databases, gRPC, TCP), you might still need individual LoadBalancer Services. But for HTTP, Ingress is the cost-effective approach.

## When there's no cloud: MetalLB

On bare metal, on-prem clusters, or local development clusters (kind, minikube), there's no cloud controller manager. Services of type LoadBalancer stay in `Pending` forever because nothing provisions the external IP.

MetalLB fills this gap. It's an open-source load balancer implementation for non-cloud Kubernetes clusters. It works in two modes:

### ARP mode (Layer 2)

One node claims the external IP and responds to ARP requests for it. Traffic goes to that node, then kube-proxy routes it to the right pod. Simple, works on any network, but all traffic for a given IP goes through a single node (no true load balancing at the network level).

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: pool
  namespace: metallb-system
spec:
  addresses:
    - 192.168.1.240-192.168.1.250    # IPs MetalLB can assign
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: l2
  namespace: metallb-system
```

### BGP mode

MetalLB peers with your network's routers via BGP and announces the external IPs. The routers distribute traffic across multiple nodes. True load balancing at the network level, but requires BGP-capable routers.

## ExternalDNS

Once you have external IPs (from cloud LBs or MetalLB), ExternalDNS can automatically create DNS records for them. It watches for Services and Ingresses with specific annotations, then creates A records in your DNS provider (Route 53, Cloudflare, Google Cloud DNS, etc.):

```yaml
metadata:
  annotations:
    external-dns.alpha.kubernetes.io/hostname: myapp.example.com
```

When the Service gets an external IP, ExternalDNS creates `myapp.example.com → <external-ip>` in your DNS. When the Service is deleted, the DNS record is cleaned up. No manual DNS management.

<!-- RESOURCES -->

- [Kubernetes Docs - Service Type LoadBalancer](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer) -- type: docs, time: 10m
- [MetalLB Documentation](https://metallb.io/) -- type: docs, time: 20m
- [ExternalDNS Documentation](https://github.com/kubernetes-sigs/external-dns) -- type: docs, time: 15m
