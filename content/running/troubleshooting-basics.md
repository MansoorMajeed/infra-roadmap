---
id: troubleshooting-basics
title: 'Troubleshooting: When Things Break'
zone: running
edges:
  to:
    - id: running-your-store
      question: >-
        I know how to debug my setup. How do I put everything together and run
        my real app?
      detail: >-
        I can debug each part of the stack in isolation now. But I've never
        assembled a complete deployment from scratch — server, code, process
        manager, web server, TLS, domain — all of it together. What does that
        actually look like end to end?
difficulty: 2
tags:
  - troubleshooting
  - debugging
  - curl
  - ss
  - systemctl
  - nginx
  - '502'
  - connection-refused
category: practice
milestones:
  - Use a systematic checklist to diagnose why a web app is not responding
  - >-
    Distinguish between a 502 Bad Gateway and a Connection Refused error and
    know what causes each
  - 'Test each layer independently: app, Nginx, firewall, DNS'
---

Something is broken. Your site is not loading. You are getting 502 errors. The app crashed and did not come back. The page loads but CSS is missing.

The difference between a junior engineer and a senior one is not that the senior never encounters these problems. It is that the senior has a systematic approach for finding the problem instead of randomly changing things and hoping something works.

This is that approach.

<!-- DEEP_DIVE -->

**The golden rule: isolate each layer**

Your stack has multiple layers, and the problem is in exactly one of them. Test each layer independently to find which one:

```
Browser / curl request
    ↓ DNS resolves domain to IP
    ↓ Firewall: is port 80/443 open?
    ↓ Nginx: is it running? is config correct?
    ↓ App: is it running? is it listening on the right port?
    ↓ App logic: did the code throw an exception?
```

Work top-down or bottom-up, but check each layer in isolation.

**The diagnostic checklist**

**Step 1: Is the process running?**

```bash
# Check your app
sudo systemctl status mystore
# Look for: Active: active (running)
# If it says "failed" or "inactive", your app is not running

# Check Nginx
sudo systemctl status nginx
```

If the service is not running, check why it failed:
```bash
sudo journalctl -u mystore -n 50
# The last few lines will tell you why it crashed or failed to start
```

**Step 2: Is it listening on the expected port?**

```bash
sudo ss -tlnp | grep LISTEN
# Look for your app on 127.0.0.1:5000 (or whatever port)
# Look for Nginx on 0.0.0.0:80 and 0.0.0.0:443
```

If your app is running but not listening, the `ExecStart` command may be wrong (wrong path, wrong port) or the app crashed after starting.

**Step 3: Can you reach the app locally?**

```bash
# Test your app directly, bypassing Nginx
curl http://127.0.0.1:5000/

# If you get a response: the app is working, problem is in Nginx or above
# If you get "Connection refused": the app is not listening on that port
# If the request hangs: the app is listening but not responding (deadlock, overload)
```

**Step 4: Can Nginx reach the app?**

```bash
# Check Nginx config syntax
sudo nginx -t
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Check Nginx error log
sudo tail -20 /var/log/nginx/error.log

# Common Nginx errors:
# "connect() failed (111: Connection refused)" → app is not listening
# "no live upstreams" → app crashed
# "502 Bad Gateway" → Nginx can't talk to your app
```

**Step 5: Is the firewall the problem?**

```bash
# Check ufw rules
sudo ufw status

# Test from your laptop — does port 80 respond?
curl -v http://YOUR_SERVER_IP/
# If it hangs with no response: firewall is blocking it
# If you get a response: firewall is fine
```

**Common problems and their fixes**

**502 Bad Gateway**
```
Nginx is running, but cannot reach your app.
```
Fix: check if your app is running (`systemctl status`), check if it is listening on the port Nginx expects (`ss -tlnp`), check your Nginx `proxy_pass` port matches your app's port.

**Connection refused**
```
Nothing is listening on that port.
```
Fix: start your service (`systemctl start`), check the service logs to see why it is not running.

**403 Forbidden**
```
Nginx found the file/directory but does not have permission to read it.
```
Fix: check file ownership and permissions. Nginx runs as `www-data` user. Static files should be readable by `www-data`.

**App works locally but not through domain**
```
curl http://127.0.0.1:5000/ works
curl http://YOUR_DOMAIN/ does not
```
Fix: check DNS (has the record propagated?), check Nginx server_name matches your domain, check TLS cert is valid.

**App was working, now it is not (after code deploy)**
```
You deployed new code and the app stopped working.
```
Checklist:
- Did you restart the service? (`sudo systemctl restart mystore`)
- Did you install new dependencies? (`pip install -r requirements.txt`)
- Did the new code have a syntax error? (check `journalctl -u mystore -n 20`)
- Did an environment variable change?

**Debugging tool cheat sheet**

```bash
# Is the service running?
sudo systemctl status mystore
sudo systemctl status nginx

# What is listening?
sudo ss -tlnp

# Reach the app directly
curl http://127.0.0.1:5000/
curl -I http://127.0.0.1:5000/    # Just headers

# App logs
sudo journalctl -u mystore -f
sudo journalctl -u mystore -n 50

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Test Nginx config
sudo nginx -t

# Firewall status
sudo ufw status verbose

# Disk space (full disk causes mysterious failures)
df -h

# Memory (out of memory kills processes)
free -h

# What processes are consuming most resources
htop
```

**The mindset**

Do not randomly restart things hoping something fixes itself. Do not change multiple things at once. Change one thing, test it, then change the next.

When you find the problem, understand *why* it happened so you can prevent it. "The process crashed" is not an explanation. "The process crashed because it ran out of memory when loading a 2 GB CSV into RAM" is.

<!-- RESOURCES -->

- [DigitalOcean - Nginx Troubleshooting](https://www.digitalocean.com/community/tutorials/how-to-troubleshoot-common-nginx-errors) -- type: tutorial, time: 20m
- [ss command reference](https://man7.org/linux/man-pages/man8/ss.8.html) -- type: reference, time: 10m
