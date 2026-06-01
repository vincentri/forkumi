"use client";

import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "~/lib/utils";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: React.ElementType;
  description: string;
  tags?: string[];
  href?: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  tags,
  href,
  ...props
}: BentoCardProps) => (
  <div
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl",
      "bg-white dark:bg-slate-900",
      "border border-slate-200 dark:border-white/10",
      "shadow-sm hover:shadow-lg hover:shadow-[#ff6b35]/10",
      "backdrop-blur-xl transition-all duration-500 hover:-translate-y-1",
      href && "cursor-pointer",
      className
    )}
    {...props}
  >
    {/* Top border glow on hover */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* Noise texture */}
    <div className="noise-texture absolute inset-0 opacity-30 dark:opacity-40" />

    {background && <div>{background}</div>}

    {/* Clickable overlay */}
    {href && (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-20"
        aria-label={`Visit ${name}`}
      />
    )}

    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col gap-2 transition-all duration-300 lg:group-hover:-translate-y-2">
          {Icon && (
            <Icon className="h-10 w-10 origin-left text-slate-500 dark:text-neutral-400 transition-all duration-300 ease-in-out group-hover:scale-75" />
          )}
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-neutral-200">
              {name}
            </h3>
            {tags && tags.length > 0 && (
              <div className="flex gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#ff6b35]/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#ff6b35]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="max-w-lg text-sm text-slate-500 dark:text-neutral-400">{description}</p>
        </div>
      </div>

      {href && (
        <div className="mt-6">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#ff6b35]">
            Visit site
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      )}
    </div>

    {/* Hover overlay */}
    <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-slate-900/5 group-hover:dark:bg-white/[0.02]" />
  </div>
);

export { BentoCard, BentoGrid };