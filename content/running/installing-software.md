---
id: installing-software
title: Installing Software on Linux
zone: running
edges:
  to:
    - id: ports-and-listening
      question: >-
        I have my runtime installed and my app running. How does traffic
        actually reach it?
      detail: >-
        My app is running, but when I try to access it from another machine
        nothing comes through. I don't really understand what a port is or how
        traffic is supposed to get from the internet to the process running on
        my server.
difficulty: 1
tags:
  - apt
  - package-manager
  - ubuntu
  - nodejs
  - python
  - runtime
  - dependencies
category: practice
milestones:
  - >-
    Install a package using apt and understand the difference between apt update
    and apt install
  - >-
    Install Node.js or Python on a fresh Ubuntu server using the correct method
    for your runtime
  - >-
    Understand why some software needs a third-party repository instead of the
    default Ubuntu repos
---

Linux distributions ship with a package manager — a tool for finding, downloading, installing, and updating software. On Ubuntu (and Debian), that is `apt`. It is the primary way you install everything on a server: your app's runtime, web server, database, monitoring tools, everything.

Unlike your laptop where you download a `.dmg` or `.exe` and double-click it, on a server you install software from the terminal, and the package manager handles downloading the right version, checking dependencies, and putting files in the right places.

<!-- DEEP_DIVE -->

**The basics: `apt update` and `apt install`**

`apt` installs from a list of package repositories. The first step is always to update that list so you know what is available:

```bash
# Update the local list of available packages (does NOT upgrade anything)
sudo apt update

# Install a package
sudo apt install nginx

# Install multiple packages at once
sudo apt install nginx git curl htop unzip

# Remove a package
sudo apt remove nginx

# Remove a package AND its config files
sudo apt purge nginx

# Search for a package by name
apt search nodejs
```

Always run `apt update` before installing. If you skip it, you may install an outdated version that has known bugs or security issues.

**Installing Python**

Ubuntu 22.04 ships with Python 3. But you usually need a few extras:

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Verify
python3 --version    # Python 3.10.x
pip3 --version
```

For a Python web app, you will also want to use a virtual environment to isolate dependencies:

```bash
# Create a virtualenv for your project
cd /home/deploy/myapp
python3 -m venv venv

# Activate it
source venv/bin/activate

# Now pip installs go into venv/, not system-wide
pip install flask gunicorn

# Deactivate when done
deactivate
```

**Installing Node.js**

The Node.js version in Ubuntu's default repositories is often outdated. Use NodeSource to get a current LTS version:

```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version    # v20.x.x
npm --version
```

**Why you sometimes need a third-party repository**

Ubuntu's default package repositories prioritize stability over recency. The Node.js version in the default repos might be years old. Third-party repositories (like NodeSource for Node, or postgresql.org for Postgres) provide newer versions.

When you add a third-party repo, you are trusting that source. Stick to official sources from the software vendor, not random PPAs.

```bash
# Example: what adding a repo looks like under the hood
# The curl | bash command above essentially does this:
# 1. Downloads a script that adds the repo to /etc/apt/sources.list.d/
# 2. Imports the repo's GPG key so apt can verify packages
# 3. Runs apt update
# 4. Now apt install nodejs gets the NodeSource version
```

**Useful packages to always have on a server**

```bash
sudo apt install -y \
    git \          # You'll need this to clone your app
    curl \         # Useful for testing HTTP endpoints locally
    htop \         # Better process viewer than top
    unzip \        # For unpacking archives
    ufw \          # Firewall (may already be installed)
    fail2ban       # Bans IPs with too many failed SSH attempts
```

**Keeping software updated**

```bash
# Update the package list and upgrade all installed packages
sudo apt update && sudo apt upgrade

# Unattended security updates (Ubuntu default — verify it's running)
sudo systemctl status unattended-upgrades
```

Security patches are released constantly. An unpatched server is a liability. Set up unattended security updates and occasionally run a full `apt upgrade` for non-security updates.

**Where apt installs things**

Understanding where files land helps you debug and configure software:

| Path | What goes there |
|------|----------------|
| `/usr/bin/` | Executables (nginx, python3, node) |
| `/etc/nginx/` | Configuration files |
| `/var/log/nginx/` | Log files |
| `/lib/systemd/system/` | systemd service files |
| `/var/lib/` | Application data (database files, etc.) |

<!-- RESOURCES -->

- [Ubuntu apt documentation](https://ubuntu.com/server/docs/package-management) -- type: reference, time: 15m
- [NodeSource - Node.js Installation](https://github.com/nodesource/distributions) -- type: reference, time: 10m
- [Python venv documentation](https://docs.python.org/3/library/venv.html) -- type: reference, time: 10m
