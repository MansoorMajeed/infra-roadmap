---
id: debugging-ingress
title: Debugging Ingress
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - debugging
  - ingress
  - nginx
  - "404"
  - "502"
  - tls
  - k8s
category: practice
milestones:
  - >-
    Distinguish between a 404 (ingress can't find a matching rule or service)
    and a 502 (found the service but upstream is failing)
  - Use kubectl describe ingress to verify rules, host, and backend service
  - Check ingress controller logs to see what it's actually doing
  - >-
    Confirm the backend Service name and port in the Ingress spec exactly match
    the real Service
---

Ingress failures usually fall into two categories: the ingress controller can't find a rule matching your request (404), or it found the rule and the backend service is rejecting traffic (502/503). Each points to a different place to look.

<!-- DEEP_DIVE -->

## 404 vs 502 — read the error first

**404 Not Found** — the ingress controller received the request but couldn't match it to any rule. Either the hostname doesn't match, the path doesn't match, or the Ingress resource itself isn't being picked up by the controller.

**502 Bad Gateway** — the ingress controller matched the rule and forwarded the request, but the backend pod or service returned an error or didn't respond. The upstream is failing, not the ingress routing.

**503 Service Unavailable** — similar to 502; often means the backend service has no healthy endpoints (no pods behind it).

## Inspect the Ingress resource

```bash
kubectl describe ingress my-ingress
```

Check:
- **Rules** — does the hostname match exactly what you're requesting? `www.example.com` and `example.com` are different.
- **Backend service name and port** — do they match a real Service in the same namespace?
- **TLS** — if you configured TLS, does the secret name exist?

Also check that the Ingress has the right `ingressClassName` or annotation for your controller. A common mistake is applying an Ingress without specifying the class, and the controller ignores it entirely:

```yaml
spec:
  ingressClassName: nginx   # must match your installed controller
```

## Verify the backend Service exists and has endpoints

The Ingress routes to a Service by name. Confirm that Service actually exists and has pods behind it:

```bash
kubectl get service my-service
kubectl get endpoints my-service
```

If `endpoints` shows `<none>`, the Service has no pods — the Ingress will correctly receive the request and correctly return 502/503 because there's nothing to forward it to. Fix the Service first (this is a Services problem, not an Ingress problem).

## Check the ingress controller logs

The ingress controller (nginx, Traefik, etc.) logs what it's doing. Find the controller pod:

```bash
kubectl get pods -n ingress-nginx
```

Then check its logs:

```bash
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

For nginx-ingress, you'll see access logs and error logs. If it's rejecting requests, misconfiguring upstream, or failing TLS negotiation, it's in here.

## TLS issues

If HTTPS isn't working:

```bash
kubectl describe certificate my-tls-cert      # if using cert-manager
kubectl get certificaterequest -n default
```

cert-manager certificate objects go through states: `False` → `True` (issued). If it's stuck in `False`, describe the certificate for the reason. Common causes: wrong DNS name, ACME challenge failing (the domain isn't pointing at your cluster yet), or rate limits from Let's Encrypt.

You can also check whether the TLS secret actually exists:

```bash
kubectl get secret my-tls-secret
```

If the secret doesn't exist, the ingress controller will typically serve a self-signed fallback cert and the browser will show a certificate warning.

## A systematic approach

1. Read the error: 404 (routing problem) or 502/503 (backend problem)?
2. `kubectl describe ingress` — check host, path rules, backend service name and port, ingressClassName
3. `kubectl get endpoints my-service` — does the backend have pods?
4. Check the ingress controller pod logs for errors
5. For TLS: `kubectl describe certificate` or check the TLS secret exists

<!-- RESOURCES -->

- [Kubernetes Docs - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) -- type: docs, time: 20m
- [nginx-ingress Troubleshooting Guide](https://kubernetes.github.io/ingress-nginx/troubleshooting/) -- type: docs, time: 15m
