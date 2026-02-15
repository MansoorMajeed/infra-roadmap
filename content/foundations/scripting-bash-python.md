---
id: "scripting-bash-python"
title: "Scripting: Bash & Python"
zone: "foundations"
edges:
  from:
    - id: "programming-fundamentals"
    - id: "version-control-git"
  to:
    - id: "what-is-a-web-service"
      question: "Scripts are great, but how do I build a real service?"
difficulty: 1
tags: ["bash", "python", "scripting", "automation", "cron", "shell-scripting"]
category: "practice"
milestones:
  - "Write a bash script that automates a repetitive task"
  - "Write a Python script that processes a file"
  - "Set up a cron job"
---

Scripting is where programming stops being theoretical and starts saving you real time. A bash script can automate that tedious deployment process you do every week, a Python script can parse log files and extract the exact error patterns you need, and a cron job can run either of them on a schedule while you sleep. This is the bridge between "I know how to code" and "I use code to make my life dramatically easier."

<!-- DEEP_DIVE -->

**Bash scripting** is writing a series of terminal commands in a file and running them together. Create a file called `backup.sh`, start it with `#!/bin/bash` (this tells the system to use bash to interpret it), and add your commands. A simple example: a script that backs up a directory, timestamps the archive, and deletes backups older than 7 days. Make it executable with `chmod +x backup.sh` and run it with `./backup.sh`. Bash is perfect for tasks that are essentially "run these five commands in order" -- file manipulation, service restarts, log rotation, deployment steps. It is already installed on every Linux and macOS system, so there is zero setup.

Here is a real-world bash pattern you will use constantly. Say you need to check if a service is running and restart it if it is not:

```bash
#!/bin/bash
SERVICE="nginx"
if systemctl is-active --quiet $SERVICE; then
    echo "$SERVICE is running"
else
    echo "$SERVICE is down, restarting..."
    systemctl restart $SERVICE
    echo "$SERVICE restarted at $(date)" >> /var/log/service-restarts.log
fi
```

That is a dozen lines of code that could be the difference between a 30-second automated recovery and a 3 AM phone call. Bash scripts excel at this kind of glue work -- stitching together system commands with a bit of logic.

**Python** steps in when things get more complex. Need to parse JSON from an API? Process a CSV with thousands of rows? Send a Slack notification when something fails? Python handles all of this with clean, readable code and an enormous library ecosystem. For example, processing a log file to count error types:

```python
from collections import Counter

errors = Counter()
with open("/var/log/app.log") as f:
    for line in f:
        if "ERROR" in line:
            error_type = line.split("ERROR")[1].strip().split(":")[0]
            errors[error_type] += 1

for error, count in errors.most_common(10):
    print(f"{count:>5} | {error}")
```

Python is the language of choice for SRE tooling, and for good reason -- it is readable, it has libraries for everything (requests for HTTP, boto3 for AWS, kubernetes for K8s), and you can write something useful in a few minutes.

**Cron jobs** are how you schedule scripts to run automatically. The cron daemon on Linux checks a schedule table and runs commands at specified times. Run `crontab -e` to edit your schedule. The format is `minute hour day-of-month month day-of-week command`. For example, `0 2 * * * /home/user/backup.sh` runs your backup script at 2:00 AM every day. `*/5 * * * * /home/user/check_disk.sh` runs a disk check every 5 minutes. The syntax looks cryptic at first, but sites like crontab.guru let you build expressions interactively.

The rule of thumb for choosing between bash and Python: if your script is mostly running system commands with a little logic, use bash. If it involves data processing, API calls, complex logic, or error handling, use Python. In practice, many SRE teams end up with a mix -- bash scripts for simple operational tasks and Python for anything more involved. And since you already learned Git, put all your scripts in a repository from day one. Future-you trying to figure out why the backup script was changed last Tuesday will thank present-you.

One last piece of advice: start automating things that annoy you. Every time you catch yourself doing the same manual task for the third time, stop and write a script. Over weeks and months, you will build a personal toolkit of scripts that makes you dramatically more productive. This habit -- seeing repetition as an opportunity for automation -- is the defining trait of effective SRE and DevOps engineers.

<!-- RESOURCES -->

- [Bash Scripting Tutorial - Ryan's Tutorials](https://ryanstutorials.net/bash-scripting-tutorial/) -- type: tutorial, time: 3h
- [Automate the Boring Stuff with Python - Al Sweigart](https://automatetheboringstuff.com/) -- type: book, time: 10h
- [Crontab Guru - Cron Expression Editor](https://crontab.guru/) -- type: tool, time: 10m
- [Google's Shell Style Guide](https://google.github.io/styleguide/shellguide.html) -- type: reference, time: 30m
- [Python for DevOps - O'Reilly (Free Chapter)](https://www.oreilly.com/library/view/python-for-devops/9781492057680/) -- type: book, time: varies
