const isInShortcut = (a: string) => a.startsWith("-");

export const moveLeft = (active: string, total: number) => {
  if (total === 0) {
    return active;
  }
  if (isInShortcut(active)) {
    const currentIndex = Math.abs(Number(active));
    const next = currentIndex - 1;
    return `-${next < 0 ? total - 1 : next}`;
  }
  return `-${total - 1}`;
};

export const moveRight = (active: string, total: number) => {
  if (total === 0) {
    return active;
  }
  if (isInShortcut(active)) {
    const currentIndex = Math.abs(Number(active));
    const next = currentIndex + 1;
    return `-${next > total - 1 ? 0 : next}`;
  }
  return `-0`;
};

export const moveUp = (active: string, total: number) => {
  if (isInShortcut(active)) {
    return `${total - 1}`;
  }
  const res = moveLeft(`-${active}`, total);
  if (res.startsWith("-")) {
    return res.slice(1);
  }
  return res;
};

export const moveDown = (active: string, total: number) => {
  if (isInShortcut(active)) {
    return "0";
  }
  const res = moveRight(`-${active}`, total);
  if (res.startsWith("-")) {
    return res.slice(1);
  }
  return res;
};
