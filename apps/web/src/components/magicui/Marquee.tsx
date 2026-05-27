import { ReactNode } from "react";

export function Marquee({ items }: { items: ReactNode[] }) {
  return (
    <div className="relative overflow-hidden">
      <div className="flex min-w-full animate-[marquee_24s_linear_infinite] gap-4 py-2 whitespace-nowrap">
        {items.map((item, index) => (
          <div key={`a-${index}`} className="inline-flex">
            {item}
          </div>
        ))}
        {items.map((item, index) => (
          <div key={`b-${index}`} className="inline-flex">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
