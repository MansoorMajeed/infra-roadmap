---
id: text-processing
title: Text Processing Tools
zone: foundations
edges:
  to:
    - id: scripting-bash-python
      question: I keep writing the same processing pipelines over and over. How do I turn this into a proper script?
      detail: >-
        I've been building these one-liners in my head and running them
        interactively, but now I want to save them, add logic, reuse them.
        What's the right way to take what I know about shell commands and turn
        it into something I can actually automate?
difficulty: 2
tags:
  - awk
  - sed
  - cut
  - sort
  - uniq
  - text-processing
  - shell
  - cli
category: practice
milestones:
  - Extract specific fields from structured text output using cut and awk
  - Count and rank occurrences using sort and uniq -c
  - Use sed for in-place substitution across config files
---

grep finds lines. But sometimes you do not want the whole line — you want the third column, or you want to count how many times each value appears, or you want to replace a value across a file. That is where text processing tools come in. `awk`, `sed`, `cut`, `sort`, and `uniq` are the five you reach for constantly. Together with grep and pipes, they let you ask almost any question about text data without writing a single line of Python.

<!-- DEEP_DIVE -->

## cut — extract columns

`cut` splits each line on a delimiter and prints specific fields. It is the fastest way to pull a column out of structured output.

```bash
# Print the first field from /etc/passwd (usernames), split on :
cut -d: -f1 /etc/passwd

# Print fields 1 and 3
cut -d: -f1,3 /etc/passwd

# Print the 9th space-separated field from nginx access logs (status code)
cut -d' ' -f9 /var/log/nginx/access.log
```

`cut` is simple and fast. Its limitation: it only works with a single, consistent delimiter. For anything more complex, use `awk`.

## sort — order output

`sort` reorders lines alphabetically by default. With flags, it gets much more useful:

- `sort -n` — numeric sort. Without this, `10` sorts before `9` (lexicographic).
- `sort -r` — reverse order (descending).
- `sort -rn` — numeric, descending. This is the combination you want for "largest first."
- `sort -k2` — sort by the second field.
- `sort -u` — sort and remove duplicates (like `sort | uniq`).
- `sort -h` — human-readable numeric sort. Handles `1K`, `5M`, `2G` correctly.

```bash
# Largest directories first (the combination you use constantly)
du -sh /var/log/* | sort -rh

# Sort a log file by the numeric value in field 2
awk '{print $2, $0}' app.log | sort -n | cut -d' ' -f2-
```

## uniq — deduplicate and count

`uniq` removes consecutive duplicate lines. Always sort first, because `uniq` only collapses adjacent duplicates.

- `uniq` — remove duplicates
- `uniq -c` — prefix each line with its count. This is the one you use constantly.
- `uniq -d` — print only the lines that appear more than once
- `uniq -u` — print only lines that appear exactly once

The pattern `sort | uniq -c | sort -rn` is one of the most useful things you can type in a terminal:

```bash
# What HTTP status codes are my users getting, and how often?
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# Which IPs are making the most requests?
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# Which error messages appear most often?
grep "ERROR" /var/log/myapp/app.log | sort | uniq -c | sort -rn | head -10
```

## awk — field processing and more

`awk` is a small programming language built around processing text line by line. It is overkill for simple field extraction, but invaluable when you need logic.

The basics: `awk '{print $1}'` prints the first field of each line. Fields are whitespace-separated by default. `$0` is the whole line.

```bash
# Print the 1st and 9th fields from nginx access log (IP and status code)
awk '{print $1, $9}' /var/log/nginx/access.log

# Custom delimiter with -F
awk -F: '{print $1}' /etc/passwd     # first field, colon-delimited

# Conditional: only print lines where field 9 starts with 5 (5xx errors)
awk '$9 ~ /^5/' /var/log/nginx/access.log

# Sum a column (total bytes transferred)
awk '{sum += $10} END {print sum}' /var/log/nginx/access.log

# Print lines where the value in column 2 is greater than 1000
awk '$2 > 1000' metrics.log
```

awk's `BEGIN` and `END` blocks run before and after processing all lines, which is how you do aggregations like sums and counts.

## sed — stream editing

`sed` edits text as it flows through a pipe, or edits files in place. Its most common use is substitution:

```bash
# Replace "localhost" with "db.internal" in a config file (prints to stdout)
sed 's/localhost/db.internal/' config.yaml

# In-place edit (modify the file directly). Use -i.bak to keep a backup.
sed -i.bak 's/localhost/db.internal/g' config.yaml

# The g flag at the end replaces ALL occurrences on each line, not just the first.
sed 's/foo/bar/g' file.txt

# Delete lines matching a pattern
sed '/^#/d' config.conf     # remove comment lines
sed '/^$/d' config.conf     # remove blank lines

# Print only lines 10 through 20
sed -n '10,20p' bigfile.log
```

`sed` is most useful for quick substitutions across files. For more complex transformations, a Python script is often clearer.

## Putting it together

These tools compose. The real skill is knowing which to reach for and in what order:

```bash
# How many unique users hit my API in the last hour?
tail -n 10000 /var/log/nginx/access.log | awk '{print $1}' | sort -u | wc -l

# Top 10 slowest request URIs by average response time
awk '{print $7, $NF}' /var/log/nginx/access.log | \
  awk '{sum[$1]+=$2; count[$1]++} END {for(u in sum) print sum[u]/count[u], u}' | \
  sort -rn | head -10

# Find all environment variables set in config files that look like secrets
grep -r "password\|secret\|token\|key" /etc/ 2>/dev/null | \
  grep -v "^Binary" | cut -d: -f1 | sort -u
```

You will not memorize all of this immediately. The pattern to build is: know what each tool does, know when to reach for it, and know how to look up the flags when you need them.

<!-- RESOURCES -->

- [AWK Tutorial - grymoire.com](https://www.grymoire.com/Unix/Awk.html) -- type: tutorial, time: 1h
- [sed Tutorial - grymoire.com](https://www.grymoire.com/Unix/Sed.html) -- type: tutorial, time: 1h
- [The Art of Command Line (GitHub)](https://github.com/jlevy/the-art-of-command-line) -- type: reference, time: varies
- [Command-line Tools can be 235x Faster than your Hadoop Cluster](https://adamdrake.com/command-line-tools-can-be-235x-faster-than-your-hadoop-cluster.html) -- type: article, time: 10m
