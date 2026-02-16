---
id: "testing-basics"
title: "Testing Your Code"
zone: "building"
edges:
  from:
    - id: "dynamic-web-app"
      question: "How do I know my code actually works before I ship it?"
      detail: "You have been testing your app by running it, clicking around, and checking if things look right. That works when your app is small, but as it grows, manual testing becomes impossible. Did your new feature break checkout? Did changing that database query affect the search page? Automated tests catch these problems before your users do."
  to:
    - id: "it-works-on-my-laptop"
      question: "My code is tested and I'm confident it works. Now how do I run it somewhere real?"
      detail: "You have tests that verify your code works. Locally, you run pytest and everything passes. But tests on your laptop do not guarantee the app works in production. Different environments, different databases, different configurations — deploying means making your tested code run reliably on someone else's machine."
difficulty: 1
tags: ["testing", "unit-tests", "integration-tests", "pytest", "tdd"]
category: "concept"
milestones:
  - "Write unit tests for a Python function using pytest"
  - "Write an integration test that tests an API endpoint end-to-end"
  - "Understand the testing pyramid: unit, integration, and end-to-end tests"
---

You changed one function and broke three other features. You did not know until a user reported it two days later. The fix took five minutes, but the debugging took two hours. Automated tests would have caught it in seconds — before the code ever left your laptop.

<!-- DEEP_DIVE -->

**Automated testing** means writing code that tests your code. Instead of manually clicking through your app, you write functions that call your code, check the results, and tell you if something is wrong. Tests run in seconds and catch regressions (things that used to work but broke) immediately.

**pytest** is the standard testing framework for Python. A test is just a function that starts with `test_`:

```python
# calculator.py
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

```python
# test_calculator.py
import pytest
from calculator import add, divide

def test_add_basic():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0

def test_divide_basic():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)
```

```bash
# Run the tests
$ pytest test_calculator.py -v
test_calculator.py::test_add_basic PASSED
test_calculator.py::test_add_negative PASSED
test_calculator.py::test_divide_basic PASSED
test_calculator.py::test_divide_by_zero PASSED

4 passed in 0.02s
```

**The testing pyramid** describes three levels of tests:

**Unit tests** are at the base — small, fast, and numerous. They test a single function or class in isolation. If your `calculate_tax()` function is wrong, a unit test catches it immediately. They run in milliseconds and you should have hundreds of them:

```python
def test_calculate_tax():
    assert calculate_tax(100, rate=0.08) == 8.0
    assert calculate_tax(0, rate=0.08) == 0.0
    assert calculate_tax(100, rate=0) == 0.0
```

**Integration tests** are in the middle — they test how components work together. Does your API endpoint correctly query the database and return the right response? These are slower because they involve real databases, HTTP requests, or file systems:

```python
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app(testing=True)
    with app.test_client() as client:
        yield client

def test_create_user(client):
    response = client.post("/api/users", json={
        "name": "Alice",
        "email": "alice@example.com"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "Alice"

def test_get_nonexistent_user(client):
    response = client.get("/api/users/999")
    assert response.status_code == 404
```

**End-to-end (E2E) tests** are at the top — they test the entire system from the user's perspective. A browser automation tool clicks through your app just like a real user would. They are slow, flaky, and expensive, so you write fewer of them — just enough to verify the critical paths (signup, checkout, login).

**What to test and what not to:**

- **Test:** Business logic, edge cases, error handling, data transformations
- **Test:** API contracts (correct status codes, response shapes)
- **Don't test:** Framework internals (Flask's routing, SQLAlchemy's query builder)
- **Don't test:** Trivial getters/setters with no logic

**Fixtures** in pytest set up the context your tests need — a database connection, a test client, sample data:

```python
@pytest.fixture
def sample_user():
    return {"name": "Alice", "email": "alice@example.com"}

def test_user_has_email(sample_user):
    assert "@" in sample_user["email"]
```

**Why SREs care:** Tests are the first line of defense against outages. A comprehensive test suite means changes can be deployed with confidence. In SRE culture, tests are part of the deployment pipeline — if tests fail, the deployment stops. You will also write tests for infrastructure code (Terraform modules, Ansible playbooks, monitoring rules). The concept is the same: verify that things work before they hit production.

<!-- RESOURCES -->

- [pytest Documentation](https://docs.pytest.org/en/stable/) -- type: reference, time: varies
- [Python Testing with pytest (book)](https://pragprog.com/titles/bopytest2/python-testing-with-pytest-second-edition/) -- type: book, time: varies
- [Testing Flask Applications](https://flask.palletsprojects.com/en/stable/testing/) -- type: tutorial, time: 30m
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) -- type: article, time: 30m
