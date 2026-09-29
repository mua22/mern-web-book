---
title: "15. EER Modeling: A Case Study"
tags:
  - CSC270
  - EER Model
  - Case Study
  - Database Design
---

# 15. EER Modeling: A Case Study

Every construct from [Lecture 14](lecture-14-the-enhanced-er-model.md) — specialization,
generalization, aggregation, composition, categorization — is easy to understand in
isolation, on a two-entity toy example. It's a different skill entirely to sit down with a
page of messy, ordinary-language requirements and *decide*, from scratch, which construct
each part of the problem actually needs. This lecture does exactly that, start to finish, for
a brand-new scenario: a hospital's patient-management system. Nothing here is handed to you
pre-modeled — every entity, every relationship, and every EER construct is derived directly
from the requirements text, the way a real database designer would work through a client's
first meeting.

## In This Lecture

- The case study's requirements, written the way a client would actually describe them
- Step-by-step identification of entity types, with the reasoning behind each decision
- Step-by-step identification of relationships and their structural constraints
- Step-by-step identification of attributes, including multi-valued and derived ones
- Building the staff specialization hierarchy, with disjoint/overlapping and total/partial
  constraints justified from the requirements
- Applying aggregation and composition where the requirements genuinely call for them
- Assembling the complete EER diagram from all the pieces developed along the way
- Validating the finished model against the original requirements, sentence by sentence

## Case Study Description

Al-Shifa General Hospital, a mid-sized private hospital in Islamabad, wants a database to
replace its paper-based patient records. In an initial requirements meeting, the hospital
administrator describes the system as follows:

> "We need to keep track of every patient who comes through the hospital — their basic
> details, and every time they're admitted as an in-patient or seen as an out-patient. Every
> admission has to record which ward and which specific bed the patient occupied, when they
> were admitted, and when they were discharged.
>
> We employ doctors, nurses, lab technicians, and administrative staff. Every staff member
> has a staff number, a name, a CNIC, a home address, and a join date, and belongs to exactly
> one department. Doctors additionally hold a medical license number and have a
> consultation fee. Some of our doctors are consultants — senior doctors with years of
> specialist experience, each with their own office — and the rest are residents, who
> rotate between departments and are supervised by one of the consultants.
>
> The hospital is organized into departments — Cardiology, Orthopedics, and so on — each
> with a name, a location, and one doctor designated as its head. Every ward belongs to
> exactly one department, and every bed belongs to exactly one ward; a ward that's shut
> down for renovation should take its beds with it out of the system entirely.
>
> For every admission we also need to know which doctor is *attending* — the doctor
> directly responsible for that patient's care during that stay, which might be different
> from any other doctor who happens to work on the same ward.
>
> Patients also book scheduled appointments with a specific doctor, and we need a
> confirmation number for each appointment so patients can reference it when they call to
> reschedule or cancel. During an admission or an appointment, a doctor may prescribe one
> or more drugs to a patient, each with its own dosage and schedule. Finally, every patient
> receives a hospital invoice for their stay or their visit, and we need to track whether
> it's been paid."

This is deliberately written the way a client actually talks — some sentences are clearly
about entities, some about relationships, some bury an attribute inside a longer sentence,
and one sentence (the ward/bed one) is quietly describing both a weak entity *and* a
composition constraint at once. Untangling that is the rest of this lecture.

## Step 1: Identification of Entity Types

Reading the brief line by line and applying the entity-vs-attribute test from
[Lecture 13](lecture-13-er-modeling-issues-and-problems.md) — does the candidate have its
own attributes, its own relationships, or independent existence? — produces the following
entity types:

| Candidate | Entity type? | Reasoning |
|---|---|---|
| Patient | Yes | Independent existence, own attributes, participates in several relationships |
| Staff | Yes | Superclass — shared attributes across every kind of employee |
| Doctor, Nurse, Technician, Administrator | Yes (subclasses of Staff) | Each has role-specific attributes `Staff` alone can't hold cleanly |
| Consultant, Resident | Yes (subclasses of Doctor) | Each has attributes the other doesn't; identified as a second specialization level |
| Department | Yes | Has its own name, location, and a designated head — independent of any one ward |
| Ward | Yes | Has its own name and belongs to a department; owns beds |
| Bed | Yes, but **weak** | Cannot be identified, or exist, without knowing which ward it belongs to |
| Admission | Yes | Needs its own admission/discharge dates — a relationship with attributes, promoted to an entity exactly as Lecture 13 recommends |
| Appointment | Yes | Needs its own confirmation number, independent of patient or doctor — an associative entity |
| Prescription | Yes | Needs its own dosage/schedule attributes, tying together a patient, a doctor, and a drug at once |
| Drug | Yes | Independent catalog of drugs, referenced by many prescriptions |
| Invoice | Yes | Independent existence and lifecycle (issued, paid) beyond any single admission |
| "Consultation fee" | **No — attribute** | A single value describing one doctor, no attributes of its own |
| "CNIC", "join date" | **No — attributes** | Simple facts describing one staff member |

