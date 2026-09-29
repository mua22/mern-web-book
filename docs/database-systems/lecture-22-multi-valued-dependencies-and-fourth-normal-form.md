---
title: "22. Multi-Valued Dependencies and Fourth Normal Form"
tags:
  - CSC270
  - Normalization
  - 4NF
  - Multi-Valued Dependencies
---

# 22. Multi-Valued Dependencies and Fourth Normal Form

Every normal form through BCNF is built entirely out of **functional** dependencies — one
value determining another, single value. But some redundancy has nothing to do with a
functional dependency at all, and a relation can be in perfect BCNF while still storing the
same fact many times over. This lecture introduces a second, independent kind of
dependency — the **multi-valued dependency (MVD)** — and the normal form built to eliminate
the redundancy it causes: **Fourth Normal Form (4NF)**. The running example is the single
most famous illustration in this whole topic: an employee with independent sets of skills
and languages, and the spurious combinations that appear the moment you store both facts in
one table.

## In This Lecture

- Why BCNF alone doesn't catch every source of redundancy
- Multi-valued dependencies: formal notation $X \twoheadrightarrow Y$ and the intuition behind it
- Trivial vs. non-trivial MVDs
- Properties of MVDs, and how every FD is secretly also an MVD
- Inference rules for MVDs, parallel to Armstrong's Axioms
- Fourth Normal Form: definition and test
- A complete worked example: Employee, Skills, and Languages, anomaly and all
- 4NF decomposition and confirming the lossless-join property

## Where BCNF Falls Short

Consider a relation recording, for each employee, every skill they have *and* every
language they speak — two completely independent facts about the same employee:

<div class="db-relation" markdown>
<div class="db-relation-name">EmpSkillsLangs (empNo, skill, language)</div>

| empNo | skill | language |
|---|---|---|
| E1 | Java | English |
| E1 | Java | Urdu |
| E1 | Python | English |
| E1 | Python | Urdu |
| E2 | SQL | English |

</div>

There is no non-trivial *functional* dependency here at all: `empNo` does not determine a
single `skill` (E1 has two), `skill` does not determine `language`, and no other single
attribute or pair determines a third. Since there are no non-trivial FDs whose determinant
fails the superkey test, this relation is *already* in BCNF — the only candidate key is
`{empNo, skill, language}` itself (an all-key relation), and an all-key relation has no
FD-based violation possible. And yet the redundancy staring back at you is obvious: E1's two
skills and two languages have been cross-multiplied into **four** rows, when the actual
information content is just "E1 knows Java and Python" plus "E1 speaks English and Urdu" —
two independent one-to-many facts, not four correlated ones.

!!! warning "The spurious combination, made concrete"
    Read the four `E1` rows as claims and the problem is immediate: row 2 claims "E1's Java
    skill is specifically paired with Urdu," and row 3 claims "E1's Python skill is
    specifically paired with English." Neither claim means anything — skill and language
    were never actually linked for this employee, they're just two unrelated attributes
    that got forced into the same row together. If E1 later learns French, correctness
    demands inserting **two** new rows (`Java, French` and `Python, French`), and forgetting
    either one leaves the table in an inconsistent state where "does E1 speak French" has a
    different answer depending which row you check. BCNF has no mechanism to see this
    problem, because BCNF only ever looks at functional dependencies, and there isn't one
    here.

This is precisely the gap Fourth Normal Form exists to close.

## Multi-Valued Dependencies

