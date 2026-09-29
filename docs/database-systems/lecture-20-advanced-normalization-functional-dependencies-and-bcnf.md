---
title: "20. Advanced Normalization: Functional Dependencies and BCNF"
tags:
  - CSC270
  - Normalization
  - Functional Dependencies
  - BCNF
---

# 20. Advanced Normalization: Functional Dependencies and BCNF

[Lecture 19](lecture-19-the-normalization-process-1nf-2nf-3nf.md) closed with a quiet
admission: 3NF eliminates *most* redundancy, but "no transitive dependency" is not quite
the same question as "is every determinant in this relation actually a key." This lecture
makes that distinction precise. First, it gives functional dependencies a formal proof
system — **Armstrong's Axioms** — so that "this FD is implied by that FD set" becomes
something you can derive, not just intuit. Then it builds the single most useful practical
tool in the whole unit, **attribute closure**, which finds every candidate key of a relation
mechanically. Finally, it defines **Boyce-Codd Normal Form (BCNF)**, the strictest normal
form built purely from functional dependencies, and works through the classic example of a
relation that is in 3NF yet still redundant — precisely because BCNF is stricter.

## In This Lecture

- **Armstrong's Axioms** — reflexivity, augmentation, transitivity — and the derived rules
  built from them: union, decomposition, pseudotransitivity
- The **closure of a functional dependency set**, $F^+$
- **Attribute closure**, $X^+$ — the algorithm, and how it finds candidate keys directly
- **Boyce-Codd Normal Form (BCNF)** and how it differs from 3NF
- **Testing for BCNF** using attribute closure
- An informal introduction to **BCNF decomposition** (the full algorithm is Lecture 21)
- **Lossless-join decomposition**, verified precisely for a worked example
- The classic **3NF-but-not-BCNF** relation, and the anomaly that survives 3NF but not BCNF

## Functional Dependency Inference Rules (Armstrong's Axioms)

Given a set of functional dependencies $F$ on relation $R$, **Armstrong's Axioms** are
three inference rules that are both **sound** (they only ever derive FDs that genuinely
hold) and **complete** (repeatedly applying them can derive *every* FD that logically
follows from $F$ — nothing is missed). They are the formal foundation everything else in
this lecture builds on.

Working example throughout this section — a small advising schema:

<div class="db-relation" markdown>
<div class="db-relation-name">StudentAdvisor (StudentNo, StudentName, AdvisorNo, AdvisorName, DeptNo, DeptName)</div>

| StudentNo | StudentName | AdvisorNo | AdvisorName | DeptNo | DeptName |
|---|---|---|---|---|---|
| S1 | Bilal Khan | A1 | Dr. Iqbal | D1 | Computer Science |
| S2 | Sara Malik | A1 | Dr. Iqbal | D1 | Computer Science |
| S3 | Omar Farid | A2 | Dr. Rashid | D2 | Mathematics |

</div>

$$F = \{\ \text{StudentNo} \rightarrow \text{StudentName},\ \ \text{StudentNo} \rightarrow \text{AdvisorNo},\ \ \text{AdvisorNo} \rightarrow \text{AdvisorName},\ \ \text{AdvisorNo} \rightarrow \text{DeptNo},\ \ \text{DeptNo} \rightarrow \text{DeptName}\ \}$$

**The three primary axioms:**

- **Reflexivity** — if $Y \subseteq X$, then $X \rightarrow Y$. Every such FD is *trivial*
  (its right side adds no new information). Example: `{StudentNo, StudentName} →
  StudentNo` holds automatically, for any relation whatsoever.
- **Augmentation** — if $X \rightarrow Y$, then $XZ \rightarrow YZ$ for any attribute set
  $Z$. Example: from `StudentNo → StudentName`, augmenting with `DeptNo` gives
  `{StudentNo, DeptNo} → {StudentName, DeptNo}`.
- **Transitivity** — if $X \rightarrow Y$ and $Y \rightarrow Z$, then $X \rightarrow Z$.
  Example: `StudentNo → AdvisorNo` and `AdvisorNo → AdvisorName` together imply
  `StudentNo → AdvisorName` — exactly the chaining step used later in this lecture's
  closure algorithm.

