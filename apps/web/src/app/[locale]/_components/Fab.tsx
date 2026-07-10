import type { ReactElement } from "react";

type FabProps = {
  href: string;
};

export function Fab({ href }: FabProps): ReactElement {
  return (
    <a className="fab" href={href} target="_blank" rel="noopener" title="WhatsApp">
      <span className="icon-dot" aria-hidden="true" />
    </a>
  );
}
