# Continua — Layer 3: Higher-Order Interaction Candidate Defaults

**Status:** Draft for issue #29 (Draft Layer 3 candidate defaults). Blocked-by #28 satisfied — built on the Layer 2 pairwise reference already drafted.
**Register:** Internal / "therapist's reference," same as Layer 2. Not user-facing. No named public figures (same convention as Layer 2, for the same reason: this feeds the composition engine that writes a real user's report).

**What this file is, and isn't (per requirements doc §2.2.1 / §2.2.6):** Each entry below is a **candidate hypothesis** for how one axis behaves when it is *not* the primary interaction but is modifying someone else's — not settled content. Per the spec, each default needs to be tested during validation (#31) against the ~10 possible primary-pairs it could modify (every pairing among the other five axes). If a default holds across most of those, it stays as a genuine general rule, with documented exceptions where it doesn't. If it needs exceptions in roughly half or more of its contexts, that's the signal this axis's modifying role is pair-dependent rather than general, and it should be authored per-pair instead. I've flagged, for each axis, the pairing(s) I'd bet against the default holding cleanly — that's deliberate: the point of a hypothesis is to say in advance what would falsify it, so validation has something sharper to check than "does this feel right."

**Governing constraint (from §2.2.1):** A modifier's effect is a *direction that scales with that axis's own extremity*, never a binary presence/absence. "High Reactivity adds intensity" is the shape of a default; "Reactivity = urgent" is not, because it doesn't leave room for someone at a mild 6 vs. an extreme 9.

---

## Social Attunement — candidate default: "shifts how much (and how accurate) the information is that the primary interaction is acting on"

**The hypothesis:** Social Attunement doesn't change *what* the primary interaction is about — it changes how much accurate situational and interpersonal information is feeding it. At the high end, whatever the primary dynamic is (an advocate's intervention, a directive-server's initiative, a withdrawn self's retreat) operates with fine-grained, real-time awareness of the social terrain it's acting in. At the low end, the same primary dynamic operates on thinner social information — not absent, just less complete — making it more prone to misfiring or being misread by the people on the receiving end. Scales continuously with the person's actual Attunement score, in either direction from the primary pair's own center.

**Pairs it would modify (10):** Empathy×Self-Orientation, Empathy×Conscientiousness, Empathy×Agency, Empathy×Reactivity, Self-Orientation×Conscientiousness, Self-Orientation×Agency, Self-Orientation×Reactivity, Conscientiousness×Agency, Conscientiousness×Reactivity, Agency×Reactivity.

**Where I'd bet against it holding cleanly:** Conscientiousness×Reactivity as the primary pair. That interaction is about internal self-regulation (structure vs. impulse, amplitude vs. calm) rather than anything inherently interpersonal, so it's plausible Attunement's "situational information" framing does less work there than it does for, say, Empathy×Agency, where the whole primary dynamic is already about acting on other people. Worth specifically checking whether Attunement's modifying effect is smaller (not just present-but-weaker, but structurally different) for the two purely-behavioral-axis pairs (Conscientiousness×Agency, Conscientiousness×Reactivity) than for pairs involving a feeling axis.

---

## Empathy — candidate default: "shifts whether the primary interaction is oriented toward others' benefit or runs coolly instrumental"

**The hypothesis:** Empathy adds a moral-concern coloring to whatever the primary mechanism is doing, without changing the mechanism itself. High Empathy as a modifier bends the primary dynamic toward other people's actual wellbeing; low Empathy (detachment) leaves the same mechanism running on its own logic, unmoved by the cost or benefit to others — closer to leverage than care. This is the same distinction Layer 2 draws explicitly within the Social-Attunement×Agency pair (calibrated influence vs. blunt initiative, neither one about the other person's welfare) — the hypothesis here is that the same coloring effect generalizes to any primary pair Empathy isn't already part of.

**Pairs it would modify (10):** Social Attunement×Self-Orientation, Social Attunement×Conscientiousness, Social Attunement×Agency, Social Attunement×Reactivity, Self-Orientation×Conscientiousness, Self-Orientation×Agency, Self-Orientation×Reactivity, Conscientiousness×Agency, Conscientiousness×Reactivity, Agency×Reactivity.

**Where I'd bet against it holding cleanly:** Self-Orientation×Agency as the primary pair. That pair already has its own built-in self-vs-other axis (altruism vs. self-focus) doing similar work to what Empathy would add as a modifier. There's a real chance Empathy's marginal contribution shrinks or becomes redundant when the primary interaction already encodes a self/other dimension — worth checking whether Empathy needs a materially different (not just smaller) description when modifying that specific pair versus modifying a primary pair with no self/other content at all, like Conscientiousness×Reactivity.

---

## Self-Orientation — candidate default: "shifts whose interest the primary interaction ultimately serves"

