import { FrontPageSettingsCRUD, SettingsCRUD } from "~/crud";
import { prisma } from "~/lib/db";
import { router, permissionProcedure } from "./trpc";
import { z } from "zod";
import type { CRUDConfig } from "@repo/crud";
import { accountRouter } from "./routers/account";
import { emailSettingsRouter } from "./routers/emailSettings";
import {
  acceptInvitationProcedure,
  getInvitationProcedure,
} from "./routers/invitation";
import { roleRouter } from "./routers/role";
import { userRouter } from "./routers/user";

function createFrontPageSettingsRouter(config: CRUDConfig) {
  const fieldMeta = Object.fromEntries(
    config.fields.map((field) => [
      field.name,
      {
        namespace: field.namespace ?? null,
      },
    ]),
  );
  const fieldKeys = config.fields.map((field) => field.name);
  const defaultLocale = config.defaultLocale ?? config.supportedLocales?.[0] ?? "en";

  return router({
    get: permissionProcedure("view", config.model)
      .input(z.object({ locale: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const locale = input?.locale ?? defaultLocale;
        const rows = await prisma.frontPageSettings.findMany({
          where: {
            key: {
              in: fieldKeys,
            },
            locale,
          },
        });

        return Object.fromEntries(rows.map((row) => [row.key, row.value]));
      }),
    update: permissionProcedure("update", config.model)
      .input(z.object({ data: z.record(z.string(), z.string().nullable()), locale: z.string().optional() }))
      .mutation(async ({ input }) => {
        const locale = input.locale ?? defaultLocale;
        await prisma.$transaction(
          Object.entries(input.data).map(([key, value]) =>
            prisma.frontPageSettings.upsert({
              where: { key_locale: { key, locale } },
              update: {
                namespace: fieldMeta[key]?.namespace ?? null,
                value,
              },
              create: {
                key,
                locale,
                namespace: fieldMeta[key]?.namespace ?? null,
                value,
              },
            }),
          ),
        );

        return { success: true };
      }),
  });
}

const settingsFieldMeta = Object.fromEntries(
  SettingsCRUD.fields.map((field) => [
    field.name,
    {
      namespace: field.namespace ?? null,
    },
  ]),
);

const settingsRouter = router({
  get: permissionProcedure("view", "settings").query(async () => {
    const rows = await prisma.settings.findMany({
      where: {
        key: {
          in: SettingsCRUD.fields.map((field) => field.name),
        },
      },
    });

    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }),
  update: permissionProcedure("update", "settings")
    .input(z.object({ data: z.record(z.string(), z.string().nullable()) }))
    .mutation(async ({ input }) => {
      await prisma.$transaction(
        Object.entries(input.data).map(([key, value]) =>
          prisma.settings.upsert({
            where: { key },
            update: {
              namespace: settingsFieldMeta[key]?.namespace ?? null,
              value,
            },
            create: {
              key,
              namespace: settingsFieldMeta[key]?.namespace ?? null,
              value,
            },
          }),
        ),
      );

      return { success: true };
    }),
});

const frontPageSettingsRouter = createFrontPageSettingsRouter(FrontPageSettingsCRUD);

export const appRouter = router({
  // The admin UI (CRUDResourceClient, CrudResourceView, modals) accesses every
  // admin resource as `api.admin.<model>.<procedure>`. Keep them nested under
  // `admin` so the client paths resolve — router.test.ts locks this.
  admin: router({
    emailSettings: emailSettingsRouter,
    frontPageSettings: frontPageSettingsRouter,
    role: roleRouter,
    settings: settingsRouter,
    user: userRouter,
  }),
  account: accountRouter,
  public: router({
    acceptInvitation: acceptInvitationProcedure,
    getInvitation: getInvitationProcedure,
  }),
});

export type AppRouter = typeof appRouter;
