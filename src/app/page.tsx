import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Continua: How Opposites Align",
  description:
    "Transform conflicts into complementarity. Understand personality as fluid coordinates across six dimensions.",
};

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-24 pb-14 text-center">
        <FadeIn>
          <h1 className="mb-4 flex justify-center">
            <Image
              src="/continua-word.svg"
              alt="Continua"
              width={1752}
              height={455}
              className="h-[40px] md:h-[56px] lg:h-[68px] w-auto invert"
              priority
            />
          </h1>
          <h2 className="text-[18px] md:text-[22px] lg:text-[26px] leading-[1.3] font-light text-white/90 mb-10">
            How Opposites Align
          </h2>
        </FadeIn>
        <FadeIn delay={150}>
          <p className="text-[19px] md:text-[22px] leading-[1.6] italic text-white/80 max-w-[640px] mx-auto mb-8">
            How can we improve the human condition one person, one couple, one
            family, and one office at a time?
          </p>
        </FadeIn>
        <FadeIn delay={250}>
          <Link
            href="/about"
            className="inline-block rounded-xl bg-white/90 px-8 py-4 text-lg font-bold text-foreground transition-all hover:bg-white shadow-sm"
          >
            About Continua
          </Link>
        </FadeIn>
      </section>

      {/* Philosophy — plain text on gradient, no card */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-12">
        <FadeIn>
          <div className="text-[17px] md:text-[19px] leading-[1.7] text-white/90 space-y-5">
            <p>
              This is not a goal with an end state but, rather, the beginning of
              a process. All personality characteristics function on continua.
              Most people fall somewhere between the extremes, and even those
              positions shift depending on context, stress, growth, and
              intention.
            </p>
            <p>
              The primary purpose of this exploration is to give people tools to
              better relate to their family, friends, and colleagues &mdash; and
              yes, to build stronger, more balanced teams at work. To transform
              conflicts that feel like character incompatibility into
              recognition of complementary positioning. To replace judgment with
              curiosity. To move from &ldquo;why can&rsquo;t you be
              different?&rdquo; to &ldquo;how can we leverage our
              differences?&rdquo;
            </p>
            <p>
              We introduce that vision: a way of seeing personality as fluid
              coordinates across six primary axes &mdash; Empathy,
              Self-Orientation, Social Attunement, Conscientiousness, Agency,
              and Reactivity. Together, these six dimensions form a living
              system &mdash; a portrait of human nature in motion.
            </p>
            <p>
              Behind all six axes lies a deeper capacity: meta-awareness &mdash;
              the ability to observe your own personality patterns as they
              unfold. This metacognition is the real instrument for conducting
              your inner orchestra, the tool that lets you notice where you are
              on each continuum and choose, with intention, where you want to
              move.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Privacy Policy — small link, bottom left, home page only */}
      <div className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-8">
        <Link
          href="/privacy"
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
