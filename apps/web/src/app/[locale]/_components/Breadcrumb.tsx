import type { ReactElement } from "react";

import { buildBreadcrumbJsonLd } from "../../seo";
import { JsonLd } from "./JsonLd";

type BreadcrumbProps = {
  locale: "id" | "en";
  page: string;
  current: string;
};

const HOME: Record<"id" | "en", string> = { id: "Beranda", en: "Home" };

export function Breadcrumb({ locale, page, current }: BreadcrumbProps): ReactElement {
  return (
    <span className="crumb">
      <JsonLd data={buildBreadcrumbJsonLd(locale, page, current)} />
      <a href="../">{HOME[locale]}</a> / <span>{current}</span>
    </span>
  );
}
