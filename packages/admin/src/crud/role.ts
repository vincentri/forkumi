import { defineCRUD } from "@repo/crud";
import type { CRUDConfig, SelectOption } from "@repo/crud";

export function createRoleCRUD(
  permissionOptions: SelectOption[],
): CRUDConfig {
  return defineCRUD({
    model: "role",
    label: "Roles",
    icon: "Shield",
    navGroup: "Administration",
    fields: [
      { name: "name", type: "text", label: "Role Name", required: true },
      {
        name: "permissions",
        type: "multicheck",
        label: "Permissions",
        options: permissionOptions,
      },
      {
        name: "protected",
        type: "boolean",
        label: "Protected",
        showInForm: false,
      },
      {
        name: "createdAt",
        type: "date",
        label: "Created",
        showInForm: false,
      },
    ],
  });
}
