---
id: pipeline-secrets
title: Secrets in CI/CD Pipelines
zone: delivery
edges:
  to:
    - id: build-and-test-pipeline
      question: Secrets are handled. Now how do I structure the full pipeline?
      detail: >-
        I have the credentials in the right place, but my pipeline still only
        runs tests. I want the whole thing — test, build the image, push it, and
        actually deploy — all in one automated flow.
difficulty: 2
tags:
  - secrets
  - security
  - ci-cd
  - environment-variables
  - github-secrets
  - vault
category: practice
milestones:
  - Store a secret in GitHub Actions secrets and reference it in a workflow
  - Understand why secrets should never appear in logs or YAML files
  - Know the difference between repository secrets and environment secrets
---

Your pipeline needs to SSH into servers, push Docker images to a registry, or call external APIs. All of those require credentials. Those credentials must never appear in your YAML files or commit history.

GitHub Actions has a built-in encrypted secret store. Secrets are injected as environment variables at runtime — your pipeline code can use them, but they're never written to disk or printed in logs.

<!-- DEEP_DIVE -->

## Why not just put them in the YAML?

Git is permanent. If you commit a secret — even for one minute, even in a private repo — it's in the history. Tools like `git log`, `git reflog`, and automated secret scanners will find it. Rotating the secret and scrubbing the history is painful. Avoiding the problem is not.

The rule: **credentials never touch your repository.** Not in YAML, not in `.env` files, not in comments.

## GitHub Actions secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Give it a name (by convention, `UPPER_SNAKE_CASE`) and a value. GitHub encrypts it. You can't read the value back — only update or delete it.

Reference it in your workflow with `${{ secrets.YOUR_SECRET_NAME }}`:

```yaml
- name: Deploy to server
  env:
    DEPLOY_KEY: ${{ secrets.DEPLOY_SSH_KEY }}
  run: |
    echo "$DEPLOY_KEY" > /tmp/deploy_key
    chmod 600 /tmp/deploy_key
    ssh -i /tmp/deploy_key user@yourserver.com "cd /app && ./deploy.sh"
```

GitHub automatically masks the secret value in logs. If it appears in output, it shows as `***`.

## Repository vs environment secrets

**Repository secrets** are available to all workflows in the repo. Use these for things like registry credentials that every pipeline needs.

**Environment secrets** are scoped to a named environment (e.g. `staging`, `production`). A job must declare `environment: production` to access them. This lets you require approval before a job can access production credentials:

```yaml
jobs:
  deploy-production:
    environment: production    # can require manual approval in settings
    steps:
      - run: deploy.sh
        env:
          API_KEY: ${{ secrets.PROD_API_KEY }}
```

For anything touching production, environment secrets with required reviewers are worth the extra setup.

## Organization secrets

If you manage multiple repos, organization secrets let you share credentials across all repos (or a subset) without duplicating them. Set them at the organization level under Settings → Secrets.

## What gets masked, what doesn't

GitHub masks the exact secret value if it appears in logs. It doesn't mask derived values — if your secret is `abc123` and your script prints `MY_TOKEN=abc123`, it will be masked. But if the script encodes it to base64 and prints that, it won't be.

Don't print secrets in logs. Add `set +x` before any command that uses a secret if you're running `set -x` for debugging.

## SSH key pattern

For SSH-based deploys, the common pattern:

1. Generate a dedicated key pair for CI: `ssh-keygen -t ed25519 -C "ci-deploy" -f deploy_key`
2. Add the **public key** to `~/.ssh/authorized_keys` on your server
3. Store the **private key** as a GitHub Actions secret
4. In the workflow, write it to a temp file and use it for SSH

Never reuse your personal SSH key for CI. A dedicated key can be rotated or revoked without disrupting your own access.

<!-- RESOURCES -->

- [GitHub Actions: Using Secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) -- type: reference, time: 10min
- [GitHub Actions: Using Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) -- type: reference, time: 10min
