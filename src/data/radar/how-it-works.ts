// Single source for the "How it works" guide. Rendered twice: as a static,
// crawlable page at /radar/how-it-works/ and as an on-demand modal in the app.

export interface GuideDefinition {
  term: string;
  def: string;
}

export interface GuideStep {
  id: string;
  kicker: string;
  title: string;
  body: string;
  definitions?: GuideDefinition[];
  footnote?: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'reading',
    kicker: 'Reading the radar',
    title: 'Four rings, four quadrants, one judgement each',
    body: 'Every technology sits in a ring that states how much confidence it has earned, and a quadrant that says what kind of thing it is. Position is not popularity — it is a call on whether this deserves your budget and attention right now. Click any blip and you get the written brief behind the placement, the signals it rests on, and what would move it.',
    definitions: [
      { term: 'Adopt', def: 'Proven and low-risk. Invest now.' },
      { term: 'Trial', def: 'Worth piloting on a real project, with real stakes.' },
      { term: 'Assess', def: 'Worth understanding. Not yet worth committing to.' },
      { term: 'Hold', def: 'Proceed with caution, or actively de-prioritise.' },
    ],
    footnote:
      'Momentum glyphs show direction of travel. How far a blip sits from the inner edge of its ring shows how close it is to promotion.',
  },
  {
    id: 'yours',
    kicker: 'Making it yours',
    title: 'The radar answers differently depending on who is asking',
    body: 'Switch industry and the whole set changes — each one is curated independently, not a single list relabelled. Pick a role path and you get the handful of technologies that actually bear on that job. Then mark where you stand on each one under Your Position, and the radar becomes a gap analysis: what you adopted too early, what you are late on, and what you have not looked at at all.',
    footnote: 'Your position is stored in your own browser. Nothing is sent anywhere, and there is nothing to sign up for.',
  },
  {
    id: 'further',
    kicker: 'Taking it further',
    title: 'Eight views, and all of it is yours to take away',
    body: 'Compare holds one technology up against every industry at once. Roadmap sequences by time horizon and shows what each technology depends on. Ecosystem, By Function and Geography cut the same data by vendor, by business function, and by where capability concentrates. Press ⌘K to jump to anything from anywhere.',
    footnote:
      'Export the whole radar as CSV or JSON, print it to PDF, or deep-link to a single technology. Free to use and cite with attribution.',
  },
];

export const GUIDE_FAQ: { q: string; a: string }[] = [
  {
    q: 'What do the rings on a technology radar mean?',
    a: 'Adopt means proven and low-risk — invest now. Trial means worth piloting on a real project. Assess means worth understanding but not yet worth committing to. Hold means proceed with caution or de-prioritise. The ring is a judgement about confidence and timing, not about how popular or how new something is.',
  },
  {
    q: 'How is each placement decided?',
    a: 'Each technology gets a written brief setting out the reasoning, plus the signals the placement rests on — adoption evidence, vendor behaviour, standards maturity and the practical cost of being wrong. Where a technology depends on another being in place first, that dependency is recorded and shown on the Roadmap view.',
  },
  {
    q: 'Is the radar independent?',
    a: 'Yes. It is curated by Shailesh Kumar, is not affiliated with any employer or vendor, carries no sponsored placements, and contains no confidential information.',
  },
  {
    q: 'Can I use or cite the radar?',
    a: 'Yes, with attribution. The complete radar is published as machine-readable JSON at /radar/data.json, and each industry can be exported as CSV or JSON directly from the app.',
  },
  {
    q: 'Do I need an account to use it?',
    a: 'No. There is nothing to sign up for. Your Position and any filters are kept in your own browser and can be shared as a link if you choose to.',
  },
];
