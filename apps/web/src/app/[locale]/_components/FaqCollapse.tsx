"use client";

import { useState, type ReactElement } from "react";

import type { FaqItemData } from "../../faq";
import { FaqItem } from "./FaqItem";

type FaqCollapseProps = {
  hidden: FaqItemData[];
  seeMoreLabel: string;
  seeLessLabel: string;
};

export function FaqCollapse({
  hidden,
  seeMoreLabel,
  seeLessLabel,
}: FaqCollapseProps): ReactElement | null {
  const [open, setOpen] = useState(false);
  if (hidden.length === 0) {
    return null;
  }
  return (
    <>
      <div
        className="faq-extra"
        id="faqExtra"
        style={{
          maxHeight: open ? "none" : "0",
          overflow: open ? "visible" : "hidden",
        }}
      >
        {hidden.map((item) => (
          <FaqItem key={item.id} question={item.question} answer={item.answer} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: "22px" }}>
        <button
          type="button"
          className="see-more"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? seeLessLabel : seeMoreLabel} <span className="ico">{open ? "↑" : "↓"}</span>
        </button>
      </div>
    </>
  );
}