**The hypothesis:** Self-Orientation modifies *whose benefit* the primary dynamic is organized around, independent of the primary mechanism itself. High altruism as a modifier bends the primary interaction toward serving other people or a cause beyond the self; high self-focus bends the same mechanism toward personal advancement, status, or protection. Unlike Empathy (which is about whether others' suffering registers at all), this is about where resources and priority flow once something registers — the book's own distinction between the two axes (Chapter 4: "does it matter to me that you are suffering" vs. "when I act, do I subordinate my interests to yours").

**Pairs it would modify (10):** Social Attunement×Empathy, Social Attunement×Conscientiousness, Social Attunement×Agency, Social Attunement×Reactivity, Empathy×Conscientiousness, Empathy×Agency, Empathy×Reactivity, Conscientiousness×Agency, Conscientiousness×Reactivity, Agency×Reactivity.

**Where I'd bet against it holding cleanly:** Empathy×Agency as the primary pair. That pair's own four anchors (the advocate, the passive bystander, the quiet carrier, the named predatory-dynamics danger) already run substantially on a self/other axis in practice, even though it's not the axis named in the pair. Self-Orientation as a modifier there may be doing less independent work than it would for a primary pair with no self/other content already baked in, like Conscientiousness×Agency. Worth checking for redundancy specifically against Empathy-containing primary pairs.

---

## Conscientiousness — candidate default: "shifts whether the primary interaction is sustained over time or expressed only in the moment"

**The hypothesis:** Conscientiousness modifies the *durability* of the primary dynamic — whether it shows up as a one-time, high-intensity expression or as something planned, repeated, and reliably followed through on. High Conscientiousness as a modifier makes whatever the primary interaction is doing more likely to persist and compound over time (echoing the book's own "sustained caregiver" vs. "responsive but unreliable helper" distinction from Layer 2, generalized beyond the Empathy×Conscientiousness pair it was written for). Low Conscientiousness (impulsivity) makes the same primary dynamic more likely to appear vividly in a given moment and then not recur in the same form.

**Pairs it would modify (10):** Social Attunement×Empathy, Social Attunement×Self-Orientation, Social Attunement×Agency, Social Attunement×Reactivity, Empathy×Self-Orientation, Empathy×Agency, Empathy×Reactivity, Self-Orientation×Agency, Self-Orientation×Reactivity, Agency×Reactivity.

**Where I'd bet against it holding cleanly:** Agency×Reactivity as the primary pair. That pair is already substantially about how something gets expressed *in the moment* (assertion, amplitude), so Conscientiousness modifying "does this sustain over time" may have an outsized rather than proportionate effect there — plausibly the single biggest swing-factor of any axis-pair combination in this set, not just a linear modifier. Worth specifically testing whether the Conscientiousness modifier needs a different (non-linear, threshold-like) treatment for this one pair rather than the same scaling rule used elsewhere.

---

## Agency — candidate default: "shifts whether the primary interaction is asserted/initiated or expressed through deference"

**The hypothesis:** Agency modifies the *stance* the primary dynamic is expressed from — actively initiated and directive at the high end, or expressed through support and accommodation of someone else's lead at the low end — without changing what the underlying dynamic is about. This generalizes the shape already visible across several Layer 2 pairs (e.g., "the directive server" vs. "service without a seat at the table" both describe the same altruistic motivation expressed through opposite Agency stances).

**Pairs it would modify (10):** Social Attunement×Empathy, Social Attunement×Self-Orientation, Social Attunement×Conscientiousness, Social Attunement×Reactivity, Empathy×Self-Orientation, Empathy×Conscientiousness, Empathy×Reactivity, Self-Orientation×Conscientiousness, Self-Orientation×Reactivity, Conscientiousness×Reactivity.

**Where I'd bet against it holding cleanly:** Conscientiousness×Reactivity as the primary pair. That interaction is about internal regulation (structure and amplitude) rather than interpersonal stance, so "asserted vs. deferential" may not map onto it as directly as it does onto pairs involving Empathy or Self-Orientation, where someone's stance toward *other people specifically* is already load-bearing. Worth checking whether Agency's modifying effect on this pair needs to be reframed (e.g., as "directs one's own structure/intensity" vs. "lets others set it") rather than imported unchanged from the interpersonal framing.

---

## Reactivity — candidate default: "shifts the amplitude and urgency at which the primary interaction is experienced and expressed"

**The hypothesis:** Reactivity is the axis most likely to generalize cleanly as a modifier, because the book itself defines it as content-independent amplitude — "it does not care what the input was... it simply describes the amplitude and duration of the nervous system's answer to whatever arrives." As a modifier, high Reactivity should make whatever the primary interaction is doing show up more urgently, more visibly, and with more volatility; low Reactivity should make the identical primary dynamic show up calmer and more contained, without changing its underlying direction or content.

**Pairs it would modify (10):** Social Attunement×Empathy, Social Attunement×Self-Orientation, Social Attunement×Conscientiousness, Social Attunement×Agency, Empathy×Self-Orientation, Empathy×Conscientiousness, Empathy×Agency, Self-Orientation×Conscientiousness, Self-Orientation×Agency, Conscientiousness×Agency.

**Where I'd bet against it holding cleanly:** Honestly, nowhere obvious — which is itself the hypothesis worth stating plainly rather than hedging. Reactivity's book-native definition is already an amplitude dial abstracted away from content, which is exactly the shape a general modifier needs. If validation (#31) finds this one *doesn't* generalize cleanly across most of its 10 pairs, that would be a more surprising and more interesting result than confirmation would be, and worth digging into specifically (the book's own registration-vs-expression distinction in Chapter 7 is one candidate place a clean default could still break down — a person's felt amplitude and their expressed amplitude aren't always the same, and this default is written assuming they track together).

---

*Validation note for #31: for each axis above, the fastest test isn't running all 10 pairings from scratch — it's checking the flagged "bet against" pairing first for each axis, since that's where the hypothesis is most likely to break if it's going to. A default that survives its own flagged exception is a stronger candidate for "genuinely general" than one that's never been checked against its hardest case.*
