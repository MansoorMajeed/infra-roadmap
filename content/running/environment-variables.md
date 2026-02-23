---
id: environment-variables
title: Environment Variables and Config
zone: running
edges:
  to:
    - id: process-management
      question: >-
        My app is configured. How do I keep it running reliably after I close
        SSH?
      detail: >-
        I've been starting my app by running it in an SSH session, and the
        moment I close the terminal it just dies. If the server reboots it's
        gone completely. How do I make it stay running regardless of what
        happens?
difficulty: 1
tags:
  - environment-variables
  - secrets
  - config
  - dotenv
  - 12factor
  - systemd
category: concept
milestones:
  - Store app configuration in environment variables instead of hardcoded values
  - Create a .env file on the server and ensure it is not committed to Git
  - Configure a systemd service to load environment variables from a file
---

Every app needs configuration that varies between environments: your laptop uses a local database, the server uses a real one. Your laptop can have test API keys; the server needs production keys. The wrong approach is to hardcode these values in your code. The right approach is environment variables.

An environment variable is a key-value pair that exists in the process's environment. Your app reads them at runtime. They are not in your code, not in your Git history, and different on every server.

<!-- DEEP_DIVE -->

**Why not hardcode config?**

```python
# BAD — the database password is in your code and will be committed to Git
DATABASE_URL = "postgresql://admin:s3cr3tpassword@localhost/mystore"
STRIPE_SECRET_KEY = "sk_live_abc123..."

# GOOD — read from environment, fail loudly if missing
import os
DATABASE_URL = os.environ["DATABASE_URL"]
STRIPE_SECRET_KEY = os.environ["STRIPE_SECRET_KEY"]
```

Once a secret is in Git history, it is there forever — even if you delete the line later, it is in every commit before that deletion. Anyone with read access to the repo has the secret. Secrets that end up in public repos get scraped by bots within minutes.

**Setting environment variables**

```bash
# Set for the current shell session only (lost when you close the terminal)
export DATABASE_URL="postgresql://deploy:password@localhost/mystore"

# Verify
echo $DATABASE_URL

# Run your app with the variable set
DATABASE_URL="postgresql://..." python3 app.py
```

**The .env file**

For multiple variables, use a `.env` file on the server. This is a plain text file with one `KEY=VALUE` per line:

```bash
# /home/deploy/mystore/.env
DATABASE_URL=postgresql://deploy:password@localhost/mystore
SECRET_KEY=a-very-long-random-string-here-use-openssl-rand-hex-32
STRIPE_SECRET_KEY=sk_live_abc123...
FLASK_ENV=production
DEBUG=false
```

```bash
# Generate a strong random secret key
openssl rand -hex 32
# d8e4f3a1b2c9...

# Lock down permissions — only your user can read it
chmod 600 /home/deploy/mystore/.env

# Make sure it is in .gitignore — never commit this file
echo ".env" >> /home/deploy/mystore/.gitignore
```

To use the `.env` file in your shell session:

```bash
# Source it — loads all variables into the current shell
source /home/deploy/mystore/.env

# Or use dotenv-style loading from your app
# (python-dotenv, dotenv for Node, etc.)
```

**Loading .env in systemd (the right way for production)**

When your app runs as a systemd service, it does not have your shell session's environment. You need to explicitly pass variables:

```ini
# /etc/systemd/system/mystore.service
[Unit]
Description=My Store Application
After=network.target

[Service]
User=deploy
WorkingDirectory=/home/deploy/mystore
EnvironmentFile=/home/deploy/mystore/.env
ExecStart=/home/deploy/mystore/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

The `EnvironmentFile=` directive reads your `.env` file and injects all the variables into the service's environment. Your app sees them as normal environment variables.

```bash
# After editing the service file, reload systemd and restart
sudo systemctl daemon-reload
sudo systemctl restart mystore

# Verify the service sees the variables
sudo systemctl show mystore --property=Environment
```

**Secrets vs. configuration**

Not all config is equally sensitive:

| Type | Example | Sensitivity |
|------|---------|------------|
| Secret | DB password, API key, secret key | High — rotate if exposed |
| Credential | External API URL | Medium — changes per environment |
| Config | Port number, log level | Low — can be in code or env |
| Feature flag | DEBUG=true | Low — often fine in code |

Apply `chmod 600` to your `.env` file so only the file owner can read it. Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault) once your setup grows beyond a single server.

**If you accidentally commit a secret**

1. Assume it is compromised — someone may have already found it
2. Revoke/rotate the secret immediately (change the password, regenerate the API key)
3. Remove it from code and move to env vars
4. Optionally: rewrite Git history to remove it from commits (but assume it is already out there)

The most important step is #2. Removing from Git history is secondary.

<!-- RESOURCES -->

- [The Twelve-Factor App - Config](https://12factor.net/config) -- type: article, time: 10m
- [systemd EnvironmentFile documentation](https://www.freedesktop.org/software/systemd/man/systemd.exec.html#EnvironmentFile=) -- type: reference, time: 10m
- [python-dotenv](https://pypi.org/project/python-dotenv/) -- type: reference, time: 5m
