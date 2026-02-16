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
    - id: "databases-and-sql"
      question: "Where does my data actually live? Variables disappear when the app restarts."
      detail: "Your Flask app stores data in Python variables — lists, dictionaries, objects. But the moment you restart the app, everything is gone. Users, orders, cart items — all wiped. A database is a program specifically designed to store data permanently, organize it efficiently, and let you query it fast. Understanding databases is non-negotiable for anyone building or operating real software."
    - id: "apis-and-rest"
      question: "My frontend and backend are tangled together. How do different parts of a system talk to each other?"
      detail: "Your Flask app renders HTML templates directly — the backend generates the page and sends it to the browser. This works, but it means your backend is doing two jobs: handling business logic and building the UI. Modern applications separate these concerns with APIs — clean interfaces that let the frontend, mobile apps, other services, and even third parties interact with your backend through structured requests and responses."
    - id: "testing-basics"
      question: "How do I know my code actually works before I ship it?"
      detail: "You have been testing your app by running it, clicking around, and checking if things look right. That works when your app is small, but as it grows, manual testing becomes impossible. Did your new feature break checkout? Did changing that database query affect the search page? Automated tests catch these problems before your users do."
    - id: "version-control-git"
      question: "I keep overwriting my own code. How do I track changes?"
      detail: "As your application grows, you will inevitably break something that used to work. Without version control, you are flying blind — you cannot undo mistakes, compare what changed, or collaborate without stepping on each other's toes. Git solves all of these problems, and every professional software team on the planet uses it."
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
