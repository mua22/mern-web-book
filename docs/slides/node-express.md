# Node & Express


## Node & Express

![Node.js](../slides/images/2400х1260-rw-blog-node-js.png)

---

## What is Node.js?

- JavaScript runtime
- Non-blocking I/O
- Event-driven

---

## Basic Express App

```js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello');
});
```

---

## Mermaid Example

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: GET /api/
    S-->>C: 200 OK
```
