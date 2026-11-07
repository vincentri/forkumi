import type { ReactElement } from "react";

import { buildBreadcrumbJsonLd } from "../../seo";
import { JsonLd } from "./JsonLd";

type BreadcrumbProps = {
  locale: "id" | "en";
  current: string;
};

const HOME: Record<"id" | "en", string> = { id: "Beranda", en: "Home" };

export function Breadcrumb({ locale, current }: BreadcrumbProps): ReactElement {
  return (
    <span className="crumb">
      <JsonLd data={buildBreadcrumbJsonLd(locale, current)} />
      <a href="../">{HOME[locale]}</a> / <span>{current}</span>
    </span>
  );
}
