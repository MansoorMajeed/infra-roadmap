---
id: async-job-queues
title: Async Job Queues
zone: scaling
edges:
  to: []
difficulty: 2
tags:
  - queues
  - async
  - background-workers
  - sqs
  - rabbitmq
  - celery
  - message-queue
  - job-queue
  - scaling
category: concept
milestones:
  - Explain why doing slow work synchronously in a web request is a problem at scale
  - Know what a message queue is and what SQS and RabbitMQ are
  - Explain the producer/consumer pattern
  - Know what a Celery worker is and how it connects to a broker
  - Explain what at-least-once delivery means and why idempotency matters
  - Know what a dead-letter queue is and why every queue needs one
---

Some work doesn't belong in the HTTP request path. Sending a confirmation email, resizing an uploaded image, generating a PDF invoice, syncing to an external API — these are slow, often unreliable, and the user doesn't need to wait for them to finish before getting a response. Async job queues let you hand off slow work to background workers, respond immediately to the user, and process the work independently.

<!-- DEEP_DIVE -->

## The problem with synchronous slow work

In a synchronous request handler, every line of code runs before the HTTP response is sent. If sending an email takes 500ms and your web framework handles 100 concurrent requests, 100 workers might each be blocked waiting on email delivery simultaneously. A transient email service outage makes your entire web tier slow.

The pattern breaks in other ways too: if the request fails halfway through (network timeout, process killed), the slow operation might complete partially or not at all, leaving your system in an inconsistent state. You have no retry logic, no visibility into what's happening.

## The producer-consumer pattern

An async job queue introduces two roles:

- **Producer**: the web application. When a user completes checkout, the producer adds a job to the queue: "send confirmation email for order #12345." It does this in milliseconds, then returns the HTTP response to the user.
- **Consumer** (worker): a separate process that reads jobs from the queue and executes them. Workers run independently of the web tier and can be scaled separately.

```python
# Producer: in the checkout view (web process)
from tasks import send_confirmation_email
send_confirmation_email.delay(order_id=order.id)  # enqueues, returns immediately
return redirect("/order/confirmed")

# Consumer: in tasks.py (worker process)
@celery_app.task(bind=True, max_retries=3)
def send_confirmation_email(self, order_id):
    order = Order.objects.get(id=order_id)
    email.send(order.user.email, ...)  # the actual slow work
```

## Message queues: SQS, RabbitMQ

The queue is the communication channel between producers and consumers. Messages are placed in the queue by producers and consumed (and deleted) by consumers.

**SQS (AWS Simple Queue Service)**: a fully managed, serverless queue. Extremely simple to operate — no servers to manage, virtually unlimited scale. Supports standard queues (at-least-once delivery, best-effort ordering) and FIFO queues (exactly-once delivery, strict ordering). The default visibility timeout determines how long a consumed message is hidden from other consumers while being processed.

**RabbitMQ**: a self-hosted (or CloudAMQP-hosted) message broker. More powerful routing (exchanges, topic routing), better suited for complex publish/subscribe patterns. Requires operational effort to run. Use SQS if your patterns are simple enough to fit; reach for RabbitMQ when you need complex routing.

## Celery: Python's worker framework

Celery is the standard Python library for defining and executing background tasks. Workers connect to a broker (SQS, Redis, or RabbitMQ), read tasks, execute them, and report results.

Key Celery concepts:
- **Task**: a Python function decorated with `@celery_app.task`
- **Broker**: where tasks are queued (Redis is common for development; SQS for production)
- **Worker**: a process running `celery worker`, consuming tasks from the broker

Start workers with `celery worker -A myapp.celery -c 4` (4 concurrent workers per process).

## At-least-once delivery and idempotency

SQS guarantees **at-least-once delivery** — in rare cases (worker crashes mid-processing), a message may be delivered and processed more than once. If your task is "charge the customer," running it twice is a serious bug.

Design tasks to be **idempotent**: running them multiple times has the same effect as running them once. For a charge, check whether the payment already exists before creating it. For a confirmation email, track whether you've already sent it and skip if so.

## Dead-letter queues

When a task fails repeatedly (exceptions, timeouts), it shouldn't stay in the main queue forever. Configure a **dead-letter queue (DLQ)**: after a task fails N times, SQS moves it to the DLQ. Your monitoring watches the DLQ — items there need human review. Without a DLQ, failed tasks either retry forever (consuming worker capacity) or are silently dropped.

<!-- RESOURCES -->

- [AWS SQS Documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html) -- type: docs, time: 20m
- [Celery Documentation - Getting Started](https://docs.celeryq.dev/en/stable/getting-started/introduction.html) -- type: docs, time: 30m
- [SQS Dead-Letter Queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html) -- type: docs, time: 10m
