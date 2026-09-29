---
title: "21. BCNF Schema Design by Decomposition"
tags:
  - CSC270
  - Normalization
  - BCNF
  - Schema Design
---

# 21. BCNF Schema Design by Decomposition

Lecture 20 gave you the tools to *detect* a BCNF violation: write down the functional
dependencies, compute an attribute closure, and check whether every determinant is a
candidate key. Detection is only half the job. This lecture supplies the other half — a
mechanical, repeatable **algorithm** that takes a relation failing BCNF and produces a set
of smaller relations that each pass, while (almost always) preserving every fact the
original relation could represent. We'll run that algorithm end to end on a single realistic
example, watch it iterate more than once, and then confront the one real cost of BCNF
decomposition that Lecture 20 only mentioned in passing: it can lose **dependency
preservation**, something 3NF synthesis never sacrifices.

## In This Lecture

- The formal BCNF Decomposition Algorithm, stated as a repeatable loop
- How to identify *which* FD to split on when a relation has several violations
- Why every split must be checked for the lossless-join property, and how to check it
- Re-applying the Lecture 20 closure test to each new, smaller relation
- A complete, multi-step worked example, iterated until every piece is in BCNF
- Dependency preservation: what it means, and why BCNF can sacrifice it
- The BCNF vs. dependency-preservation trade-off, side by side

## Recap: What BCNF Requires

A relation $R$ is in **Boyce-Codd Normal Form** if, for every non-trivial functional
dependency $X \rightarrow Y$ that holds over $R$, $X$ is a **superkey** of $R$ — every
determinant must be able to determine *all* of $R$'s attributes, not just the ones on the
right-hand side of that one dependency. Lecture 20's closure-based test is what you use to
check this: compute $X^+$ under $R$'s full FD set, and confirm $X^+$ = all attributes of
$R$. If some FD's determinant fails that test, $R$ violates BCNF, and this lecture's
algorithm tells you exactly how to fix it.

## The BCNF Decomposition Algorithm

