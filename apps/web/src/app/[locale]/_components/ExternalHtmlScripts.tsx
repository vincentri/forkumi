"use client";

import { useEffect, type ReactElement } from "react";

type ExternalHtmlScriptsProps = {
  html: string | undefined;
  id: string;
};

// Admin may paste full <script>…</script> or bare JS. Inject as real DOM scripts
// so React never sees a <script> element in the component tree.
export function ExternalHtmlScripts({
  html,
  id,
}: ExternalHtmlScriptsProps): ReactElement | null {
  useEffect(() => {
    if (!html?.trim()) {
      return;
    }

    const host = document.createElement("div");
    host.setAttribute("data-forkumi-script-host", id);
    host.innerHTML = html;

    const injected: HTMLScriptElement[] = [];
    const nodes = Array.from(host.childNodes);

    for (const node of nodes) {
      if (node instanceof HTMLScriptElement) {
        const script = document.createElement("script");
        for (const attr of Array.from(node.attributes)) {
          script.setAttribute(attr.name, attr.value);
        }
        if (node.textContent) {
          script.textContent = node.textContent;
        }
        document.body.appendChild(script);
        injected.push(script);
      } else {
        document.body.appendChild(node);
      }
    }

    // Bare JS (no wrapping tags) — treat whole string as script body
    if (injected.length === 0 && !host.querySelector("script") && html.trim()) {
      const script = document.createElement("script");
      script.setAttribute("data-forkumi-script", id);
      script.textContent = html;
      document.body.appendChild(script);
      injected.push(script);
    }

    return () => {
      for (const script of injected) {
        script.remove();
      }
      document.querySelectorAll(`[data-forkumi-script-host="${id}"]`).forEach((el) => el.remove());
    };
  }, [html, id]);

  return null;
}
