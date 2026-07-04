export const DEFAULT_ADMIN_ASSETS = [
  {
    key: "defaultLogoLight",
    path: "/defaults/admin/default-logo-light.png",
  },
  {
    key: "defaultLogoDark",
    path: "/defaults/admin/default-logo-dark.png",
  },
  {
    key: "defaultFavicon",
    path: "/defaults/admin/default-favicon.png",
  },
] as const;

export const DEFAULT_ADMIN_ASSET_PATHS = DEFAULT_ADMIN_ASSETS.map((asset) => asset.path);

export const DEFAULT_BRANDING_SETTINGS = [
  { key: "brandingAppName", value: "Quantyx" },
  { key: "brandingLogoLightUrl", value: DEFAULT_ADMIN_ASSETS[0].path },
  { key: "brandingLogoDarkUrl", value: DEFAULT_ADMIN_ASSETS[1].path },
  { key: "brandingFaviconUrl", value: DEFAULT_ADMIN_ASSETS[2].path },
  { key: "brandingLoginTitle", value: "Quantyx Framework" },
  { key: "brandingLoginSubtitle", value: "One platform for all your projects" },
] as const;
