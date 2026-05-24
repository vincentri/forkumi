export function createGetPublicSettings(
  prisma: any,
  publicKeys: string[],
  options?: { namespace?: string },
) {
  return async function getPublicSettings(): Promise<
    Record<string, string | null>
  > {
    try {
      const rows: { key: string; value: string | null }[] =
        await prisma.settings.findMany({
          where: options?.namespace
            ? { namespace: options.namespace }
            : { key: { in: publicKeys } },
          select: { key: true, value: true },
        });
      return Object.fromEntries(rows.map((r) => [r.key, r.value ?? null]));
    } catch {
      return {};
    }
  };
}
