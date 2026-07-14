import { fetchNextOptions } from "./cache-config";

export type FrontPageSettings = Record<string, string>;

export const DEFAULT_TITLE = "Forkumi";
export const DEFAULT_DESCRIPTION = "Forkumi design subscription website";

const ABSOLUTE_ASSET_PATTERN = /^(https?:|data:|blob:)/;
const MANAGED_ASSET_PATTERN = /^\/?(uploads|defaults|assets)\//;

function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

function storageOrigin(): string {
  return (process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? apiOrigin()).replace(/\/$/, "");
}

export function normalizeLocale(locale: string): "id" | "en" {
  return locale === "en" ? "en" : "id";
}

export function firstValue(...values: Array<string | null | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

export const WHATSAPP_FALLBACK =
  "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan.";

export const INSTAGRAM_FALLBACK = "https://www.instagram.com/forkumi.design/";
export const PHONE_FALLBACK = "tel:+6580892716";
export const EMAIL_FALLBACK = "mailto:linkforkumi@gmail.com";

function isHref(value: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(value);
}

export function safeHref(value: string | null | undefined, fallback: string): string {
  const v = firstValue(value);
  return v && isHref(v) ? v : fallback;
}

export function resolveAssetUrl(value: string | null | undefined): string | undefined {
  const asset = firstValue(value);
  if (!asset) {
    return undefined;
  }
  if (ABSOLUTE_ASSET_PATTERN.test(asset)) {
    return asset;
  }
  if (MANAGED_ASSET_PATTERN.test(asset)) {
    return `${storageOrigin()}/${asset.replace(/^\/+/, "")}`;
  }
  if (asset.startsWith("/")) {
    return asset;
  }

  return undefined;
}

export async function getFrontPageSettings(locale: "id" | "en"): Promise<FrontPageSettings> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(`${apiOrigin()}/api/trpc/public.frontPageSettings.get?input=${input}`, fetchNextOptions(["public:frontPageSettings"]));

    if (!response.ok) {
      return {};
    }

    const payload = await response.json() as {
      result?: { data?: { json?: FrontPageSettings } };
    };

    return payload.result?.data?.json ?? {};
  } catch {
    return {};
  }
}
