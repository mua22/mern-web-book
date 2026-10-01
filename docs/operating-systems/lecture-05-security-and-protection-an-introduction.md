---
title: "5. Security and Protection: An Introduction"
tags:
  - CSC323
  - Operating Systems
  - Security
  - Protection
  - Access Control
---

# 5. Security and Protection: An Introduction

Before this course gets into processes, scheduling, and memory, it's worth pausing on a
question that cuts across all of it: *who is allowed to do what to this system, and how
does the operating system enforce the answer?* Every mechanism covered later in this book —
every process, every open file, every shared segment of memory — is, from the OS's point of
view, a resource that something or someone might misuse, whether on purpose or by accident.
This lecture is a first, deliberately brief look at that concern. It is not the deep dive
into cryptography, authentication protocols, or access-control implementations that a
dedicated security course would give you — it is the vocabulary and the mental model you need
*before* the rest of this course starts handing you mechanisms (processes, files, shared
memory) that all, eventually, need protecting.

## In This Lecture

- The distinction between **protection** and **security** — two related but genuinely
  different concerns
- The **principle of least privilege**, and why it is the organizing idea behind almost
  every protection mechanism you will ever meet
- The general idea of an **access matrix**: domains (or subjects) against objects, with
  rights in between
- The basics of **authentication** — something you know, have, or are
- Why protection matters even on a machine with exactly one user

## Protection vs. Security

These two words get used almost interchangeably in casual conversation, but an operating
systems course needs to keep them separate, because they answer different questions.

**Protection** is about controlling access to resources *among entities that the system
already trusts to be running on it* — different processes, different user accounts, different
programs, all legitimately present on the same machine, and all needing to be kept from
accidentally or carelessly stepping on each other. Protection assumes everyone involved
*belongs* on the system; its job is to make sure that belonging doesn't translate into
unrestricted access to everything.

**Security** is about defending the system against threats that come from *outside* that
circle of trust — an attacker trying to break in, malware trying to run code it was never
authorized to run, a network intruder trying to read data that isn't theirs. Security is the
broader, adversarial problem: it assumes someone is actively trying to defeat the system's
defenses.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Protection vs. security — two different questions</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Protection</span>
<span class="db-node-sub">"These two trusted processes are both allowed on this machine — how do I stop one from corrupting the other's files by mistake?"</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Security</span>
<span class="db-node-sub">"Someone outside this system is actively trying to get in, steal data, or run code they were never given permission to run — how do I stop them?"</span>
</div>
</div>
</div>

!!! note "Protection mechanisms are security's building blocks"
    The two aren't unrelated — in practice, security *depends* on protection. A system with
    perfect protection (every process strictly confined to exactly the resources it needs)
    is much harder to compromise, because even a successfully-launched attack is stuck inside
    whatever narrow set of permissions the protection system grants it. Weak protection (every
    process can touch everything) turns even a minor security breach into a total one. This
    course introduces protection first, here, precisely because it underlies security rather
    than the other way around.

!!! tip "A quick test: is this a protection problem or a security problem?"
    Ask who the actors are. If every actor involved is already running legitimately on the
    machine and the question is "should *this* process/user be allowed to touch *that*
    resource," it's protection. If the question involves someone or something that doesn't
    belong on the system trying to get in or do damage anyway, it's security.

## Why Protection Matters Even on a Single-User System

It's tempting to think protection is only interesting on a shared, multi-user machine — a
university server with hundreds of student accounts, say. But protection matters even on a
laptop with exactly one human user and one account, for a simple reason: **a buggy program
is a threat too.**

A process doesn't have to be malicious to cause damage. A word processor with a pointer bug
that accidentally writes past the end of a buffer, a misconfigured script that recursively
deletes the wrong directory, or a runaway process that consumes every byte of available
memory are all, from the operating system's point of view, exactly the kind of problem
protection exists to contain — not because the program is an attacker, but because it is
*untrustworthy in practice*, regardless of intent. The OS can't tell the difference between
"a hostile process trying to overwrite another process's memory" and "a buggy process doing
the exact same thing by accident" — and it shouldn't need to. Sound protection stops both
with the same mechanism: by simply never letting either one touch memory it wasn't assigned
in the first place.

!!! warning "Trust is not the same as correctness"
    Even a program written entirely in good faith by a competent programmer, running under
    your own single user account, is not *correct* by virtue of being trusted. Protection's
    job is to limit the *damage* a process can do if it misbehaves, whether that misbehavior
    comes from an attacker, a bug, or a careless typo in a shell command — the resource being
    protected doesn't care which.

## The Principle of Least Privilege

If one idea organizes almost every protection mechanism you will encounter — in this course,
in later courses, and in real operating systems — it is the **principle of least privilege**:

> Every process, user, and program should operate with the *smallest* set of access rights
> necessary to accomplish its task, and no more.

A text editor needs to read and write the file you opened in it; it has no legitimate reason
to be able to read every other user's private files on the same machine, so a well-designed
system simply never grants it that ability in the first place. A print spooler needs access
to the printer queue; it has no business reading your email. Least privilege isn't about
distrusting any particular program — it's a default posture: grant the minimum, and widen
access only when a specific, justified need appears.

