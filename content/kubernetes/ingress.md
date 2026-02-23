---
id: ingress
title: Ingress
zone: kubernetes
edges:
  to:
    - id: persistent-volumes
      question: >-
        Networking is sorted — my app is reachable from the outside world. What
        about storage? My app needs to write files that survive Pod restarts.
      detail: >-
        My app is reachable from the internet now. But my app also writes files
        — user uploads, generated reports. When a pod restarts, those files are
        gone. A pod's filesystem is ephemeral, which means I can't just write to
        disk the way I would on a regular server. How does Kubernetes handle
        data that needs to survive?
difficulty: 2
tags:
  - kubernetes
  - ingress
  - ingress-controller
  - nginx
  - traefik
  - http-routing
  - tls
  - k8s
category: practice
milestones:
  - Install an Ingress controller (nginx-ingress or Traefik)
  - >-
    Write an Ingress resource that routes two hostnames to two different
    Services
  - Configure TLS termination using a certificate (cert-manager + Let's Encrypt)
  - >-
    Explain the difference between the Ingress resource and the Ingress
    controller
---

Ingress is a Kubernetes resource that describes HTTP routing rules — which hostname or path goes to which Service. An Ingress controller reads those rules and actually routes the traffic. One controller can front many Services, replacing the need for a separate cloud load balancer per Service.

<!-- DEEP_DIVE -->

## The Ingress resource vs the Ingress controller

This is the most confusing thing about Ingress: there are two separate pieces that must work together.

**Ingress resource** — a Kubernetes API object you create. It's just data: "route `api.example.com` to the `api` Service on port 80, route `app.example.com` to the `frontend` Service on port 80."

**Ingress controller** — a separate piece of software running in your cluster that watches Ingress resources and actually configures itself to route traffic. It is not installed by default — you have to install one.

Popular choices:
- **ingress-nginx** — the most widely used, based on nginx
- **Traefik** — popular in smaller deployments, has built-in Let's Encrypt support
- **AWS Load Balancer Controller** — native integration with AWS ALB
- **GKE Ingress** — GKE's default, integrates with Google Cloud Load Balancing

## Writing an Ingress resource

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  namespace: default
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
        - app.example.com
      secretName: my-app-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

## TLS termination with cert-manager

Manually managing TLS certificates at scale is painful. **cert-manager** is a Kubernetes controller that automates certificate issuance and renewal — typically from Let's Encrypt.

The setup:
1. Install cert-manager in your cluster
2. Create a `ClusterIssuer` resource configured with your Let's Encrypt account and ACME solver settings
3. Add the `cert-manager.io/cluster-issuer` annotation to your Ingress resources

cert-manager watches for Ingress resources with that annotation, requests a certificate from Let's Encrypt using an HTTP or DNS challenge, stores it as a Kubernetes Secret, and renews it automatically before expiry. Your Ingress controller reads the Secret and terminates TLS at the edge.

## Host-based vs path-based routing

Ingress supports both patterns:

- **Host-based**: `api.example.com` → api Service, `app.example.com` → frontend Service
- **Path-based**: `example.com/api` → api Service, `example.com/` → frontend Service

Host-based routing is cleaner and avoids problems with apps that have different base paths baked in. Path-based works, but you need to be careful about how your backend apps handle the path prefix.

## IngressClass

Modern Kubernetes uses `IngressClass` to tell an Ingress resource which controller should handle it. If you have multiple controllers installed (nginx for most traffic, ALB controller for a specific workload), `ingressClassName` in the spec specifies which controller picks up each Ingress resource. Without it, the behavior depends on which controller is set as the default.

<!-- RESOURCES -->

- [Kubernetes Docs - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) -- type: docs, time: 25m
- [ingress-nginx controller](https://kubernetes.github.io/ingress-nginx/) -- type: tool, time: 20m
- [cert-manager Documentation](https://cert-manager.io/docs/) -- type: docs, time: 30m
- [Traefik Kubernetes Ingress](https://doc.traefik.io/traefik/providers/kubernetes-ingress/) -- type: docs, time: 20m
