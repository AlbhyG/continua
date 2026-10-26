"""Build third-person ("observer") versions of every questionnaire item.

Raters answer about someone else, so "I rarely notice..." becomes
"{name} rarely notices...". The first reference to the person uses their name;
later references use singular "they", so no gender is assumed or stored.

The rule-based conversion below handles most items. Items it gets wrong are
fixed by hand in data/observer-items/overrides.json (keyed "qid:index"), which
always wins. Output: data/observer-items/observer-items.json, keyed the same
way, with the template text using {name} as the placeholder.

Run: python3 scripts/build-observer-items.py
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, "data", "questionnaires")
ODIR = os.path.join(ROOT, "data", "observer-items")

ADVERBS = {
    "often", "seldom", "always", "never", "sometimes", "usually", "almost",
    "generally", "still", "also", "even", "just", "really", "typically",
    "rarely", "frequently", "routinely", "naturally", "readily", "easily",
    "quickly", "instinctively", "actively", "deliberately", "automatically",
    "immediately", "genuinely", "consistently", "constantly", "regularly",
    "tend", "not", "hardly", "barely", "only", "mostly", "quietly", "openly",
    "privately", "intentionally", "habitually", "reliably", "carefully",
    "intuitively", "strongly", "deeply", "truly", "simply", "rather",
    "first", "then", "usually", "occasionally", "reflexively", "persistently",
}
# "tend" and "not" are in ADVERBS only so they are never treated as adverbs:
# they are removed below. (Kept in one place for readability.)
ADVERBS -= {"tend", "not", "rather", "then"}
ADVERBS |= {"first", "most", "last"}

MODALS = {"can", "can't", "cannot", "could", "couldn't", "would", "wouldn't",
          "will", "won't", "should", "shouldn't", "might", "must", "may"}
PAST_OR_FIXED = {"was", "wasn't", "had", "felt", "found", "did", "used", "made", "gave",
                 "took", "got", "went", "saw", "knew", "thought", "told", "said",
                 "came", "left", "kept", "spent", "brought", "began", "became",
                 "ran", "wrote", "chose", "forgot", "heard", "lost", "met", "sent",
                 "understood", "led", "grew", "fell", "held", "won", "built"}

IRREGULAR = {"am": "is", "have": "has", "do": "does", "go": "goes",
             "don't": "doesn't", "haven't": "hasn't", "be": "is"}


def third_person(verb: str) -> str:
    low = verb.lower()
    if low in IRREGULAR:
        return IRREGULAR[low]
    # "-ed" means past tense, except for verbs like "need" and "succeed".
    if low in MODALS or low in PAST_OR_FIXED or (low.endswith("ed") and not low.endswith("eed")):
        return verb
    if re.search(r"(s|sh|ch|x|z|o)$", low):
        return verb + "es"
    if re.search(r"[^aeiou]y$", low):
        return verb[:-1] + "ies"
    return verb + "s"


# Later references to the rated person become placeholders the site fills in
# with he, she or they (src/lib/observer/items.ts). A verb after {they} is
# written in both forms, {v:plural|singular}, e.g. {v:feel|feels}.
SUBJ_THEY = {"I": "{they}", "I'm": "{they're}", "I've": "{they've}", "I'd": "{they'd}",
             "I'll": "{they'll}"}
SUBJ_NAME = {"I": "{name}", "I'm": "{name} is", "I've": "{name} has",
             "I'd": "{name} would", "I'll": "{name} will"}

def agree(verb: str) -> str:
    """A verb after {they}: both forms when they differ, else the verb as is."""
    low = verb.lower()
    if low == "am":
        return "{v:are|is}"
    if low == "was":
        return "{v:were|was}"
    single = third_person(verb)
    return verb if single == verb else "{v:%s|%s}" % (verb, single)


TOKEN = re.compile(r"[A-Za-z][A-Za-z']*|[^A-Za-z]+")


def convert(text: str) -> str:
    toks = TOKEN.findall(text.replace("’", "'"))
    out = []
    named = False
    pending_conj = None  # "name" or "they": conjugate the next verb
    for i, tok in enumerate(toks):
        if not tok[0].isalpha():
            out.append(tok)
            continue
        cap = tok[0].isupper()
        low = tok.lower()
        if tok in SUBJ_NAME:
            if not named:
                out.append(SUBJ_NAME[tok])
                named = True
                pending_conj = "name" if tok == "I" else None
            else:
                rep = SUBJ_THEY[tok]
                out.append(rep.replace("{t", "{T", 1) if i == 0 else rep)
                pending_conj = "they" if tok == "I" else None
            continue
        if low == "my":
            if not named:
                out.append("{name}'s")
                named = True
            else:
                out.append("{Their}" if cap and i == 0 else "{their}")
            continue
        # Before the person has been named, an object pronoun names them
        # ("matters to me" -> "matters to {name}"); after, it is "them".
        if low == "me":
            out.append("{them}" if named else "{name}")
            named = True
            continue
        if low == "myself":
            out.append("{themselves}" if named else "{name}")
            named = True
            continue
        if low == "mine":
            out.append("{theirs}" if named else "{name}\u2019s")
            named = True
            continue
        if pending_conj:
            if low in ADVERBS or (low.endswith("ly") and low not in {"rely", "apply", "reply", "fly", "supply"}):
                out.append(tok)
                continue
            if pending_conj == "name":
                out.append(third_person(tok))
            else:
                out.append(agree(tok))
            pending_conj = None
            continue
        out.append(tok)
    s = "".join(out)
    s = s.replace("{name}'s", "{name}’s")
    return s


KNOWN_TOKENS = {"{name}", "{they}", "{They}", "{their}", "{Their}", "{them}",
                "{themselves}", "{theirs}", "{they're}", "{They're}", "{they've}",
                "{They've}", "{they'd}", "{They'd}", "{they'll}", "{They'll}"}
BASE_VERBS = {"help", "feel", "want", "lash", "go", "try", "make", "take", "give",
              "ask", "let", "stay", "keep", "move", "find", "get", "start", "stop",
              "look", "work", "act", "check", "say", "tell", "become", "think",
              "need", "care", "use", "do", "have", "rest", "return", "adjust",
              "wish", "reach", "step", "offer", "pull", "hold", "turn", "see",
              "come", "leave", "put", "speak", "listen", "write", "read"}
# Items checked by hand where the flagged word is not a verb of the {they} clause.
REVIEWED_COORDINATION = {"2:5", "4:6"}  # infinitive or after "can"


def collect_base_verbs(texts) -> set:
    """Every word that follows "I" (past adverbs) somewhere in the items:
    the verbs these statements actually use."""
    found = set()
    for t in texts:
        for m in re.finditer(r"\bI ((?:[a-z]+ly |often |rarely |never |always |still |also |even )*)([a-z]+)\b", t):
            found.add(m.group(2))
    return found - MODALS - PAST_OR_FIXED - {"am", "tend", "do", "have"}


def main() -> int:
    os.makedirs(ODIR, exist_ok=True)
    overrides_path = os.path.join(ODIR, "overrides.json")
    overrides = {}
    if os.path.exists(overrides_path):
        overrides = json.load(open(overrides_path, encoding="utf8"))
    out = {}
    problems = []
    files = [json.load(open(f, encoding="utf8")) for f in sorted(glob.glob(os.path.join(QDIR, "*.json")))]
    BASE_VERBS.update(collect_base_verbs(it["text"] for q in files for it in q["questions"]))
    for q in files:
        for i, item in enumerate(q["questions"]):
            key = f"{q['id']}:{i}"
            text = overrides.get(key) or convert(item["text"])
            out[key] = text
            if "{name}" not in text:
                problems.append((key, "no {name}", text))
            if re.search(r"\b(I|me|my|mine|myself|I'm|I've|I'd|I'll)\b", text):
                problems.append((key, "first person left", text))
            for tok in re.findall(r"\{[^}]*\}", text):
                if tok not in KNOWN_TOKENS and not re.fullmatch(r"\{v:[a-z']+\|[a-z']+\}", tok):
                    problems.append((key, f"unknown placeholder {tok}", text))
            # A second verb in a {they} clause ("{they} stay late and help")
            # must agree too; flag it unless it is already a {v:...} pair.
            m = re.search(r"\{(?:they|They)\}[^.;,]*?\b(?:and|or) ([a-z]+)\b", text)
            if m and m.group(1) in BASE_VERBS and key not in REVIEWED_COORDINATION:
                problems.append((key, f"second verb '{m.group(1)}' after {{they}}", text))
    unused = sorted(set(overrides) - set(out))
    with open(os.path.join(ODIR, "observer-items.json"), "w", encoding="utf8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1, sort_keys=False)
        fh.write("\n")
    for p in problems:
        print("CHECK", *p, sep="\t")
    for k in unused:
        print("UNUSED OVERRIDE", k)
    print(f"{len(out)} items written; {len(overrides)} overrides; {len(problems)} to check")
    return 1 if problems or unused else 0


if __name__ == "__main__":
    sys.exit(main())
