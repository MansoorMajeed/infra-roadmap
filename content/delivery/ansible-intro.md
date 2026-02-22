---
id: "ansible-intro"
title: "Configuration Management with Ansible"
zone: "delivery"
edges:
  from:
    - id: "iac-intro"
      question: "I want to understand how to configure servers with code before jumping into Terraform."
      detail: "Terraform provisions infrastructure, but something still has to configure what runs on it. Ansible is the dominant tool for this: it connects over SSH and applies configuration to servers using simple YAML playbooks."
  to:
    - id: "terraform-basics"
      question: "I understand Ansible for server configuration. Now I want to provision the infrastructure itself."
      detail: "Ansible can provision some infra, but Terraform is purpose-built for it and handles state much better. Knowing Ansible gives you a clearer appreciation for what Terraform does differently."
difficulty: 2
tags: ["ansible", "configuration-management", "automation", "playbooks", "idempotency"]
category: "tool"
milestones:
  - "Install Ansible and connect to a server via SSH"
  - "Write a playbook that installs a package and starts a service"
  - "Understand what idempotency means and why it matters in automation"
  - "Use variables and templates in a playbook"
---

Ansible connects to servers over SSH and applies configuration using YAML playbooks. No agent installed on the target server. No daemon running anywhere. Just SSH, Python on the remote host, and a YAML file describing what the server should look like.

It's the standard tool for "given a fresh server, make it ready to run my application."

<!-- DEEP_DIVE -->

## How Ansible works

Ansible is agentless. You run it from your local machine (or CI runner). It SSHes into each target server, transfers and runs a small Python script, applies your configuration, then disconnects.

The targets are defined in an **inventory** file:

```ini
[webservers]
web1.example.com
web2.example.com

[databases]
db1.example.com
```

Or a simple list:

```ini
[all]
192.168.1.100
192.168.1.101
```

## A playbook

A playbook is the unit of work in Ansible. It maps groups from your inventory to a list of tasks:

```yaml
---
- name: Configure web servers
  hosts: webservers
  become: true       # sudo

  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present
        update_cache: true

    - name: Copy nginx config
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-enabled/myapp.conf
      notify: Reload nginx

    - name: Enable and start nginx
      systemd:
        name: nginx
        enabled: true
        state: started

  handlers:
    - name: Reload nginx
      systemd:
        name: nginx
        state: reloaded
```

Run it:

```bash
ansible-playbook -i inventory.ini playbook.yml
```

Ansible connects to each `webserver` host, installs nginx, copies the config, and ensures the service is running.

## Idempotency

The key property of Ansible tasks is **idempotency**: running the same playbook twice produces the same result, with no unintended side effects the second time.

`apt: state: present` means "ensure nginx is installed." If it's already installed, Ansible does nothing. It doesn't reinstall it. It doesn't fail. It reports `ok` and moves on.

This is why Ansible (and IaC tools generally) use declarative language: you describe the desired state, not the steps to get there. The tool figures out whether anything needs doing.

Compare this to a shell script: `apt install nginx` fails with an error if nginx is already installed (unless you add `-y` and ignore errors). Shell scripts are not idempotent by default.

## Variables and templates

Variables make playbooks reusable across environments:

```yaml
vars:
  app_port: 8000
  app_name: myapp

tasks:
  - name: Configure app
    template:
      src: app.conf.j2
      dest: /etc/nginx/sites-enabled/{{ app_name }}.conf
```

Templates use Jinja2 syntax. `{{ app_port }}` in the template gets replaced with `8000` at runtime.

Variables can be defined in the playbook, in separate `group_vars/` files (per inventory group), or passed on the command line with `-e`. This lets you use the same playbook for staging and production, with different variable values.

## Roles

For larger setups, **roles** are reusable bundles of tasks, handlers, templates, and defaults. A role for `nginx` contains everything needed to install and configure it. You can share roles on Ansible Galaxy (the community registry) or write your own.

```yaml
roles:
  - nginx
  - myapp
  - monitoring
```

## Ansible vs shell scripts

Shell scripts get the job done but they're brittle: they fail on partial runs, aren't idempotent, and become unmaintainable as they grow. Ansible gives you the same capability with idempotency, error handling, and structure built in.

Shell scripts are still appropriate for simple one-time tasks. For recurring configuration management — servers that need to be kept in a defined state — Ansible is the right tool.

<!-- RESOURCES -->

- [Ansible Documentation: Getting Started](https://docs.ansible.com/ansible/latest/getting_started/index.html) -- type: reference, time: 20min
- [Ansible Galaxy](https://galaxy.ansible.com/) -- type: reference, time: 10min
