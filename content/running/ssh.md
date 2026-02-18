---
id: "ssh"
title: "SSH: Your Window Into the Server"
zone: "running"
edges:
  from:
    - id: "what-is-a-vps"
      question: "I have a VPS. How do I connect to it and run commands?"
      detail: "Your VPS is running in a datacenter somewhere. You do not have a monitor or keyboard plugged into it. The only way to interact with it is over the network, using SSH — a protocol that gives you a secure terminal session on a remote machine. Everything you do on the server goes through SSH."
  to:
    - id: "initial-server-setup"
      question: "I can SSH into my server. What should I do before anything else?"
      detail: "You just got root access to a fresh server. Before you install anything or deploy any code, there are a handful of things you should always do: create a non-root user, set up SSH key authentication, and lock down the SSH configuration. Skipping this is how servers get compromised."
difficulty: 1
tags: ["ssh", "keys", "authentication", "ed25519", "scp", "config"]
category: "practice"
milestones:
  - "Generate an SSH key pair and copy the public key to a server"
  - "Connect to a server using SSH key authentication (no password)"
  - "Create a ~/.ssh/config entry to connect with a short alias"
---

SSH (Secure Shell) is the protocol that lets you control a remote server from your terminal. When you type `ssh user@server`, you get a shell that runs on the server — every command you type executes there, not on your laptop. All traffic is encrypted. This is how every SRE, developer, and sysadmin interacts with remote servers.

There is no GUI, no remote desktop, no drag-and-drop. SSH is the interface. Getting comfortable with it is non-negotiable.

<!-- DEEP_DIVE -->

**How SSH works (simplified)**

SSH uses public-key cryptography. You generate a key pair: a **private key** (stays on your laptop, never leaves it) and a **public key** (goes on the server). When you connect, SSH proves you have the private key without ever sending it over the network. No password goes over the wire.

The server keeps a list of authorized public keys in `~/.ssh/authorized_keys`. If your public key is in that file, you can log in.

**Generating an SSH key pair**

```bash
# Generate a key pair (on your laptop)
ssh-keygen -t ed25519 -C "your-email@example.com"

# When prompted for a file location, press Enter to accept the default:
# ~/.ssh/id_ed25519       ← private key (NEVER share this)
# ~/.ssh/id_ed25519.pub   ← public key (safe to share)

# View your public key — this is what goes on servers
cat ~/.ssh/id_ed25519.pub
# ssh-ed25519 AAAA...long string... your-email@example.com
```

Use `ed25519` — it is more secure and generates shorter keys than the older `rsa`. If you see tutorials using `ssh-keygen -t rsa`, use `ed25519` instead.

**Connecting to a server**

```bash
# Basic connection
ssh root@143.198.100.50

# With a specific private key file
ssh -i ~/.ssh/id_ed25519 root@143.198.100.50

# With a non-standard port
ssh -p 2222 root@143.198.100.50
```

The first time you connect to a server, SSH shows you the server's fingerprint and asks if you trust it. Type `yes`. SSH saves the fingerprint in `~/.ssh/known_hosts` and will alert you if it ever changes (a sign the server may have been replaced or compromised).

**Copying your public key to a server**

```bash
# Easiest way — if the server already has password auth enabled
ssh-copy-id root@143.198.100.50
# This copies ~/.ssh/id_ed25519.pub into /root/.ssh/authorized_keys on the server

# Manual way — paste into authorized_keys yourself
cat ~/.ssh/id_ed25519.pub
# (copy the output, then on the server:)
# echo "ssh-ed25519 AAAA..." >> ~/.ssh/authorized_keys
```

**The `~/.ssh/config` file — your shortcut list**

Typing `ssh root@143.198.100.50` every time is tedious. The config file lets you define aliases:

```
# ~/.ssh/config

Host mystore
    HostName 143.198.100.50
    User deploy
    IdentityFile ~/.ssh/id_ed25519

Host staging
    HostName 143.198.100.51
    User deploy
    IdentityFile ~/.ssh/id_ed25519
```

Now you can just type:
```bash
ssh mystore       # connects as deploy@143.198.100.50
ssh staging       # connects to staging
scp myfile.txt mystore:/home/deploy/  # works too
```

**Copying files with `scp`**

`scp` is SSH-based file copy. Syntax mirrors `cp` but with `user@host:path` for remote paths:

```bash
# Copy a file from your laptop to the server
scp myfile.txt deploy@143.198.100.50:/home/deploy/

# Copy a directory
scp -r myapp/ deploy@143.198.100.50:/home/deploy/

# Copy from server to your laptop
scp deploy@143.198.100.50:/home/deploy/logs/app.log ./
```

**Common problems**

```bash
# "Permission denied (publickey)" — your key is not in authorized_keys
# Fix: copy your public key to the server

# "WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED"
# The server's fingerprint changed — could be legitimate (server was rebuilt) or suspicious
# Fix: remove the old entry: ssh-keygen -R 143.198.100.50

# "Connection refused"
# SSH is not running on the server, or the firewall is blocking port 22
# Fix: check that sshd is running and the firewall allows port 22

# Slow connection / long pause before prompt
# DNS reverse lookup is timing out
# Fix: add UseDNS no to /etc/ssh/sshd_config on the server
```

**SSH agent — not retyping your passphrase**

If you added a passphrase to your key (good idea), you would have to type it every time you SSH. `ssh-agent` caches the decrypted key in memory for your session:

```bash
# Start the agent (usually happens automatically on macOS/Linux with a GUI)
eval "$(ssh-agent -s)"

# Add your key to the agent (type passphrase once)
ssh-add ~/.ssh/id_ed25519

# Now SSH connections use the cached key — no passphrase prompts
ssh mystore
```

<!-- RESOURCES -->

- [DigitalOcean - SSH Key Authentication Tutorial](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server) -- type: tutorial, time: 20m
- [SSH Config File Guide](https://linuxize.com/post/using-the-ssh-config-file/) -- type: article, time: 10m
- [ssh-keygen man page](https://man.openbsd.org/ssh-keygen) -- type: reference, time: 5m
