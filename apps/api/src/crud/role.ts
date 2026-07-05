import { createRoleCRUD, SettingsCRUD, UserCRUD } from "@repo/admin";
import { derivePermissionOptions } from "@repo/admin/server";
import type { CRUDConfig } from "@repo/crud";

export const RoleCRUD = createRoleCRUD(
  derivePermissionOptions([
    UserCRUD,
    SettingsCRUD,
    // ponytail: stub so role:* permissions are grantable. The real RoleCRUD
    // is built FROM these options — including it literally would cycle.
    { model: "role", label: "Roles" } as CRUDConfig,
  ]),
);
