---
id: "users-and-permissions"
title: "Users & Permissions"
zone: "foundations"
edges:
  from:
    - id: "linux-and-distros"
      question: "Linux is multi-user. Who controls what?"
      detail: "Linux was designed from the ground up as a multi-user system. Every file has an owner, every process runs as a user, and the root user has god-mode access to everything. Understanding users, groups, and permissions is not optional — it is the foundation of Linux security. Get this wrong and you either lock yourself out or leave the door wide open."
  to:
    - id: "package-management"
      question: "I understand who can do what. How do I install software?"
      detail: "Now that you understand users and permissions, you know why some commands need sudo and why installing software requires elevated privileges. Package management is how Linux systems install, update, and remove software — and understanding it means you can set up and maintain servers with the right tools installed, kept up to date, and properly secured."
difficulty: 1
tags: ["users", "groups", "permissions", "chmod", "chown", "sudo", "root", "security"]
category: "concept"
milestones:
  - "Explain the difference between root and a regular user"
  - "Change file ownership and permissions with chown and chmod"
  - "Use sudo and explain why running everything as root is dangerous"
---

Linux is a multi-user system. Even if you are the only person using your laptop, Linux still thinks in terms of users, groups, and permissions. Every file is owned by someone. Every process runs as someone. And the all-powerful **root** user can do literally anything — including destroying the entire system with a single command. Understanding this permission model is how you keep systems secure and how you avoid the dreaded "Permission denied" errors that will otherwise haunt you.

<!-- DEEP_DIVE -->

Every Linux system has users, and every user has a numeric **UID** (User ID). The most important user is **root** (UID 0) — the superuser, the administrator, the account that can read any file, kill any process, and modify any system configuration. Running commands as root is like driving without a seatbelt — it works great until it does not. A typo as root can wipe the entire filesystem. This is why modern Linux practice is to use a regular user account and escalate to root privileges only when needed, using `sudo`.

The `sudo` command ("superuser do") lets an authorized user run a single command with root privileges. Instead of logging in as root and running `apt update`, you run `sudo apt update` from your regular account. The system logs who ran what with sudo, creating an audit trail. The configuration file `/etc/sudoers` controls who is allowed to use sudo — never edit it directly, always use `visudo`, which validates the syntax before saving (a broken sudoers file can lock you out of root access entirely).

**Groups** are how Linux organizes users. Every user belongs to at least one group (their primary group), and can belong to many. Groups simplify permission management — instead of giving ten users individual access to a directory, you create a group, add the users to it, and give the group access. Common groups you will encounter: `sudo` or `wheel` (users who can use sudo), `docker` (users who can run Docker commands), `www-data` (the web server user).

File permissions in Linux follow a simple model: every file and directory has three sets of permissions for three categories — **owner**, **group**, and **others** (everyone else). Each set has three permission bits:

- **r** (read) — can view the file contents or list a directory
- **w** (write) — can modify the file or create/delete files in a directory
- **x** (execute) — can run the file as a program or enter a directory

When you run `ls -la`, you see something like `-rwxr-xr--`. Breaking that down: the owner can read, write, and execute; the group can read and execute; others can only read. The `chmod` command changes permissions. You can use symbolic notation (`chmod u+x script.sh` — add execute for the owner) or octal notation (`chmod 755 script.sh` — rwx for owner, r-x for group and others). For SRE work, the octal numbers you will use constantly are `644` (files: owner reads/writes, everyone else reads), `755` (directories and scripts: owner full access, everyone else read/execute), and `600` (private files like SSH keys: owner only).

The `chown` command changes ownership. `chown alice:developers myfile.txt` sets the owner to alice and the group to developers. You will use this frequently when deploying applications — web server files need to be owned by the web server user, application logs need to be writable by the application user.

**Why this matters for SRE:** Half of the "it works on my machine but not on the server" problems come down to permissions. A deployment script that cannot write to `/var/www` because it is running as the wrong user. An application that crashes because it cannot read its config file. A cron job that fails silently because it runs as root but the script expects a regular user's environment. SSH key authentication failing because the key file permissions are too open (`chmod 600 ~/.ssh/id_rsa` — SSH refuses to use a key that others can read). Understanding the permission model turns these from mysterious failures into obvious fixes.

A practical exercise: create a file, check its permissions with `ls -la`, change them with `chmod`, change ownership with `chown`, then try to access it as a different user. Notice how the system enforces the rules. Then try the same with a directory — notice that `x` on a directory means something different (the ability to `cd` into it) than `x` on a file (the ability to execute it).

<!-- RESOURCES -->

- [Linux File Permissions Explained - DigitalOcean](https://www.digitalocean.com/community/tutorials/linux-permissions-basics-and-how-to-use-umask-on-a-vps) -- type: tutorial, time: 30m
- [Understanding Linux File Permissions - Red Hat](https://www.redhat.com/sysadmin/linux-file-permissions-explained) -- type: article, time: 20m
- [Sudo Explained - Linuxize](https://linuxize.com/post/sudo-command-in-linux/) -- type: tutorial, time: 15m
- [Linux Users and Groups - Arch Wiki](https://wiki.archlinux.org/title/Users_and_groups) -- type: reference, time: 30m
- [chmod Calculator](https://chmod-calculator.com/) -- type: tool, time: 5m
