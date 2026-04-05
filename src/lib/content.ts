import type { Rarity } from '@/lib/lgtm';

export const CATEGORY_TAGLINES: Record<string, string> = {
  funny: 'make them laugh',
  nerd: 'for the nerds',
  chaotic: 'expect the unexpected',
  wholesome: 'spread the love',
  sarcastic: 'say it with sarcasm',
  existential: 'question everything',
  corporate: 'synergize the approval',
};

export const CATEGORY_COLORS: Record<string, string> = {
  funny: '#f59e0b',
  sarcastic: '#ef4444',
  wholesome: '#10b981',
  nerd: '#6366f1',
  existential: '#8b5cf6',
  corporate: '#0ea5e9',
  chaotic: '#f97316',
};

export const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: 'var(--color-common)',
  rare: 'var(--color-rare)',
  epic: 'var(--color-epic)',
  legendary: 'var(--color-legendary)',
};

export const RARITY_TAGLINES: Record<Rarity, string> = {
  common: 'the everyday approval',
  rare: 'a bit more interesting',
  epic: 'worth a double-take',
  legendary: 'rare, hilarious, unforgettable',
};

export const FACTS = [
  {
    year: '2000s',
    text: 'Developers started writing "LGTM" as quick shorthand approval in mailing list code reviews, faster to type than "looks good to me" in a multi-threaded reply chain.',
  },

  {
    year: '2006',
    text: 'Linus Torvalds created Git in two weeks after the Linux kernel community lost access to their previous version control system.',
  },

  {
    year: '2012',
    text: 'GitHub shipped pull requests, turning code review from an email thread into a structured, comment-threaded workflow used by millions.',
  },

  {
    year: '2019',
    text: 'GitHub added the formal "Approve" button to pull requests, giving LGTM an official home in the review flow.',
  },

  {
    year: '2026+',
    text: 'LGTM has escaped the terminal. Developers use it playfully everywhere: Slack, Discord, memes, PRs. Sometimes with very creative alternative meanings.',
  },
];
