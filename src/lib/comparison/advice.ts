import type { AxisScores } from "@/lib/quiz/scoring";
import type { Shape } from "./compare";

// FIRST DRAFT, not final copy. Two axes only; the others are still to be written,
// and the page simply omits the paragraph for an axis with no text yet.
// Rules (requirements section 2.3): hedged wording, never "you are"/"you will",
// no pathologizing language, no position framed as better or worse, descriptive
// and not advice. {a}/{b} are the two people's names; in divergent text,
// {higher}/{lower} are the higher- and lower-scoring person.

type AxisAdvice = {
  intro: string;
  shapes: Record<Shape, string>;
};

const ADVICE: Partial<Record<keyof AxisScores, AxisAdvice>> = {
  social_attunement: {
    intro:
      "Social Attunement is about how much social information a person receives, such as the tone of a room, a shift in mood, or what goes unsaid. It describes perception, not how much someone cares.",
    shapes: {
      aligned_high:
        "{a} and {b} both tend to notice a lot of social detail: shifts in mood, small changes in tone, what is left unsaid. Pairs like this often describe feeling understood quickly. Because each person is receiving so much, small signals can also be picked up and echoed back and forth between them.",
      aligned_low:
        "{a} and {b} both tend to receive less social information and to take things at face value. Pairs like this often find that conversation is direct and uncomplicated. The same pattern can mean that a mood or a hint that neither of them picks up on goes unnoticed for a while, until someone says it out loud.",
      aligned_middle:
        "{a} and {b} both tend to tune in when it matters and tune out when it does not. Pairs like this often adjust to the moment, more attentive in an intimate conversation and less so during a work discussion.",
      divergent:
        "{higher} tends to pick up on more of what is happening socially, such as moods, hints and what is left unsaid, while {lower} tends to receive less of it and to take things more directly. This is a difference in what each person is receiving, not in how much either of them cares. Pairs with this shape sometimes experience it as one person seeming to make too much of something and the other seeming not to notice. Each view has its uses: one tends to notice more, and the other tends to stay steadier and more direct.",
    },
  },
  empathy: {
    intro:
      "Empathy is about how much another person's suffering matters to someone and how much they want to relieve it. It can show up through strong feeling or through reasoning, and both count.",
    shapes: {
      aligned_high:
        "{a} and {b} both tend to feel that other people's difficulties matter and to want to ease them. Pairs like this often share a sense of what is worth caring about. Because each may reach that concern differently, through feeling or through reasoning, it can look different from the outside even when it is equally strong.",
      aligned_low:
        "{a} and {b} both tend to give other people's difficulties less weight in their day-to-day thinking. Pairs like this often stay steady and practical when someone else is struggling. It can also mean neither of them is quick to raise or notice concern about others. This describes where attention tends to go, not how either person treats people.",
      aligned_middle:
        "{a} and {b} both tend to care about other people's difficulties without letting it take over. Pairs like this often describe concern that stays in the background and comes forward when it is needed.",
      divergent:
        "{higher} tends to give other people's suffering more weight and to feel a stronger wish to help, while {lower} tends to give it less. Pairs with this shape sometimes read the difference as \"one of us cares and one of us does not.\" Concern can show up differently, through visible feeling in one person and through practical help or steady commitment in another, so a difference in how it looks is not always a difference in how much each person cares.",
    },
  },
};

export function axisIntro(axis: keyof AxisScores): string | null {
  return ADVICE[axis]?.intro ?? null;
}

export function adviceFor(
  axis: keyof AxisScores,
  shape: Shape,
  names: { a: string; b: string; higher: string; lower: string }
): string | null {
  const text = ADVICE[axis]?.shapes[shape];
  if (!text) return null;
  return text
    .replaceAll("{a}", names.a)
    .replaceAll("{b}", names.b)
    .replaceAll("{higher}", names.higher)
    .replaceAll("{lower}", names.lower);
}
