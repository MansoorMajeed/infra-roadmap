---
id: "static-site"
title: "Building a Static Website"
zone: "building"
edges:
  from:
    - id: "scripting-bash-python"
      question: "Scripts are great, but I want to build something people can actually see."
      detail: "You can automate tasks with scripts, but at some point you want to build something visible — a website, an app, something you can share with people. The jump from scripts to building for the web starts with understanding how HTML, CSS, and JavaScript come together to create what users see in their browser."
  to:
    - id: "dynamic-web-app"
      question: "My site looks nice, but it can't actually do anything. How do I add real functionality?"
      detail: "My static site looks great but it's basically a fancy brochure. I want users to be able to log in, submit forms, see personalized content — things that require actually remembering something. I have no idea how to make a webpage do that."
difficulty: 1
tags: ["html", "css", "javascript", "static-site", "web-basics"]
category: "concept"
milestones:
  - "Build a static HTML page with CSS styling"
  - "Add JavaScript interactivity to the page"
  - "Deploy it somewhere basic (GitHub Pages, Netlify)"
---

You know how to write scripts that automate tasks. Now you want to build something people can actually see and use — a website. Maybe you have an idea for an online store, a portfolio, or a tool. It all starts the same way: HTML for structure, CSS for styling, and JavaScript for interactivity. This is the foundation of everything on the web.

<!-- DEEP_DIVE -->

A **static website** is a collection of files — HTML, CSS, JavaScript, images — that a browser downloads and renders directly. There is no server-side logic, no database, no processing. The server just hands over files, and the browser does all the work. This is how the web started, and it is still how a huge portion of the internet works today.

**HTML** (HyperText Markup Language) is the skeleton. It defines what is on the page — headings, paragraphs, images, links, forms. Here is the simplest possible webpage:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Online Store</title>
</head>
<body>
    <h1>Welcome to My Store</h1>
    <p>We sell the finest widgets.</p>
    <ul>
        <li>Widget A - $10</li>
        <li>Widget B - $20</li>
        <li>Widget C - $30</li>
    </ul>
</body>
</html>
```

Save that as `index.html`, open it in a browser, and you have a website. It is ugly, but it works.

**CSS** (Cascading Style Sheets) makes it look good. Colors, fonts, layout, spacing — all CSS. You can add it inline, in a `<style>` tag, or in a separate `.css` file. Modern CSS is incredibly powerful — you can build responsive layouts that work on phones and desktops, add animations, and create professional-looking designs without any JavaScript.

**JavaScript** adds behavior. Want a button that does something when clicked? A form that validates input? A product filter? That is JavaScript. It runs in the browser and can manipulate the HTML and CSS dynamically.

For an online store idea, you can get surprisingly far with just static files. You can list products, show images, even build a nice shopping cart UI with JavaScript. But here is the catch — none of it is real. There is no backend to process orders, no database to store users, no way to handle payments. The cart exists only in the browser, and refreshing the page might lose everything. The store looks functional, but it is a facade.

This is the exact moment most developers hit their first real architectural decision: the static site looks great, but it cannot actually do the thing it needs to do. You need a backend. You need a database. You need a dynamic web application.

**Deploying a static site** is almost trivially easy. GitHub Pages lets you push HTML files to a repository and they are live on the internet. Netlify and Vercel do the same with drag-and-drop. This is worth doing early — seeing your creation live on a real URL is motivating, and it teaches you the deployment cycle that you will use for the rest of your career.

<!-- RESOURCES -->

- [MDN Web Docs - HTML Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics) -- type: tutorial, time: 1h
- [MDN Web Docs - CSS First Steps](https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps) -- type: tutorial, time: 2h
- [JavaScript.info - The Modern JavaScript Tutorial](https://javascript.info/) -- type: tutorial, time: varies
- [GitHub Pages Documentation](https://pages.github.com/) -- type: tool, time: 15m
