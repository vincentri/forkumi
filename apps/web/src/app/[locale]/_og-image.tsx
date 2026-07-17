import { ImageResponse } from "next/og";

import { normalizeLocale } from "../front-page-settings";

export const alt = "Forkumi design subscription";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COPY = {
  id: {
    eyebrow: "DESIGN SUBSCRIPTION · INDONESIA & GLOBAL",
    title: "Desain tanpa batas.",
    subtitle: "Satu tim kreatif untuk brand yang terus tumbuh.",
  },
  en: {
    eyebrow: "DESIGN SUBSCRIPTION · INDONESIA & WORLDWIDE",
    title: "Unlimited design.",
    subtitle: "One creative team for brands on the rise.",
  },
} as const;

export async function renderOgImage(rawLocale: string): Promise<ImageResponse> {
  const copy = COPY[normalizeLocale(rawLocale)];

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#f7eddb",
        color: "#241c16",
        display: "flex",
        height: "100%",
        overflow: "hidden",
        padding: "72px 80px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#ff6f61",
          border: "4px solid #241c16",
          borderRadius: "999px",
          height: "310px",
          position: "absolute",
          right: "-70px",
          top: "-100px",
          transform: "rotate(-18deg)",
          width: "520px",
        }}
      />
      <div
        style={{
          background: "#7757d7",
          border: "4px solid #241c16",
          borderRadius: "52px",
          bottom: "-145px",
          height: "350px",
          position: "absolute",
          right: "130px",
          transform: "rotate(12deg)",
          width: "350px",
        }}
      />
      <div
        style={{
          background: "#f6c84c",
          border: "4px solid #241c16",
          borderRadius: "50%",
          bottom: "80px",
          height: "90px",
          position: "absolute",
          right: "70px",
          width: "90px",
        }}
      />
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          flexDirection: "column",
          maxWidth: "790px",
          position: "relative",
        }}
      >
        <div
          style={{
            background: "#241c16",
            borderRadius: "999px",
            color: "#fff8ea",
            display: "flex",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "2px",
            padding: "13px 24px",
          }}
        >
          {copy.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "82px",
            fontWeight: 800,
            letterSpacing: "-4px",
            lineHeight: 1,
            marginTop: "42px",
          }}
        >
          {copy.title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "34px",
            fontWeight: 500,
            lineHeight: 1.25,
            marginTop: "26px",
            maxWidth: "680px",
          }}
        >
          {copy.subtitle}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "30px",
            fontWeight: 800,
            marginTop: "46px",
          }}
        >
          forkumi.co
        </div>
      </div>
    </div>,
    size,
  );
}
