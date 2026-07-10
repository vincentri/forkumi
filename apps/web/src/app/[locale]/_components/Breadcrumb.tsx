import type { ReactElement } from "react";

type BreadcrumbProps = {
  locale: "id" | "en";
  current: string;
};

const HOME: Record<"id" | "en", string> = { id: "Beranda", en: "Home" };

export function Breadcrumb({ locale, current }: BreadcrumbProps): ReactElement {
  return (
    <span className="crumb">
      <a href="../">{HOME[locale]}</a> / <span>{current}</span>
    </span>
  );
}
