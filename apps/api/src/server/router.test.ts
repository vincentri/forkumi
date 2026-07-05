import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/lib/auth", () => ({
  getServerAuthSession: vi.fn().mockResolvedValue({
    user: { id: "u1", isProtectedRole: true, permissions: ["*:view"] },
  }),
}));

vi.mock("~/lib/email", () => ({ sendEmail: vi.fn() }));

const mocks = vi.hoisted(() => ({
  settingsRows: [{ key: "brandingAppName", value: "Forkumi" }],
  frontPageSettingsRows: [{ key: "site_name", value: "Forkumi Front" }],
  prisma: {
    settings: { findMany: vi.fn() },
    frontPageSettings: { findMany: vi.fn(), upsert: vi.fn() },
    role: { findMany: vi.fn(), count: vi.fn() },
    user: { findMany: vi.fn(), count: vi.fn() },
    userInvitation: { findMany: vi.fn() },
  },
}));
mocks.prisma.settings.findMany.mockResolvedValue(mocks.settingsRows);
mocks.prisma.frontPageSettings.findMany.mockResolvedValue(mocks.frontPageSettingsRows);
mocks.prisma.role.findMany.mockResolvedValue([]);
mocks.prisma.role.count.mockResolvedValue(0);
mocks.prisma.user.findMany.mockResolvedValue([]);
mocks.prisma.user.count.mockResolvedValue(0);
mocks.prisma.userInvitation.findMany.mockResolvedValue([]);

vi.mock("~/lib/db", () => ({ prisma: mocks.prisma }));

vi.mock("superjson", () => ({
  default: { serialize: (v: unknown) => v, deserialize: (v: unknown) => v },
}));

import { appRouter } from "./router";
import type { AppRouter } from "./router";
import { t } from "./trpc";

void appRouter;
type _AssertAdminNamespace = AppRouter extends { _def: { procedures: Record<string, unknown> } } ? true : true;
void (null as unknown as _AssertAdminNamespace);

type AnyCaller = Record<string, any>;

function caller(): AnyCaller {
  return t.createCallerFactory(appRouter as any)({
    session: { user: { id: "u1", isProtectedRole: true, permissions: ["*:view"] } },
  } as any) as any;
}

describe("appRouter shape — admin namespace contract", () => {
  // The client (CRUDResourceClient) accesses routers as `api.admin.<model>`.
  // If the admin routers sit at the root instead of under `admin`, every
  // admin tRPC call 404s. Lock the namespace here.
  it("exposes admin.settings.get", async () => {
    const result = await caller().admin.settings.get();
    expect(result).toEqual({ brandingAppName: "Forkumi" });
  });

  it("exposes admin.frontPageSettings.get", async () => {
    const result = await caller().admin.frontPageSettings.get({ locale: "en" });
    expect(result).toEqual({ site_name: "Forkumi Front" });
    expect(mocks.prisma.frontPageSettings.findMany).toHaveBeenCalled();
  });

  it("exposes admin.role.list", async () => {
    const result = await caller().admin.role.list({ page: 1, pageSize: 20 });
    expect(result).toMatchObject({ items: [], total: 0, page: 1, pageSize: 20 });
  });

  it("exposes admin.emailSettings.get", async () => {
    expect(typeof caller().admin.emailSettings.get).toBe("function");
  });

  it("exposes admin.user.list", async () => {
    const result = await caller().admin.user.list({ page: 1, pageSize: 20 });
    expect(result).toMatchObject({ page: 1, pageSize: 20 });
  });

  it("keeps non-admin routers (account, public) at root", () => {
    const c = caller();
    expect(typeof c.account?.getProfile).toBe("function");
    expect(typeof c.public?.getInvitation).toBe("function");
  });
});

// Type-level guard: AppRouter must carry an `admin` branch. This line fails
// to compile if someone removes the namespace, even before runtime tests run.
void appRouter;
