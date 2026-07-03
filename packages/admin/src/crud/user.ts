import { defineCRUD } from "@repo/crud";

export const UserCRUD = defineCRUD({
  model: "user",
  label: "Users",
  icon: "Users",
  navGroup: "Administration",
  navGroupIcon: "ShieldCheck",
  fields: [
    { name: "name", type: "text", label: "Name", required: true },
    { name: "email", type: "email", label: "Email", required: true },
    {
      name: "password",
      type: "password",
      label: "Password (optional for edit)",
      showInTable: false,
    },
    {
      name: "roleId",
      type: "select",
      label: "Role",
      options: [],
      showInTable: false,
    },
    { name: "roleName", type: "text", label: "Role", showInForm: false },
    { name: "createdAt", type: "date", label: "Created", showInForm: false },
  ],
});
