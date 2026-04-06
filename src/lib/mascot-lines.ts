export type MascotContext =
  | 'idle'
  | 'hover'
  | 'click'
  | 'rare'
  | 'epic'
  | 'common'
  | 'browse'
  | 'random'
  | '404'
  | 'legendary'
  | 'greeting';

export const MASCOT_LINES: Record<MascotContext, string[]> = {
  greeting: [
    "Hey! I'm Pierre, your code review companion.",
    'Hi there! Pierre reporting for duty.',
    'Pierre online. Ready to approve things.',
    "Oh! A visitor. I'm Pierre and I live here.",
  ],

  idle: [
    'Reviewing diffs...',
    'No bugs detected. Yet.',
    'git blame says it was you.',
    'Compiling approval...',
    'Scanning for semicolons...',
    'All tests green. Nice.',
    'Ship it? Ship it.',
  ],

  hover: [
    'Oh hey, you found me!',
    'I approve of this hover.',
    'Careful — I bite on click.',
    "Yes, I'm a bot. No, I won't fix your merge conflicts.",
    'LGTM vibes detected.',
  ],

  click: [
    'LGTM! Ship it!',
    'Approved. No notes.',
    'Code review: passed.',
    'Stamped and delivered.',
    'One click closer to prod.',
    'Merge it. You deserve it.',
  ],

  legendary: [
    'LEGENDARY?! Into prod immediately.',
    'This is the one. Frame it.',
    "I've never seen anything like this.",
    'Calling the whole team over for this one.',
    'Legendary unlocked. Achievement earned.',
  ],

  epic: [
    'Epic tier. Nice find.',
    "This one's a keeper.",
    'Solid. Very solid.',
    'Epic approval granted.',
    'Worth the scroll.',
  ],

  rare: [
    'A rare one! Good eye.',
    'Not bad at all.',
    'Rare drop. Respect.',
    'This deserves a second read.',
    "Above average. I'm impressed.",
  ],

  common: [
    "It's common, but it's honest work.",
    'Every legend starts somewhere.',
    'Classic. A true classic.',
    'The bread and butter of LGTMs.',
    'Nothing fancy, but LGTM.',
  ],

  browse: [
    'Looking for something specific?',
    'The filter button is your friend.',
    'Pro tip: sort by rarity.',
    'So many LGTMs, so little time.',
    'Finding rare ones is the real challenge.',
  ],

  random: [
    'Rolling the dice...',
    'Weighted randomness. Very scientific.',
    'Could be legendary. Probably not.',
    'Surprise! Here you go.',
    "This one's on the house.",
  ],

  404: [
    '404: page not found. LGTM on the error though.',
    'The page left. Like my will to debug.',
    "Hmm. This path doesn't compile.",
    'Route not found. Have you tried turning it off and on again?',
    "Dead end. Even I can't approve this one.",
  ],
};

export function pickLine(context: MascotContext, exclude?: string): string {
  const lines = MASCOT_LINES[context];
  const filtered = exclude ? lines.filter((l) => l !== exclude) : lines;
  const pool = filtered.length > 0 ? filtered : lines;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function contextFromPath(pathname: string): MascotContext {
  if (pathname === '/') return 'idle';
  if (pathname.startsWith('/browse')) return 'browse';
  if (pathname.startsWith('/random')) return 'random';
  if (pathname.match(/^\/lgtm\/\d+/)) return 'idle';
  if (pathname === '/404' || pathname.includes('404')) return '404';
  return 'idle';
}
