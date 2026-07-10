"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ForkumiEffects(): null {
  const pathname = usePathname();

  useEffect(() => {
    const pathLocale = pathname.split("/").filter(Boolean)[0];
    document.documentElement.lang = pathLocale === "en" ? "en" : "id";

    const isFinePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;

    // Reveal: IntersectionObserver toggles .in on .reveal (CSS keeps them hidden until then).
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    const observeAll = () =>
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => observer.observe(el));
    observeAll();

    // Parallax sparkles on scroll (rAF-throttled).
    const onScroll = () => {
      document.querySelectorAll<HTMLElement>(".sparkle").forEach((s) => {
        const d = parseFloat(s.dataset.d ?? "0.5");
        s.style.transform = `translateY(${-scrollY * 0.05 * d}px)`;
      });
    };
    let scrollRaf = 0;
    const scrollHandler = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        onScroll();
      });
    };
    onScroll();
    addEventListener("scroll", scrollHandler, { passive: true });

    // Custom cursor (fine pointers only).
    let cleanupCursor: (() => void) | undefined;
    const cur = document.getElementById("cursor");
    const dot = document.getElementById("dot");
    if (isFinePointer && cur) {
      let mx = 0, my = 0, cx = 0, cy = 0, raf = 0;
      const tick = () => {
        raf = 0;
        cx += (mx - cx) * 0.18;
        cy += (my - cy) * 0.18;
        cur.style.left = `${cx}px`;
        cur.style.top = `${cy}px`;
        if (Math.abs(mx - cx) > 0.1 || Math.abs(my - cy) > 0.1) {
          raf = requestAnimationFrame(tick);
        }
      };
      const onMove = (e: MouseEvent) => {
        mx = e.clientX;
        my = e.clientY;
        if (dot) {
          dot.style.left = `${mx}px`;
          dot.style.top = `${my}px`;
        }
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const onOver = (e: PointerEvent) => {
        const target = e.target;
        cur.classList.toggle(
          "big",
          target instanceof Element && !!target.closest("a,button,.ind,.gcard,.plan,.stat,.pthumb,.cbtn"),
        );
      };
      document.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver);
      cleanupCursor = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("pointerover", onOver);
      };
    }

    // Re-observe new .reveal elements after route-change hydration.
    const rePoll = window.setTimeout(observeAll, 50);

    return () => {
      window.clearTimeout(rePoll);
      observer.disconnect();
      removeEventListener("scroll", scrollHandler);
      cleanupCursor?.();
    };
  }, [pathname]);

  return null;
}
