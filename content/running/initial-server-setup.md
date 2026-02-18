---
id: "initial-server-setup"
title: "Setting Up a Fresh Server"
zone: "running"
edges:
  from:
    - id: "ssh"
      question: "I can SSH into my server. What should I do before anything else?"
      detail: "You just got root access to a fresh server. Before you install anything or deploy any code, there are a handful of things you should always do: create a non-root user, set up SSH key authentication, and lock down the SSH configuration. Skipping this is how servers get compromised."
  to:
    - id: "installing-software"
      question: "My server is secured. How do I install the software my app needs?"
      detail: "You have a properly secured server with a non-root user and SSH key authentication. Now you need to install your application's runtime — Node.js, Python, or whatever your app is written in. This means using the package manager to install software on Linux."
difficulty: 1
tags: ["security", "hardening", "sudo", "non-root", "ufw", "ssh-config", "users"]
category: "practice"
milestones:
  - "Create a non-root user with sudo access on a fresh Ubuntu server"
  - "Copy SSH keys to the new user and verify login works before disabling root"
  - "Disable root login and password authentication in sshd_config"
---

A fresh VPS comes with a root user and password authentication enabled. This is a reasonable starting point for a provider to give you access, but it is not safe to leave it this way. Root is the superuser — one bad command and you can wipe the entire server. Password authentication means bots are actively trying to brute-force your login right now (check `/var/log/auth.log` — you will see hundreds of failed attempts within hours of creating a new server).

Before you install anything or touch your application code, run through this checklist on every new server.

<!-- DEEP_DIVE -->

**Step 1: Create a non-root user**

Never do day-to-day work as root. Create a regular user and give it `sudo` access for when you genuinely need elevated privileges:

```bash
# SSH in as root first
ssh root@YOUR_SERVER_IP

# Create a new user (replace 'deploy' with your preferred username)
adduser deploy
# You'll be prompted for a password — set one, even if you plan to use keys only

# Add the user to the sudo group
usermod -aG sudo deploy

# Verify
groups deploy
# deploy : deploy sudo
```

**Step 2: Set up SSH keys for the new user**

Copy your public key to the new user's account so you can SSH in as them:

```bash
# Still on the server as root — copy root's authorized_keys to the new user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Or from your laptop, using `ssh-copy-id`:

```bash
# From your laptop
ssh-copy-id deploy@YOUR_SERVER_IP
```

**Step 3: Test the new user BEFORE locking yourself out**

This is critical. Open a new terminal and verify you can log in as the new user before you disable root login:

```bash
# In a NEW terminal window — do NOT close your root session yet
ssh deploy@YOUR_SERVER_IP

# Test sudo
sudo whoami
# Should print: root
```

If this works, you are safe to proceed. If it does not work, fix it while you still have the root session open.

**Step 4: Harden SSH configuration**

```bash
# Edit the SSH server config
sudo nano /etc/ssh/sshd_config

# Find and change these lines:
PermitRootLogin no          # Disallow root login entirely
PasswordAuthentication no   # Require SSH keys, disallow passwords
PubkeyAuthentication yes    # Make sure key auth is explicitly enabled

# Save the file, then restart SSH
sudo systemctl restart sshd
```

After restarting, test in a new terminal that you can still connect as your deploy user. If something went wrong, your existing session is still open and you can fix it.

**Step 5: Update the system**

```bash
sudo apt update
sudo apt upgrade -y

# Optionally, install useful baseline tools
sudo apt install -y htop curl wget git unzip
```

**Step 6: Set up a basic firewall**

Even before you know which ports your app will use, configure a default-deny firewall and open only SSH:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw enable

# Verify
sudo ufw status
```

You will open ports 80 and 443 later when you set up your web server. The firewall section covers this in detail.

**The full checklist (quick reference)**

```
[ ] SSH in as root
[ ] Create non-root user with sudo access
[ ] Copy SSH public key to new user
[ ] Test: ssh in as new user in a NEW terminal, verify sudo works
[ ] Disable root login in sshd_config
[ ] Disable password authentication in sshd_config
[ ] Restart sshd and test again
[ ] Run apt update && apt upgrade
[ ] Set up ufw: default deny, allow 22
[ ] Never do day-to-day work as root again
```

**Why this matters**

Within minutes of a new server being created, automated bots will start scanning it and attempting SSH login as root with common passwords. `PasswordAuthentication no` makes these attempts useless. `PermitRootLogin no` means even if somehow an attacker got a key, they would need your deploy user's key, not root's.

This is not paranoia — this is baseline hygiene. Every production server should have this done before anything else is installed.

<!-- RESOURCES -->

- [DigitalOcean - Initial Server Setup with Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04) -- type: tutorial, time: 20m
- [sshd_config man page](https://man.openbsd.org/sshd_config) -- type: reference, time: 10m
