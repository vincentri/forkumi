"use client";

import React, { useImperativeHandle, useLayoutEffect, useRef } from "react";

type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: boolean | undefined | null };
function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x) => typeof x === "string" && x.length > 0)
    .join(" ");
}

interface PulsatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  pulseColor?: string;
  duration?: string;
  distance?: string;
  variant?: "pulse" | "ripple";
}

export const PulsatingButton = React.forwardRef<HTMLButtonElement, PulsatingButtonProps>(
  ({ className, children, pulseColor, duration = "1.5s", distance = "8px", variant = "pulse", href, ...props }, ref) => {
    const innerRef = useRef<HTMLButtonElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted
    useImperativeHandle(ref, () => innerRef.current!);

    useLayoutEffect(() => {
      const button = innerRef.current;
      if (!button) return;

      if (pulseColor) {
        button.style.removeProperty("--bg");
        return;
      }

      let animationFrameId = 0;
      let currentBg = "";

      const updateBg = () => {
        animationFrameId = 0;
        const nextBg = getComputedStyle(button).backgroundColor;
        if (nextBg === currentBg) return;
        currentBg = nextBg;
        button.style.setProperty("--bg", nextBg);
      };

      const scheduleBgUpdate = () => {
        if (animationFrameId) return;
        animationFrameId = window.requestAnimationFrame(updateBg);
      };

      updateBg();

      const themeObserver = new MutationObserver(scheduleBgUpdate);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      const buttonObserver = new MutationObserver(scheduleBgUpdate);
      buttonObserver.observe(button, { attributes: true });

      const syncEvents = ["blur", "focus", "pointerenter", "pointerleave"] as const;
      for (const eventName of syncEvents) {
        button.addEventListener(eventName, scheduleBgUpdate);
      }

      return () => {
        if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
        themeObserver.disconnect();
        buttonObserver.disconnect();
        for (const eventName of syncEvents) {
          button.removeEventListener(eventName, scheduleBgUpdate);
        }
      };
    }, [pulseColor]);

    const button = (
      <button
        ref={innerRef}
        className={cn(
          "bg-slate-900 dark:bg-sky-500 text-white dark:text-white relative flex cursor-pointer items-center justify-center rounded-lg px-6 py-3 text-center font-semibold",
          className
        )}
        style={{
          "--pulse-color": pulseColor ?? "rgba(255,255,255,0.4)",
          "--duration": duration,
          "--distance": distance,
        } as React.CSSProperties}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-inherit",
            variant === "pulse" ? "animate-pulse" : "animate-pulse-ripple"
          )}
        />
      </button>
    );

    if (href) {
      return <a href={href}>{button}</a>;
    }

    return button;
  }
);
PulsatingButton.displayName = "PulsatingButton";
