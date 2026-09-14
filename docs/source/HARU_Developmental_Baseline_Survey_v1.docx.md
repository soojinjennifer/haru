**HARU**

**Developmental Outcome Survey — MVP Pilot v1.0**

*Ten parent-facing items · four-axis behavior battery · paired baseline/exit · ages 3.0–4.0*

|  |  |
| :---- | :---- |
| *Document* | HARU Developmental Outcome Survey v1.0 (Section A) |
| *Prepared for* | MVP pilot · 3-month volunteer cohort · age-3 launch |
| *Status* | Draft — for team review before baseline administration |
| *Scope* | Measures change in the four developmental axes (ER, AG, CF, IM). Not a satisfaction, retention, or willingness-to-pay instrument. |
| *Administration* | Identical wording at baseline (T0, onboarding) and exit (T1, month 3). Change \= T1 − T0 per child per axis. |
| *Length* | Ten items · \~3 minutes to complete |
| *Date* | July 2026 |

# **Purpose**

This document specifies the developmental outcome survey administered to parents during the MVP pilot. Its single job is to detect whether, over three months of HARU use, a child’s four developmental capacities — emotion regulation, self-directed agency, cognitive flexibility, and intrinsic meaning/motivation — grew in the expected direction and magnitude.

**This is deliberately not a product survey.** It does not ask whether the parent wants to keep using HARU, whether they would pay, or how satisfied they are. Those questions belong in a separate instrument, and mixing them in here would bias the developmental answers toward positivity. This survey asks only about observable child behavior.

### **Design principles applied**

* Behavioral, not abstract. Every item asks about a concrete, recent, observable situation — not for the parent to rate their child on a developmental dimension they would have to interpret.

* Measured twice, not once. The survey is administered identically at onboarding and at month 3\. Change is computed per child. A single end-of-pilot administration asking parents to recall “how was your child three months ago” would measure memory and expectancy, not development.

* One distinguishable behavior per item. An item earns its place only if the parent can tell the behavior it targets apart from every neighboring item. Distinctions the team can see but the parent cannot were collapsed.

* Every item allows an honest “haven’t seen it.” Forcing a rating on an unobserved behavior produces guesses, and guesses at baseline inflate the measured change.

* No HARU vocabulary. Words like axis, regulation, agency, mechanism, and self-direction never appear in the parent-facing copy.

# **The Survey**

*Response scale for every item: Never · Rarely · Sometimes · Often · Almost always, plus a non-scored option "Haven’t had the chance to see this yet" (recorded as missing data, not as a low score). Every item is anchored to the stem "In the past two weeks…"*

## **Emotion Regulation (ER)**

*Both items use a co-regulation framing — the child’s part within a supported interaction, since solo self-soothing is developmentally rare at this age.*

**ER1.  Recovery**

When your child got upset, how often were they able to calm down within a few minutes, with your help or comfort?

*Engine / analysis use. Primary ER signal. Measures co-regulated recovery, not solo regulation.*

**ER2.  Naming feelings**

After getting upset, how often was your child able to name or show you what they were feeling — through words, pointing, or gestures?

*Engine / analysis use. Affect-labeling. Distinct from recovery: whether the child can represent the feeling, not whether they calm. Bridges to HARU’s affect\_labeling mechanism.*

## **Self-Directed Agency (AG)**

*All three items target the child originating and driving something that takes will to sustain — the initiate and sustain of self-directed action, never bare selection among costless options.*

**AG1.  Taking it on**

When there was something your child could do themselves, how often did they take it on and do it — on their own or after a little encouragement — rather than needing you to do it for them?

*Engine / analysis use. Includes the encouraged-then-tries case; light encouragement is autonomy-supportive, not external control, so the child is still the one sustaining the action.*

**AG2.  Persistence**

When your child hit a small difficulty, how often did they keep trying for a bit before giving up or asking for help?

*Engine / analysis use. Purest sustain signal — continuing a self-owned effort against resistance.*

**AG3.  Self-directed pretend play**

How often did your child start and keep going their own pretend play — making up a scenario and staying in it (playing doctor, running a shop, being a character) — without you setting it up for them?

*Engine / analysis use. Unprompted, self-structured agency (initiate \+ sustain). “Start and keep going” and “without you setting it up” pin it to the child’s driving, not the vividness of the content.*

## **Cognitive Flexibility (CF)**

*Two concrete transition / substitution scenarios — the honest ceiling of what is observable at age 3\.*

**CF1.  Adjusting to change**

