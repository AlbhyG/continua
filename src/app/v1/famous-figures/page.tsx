import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'Famous Archetypal Figures | Continua (v1)',
  description:
    'Famous people believed to be on the extreme ends of the Continua personality spectra.',
}

const sections = [
  {
    title: 'Narcissists',
    names:
      'Adolf Hitler, Napoleon Bonaparte, Alexander The Great, Joseph Stalin, King Louis XIV, Nero, Saddam Hussein, Muammar Gaddafi, Benito Mussolini, Caligula, Mao Zedong, King Henry VIII, Fidel Castro, Pablo Picasso, Andy Warhol, Steve Jobs, Richard Nixon, Eva Peron, Cleopatra, Ivan The Terrible, Oscar Wilde, Vlad The Impaler, Marie Antoinette, King George III, Donald Trump, Kanye West (Ye), Elon Musk, Steve Jobs, Kim Kardashian, Tom Cruise, Madonna',
  },
  {
    title: 'Altruists',
    names:
      'Florence Nightingale, Albert Schweitzer, Fridtjof Nansen, George R. Price, Azim Premji, Peter Singer, William MacAskill, Danny Siegel, Dolly Parton, Angelina Jolie, Oprah Winfrey, Keanu Reeves, John Legend, Rihanna, Emma Watson, George Clooney, Colin Kaepernick, Bill Gates, Melinda French Gates, Warren Buffett, MacKenzie Scott, Vitalik Buterin, Chuck Feeney, Mother Teresa, Mahatma Gandhi, Nelson Mandela, William Wilberforce, Eleanor Roosevelt, Andrew Carnegie, John D. Rockefeller, Julius Rosenwald, Alfred Nobel, Oskar Schindler, Viktor Frankl, Pablo Casals',
  },
  {
    title: 'Hyper Empathetic',
    names:
      'Abraham Lincoln, Martin Luther King Jr., Princess Diana, Albert Einstein, Jos\u00E9 Andr\u00E9s, Jane Goodall, Charles Darwin, Nicole Kidman, Alanis Morissette, Viola Davis, Steve Martin, Lady Gaga, Lin-Manuel Miranda, Sonia Sotomayor, Dolly Parton, Keanu Reeves, Oprah Winfrey, Angelina Jolie, Emma Watson, Paul Rudd, Mahatma Gandhi, Martin Luther King Jr., Princess Diana, Abraham Lincoln, Eleanor Roosevelt',
  },
  {
    title: 'Hypo-Socially Attuned',
    names:
      'Anthony Hopkins, Dan Aykroyd, Elon Musk, Daryl Hannah, Susan Boyle, Temple Grandin, Keanu Reeves, Lady Gaga, Joaquin Phoenix, Michael Jackson, Johnny Depp, Ed Sheeran, Kristen Stewart, Barbra Streisand, Adolf Hitler, Joseph Stalin, Napoleon Bonaparte, Henry VIII, Vlad the Impaler, Donald Trump, Kanye West (Ye), Elon Musk, Steve Jobs, Harvey Weinstein',
  },
  {
    title: 'Very Conscientious',
    names:
      'Abraham Lincoln, Eleanor Roosevelt, Mahatma Gandhi, Nelson Mandela, Mother Teresa, Kofi Annan, Wangari Maathai, Albert Einstein, Elon Musk, Keanu Reeves, Dolly Parton, Emma Watson, Hugh Jackman, Meryl Streep, Tom Hanks, Oprah Winfrey, Andrew Carnegie, Warren Buffett, Howard Schultz',
  },
]

export default function V1FamousFiguresPage() {
  return (
    <div>
      {/* Back button */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-16 pb-2">
        <Link
          href="/v1/my-info"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
          My Info
        </Link>
      </section>

      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-4 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-4">
            Famous Archetypal Figures
          </h1>
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/80">
            Using the internet &mdash; not official diagnoses but the opinions of
            the crowds, here are some people that many believe to be on the
            extreme ends of the continua.
          </p>
        </FadeIn>
      </section>

      {/* Category cards */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-4">
          {sections.map((section, i) => (
            <FadeIn key={section.title} delay={i * 60}>
              <div className="glass-card p-6 h-full">
                <h2 className="text-[20px] md:text-[22px] font-bold mb-2">
                  {section.title}
                </h2>
                <p className="text-[15px] md:text-[16px] leading-[1.6] text-foreground/70">
                  {section.names}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}
