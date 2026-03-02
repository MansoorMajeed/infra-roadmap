---
id: regular-expressions
title: Regular Expressions
zone: foundations
edges:
  to:
    - id: text-processing
      question: I can match patterns — now how do I use them to transform text, not just find it?
      detail: >-
        grep with regex is great for finding things, but I want to do more —
        extract a field from each line, replace a value across a file, strip
        out parts I don't care about. The pattern knowledge I have now should
        work for that, right? What are the tools that let me actually modify
        and reshape text?
difficulty: 2
tags:
  - regex
  - regular-expressions
  - grep
  - pattern-matching
  - shell
category: concept
milestones:
  - Write a regex that matches IP addresses, timestamps, and HTTP status codes
  - Use character classes, anchors, and quantifiers correctly
  - Explain the difference between basic and extended regex
---

You have been writing patterns in grep and they mostly work, but it feels like guessing. Regular expressions are the formal language behind those patterns — a compact syntax for describing what text looks like. Once you understand the rules, you can write patterns confidently instead of copying them from Stack Overflow and hoping for the best. In SRE work, regex comes up constantly: searching logs, writing alerts, parsing output, validating config.

<!-- DEEP_DIVE -->

## The building blocks

A regular expression is a pattern that describes a set of strings. At its simplest, a literal string like `error` matches any line containing the word "error". The power comes from special characters that match *classes* of text.

**The dot `.`** matches any single character. `er.or` matches "error", "er_or", "er3or" — anything with two characters between `er` and `or`.

**Quantifiers** — how many times something repeats:

- `*` — zero or more. `er.*or` matches "error", "eror", "erXXXXor", even "eror" with nothing in between.
- `+` — one or more. `er.+or` requires at least one character between them.
- `?` — zero or one. `https?://` matches both "http://" and "https://".
- `{3}` — exactly 3. `[0-9]{3}` matches exactly three digits.
- `{2,4}` — between 2 and 4.

**Character classes `[]`** — match one character from a set:

- `[0-9]` — any digit
- `[a-z]` — any lowercase letter
- `[A-Za-z]` — any letter
- `[A-Za-z0-9]` — any alphanumeric character
- `[^0-9]` — any character that is **not** a digit (the `^` inside brackets means "not")

**Shorthand character classes** (with `grep -P` or in most regex engines):

- `\d` — digit (same as `[0-9]`)
- `\w` — word character (letter, digit, or underscore)
- `\s` — whitespace (space, tab, newline)

**Anchors** — position, not characters:

- `^` — start of line. `^ERROR` only matches lines that **begin** with ERROR.
- `$` — end of line. `\.log$` matches lines ending with `.log`.

**Alternation `|`** — this or that. `ERROR|WARN|FATAL` matches any of the three. Requires `grep -E` (extended regex).

**Grouping `()`** — group parts of a pattern. `(ERROR|WARN): ` matches either word followed by a colon and space. Also used for capturing in tools like sed and awk.

**Escaping `\`** — to match a literal special character, escape it. `\.` matches a literal dot (not any character). `\(` matches a literal parenthesis.

## grep -E vs grep -P

By default `grep` uses basic regex, where `+`, `?`, `|`, `()`, and `{}` need to be escaped with `\` to have special meaning — backwards from what you'd expect. Use `grep -E` (extended regex) to avoid this. Most people use `-E` by default.

`grep -P` enables Perl-compatible regex (PCRE), which adds `\d`, `\w`, `\s`, lookaheads, and other features. Not available on all systems (macOS `grep` doesn't support it; use `ggrep` from Homebrew).

## Practical patterns for SRE

```bash
# Match an IPv4 address
grep -E "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"

# Match HTTP 5xx status codes in nginx logs
grep -E '" 5[0-9]{2} '

# Match lines with a timestamp in [2024-01-15 10:23:45] format
grep -E "\[[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\]"

# Find lines that start with ERROR or FATAL
grep -E "^(ERROR|FATAL)"

# Find log lines that do NOT contain "healthcheck"
grep -v "healthcheck"

# Find config lines that aren't comments or empty
grep -E "^[^#]" /etc/myapp/config.conf | grep -v "^$"
```

## Common mistakes

**Matching too much.** `.*` is greedy — it matches as much as possible. `error.*timeout` can match a huge chunk of a line. Be more specific when you can.

**Forgetting anchors.** `error` matches anywhere in the line, including "no-error" and "erroring". Use `^error` if you only want lines starting with it, or `\berror\b` (word boundary) if you want the whole word.

**Special characters in data.** IP addresses contain dots, log paths contain slashes, URLs contain question marks. If you are matching literal text, escape the special characters: `192\.168\.1\.1` not `192.168.1.1` (which would match "192X168Y1Z1" too).

**Case sensitivity.** grep is case-sensitive by default. Use `-i` when case doesn't matter.

## Building patterns incrementally

Do not try to write a complex regex in one go. Start simple and refine:

```bash
# Start: find lines with "payment"
grep "payment" /var/log/myapp/app.log

# Refine: only failed payments
grep "payment.*failed" /var/log/myapp/app.log

# Refine more: only lines where it's a specific error code
grep -E "payment.*failed.*code=[0-9]+" /var/log/myapp/app.log

# Check your count
grep -cE "payment.*failed.*code=[0-9]+" /var/log/myapp/app.log
```

Test each step. Regex is much easier to write and debug incrementally than all at once.

<!-- RESOURCES -->

- [Regexr - Interactive regex tester with explanation](https://regexr.com/) -- type: tool, time: 30m
- [Regular-Expressions.info - Comprehensive reference](https://www.regular-expressions.info/) -- type: reference, time: varies
- [RegexOne - Learn by doing](https://regexone.com/) -- type: tutorial, time: 1h
- [grep manual - regex section](https://www.gnu.org/software/grep/manual/grep.html#Regular-Expressions) -- type: reference, time: 20m