## Step 2: Identification of Relationships

| Relationship | Participants | Degree | Cardinality | Notes |
|---|---|---|---|---|
| WorksIn | Staff, Department | Binary | N : 1 | Every staff member belongs to exactly one department |
| HeadedBy | Department, Doctor | Binary | 1 : 1 | Exactly one doctor heads a department |
| Supervises | Consultant, Resident | Unary (recursive, via Doctor) | 1 : N | A consultant supervises many residents |
| ComposedOf | Department, Ward | Binary | 1 : N | **Composition** — a ward cannot exist outside its department (see Step 7) |
| Owns | Ward, Bed | Binary | 1 : N | Bed is a **weak** entity, identified only in combination with its owning ward |
| AdmittedTo | Patient, Bed | Binary | N : 1 | Carries `admissionDate`, `dischargeDate` — hence promoted to the `Admission` entity |
| AttendedBy | Admission (aggregated), Doctor | Binary, on an **aggregate** | N : 1 | The attending doctor for a *specific* admission, not for the patient or ward in general (see Step 7) |
| Books | Patient, Appointment | Binary | 1 : N | A patient can book many appointments over time |
| ScheduledWith | Appointment, Doctor | Binary | N : 1 | Each appointment is with exactly one doctor |
| Prescribes | Doctor, Prescription | Binary | 1 : N | |
| For | Prescription, Patient | Binary | N : 1 | |
| Of | Prescription, Drug | Binary | N : 1 | |
| BilledTo | Patient, Invoice | Binary | 1 : N | A patient may accumulate several invoices over time |

## Step 3: Identification of Attributes

<div class="db-diagram" markdown>
<p class="db-diagram-label">Patient — including a multi-valued and a derived attribute</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Patient</div>
<ul class="db-entity-attrs">
<li class="db-pk">patientNo</li>
<li>firstName</li>
<li>lastName</li>
<li>dateOfBirth</li>
<li>gender</li>
<li>address</li>
<li class="db-multi">phoneNumbers</li>
</ul>
</div>
</div>
</div>

`age` is deliberately **not** stored — per the note in Lecture 13, it is a derived attribute,
computed from `dateOfBirth` whenever it's needed rather than kept in sync by hand.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Staff and its full attribute set (before specialization is applied)</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs">
<li class="db-pk">staffNo</li>
<li>cnic</li>
<li>name</li>
<li>address</li>
<li>dateJoined</li>
<li class="db-fk">deptNo</li>
</ul>
</div>
</div>
</div>

The remaining entity types' attributes follow the same reasoning; the full list feeding into
Step 8's diagrams is:

- **Department**(<u>deptNo</u>, name, location, *headDoctorNo* [FK])
- **Ward**(<u>wardNo</u>, name, *deptNo* [FK])
- **Bed**(<u>*wardNo*, bedNo</u>, status) — composite key, first component a foreign key (weak entity)
- **Admission**(<u>admissionNo</u>, admissionDate, dischargeDate, reasonForAdmission, *patientNo*, *wardNo*, *bedNo*, *attendingDoctorNo*)
- **Appointment**(<u>apptNo</u>, scheduledDateTime, status, *patientNo*, *doctorNo*)
- **Prescription**(<u>prescriptionNo</u>, dosage, frequency, startDate, endDate, *patientNo*, *doctorNo*, *drugCode*)
- **Drug**(<u>drugCode</u>, name, manufacturer)
- **Invoice**(<u>invoiceNo</u>, amount, issueDate, status, *patientNo*)

## Step 4: Bed — a Weak Entity

`Bed` cannot be uniquely identified on its own — a hospital with three wards each numbering
their beds `1, 2, 3, ...` has no way to tell "Bed 3" in Ward W1 apart from "Bed 3" in Ward W2
using `bedNo` alone. `Bed` is therefore a **weak entity type**: it depends on `Ward` (its
**owner** or **identifying entity type**) for existence and for identification, and its
primary key is a **composite key** made of its own partial key (`bedNo`) plus the *entire*
primary key of its owner (`wardNo`).

