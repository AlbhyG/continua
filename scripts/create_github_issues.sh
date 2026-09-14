#!/usr/bin/env bash
# Creates the 18 issues from continua-analysis-and-compare-requirements.md, Section 6,
# in github.com/AlbhyG/continua, with real "Blocked by #N" links between them.
#
# Requires: gh CLI installed and authenticated (`gh auth login`) with write access
# to the repo. Run this from any directory — it doesn't touch local files.
#
# Usage: ./create_github_issues.sh
# Safe to re-run label creation (idempotent); re-running the whole script will
# create a SECOND set of 18 issues, so only run it once.
#
# Note on the body-building pattern: issue bodies are read into a variable with
# `read -r -d '' BODY <<EOF ... EOF || true` rather than `BODY=$(cat <<EOF ...)`.
# The latter breaks (a real bash parsing bug, reproduced 2026-09-13) whenever the
# heredoc body contains a literal apostrophe -- bash's command-substitution scanner
# loses track of quote state inside the heredoc and throws "unexpected EOF while
# looking for matching `''" regardless of nesting depth or heredoc-delimiter
# quoting. `read -d ''` reads the heredoc directly with no $() wrapper, so it
# never hits that bug. Do not revert to `$(cat <<EOF ...)` for these bodies.

set -euo pipefail

REPO="AlbhyG/continua"

echo "Creating labels (safe to ignore 'already exists' errors)..."
for spec in \
  "content:0e8a16:Writing/authoring task, not code" \
  "engineering:1d76db:Code/infrastructure task" \
  "compliance:b60205:Legal, privacy, or compliance-gate related" \
  "individual-analysis:5319e7:Section 2 — individual profile analysis" \
  "range:fbca04:Section 2.6 — range/bandwidth" \
  "comparison:0052cc:Section 3 — two-person comparison" \
  "launch-blocker:d93f0b:Must be resolved before public launch" \
; do
  name="${spec%%:*}"
  rest="${spec#*:}"
  color="${rest%%:*}"
  desc="${rest#*:}"
  gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null || true
done

create_issue () {
  # $1 = title, $2 = body, $3 = comma-separated labels
  local url
  url=$(gh issue create --repo "$REPO" --title "$1" --body "$2" --label "$3")
  echo "$url"
  echo "${url##*/}"
}

echo ""
echo "Creating issue 1..."
read -r -d '' BODY <<'EOF' || true
Write the 15 axis-pair × 4 directional-shape entries (~60 total: both high, both low, and the two crossed directions per pair). See requirements doc §2.2.1.

- [ ] All 15 pairs covered
- [ ] Each pair has all 4 directional shapes
- [ ] Anchors written as continuous-space endpoints, not discrete categories ("interpolate, not classify," §2.2.1)

Blocked by: none
EOF
OUT=$(create_issue "Author Layer 2 — pairwise interaction reference" "$BODY" "content,individual-analysis")
ISSUE_1=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 2..."
read -r -d '' BODY <<EOF || true
One candidate default per axis describing its typical role as a modifier. See requirements doc §2.2.1.

- [ ] One entry per axis (6 total)
- [ ] Each framed as a hypothesis to be tested (§2.2.6), not settled content

Blocked by: #$ISSUE_1
EOF
OUT=$(create_issue "Draft Layer 3 candidate defaults" "$BODY" "content,individual-analysis")
ISSUE_2=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 3..."
read -r -d '' BODY <<EOF || true
General-profile mode only: extremity ranking → primary interaction(s) (co-primary ties handled explicitly, capped at 3, with the axis-order fallback beyond that) → ordered modifiers → structured interpretation object, produced before any prose. See requirements doc §2.2.2.

- [ ] Deterministic: same six scores always produce the same structured interpretation
- [ ] Tie handling implemented per §2.2.2 ("Ties" paragraph)
- [ ] Structured interpretation is a defined, versioned schema — not implicit in code

Blocked by: #$ISSUE_1, #$ISSUE_2
EOF
OUT=$(create_issue "Build Layer 4 composition protocol + Layer 5 structuring" "$BODY" "engineering,individual-analysis")
ISSUE_3=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 4..."
read -r -d '' BODY <<EOF || true
Run the pipeline against profiles with strong ground truth (e.g., Albhy/Melanie, the Guilty case-study configurations). Use this to decide, per axis, whether its Layer 3 default holds generally or needs pair-specific treatment — and to stress-test the co-primary tie case. See requirements doc §2.2.6.

