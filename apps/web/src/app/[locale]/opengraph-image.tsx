import type { ImageResponse } from "next/og";

import { alt, contentType, renderOgImage, size } from "./_og-image";

export { alt, contentType, size };

type OpenGraphImageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OpenGraphImage({ params }: OpenGraphImageProps): Promise<ImageResponse> {
  const { locale } = await params;

  return renderOgImage(locale);
}
