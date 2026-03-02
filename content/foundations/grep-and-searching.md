---
id: grep-and-searching
title: Searching and Filtering Output
zone: foundations
edges:
  to:
    - id: regular-expressions
      question: The patterns I write in grep work, but I'm guessing at the syntax. What are the actual rules?
      detail: >-
        I've been copying grep patterns from Stack Overflow and they mostly work,
        but I don't really know why. What does .* mean? Why does [0-9]+ match
        numbers? Sometimes my pattern matches too much, sometimes nothing at all.
        I want to be able to write these from scratch instead of guessing.
    - id: text-processing
      question: I can filter lines — but what if I need to reshape or count the output?
      detail: >-
        grep finds the lines I care about, but then what? Sometimes I need just
        one field out of each line, or I want to count how many times each value
        appears, or remove duplicates. The data is all there, I just need it in
        a different shape.
difficulty: 1
tags:
  - grep
  - tail
  - searching
  - filtering
  - logs
  - shell
  - cli
category: practice
milestones:
  - Use grep with flags (-i, -r, -v, -c, -A, -B) to find patterns in files and command output
  - Follow live log output and filter it in real time
  - Build multi-stage pipe commands to answer specific questions about a system
---

When a server is misbehaving, you are not going to read log files line by line. You are going to search through them. `grep` is the tool you reach for first — it filters input to only the lines that match a pattern — and once you combine it with pipes, it becomes one of the most powerful tools in your arsenal. This node covers grep, the flags that matter, and the real patterns you will use constantly as an SRE.

<!-- DEEP_DIVE -->

## grep basics

`grep "pattern" file` — print every line in `file` that contains the pattern.

The flags you need to know:

- `-i` — case-insensitive. `grep -i "error"` matches ERROR, Error, error.
- `-v` — invert. Print lines that do **not** match. Useful for filtering noise: `grep -v "healthcheck"`.
- `-n` — show line numbers alongside matches.
- `-c` — count matches instead of printing them. `grep -c "ERROR" app.log` tells you how many errors, not which ones.
- `-r` — recursive. Search an entire directory. `grep -r "database_url" /etc/` searches every file under `/etc/`.
- `-l` — only print filenames of files that contain a match, not the matching lines themselves.
- `-E` — extended regex. Lets you use `|` for alternation: `grep -E "ERROR|WARN"` matches either.

## Context flags — essential during incidents

When you find an error, you often want to see what happened before and after it:

- `-A 5` — print 5 lines **after** each match
- `-B 5` — print 5 lines **before** each match
- `-C 5` — print 5 lines of context on **both** sides

```bash
# Show what led up to each FATAL log entry
grep -C 10 "FATAL" /var/log/myapp/app.log
```

## grep with pipes — where it gets powerful

grep doesn't just work on files. It works on any input, which makes it essential in pipelines:

```bash
# Is nginx actually running?
ps aux | grep [n]ginx

# The bracket trick: prevents grep from matching its own process in the output.
# ps aux | grep nginx shows the grep process too.
# ps aux | grep [n]ginx does not, because the pattern [n]ginx doesn't match "grep nginx".

# How many 500 errors in the last hour's nginx log?
grep "HTTP/1.1\" 5" /var/log/nginx/access.log | grep -c ""

# Show only error and warning lines from journalctl
journalctl -u myapp --since "1 hour ago" | grep -E "ERROR|WARN"

# What IPs are hitting my server most?
grep "GET /api/endpoint" /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
```

## tail — following live output

`tail -f /var/log/nginx/access.log` — follow a log file in real time. New lines appear as they are written. This is how you watch what a service is doing right now.

Combine it with grep to filter the live stream:

```bash
# Watch for errors in real time, ignore everything else
tail -f /var/log/myapp/app.log | grep --line-buffered "ERROR"

# Watch POST requests hitting a specific endpoint
tail -f /var/log/nginx/access.log | grep --line-buffered "POST /api/payments"
```

The `--line-buffered` flag is important here — without it, grep buffers output and you won't see results immediately.

For systemd services, `journalctl -u myapp -f` is often better than tailing a log file directly — it follows the journal stream, which captures stdout/stderr even if the service doesn't write to a file.

## head and tail for slicing

- `head -20 file` — first 20 lines
- `tail -20 file` — last 20 lines
- `tail -n +100 file` — everything from line 100 onward (skip the first 99 lines)

## Searching compressed logs

Logs get rotated and compressed. `zgrep` works like grep but on `.gz` files without decompressing them first:

```bash
zgrep "payment_failed" /var/log/myapp/app.log.3.gz
```

## Practical SRE patterns

```bash
# Did the service restart recently? When?
journalctl -u myapp | grep "Started"

# Are there OOM kills in the last hour?
journalctl -p err --since "1 hour ago" | grep -i "out of memory"

# What ports is this machine listening on, and which process owns each?
ss -tlnp | grep LISTEN

# Which systemd services failed?
systemctl list-units --type=service | grep failed

# Find all config files that reference a specific database host
grep -r "db.internal.example.com" /etc/ 2>/dev/null

# Count requests per HTTP status code in nginx access log
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

<!-- RESOURCES -->

- [grep Manual - GNU](https://www.gnu.org/software/grep/manual/grep.html) -- type: reference, time: 30m
- [grep Cheat Sheet - ryanstutorials.net](https://ryanstutorials.net/linuxtutorial/grep.php) -- type: tutorial, time: 20m
- [The Art of Command Line (GitHub)](https://github.com/jlevy/the-art-of-command-line) -- type: reference, time: varies
- [Linux tail command - examples and usage](https://linuxize.com/post/linux-tail-command/) -- type: tutorial, time: 10m