- [ ] Each Layer 3 default confirmed, exception-documented, or replaced with pair-dependent content
- [ ] At least one known tie case tested end to end
- [ ] Required gate — do not skip before wider rollout

Blocked by: #$ISSUE_3
EOF
OUT=$(create_issue "Validate against known reference profiles" "$BODY" "content,individual-analysis")
ISSUE_4=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 5..."
read -r -d '' BODY <<EOF || true
Rule-based scan + tone/framing check, run once against the structured interpretation and once against the rendered prose. Backed by a versioned banned_terms.json (starter version provided separately). See requirements doc §2.2.3.

- [ ] Runs at both points (structure, then prose)
- [ ] Failing at either point routes to fallback, never shown/cached
- [ ] Failure queues to a human-review queue

Blocked by: #$ISSUE_3
EOF
OUT=$(create_issue "Build the two-pass compliance gate" "$BODY" "engineering,compliance,individual-analysis")
ISSUE_5=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 6..."
read -r -d '' BODY <<EOF || true
Generated description as primary display; axis-level fallback wired in for not-yet-generated, timed-out, errored, or gate-failed cases; disclaimer banner. See requirements doc §2.2.4, §2.4, §2.2.2 ("Timeout and failure handling").

- [ ] Timeout defined (starting point ~3s, tune from real latency)
- [ ] User never sees a broken page or hung load
- [ ] Short-form disclaimer inline, every visit

Blocked by: #$ISSUE_3, #$ISSUE_5
EOF
OUT=$(create_issue "Individual results page integration" "$BODY" "engineering,individual-analysis")
ISSUE_6=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 7..."
read -r -d '' BODY <<'EOF' || true
Static page carrying the full disclaimer language. Linked from every short-form banner site-wide. See requirements doc §4.1, §5.

- [ ] Full disclaimer copy present (pending legal review)
- [ ] Linked from global footer and every short-form banner

Blocked by: none
EOF
OUT=$(create_issue "Methodology & Limitations page" "$BODY" "content,compliance")
ISSUE_7=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 8..."
read -r -d '' BODY <<'EOF' || true
Audit existing assessment items per axis: do any already name a specific context? Determines whether range can ever be derived from a single sitting (very likely answer is no — see requirements doc §2.6.1). Review task, not engineering.

- [ ] Audit completed and documented
- [ ] Conclusion recorded: confirms multi-session approach (§2.6.2) as the only path

Blocked by: none. Gates the range-computation issue below.
EOF
OUT=$(create_issue "Item-bank context audit for range" "$BODY" "content,range")
ISSUE_8=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 9..."
read -r -d '' BODY <<'EOF' || true
Per-session scores + structured context tag + free-text note. See requirements doc §2.6.3.

- [ ] Structured tag is a fixed enumerated set for MVP (e.g., routine, high_stress, after_conflict, work, reflective) — not user-extensible
- [ ] Free-text note stored with field-level encryption (§4.3)
- [ ] Both fields optional at completion time
- [ ] Confirmed: attaches to the existing magic-link user_id, no new auth work required

Blocked by: none. Magic-link sign-in already establishes a persistent user_id, which is all this needs.
Not blocked on the passkey/session-UX issue that replaced #19 -- that's re-entry convenience, not
account existence. @Jason: link that issue here as related/non-blocking if it affects the sign-in
flow around the context-tag capture UI (issue 10).
EOF
OUT=$(create_issue "Test-history data model" "$BODY" "engineering,range")
ISSUE_9=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 10..."
read -r -d '' BODY <<EOF || true
Capture the structured tag + free-text note at assessment completion, before showing that session's results. See requirements doc §2.5, §2.6.3.

- [ ] Prompted but not required to complete
- [ ] Test-history page shows past sessions with their tags/notes

Blocked by: #$ISSUE_9
EOF
OUT=$(create_issue "Context-tag capture UI" "$BODY" "engineering,range")
ISSUE_10=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 11..."
read -r -d '' BODY <<EOF || true
Floor/ceiling from saved sessions, shown starting at n≥2 with sample-size labeled. No radar chart changes — text treatment first. See requirements doc §2.6.4, §2.6.5.