When plans changed unexpectedly, how often did your child adjust without getting badly stuck on it?

*Engine / analysis use. Concrete, retrievable scenario — the parent recalls an event, not an abstract category.*

**CF2.  Accepting a substitute**

When your child couldn’t have or do the exact thing they wanted, how often could they accept a substitute or a “later”?

*Engine / analysis use. Substitution tolerance. Second observable flexibility precursor at this age.*

## **Intrinsic Meaning / Motivation (IM)**

**IM1.  Carry-over**

How often did your child bring something from a book back up later — a character, an idea, a question — outside of reading time?

*Engine / analysis use. Cleanest IM signal. Spontaneous, self-generated, occurs away from the reading interaction, so hard to explain as a bid for attention.*

**IM2.  Curiosity and questioning**

How often did your child ask “why” or “what if” questions about the world around them?

*Engine / analysis use. Explanation-seeking curiosity, an emerging capacity at age 3\. Naturalistic data put \~70% of 2–5yo questions as information-seeking rather than attention-seeking, so raw frequency is a defensible curiosity signal.*

**IM3.  Absorption**

During reading together, how often did your child seem genuinely absorbed or delighted — not just sitting through it, but into it?

*Engine / analysis use. Doubles as a proximal mechanism check. Partly contaminated by recommendation quality (a good book raises absorption regardless of disposition), so read alongside IM1/IM2, not as pure IM growth.*

# **At a Glance**

| Axis | Items | Count |
| :---- | :---- | :---- |
| *Emotion Regulation* | recovery · naming feelings | 2 |
| *Self-Directed Agency* | taking it on · persistence · pretend play | 3 |
| *Cognitive Flexibility* | adjusting to change · accepting a substitute | 2 |
| *Intrinsic Meaning / Motivation* | carry-over · questioning · absorption | 3 |

*Ten items. Counts track how many distinguishable behaviors each axis has at age 3, not forced symmetry.*

# **How the Results Are Read**

This section is internal-facing. It documents how the paired survey data becomes an outcome claim.

### **Primary signal — per-axis change**

For each child, each item is scored 1–5 (missing where “haven’t seen it” was chosen). Axis scores are the mean of their items. The primary result is the cohort mean change (T1 − T0) per axis.

### **Strong signal — dose-response**

Because the MVP captures per-child engagement, compute each child’s cumulative axis-activation exposure from session data, then test whether children with more exposure on a given axis show larger gains on that axis. A within-axis exposure–gain relationship is the closest available causal signal without a control group, and it maps directly onto the axis\_activation schema.

### **The honest caveat**

This is a single-arm pilot with no control group. A 3-year-old’s capacities improve over three months regardless of HARU (maturation). The defensible claim is therefore “change occurred, in the expected direction, in a dose-dependent pattern consistent with the mechanism” — not “HARU caused the gain.” Both halves must be stated together.

# **What Is Deliberately Out of Scope**

* Satisfaction, retention, and willingness-to-pay. Captured separately. Including them here would bias developmental responses toward positivity.

* Abstract axis self-ratings. Parents are never asked to rate “emotion regulation” directly — only to report concrete behaviors.

* Solo (unsupported) regulation and unprompted-only agency. Both floor at this age; items use co-regulation and encouraged-or-unprompted framing instead.

* Offered-choice items. Choosing among costless, responsibility-free options (“which color?”) exercises only bare selection and was excluded from the agency axis.

* Mechanism vocabulary. affect\_labeling, containment\_modeling, and the rest stay engine-internal; the parent never sees them.

# **Open Decisions Before Baseline Ships**

### **1\. Pre-pilot floor check**

ER2 (verbal affect-labeling), both CF items, and AG3 (sustained pretend) target behaviors that may be genuinely rare at 36 months. Run the 10 items past 5–8 parents and confirm the T0 distribution is not clumped at the bottom before baseline goes out. A floored item cannot detect gain.

### **2\. Numeric anchors on the scale**

Recommendation: show verbal labels to parents (Never…Almost always), score 1–5 internally. Labels avoid false precision; internal numbers ease analysis.

### **3\. Axis-count asymmetry**

AG and IM carry three items; ER and CF carry two. Recommendation: keep asymmetric — counts reflect how many distinguishable behaviors each axis has at this age. If the team prefers a uniform 2-per-axis (8-item) battery, the cut candidate is IM3 (the contaminated item).

*Working document — for team review. Final copy pass with localization before Korean administration. © 2026 GLIFT LLC · Confidential*