The algorithm is a loop: as long as *any* relation in your current decomposition still
violates BCNF, split it, and check the split relations again. It terminates because each
split strictly reduces the size of the relations involved, and you cannot split forever.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The BCNF Decomposition Loop</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">1. Pick a relation R</span><span class="db-node-sub">From the current decomposition (initially, just the original relation)</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">2. Test R for BCNF</span><span class="db-node-sub">For every FD X → Y over R, check whether X⁺ (closure under R's FDs) covers all of R's attributes</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">3. Violation found?</span><span class="db-node-sub">If every determinant is a superkey of R, R is done — set it aside and go to step 1 with a different relation</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">4. Split R on the violating FD X → Y</span><span class="db-node-sub">R1 = X ∪ Y      R2 = X ∪ (R − Y)</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">5. Replace R with R1 and R2</span><span class="db-node-sub">Project R's FDs onto each; loop back to step 1 for both</span></div>
</div>
</div>

Stated formally, as a procedure:

!!! note "BCNF Decomposition Algorithm"
    **while** some relation $R_i$ in the current decomposition violates BCNF:

    1. Find an FD $X \rightarrow Y$ that holds over $R_i$ where $X$ is **not** a superkey
       of $R_i$ (a genuine violation).
    2. Replace $R_i$ in the decomposition with two new relations:
        - $R_1 = X \cup Y$
        - $R_2 = X \cup (R_i - Y)$ — that is, $X$ together with every attribute of $R_i$
          *not* in $Y$.
    3. Determine the FDs that hold over $R_1$ and over $R_2$ by projecting $R_i$'s FD set
       onto each new attribute list.
    4. Go back to the top of the loop; $R_1$ and $R_2$ are now candidates to test (and
       possibly split further).

    **return** the decomposition once every relation in it passes the BCNF test.

Two details matter enormously and are easy to get wrong:

- **$X$ appears in both halves.** This is not a mistake — it is exactly what makes the join
  lossless (proved below). $X$ becomes the connecting column between $R_1$ and $R_2$, playing
  the same role a foreign key plays after the split.
- **You must re-test the *new* relations, not just declare victory after one split.** A
  single split can easily leave one or both halves still violating BCNF if the original
  relation had more than one problem FD. That's exactly what happens in the worked example
  below.

## Worked Example: A Course Enrollment Relation

Consider a university relation recording which student is enrolled in which course, taught
by which instructor, meeting in which room:

<div class="db-relation" markdown>
<div class="db-relation-name">Enrollment (studentNo, courseNo, instructorNo, room)</div>

| studentNo | courseNo | instructorNo | room |
|---|---|---|---|
| S1001 | CSC270 | I01 | LT-3 |
| S1002 | CSC270 | I01 | LT-3 |
| S1001 | CSC211 | I02 | LT-1 |
| S1003 | CSC270 | I01 | LT-3 |
| S1003 | CSC211 | I02 | LT-1 |

</div>

The business rules in force here are:

- **FD1:** `studentNo, courseNo → instructorNo, room` — a student's enrollment in a course
  fixes who teaches it and where (a student can't be in two sections of the same course).
- **FD2:** `courseNo → instructorNo` — each course is taught by exactly one instructor
  (single-section policy, no parallel sections this term).
- **FD3:** `instructorNo → room` — each instructor teaches out of one fixed room all term.

### Step 1 — Test the Original Relation

The only candidate key is `{studentNo, courseNo}` — its closure, using FD1, already reaches
all four attributes, and no smaller set does (neither `studentNo` nor `courseNo` alone
determines `instructorNo`). So `{studentNo, courseNo}` is the sole candidate key, and it is
therefore the only legal superkey-forming determinant.

Now check every FD's determinant against that key:

| FD | Determinant | Is it a superkey of Enrollment? | BCNF? |
|---|---|---|---|
| FD1 | `studentNo, courseNo` | Yes — it *is* the key | OK |
| FD2 | `courseNo` | No — `courseNo`⁺ = `{courseNo, instructorNo, room}` (using FD2, FD3), not all four attributes | **Violation** |
| FD3 | `instructorNo` | No — `instructorNo`⁺ = `{instructorNo, room}` only | **Violation** |

`Enrollment` violates BCNF, twice over. The algorithm says: pick *one* violation and split.

### Step 2 — First Split, on FD2 (courseNo → instructorNo)

Using $X$ = `courseNo`, $Y$ = `instructorNo`:

- $R_1 = X \cup Y$ = `{courseNo, instructorNo}`
- $R_2 = X \cup (R - Y)$ = `{courseNo}` $\cup$ `{studentNo, courseNo, room}` = `{studentNo, courseNo, room}`

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">CourseInstructor (<u>courseNo</u>, instructorNo)</div>

| courseNo | instructorNo |
|---|---|
| CSC270 | I01 |
| CSC211 | I02 |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">StudentCourseRoom (<u>studentNo, courseNo</u>, room)</div>

| studentNo | courseNo | room |
|---|---|---|
| S1001 | CSC270 | LT-3 |
| S1002 | CSC270 | LT-3 |
| S1001 | CSC211 | LT-1 |
| S1003 | CSC270 | LT-3 |
| S1003 | CSC211 | LT-1 |

</div>
</div>

### Step 3 — Test Both New Relations

**`CourseInstructor(courseNo, instructorNo)`:** the only FD projected here is FD2 itself,
`courseNo → instructorNo`. `courseNo` is a candidate key (its closure reaches both
attributes), so its determinant *is* the key. **BCNF — done.**

**`StudentCourseRoom(studentNo, courseNo, room)`:** the candidate key is still
`{studentNo, courseNo}` (FD1 restricted to these attributes gives
`studentNo, courseNo → room`). But FD3, `instructorNo → room`, no longer even mentions an
attribute of this relation directly — except its *consequence* survives indirectly: does
`courseNo → room` hold here? Yes — since `courseNo → instructorNo → room` in the original
FD set, and both intermediate facts still apply to real data, `courseNo` alone determines
`room` in this projected relation too. Check `courseNo`'s closure over
`StudentCourseRoom`: `courseNo`⁺ = `{courseNo, room}` (via the inherited FD), which does
**not** cover `studentNo`. `courseNo` is *not* a superkey of `StudentCourseRoom`.
**Violation — split again.**

### Step 4 — Second Split, on courseNo → room (in StudentCourseRoom)

Using $X$ = `courseNo`, $Y$ = `room`, splitting `StudentCourseRoom`:

- $R_1 = X \cup Y$ = `{courseNo, room}`
- $R_2 = X \cup (R - Y)$ = `{courseNo}` $\cup$ `{studentNo, courseNo}` = `{studentNo, courseNo}`

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">CourseRoom (<u>courseNo</u>, room)</div>

| courseNo | room |
|---|---|
| CSC270 | LT-3 |
| CSC211 | LT-1 |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">StudentCourse (<u>studentNo, courseNo</u>)</div>

| studentNo | courseNo |
|---|---|
| S1001 | CSC270 |
| S1002 | CSC270 |
| S1001 | CSC211 |
| S1003 | CSC270 |
| S1003 | CSC211 |

</div>
</div>

### Step 5 — Final BCNF Check on Every Piece

| Relation | Candidate key | Every determinant a superkey? | BCNF? |
|---|---|---|---|
| `CourseInstructor(courseNo, instructorNo)` | `courseNo` | Yes | Pass |
| `CourseRoom(courseNo, room)` | `courseNo` | Yes | Pass |
| `StudentCourse(studentNo, courseNo)` | `studentNo, courseNo` | Yes (no non-trivial FDs left at all — an all-key relation is automatically in BCNF) | Pass |

The algorithm terminates here with **three** relations, not two — a direct consequence of
`Enrollment` having had two independent violations, not one. This is exactly the "repeat"
in "iterative BCNF decomposition": the first split fixed FD2's violation but *inherited*
FD3's problem into one of the halves, which needed a second pass to resolve.

## Checking the Lossless-Join Property

A decomposition is only correct if it is **lossless** — natural-joining the pieces back
together must reconstruct *exactly* the original relation, with no rows lost and, just as
importantly, no *spurious* rows gained. The BCNF algorithm's split rule
($R_1 = X \cup Y$, $R_2 = X \cup (R-Y)$) guarantees losslessness automatically, because of a
theorem from Lecture 20: a decomposition of $R$ into $R_1$ and $R_2$ is lossless if and only
if $R_1 \cap R_2 \rightarrow R_1$ or $R_1 \cap R_2 \rightarrow R_2$ holds. Here
$R_1 \cap R_2 = X$, and by construction $X \rightarrow Y$ was the very FD we split on, so
$X \rightarrow R_1$ trivially holds ($R_1 = X \cup Y$, and $X \rightarrow X \cup Y$
whenever $X \rightarrow Y$). The theorem's condition is satisfied by construction, every
single time — you never need to separately *prove* losslessness for a BCNF-algorithm split;
you only need to confirm you split on a real, verified FD.

Still, it's worth checking by hand once, on the final example, to build the intuition.
Natural-join `CourseInstructor` ⋈ `CourseRoom` ⋈ `StudentCourse` on `courseNo` (and
`studentNo, courseNo` for the last join) and confirm every original `Enrollment` tuple
reappears exactly once, with no extras:

```text
StudentCourse ⋈ CourseInstructor ⋈ CourseRoom
  on courseNo, then studentNo+courseNo
------------------------------------------------
studentNo | courseNo | instructorNo | room
S1001     | CSC270   | I01          | LT-3
S1002     | CSC270   | I01          | LT-3
S1001     | CSC211   | I02          | LT-1
S1003     | CSC270   | I01          | LT-3
S1003     | CSC211   | I02          | LT-1
```

Five rows out, five rows in, all matching the original `Enrollment` table exactly. The join
is lossless.

!!! tip "Lossless does not mean 'no information changed' — it means 'no information lost or invented'"
    Every fact recoverable from the original `Enrollment` relation is still recoverable by
    joining the three final relations, and no *new*, unintended fact appears. That is the
    entire and complete meaning of "lossless-join decomposition."

## Dependency Preservation — and BCNF's One Real Weakness

Lecture 20 already flagged this, and it is worth stating plainly now that you've seen a full
worked decomposition: **3NF synthesis always preserves every original functional
dependency**, but **BCNF decomposition sometimes cannot**, even when it is fully lossless.

A decomposition is **dependency-preserving** if every FD from the original relation's FD set
either holds directly within one of the decomposed relations, or can be *inferred* by
combining FDs that hold within the decomposed relations — without ever having to compute a
join first just to check a constraint.

In the worked example above, dependency preservation happened to survive: FD2
(`courseNo → instructorNo`) lives entirely inside `CourseInstructor`, and FD3
(`instructorNo → room`) is implied by combining `CourseInstructor`
(`courseNo → instructorNo`) with `CourseRoom` (`courseNo → room`) — you can still verify
`instructorNo → room` holds by checking the data, but notice you can no longer state it as a
constraint *local to one relation*; it now depends on a join. That's a mild version of the
problem. In other, less forgiving schemas, a BCNF split can lose an FD *so completely* that
no combination of the decomposed relations' local constraints implies it at all — the only
way to check whether the original business rule is still satisfied is to physically
natural-join every piece back together and inspect the result, every time a row changes.
That defeats a huge part of the *point* of decomposition, which was to let the DBMS enforce
constraints cheaply, locally, with a `PRIMARY KEY` or `UNIQUE` clause on one small table.

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">3NF Synthesis</span>
<span class="db-node-sub">Always lossless AND always dependency-preserving — the synthesis algorithm builds one relation per FD specifically to guarantee this. Trade-off: may retain a small amount of redundancy that BCNF would remove.</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">BCNF Decomposition</span>
<span class="db-node-sub">Always lossless, but NOT guaranteed dependency-preserving. Trade-off: removes all redundancy tied to a determinant that isn't a key, at the possible cost of needing a join (or a trigger/assertion) to re-check some original constraint.</span>
</div>
</div>

!!! warning "This is a real design decision, not a footnote"
    When a BCNF decomposition loses dependency preservation, you have three practical
    choices in a real system: (1) accept BCNF and enforce the lost constraint with a
    database trigger or application-level check instead of a simple key constraint; (2)
    settle for 3NF instead of BCNF on that particular relation, deliberately tolerating a
    small amount of redundancy in exchange for keeping every constraint locally checkable;
    or (3) redesign the underlying business rules if the lost dependency turns out not to be
    as important as it first seemed. There is no universal right answer — it is a genuine
    engineering trade-off, and naming it explicitly in a design review is exactly what a
    competent database designer does.

## Testing Relations for BCNF — the Checklist

Before moving on, consolidate the check you'll run over and over, on every candidate
relation, at every iteration of the loop:

1. List every attribute of the relation and every FD that holds over it (project the
   original FD set onto just this relation's attributes).
2. Find every candidate key by computing closures (Lecture 20).
3. For every non-trivial FD $X \rightarrow Y$ in that projected set, compute $X^+$.
4. If $X^+$ covers *all* attributes of the relation, that FD is fine. If even one FD fails
   this test, the relation violates BCNF — split on that FD and repeat the whole checklist
   on both halves.
5. Stop only when every relation currently in the decomposition passes step 4 with no
   exceptions.

## Try It Yourself

1. A relation `Booking(guestNo, hotelNo, roomNo, checkInDate, price)` has FDs
   `guestNo, hotelNo, checkInDate → roomNo, price` and `roomNo, hotelNo → price` (a room's
   nightly rate depends only on the room and hotel, not on who books it or when). Find the
   candidate key, identify the BCNF violation, and run the decomposition algorithm to a
   final, fully-BCNF result.
2. For your answer to question 1, check whether the decomposition is dependency-preserving:
   does `roomNo, hotelNo → price` survive intact inside one relation, or does it require a
   join to re-verify?
3. Explain, in your own words, why an "all-key" relation (one where the only candidate key
   is the entire set of attributes, with no other FDs) is automatically in BCNF without
   needing to check anything further.

## Key Takeaways

- The BCNF decomposition algorithm is a loop: while some relation violates BCNF, split it on
  a violating FD $X \rightarrow Y$ into $R_1 = X \cup Y$ and $R_2 = X \cup (R-Y)$, then
  re-test both halves.
- A relation can have more than one BCNF violation; fixing one split can leave — or even
  inherit — a second violation that needs its own split, exactly as `Enrollment` needed two
  passes above.
- Every split performed by this exact rule is automatically lossless, because
  $R_1 \cap R_2 = X$ and $X \rightarrow R_1$ holds by construction — no separate proof is
  needed per split, only confirmation that the FD you split on is genuine.
- Unlike 3NF synthesis, BCNF decomposition is **not** guaranteed to preserve every original
  functional dependency — some constraints may only be re-checkable by joining pieces back
  together, a genuine trade-off worth naming explicitly in a design review.
- The re-test-every-piece discipline from Lecture 20's closure test is the engine that drives
  the whole algorithm; there is no shortcut around computing closures at each step.

For the theory behind every closure computation and superkey check used in this lecture, see
[Lecture 20, Advanced Normalization, Functional Dependencies, and BCNF](lecture-20-advanced-normalization-functional-dependencies-and-bcnf.md).
Lecture 22 extends this same decomposition mindset to a dependency BCNF cannot even express —
the multi-valued dependency.
