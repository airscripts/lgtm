export function showEasterEgg(): void {
  if (typeof window === 'undefined') return;

  const LGTM_FIG = `
 _____   _______ _______ _______ 
|     |_|     __|_     _|   |   |
|       |    |  | |   | |       |
|_______|_______| |___| |__|_|__|
                                  
Wow, you're a fellow hacker!
Here is your reward: https://www.youtube.com/watch?v=dQw4w9WgXcQ
`;

  console.log(`%c${LGTM_FIG}`, 'color: #7c6cf5; font-family: monospace;');
}
