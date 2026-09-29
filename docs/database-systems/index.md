---
title: Database Systems (CSC270) — Overview
tags:
  - CSC270
  - Overview
---

# Database Systems (CSC270)

**Credit hours:** 4 (3 lecture + 1 lab) · **Pre-requisite:** None
**Audience:** BS Computer Science, 4th semester

Database Systems takes you from "what is a database, really?" all the way to designing,
normalizing, querying, and safely transacting against one. You'll build a precise mental
model of the relational model and relational algebra, design real schemas with the
Entity-Relationship and Enhanced ER models, prove your designs are redundancy-free with
formal normalization, and see how a DBMS enforces correctness under concurrent access —
plus where a NoSQL database like MongoDB fits when the relational model isn't the right tool.

This book assumes no prior database experience. Every worked example is built from scratch,
and each new operator, notation, or proof technique is explained the first time it appears.

## Course objectives

- Explain the basic database concepts, information retrieval, and relational theory.
- Develop the relational data model.
- Develop an enterprise data model that reflects an organization's fundamental business rules.
- Apply normalization techniques.
- Discuss the basics of transaction management, concurrency control, query mechanisms, security, and quality issues.
- Apply database programming languages and physical database design.

## What you will be able to do (Course Learning Outcomes)

| CLO | You will be able to... | Bloom's level |
|---|---|---|
| CLO-1 | Explain database concepts and principles | Understanding |
| CLO-2 | Apply the concept of domain and tuple relational calculus | Applying |
| CLO-3 | Apply data modeling and normalization techniques to design a database for a small-to-medium enterprise | Applying |
| CLO-4 | Describe the principles of transaction management | Understanding |
| CLO-5 *(lab)* | Apply data processing operations on both relational and non-relational DBMS | Applying |
| CLO-6 *(lab)* | Develop a database system for a medium-size enterprise in a team environment | Creating |

## How the book is organized

The 32 lectures are grouped into 8 units, matching the official course description form.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Course progression</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Foundations</span>
<span class="db-node-sub">Units 1–3 · what a DBMS is, the relational model, algebra &amp; calculus</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Design</span>
<span class="db-node-sub">Units 4–5 · ER/EER modeling, normalization</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Build &amp; Operate</span>
<span class="db-node-sub">Units 6–8 · SQL views &amp; security, NoSQL, transactions</span>
</div>
</div>
</div>

| Unit | Topic | Lectures |
|---|---|---|
| 1 | [Foundations of Database Systems](lecture-01-introduction-to-databases-and-information-systems.md) | 1–4 |
| 2 | [The Relational Model](lecture-05-the-relational-model.md) | 5–6 |
| 3 | [Relational Algebra and Calculus](lecture-07-relational-algebra-unary-and-set-operations.md) | 7–10 |
| 4 | [Data Modeling: ER and EER](lecture-11-data-modeling-and-database-design.md) | 11–17 |
| 5 | [Normalization](lecture-18-normalization-purpose-and-concepts.md) | 18–22 |
| 6 | [Views, Security, and Indexing](lecture-23-views-and-materialized-views.md) | 23–25 |
| 7 | [NoSQL and MongoDB](lecture-26-introduction-to-nosql-databases.md) | 26–28 |
| 8 | [Transaction Management](lecture-29-database-transactions-and-acid-properties.md) | 29–32 |

## Assessment

Four quizzes and four assignments build toward the theory component, a midterm (lecture 17
is a dedicated review lecture) worth 25%, and a comprehensive final exam worth 50%. The lab
component is assessed separately, ending in a team lab project.

## Recommended books

- *Database Systems: A Practical Approach to Design, Implementation, and Management*, 6th ed. — Thomas Connolly & Carolyn Begg (Pearson, 2015)
- *MongoDB: The Definitive Guide*, 3rd ed. — Shannon Bradshaw, Eoin Brazil & Kristina Chodorow (O'Reilly, 2019)
- *Fundamentals of Database Systems* — Ramez Elmasri & Shamkant Navathe (Pearson, 2016)
- *Database System Concepts* — Abraham Silberschatz, Henry Korth & S. Sudarshan (McGraw Hill, 2019)

---

Ready? Start with **[Lecture 1 — Introduction to Databases and Information Systems](lecture-01-introduction-to-databases-and-information-systems.md)**.
