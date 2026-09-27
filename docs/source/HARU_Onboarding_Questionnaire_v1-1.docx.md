**HARU**

**Onboarding Questionnaire — MVP Pilot v1.1**

*Five parent-facing questions · book-matching scope · ages 3.0–4.0*

| Document | HARU Onboarding Questionnaire v1.1 |
| :---- | :---- |
| **Prepared for** | MVP pilot · age-3 launch |
| **Status** | Final draft — ready for design handoff |
| **Scope** | Book-matching only. Not a temperament profile or developmental assessment. |
| **Length** | Five questions · \~2.5 minutes to complete |
| **Changes from v1.0** | Q1 (age) removed from questionnaire — consumed from profile setup instead |
| **Date** | April 2026 |

# **Changes in v1.1**

* *Q1 (“How old is your child?”) was removed. Age is consumed from the profile-setup flow as an integer in months. The questionnaire no longer duplicates information captured at account creation.*

* *Question numbering renumbered Q1–Q5. Total length reduced from six questions to five (\~2.5 minutes).*

* *Section 3 (“Profile setup inputs”) added to specify what the engine receives from profile setup, distinct from what the questionnaire produces.*

* *Inference & recommendation logic section updated to reference the revised state vector.*

# **Purpose**

This document specifies the onboarding questionnaire HARU shows to parents when they first set up their child's profile during the MVP pilot. The questionnaire produces the minimum input needed for the recommendation engine to make better-than-random book selections from the age-3 inventory.

Scope is deliberately narrow. This is not a temperament profile, not a developmental assessment, and not a personalization system. It is a book-matching questionnaire. Five questions, two and a half minutes to complete, zero HARU vocabulary visible to the parent.

### **Design principles applied**

* All questions are behavioral, not abstract. We ask about what the parent has observed, not how they would characterize their child on an abstract dimension.

* No question requires the parent to learn HARU's framework. Words like axis, regulation, mechanism, and self-direction never appear.

* Every question maps cleanly to one or two engine variables. Anything that doesn't influence the recommendation is excluded.

* Information already captured elsewhere is not asked again. Age belongs at profile setup; the questionnaire does not duplicate it.

* Each question allows an “unsure” or “varies” answer. Forcing a choice on uncertain parents produces noisier data than allowing a graceful skip.

# **Inputs From Profile Setup**

Before the questionnaire begins, HARU has already collected the following data during profile creation. The recommendation engine consumes these inputs alongside the questionnaire output.

* 

| Option (what the parent picks) | Engine variable | Value set |
| :---- | :---- | :---- |
| *Child's date of birth (or age in months)* | child.age\_months | Integer, 36–48 |
| *Child's name (for parent-facing messaging only)* | child.display\_name | Free text |
| *Account creator's relationship to child* | caregiver.relationship | parent / grandparent / other |

Age is the most important profile-setup input for the recommendation engine. It drives the hard age-floor / age-ceiling filter on the candidate book pool. Within the age-3 inventory, age also distinguishes which subset of the inventory is genuinely appropriate — a 36-month-old should be served gentler books with sub-3y floors (Brown Bear, Big Red Barn), while a 47-month-old should be served books at the upper end of the inventory's ceiling range that prepare them for the age-4 transition.

If the child's date of birth was not captured at profile setup, prompt for it once before the questionnaire begins. Do not include it as a questionnaire item — it belongs in the profile layer, not the matching layer.

# **The Questionnaire**

Five questions, presented one at a time on mobile. Parent-facing copy is shown exactly as it should render. Internal notes following each question are not shown to the parent.

**Q1.  When you read to your child, which kinds of stories tend to go best?**

*Single-select. Required. This is the most important question — it sets the stimulation comfort zone.*

* Quiet, gentle stories — bedtime-style, slow pace

* A bit of adventure, but nothing too intense

* They love a wild ride — big feelings, big action

* It really depends on the day or their mood

***Engine use.** Sets the child.comfort\_zone thresholds, which act as a hard filter on book stimulation profile (EI, NL, NT, RC). This question is the high-fear filter, disguised as a preference question — parents answer it much more reliably this way than they would answer “is your child anxious?”*

| Option (what the parent picks) | Engine variable | Value set |
| :---- | :---- | :---- |
| *Quiet, gentle stories* | comfort\_zone | EI≤2, NL≤2, NT≤2, RC≥5 |
| *A bit of adventure* | comfort\_zone | EI≤3, NL≤3, NT≤3, RC≥4 |
| *A wild ride* | comfort\_zone | EI≤4, NL≤4, NT≤4, RC≥4 |
| *Depends on the day* | comfort\_zone | Use “A bit of adventure” as default; flag for recalibration after 3 sessions |

**Q2.  Books can do different kinds of work. Which would help you most right now?**

*Multi-select, up to 2\. Required — at least one option must be picked.*

* Helping with big feelings — when emotions feel overwhelming for them

* Building their confidence and sense of “I can do it”

