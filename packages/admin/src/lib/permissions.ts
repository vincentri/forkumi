export const WILDCARD_PERMISSION = "*";

export const STANDARD_ACTIONS = ["view", "create", "update", "delete"] as const;
export type StandardAction = (typeof STANDARD_ACTIONS)[number];

export function hasPermission(
  perms: string[],
  isProtectedRole: boolean,
  model: string,
  action: string,
): boolean {
  if (isProtectedRole) return true;
  if (perms.includes(`${WILDCARD_PERMISSION}:${action}`)) return true;
  return perms.includes(`${model}:${action}`);
}
