---
id: "configmaps"
title: "ConfigMaps"
zone: "kubernetes"
edges:
  from:
    - id: "persistent-volume-claims"
      question: "Storage is sorted. My app needs configuration — URLs, feature flags, environment-specific settings. Where do those go?"
      detail: "Baking config into your container image means one image per environment and a rebuild for every config change. ConfigMaps store configuration as key-value pairs in Kubernetes, injected into Pods at runtime as environment variables or mounted config files."
  to:
    - id: "secrets"
      question: "ConfigMaps work for non-sensitive config. What about passwords, API keys, and certificates?"
      detail: "I've put my database URL and feature flags in a ConfigMap, but now I need to add a database password and an API key. Those feel very different — I shouldn't just dump them in the same place as regular config. How does Kubernetes handle sensitive values?"
difficulty: 1
tags: ["kubernetes", "configmap", "configuration", "environment-variables", "k8s"]
category: "practice"
milestones:
  - "Create a ConfigMap and inject it as environment variables into a Pod"
  - "Mount a ConfigMap as a config file inside a Pod"
  - "Update a ConfigMap and understand when the change propagates to running Pods"
  - "Explain why ConfigMaps are not appropriate for sensitive data"
---

ConfigMaps store non-sensitive configuration data in Kubernetes — database URLs, feature flags, environment-specific settings. They decouple configuration from your container image, so you can change config without rebuilding, and run the same image in dev and production with different settings.

<!-- DEEP_DIVE -->

## The problem: config baked into images

The naive approach is to hardcode config into the container image. This breaks down immediately in practice:

- Different environments (dev, staging, prod) need different values
- Every config change requires a new image build, push, and deployment
- Config and code go through the same slow release cycle even when only config changed

The Kubernetes answer: externalize config into ConfigMaps and inject them at Pod start time.

## Creating a ConfigMap

From YAML (the preferred, declarative way):

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  DATABASE_HOST: "postgres.default.svc.cluster.local"
  DATABASE_PORT: "5432"
  LOG_LEVEL: "info"
  FEATURE_NEW_UI: "true"
```

Or imperatively:

```bash
kubectl create configmap app-config \
  --from-literal=DATABASE_HOST=postgres.default.svc.cluster.local \
  --from-literal=LOG_LEVEL=info
```

Or from a file:

```bash
kubectl create configmap nginx-config --from-file=nginx.conf
```

## Injecting as environment variables

The most common pattern — all keys in the ConfigMap become environment variables in the container:

```yaml
spec:
  containers:
    - name: app
      image: my-app:1.0
      envFrom:
        - configMapRef:
            name: app-config
```

Or selectively, picking specific keys:

```yaml
env:
  - name: DB_HOST
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: DATABASE_HOST
```

## Mounting as files

For config in file format (nginx.conf, application.yaml, etc.), mount the ConfigMap as a volume:

```yaml
spec:
  containers:
    - name: app
      volumeMounts:
        - name: config
          mountPath: /etc/app/config.yaml
          subPath: config.yaml    # mount a single key as a named file
  volumes:
    - name: config
      configMap:
        name: app-config
```

The `subPath` field mounts a single key as a file, rather than creating a directory containing every key as a separate file.

## When changes propagate

- **Environment variables** — do not update in running containers. The Pod must be restarted to pick up changes (update the ConfigMap, then trigger a rolling restart: `kubectl rollout restart deployment/my-app`).
- **Mounted files** — update automatically in running Pods, typically within a minute. The kubelet watches for ConfigMap changes and updates the mounted files. Whether your app notices depends on whether it re-reads the file at runtime or only reads it on startup.

## ConfigMaps are not for secrets

ConfigMaps are stored in etcd in plain text and are readable by anyone with access to the namespace. Don't put passwords, API keys, TLS certificates, or any sensitive data in a ConfigMap — use Secrets for those.

<!-- RESOURCES -->

- [Kubernetes Docs - ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) -- type: docs, time: 20m
- [Kubernetes Docs - Configure a Pod to Use a ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/) -- type: tutorial, time: 20m