**Three derived rules**, each provable *from* the three axioms above (so they add no new
power, only convenience):

- **Union (additivity)** — if $X \rightarrow Y$ and $X \rightarrow Z$, then
  $X \rightarrow YZ$. Example: `AdvisorNo → AdvisorName` and `AdvisorNo → DeptNo` together
  justify writing the single combined FD `AdvisorNo → AdvisorName, DeptNo`.
- **Decomposition (projectivity)** — the reverse of union: if $X \rightarrow YZ$, then
  $X \rightarrow Y$ and $X \rightarrow Z$ separately. Splitting `AdvisorNo → AdvisorName,
  DeptNo` back into its two individual FDs is always valid.
- **Pseudotransitivity** — if $X \rightarrow Y$ and $WY \rightarrow Z$, then
  $WX \rightarrow Z$. This one is less commonly needed by hand, but shows up in formal
  proofs about equivalence between two FD sets: it lets a dependency be "threaded through"
  an FD that only partially overlaps with it.

!!! tip "Union and decomposition are why FDs are usually written combined"
    Every time you see a schema note like `AdvisorNo → AdvisorName, DeptNo`, that's really
    two separate FDs — `AdvisorNo → AdvisorName` and `AdvisorNo → DeptNo` — bundled together
    for readability, licensed by the union rule. The decomposition rule guarantees you can
    always split them back apart when it's more convenient to reason about them one at a
    time (exactly what the closure algorithm below does).

## Closure of Functional Dependencies ($F^+$)

The **closure of $F$**, written $F^+$, is the set of **every** functional dependency that
can be derived from $F$ by repeatedly applying Armstrong's Axioms — every FD that is
*logically implied* by $F$, not just the ones explicitly listed. $F^+$ is typically far
larger than $F$ itself, and enumerating it directly is almost never practical: even a
modest handful of attributes produces exponentially many candidate FDs to check.

This is exactly the gap **attribute closure** fills: rather than compute the entire $F^+$,
it answers the one question that's actually needed over and over — "given a specific
attribute set $X$, what does $X$ determine?" — directly and efficiently.

## Attribute Closure ($X^+$)

!!! note "Definition"
    The **attribute closure** of a set of attributes $X$ under a set of functional
    dependencies $F$, written $X^+$, is the set of **all** attributes functionally
    determined by $X$ — that is, every attribute $A$ such that $X \rightarrow A$ is in
    $F^+$.

**Algorithm** — compute $X^+$ by starting with $X$ itself and repeatedly growing it:

```text
Result := X
repeat
    for each FD (LHS → RHS) in F:
        if LHS ⊆ Result:
            Result := Result ∪ RHS
until Result stops changing
return Result
```

Attribute closure is directly how you **find candidate keys**: compute $K^+$ for a
candidate attribute set $K$; if $K^+$ equals the full set of attributes of $R$, $K$ is a
**superkey**. $K$ is a **candidate key** specifically if it is also **minimal** — no proper
subset of $K$ also has this property. It is also how you **test whether a specific FD
$X \rightarrow Y$ is implied by $F$**: compute $X^+$, and check whether $Y \subseteq X^+$.

### Worked Example: Computing `{StudentNo}+`

Using the $F$ from `StudentAdvisor` above, compute the closure of `{StudentNo}` step by
step:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Computing {StudentNo}+ — each row applies one more FD</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Start: Result = {StudentNo}</span>
<span class="db-node-sub">Initialize with the attribute set being closed</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Apply StudentNo → StudentName</span>
<span class="db-node-sub">LHS {StudentNo} ⊆ Result -> add StudentName. Result = {StudentNo, StudentName}</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Apply StudentNo → AdvisorNo</span>
<span class="db-node-sub">LHS ⊆ Result -> add AdvisorNo. Result = {StudentNo, StudentName, AdvisorNo}</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Apply AdvisorNo → AdvisorName</span>
<span class="db-node-sub">AdvisorNo now ⊆ Result (just added) -> add AdvisorName</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Apply AdvisorNo → DeptNo</span>
<span class="db-node-sub">AdvisorNo ⊆ Result -> add DeptNo</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Apply DeptNo → DeptName</span>
<span class="db-node-sub">DeptNo now ⊆ Result -> add DeptName. No FD left to apply -> done</span>
</div>
</div>
</div>

