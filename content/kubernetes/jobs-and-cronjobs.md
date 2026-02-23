---
id: jobs-and-cronjobs
title: Jobs and CronJobs
zone: kubernetes
edges:
  to:
    - id: gitops-with-argocd
      question: >-
        Jobs, CronJobs, Deployments — how do I manage all of this declaratively
        from Git instead of applying manifests manually?
      detail: >-
        I'm still applying all my manifests manually — kubectl apply for my
        Deployment, my Jobs, my CronJobs. As things grow that's not sustainable
        and I keep losing track of what's actually applied. I want the cluster
        to just reflect whatever's in Git, automatically.
difficulty: 1
tags:
  - kubernetes
  - jobs
  - cronjobs
  - batch
  - scheduling
  - migrations
  - k8s
category: concept
milestones:
  - Create a Job that runs a container to completion and verify it succeeded
  - 'Understand Job completion, parallelism, and backoff behaviour on failure'
  - Create a CronJob with a schedule expression and verify it runs on time
  - Run a database migration as a Job before a Deployment update
  - >-
    Explain the difference between a Job (run once) and a CronJob (run on
    schedule)
---

Deployments run workloads indefinitely and restart containers that exit. Jobs run a Pod to completion — once the container exits with code 0, the Job is done. CronJobs run Jobs on a schedule. Together they handle batch processing, database migrations, report generation, and any workload that runs once and stops.

<!-- DEEP_DIVE -->

## Jobs

A Job ensures a specified number of containers run to successful completion. Unlike a Deployment, it doesn't restart a successful container — it marks the Job complete and stops.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  template:
    spec:
      restartPolicy: OnFailure    # or Never — Always is not allowed in Jobs
      containers:
        - name: migrate
          image: my-app:1.5
          command: ["python", "manage.py", "migrate"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
  backoffLimit: 4     # retry up to 4 times before marking the Job failed
```

Note: Pods in a Job must have `restartPolicy: OnFailure` or `restartPolicy: Never`. `Always` is not allowed — that's a Deployment concern.

## Checking Job status

```bash
kubectl get jobs
kubectl describe job db-migrate
kubectl logs job/db-migrate
```

A completed Job keeps its Pod around for log inspection. To clean up automatically after completion:

```yaml
spec:
  ttlSecondsAfterFinished: 300   # delete Job and its Pods 5 minutes after completion
```

## Parallel Jobs

For batch workloads that can be parallelized:

```yaml
spec:
  completions: 10    # run until 10 successful completions
  parallelism: 3     # run up to 3 Pods in parallel
```

Kubernetes runs up to 3 Pods simultaneously until 10 successful completions accumulate. Useful for processing a work queue, resizing images in a batch, or running test suites in parallel.

## CronJobs

A CronJob creates Jobs on a cron schedule:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-report
spec:
  schedule: "0 6 * * *"     # 6am UTC daily
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: report
              image: my-reports:latest
              command: ["python", "generate_report.py"]
  concurrencyPolicy: Forbid          # skip the new run if the previous is still running
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 5
```

Concurrency policies:
- **Allow** — multiple instances can run simultaneously (the default)
- **Forbid** — skip the scheduled run if the previous Job is still running
- **Replace** — terminate the running instance and start a fresh one

## Database migrations as Jobs

The cleanest pattern for database migrations in a Kubernetes workflow:

1. A Job runs the migration (`migrate up`) before the Deployment update
2. The Deployment only starts rolling out once the Job completes successfully

This is tricky to coordinate manually. With ArgoCD, you can use **resource hooks** — a Job annotated with `argocd.argoproj.io/hook: PreSync` runs before any other resources are applied. The sync only proceeds if the hook Job succeeds. Your migration Job and Deployment live in the same GitOps application, and every release automatically runs migrations before the Deployment rolls out.

<!-- RESOURCES -->

- [Kubernetes Docs - Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) -- type: docs, time: 20m
- [Kubernetes Docs - CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) -- type: docs, time: 15m
- [Crontab Guru - Cron Expression Editor](https://crontab.guru/) -- type: tool, time: 5m
- [ArgoCD Resource Hooks](https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/) -- type: docs, time: 20m
