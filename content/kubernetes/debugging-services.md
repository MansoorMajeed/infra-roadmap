---
id: debugging-services
title: Debugging Services
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - debugging
  - services
  - endpoints
  - selectors
  - dns
  - k8s
category: practice
milestones:
  - >-
    Use kubectl get endpoints to check whether a Service has any pods behind it
  - >-
    Diagnose a selector mismatch — the single most common reason a Service
    routes to nothing
  - Test Service reachability from inside the cluster using kubectl exec + curl
  - Verify DNS resolution with nslookup or dig from inside a pod
---

When a Service isn't routing traffic, the problem is almost always one of two things: the selector doesn't match any pod labels, or there are no healthy pods for it to send traffic to. Kubernetes gives you straightforward tools to confirm which one it is.

<!-- DEEP_DIVE -->

## Check endpoints first

A Service routes to pods by matching their labels. If the labels don't match, the Service has no backends — and you'll get timeouts or connection refused on every request.

Check whether the Service actually has any pods behind it:

```bash
kubectl get endpoints my-service
```

**If the ENDPOINTS column shows `<none>`**, the selector isn't matching any pods. That's your problem.

**If the ENDPOINTS column shows IPs**, the Service found pods — the issue is elsewhere (DNS, wrong port, the pods themselves are unhealthy).

## Diagnose a selector mismatch

A selector mismatch is the #1 Service bug. The Service has a `selector` block; pods have `labels`. They have to match exactly.

Check what the Service is selecting:

```bash
kubectl describe service my-service
```

Look at the `Selector` line:

```
Selector:  app=my-app,tier=frontend
```

Now check what labels your pods actually have:

```bash
kubectl get pods --show-labels
```

Compare the two. If there's any difference — a typo, a missing label, a different value — the Service won't find those pods. Fix the label on the pod (via its Deployment template) or fix the selector on the Service.

## Test reachability from inside the cluster

Services use cluster-internal IPs and DNS. You can't curl them from your laptop — you have to test from inside the cluster. Spin up a temporary debug pod:

```bash
kubectl run debug --image=curlimages/curl --rm -it --restart=Never -- /bin/sh
```

From inside, curl the Service by its DNS name:

```bash
# By short name (works within same namespace)
curl http://my-service:8080

# By fully qualified name
curl http://my-service.default.svc.cluster.local:8080
```

If the DNS name resolves but the connection is refused, the pods themselves are rejecting the connection (wrong port, app not listening). If DNS doesn't resolve, there may be a CoreDNS issue.

## Check DNS resolution

From inside any pod or the debug container above:

```bash
nslookup my-service
```

You should see it resolve to the Service's ClusterIP. If it doesn't resolve at all, CoreDNS may be having problems — check it with:

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns
```

## Check the port

A common mistake: the Service `port` (what you call from outside) and `targetPort` (what the container actually listens on) are wrong.

```yaml
spec:
  ports:
    - port: 80          # what you curl
      targetPort: 8080  # what the container listens on
```

If you curl `:80` and the container listens on `:8080` but `targetPort` is set to `80`, you'll get connection refused. Check with `kubectl describe service` and confirm `targetPort` matches the actual container port.

## A systematic approach

1. `kubectl get endpoints my-service` — does it have any pod IPs?
2. If empty: `kubectl describe service my-service` vs `kubectl get pods --show-labels` — find the selector mismatch
3. If populated: test from inside the cluster with curl
4. If DNS fails: check CoreDNS pods in kube-system
5. If connection refused: verify `targetPort` matches the container's listening port

<!-- RESOURCES -->

- [Kubernetes Docs - Debug Services](https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/) -- type: docs, time: 20m
