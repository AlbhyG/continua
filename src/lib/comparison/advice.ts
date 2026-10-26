import type { AxisScores } from "@/lib/quiz/scoring";
import type { Shape } from "./compare";

// Draft copy for all six axes, approved by Albhy (Oct 26, 2026) pending review
// with a psychometrician.
// Rules (requirements section 2.3): hedged wording, never "you are"/"you will",
// no pathologizing language, no position framed as better or worse, descriptive
// and not advice. {a}/{b} are the two people's names; in divergent text,
// {higher}/{lower} are the higher- and lower-scoring person.

type AxisAdvice = {
  intro: string;
  shapes: Record<Shape, string>;
};

const ADVICE: Record<keyof AxisScores, AxisAdvice> = {
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
  self_orientation: {
    intro:
      "Self-Orientation is about whose interests a person's choices tend to serve, their own or other people's. It describes where effort naturally goes, not whether someone is a good person.",
    shapes: {
      aligned_high:
        "{a} and {b} both tend to look after their own goals and needs first. Pairs like this often respect each other's independence and don't expect much sacrifice. The same pattern can mean that when their interests pull in different directions, neither is quick to give way.",
      aligned_low:
        "{a} and {b} both tend to put other people's needs ahead of their own. Pairs like this often describe a generous, giving partnership. It can also mean that each defers to the other, and their own needs go unspoken until they build up.",
      aligned_middle:
        "{a} and {b} both tend to balance their own interests with other people's, leaning one way or the other depending on what's at stake. Pairs like this often find give-and-take comes fairly naturally.",
      divergent:
        "{higher} tends to look after their own interests first, while {lower} tends to put others' needs ahead of their own. Pairs with this shape can settle into a pattern where one person gives and the other receives without either fully noticing. Each brings something: one keeps track of what they need, and the other keeps track of what everyone else needs.",
    },
  },
  conscientiousness: {
    intro:
      "Conscientiousness is about whether a person tends to plan and follow through over time, or to act in the moment. Both are ways of getting through a day; neither is the right one.",
    shapes: {
      aligned_high:
        "{a} and {b} both tend to plan ahead, keep commitments and finish what they start. Pairs like this often run shared tasks smoothly. They may also find it harder to drop the plan when something unexpected and worthwhile comes along.",
      aligned_low:
        "{a} and {b} both tend to act on what feels right in the moment rather than on a plan. Pairs like this often enjoy spontaneity and flexibility together. Practical details and deadlines can also slip, because neither person naturally keeps track of them.",
      aligned_middle:
        "{a} and {b} both tend to plan when it matters and improvise when it doesn't. Pairs like this often agree, without much discussion, about how much structure a situation needs.",
      divergent:
        "{higher} tends to plan, organize and follow through, while {lower} tends to decide in the moment and adapt as things come. Pairs with this shape sometimes experience it as one person seeming rigid and the other seeming unreliable. Together they often cover more ground than either would alone: one keeps things on track, and the other notices when the track should change.",
    },
  },
  agency: {
    intro:
      "Agency is about whether a person tends to take the lead and assert what they want, or to defer and go along with others. It describes a style of acting, not strength or weakness.",
    shapes: {
      aligned_high:
        "{a} and {b} both tend to take the lead and say what they want. Pairs like this often get things done quickly and openly. When they disagree, both may push, and decisions can turn into contests.",
      aligned_low:
        "{a} and {b} both tend to defer and accommodate. Pairs like this often feel easygoing and considerate. Decisions can also stall, with each waiting for the other to choose.",
      aligned_middle:
        "{a} and {b} both tend to lead in some situations and follow in others. Pairs like this often pass the lead back and forth without much friction.",
      divergent:
        "{higher} tends to take the lead and assert what they want, while {lower} tends to defer and go along. Pairs with this shape often run smoothly, because the roles are clear. Over time, though, {lower}'s preferences may get heard less than they deserve, unless the pair makes room for them.",
    },
  },
  reactivity: {
    intro:
      "Reactivity is about how strongly a person feels things, good and bad, and how long those feelings last. It describes intensity, not mood or stability.",
    shapes: {
      aligned_high:
        "{a} and {b} both tend to feel things strongly and for a while, joy and frustration alike. Pairs like this often share a vivid, expressive life together. When both are stirred up at the same moment, feelings can also build on each other.",
      aligned_low:
        "{a} and {b} both tend to feel things more mildly and to settle quickly. Pairs like this often stay calm through stressful stretches. The same evenness can mean strong feelings, when they do come, aren't easily recognized or expressed between them.",
      aligned_middle:
        "{a} and {b} both tend to feel things clearly without being carried away by them. Pairs like this often respond to the same events with a similar sense of proportion.",
      divergent:
        "{higher} tends to feel things more intensely and for longer, while {lower} tends to feel them more mildly and to settle sooner. Pairs with this shape sometimes experience it as one person overreacting and the other not caring. Often it's neither: the same event simply lands with different force. One brings energy and expressiveness, and the other brings steadiness.",
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