- [ ] Sample-size label always shown alongside any range
- [ ] Radar chart unmodified
- [ ] Range sentence appears in the per-axis interpretive text

Blocked by: #$ISSUE_8, #$ISSUE_9, #$ISSUE_10
EOF
OUT=$(create_issue "Range computation + display" "$BODY" "engineering,range")
ISSUE_11=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 12..."
read -r -d '' BODY <<'EOF' || true
comparisons + comparison_participants join table, N-capable from the start; comparison math written as a function of two profile objects. See requirements doc §3.2.

- [ ] No hard-coded profile_a_id/profile_b_id columns
- [ ] Per-axis pairwise delta function composable across a group later without rewriting

Blocked by: none
EOF
OUT=$(create_issue "Comparison data model" "$BODY" "engineering,comparison")
ISSUE_12=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 13..."
read -r -d '' BODY <<EOF || true
Invite → accept/decline, symmetric revocation, no admin override. See requirements doc §3.3.

- [ ] Both parties see identical results once both accept
- [ ] Revocation removes the comparison for both sides immediately
- [ ] No role can view a comparison without being one of its two participants

Blocked by: #$ISSUE_12
EOF
OUT=$(create_issue "Comparison double opt-in flow" "$BODY" "engineering,comparison")
ISSUE_13=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 14..."
read -r -d '' BODY <<EOF || true
Primary dumbbell/paired-dot view, fixed axis order, gap callout, stable per-user color. Radar thumbnail as summary glyph only. See requirements doc §3.4.

- [ ] Fixed axis order, not reordered by gap size
- [ ] No red/green or winner/loser-implying color scheme
- [ ] Gap callout computed live above the chart

Blocked by: #$ISSUE_12
EOF
OUT=$(create_issue "Comparison dumbbell chart + radar thumbnail" "$BODY" "engineering,comparison")
ISSUE_14=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 15..."
read -r -d '' BODY <<'EOF' || true
Per-axis aligned/divergent micro-narratives, hand-authored (not generated). See requirements doc §3.5.

- [ ] All 6 axes covered
- [ ] No compatibility score
- [ ] "Translation prompt" / action-oriented language explicitly excluded from this pass (see deferred note, §3.5)

Blocked by: none — can run in parallel with the comparison engineering issues
EOF
OUT=$(create_issue "Comparison advice content matrix + copywriting" "$BODY" "content,comparison")
ISSUE_15=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 16..."
read -r -d '' BODY <<EOF || true
Sharing a comparison further requires both participants' consent, not just the initiator's. See requirements doc §3.3, §3.6.

- [ ] Share-further blocked without both parties' consent
- [ ] Relationship-specific disclaimer shown at the share-further point

Blocked by: #$ISSUE_13
EOF
OUT=$(create_issue "Comparison revoke + joint-consent share-further flow" "$BODY" "engineering,comparison,compliance")
ISSUE_16=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 17..."
read -r -d '' BODY <<EOF || true
Light, non-pushy nudge via existing Resend integration. See requirements doc §2.6.7.

- [ ] Framed as optional, not "incomplete"

Blocked by: #$ISSUE_9
EOF
OUT=$(create_issue "Retake nudge email" "$BODY" "engineering,range")
ISSUE_17=$(echo "$OUT" | tail -1)

echo ""
echo "Creating issue 18..."
read -r -d '' BODY <<'EOF' || true
Counsel review of all disclaimer language (§4.1), the banned_terms.json rule set (§2.2.3), and jurisdiction-specific requirements (§4.4).

- [ ] All disclaimer copy reviewed
- [ ] Compliance-gate rules reviewed, not just the static disclaimer text
- [ ] Sign-off recorded before public launch

Blocked by: none to start; blocks launch
EOF
OUT=$(create_issue "Legal review of disclaimer copy + compliance-gate rule set" "$BODY" "compliance,launch-blocker")
ISSUE_18=$(echo "$OUT" | tail -1)

echo ""
echo "Done. Created issues #$ISSUE_1 through #$ISSUE_18 in $REPO."
