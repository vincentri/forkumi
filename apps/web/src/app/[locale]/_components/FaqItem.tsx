"use client";

import type { ReactElement } from "react";

type FaqItemProps = {
  question: string;
  answer: string;
};

export function FaqItem({ question, answer }: FaqItemProps): ReactElement {
  return (
    <div className="faq-q reveal">
      <div
        className="q"
        onClick={(event) => event.currentTarget.parentElement?.classList.toggle("open")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.currentTarget.parentElement?.classList.toggle("open");
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span>{question}</span>
        <span className="plus">+</span>
      </div>
      <div className="a">
        <p>{answer}</p>
      </div>
    </div>
  );
}