$$\{\text{StudentNo}\}^+ = \{\text{StudentNo, StudentName, AdvisorNo, AdvisorName, DeptNo, DeptName}\}$$

This is **every** attribute of `StudentAdvisor` — so `{StudentNo}` is a **superkey**, and
since it's a single attribute (trivially minimal, short of the empty set, which determines
nothing), it is a **candidate key**.

**Checking it's the *only* candidate key** — compute `{AdvisorNo}+` for comparison: start
`{AdvisorNo}`, apply `AdvisorNo → AdvisorName` and `AdvisorNo → DeptNo`, then
`DeptNo → DeptName`, giving `{AdvisorNo, AdvisorName, DeptNo, DeptName}` — missing
`StudentNo` and `StudentName` entirely. `{AdvisorNo}` is **not** a superkey. No other single
attribute has any FD starting from it either (`StudentName`, `AdvisorName`, and `DeptName`
never appear as a determinant), so `{StudentNo}` is confirmed as the relation's one and only
candidate key.

## Boyce-Codd Normal Form (BCNF)

!!! note "Definition"
    A relation $R$ is in **Boyce-Codd Normal Form (BCNF)** if, for **every** non-trivial
    functional dependency $X \rightarrow Y$ that holds in $R$, $X$ is a **superkey** of
    $R$ — with no exception.

Compare this directly against 3NF's definition (Lecture 19): 3NF permits an FD
$X \rightarrow Y$ to survive **even when $X$ is not a superkey**, as long as every attribute
in $Y$ is a **prime attribute** (part of some candidate key). BCNF removes that exception
entirely. Every relation in BCNF is automatically in 3NF; the reverse is not guaranteed —
which is exactly the gap the next two sections make concrete.

## Testing for BCNF

Given a relation and its FD set, test BCNF by examining **every** determinant that appears
on the left side of some non-trivial FD:

```text
for each FD (X → Y) in F (or a minimal cover of F):
    compute X+ using attribute closure
    if X+ does NOT equal all attributes of R:
        X is not a superkey -> this FD VIOLATES BCNF
if no FD violates BCNF:
    R is in BCNF
```

Applied to the fully-normalized 3NF schema from Lecture 19 — take `Order(orderNo,
orderDate, custNo)`, key `orderNo`: the only non-trivial FD is `orderNo → orderDate,
custNo`, and `{orderNo}+` is trivially all of `Order`'s attributes (`orderNo` is the whole
key). BCNF holds. The same check passes for `Customer`, `Product`, and `OrderLine` — every
determinant in that schema already *is* the relation's key, so 3NF and BCNF coincide there.
They don't always coincide, as the next section shows.

## BCNF vs. 3NF: The Classic Counterexample

Consider a relation recording which instructor taught which student in which course, under
one simplifying business rule that makes this example work: **each instructor teaches only
one course** (in a given term — a real registrar's system would need a richer schema, but
this constraint is exactly what creates the classic anomaly worth studying).

<div class="db-relation" markdown>
<div class="db-relation-name">Enrollment (StudentNo, CourseNo, InstructorNo)</div>

| StudentNo | CourseNo | InstructorNo |
|---|---|---|
| S1 | CS201 | I1 |
| S2 | CS201 | I1 |
| S3 | CS305 | I2 |

</div>

$$F = \{\ \{\text{StudentNo, CourseNo}\} \rightarrow \text{InstructorNo},\ \ \ \text{InstructorNo} \rightarrow \text{CourseNo}\ \}$$

**Finding the candidate keys**, by attribute closure:

- `{StudentNo, CourseNo}+`: start `{StudentNo, CourseNo}`; apply FD1 → add `InstructorNo`.
  Result = all three attributes. **Superkey.** No proper subset works (`{StudentNo}+ =
  {StudentNo}`, `{CourseNo}+ = {CourseNo}` — neither FD has a single-attribute LHS matching
  either alone). **Candidate key #1: `{StudentNo, CourseNo}`.**
- `{StudentNo, InstructorNo}+`: start `{StudentNo, InstructorNo}`; apply FD2
  (`InstructorNo → CourseNo`) → add `CourseNo`. Result = all three attributes.
  **Superkey.** Again minimal (neither singleton alone reaches all attributes).
  **Candidate key #2: `{StudentNo, InstructorNo}`.**

