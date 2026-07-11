import { defineCRUD } from "@repo/crud";

export const CompareCriterionCRUD = defineCRUD({
  model: "compareCriterion",
  label: "Compare Criteria",
  navGroup: "Front Page",
  icon: "ListChecks",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "label",
      type: "text",
      label: "Criterion Label",
      required: true,
    },
    {
      name: "cells",
      type: "text",
      label: "Cells (y/n/l/? comma-separated)",
      required: true,
      default: "y,n,l",
      note: "Order matches compare categories position. Use y (yes), n (no), l (limited), ? (unknown), or empty.",
    },
    {
      name: "locale",
      type: "select",
      label: "Locale",
      required: true,
      default: "en",
      options: [
        { label: "English", value: "en" },
        { label: "Indonesian", value: "id" },
      ],
    },
    {
      name: "position",
      type: "number",
      label: "Position",
      default: 0,
    },
  ],
});