* Helping them adjust when things change or don't go their way

* Sparking their wonder about the world and connection with us

***Engine use.** Sets the axis\_weight parameters in the need\_score calculation. Selected axes receive 2× weight; unselected axes receive 1× baseline weight. Multi-select allowed because many parents genuinely want two of these at once — and the engine handles dual weighting cleanly.*

| Option (what the parent picks) | Engine variable | Value set |
| :---- | :---- | :---- |
| *Big feelings* | axis\_weight.emotion\_regulation | 2.0 |
| *Confidence / I can do it* | axis\_weight.self\_direction | 2.0 |
| *Adjust when things change* | axis\_weight.cognitive\_flexibility | 2.0 |
| *Wonder and connection* | axis\_weight.intrinsic\_meaning | 2.0 |
| *(any unselected)* | axis\_weight.\<axis\> | 1.0 (baseline) |

**Q3.  What does your child tend to reach for in books?**

*Multi-select, up to 2\. Optional — “not sure yet” is a valid answer.*

* Characters and stories — what happens, who's in it

* How things work, animals, the world around them

* Colors, art, things that look beautiful or interesting

* Books with other kids, families, friendships

* Honestly not sure yet — they're still figuring it out

***Engine use.** Sets weights on interest\_area tags. Multi-select supports kids with mixed interests. The “not sure” option is essential — many 3-year-olds haven't settled on a clear preference, and forcing parents to pick produces noise that will mislead the engine for weeks.*

| Option (what the parent picks) | Engine variable | Value set |
| :---- | :---- | :---- |
| *Characters and stories* | interest\_weight.narrative | 2.0 |
| *How things work* | interest\_weight.inquiry | 2.0 |
| *Colors, art* | interest\_weight.artistic | 2.0 |
| *Other kids, families* | interest\_weight.social | 2.0 |
| *Not sure yet* | interest\_weight.all | 1.0 (baseline, no weighting) |

**Q4.  During read-aloud, what does your child usually do?**

*Single-select. Required.*

* Sits close and listens

* Wants to point, touch, turn pages

* Acts things out, can't sit still

* Asks lots of questions

* Moves around but is clearly listening

***Engine use.** Captures the motor/still channel signal in observable form. At MVP scope, this lightly biases book selection toward books with embodied participation potential (e.g., Press Here, No David\!) for motor-leaning children. Post-MVP, this same field drives prompt selection within books.*

| Option (what the parent picks) | Engine variable | Value set |
| :---- | :---- | :---- |
| *Sits close and listens* | channel | still |
| *Wants to point, touch, turn pages* | channel | mixed-still |
| *Acts things out, can't sit still* | channel | motor |
| *Asks lots of questions* | channel | still-sustained |
| *Moves around but is clearly listening* | channel | mixed-motor |

**Q5.  Which of these does your child already know well?**

*Multi-select, any number. Optional. Shows a grid of 8–10 cover thumbnails from the inventory.*

Display the following covers in a 2-column grid with title underneath each. Caption: “Tap any books you've read together more than a few times.”

* Goodnight Moon

* The Very Hungry Caterpillar

* Brown Bear, Brown Bear

* Where the Wild Things Are

* Guess How Much I Love You

* Llama Llama Red Pajama

* Corduroy

* The Snowy Day

***Engine use.** Removes selected books from the recommendation candidate pool. Also lightly down-weights books with similar profiles for the first three sessions, so the first recommendations feel fresh rather than echoing what the family already has at home. This is the single highest-ROI question in the questionnaire — the most common reason recommendation engines feel useless at first is recommending books the family already owns.*

| Option (what the parent picks) | Engine variable | Value set |
| :---- | :---- | :---- |
| *(any selected)* | child.owned\_books | \[book\_id, book\_id, …\] |
| *(none selected)* | child.owned\_books | \[\] |

# **Inference & Recommendation Logic**

This section documents how the engine consumes the questionnaire output. It is internal-facing and not shown to the parent. Engineering should treat this as the source of truth for the recommendation function.

### **Cold-start state vector**

After profile setup and Q1–Q5, the engine has the following minimum child-state vector:

* age\_months — integer from profile setup (not from questionnaire)

* comfort\_zone — four stimulation thresholds (EI, NL, NT, RC) from Q1

* axis\_weights — four axis weights (ER, AG, CF, IM), each at 1.0 or 2.0, from Q2

* interest\_weights — four interest weights, each at 1.0 or 2.0, from Q3

* channel — motor / still / mixed-motor / mixed-still / still-sustained, from Q4

* owned\_books — array of book\_ids from Q5

### **Recommendation scoring function**

For each candidate book, compute:

Step 1: Hard filters. Eliminate books where (a) age\_floor\_mo \> age\_months, (b) age\_ceiling\_mo \+ 6 \< age\_months, (c) any stimulation dimension (EI, NL, NT) exceeds comfort\_zone by more than 1 point, (d) RC \< comfort\_zone.RC threshold, or (e) book\_id is in owned\_books.

