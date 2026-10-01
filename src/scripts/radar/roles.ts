import type { IndustryRadar, QuadrantId, Ring, Technology } from '../../data/radar/types';

export interface RolePath {
  id: string;
  label: string;
  blurb: string;
  /** What this role should read, in order, and why. */
  steps: { title: string; detail: string }[];
  pick: (ind: IndustryRadar) => Technology[];
}

const byRing = (ind: IndustryRadar, rings: Ring[]) =>
  ind.technologies.filter((t) => rings.includes(t.ring));

const byQuadrant = (ind: IndustryRadar, quadrants: QuadrantId[], rings: Ring[]) =>
  ind.technologies.filter((t) => quadrants.includes(t.quadrant) && rings.includes(t.ring));

export const ROLE_PATHS: RolePath[] = [
  {
    id: 'exec',
    label: 'Executive / CxO',
    blurb: 'You need the investment case, not the implementation detail.',
    steps: [
      { title: 'Read the three themes', detail: 'They summarise what actually changed this edition in one minute.' },
      { title: 'Review the Adopt ring', detail: 'These are proven and low-risk. If you are not doing them, that is the budget conversation.' },
      { title: 'Check the Editor’s note', detail: 'Five bets worth defending, with the reasoning behind each.' },
      { title: 'Run Your Position', detail: 'Produces a readiness score and a gap list you can take to a leadership meeting.' },
    ],
    pick: (ind) => byRing(ind, ['adopt']),
  },
  {
    id: 'architect',
    label: 'Enterprise Architect',
    blurb: 'You care about platform choices, sequencing and the trust stack.',
    steps: [
      { title: 'Start with the Roadmap', detail: 'Technologies grouped by when to act, with what each one builds on.' },
      { title: 'Study Platforms & Techniques', detail: 'The two quadrants where architectural commitments are hardest to reverse.' },
      { title: 'Use Compare', detail: 'See where your industry diverges from the others — divergence usually signals a constraint worth understanding.' },
      { title: 'Review the Hold ring', detail: 'Knowing what to stop is as valuable as knowing what to start.' },
    ],
    pick: (ind) => byQuadrant(ind, [2, 3], ['adopt', 'trial']),
  },
  {
    id: 'engineer',
    label: 'Engineering Lead',
    blurb: 'You want the tools, techniques and practices your teams should pick up next.',
    steps: [
      { title: 'Scan Tools & Languages', detail: 'Concrete, adoptable choices with the shortest path to value.' },
      { title: 'Work the Trial ring', detail: 'These are ready for a real pilot on a real project, not a prototype.' },
      { title: 'Check the dependencies', detail: 'Each brief lists what a technology builds on, so you sequence rather than stall.' },
      { title: 'Export the data', detail: 'Download CSV or JSON to drop into your own planning tools.' },
    ],
    pick: (ind) => byQuadrant(ind, [3, 4], ['adopt', 'trial']),
  },
  {
    id: 'strategist',
    label: 'Investor / Strategist',
    blurb: 'You are looking for what is forming, not what is settled.',
    steps: [
      { title: 'Go straight to Assess', detail: 'Early enough to matter, real enough to be worth understanding.' },
      { title: 'Read the watchlist', detail: 'Signals that are not yet technologies — where the next edition’s entries come from.' },
      { title: 'Check Geography', detail: 'Where capability concentrates tells you where capital and talent are flowing.' },
      { title: 'Use Ecosystem', detail: 'Today’s vendor roadmap is tomorrow’s radar entry.' },
    ],
    pick: (ind) => byRing(ind, ['assess']),
  },
];

export const rolePathById = (id: string) => ROLE_PATHS.find((r) => r.id === id);
