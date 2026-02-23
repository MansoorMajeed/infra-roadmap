---
id: service-types
title: 'Service Types: NodePort and LoadBalancer'
zone: kubernetes
edges:
  to:
    - id: ingress
      question: >-
        NodePort and LoadBalancer work but feel clunky for HTTP. Is there a
        better way?
      detail: >-
        Every HTTP service needs its own cloud load balancer? That's going to
        get expensive fast. I have a frontend, an API, a docs site — I don't
        want three separate load balancers. There must be a smarter way to route
        HTTP traffic to different services from a single entry point.
difficulty: 1
tags:
  - kubernetes
  - nodeport
  - loadbalancer
  - services
  - networking
  - external-access
  - k8s
category: concept
milestones:
  - Expose a Service with NodePort and reach it via the node's IP and port
  - Expose a Service with LoadBalancer on a cloud provider and get a public IP
  - Explain why you wouldn't use a LoadBalancer Service for every HTTP endpoint
  - >-
    Understand the relationship between NodePort, LoadBalancer, and ClusterIP
    (they build on each other)
---

A ClusterIP Service is only reachable inside the cluster. NodePort and LoadBalancer are Service types that extend access to the outside world, each with different trade-offs. For HTTP services, both are usually superseded by Ingress — but understanding the types explains how external traffic flows into a cluster.

<!-- DEEP_DIVE -->

## How Service types build on each other

Kubernetes Service types aren't separate concepts — they're layers that build on each other:

- **ClusterIP** — virtual IP, internal only. The base type.
- **NodePort** — builds on ClusterIP. Opens a port on every node in the cluster. Traffic hits any node → routed to the ClusterIP → routed to a Pod.
- **LoadBalancer** — builds on NodePort. Provisions a cloud load balancer pointing at your nodes' NodePorts. Traffic hits the load balancer → hits a NodePort → hits a Pod.

## NodePort

NodePort allocates a port (default range: 30000–32767) on every node in the cluster and forwards traffic from `<any-node-ip>:<nodePort>` to the Service.

```yaml
apiVersion: v1
kind: Service
spec:
  type: NodePort
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080  # omit to get a randomly assigned port in the range
```

You can now reach the service at `http://<node-ip>:30080`. The problems: you need to know a node's IP, nodes come and go, and the non-standard port is awkward to expose to users.

NodePort is useful for local development clusters (kind, minikube) where there's no cloud load balancer, and for on-premises setups managing their own external load balancing.

## LoadBalancer

LoadBalancer is the cloud-native answer: Kubernetes integrates with the cloud provider's API to provision a real load balancer automatically.

```yaml
apiVersion: v1
kind: Service
spec:
  type: LoadBalancer
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 8080
```

After applying this on EKS, GKE, or AKS, `kubectl get service` will eventually show an `EXTERNAL-IP` — the public IP or hostname of the provisioned load balancer. Real traffic flows in on port 80.

The problem: every LoadBalancer Service provisions a separate cloud load balancer. At scale — dozens or hundreds of services — that's expensive and unmanageable. This is why HTTP traffic typically goes through Ingress instead.

## When to use which

- **NodePort** — local clusters, on-premises setups, or when you're managing your own external load balancer (like HAProxy, nginx, or a hardware load balancer)
- **LoadBalancer** — TCP/UDP services in the cloud that can't go through HTTP routing: databases with external access, game servers, MQTT brokers, anything that isn't HTTP/HTTPS
- **Ingress** — everything HTTP/HTTPS in production. One load balancer, many services, routing by hostname and path.

On-premises clusters that need LoadBalancer behavior (without a cloud provider) can use **MetalLB**, which implements the LoadBalancer type by announcing Service IPs via ARP or BGP.

<!-- RESOURCES -->

- [Kubernetes Docs - Service Types](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types) -- type: docs, time: 20m
- [NodePort vs LoadBalancer vs Ingress - When to use what](https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0) -- type: article, time: 10m
- [MetalLB - LoadBalancer for on-premises clusters](https://metallb.universe.tf/) -- type: tool, time: 20m
