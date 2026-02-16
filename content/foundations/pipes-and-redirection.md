---
id: "pipes-and-redirection"
title: "Pipes & Redirection"
zone: "foundations"
edges:
  from:
    - id: "the-terminal"
      question: "I can run commands. How do I combine them?"
      detail: "You can run individual commands, but the real power of the terminal comes from connecting commands together. The output of one command becomes the input of the next, and you can redirect output to files instead of the screen. This is the Unix philosophy in action — small tools that do one thing well, composed into powerful workflows. Mastering pipes and redirection is what turns you from someone who types commands into someone who builds solutions."
  to:
    - id: "environment-and-shell-config"
      question: "I can chain commands. How do I customize my shell environment?"
      detail: "You know how to compose commands with pipes and redirection. But your shell has its own configuration — environment variables that control how programs behave, config files that run every time you open a terminal, and a PATH variable that determines which programs you can run by name. Understanding your shell environment is how you go from 'it works when I type it' to 'it works everywhere, every time.'"
difficulty: 1
tags: ["pipes", "redirection", "stdin", "stdout", "stderr", "unix-philosophy", "composition"]
category: "concept"
milestones:
  - "Explain what stdin, stdout, and stderr are"
  - "Chain three commands together with pipes to solve a problem"
  - "Redirect output to a file and separate stdout from stderr"
---

Run `ls`. The output appears on your screen. But what if you want to save it to a file? Or feed it into another command that filters the results? Or discard error messages while keeping the useful output? This is what **pipes and redirection** are for — they let you control where data flows between commands. This is the single most powerful idea in the Unix world: small commands that do one thing, connected together to do anything.

<!-- DEEP_DIVE -->

Every process on Linux has three standard data streams, opened automatically when it starts:

- **stdin (standard input)** — file descriptor 0. Where the process reads input from. By default, this is your keyboard.
- **stdout (standard output)** — file descriptor 1. Where the process writes normal output. By default, this is your terminal screen.
- **stderr (standard error)** — file descriptor 2. Where the process writes error messages. Also your terminal screen by default, but crucially separate from stdout.

These three streams are the foundation of everything that follows. They are why `ls` prints to your screen, why error messages from a failing command show up alongside normal output, and why you can reroute all of it.

**Redirection** changes where these streams go:

- `command > file` — redirect stdout to a file (overwrites the file). `ls > filelist.txt` saves the directory listing to a file instead of printing it.
- `command >> file` — append stdout to a file (does not overwrite).
- `command 2> file` — redirect stderr to a file. Useful for saving error logs: `./build.sh 2> errors.log`.
- `command > file 2>&1` — redirect both stdout and stderr to the same file. The `2>&1` means "send stderr wherever stdout is going." This is essential for capturing complete output from scripts and cron jobs.
- `command < file` — redirect a file into stdin. `sort < names.txt` sorts the contents of the file.
- `command > /dev/null` — discard output. `/dev/null` is a special file that swallows everything written to it. `command > /dev/null 2>&1` silences a command completely.

**Pipes** (`|`) connect the stdout of one command to the stdin of the next:

- `cat access.log | grep "POST"` — read the file and filter for lines containing "POST"
- `ps aux | grep nginx | grep -v grep` — list processes, filter for nginx, remove the grep itself from results
- `cat access.log | awk '{print $9}' | sort | uniq -c | sort -rn | head -20` — extract HTTP status codes from an access log, count occurrences, and show the top 20

That last example is the Unix philosophy at its most powerful: six simple tools, each doing one thing, composed into an ad-hoc log analysis pipeline. No code, no scripts — just pipes. As an SRE, you will build pipelines like this constantly during incidents to quickly answer questions like "what are the most common error codes in the last hour?" or "which IP addresses are making the most requests?"

**Useful commands that pair well with pipes:**

- `grep` — filter lines matching a pattern. `grep -i "error" app.log` (case-insensitive).
- `awk` — extract and manipulate fields. `awk '{print $1, $4}' access.log` prints the first and fourth columns.
- `sed` — stream editor for find-and-replace. `sed 's/old/new/g' file.txt`.
- `sort` — sort lines. `sort -n` for numeric sort, `sort -r` for reverse.
- `uniq` — deduplicate adjacent lines. Almost always used after `sort`. `uniq -c` counts occurrences.
- `wc` — count lines (`wc -l`), words (`wc -w`), or characters (`wc -c`).
- `head` / `tail` — show the first or last N lines. `tail -f logfile` follows a log in real time.
- `cut` — extract fields by delimiter. `cut -d',' -f2 data.csv` gets the second column of a CSV.
- `tee` — split output to both a file and stdout. `command | tee output.log` lets you see the output AND save it.

**The practical difference between stdout and stderr.** Run a command that produces both normal output and errors: `ls /home /nonexistent 2>/dev/null`. The listing of `/home` appears (stdout), but the "No such file or directory" error for `/nonexistent` is discarded (stderr sent to /dev/null). Being able to separate these streams is critical for scripting — you want your script's output to be clean data that the next command can process, while errors go to a log file for debugging.

<!-- RESOURCES -->

- [Pipelines - Linux Documentation Project](https://tldp.org/LDP/abs/html/io-redirection.html) -- type: reference, time: 30m
- [MIT Missing Semester - Shell Tools and Scripting](https://missing.csail.mit.edu/2020/shell-tools/) -- type: course, time: 1h
- [The Art of Command Line](https://github.com/jlevy/the-art-of-command-line) -- type: reference, time: 1h
- [Explain Shell](https://explainshell.com/) -- type: tool, time: 5m
- [Linux Pipes and Redirection - Linode](https://www.linode.com/docs/guides/piping-and-redirecting-linux-commands/) -- type: tutorial, time: 20m
