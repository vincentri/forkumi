import type { CRUDConfig } from "@repo/crud";
import { STANDARD_ACTIONS } from "../lib/permissions";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function derivePermissionOptions(
  configs: CRUDConfig[],
  extraPermissions: { value: string; label: string }[] = [],
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [
    ...STANDARD_ACTIONS.map((a) => ({
      value: `*:${a}`,
      label: `* — ${capitalize(a)} (all)`,
    })),
  ];

  for (const config of configs) {
    const actions =
      config.readOnly
        ? (["view"] as const)
        : config.mode === "keyValue"
          ? (["view", "update"] as const)
          : STANDARD_ACTIONS;
    for (const action of actions) {
      options.push({
        value: `${config.model}:${action}`,
        label: `${config.label} — ${capitalize(action)}`,
      });
    }
  }

  return [...options, ...extraPermissions];
}
