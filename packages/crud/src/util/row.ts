export function isRowProtected(row: Record<string, unknown>): boolean {
  return Boolean(row.protected) && !row.isPendingInvite;
}

export function isRowDeletable(row: Record<string, unknown>, currentUserEmail?: string): boolean {
  if (isRowProtected(row)) return false;
  if (currentUserEmail && row.email === currentUserEmail) return false;
  return true;
}
