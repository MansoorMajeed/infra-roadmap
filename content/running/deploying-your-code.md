---
id: deploying-your-code
title: Getting Your Code to the Server
zone: running
edges:
  to:
    - id: web-servers
      question: My code is on the server. What software actually serves it to users?
      detail: >-
        My app is running on port 5000 and I have to include the port in every
        URL. Real sites don't work like that — something must be handling HTTP
        on port 80 and forwarding requests to my app. What is that?
    - id: environment-variables
      question: >-
        My code is on the server. How do I configure it without hardcoding
        secrets?
      detail: >-
        My database password and API keys are hardcoded right now. If anyone
        gets access to the repo they'd have everything. How do I get those
        credentials out of the code entirely?
difficulty: 1
tags:
  - deploy
  - git-clone
  - scp
  - rsync
  - environment-variables
  - secrets
category: practice
milestones:
  - Get your application code onto a server using git clone
  - Set up a Python virtual environment and install dependencies on the server
  - >-
    Configure environment variables and understand why secrets should not be in
    code
---

You have a server. You can SSH in. You can install packages and manage services. But your application code is still on your laptop. How do you get it onto the server?

This is the most basic form of deployment — manually getting your code from where you wrote it to where it runs. It is not glamorous, and you will eventually automate it, but understanding the manual process is essential.

<!-- DEEP_DIVE -->

**Option 1: `git clone` — the most common approach**

Your code is already in a Git repository on GitHub (or GitLab, or Bitbucket). The server has `git` installed. So the simplest way to get your code onto the server is to clone it:

```bash
# SSH into your server
ssh deploy@143.198.100.50

# Clone your repository
cd /home/deploy
git clone https://github.com/yourname/mystore.git

# Your code is now on the server
ls mystore/
# app.py  requirements.txt  static/  templates/  ...
```

This is by far the most common method. Your Git repo is the source of truth, and the server pulls from it. When you push new code to GitHub, you SSH in and pull the latest:

```bash
cd /home/deploy/mystore
git pull origin main
```

If your repo is private, you will need to set up authentication. The cleanest way is a **deploy key** — an SSH key that only has read access to that one repository:

```bash
# On the server, generate a deploy key
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""

# Add the public key to your GitHub repo:
# Settings → Deploy keys → Add deploy key
cat ~/.ssh/deploy_key.pub

# Configure git to use this key
echo 'Host github.com
  IdentityFile ~/.ssh/deploy_key' >> ~/.ssh/config
```

**Option 2: `scp` and `rsync` — copy files directly**

Sometimes you want to copy files straight from your laptop to the server without going through GitHub. `scp` (secure copy) works like `cp` but over SSH:

```bash
# From your laptop — copy a single file
scp app.py deploy@143.198.100.50:/home/deploy/mystore/

# Copy an entire directory
scp -r mystore/ deploy@143.198.100.50:/home/deploy/

# rsync is smarter — only copies changed files
rsync -avz mystore/ deploy@143.198.100.50:/home/deploy/mystore/
```

`rsync` is better than `scp` for repeated deployments because it only transfers files that have changed. It also handles permissions and can delete files on the server that you deleted locally.

**Setting up the project on the server**

Getting the code there is step one. Now you need to install dependencies and configure the environment. For a Python app:

```bash
# Create a virtual environment
cd /home/deploy/mystore
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Test that it runs
python app.py
# * Running on http://127.0.0.1:5000
```

**Environment variables and secrets**

Your app probably needs configuration that varies between your laptop and the server — database URLs, API keys, secret keys. **Never put these in your code or commit them to Git.**

```bash
# BAD — hardcoded secrets in code
# app.py
DATABASE_URL = "postgresql://admin:s3cret@localhost/mystore"  # DO NOT DO THIS

# GOOD — read from environment variables
# app.py
import os
DATABASE_URL = os.environ["DATABASE_URL"]
SECRET_KEY = os.environ["SECRET_KEY"]
```

On the server, set environment variables in a `.env` file that is NOT in your Git repo:

```bash
# Create .env on the server (not in git)
cat > /home/deploy/mystore/.env << 'EOF'
DATABASE_URL=postgresql://deploy:password@localhost/mystore
SECRET_KEY=a-long-random-string-here
FLASK_ENV=production
EOF

# Make sure .env is in .gitignore
echo ".env" >> .gitignore

# Lock down permissions — only the owner can read it
chmod 600 /home/deploy/mystore/.env
```

For systemd services, you can pass environment variables in the service file:

```ini
[Service]
EnvironmentFile=/home/deploy/mystore/.env
ExecStart=/home/deploy/mystore/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

**The manual deploy workflow**

Putting it all together, here is what a manual deployment looks like:

```bash
# 1. SSH into the server
ssh deploy@143.198.100.50

# 2. Go to the project directory
cd /home/deploy/mystore

# 3. Pull the latest code
git pull origin main

# 4. Install any new dependencies
source venv/bin/activate
pip install -r requirements.txt

# 5. Restart the application
sudo systemctl restart mystore

# 6. Check that it is running
sudo systemctl status mystore
sudo journalctl -u mystore --since "1 minute ago"
```

Six steps, every single time you make a change. Push to GitHub, SSH in, pull, install, restart, verify. Miss a step and something breaks. Do it at 2 AM when you are tired and you might forget to activate the virtualenv or skip the dependency install.

This is tedious and error-prone. You will eventually automate it with CI/CD pipelines that run these steps automatically when you push code. But right now, understanding the manual process means you understand what automation is actually automating.

**Common mistakes:**

- **Forgetting to install new dependencies** — you added a package to `requirements.txt` but forgot to `pip install` on the server
- **Running as root** — always deploy as a non-root user. Root access should be for system administration only
- **Committing secrets** — once a password is in Git history, it is there forever. Rotate any secret that was ever committed
- **Not restarting the service** — your code changed but the running process is still using the old code. You must restart
- **Editing code directly on the server** — now your server has changes that are not in Git. This always ends badly

<!-- RESOURCES -->

- [DigitalOcean - How to Deploy a Flask App](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-22-04) -- type: tutorial, time: 30m
- [GitHub - Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) -- type: reference, time: 10m
- [The Twelve-Factor App - Config](https://12factor.net/config) -- type: article, time: 10m
- [rsync Tutorial](https://www.digitalocean.com/community/tutorials/how-to-use-rsync-to-sync-local-and-remote-directories) -- type: tutorial, time: 15m
