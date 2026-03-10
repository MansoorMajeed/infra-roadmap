---
id: ingress-controllers
title: "Ingress Controllers: What Actually Handles Your Traffic"
zone: kubernetes
edges:
  to:
    - id: load-balancer-integration
      question: >-
        I installed my ingress controller and it created a LoadBalancer Service
        — where did that external IP come from?
      detail: >-
        I set up nginx-ingress and suddenly there's an external IP I never
        created. On my cloud cluster it appeared in seconds. On my local cluster
        it just says 'pending' forever. Something is provisioning real load
        balancers from cloud providers, and I have no idea what that mechanism
        is or how to make it work outside the cloud.
difficulty: 2
tags:
  - kubernetes
  - ingress
  - nginx
  - traefik
  - envoy
  - gateway-api
  - k8s
category: concept
milestones:
  - >-
    Understand that an Ingress resource is just a config object — something
    needs to read it and act on it
  - >-
    Know how controllers work: watch the API server for Ingress resources,
    generate reverse proxy config, reload
  - >-
    Know the main options: nginx-ingress (most common, annotation-driven),
    Traefik (auto-discovery, dashboard), Envoy-based (Contour, Emissary —
    advanced L7 features)
  - >-
    Understand the Gateway API: Kubernetes' successor to Ingress — more
    expressive, role-oriented, not limited to HTTP
  - >-
    Know what IngressClass is and how it lets you run multiple controllers in
    the same cluster
---

An Ingress resource in Kubernetes is just a YAML config — it describes how HTTP traffic should be routed, but it doesn't actually do anything by itself. An ingress controller is the component that reads those Ingress resources and runs the actual reverse proxy. Without a controller installed, your Ingress YAML sits there doing nothing. There are many controllers to choose from, and Kubernetes is gradually replacing the Ingress API with the more powerful Gateway API.

<!-- DEEP_DIVE -->

## How ingress controllers work

An ingress controller follows the same pattern as any Kubernetes controller:

1. **Watch** — it watches the API server for Ingress resources (and related objects like Services, Secrets for TLS certs)
2. **React** — when it detects a new or changed Ingress, it generates the appropriate reverse proxy configuration
3. **Apply** — it configures and reloads the underlying proxy (nginx, envoy, traefik, etc.)

The controller itself runs as pods inside the cluster, usually in its own namespace (`ingress-nginx`, `traefik`, etc.). It's exposed externally via a Service of type LoadBalancer (on cloud) or NodePort (on bare metal).

```
Internet → Cloud LB → Ingress Controller Pod → Service → App Pod
```

## nginx-ingress

The most widely deployed ingress controller. It runs nginx as a reverse proxy and generates nginx configuration from your Ingress resources.

```bash
# Install with Helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx
```

A basic Ingress resource that nginx-ingress handles:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
```

**Good for:** Most use cases. Familiar if you know nginx. Rich annotation-based configuration. Largest community and most Stack Overflow answers.

**Limitations:** Configuration through annotations can get messy. Config changes trigger nginx reloads — nginx handles these gracefully (existing connections drain, new workers pick up new connections), but high-churn environments may see brief latency spikes during reloads.

## Traefik

Traefik auto-discovers services and can configure routing without annotations. It has a built-in dashboard for monitoring.

**Good for:** Smaller setups, teams that want less YAML. The dashboard is useful for seeing what's routed where. Also commonly used in non-Kubernetes environments (Docker, bare metal).

**Limitations:** Less commonly seen in large production Kubernetes deployments compared to nginx-ingress or Envoy-based options.

## Envoy-based controllers

Several controllers use Envoy as the underlying proxy: **Contour** (by VMware/Projectcontour), **Emissary-Ingress** (by Ambassador), and **Gateway API implementations**.

Envoy is a more modern, API-driven proxy compared to nginx. It supports hot reloading without dropping connections, has native gRPC support, and is the same proxy used by service meshes like Istio.

**Good for:** Teams that need advanced L7 features, gRPC routing, or are already using Envoy elsewhere. Large-scale environments where connection-draining during config changes matters.

## IngressClass

A cluster can run multiple ingress controllers simultaneously. IngressClass tells Kubernetes which controller should handle which Ingress resource:

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx
```

Then on your Ingress:

```yaml
spec:
  ingressClassName: nginx
```

This is how you can run nginx-ingress for public traffic and a separate controller for internal traffic in the same cluster.

## The Gateway API

The Ingress API has known limitations: it's HTTP-only, configuration through annotations is vendor-specific and messy, and there's no separation between "cluster admin" and "application developer" concerns.

The Gateway API is Kubernetes' replacement. It splits responsibilities:

- **GatewayClass** — what kind of infrastructure (managed by infra team)
- **Gateway** — a specific listener configuration (managed by cluster admin)
- **HTTPRoute** — how traffic routes to Services (managed by app developers)

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app
spec:
  parentRefs:
    - name: my-gateway
  hostnames:
    - "myapp.example.com"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: my-app
          port: 80
```

The Gateway API also supports TCP, UDP, gRPC, and TLS routing — not just HTTP. Most major ingress controllers now support it alongside the classic Ingress API.

It's not a hard migration — Ingress resources continue to work, and you can adopt Gateway API incrementally. But for new clusters, Gateway API is the recommended approach.

<!-- RESOURCES -->

- [Kubernetes Docs - Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) -- type: docs, time: 15m
- [Gateway API Documentation](https://gateway-api.sigs.k8s.io/) -- type: docs, time: 20m
- [nginx-ingress Documentation](https://kubernetes.github.io/ingress-nginx/) -- type: docs, time: 15m
