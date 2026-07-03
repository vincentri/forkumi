export interface AdminNavLink {
  label: string;
  href: string;
  icon?: string;
  navGroup?: string;
  navGroupIcon?: string;
  /**
   * Custom permissions registered in the Role editor.
   * First entry also controls nav visibility.
   * e.g. ["blog:view", "blog:create", "blog:update", "blog:delete"]
   * Omit to show the link to all authenticated users.
   */
  permissions?: string[];
}

export interface PasswordHasher {
  hash: (password: string, saltOrRounds: string | number) => Promise<string>;
  compare: (password: string, hash: string) => Promise<boolean>;
}
