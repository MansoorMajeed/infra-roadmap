---
id: ssh-into-your-server
title: SSH Into Your Server
zone: self-hosting
edges:
  to:
    - id: docker-or-native
      question: I'm in. How do I actually install software on this thing?
      detail: >-
        I've got a shell on a fresh machine. I have no idea if I should just apt
        install things, use Docker, or something else entirely. What's the right
        way to actually run services?
difficulty: 1
tags:
  - self-hosting
  - ssh
  - linux
  - terminal
category: practice
milestones:
  - SSH into your server from your laptop
  - Know your server's IP address
  - Create a non-root user and add it to sudoers
  - Set up SSH key authentication
---

SSH (Secure Shell) lets you log into your server from your laptop over the network. Your server has no monitor, no keyboard — SSH is how you talk to it. You type commands on your laptop, they run on the server.

```bash
ssh username@192.168.1.100
```

That's it. You're in.

<!-- DEEP_DIVE -->

**Finding your server's IP**

If you set a DHCP reservation during install, you already know the IP. If not:
- Check your router's admin page — usually at `192.168.1.1` or `192.168.0.1`. Look for connected devices.
- Or log into the server directly (with a keyboard/monitor temporarily) and run `ip a`

**SSH keys: stop using passwords**

Password authentication works, but SSH keys are better in every way: more secure, more convenient, and no typing passwords on every login.

Generate a key pair on your laptop (if you don't have one already):

```bash
ssh-keygen -t ed25519 -C "homelab"
```

Press Enter to accept the default location (`~/.ssh/id_ed25519`). Set a passphrase if you want (optional).

Copy your public key to the server:

```bash
ssh-copy-id username@192.168.1.100
```

Enter your password once. After that, `ssh username@192.168.1.100` logs you in without a password prompt — it uses your key instead.

**Don't run everything as root**

If you installed Debian bare metal, you created a non-root user during setup. Use that. If you're SSHing into a Proxmox VM that only has root, create a user:

```bash
adduser yourname
usermod -aG sudo yourname
```

Then `ssh yourname@192.168.1.100`. Use `sudo` when you need admin access. Running everything as root is a bad habit — a typo in the wrong place can delete your entire filesystem.

**Handy shortcut: SSH config**

Stop typing IP addresses. Add an entry to `~/.ssh/config` on your laptop:

```
Host homelab
    HostName 192.168.1.100
    User yourname
    IdentityFile ~/.ssh/id_ed25519
```

Now `ssh homelab` is all you need.

<!-- RESOURCES -->
