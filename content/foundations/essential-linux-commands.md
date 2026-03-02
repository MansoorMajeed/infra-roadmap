---
id: essential-linux-commands
title: Essential Linux Commands
zone: foundations
edges:
  to:
    - id: grep-and-searching
      question: I can navigate and manage files — but the output is overwhelming. How do I search through it?
      detail: >-
        ps aux gives me 80 lines. df gives me 10. cat on a log file gives me
        thousands. I need to find a specific process, filter for errors, count
        things. I keep piping to grep but I'm mostly guessing at the syntax.
        What's the right way to search through all this output?
difficulty: 1
tags:
  - linux
  - commands
  - terminal
  - shell
  - cli
category: practice
milestones:
  - Navigate and manipulate files entirely from the command line
  - Inspect running processes, disk usage, and memory from the terminal
  - Combine commands with pipes to answer practical questions about a system
---

The terminal gives you a shell. But what do you actually type? There are hundreds of Linux commands, but as an SRE you will reach for the same couple dozen over and over. This node covers the ones that matter — not a complete reference, but the commands you need to be fluent in before anything else makes sense.

<!-- DEEP_DIVE -->

## Navigation and file management

These are the commands you use to move around and manage the filesystem. You should be able to do all of this without thinking:

- `pwd` — print working directory. Where are you right now?
- `ls` — list files. `ls -l` shows permissions, owner, size, and date. `ls -la` includes hidden files (dotfiles).
- `cd /var/log` — change directory. `cd ..` goes up one level. `cd ~` goes home. `cd -` goes back to where you just were.
- `mkdir -p /opt/myapp/config` — create directory (and parents if needed).
- `cp file.txt backup.txt` — copy. `cp -r dir/ backup/` for directories.
- `mv old.txt new.txt` — rename or move.
- `rm file.txt` — delete. `rm -r dir/` for directories. **There is no trash can. This is permanent.**
- `touch file.txt` — create an empty file, or update the timestamp if it already exists.
- `find /var/log -name "*.log" -mtime -1` — find files by name, time, size. More powerful than it looks.

## Viewing files

- `cat file.txt` — print the whole file. Fine for short files, terrible for large ones.
- `less file.txt` — page through a file. Use `/` to search, `q` to quit. Use this instead of `cat` for anything longer than a screen.
- `head -20 file.txt` — first 20 lines.
- `tail -20 file.txt` — last 20 lines. `tail -f file.txt` follows the file in real time as new lines are written — your live log viewer.

## Processes

- `ps aux` — list all running processes with PID, CPU, memory, and the command that started them.
- `ps aux | grep nginx` — the single most common process command you will use. Find a specific process by name.
- `top` — interactive process viewer, updated every few seconds. Press `q` to quit, `k` to kill a process by PID, `M` to sort by memory, `P` to sort by CPU.
- `htop` — a friendlier version of top. Not always installed by default but worth getting.
- `kill 1234` — send SIGTERM (graceful shutdown) to PID 1234.
- `kill -9 1234` — send SIGKILL (force kill). Use this only when the process won't respond to SIGTERM.

One important quirk: `ps aux | grep nginx` will also show the grep process itself in the output. Filter it out with `ps aux | grep [n]ginx` — the bracket trick prevents grep from matching itself.

## Disk and memory

- `df -h` — disk space on all mounted filesystems. The `-h` flag makes sizes human-readable (GB, MB). Check this when a server is behaving oddly — a full disk is a surprisingly common cause of outages.
- `du -sh /var/log` — how much disk space a directory is using. `du -sh *` in a directory gives a breakdown of every subdirectory.
- `du -sh * | sort -rh` — the combination you actually want: size of everything in the current directory, sorted largest first. Invaluable for tracking down what ate your disk.
- `free -h` — memory usage: total, used, free, and buffer/cache. The "available" column is what matters — it accounts for memory the kernel can reclaim.

## Network basics (commands)

- `curl -I https://example.com` — make an HTTP request. `-I` fetches only the headers. Useful for checking if a service is responding.
- `wget https://example.com/file.tar.gz` — download a file.
- `ping google.com` — check if a host is reachable.
- `ss -tlnp` — show listening TCP sockets and which process owns them. Tells you what is listening on what port. (Older systems use `netstat -tlnp`.)

## Getting help

- `man ls` — the built-in manual for any command. Press `q` to quit.
- `ls --help` — shorter, inline help. Most commands support this.
- `which nginx` — where is the nginx binary? Useful when you have multiple versions installed.
- `type cd` — tells you if a command is a shell builtin, an alias, or an external binary.

## Practical combinations

The real power is in combining commands. A few patterns you will use constantly:

```bash
# Find the process using port 8080
ss -tlnp | grep 8080

# What is eating my disk?
du -sh /var/log/* | sort -rh | head -10

# Is nginx actually running?
ps aux | grep [n]ginx

# How many connections does my app have right now?
ss -tn state established | grep :443 | wc -l

# What changed recently in /etc?
find /etc -mmin -60 -type f
```

You do not need to memorize these. You need to understand the pieces well enough to build them when you need them.

<!-- RESOURCES -->

- [The Linux Command Line (free book by William Shotts)](https://linuxcommand.org/tlcl.php) -- type: book, time: varies
- [Linux Commands Cheat Sheet - Red Hat](https://www.redhat.com/en/blog/linux-commands-cheat-sheet) -- type: reference, time: 10m
- [OverTheWire: Bandit - Learn CLI through challenges](https://overthewire.org/wargames/bandit/) -- type: practice, time: 5h
- [Explain Shell - Paste a command and get it explained](https://explainshell.com/) -- type: tool, time: 5m