A **multi-valued dependency**, written $X \twoheadrightarrow Y$ (read "X multi-determines
Y") over a relation $R$ with attributes $X, Y, Z$ (where $Z = R - X - Y$), holds when: for
every value of $X$, the set of $Y$-values associated with it is **completely independent**
of the $Z$-values in that row — knowing $Z$ tells you nothing about which $Y$-values are
possible, and vice versa.

Formally: whenever two tuples $t_1$ and $t_2$ of $R$ agree on $X$, $R$ must also contain a
tuple that takes $t_1$'s $X$ and $Y$ values combined with $t_2$'s $Z$ value (and,
symmetrically, one taking $t_2$'s $X,Y$ with $t_1$'s $Z$). In `EmpSkillsLangs`:
$empNo \twoheadrightarrow skill$ — for a fixed `empNo`, the set of associated `skill`
values (`{Java, Python}` for E1) is completely independent of `language`; whichever
languages E1 speaks, the same two skills apply to all of them, and vice versa. By the same
argument, $empNo \twoheadrightarrow language$ holds too, and in fact whenever
$X \twoheadrightarrow Y$ holds over $\{X,Y,Z\}$, so does $X \twoheadrightarrow Z$ — this
pairing is not a coincidence, it's a theorem (the **complementation rule**, below).

!!! tip "The intuitive test: 'does knowing one extra fact change the possibilities?'"
    Ask: for a fixed employee, does knowing *which language* they speak change *which
    skills* are possible for them? If the honest answer is "no, the two lists are just
    independently attached to the same employee," you have a multi-valued dependency. The
    moment the two lists genuinely interact — say, "E1's Java certification is specifically
    an English-language certification, but their Python certification is Urdu-language" —
    the independence breaks, the MVD no longer holds, and cross-multiplying rows would no
    longer be spurious.

### Trivial and Non-Trivial MVDs

- An MVD $X \twoheadrightarrow Y$ is **trivial** if $Y \subseteq X$, or if
  $Y \cup X = R$ (all attributes of $R$). A trivial MVD holds automatically in *every*
  relation and carries no design information — it doesn't tell you anything is wrong.
- An MVD is **non-trivial** if neither condition holds — $Y$ is not a subset of $X$, and
  $X \cup Y$ does not already cover every attribute of $R$. Only non-trivial MVDs are
  candidates for a 4NF violation, exactly the same way only non-trivial FDs mattered for
  3NF and BCNF.

In `EmpSkillsLangs`, $empNo \twoheadrightarrow skill$ is non-trivial: `skill` is not a
subset of `empNo`, and `{empNo, skill}` does not cover `language` — the third attribute.
That non-triviality is exactly why it is a genuine design problem, not a footnote.

### Properties of MVDs

- **Every FD is an MVD** (but not the other way around). If $X \rightarrow Y$ holds, then
  for a fixed $X$ there's *exactly one* $Y$ value — trivially "independent" of $Z$, since
  there's no choice left to be independent about. So functional dependency is a strict
  special case of multi-valued dependency: $X \rightarrow Y \implies X \twoheadrightarrow Y$.
- MVDs, unlike FDs, always come in a **complementary pair** over a fixed relation:
  $X \twoheadrightarrow Y$ holding over $\{X, Y, Z\}$ if and only if
  $X \twoheadrightarrow Z$ also holds. This is why `EmpSkillsLangs` shows both
  $empNo \twoheadrightarrow skill$ and $empNo \twoheadrightarrow language$ — they are the
  same underlying fact, viewed from each side.
- Checking an MVD requires looking at the **whole relation**, not just candidate keys — MVDs
  are a statement about which combinations of rows must exist, so (unlike an FD) you cannot
  verify one from a single row-pair comparison in general; you need the full complementary
  structure to hold consistently across every value of $X$.

### Inference Rules for MVDs

Just as Armstrong's Axioms let you derive new FDs from a given set, a parallel set of
inference rules lets you derive new MVDs (and mix MVDs with FDs):

| Rule | Statement |
|---|---|
| **Complementation** | If $X \twoheadrightarrow Y$ holds over $R$, then $X \twoheadrightarrow (R - X - Y)$ also holds. |
| **Augmentation** | If $X \twoheadrightarrow Y$ holds and $W \supseteq Z$, then $WX \twoheadrightarrow YZ$ holds. |
| **Transitivity** | If $X \twoheadrightarrow Y$ and $Y \twoheadrightarrow Z$ both hold, then $X \twoheadrightarrow (Z - Y)$ holds. |
| **Replication (FD → MVD)** | If $X \rightarrow Y$ holds, then $X \twoheadrightarrow Y$ holds. |
| **Coalescence** | If $X \twoheadrightarrow Y$ holds, and there is a $W$ with $W \cap Y = \emptyset$ and $W \rightarrow Z$ for some $Z \subseteq Y$, then $X \rightarrow Z$ also holds. |

These rules exist for the same reason Armstrong's Axioms do: to let you derive every MVD
implied by a given set without brute-force checking every possible tuple pattern by hand.
For this course, recognizing complementation on sight (the pair always comes together) and
knowing that every FD is automatically an MVD are the two facts you'll use most often.

## Fourth Normal Form (4NF)

A relation $R$ is in **Fourth Normal Form** if, for every non-trivial multi-valued
dependency $X \twoheadrightarrow Y$ that holds over $R$, $X$ is a **superkey** of $R$. This
is a direct, deliberate parallel to the BCNF definition — replace "functional dependency"
with "multi-valued dependency" and the wording is otherwise identical. Since every FD is
also an MVD (replication, above), **4NF implies BCNF** — checking 4NF automatically re-checks
every BCNF condition too, plus the MVD-specific ones BCNF cannot see.

!!! note "4NF's relationship to BCNF"
    Every relation in 4NF is automatically in BCNF, because BCNF-violating FDs are also
    MVD-violations under 4NF's test. The reverse is false, as `EmpSkillsLangs` proves: it is
    in BCNF (no FD violation exists) but **not** in 4NF (`empNo` is not a superkey, yet
    `empNo` ↠ `skill` is a genuine non-trivial MVD). 4NF is strictly the next, stronger step
    after BCNF in the normal-form hierarchy.

### Testing EmpSkillsLangs Against 4NF

The candidate key of `EmpSkillsLangs(empNo, skill, language)` is the full attribute set
`{empNo, skill, language}` (no smaller combination determines the rest, functionally). The
non-trivial MVD $empNo \twoheadrightarrow skill$ has determinant `{empNo}`, which is
nowhere close to a superkey — it's a single attribute out of three, and it does not even
functionally determine `skill` (E1 has two skill values). **`EmpSkillsLangs` violates 4NF.**

## 4NF Decomposition

The decomposition rule mirrors BCNF's exactly, but splits on the violating MVD rather than
an FD: given $R$ violating 4NF via non-trivial $X \twoheadrightarrow Y$, replace $R$ with

- $R_1 = X \cup Y$
- $R_2 = X \cup Z$, where $Z = R - X - Y$

Applying this to `EmpSkillsLangs` with $X$ = `{empNo}`, $Y$ = `{skill}`,
$Z$ = `{language}`:

<div class="db-diagram" markdown>
<p class="db-diagram-label">4NF Split of EmpSkillsLangs on empNo ↠ skill</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">EmpSkillsLangs</span><span class="db-node-sub">(empNo, skill, language) — 4NF violation</span></div>
<div class="db-arrow"></div>
</div>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">EmpSkills</span><span class="db-node-sub">(empNo, skill)</span></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">EmpLanguages</span><span class="db-node-sub">(empNo, language)</span></div>
</div>
</div>

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">EmpSkills (<u>empNo, skill</u>)</div>

| empNo | skill |
|---|---|
| E1 | Java |
| E1 | Python |
| E2 | SQL |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">EmpLanguages (<u>empNo, language</u>)</div>

| empNo | language |
|---|---|
| E1 | English |
| E1 | Urdu |
| E2 | English |

</div>
</div>

Notice exactly what happened to the row count: the original relation needed **five** rows
(four for E1 alone, cross-multiplied) to represent information that these two tables
together represent in **five** rows total, but with zero spurious pairing — `EmpSkills` says
only "E1 knows Java and Python," `EmpLanguages` says only "E1 speaks English and Urdu,"
and neither table claims any specific skill-language pairing exists, because none does.
Adding a third skill for E1 now costs exactly **one** new row in `EmpSkills`, not two.

### Checking Each Piece is in 4NF

`EmpSkills(empNo, skill)`: the only candidate key is `{empNo, skill}` itself (an all-key
relation, two attributes). Any MVD over a two-attribute relation is automatically trivial
($Y \subseteq X$ or $X \cup Y = R$ — there's no third attribute left for $Y$ to be
"independent" of). **4NF — trivially satisfied.** The identical argument applies to
`EmpLanguages(empNo, language)`. Both final relations pass.

### Lossless-Join Property, Confirmed

Natural-join `EmpSkills` ⋈ `EmpLanguages` on `empNo` and you get back exactly the
cross-product per employee — which is precisely what the original table held:

```text
EmpSkills ⋈ EmpLanguages  (on empNo)
-------------------------------------
empNo | skill  | language
E1    | Java   | English
E1    | Java   | Urdu
E1    | Python | English
E1    | Python | Urdu
E2    | SQL    | English
```

Five rows, matching `EmpSkillsLangs` exactly, row for row. This is *always* true for a 4NF
split done correctly — the same underlying theorem that guarantees BCNF splits are lossless
extends to MVD-based splits: **Fagin's theorem** states that $R$ decomposes losslessly into
$R_1 = XY$ and $R_2 = XZ$ if and only if $X \twoheadrightarrow Y$ (equivalently
$X \twoheadrightarrow Z$) holds over $R$ — which is exactly the condition we split on. The
join reconstructs the cross-product deliberately, because that cross-product *is* the
correct, complete information — it's only wrong when it's stored as five physical rows with
no room to represent "which pairings, if any, are real," which four attributes crammed into
one relation could never distinguish from four independently-arising rows anyway.

!!! tip "4NF doesn't reduce information, it removes a physical redundancy"
    The decomposed pair still *represents* every skill-language combination when joined —
    nothing is lost. What's eliminated is the need to *physically store* $|skills| \times
    |languages|$ rows per employee just to express two independent one-to-many facts, and
    the update anomaly that came with it (forgetting one of the two required new rows when
    E1 learns French).

## Try It Yourself

1. A relation `ProjectResources(projectNo, employeeNo, equipmentNo)` records that a project
   uses certain employees and, independently, certain pieces of equipment — no employee is
   tied to any particular piece of equipment, they're just both attached to the same
   project. Identify the non-trivial MVD(s), confirm the relation violates 4NF, and produce
   the 4NF decomposition.
2. Explain, using the complementation rule, why finding $empNo \twoheadrightarrow skill$
   in `EmpSkillsLangs` was enough to also conclude $empNo \twoheadrightarrow language$
   holds — you should not need to re-derive it from scratch.
3. A relation has attributes $\{A, B\}$ only, nothing else. Explain why *no* non-trivial MVD
   can ever exist over a two-attribute relation, tying your answer back to the definition of
   "trivial."

## Key Takeaways

- A **multi-valued dependency** $X \twoheadrightarrow Y$ says that, for a fixed $X$, the set
  of associated $Y$-values is completely independent of every other attribute — a broader
  notion than a functional dependency, which every FD satisfies as a special case.
- MVDs always arrive in a **complementary pair**: $X \twoheadrightarrow Y$ over $\{X,Y,Z\}$
  if and only if $X \twoheadrightarrow Z$.
- An MVD is **trivial** if $Y \subseteq X$ or $X \cup Y = R$; only **non-trivial** MVDs can
  violate 4NF, exactly mirroring the trivial/non-trivial distinction for FDs and BCNF.
- **4NF** requires every non-trivial MVD's determinant to be a superkey — the same shape of
  rule as BCNF, one level stronger, and 4NF therefore always implies BCNF.
- The classic anomaly — an `EmpSkillsLangs` relation cross-multiplying two independent
  multi-valued facts into spurious row combinations — is fixed by splitting into
  `EmpSkills(empNo, skill)` and `EmpLanguages(empNo, language)`, a decomposition guaranteed
  lossless by Fagin's theorem.
- 4NF decomposition removes physical redundancy and the update anomalies it causes; it does
  not remove any information the joined relations can express.

Lecture 21 built the general BCNF decomposition algorithm this lecture's MVD split directly
parallels — see
[Lecture 21, BCNF Schema Design by Decomposition](lecture-21-bcnf-schema-design-by-decomposition.md)
if the split-and-retest pattern here felt familiar. Lecture 23 moves away from
normalization entirely, into views and materialized views as tools for presenting a
normalized schema conveniently to applications and users.
