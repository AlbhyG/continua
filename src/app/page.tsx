import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Continua - Personality Assessment Platform',
  description: 'Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.'
}

export default function Home() {
  return (
    <main className="max-w-[375px] md:max-w-[720px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[48px] md:text-[64px] leading-[1.2] font-bold mb-4">
        The Personality Continua
      </h1>
      <h2 className="text-[24px] md:text-[28px] leading-[1.3] font-light mb-8">
        a new language for understanding each other
      </h2>
      <p className="text-[18px] md:text-[20px] leading-[1.6] italic mb-8">
        How can we improve the human condition one person, one couple, one family, and one office at a time?
      </p>
      <div className="text-[18px] md:text-[20px] leading-[1.6] space-y-5">
        <p>
          This is not a goal with an end state but, rather, the beginning of a process. All personality characteristics function on continua. Most people fall somewhere between the extremes, and even those positions shift depending on context, stress, growth, and intention.
        </p>
        <p>
          The purpose of this exploration is not to define personality in a way that makes more effective business teams or helps people find their perfect mate. The purpose is to give people tools to better relate to their family, friends, and colleagues. To transform conflicts that feel like character incompatibility into recognition of complementary positioning. To replace judgment with curiosity. To move from "why can't you be different?" to "how can we leverage our differences?"
        </p>
        <p>
          We introduce that vision: a way of seeing personality as fluid coordinates across six primary axes — Empathy, Self-Orientation, Social Attunement, Conscientiousness, Agency, and Reactivity. Together, these six dimensions form a living system — a portrait of human nature in motion.
        </p>
      </div>
    </main>
  );
}
