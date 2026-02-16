---
id: "dynamic-web-app"
title: "Dynamic Web Applications"
zone: "building"
edges:
  from:
    - id: "static-site"
      question: "My site looks nice, but it can't actually do anything. How do I add real functionality?"
      detail: "A static site can display information beautifully, but it cannot remember users, process payments, or update content dynamically. For that, you need a backend — server-side code that handles logic, talks to a database, and responds to user actions. This is where you go from a digital brochure to a real application."
  to:
    - id: "it-works-on-my-laptop"
      question: "My app works locally. How do I let other people use it?"
      detail: "You have a working application on your laptop — a Flask app, a database, the whole thing. But it only works on localhost. Nobody else can access it. The moment you try to share it, you run into a wall: networking, servers, domains, ports. Getting from 'works on my machine' to 'works for everyone' is a fundamental challenge, and understanding it is the gateway to everything in DevOps and SRE."
difficulty: 1
tags: ["flask", "django", "backend", "database", "web-app", "python"]
category: "concept"
milestones:
  - "Run a Flask or Django app locally"
  - "Connect the app to a database (SQLite or PostgreSQL)"
  - "Build a feature that reads and writes data (e.g., user registration)"
---

Your static site looks great, but it cannot do anything real. It cannot remember who visited, cannot process a purchase, cannot store data. To build a real application — one that handles users, orders, and dynamic content — you need a backend: server-side code that runs on a machine, processes requests, and talks to a database.

<!-- DEEP_DIVE -->

A **dynamic web application** has two parts: a frontend (what users see in their browser) and a backend (server-side code that handles logic and data). When a user clicks "Add to Cart," the browser sends a request to your backend, which validates the item, updates the database, and sends back a response. This request-response cycle is the heartbeat of every web application.

**Flask** is the perfect starting point for Python developers. It is minimal, explicit, and teaches you exactly what is happening:

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

products = [
    {"id": 1, "name": "Widget A", "price": 10},
    {"id": 2, "name": "Widget B", "price": 20},
]

@app.route("/products")
def list_products():
    return jsonify(products)

@app.route("/order", methods=["POST"])
def place_order():
    data = request.json
    # In a real app, this would save to a database
    return jsonify({"status": "order placed", "item": data["product_id"]})

if __name__ == "__main__":
    app.run(debug=True)
```

Run `python app.py` and you have a web server listening on `http://localhost:5000`. Visit `/products` in your browser and you get JSON back. Send a POST to `/order` and it processes it. This is a real web service.

**Databases** are where your data lives permanently. SQLite is built into Python and perfect for learning — no setup required. For production, PostgreSQL is the standard. The key concepts are tables (structured data), queries (reading data), and transactions (writing data safely). An ORM like SQLAlchemy lets you work with databases using Python objects instead of writing raw SQL:

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(80), nullable=False)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    product_name = db.Column(db.String(120), nullable=False)
    total = db.Column(db.Float, nullable=False)
```

Now your store can actually remember things. Users can sign up, browse products, add items to a cart that persists, and place orders that are saved in a database.

**Django** is the other major Python web framework. Where Flask gives you building blocks and lets you choose your own architecture, Django gives you a complete package — admin panel, ORM, authentication, form handling — all built in. It is opinionated but incredibly productive. Many large-scale applications (Instagram, Pinterest, Disqus) were built with Django.

The pattern you are building here — a **monolith** — is a single application that handles everything: serving pages, processing business logic, managing the database. This is the right architecture when you are starting out. Microservices, APIs, and distributed systems come later. First, build something that works.

At this point, you have a working application. You can run `python app.py`, open your browser, and use your online store. It has products, users, a cart, checkout. Everything works. But there is one problem: it only works on `localhost`. It only works on your laptop. Nobody else in the world can use it. And that is where the next challenge begins.

<!-- RESOURCES -->

- [Flask Quickstart](https://flask.palletsprojects.com/en/stable/quickstart/) -- type: tutorial, time: 30m
- [Django Tutorial](https://docs.djangoproject.com/en/stable/intro/tutorial01/) -- type: tutorial, time: 4h
- [SQLAlchemy Tutorial](https://docs.sqlalchemy.org/en/stable/tutorial/) -- type: tutorial, time: 2h
- [Full Stack Python - Web Frameworks](https://www.fullstackpython.com/web-frameworks.html) -- type: reference, time: 30m
