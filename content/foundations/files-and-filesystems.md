---
id: "files-and-filesystems"
title: "Files & Filesystems"
zone: "foundations"
edges:
  from:
    - id: "operating-system-basics"
      question: "The OS manages files. How does that work?"
      detail: "Everything on your computer is a file — your code, your configs, your logs, even your devices. The OS organizes all of this through a filesystem: a hierarchical structure that determines where things live, who can access them, and how data is physically stored on disk. Understanding the filesystem is essential because in SRE work, you'll constantly be reading logs, editing configs, and managing storage."
  to:
    - id: "processes-and-memory"
      question: "Files exist on disk. But what about things running in memory?"
      detail: "You understand how data is stored on disk, but when a program actually runs, it lives in memory (RAM) — a much faster but temporary space. The OS constantly shuffles data between disk and memory, creates processes, and allocates resources. Understanding this relationship between disk and memory, and how the OS manages running programs, is key to troubleshooting performance issues."
difficulty: 1
tags: ["filesystem", "permissions", "inodes", "linux", "ext4", "directory-structure"]
category: "concept"
milestones:
  - "Explain the Linux directory structure (/etc, /var, /home, etc.)"
  - "Change file permissions using chmod"
---

Everything on a Linux system is a file -- or at least, it pretends to be. Regular files, directories, hardware devices, running processes -- they all show up as entries in a unified file hierarchy. Understanding how this hierarchy is organized, how permissions control who can do what, and how the filesystem actually stores data on disk will save you from countless headaches when managing servers.

<!-- DEEP_DIVE -->

Linux organizes everything into a single tree that starts at `/` (called "root," not to be confused with the root user). Unlike Windows, which has separate drive letters like `C:\` and `D:\`, Linux mounts everything under one unified hierarchy. The key directories you need to know: `/home` is where user home directories live (your stuff goes in `/home/yourusername`). `/etc` holds system-wide configuration files -- this is where you will find configs for SSH, Nginx, DNS, and nearly every service. `/var` stores variable data like logs (`/var/log`), databases, and mail. `/tmp` is for temporary files that get cleaned up on reboot. `/usr` holds user programs and libraries. `/bin` and `/sbin` contain essential system binaries.

**File permissions** are one of the most important concepts in Linux security. Every file has three sets of permissions: one for the owner, one for the group, and one for everyone else. Each set can allow reading (r), writing (w), and executing (x). When you run `ls -l`, you see something like `-rwxr-xr--`, which means the owner can read, write, and execute; the group can read and execute; and others can only read. The `chmod` command changes these permissions. You will use it in two ways: symbolic mode (`chmod u+x script.sh` adds execute permission for the owner) or numeric mode (`chmod 755 script.sh` sets rwx for owner, r-x for group and others). The numeric mode uses octal: 4=read, 2=write, 1=execute, and you add them up per group.

Under the hood, a filesystem like **ext4** (the most common Linux filesystem) or **XFS** stores data using a structure called **inodes**. An inode contains metadata about a file -- its size, permissions, timestamps, and pointers to the actual data blocks on disk. The filename itself is not stored in the inode; it is stored in the directory entry that points to the inode. This is why you can have hard links -- multiple filenames pointing to the same inode (and therefore the same data). It is also why deleting a file is technically "unlinking" it: you remove the directory entry, and when no more entries point to that inode, the data blocks are freed.

Why does this matter in practice? As an SRE, you will constantly deal with filesystem issues. A disk filling up with logs in `/var/log` can take down an entire service. Incorrect permissions on a config file can prevent a service from starting. Understanding inodes explains why you can sometimes run out of "disk space" even when `df` shows free space -- you might have run out of inodes (too many tiny files). Knowing the difference between ext4 and XFS matters when you are provisioning storage for databases versus log files, since they have different performance characteristics and limitations.

One more practical concept: **mount points**. In Linux, you can attach (mount) a separate disk or partition at any point in the directory tree. A common pattern on servers is to mount a separate disk at `/var/log` so that runaway logs cannot fill up the root filesystem and crash the machine. You will see this pattern constantly in cloud environments, where you attach EBS volumes or persistent disks and mount them where your application needs storage. The `mount` command and `/etc/fstab` file control this.

<!-- RESOURCES -->

- [Linux Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) -- type: reference, time: 30m
- [Linux Journey - Filesystem](https://linuxjourney.com/lesson/filesystem-hierarchy) -- type: tutorial, time: 1h
- [chmod Calculator - Visual Permission Tool](https://chmod-calculator.com/) -- type: tool, time: 5m
- [Understanding Inodes - Linux Handbook](https://linuxhandbook.com/inode-linux/) -- type: article, time: 15m
- [How Linux Works, Chapter 4: Disks and Filesystems](https://nostarch.com/howlinuxworks3) -- type: book, time: 2h
