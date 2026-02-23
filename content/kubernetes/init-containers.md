---
id: init-containers
title: Init Containers
zone: kubernetes
edges:
  to: []
difficulty: 2
tags:
  - kubernetes
  - init-containers
  - pods
  - k8s
  - startup
category: concept
milestones:
  - >-
    Understand what init containers are: containers that run to completion
    before any main container in the Pod starts
  - >-
    Know that multiple init containers run sequentially — each must succeed
    before the next starts; if one fails, Kubernetes restarts it
  - Write an init container that waits for a dependency to become available
  - >-
    Know what init containers can do that main containers can't: run as a
    different image, have different permissions, access secrets the app
    container doesn't need
  - >-
    Understand when NOT to use init containers for dependency waiting — health
    checks and readiness probes are usually the better answer
---

Init containers are containers that run inside a Pod before the main application container starts. They run sequentially, each must exit with success before the next begins, and the Pod's main containers don't start until all init containers have completed.

<!-- DEEP_DIVE -->

## Why init containers exist

Sometimes a container needs something to be true before it can start usefully:

- A config file fetched from a remote source
- Directory permissions set correctly
- A database migration applied
- A dependency service that needs to be reachable

You could put all of this logic inside your application container, but that mixes setup concerns with application code, requires your app image to contain tools it shouldn't need at runtime, and makes the startup logic harder to test independently.

Init containers let you separate that pre-start work into dedicated containers with their own images and permissions.

## Writing an init container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  initContainers:
    - name: wait-for-db
      image: busybox:1.35
      command:
        - sh
        - -c
        - |
          until nc -z postgres-service 5432; do
            echo "waiting for postgres..."
            sleep 2
          done
    - name: run-migrations
      image: my-app:1.2.3
      command: ["./migrate", "--up"]
      env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
  containers:
    - name: app
      image: my-app:1.2.3
      ports:
        - containerPort: 8080
```

The two init containers run in order: `wait-for-db` runs until it exits 0, then `run-migrations` runs until it exits 0, then the main `app` container starts.

## Key differences from regular containers

**Init containers run to completion.** They're not long-running processes — they do their job and exit. A non-zero exit code is treated as failure, and Kubernetes will restart the init container according to the Pod's `restartPolicy`.

**They run sequentially.** Unlike main containers (which all start in parallel), init containers run one after another. Order matters and is guaranteed.

**They can use a different image.** The `wait-for-db` container above uses `busybox` — a tiny image with basic Unix tools — while the main app uses `my-app`. You don't need to bundle `nc` or `curl` into your production image just for startup checks.

**They can have different permissions.** An init container can run as root to set up file permissions, while the main container runs as a non-root user.

**They can access secrets the main container doesn't need.** A init container that fetches a bootstrap token from Vault doesn't need to share that secret with the running application.

## The dependency-waiting pattern

Waiting for a service to be ready is the most common init container use case:

```yaml
initContainers:
  - name: wait-for-redis
    image: busybox:1.35
    command:
      - sh
      - -c
      - until nc -z redis-service 6379; do sleep 1; done
```

This loops until `redis-service:6379` accepts a TCP connection. The main container won't start until Redis is reachable.

## When init containers aren't the right answer

If your app crashes because a dependency isn't ready, the instinct is to add a wait loop in an init container. But Kubernetes already has a mechanism for this: readiness probes and the Pod restart policy.

If your app fails to start, Kubernetes will restart it with exponential backoff (CrashLoopBackOff). For many services, building retry logic into the app itself — or just letting Kubernetes restart it — is simpler than adding an init container. The restart backoff eventually gives dependencies time to come up.

Use init containers when:
- You need to run a different image (tool that isn't in your app image)
- You need elevated permissions briefly that you don't want in the running app
- The setup step is a one-time task with a clear success/failure (migrations, cert fetching)

Prefer readiness probes and app-level retries when:
- You're just waiting for a service to be ready
- The dependency might go away temporarily during the app's lifetime (in which case you need runtime retry logic anyway)

<!-- RESOURCES -->

- [Kubernetes Docs - Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) -- type: docs, time: 15m
- [Kubernetes Docs - Configure Pod Initialization](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-initialization/) -- type: tutorial, time: 15m
