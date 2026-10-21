import { LATEST_DATA_VERSION } from "@/game/data";

const sectionTitle = "font-serif text-[30px] leading-[1.15] font-normal text-ink";
const body = "text-[17px] leading-[1.65] text-ink-soft";
const meta = "label-caps text-[10px] text-subtle";

export function AboutScreen() {
  return (
    <div className="mx-auto mt-3 flex max-w-[680px] flex-col gap-11">
      <header>
        <p className="label-caps text-xs text-rose">About</p>
        <h1 className="mt-2 text-[52px] leading-[1.05]">Tailor-Made</h1>
      </header>

      <section aria-labelledby="how-to-play" className="flex flex-col gap-4">
        <h2 id="how-to-play" className={sectionTitle}>
          How to play
        </h2>
        <p className={body}>
          Hello, and welcome! Tailor-Made dreams up clients for your off-rack dresses, so every
          frock you sew has someone to wear it. Pick a client, make their dress in Dressmaker, and
          tick off their wishes as you go. There&rsquo;s no scoring and no wrong answers. If it
          looks gothic to you, it&rsquo;s gothic. Try the daily client with friends, roll a Chaos
          card when you fancy a challenge, or send a link to a fellow dressmaker and see what they
          come up with. Happy sewing!
        </p>
      </section>

      <section aria-labelledby="directions" className="flex flex-col gap-4">
        <h2 id="directions" className={sectionTitle}>
          Directions and commission cards
        </h2>
        <p className={body}>
          In the story, clients hand you a card of requirements. Off-rack dresses have none, so
          Tailor-Made writes a few directions instead, in the same spirit as the game&rsquo;s cards.
          A direction might ask for a style, a fabric, a colour to use or avoid, or an accessory to
          add. Some ask for a small count you can tally by looking.
        </p>
        <p className={body}>
          Off-rack dresses show no scores, no Quality and no running cost, so every direction is
          something you can judge by eye. &ldquo;Only white and grey&rdquo; means every fabric is
          white or grey, and &ldquo;Only linen and cotton&rdquo; means no other fabrics. You
          don&rsquo;t have to use them all. Not keen on a direction? Reroll it. Chaos cards cannot
          be rerolled, and Burlap only is a modifier that stays put.
        </p>
      </section>

      <section aria-labelledby="credits" className="flex flex-col gap-4">
        <h2 id="credits" className={sectionTitle}>
          Credits
        </h2>
        <p className={body}>
          Tailor-Made wouldn&rsquo;t exist without the lovely people in the Dressmaker community. A
          big thank you to:
        </p>
        <p className={body}>
          Item names and details:{" "}
          <a href="https://dressmakerwiki.site" className="underline underline-offset-[3px]">
            dressmakerwiki.site
          </a>{" "}
          and its editors. The data is from build 410, checked against build 443.
          <br />
          The game itself: <cite>Dressmaker</cite> by Cozy Lives and Free Lives.
        </p>
      </section>

      <section aria-labelledby="disclaimer" className="flex flex-col gap-4">
        <h2 id="disclaimer" className={sectionTitle}>
          Disclaimer
        </h2>
        <p className={body}>
          Tailor-Made is an unofficial fan project. It is not made by, endorsed by or affiliated
          with the makers of Dressmaker. It uses no game art, no client names and no card text. The
          clients, briefs and monograms are all its own.
        </p>
      </section>

      <dl className="flex gap-6 border-t border-line pt-6 pb-2">
        <div className="flex items-baseline gap-2">
          <dt className={meta}>Data</dt>
          <dd className="text-[17px] text-ink-soft">v{LATEST_DATA_VERSION}</dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className={meta}>App build</dt>
          <dd className="text-[17px] text-ink-soft">{__APP_BUILD__}</dd>
        </div>
      </dl>
    </div>
  );
}
