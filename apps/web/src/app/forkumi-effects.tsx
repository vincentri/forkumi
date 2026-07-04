"use client";

import { useEffect } from "react";

export function ForkumiEffects(): null {
  useEffect(() => {
    void import("./forkumi-content").then(({ initForkumiSite }) => {
      initForkumiSite();
    });

    const splash = document.querySelector<HTMLElement>("#splash");
    const dismissSplash = (): void => {
      if (!splash) {
        return;
      }

      splash.classList.add("hide");
      window.setTimeout(() => splash.remove(), 420);
    };

    const splashTimer = window.setTimeout(dismissSplash, 650);

    const navToggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
    const navMenu = document.querySelector<HTMLElement>(".nav-menu");

    const setMenuOpen = (open: boolean): void => {
      navMenu?.classList.toggle("open", open);
      navToggle?.setAttribute("aria-expanded", String(open));
    };

    const handleToggle = (): void => {
      setMenuOpen(!navMenu?.classList.contains("open"));
    };

    const handleNavClick = (event: Event): void => {
      if ((event.target as HTMLElement).closest("a")) {
        setMenuOpen(false);
      }
    };

    navToggle?.addEventListener("click", handleToggle);
    navMenu?.addEventListener("click", handleNavClick);

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );

    revealItems.forEach((item) => observer.observe(item));

    const floatingShapes = Array.from(
      document.querySelectorAll<HTMLElement>(".float-shape[data-d]"),
    );

    const handlePointerMove = (event: PointerEvent): void => {
      const x = (event.clientX / window.innerWidth - 0.5) * 12;
      const y = (event.clientY / window.innerHeight - 0.5) * 12;

      floatingShapes.forEach((shape) => {
        const depth = Number(shape.dataset.d ?? 0.5);
        shape.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);

    requestAnimationFrame(() => {
      revealItems
        .filter((item) => item.getBoundingClientRect().top < window.innerHeight)
        .forEach((item) => item.classList.add("in"));
    });

    return () => {
      window.clearTimeout(splashTimer);
      navToggle?.removeEventListener("click", handleToggle);
      navMenu?.removeEventListener("click", handleNavClick);
      window.removeEventListener("pointermove", handlePointerMove);
      observer.disconnect();
    };
  }, []);

  return null;
}
