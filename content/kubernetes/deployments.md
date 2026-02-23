---
id: "deployments"
title: "Deployments"
zone: "kubernetes"
edges:
  from:
    - id: "autoscaling"
      question: "HPA manages replica count. What manages what those replicas actually run — and how do I update them?"
      detail: "The HPA adjusts scale. The Deployment is the resource that owns the Pods: it defines the container image, resource limits, environment, and the strategy for rolling out changes. When you ship a new version, you update the Deployment — Kubernetes handles the rest."
  to:
    - id: "gitops-with-argocd"
      question: "I understand Deployments. How do I make updates happen automatically when I push code, instead of running kubectl manually?"
      detail: "I'm running kubectl set image by hand every time I want to deploy. That means I could forget, make a typo, deploy the wrong thing, and there's no record of what changed or when. I need this to happen automatically — something should watch my repo and deploy when I merge."
    - id: "deployment-strategies"
      question: "Rolling updates are the default. What other strategies exist for zero-downtime deployments?"
      detail: "Rolling update works — but it just swaps everything out gradually, and if something is wrong I don't find out until users are hitting the broken pods. Is there a way to test a new version with a small slice of real traffic before rolling it out to everyone?"
    - id: "jobs-and-cronjobs"
      question: "Deployments keep services running forever. What about tasks that just need to run once and finish?"
      detail: "My app is a long-running service — it just keeps going. But I also need to run database migrations, generate reports, process a queue of uploads. These aren't services, they have a start and an end. How does Kubernetes handle tasks that are supposed to finish?"
difficulty: 2
tags: ["kubernetes", "deployments", "rolling-update", "replicaset", "kubectl", "k8s", "zero-downtime"]
category: "practice"
milestones:
  - "Create a Deployment and understand its relationship to ReplicaSets and Pods"
  - "Update the container image and watch the rolling update proceed"
  - "Roll back to a previous version with kubectl rollout undo"
  - "Set resource requests and limits on the Deployment's Pod template"
  - "Explain what happens to running traffic during a rolling update"
---

A Deployment is the standard way to run a long-lived application on Kubernetes. It manages a ReplicaSet (which manages Pods), declares the desired state — image, replicas, resources — and handles rolling updates and rollbacks automatically when you change the spec.

<!-- DEEP_DIVE -->

## Deployments, ReplicaSets, and Pods

Kubernetes has three layers here:

- **Pod** — runs your containers on a single node
- **ReplicaSet** — ensures N copies of a Pod spec are running at all times; replaces Pods that fail or get deleted
- **Deployment** — manages the ReplicaSet and handles transitions between versions

You almost never create ReplicaSets directly. You create Deployments, and the Deployment controller creates and manages ReplicaSets for you. Each time you update a Deployment's Pod template (new image, new env var, new resource limits), a new ReplicaSet is created and the old one is scaled down gradually.

## Writing a Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: my-app:1.2.3
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
```

## Rolling updates

When you change `spec.template` — typically by updating the container image — Kubernetes performs a rolling update:

1. Creates a new ReplicaSet with the new Pod template
2. Scales up the new ReplicaSet one Pod at a time
3. As new Pods pass their readiness probe, scales down the old ReplicaSet by one
4. Repeats until all Pods are on the new version

The rolling update is controlled by two fields in `spec.strategy.rollingUpdate`:

- `maxSurge` — how many extra Pods can exist above the desired count during the update (default: 25%)
- `maxUnavailable` — how many Pods can be below the desired count during the update (default: 25%)

With `replicas: 4`, `maxSurge: 1`, `maxUnavailable: 0`: Kubernetes creates one new Pod, waits for it to pass readiness, then terminates one old Pod, repeating until done. Zero Pods are ever removed before a replacement is ready — true zero-downtime deployment.

## Checking rollout status

```bash
kubectl rollout status deployment/my-app
```

This blocks until the rollout completes. If the new Pods fail their readiness probe, the rollout pauses here — you won't accidentally mark a broken deployment as done.

## Rolling back

If something goes wrong:

```bash
kubectl rollout undo deployment/my-app
```

This scales up the previous ReplicaSet and scales down the current one. Kubernetes keeps a configurable history of old ReplicaSets (default: 10), so you can roll back multiple versions:

```bash
kubectl rollout history deployment/my-app
kubectl rollout undo deployment/my-app --to-revision=3
```

## Updating the image imperatively

```bash
kubectl set image deployment/my-app app=my-app:1.3.0
```

This works in a pinch, but it's not tracked in Git, it's not reproducible, and it bypasses any review process. In practice, update the Deployment manifest and apply it through GitOps — that way the change has an audit trail and can be reverted with `git revert`.

<!-- RESOURCES -->

- [Kubernetes Docs - Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) -- type: docs, time: 30m
- [kubectl rollout command reference](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_rollout/) -- type: docs, time: 10m
- [Kubernetes Deployment Strategies - Container Solutions](https://blog.container-solutions.com/kubernetes-deployment-strategies) -- type: article, time: 10m