<div class="db-diagram" markdown>
<p class="db-diagram-label">Bed — a weak entity, identified only in combination with its owning Ward</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Ward</div>
<ul class="db-entity-attrs"><li class="db-pk">wardNo</li><li>name</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Owns</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity-weak" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Bed (weak)</div>
<ul class="db-entity-attrs"><li class="db-pk">wardNo, bedNo</li><li>status</li></ul>
</div>
</div>
</div>
</div>

## Step 5: Specialization and Generalization

Two separate levels of specialization emerge directly from the requirements text.

**Level 1 — Staff into its four job roles.** The brief says the hospital "employ[s] doctors,
nurses, lab technicians, and administrative staff," and every one of the four roles gets its
own role-specific attributes with no overlap between roles mentioned anywhere in the
requirements. That makes this specialization **disjoint** (nobody is simultaneously a nurse
and a technician in this hospital's model) and, since every staff member is described as
being one of the four, **total**.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Level 1 — Staff specialized into four roles: disjoint, total</p>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff (superclass)</div>
<ul class="db-entity-attrs"><li class="db-pk">staffNo</li><li>cnic</li><li>name</li><li>dateJoined</li><li class="db-fk">deptNo</li></ul>
</div>
<p class="db-diagram-label" style="margin:0.6rem 0 0.4rem;"><span class="db-badge db-badge-purple">d</span> disjoint &nbsp;&nbsp;<span class="db-badge db-badge-purple">total</span> — every staff member is exactly one of the four roles below</p>
<div class="db-grid-3" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Doctor</div><ul class="db-entity-attrs"><li>licenseNo</li><li>consultationFee</li></ul></div>
<div class="db-entity" markdown><div class="db-entity-name">Nurse</div><ul class="db-entity-attrs"><li>shift</li></ul></div>
<div class="db-entity" markdown><div class="db-entity-name">Technician</div><ul class="db-entity-attrs"><li>labSpecialty</li></ul></div>
</div>
<div class="db-grid-2" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Administrator</div><ul class="db-entity-attrs"><li>officeRole</li></ul></div>
<div></div>
</div>
</div>

**Level 2 — Doctor further specialized into Consultant and Resident.** This is a
*second-level* specialization, sitting directly on top of the `Doctor` subclass from Level
1 — subclasses can themselves be further specialized, and the hierarchy can go as deep as
the requirements need. "Some of our doctors are consultants... and the rest are residents"
describes a specialization that is again disjoint (a doctor is one or the other, never both)
and total (every doctor is described as falling into one of the two).

<div class="db-diagram" markdown>
<p class="db-diagram-label">Level 2 — Doctor further specialized into Consultant / Resident: disjoint, total</p>
<div class="db-entity" markdown>
<div class="db-entity-name">Doctor (subclass of Staff, superclass here)</div>
<ul class="db-entity-attrs"><li>licenseNo</li><li>consultationFee</li></ul>
</div>
<p class="db-diagram-label" style="margin:0.6rem 0 0.4rem;"><span class="db-badge db-badge-purple">d</span> disjoint &nbsp;&nbsp;<span class="db-badge db-badge-purple">total</span></p>
<div class="db-grid-2" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Consultant</div><ul class="db-entity-attrs"><li>yearsOfExperience</li><li>officeRoomNo</li></ul></div>
<div class="db-entity" markdown><div class="db-entity-name">Resident</div><ul class="db-entity-attrs"><li>rotationEndDate</li><li class="db-fk">supervisingConsultantNo</li></ul></div>
</div>
</div>

`Resident.supervisingConsultantNo` is a foreign key back into `Consultant`, capturing
"residents... are supervised by one of the consultants" directly.

!!! tip "Why two separate specialization levels, instead of one flat list of six roles"
    It would be *possible* to specialize `Staff` directly into six disjoint leaves (`Nurse`,
    `Technician`, `Administrator`, `Consultant`, `Resident`, plain `Doctor`), skipping the
    intermediate `Doctor` level entirely. That would lose real information: `licenseNo` and
    `consultationFee` genuinely belong to *every* doctor, consultant or resident alike, and
    flattening the hierarchy would force duplicating those two attributes onto both leaf
    types instead of inheriting them once from a shared `Doctor` level. Multi-level
    specialization exists specifically so shared structure at *any* depth gets factored out
    exactly once — check for this the same way Step 1 checked for entities: attributes shared
    by *some but not all* immediate children of a node are a sign of a missing intermediate
    level.

## Step 6: Inheritance in This Hierarchy

- Every `Doctor` (and therefore every `Consultant` and `Resident`) inherits `staffNo`, `cnic`,
  `name`, `address`, `dateJoined`, and `deptNo` from `Staff`, plus `licenseNo` and
  `consultationFee` from `Doctor`.
- Every `Doctor` also inherits `Staff`'s relationships — `WorksIn Department` applies to a
  `Consultant` exactly as it does to a `Nurse`, with no separate relationship needing to be
  drawn per subclass.
- `HeadedBy` (a department's head must be a `Doctor`, per the requirements) and `Supervises`
  (only `Consultant`s supervise, and only `Resident`s are supervised) are relationships that
  belong specifically to `Doctor`, `Consultant`, and `Resident` — `Nurse` and `Technician`
  occurrences never participate in either, which is exactly the point of attaching a
  relationship at the subclass level rather than pushing it up to `Staff`.

## Step 7: Aggregation and Composition

Two separate sentences in the requirements map to the two whole-part constructs from
Lecture 14, and it matters which is which.

**Composition — Department "contains" Ward.** *"A ward that's shut down for renovation
should take its beds with it out of the system entirely"* — and, one level up, a ward
implicitly cannot outlive its department either; wards are not shared between departments
and have no independent existence once their department is gone. That is composition's
defining signature: strong ownership, no sharing, and existence dependency.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Composition: Department is composed of Ward (strong ownership)</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Department</div><ul class="db-entity-attrs"><li class="db-pk">deptNo</li><li>name</li><li>location</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Composed Of</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Ward</div><ul class="db-entity-attrs"><li class="db-pk">wardNo</li><li>name</li></ul></div>
</div>
</div>

**Aggregation — the AdmittedTo relationship, attended by a Doctor.** *"For every admission
we also need to know which doctor is attending — the doctor directly responsible for that
patient's care during that stay, which might be different from any other doctor who happens
to work on the same ward."* The attending doctor isn't a fact about the patient alone (the
same patient has a different attending doctor on a different admission) nor about the ward
alone (different patients on the same ward can have different attending doctors) — it's a
fact about the specific *admission*, i.e., about the `Patient`–`Bed` pairing as a whole. This
is aggregation, exactly as introduced in Lecture 14: the `AdmittedTo` relationship (already
promoted to the `Admission` entity in Step 1, because it also carries `admissionDate` and
`dischargeDate`) is treated as a single unit that itself relates to `Doctor` via
`AttendedBy`.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Aggregation: the Patient-to-Bed admission, as a whole, is AttendedBy one Doctor</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Patient</div><ul class="db-entity-attrs"><li class="db-pk">patientNo</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">AdmittedTo</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Bed</div><ul class="db-entity-attrs"><li class="db-pk">wardNo, bedNo</li></ul></div>
</div>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">AdmittedTo, aggregated</span><span class="db-node-sub">carries admissionDate, dischargeDate — this is the Admission entity</span></div>
<div class="db-arrow"></div>
</div>
<div class="db-erd" markdown>
<div class="db-relate" markdown><div class="db-relate-name">AttendedBy</div><div class="db-relate-card"><span class="db-badge db-badge-orange">N</span><span class="db-badge db-badge-teal">1</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Doctor</div><ul class="db-entity-attrs"><li class="db-pk">staffNo</li></ul></div>
</div>
</div>

## Step 8: EER Diagram Development

Putting every piece developed above together, the complete model assembles in five layers:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Layer 1 — core independent entities and their direct relationships</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Patient</div><ul class="db-entity-attrs"><li class="db-pk">patientNo</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Books</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Appointment</div><ul class="db-entity-attrs"><li class="db-pk">apptNo</li><li class="db-fk">doctorNo</li></ul></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Layer 2 — the Staff specialization hierarchy (both levels, from Step 5), attached to Department</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Department</div><ul class="db-entity-attrs"><li class="db-pk">deptNo</li><li class="db-fk">headDoctorNo</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">WorksIn</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-orange">N</span><span class="db-badge db-badge-teal">1</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Staff → Doctor → {Consultant, Resident}, Nurse, Technician, Administrator</div><ul class="db-entity-attrs"><li>(full hierarchy — see Step 5)</li></ul></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Layer 3 — Department, Ward, and Bed (composition + weak entity, from Steps 4 and 7)</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Department</div><ul class="db-entity-attrs"><li class="db-pk">deptNo</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Composed Of</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Ward</div><ul class="db-entity-attrs"><li class="db-pk">wardNo</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Owns</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div></div>
<div class="db-entity-weak" markdown><div class="db-entity" markdown><div class="db-entity-name">Bed (weak)</div><ul class="db-entity-attrs"><li class="db-pk">wardNo, bedNo</li></ul></div></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Layer 4 — Admission as an aggregate, attended by a Doctor (from Step 7)</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Patient</div><ul class="db-entity-attrs"><li class="db-pk">patientNo</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Admission</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Bed</div><ul class="db-entity-attrs"><li class="db-pk">wardNo, bedNo</li></ul></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Layer 5 — Prescription tying Patient, Doctor, and Drug together; Invoice per Patient</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Doctor</div><ul class="db-entity-attrs"><li class="db-pk">staffNo</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Prescribes</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Prescription</div><ul class="db-entity-attrs"><li class="db-pk">prescriptionNo</li><li class="db-fk">patientNo</li><li class="db-fk">drugCode</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Of</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-orange">N</span><span class="db-badge db-badge-teal">1</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Drug</div><ul class="db-entity-attrs"><li class="db-pk">drugCode</li></ul></div>
</div>
</div>

Each layer above is a genuine, valid EER fragment on its own — this is deliberate. Building a
large model one justified layer at a time, and checking each layer against the requirements
*before* moving to the next, is exactly how a real designer avoids the errors Lecture 13
warned about (a fan trap or a chasm trap is far easier to introduce, and far harder to spot,
when twenty entities are all drawn at once).

## Step 9: Validation of the EER Model

The last step is deliberately not "draw the diagram and stop" — every sentence of the
original requirements gets checked against the finished model:

| Requirement | Covered by |
|---|---|
| Track every patient's basic details and admissions | `Patient`, `Admission` (aggregated `AdmittedTo`) |
| Admission records ward, bed, admission/discharge dates | `Admission` attributes; `Bed` (weak, owned by `Ward`) |
| Doctors, nurses, technicians, administrative staff, each with role attributes | Level 1 `Staff` specialization |
| Doctors have a license number and consultation fee | `Doctor` subclass attributes, inherited by `Consultant` and `Resident` |
| Consultants have experience and an office; residents rotate and are supervised | Level 2 `Doctor` specialization; `Resident.supervisingConsultantNo` |
| Departments have a name, location, and a head doctor | `Department`, `HeadedBy` relationship |
| Every ward belongs to exactly one department; wards are removed with their department | `ComposedOf` — composition |
| Every bed belongs to exactly one ward | `Owns` — weak entity |
| Attending doctor is per-admission, can differ from other ward doctors | `AttendedBy` on the aggregated `Admission` |
| Appointments need a confirmation number, are with a specific doctor | `Appointment` entity, `ScheduledWith` |
| Prescriptions have dosage/schedule, tie a patient, doctor, and drug together | `Prescription` entity |
| Every patient gets an invoice; payment status is tracked | `Invoice`, `BilledTo` |

Every requirement sentence maps to at least one model element, and — checking in the other
direction — every entity, relationship, and constraint introduced above traces back to a
specific sentence in the brief, with no speculative structure invented beyond it. Two
assumptions were made explicit along the way and are worth flagging back to the client before
implementation: (1) a resident is assumed to always have exactly one supervising consultant
at a time, never zero and never more than one — the requirements imply this but don't state
it in so many words; and (2) `Nurse` and `Technician` were modeled with no further
sub-specialization, since the brief gives no role-specific detail beyond `shift` and
`labSpecialty` respectively — a reasonable place to stop, but a decision that should be
confirmed with the client before treating it as final. Flagging assumptions like these
explicitly, rather than silently baking them into the diagram, is itself part of validation.

## Key Takeaways

- A real EER design starts from ordinary client language, not from a pre-sorted list of
  entities and relationships — the entity-vs-attribute and relationship-vs-entity tests from
  [Lecture 13](lecture-13-er-modeling-issues-and-problems.md) do the actual sorting.
- Specialization can nest to more than one level (`Staff → Doctor → {Consultant, Resident}`)
  whenever a subset of an already-specialized subclass needs *further* differentiation.
- Weak entities (`Bed`), composition (`Department`/`Ward`), and aggregation (the attended
  `Admission`) each solve a different, specific problem in the requirements — matching the
  construct to the actual sentence that motivates it, rather than picking whichever looks
  more familiar, is the core skill this case study is meant to build.
- Validation means checking the model against the requirements in **both directions**: every
  requirement is represented, and every model element traces back to a requirement — with
  any assumption made along the way stated explicitly rather than left implicit.

[Lecture 16](lecture-16-mapping-eer-models-to-relational-schemas.md) takes this exact model —
every entity, weak entity, specialization, and aggregation built above — and maps it down,
rule by rule, into concrete relational schemas.
