import type { Metadata } from 'next'
import FadeIn from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'Famous Archetypal Figures',
  description:
    'Famous people believed to be on the extreme ends of the Continua personality spectra.',
}

const sections = [
  {
    title: 'Narcissists',
    names:
      'Adolf Hitler, Napoleon Bonaparte, Alexander The Great, Joseph Stalin, King Louis XIV, Nero, Saddam Hussein, Muammar Gaddafi, Benito Mussolini, Caligula, Mao Zedong, King Henry VIII, Fidel Castro, Pablo Picasso, Andy Warhol, Steve Jobs, Richard Nixon, Eva Peron, Cleopatra, Ivan The Terrible, Oscar Wilde, Vlad The Impaler, Marie Antoinette, King George III, Donald Trump, Kanye West (Ye), Elon Musk, Kim Kardashian, Tom Cruise, Madonna',
  },
  {
    title: 'Altruists',
    names:
      'Florence Nightingale, Albert Schweitzer, Fridtjof Nansen, George R. Price, Azim Premji, Peter Singer, William MacAskill, Danny Siegel, Dolly Parton, Angelina Jolie, Oprah Winfrey, Keanu Reeves, John Legend, Rihanna, Emma Watson, George Clooney, Colin Kaepernick, Bill Gates, Melinda French Gates, Warren Buffett, MacKenzie Scott, Vitalik Buterin, Chuck Feeney, Mother Teresa, Mahatma Gandhi, Nelson Mandela, William Wilberforce, Eleanor Roosevelt, Andrew Carnegie, John D. Rockefeller, Julius Rosenwald, Alfred Nobel, Oskar Schindler, Viktor Frankl, Pablo Casals',
  },
  {
    title: 'Hyper-Socially Attuned',
    names:
      'Abraham Lincoln, Martin Luther King Jr., Princess Diana, Albert Einstein, Jos\u00E9 Andr\u00E9s, Jane Goodall, Charles Darwin, Nicole Kidman, Alanis Morissette, Viola Davis, Steve Martin, Lady Gaga, Lin-Manuel Miranda, Sonia Sotomayor, Dolly Parton, Keanu Reeves, Oprah Winfrey, Angelina Jolie, Emma Watson, Paul Rudd, Mahatma Gandhi, Princess Diana, Abraham Lincoln, Eleanor Roosevelt',
  },
  {
    title: 'Hypo-Socially Attuned',
    names:
      'Anthony Hopkins, Dan Aykroyd, Elon Musk, Daryl Hannah, Susan Boyle, Temple Grandin, Keanu Reeves, Lady Gaga, Joaquin Phoenix, Michael Jackson, Johnny Depp, Ed Sheeran, Kristen Stewart, Barbra Streisand, Adolf Hitler, Joseph Stalin, Napoleon Bonaparte, Henry VIII, Vlad the Impaler, Donald Trump, Kanye West (Ye), Steve Jobs, Harvey Weinstein',
  },
  {
    title: 'Very Conscientious',
    names:
      'Abraham Lincoln, Eleanor Roosevelt, Mahatma Gandhi, Nelson Mandela, Mother Teresa, Kofi Annan, Wangari Maathai, Albert Einstein, Elon Musk, Keanu Reeves, Dolly Parton, Emma Watson, Hugh Jackman, Meryl Streep, Tom Hanks, Oprah Winfrey, Andrew Carnegie, Warren Buffett, Howard Schultz',
  },
  {
    title: 'Very Impulsive',
    names:
      'Alexander the Great, Napoleon Bonaparte, Alexander Hamilton, Vlad the Impaler, Grigori Rasputin, Kanye West (Ye), Charlie Sheen, Britney Spears, Lindsay Lohan, Russell Brand, Shia LaBeouf, Michael Richards, Ozzy Osbourne, Elon Musk, Richard Branson, Michael Jordan, Mike Tyson, Michael Phelps',
  },
  {
    title: 'Very Assertive',
    names:
      'Rosa Parks, Winston Churchill, Martin Luther King Jr., Nelson Mandela, Joan of Arc, Oprah Winfrey, Taylor Swift, Zendaya, Dwayne "The Rock" Johnson, Billie Jean King, Jeff Bezos, Indra Nooyi, Richard Branson, Margaret Thatcher',
  },
  {
    title: 'Submissive',
    names:
      'Cara Delevingne, Candace Cameron Bure, Gabby Reece, Porsha Williams, Hagar (the Egyptian slave of Sarah)',
    note: 'It does not appear to be highly correlated with success.',
  },
  {
    title: 'Highly Reactive',
    names:
      'Kanye West (Ye), Charlie Sheen, Britney Spears, Mel Gibson, Pete Davidson, Russell Crowe, Alexander the Great, Vlad the Impaler, King Henry VIII, Vincent van Gogh, Caravaggio',
  },
  {
    title: 'Low Reactivity',
    names:
      'Tom Hanks, Keanu Reeves, Dolly Parton, Paul Rudd, John Cena, Meryl Streep, Denzel Washington, Marcus Aurelius, George Washington, Eleanor Roosevelt, Viktor Frankl, Seneca, James Stockdale',
  },
]

export default function FamousFiguresPage() {
  return (
    <div>
      {/* Page header */}
      <section className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-8">
        <FadeIn>
          <h1 className="text-[36px] md:text-[48px] leading-[1.1] font-bold text-white mb-4">
            Famous Archetypal Figures
          </h1>
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/80">
            Using the internet &mdash; not official diagnoses but the wisdom (or
            stupidity) of the crowds &mdash; here are some people that many believe to be
            on the extreme ends of the Continua spectra.
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
                {section.note && (
                  <p className="text-[14px] italic text-foreground/50 mb-2">
                    {section.note}
                  </p>
                )}
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