The benefit compounds in exactly the "buggy program" scenario above. If a process is
compromised or malfunctions while holding only the narrow set of permissions it actually
needs, the damage it can do is bounded by that narrow set. If the same process had been
granted broad, unnecessary permissions "just in case," the same bug or exploit now has the
run of the whole system.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Least privilege, applied to a simple example</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Without least privilege</span>
<span class="db-node-sub">A spell-checker process is given read/write access to the whole filesystem "to be safe"</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">With least privilege</span>
<span class="db-node-sub">The same process can only read/write the one document it was asked to check — a bug in it can't touch anything else</span>
</div>
</div>
</div>

## Access Control: The Idea of an Access Matrix

If least privilege says *what* should happen (grant the minimum), the operating system still
needs some concrete way to *represent* who is allowed to do what. The classic conceptual
model for this is the **access matrix**.

Picture a grid. The rows are **domains** (sometimes called *subjects*) — a domain is
whatever is requesting access: a user, or more precisely, a process running on that user's
behalf, since it's the process that actually issues the read or write. The columns are
**objects** — the resources worth protecting: files, devices, memory segments, even other
processes. Each cell at the intersection of a domain and an object lists the **access
rights** that domain holds over that object — `read`, `write`, `execute`, `delete`, and so
on.

<div class="db-diagram" markdown>
<p class="db-diagram-label">An access matrix — domains (rows) against objects (columns)</p>
<div class="db-relation" markdown>
<div class="db-relation-name">Access Matrix (conceptual example)</div>

| Domain | `report.docx` | `/etc/passwd`-equivalent | Printer | `payroll.db` |
|---|---|---|---|---|
| **Student user** | read, write | — | print | — |
| **Instructor user** | read | — | print | — |
| **System administrator** | read, write, delete | read, write | print | — |
| **Payroll process** | — | — | — | read, write |

</div>
</div>

This is the *idea*, not a specific implementation — real systems rarely store a literal,
giant, mostly-empty grid like this (the matrix is usually enormous and overwhelmingly
sparse). They instead store the same information column-by-column (an **access control
list** attached to each object, naming which domains may do what to it) or row-by-row (a
**capability list** attached to each domain, naming which objects it may touch and how). The
access matrix model matters here only as the mental picture underneath both of those real
implementations: *some domain, requesting some operation, on some object* — and the OS's job
is to look that triple up and allow or deny it. A full treatment of access control lists,
capabilities, and their trade-offs belongs to a dedicated security/protection course; this
lecture only needs you to recognize the shape of the question.

!!! note "A right is specific to one (domain, object) pair"
    Notice in the table above that the payroll process can read and write `payroll.db` while
    no ordinary user can touch it at all, and the student can write `report.docx` but has no
    rights whatsoever over the printer configuration or the system file. The access matrix
    doesn't grant blanket permissions — every cell is its own independent decision, which is
    exactly what makes it expressive enough to implement least privilege precisely.

## Authentication Basics

Access control only works if the system first knows, with reasonable confidence, *which*
domain is making a request — in other words, who is actually sitting at the keyboard or
running the process. That identification step is **authentication**, and it's conventionally
built from one or more of three categories of evidence:

- **Something you know** — a password, a PIN, the answer to a security question. Cheap to
  implement, but only as strong as the secret's unpredictability, and it can be guessed,
  stolen, or shared.
- **Something you have** — a physical token, a smart card, a phone receiving a one-time
  code. Harder to steal remotely than a password, but it can be physically lost or stolen.
- **Something you are** — a biometric: a fingerprint, a face, a retina scan. Hard to lose or
  forget, but it can't be changed if it's ever compromised the way a password can simply be
  reset.

!!! tip "Multi-factor authentication is just combining categories"
    "Multi-factor authentication" sounds more complex than it is: it simply means requiring
    evidence from *more than one* of these three categories before granting access — a
    password (something you know) plus a code sent to your phone (something you have), for
    instance. Combining categories matters more than piling up multiple pieces of evidence
    from the *same* category, because an attacker who defeats one category (guesses your
    password) still needs to separately defeat an entirely different one (steal your phone).

Authentication answers "who are you?" Access control (the matrix above) then answers "given
who you are, what are you allowed to do?" The two are sequential and both necessary — a
perfect access matrix is worthless if the system can be tricked about *whose* row to look
up, and a perfect authentication scheme is worthless if, once logged in, every domain is
simply granted access to everything.

## Key Takeaways

- **Protection** controls access among entities already trusted to be on the system;
  **security** defends the system against threats from outside that circle of trust —
  related, but genuinely different questions.
- Protection matters even on a single-user machine, because a buggy, non-malicious program is
  just as capable of damaging a resource as a malicious one, and the OS cannot (and need not)
  tell the difference.
- The **principle of least privilege** — grant the smallest set of rights needed, and nothing
  more — is the organizing idea behind essentially every protection mechanism you'll meet
  later in this course.
- An **access matrix** (domains/subjects × objects, with rights in each cell) is the
  conceptual model behind access control; real systems implement the same idea as access
  control lists or capability lists rather than a literal giant grid.
- **Authentication** establishes *who* is making a request, using something you know, have,
  or are (often combined); access control then decides *what* that identity is allowed to do.

This lecture deliberately stayed at the introductory level — the deeper mechanics of access
control lists, capabilities, and authentication protocols belong to a dedicated security
course. From here, this book turns to the OS's actual day-to-day work: managing the processes
that every one of these protection decisions exists to govern.

Next: **[Lecture 6 — Process Concept and Process States](lecture-06-process-concept-and-process-states.md)**.
