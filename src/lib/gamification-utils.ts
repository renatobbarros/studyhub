export const LEVEL_TITLES = [
  "Novato do Hub", // Level 1
  "Explorador de Ideias", // Level 2
  "Estudante Aplicado", // Level 3
  "Mestre dos Resumos", // Level 4
  "Sábio da Guilda", // Level 5
  "Lenda Acadêmica", // Level 6+
];

export const XP_PER_LEVEL = 200;

/**
 * Retorna informações sobre o nível atual baseado no XP.
 * Esta é uma função pura segura para ser usada em qualquer lugar.
 */
export function getLevelInfo(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  const xpInLevel = xp % XP_PER_LEVEL;
  const progress = (xpInLevel / XP_PER_LEVEL) * 100;
  
  return { level, title, progress, nextLevelXp: XP_PER_LEVEL - xpInLevel };
}
