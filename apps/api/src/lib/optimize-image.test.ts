import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { optimizeImage } from "./optimize-image";

describe("optimizeImage", () => {
  it("converts large PNG to WebP capped at 2000px wide", async () => {
    const png = await sharp({
      create: { width: 3000, height: 1000, channels: 3, background: "#ff0000" },
    })
      .png()
      .toBuffer();
    const result = await optimizeImage(png, "image/png");
    expect(result?.mime).toBe("image/webp");
    expect(result?.ext).toBe(".webp");
    const meta = await sharp(result!.buffer).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(2000);
  });

  it("leaves GIF, SVG and WebP alone", async () => {
    const buf = Buffer.from("x");
    expect(await optimizeImage(buf, "image/gif")).toBeNull();
    expect(await optimizeImage(buf, "image/svg+xml")).toBeNull();
    expect(await optimizeImage(buf, "image/webp")).toBeNull();
  });
});
