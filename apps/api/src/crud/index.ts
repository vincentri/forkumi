export { RoleCRUD } from "./role";
export { SettingsCRUD } from "./setting";
export { UserCRUD } from "./user";
export { FrontPageSettingsCRUD } from "./frontPageSetting";

import { RoleCRUD } from "./role";
import { SettingsCRUD } from "./setting";
import { UserCRUD } from "./user";
import { FrontPageSettingsCRUD } from "./frontPageSetting";

export const CRUDConfigs = {
  user: UserCRUD,
  role: RoleCRUD,
  settings: SettingsCRUD,
  frontPageSettings: FrontPageSettingsCRUD,
} as const;
