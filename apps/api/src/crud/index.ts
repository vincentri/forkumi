// CRUD resource barrel — pnpm crud:scaffold appends exports here automatically.
// Each export drives a tRPC router, nav link, and admin page with no extra config.
//
// Example (after running pnpm crud:scaffold product):
// export { ProductCRUD } from "./product";

// Built-in admin resources — configs come from @repo/admin,
// but are re-exported here so the barrel stays the single source for all models.
export { UserCRUD } from "./user";
export { RoleCRUD } from "./role";
export { SettingsCRUD } from "./settings";
export { BlogCRUD } from "./blog";
export { BlogCategoryCRUD } from "./blogCategory";
export { NewsletterSubscriberCRUD } from "./newsletterSubscriber";
export { PageCRUD } from "./page";
export { FrontPageSettingsCRUD } from "./frontPageSetting";