Two candidate keys — and between them, `StudentNo`, `CourseNo`, and `InstructorNo` are
**all** prime attributes (every attribute belongs to at least one candidate key).

**Is this relation in 3NF?** Check FD2, `InstructorNo → CourseNo`: `InstructorNo` is *not*
a superkey (`{InstructorNo}+ = {InstructorNo, CourseNo}`, missing `StudentNo`). But
`CourseNo`, the right-hand side, **is** a prime attribute (it's part of candidate key #1) —
so 3NF's exception clause applies, and this FD does **not** violate 3NF. FD1's determinant
is a full candidate key already. **The relation is in 3NF.**

**Is this relation in BCNF?** BCNF has no prime-attribute exception. `InstructorNo →
CourseNo` has a determinant (`InstructorNo`) that is **not** a superkey — full stop.
**The relation violates BCNF.**

### The Anomaly That Survives 3NF

The redundancy is visible directly in the sample data: `I1` teaches `CS201`, and that fact
is repeated in **every** row where `InstructorNo = I1` — here, both `S1`'s and `S2`'s rows.
This relation being in 3NF did not save it from real anomalies:

- **Modification anomaly** — if `I1` is reassigned to teach `CS410` instead, both the `S1`
  row and the `S2` row must be updated together; updating only one leaves the relation
  claiming `I1` teaches two different courses at once, contradicting the very rule
  (`InstructorNo → CourseNo`) the schema is supposed to enforce.
- **Insertion anomaly** — instructor `I3`, newly assigned to teach `CS500`, cannot be
  recorded at all until at least one student enrolls with them — there is no row that can
  hold "an instructor and their course" without also committing to a specific student.
- **Deletion anomaly** — `S3` is currently the only student enrolled with `I2`; deleting
  `S3`'s enrollment silently erases the fact that `I2` teaches `CS305` at all.

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">3NF (this relation) — passes 3NF's exception clause</div>

| Rule checked | Result |
|---|---|
| `{StudentNo,CourseNo} → InstructorNo` | Determinant is a candidate key ✓ |
| `InstructorNo → CourseNo` | Determinant not a superkey, but `CourseNo` is prime — exception applies ✓ |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">BCNF — no exception clause</div>

| Rule checked | Result |
|---|---|
| `{StudentNo,CourseNo} → InstructorNo` | Determinant is a candidate key ✓ |
| `InstructorNo → CourseNo` | Determinant not a superkey — **violation**, no exception exists |

</div>
</div>

## BCNF Decomposition

The informal decomposition procedure mirrors 2NF/3NF's: find a functional dependency
$X \rightarrow Y$ that violates BCNF (its determinant $X$ is not a superkey), then split $R$
into two relations along that dependency:

```text
R1 = X ∪ Y                (the violating FD becomes R1's own key)
R2 = (R - Y) ∪ X           (everything else, keeping X to reconnect the two)
```

Repeat on $R_1$ and $R_2$ individually until every resulting relation is in BCNF. (This is
only the informal picture — Lecture 21 gives the full, iterative algorithm, including what
to do when a relation has *more than one* BCNF-violating FD.)

Applying it to `Enrollment(StudentNo, CourseNo, InstructorNo)`, using the violating FD
`InstructorNo → CourseNo` ($X = \{\text{InstructorNo}\}$, $Y = \{\text{CourseNo}\}$):

<div class="db-diagram" markdown>
<p class="db-diagram-label">BCNF decomposition of Enrollment, guided by InstructorNo -> CourseNo</p>
<div class="db-flow" markdown>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Enrollment (StudentNo, CourseNo, InstructorNo)</span>
<span class="db-node-sub">Violates BCNF: InstructorNo -> CourseNo, InstructorNo not a superkey</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Teaches (InstructorNo, CourseNo)</span>
<span class="db-node-sub">R1 = X ∪ Y. Key: InstructorNo -- now the ONLY determinant, and it IS the key</span>
</div>
</div>
<div class="db-flow" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Enrolls (StudentNo, InstructorNo)</span>
<span class="db-node-sub">R2 = (R - Y) ∪ X. Key: {StudentNo, InstructorNo} -- no non-trivial FD remains to violate anything</span>
</div>
</div>
</div>

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">Teaches (<u>InstructorNo</u>, CourseNo)</div>

| InstructorNo | CourseNo |
|---|---|
| I1 | CS201 |
| I2 | CS305 |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">Enrolls (<u>StudentNo, InstructorNo</u>)</div>

| StudentNo | InstructorNo |
|---|---|
| S1 | I1 |
| S2 | I1 |
| S3 | I2 |

</div>
</div>

Both relations are now in BCNF: `Teaches`'s only determinant, `InstructorNo`, is its own
key; `Enrolls` has no non-trivial functional dependency left to violate anything at all (no
FD in the original set has `StudentNo` or `{StudentNo, InstructorNo}` alone as a
determinant of anything new). `I1`'s course now lives in exactly one row of `Teaches` — the
modification, insertion, and deletion anomalies above are all gone.

## Lossless-Join Decomposition

A decomposition into $R_1$ and $R_2$ is guaranteed **lossless** whenever the shared
attributes $(R_1 \cap R_2)$ form a key of *at least one* of the two relations — formally,
whenever $(R_1 \cap R_2) \rightarrow R_1$ or $(R_1 \cap R_2) \rightarrow R_2$ holds in
$F^+$.

Checking the `Teaches`/`Enrolls` split: $R_1 \cap R_2 = \{\text{InstructorNo}\}$. Is
`InstructorNo` a key of `Teaches`? Yes — it's `Teaches`'s declared primary key, so
`InstructorNo → Teaches` (all of `Teaches`'s attributes) holds trivially. The condition is
satisfied, so this decomposition is **lossless**: `Teaches ⋈ Enrolls` (joined on
`InstructorNo`) reconstructs the original `Enrollment` relation exactly.

!!! warning "This BCNF decomposition is lossless — but not dependency-preserving"
    Check the *original* FD `{StudentNo, CourseNo} → InstructorNo` against the decomposed
    schema: `StudentNo` lives only in `Enrolls`, and `CourseNo` lives only in `Teaches` —
    there is no single decomposed relation where both attributes even appear together, so
    this dependency **cannot be verified without first joining the two tables back
    together**. This is not a mistake in the decomposition; it is a known, general fact:
    **BCNF decomposition always guarantees a lossless join, but it does not always
    guarantee dependency preservation.** 3NF, achieved via the synthesis algorithm
    (Lecture 21), guarantees *both* simultaneously — one of the genuine trade-offs between
    the two normal forms, not merely "BCNF is strictly better."

## Key Takeaways

- **Armstrong's Axioms** — reflexivity, augmentation, transitivity — are sound and complete;
  **union**, **decomposition**, and **pseudotransitivity** are convenient rules derived from
  them.
- **$F^+$**, the closure of a functional dependency set, is every FD logically implied by
  $F$ — usually too large to enumerate directly, which is exactly why **attribute closure**
  ($X^+$) exists as the practical tool.
- **Attribute closure** finds every attribute a set $X$ determines, and is the mechanical
  way to find candidate keys: $X$ is a superkey iff $X^+$ equals all of $R$'s attributes.
- **BCNF** requires every non-trivial FD's determinant to be a superkey — no exception. 3NF
  allows one exception: a determinant that isn't a superkey is still tolerated if every
  attribute it determines is *prime* (part of some candidate key).
- The classic `Enrollment(StudentNo, CourseNo, InstructorNo)` example, with `InstructorNo →
  CourseNo`, is in **3NF but not BCNF** — and still carries a real redundancy (an
  instructor's course repeats once per enrolled student) that 3NF's exception clause
  permits.
- **BCNF decomposition** splits along a violating FD ($R_1 = XY$, $R_2 = (R-Y) \cup X$) and
  is always **lossless-join**, but — as the worked example showed — can sacrifice
  **dependency-preservation**, a genuine trade-off against 3NF.

[Lecture 21](lecture-21-bcnf-schema-design-by-decomposition.md) formalizes the
full, iterative BCNF decomposition algorithm for relations with more than one violating
FD, and works through the complete decomposition process end to end.
