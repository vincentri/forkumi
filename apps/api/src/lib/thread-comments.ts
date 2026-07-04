function byDateDesc<T extends { createdAt: Date | string }>(a: T, b: T): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function buildThreadedComments<
  T extends { id: string; parentId: string | null; createdAt: Date | string },
>(comments: T[]): Array<T & { replies: T[] }> {
  const sorted = [...comments].sort(byDateDesc);
  const repliesByParent = new Map<string, T[]>();
  for (const c of sorted) {
    if (!c.parentId) continue;
    const arr = repliesByParent.get(c.parentId) ?? [];
    arr.push(c);
    repliesByParent.set(c.parentId, arr);
  }
  return sorted
    .filter((c) => !c.parentId)
    .map((root) => ({ ...root, replies: repliesByParent.get(root.id) ?? [] }));
}
