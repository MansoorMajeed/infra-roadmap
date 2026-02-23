---
id: "linux-server-basics"
title: "Linux Server Basics"
zone: "running"
edges:
  from:
    - id: "datacenters"
      question: "I know where servers live. How do I actually use one?"
      detail: "Whether your server is in a datacenter you colocate in or a cloud VM you just provisioned, you need to manage it. That means SSH, Linux commands, package management, file permissions, and systemd services. These are the basics of operating a Linux server."
    - id: "cloud-providers"
      question: "I have a cloud VM. How do I actually use it?"
      detail: "You just created a virtual machine in the cloud. It has a public IP and is running Ubuntu. Now what? You need to SSH in, set up a user, install packages, configure services. These are the basics of operating a Linux server — the skills you need before you can deploy anything."
  to:
    - id: "deploying-your-code"
      question: "I can manage a Linux server. How do I get my code onto it?"
      detail: "I can SSH in and install packages. But my app code is still sitting on my laptop. How do I actually move it to the server, install what it needs, and get it running?"
difficulty: 1
tags: ["linux", "ssh", "systemd", "apt", "permissions", "server-admin"]
category: "practice"
milestones:
  - "SSH into a remote server and navigate the filesystem"
  - "Install packages with apt and manage services with systemctl"
  - "Create a non-root user with sudo access and set up SSH key authentication"
---

You have a server — a cloud VM with a public IP, running Ubuntu. Now you need to actually use it. That means connecting to it remotely, navigating the filesystem, installing software, managing services, and doing basic security hardening. These are the fundamental skills of Linux server administration, and you will use them every single day as an SRE.

<!-- DEEP_DIVE -->

**SSH (Secure Shell)** is how you connect to a server. It gives you a terminal session on the remote machine, encrypted end-to-end. Every command you type runs on the server, not on your laptop:

```bash
# Connect as root (first time only — you will create a proper user)
ssh root@143.198.100.50

# Connect as a regular user
ssh deploy@143.198.100.50

# Connect with a specific key file
ssh -i ~/.ssh/my_key deploy@143.198.100.50
```

**SSH key authentication** is more secure than passwords. You generate a key pair on your laptop — a private key (stays on your laptop, never shared) and a public key (goes on the server). When you connect, SSH uses cryptographic challenge-response to prove you have the private key without ever sending it over the network:

```bash
# Generate an SSH key pair (on your laptop)
ssh-keygen -t ed25519 -C "your-email@example.com"
# Creates: ~/.ssh/id_ed25519 (private) and ~/.ssh/id_ed25519.pub (public)

# Copy your public key to the server
ssh-copy-id deploy@143.198.100.50

# Now you can log in without a password
ssh deploy@143.198.100.50
```

**First things first — create a non-root user.** Running everything as root is dangerous. One typo and you can destroy the entire system. Create a regular user with `sudo` access:

```bash
# On the server as root:
adduser deploy                  # Create user, set password
usermod -aG sudo deploy         # Give sudo access

# Copy your SSH key to the new user
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Now log out and log back in as deploy
exit
ssh deploy@143.198.100.50

# Test sudo
sudo whoami    # Should print "root"
```

**The Linux filesystem** has a standard layout. Knowing where things live saves you time:

| Path | What lives there |
|------|-----------------|
| `/` | Root of everything |
| `/home/deploy/` | Your user's home directory |
| `/etc/` | Configuration files (nginx.conf, systemd services) |
| `/var/log/` | Log files |
| `/var/www/` | Web content (by convention) |
| `/tmp/` | Temporary files (cleared on reboot) |
| `/usr/bin/` | Installed programs |
| `/opt/` | Optional/third-party software |

```bash
# Useful navigation commands
pwd                    # Where am I?
ls -la                 # List files with details
cd /etc/nginx/         # Go to nginx config
cat /etc/os-release    # What OS is this?
df -h                  # Disk usage
free -h                # Memory usage
htop                   # Live process monitor (install with apt)
```

**Package management with `apt`** is how you install software on Ubuntu/Debian:

```bash
# Update the package list (always do this first)
sudo apt update

# Install packages
sudo apt install nginx python3 python3-pip python3-venv git htop

# Upgrade all installed packages
sudo apt upgrade

# Remove a package
sudo apt remove nginx

# Search for packages
apt search postgres
```

**File permissions** control who can read, write, and execute files. Every file has an owner, a group, and permissions for owner/group/others:

```bash
ls -la myapp/
# -rw-r--r-- 1 deploy deploy  1234 Jan 15 10:00 app.py
# drwxr-xr-x 2 deploy deploy  4096 Jan 15 10:00 static/
#
# -rw-r--r-- means:
#   owner (deploy): read + write
#   group (deploy): read only
#   others:         read only

# Change permissions
chmod 755 script.sh     # rwxr-xr-x (owner can execute, others can read/execute)
chmod 600 secret.key    # rw------- (only owner can read/write)

# Change ownership
sudo chown deploy:deploy /var/www/mystore
```

**systemd** is the service manager on modern Linux. It starts services on boot, restarts them if they crash, and manages their logs. Every long-running process on your server should be a systemd service:

```bash
# Check if a service is running
sudo systemctl status nginx

# Start, stop, restart a service
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx

# Enable a service to start on boot
sudo systemctl enable nginx

# View logs for a service
sudo journalctl -u nginx           # All logs
sudo journalctl -u nginx -f        # Follow (tail) logs in real time
sudo journalctl -u nginx --since "1 hour ago"
```

Creating your own systemd service (you will do this for your app):

```ini
# /etc/systemd/system/mystore.service
[Unit]
Description=My Store Application
After=network.target

[Service]
User=deploy
WorkingDirectory=/home/deploy/mystore
ExecStart=/home/deploy/mystore/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
# Load the new service, enable and start it
sudo systemctl daemon-reload
sudo systemctl enable mystore
sudo systemctl start mystore
```

**Basic security hardening** — a few things you should do on every new server:

```bash
# 1. Disable root login via SSH
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 2. Disable password authentication (use keys only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 3. Set up a firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# 4. Keep the system updated
sudo apt update && sudo apt upgrade
```

**Why SREs care:** Linux server management is the most fundamental SRE skill. Every production system, every CI/CD pipeline, every container — it all runs on Linux. SSH, systemd, package management, file permissions, log reading — you will use these daily. When a service goes down at 2 AM, the first thing you do is SSH in and check `systemctl status` and `journalctl`.

<!-- RESOURCES -->

- [DigitalOcean - Initial Server Setup with Ubuntu](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04) -- type: tutorial, time: 20m
- [Linux Journey](https://linuxjourney.com/) -- type: interactive, time: varies
- [The Linux Command Line (free book)](https://linuxcommand.org/tlcl.php) -- type: book, time: varies
- [systemd for Developers](https://systemd.io/) -- type: reference, time: 15m
- [SSH Key Authentication - DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server) -- type: tutorial, time: 15m
