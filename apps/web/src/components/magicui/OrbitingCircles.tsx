"use client";

import React from "react";

type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: boolean | undefined | null };
function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x) => typeof x === "string" && x.length > 0)
    .join(" ");
}

export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
}

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
  ...props
}: OrbitingCirclesProps) {
  const calculatedDuration = (duration / speed).toFixed(1);

  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-slate-200 dark:stroke-slate-800 stroke-1"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      {React.Children.map(children, (child, index) => {
        const angle = (360 / React.Children.count(children)) * index;
        const style: React.CSSProperties = {
          "--duration": `${calculatedDuration}s`,
          "--radius": `${radius}px`,
          "--angle": `${angle}deg`,
          width: iconSize,
          height: iconSize,
        } as React.CSSProperties;

        return (
          <div
            key={index}
            style={style}
            className={cn(
              "animate-orbit absolute left-1/2 top-1/2 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-md -translate-x-1/2 -translate-y-1/2",
              reverse ? "[animation-direction:reverse]" : "",
              className
            )}
            {...props}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}