Step 2: Need score. For each axis A in {ER, AG, CF, IM}: score \+= book.axis\_activation\[A\] × axis\_weights\[A\]. Books that strongly activate axes the parent flagged score higher.

Step 3: Interest score. For each tag T in book.interest\_areas: score \+= interest\_weights\[T\] × 0.5. The 0.5 multiplier keeps interest from dominating axis fit.

Step 4: Channel match. If channel is motor or mixed-motor and book has embodied participation (Press Here, No David\!, Don't Let the Pigeon Drive the Bus, Wild Things rumpus): score \+= 1.0. Minor adjustment, not a primary factor.

Step 5: Variety penalty. If the same axis was activated by the most recent recommendation, slightly downweight that axis for this turn. Prevents same-axis bombardment.

Rank candidates by total score. Return top three with brief rationale strings for each — e.g., “Great for big feelings, gentle pace, you haven't read this one yet.”

### **The “depends on the day” and “not sure yet” handling**

Both options exist deliberately and must be handled by the engine without producing degraded recommendations.

* Q1 “depends on the day” → use the middle-tier comfort zone (option 2 thresholds) as default. After session 3, prompt the parent: “How have the first few books felt for them? Too much, just right, could be more?” Use the response to recalibrate.

* Q3 “not sure yet” → do not weight any interest area. Let axis-weighted scoring drive recommendations entirely. Implicitly, the child's preferences will emerge from which books the parent re-reads.

# **The Post-Read Feedback Loop**

The questionnaire is the cold-start. The feedback loop is where recommendations actually improve. Both must ship in the MVP.

### **After every recommended read**

A single low-friction prompt appears: “How did this one go?” with three options:

* Loved it — will read again

* Was okay — once was enough

* Not a fit — didn't land

“Not a fit” triggers a one-question follow-up: “What felt off?” with four options: too intense, not engaging, wrong topic, too long. Each tap updates engine state.

***Engine impact.** These three taps over three sessions carry more information than the entire onboarding questionnaire. The questionnaire gets the engine from cold-start to warm-start; the feedback loop gets it from warm-start to good. Both are necessary; neither is sufficient alone.*

### **Recalibration triggers**

* Two consecutive “too intense” flags → tighten comfort\_zone by one step on the relevant dimension.

* Two consecutive “not engaging” flags on the same axis → deprioritize that axis for the next three recommendations.

* Two consecutive “wrong topic” flags → reduce confidence in interest\_weights; surface a one-question check on next session.

* Three or more “Loved it” flags in a row → confidence is high; the engine can begin testing slight stretches on the relevant dimensions.

# **What Is Deliberately Out of Scope**

Several things were considered for this questionnaire and excluded. Documenting them here so the exclusions don't get re-litigated mid-build.

* Age as a questionnaire item. Age is captured at profile setup and consumed directly. It is not a matching question.

* Temperament profiling. The full Motor / Attention / Fear schema from HARU\_Temperament\_Schema\_Memo\_v3-2 is not invoked at onboarding. The MVP uses observable behavioral proxies (Q1, Q4) sufficient for book-level matching.

* Developmental assessment. The engine does not estimate the child's current axis level. It only knows which axes the parent wants to lean into. Axis-state inference is deferred to post-MVP based on observed reading patterns.

* Mechanism preferences. The mechanism field (affect\_labeling, containment\_modeling, etc.) is engine-internal. The parent never sees it and is never asked about it. The engine uses mechanism information at the book-tagging level only.

* Strength-vs-deficit framing. We deliberately ask what the parent wants to help with, not what their child lacks. The data captured is the same; the framing the parent experiences is supportive, not diagnostic.

* Reading-level / decoding ability. Not relevant at age 3; all reading is parent-led.

* Multi-child households. Each child has their own profile. The questionnaire runs once per child.

# **Open Decisions Before Launch**

Three calls to make before this questionnaire ships.

### **1\. Should Q5's cover grid use HARU's 20-book inventory or a broader “commonly owned books” set?**

Recommendation: use the 8 most likely-owned books from the inventory, not a broader set. Reason: the engine can only act on owned-book data for books it knows about. Showing books outside the inventory creates a data field the engine can't use. Pre-launch, validate the specific 8 covers against actual Korean / US market data on most-owned 3-year-old picture books.

### **2\. Should the parent see why each book was recommended?**

Recommendation: yes, with a one-sentence rationale per recommendation. “Good for big feelings.” “Gentle pace.” “Matches your child's interest in animals.” This builds trust and helps the parent calibrate the engine through informed feedback rather than blind acceptance.

### **3\. When does the questionnaire become re-editable?**

Recommendation: from day one, accessible via profile settings. Children change; parents' read of their children changes. Locking onboarding answers will produce stale recommendations within months. The engineering cost of making answers editable is small now and large later if deferred.

*Working document — ready for design handoff. Final copy review with localization team before Korean launch.*

© 2026 GLIFT LLC  ·  Confidential