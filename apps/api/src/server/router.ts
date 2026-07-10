import {
  CompareCategoryCRUD,
  CompareCriterionCRUD,
  ContactSubmissionCRUD,
  FaqItemCRUD,
  FrontPageSettingsCRUD,
  IndustryItemCRUD,
  MarqueeItemCRUD,
  PlanCRUD,
  PlanFeatureCRUD,
  PlanOfInterestCRUD,
  PortfolioCRUD,
  ProcessPhaseCRUD,
  SectionCardCRUD,
  ServiceCategoryCRUD,
  SettingsCRUD,
  WhysubCardCRUD,
} from "~/crud";
import { prisma } from "~/lib/db";
import { router, permissionProcedure, publicProcedure } from "./trpc";
import { z } from "zod";
import {
  createCRUDRouter,
  type CRUDConfig,
  type CRUDFieldSelect,
  type SelectOption,
} from "@repo/crud";
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
        localized: field.localized !== false,
      },
    ]),
  );
  const fieldKeys = config.fields.map((field) => field.name);
  const defaultLocale = config.defaultLocale ?? config.supportedLocales?.[0] ?? "en";
  const supportedLocales = config.supportedLocales?.length ? config.supportedLocales : [defaultLocale];
  const localePriority = (locale: string) => Array.from(new Set([
    locale,
    defaultLocale,
    ...supportedLocales,
  ]));
  const rowsToSettings = (rows: Array<{ key: string; locale?: string; value: string | null }>, locale: string) => {
    const priority = localePriority(locale);
    const priorityIndex = new Map(priority.map((loc, index) => [loc, index]));
    const sortedRows = [...rows].sort((a, b) => {
      const aIndex = priorityIndex.get(a.locale ?? locale) ?? priority.length;
      const bIndex = priorityIndex.get(b.locale ?? locale) ?? priority.length;
      return aIndex - bIndex;
    });

    return sortedRows.reduce<Record<string, string>>((settings, row) => {
      if (settings[row.key]?.trim()) {
        return settings;
      }
      settings[row.key] = row.value ?? "";
      return settings;
    }, {});
  };

  // ponytail: @repo/crud exports only the public surface from "./index".
// prismaModelKey is 3 lines (lowercase first letter), inline rather than reach into a submodule.
function prismaModelKey(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

// ponytail: hand-rolled router (locale fallback + non-localized fan-out) skips
  // the createKeyValueRouter factory. Re-add the factory's options/searchOptions
  // procs inline so admin autocomplete fields can resolve against optionsFrom sources.
  const resolveFieldOptions = async (
    field: CRUDFieldSelect,
    search?: string,
    selected?: string,
    ids?: string[],
  ): Promise<SelectOption[]> => {
    if (field.optionsQuery) {
      return field.optionsQuery({
        db: prisma as unknown as Parameters<NonNullable<CRUDFieldSelect["optionsQuery"]>>[0]["db"],
        ctx: undefined,
        search,
        selected,
      });
    }
    if (field.optionsFrom) {
      const source = field.optionsFrom;
      const sourceModel = prismaModelKey(source.model);
      const limit = source.limit ?? 50;
      const searchFields = source.searchFields?.length ? source.searchFields : [source.labelField];
      const baseWhere = source.where ?? {};
      const searchWhere = search
        ? { OR: searchFields.map((f) => ({ [f]: { contains: search, mode: "insensitive" as const } })) }
        : undefined;
      const idsWhere = ids && ids.length > 0 ? { [source.valueField]: { in: ids } } : undefined;
      const db = prisma as unknown as Record<string, { findMany: (a: unknown) => Promise<unknown[]> }>;

      const [selectedRows, idsRows, searchRows] = await Promise.all([
        selected
          ? db[sourceModel].findMany({
              where: { ...baseWhere, [source.valueField]: selected },
              select: { [source.valueField]: true, [source.labelField]: true },
            })
          : Promise.resolve([] as unknown[]),
        idsWhere
          ? db[sourceModel].findMany({
              where: { ...baseWhere, ...idsWhere },
              orderBy: source.orderBy,
              take: Math.max(ids?.length ?? 0, limit),
              select: { [source.valueField]: true, [source.labelField]: true },
            })
          : Promise.resolve([] as unknown[]),
        search
          ? db[sourceModel].findMany({
              where: searchWhere ? { AND: [baseWhere, searchWhere] } : baseWhere,
              orderBy: source.orderBy,
              take: limit,
              select: { [source.valueField]: true, [source.labelField]: true },
            })
          : db[sourceModel].findMany({
              where: baseWhere,
              orderBy: source.orderBy,
              take: 10,
              select: { [source.valueField]: true, [source.labelField]: true },
            }),
      ]);

      const seen = new Set<string>();
      const options: SelectOption[] = [];
      for (const row of [...selectedRows, ...idsRows, ...searchRows] as Array<Record<string, unknown>>) {
        const value = String(row[source.valueField] ?? "");
        if (seen.has(value)) continue;
        seen.add(value);
        options.push({
          value,
          label: String(row[source.labelField] ?? row[source.valueField] ?? ""),
        });
      }
      return options;
    }
    const opts = field.options ?? [];
    if (!search) return opts;
    const term = search.toLowerCase();
    return opts.filter((o) => o.label.toLowerCase().includes(term) || o.value.toLowerCase().includes(term));
  };

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
            locale: {
              in: localePriority(locale),
            },
          },
        });

        return rowsToSettings(rows, locale);
      }),
    options: permissionProcedure("view", config.model).query(async () => {
      const selectFields = config.fields.filter(
        (field): field is CRUDFieldSelect => field.type === "select",
      );
      const entries = await Promise.all(
        selectFields.map(async (field) => [field.name, await resolveFieldOptions(field)] as const),
      );
      return Object.fromEntries(entries) as Record<string, SelectOption[]>;
    }),
    // ponytail: cast prisma to PrismaLikeClient at the boundary — same reason as
    // createCRUDRouter calls above (Prisma 7 client lacks the index signature).
    searchOptions: permissionProcedure("view", config.model)
      .input(z.object({ field: z.string(), search: z.string().optional(), selected: z.string().optional(), ids: z.array(z.string()).optional() }))
      .query(async ({ input }) => {
        const field = config.fields.find((f) => f.name === input.field);
        if (!field || field.type !== "select") {
          return [];
        }
        return resolveFieldOptions(field, input.search, input.selected, input.ids);
      }),
    update: permissionProcedure("update", config.model)
      .input(z.object({ data: z.record(z.string(), z.string().nullable()), locale: z.string().optional() }))
      .mutation(async ({ input }) => {
        const locale = input.locale ?? defaultLocale;
        // Parallel upserts (same as @repo/crud createKeyValueRouter). A single
        // $transaction of 100+ ops is slow on remote Postgres and hit 5s timeouts.
        // Each row is independent (unique key_locale) so no interactive tx needed.
        await Promise.all(
          Object.entries(input.data).flatMap(([key, value]) =>
            (fieldMeta[key]?.localized === false ? supportedLocales : [locale]).map((targetLocale) =>
              prisma.frontPageSettings.upsert({
                where: { key_locale: { key, locale: targetLocale } },
                update: {
                  namespace: fieldMeta[key]?.namespace ?? null,
                  value,
                },
                create: {
                  key,
                  locale: targetLocale,
                  namespace: fieldMeta[key]?.namespace ?? null,
                  value,
                },
              }),
            ),
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
      await Promise.all(
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
const localeInput = z.object({ locale: z.enum(["id", "en"]).optional() }).optional();

const publicFrontPageSettingsRouter = router({
  get: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const defaultLocale = FrontPageSettingsCRUD.defaultLocale ?? "en";
      const supportedLocales = FrontPageSettingsCRUD.supportedLocales ?? [defaultLocale];
      const localePriority = Array.from(new Set([
        locale,
        defaultLocale,
        ...supportedLocales,
      ]));
      const priorityIndex = new Map(localePriority.map((loc, index) => [loc, index]));
      const rows = await prisma.frontPageSettings.findMany({
        where: {
          locale: {
            in: localePriority,
          },
        },
      });

      return [...rows]
        .sort((a, b) => {
          const aIndex = priorityIndex.get(a.locale) ?? localePriority.length;
          const bIndex = priorityIndex.get(b.locale) ?? localePriority.length;
          return aIndex - bIndex;
        })
        .reduce<Record<string, string>>((settings, row) => {
          if (settings[row.key]?.trim()) {
            return settings;
          }
          settings[row.key] = row.value ?? "";
          return settings;
        }, {});
    }),
});

const marqueeItemRouter = createCRUDRouter(
  MarqueeItemCRUD,
  router,
  {
    list: permissionProcedure("view", "marqueeItem"),
    getById: permissionProcedure("view", "marqueeItem"),
    create: permissionProcedure("create", "marqueeItem"),
    update: permissionProcedure("update", "marqueeItem"),
    delete: permissionProcedure("delete", "marqueeItem"),
  },
  // ponytail: Prisma 7 client lacks the index signature `PrismaLikeClient`
  // requires; cast at the boundary instead of widening the type globally.
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const whysubCardRouter = createCRUDRouter(
  WhysubCardCRUD,
  router,
  {
    list: permissionProcedure("view", "whysubCard"),
    getById: permissionProcedure("view", "whysubCard"),
    create: permissionProcedure("create", "whysubCard"),
    update: permissionProcedure("update", "whysubCard"),
    delete: permissionProcedure("delete", "whysubCard"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const compareCategoryRouter = createCRUDRouter(
  CompareCategoryCRUD,
  router,
  {
    list: permissionProcedure("view", "compareCategory"),
    getById: permissionProcedure("view", "compareCategory"),
    create: permissionProcedure("create", "compareCategory"),
    update: permissionProcedure("update", "compareCategory"),
    delete: permissionProcedure("delete", "compareCategory"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const compareCriterionRouter = createCRUDRouter(
  CompareCriterionCRUD,
  router,
  {
    list: permissionProcedure("view", "compareCriterion"),
    getById: permissionProcedure("view", "compareCriterion"),
    create: permissionProcedure("create", "compareCriterion"),
    update: permissionProcedure("update", "compareCriterion"),
    delete: permissionProcedure("delete", "compareCriterion"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const portfolioRouter = createCRUDRouter(
  PortfolioCRUD,
  router,
  {
    list: permissionProcedure("view", "portfolio"),
    getById: permissionProcedure("view", "portfolio"),
    create: permissionProcedure("create", "portfolio"),
    update: permissionProcedure("update", "portfolio"),
    delete: permissionProcedure("delete", "portfolio"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const planRouter = createCRUDRouter(
  PlanCRUD,
  router,
  {
    list: permissionProcedure("view", "plan"),
    getById: permissionProcedure("view", "plan"),
    create: permissionProcedure("create", "plan"),
    update: permissionProcedure("update", "plan"),
    delete: permissionProcedure("delete", "plan"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const planFeatureRouter = createCRUDRouter(
  PlanFeatureCRUD,
  router,
  {
    list: permissionProcedure("view", "planFeature"),
    getById: permissionProcedure("view", "planFeature"),
    create: permissionProcedure("create", "planFeature"),
    update: permissionProcedure("update", "planFeature"),
    delete: permissionProcedure("delete", "planFeature"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const faqItemRouter = createCRUDRouter(
  FaqItemCRUD,
  router,
  {
    list: permissionProcedure("view", "faqItem"),
    getById: permissionProcedure("view", "faqItem"),
    create: permissionProcedure("create", "faqItem"),
    update: permissionProcedure("update", "faqItem"),
    delete: permissionProcedure("delete", "faqItem"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const industryItemRouter = createCRUDRouter(
  IndustryItemCRUD,
  router,
  {
    list: permissionProcedure("view", "industryItem"),
    getById: permissionProcedure("view", "industryItem"),
    create: permissionProcedure("create", "industryItem"),
    update: permissionProcedure("update", "industryItem"),
    delete: permissionProcedure("delete", "industryItem"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const sectionCardRouter = createCRUDRouter(
  SectionCardCRUD,
  router,
  {
    list: permissionProcedure("view", "sectionCard"),
    getById: permissionProcedure("view", "sectionCard"),
    create: permissionProcedure("create", "sectionCard"),
    update: permissionProcedure("update", "sectionCard"),
    delete: permissionProcedure("delete", "sectionCard"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const processPhaseRouter = createCRUDRouter(
  ProcessPhaseCRUD,
  router,
  {
    list: permissionProcedure("view", "processPhase"),
    getById: permissionProcedure("view", "processPhase"),
    create: permissionProcedure("create", "processPhase"),
    update: permissionProcedure("update", "processPhase"),
    delete: permissionProcedure("delete", "processPhase"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const contactSubmissionRouter = createCRUDRouter(
  ContactSubmissionCRUD,
  router,
  {
    list: permissionProcedure("view", "contactSubmission"),
    getById: permissionProcedure("view", "contactSubmission"),
    create: permissionProcedure("create", "contactSubmission"),
    update: permissionProcedure("update", "contactSubmission"),
    delete: permissionProcedure("delete", "contactSubmission"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const serviceCategoryRouter = createCRUDRouter(
  ServiceCategoryCRUD,
  router,
  {
    list: permissionProcedure("view", "serviceCategory"),
    getById: permissionProcedure("view", "serviceCategory"),
    create: permissionProcedure("create", "serviceCategory"),
    update: permissionProcedure("update", "serviceCategory"),
    delete: permissionProcedure("delete", "serviceCategory"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const planOfInterestRouter = createCRUDRouter(
  PlanOfInterestCRUD,
  router,
  {
    list: permissionProcedure("view", "planOfInterest"),
    getById: permissionProcedure("view", "planOfInterest"),
    create: permissionProcedure("create", "planOfInterest"),
    update: permissionProcedure("update", "planOfInterest"),
    delete: permissionProcedure("delete", "planOfInterest"),
  },
  prisma as unknown as Parameters<typeof createCRUDRouter>[3],
);

const publicMarqueeRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const rows = await prisma.marqueeItem.findMany({
        where: { locale },
        orderBy: { position: "asc" },
      });
      return rows.map((row) => row.text);
    }),
});

const publicWhysubRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const rows = await prisma.whysubCard.findMany({
        where: { locale },
        orderBy: { position: "asc" },
      });
      return rows.map((row) => ({
        icon: row.icon,
        color: row.color,
        heading: row.heading,
        paragraph: row.paragraph,
      }));
    }),
});

const publicCompareRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const [categories, criteria] = await Promise.all([
        prisma.compareCategory.findMany({
          where: { locale },
          orderBy: { position: "asc" },
          select: { name: true },
        }),
        prisma.compareCriterion.findMany({
          where: { locale },
          orderBy: { position: "asc" },
          select: { label: true, cells: true },
        }),
      ]);
      return {
        categories: categories.map((row) => row.name),
        rows: criteria.map((row) => ({
          label: row.label,
          cells: row.cells.split(",").map((cell) => cell.trim()),
        })),
      };
    }),
});

const publicPortfolioRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const rows = await prisma.portfolio.findMany({
        where: { active: true },
        orderBy: { position: "asc" },
      });
      const fallbackBlurb = locale === "id" ? "" : "";
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        sub: row.sub,
        blurb: (locale === "id" ? row.blurbId : row.blurbEn) ?? fallbackBlurb,
        image: row.image,
        logoBg: row.logoBg,
        tags: row.tags
          ? row.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        url: row.url,
        igUrl: row.igUrl,
      }));
    }),
});

// ponytail: features are per-locale rows. Fetch requested locale first; for plans
// with no matching features, fall back to "en" so the public site still shows content.
const publicPlanRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const plans = await prisma.plan.findMany({
        where: { active: true },
        orderBy: { position: "asc" },
      });
      const planIds = plans.map((p) => p.id);
      const localeFeatures = await prisma.planFeature.findMany({
        where: { locale, planId: { in: planIds } },
        orderBy: { position: "asc" },
      });
      const plansMissingLocale = planIds.filter(
        (id) => !localeFeatures.some((f) => f.planId === id),
      );
      const fallbackFeatures =
        locale === "id" && plansMissingLocale.length
          ? await prisma.planFeature.findMany({
              where: { locale: "en", planId: { in: plansMissingLocale } },
              orderBy: { position: "asc" },
            })
          : [];
      const featuresByPlan = new Map<string, string[]>();
      for (const f of [...localeFeatures, ...fallbackFeatures]) {
        if (!featuresByPlan.has(f.planId)) featuresByPlan.set(f.planId, []);
        featuresByPlan.get(f.planId)!.push(f.text);
      }
      return plans.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        price: p.price,
        normalPrice: p.normalPrice,
        best: p.best,
        ctaUrl: p.ctaUrl,
        features: featuresByPlan.get(p.id) ?? [],
      }));
    }),
});

const publicFaqRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const rows = await prisma.faqItem.findMany({
        where: { active: true, locale },
        orderBy: { position: "asc" },
        select: { id: true, question: true, answer: true },
      });
      return rows.map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
      }));
    }),
});

const publicIndustryRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const rows = await prisma.industryItem.findMany({
        where: { active: true, locale },
        orderBy: { position: "asc" },
        select: { id: true, name: true, tag: true },
      });
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        tag: row.tag,
      }));
    }),
});

const publicSectionCardRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          locale: z.enum(["id", "en"]).optional(),
          section: z.enum(["included", "terms", "payment", "trust"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const section = input?.section;
      const rows = await prisma.sectionCard.findMany({
        where: {
          active: true,
          locale,
          ...(section ? { section } : {}),
        },
        orderBy: { position: "asc" },
        select: { id: true, section: true, color: true, heading: true, paragraph: true },
      });
      return rows.map((row) => ({
        id: row.id,
        section: row.section,
        color: row.color,
        heading: row.heading,
        paragraph: row.paragraph,
      }));
    }),
});

const publicProcessPhaseRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const rows = await prisma.processPhase.findMany({
        where: { active: true, locale },
        orderBy: { position: "asc" },
        select: { id: true, title: true, steps: true, description: true },
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        steps: row.steps
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        description: row.description,
      }));
    }),
});

const publicServiceCategoryRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const rows = await prisma.serviceCategory.findMany({
        where: { active: true, locale },
        orderBy: { position: "asc" },
        select: { id: true, name: true, items: true, tint: true, image: true },
      });
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        tint: row.tint,
        image: row.image,
        items: row.items
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      }));
    }),
});

const publicPlanOfInterestRouter = router({
  list: publicProcedure
    .input(localeInput)
    .query(async ({ input }) => {
      const locale = input?.locale ?? "id";
      const rows = await prisma.planOfInterest.findMany({
        where: { active: true, locale },
        orderBy: { position: "asc" },
        select: { id: true, name: true },
      });
      return rows.map((row) => ({ id: row.id, name: row.name }));
    }),
});

export const appRouter = router({
  // The admin UI (CRUDResourceClient, CrudResourceView, modals) accesses every
  // admin resource as `api.admin.<model>.<procedure>`. Keep them nested under
  // `admin` so the client paths resolve — router.test.ts locks this.
  admin: router({
    compareCategory: compareCategoryRouter,
    compareCriterion: compareCriterionRouter,
    contactSubmission: contactSubmissionRouter,
    emailSettings: emailSettingsRouter,
    faqItem: faqItemRouter,
    frontPageSettings: frontPageSettingsRouter,
    industryItem: industryItemRouter,
    marqueeItem: marqueeItemRouter,
    plan: planRouter,
    planFeature: planFeatureRouter,
    planOfInterest: planOfInterestRouter,
    portfolio: portfolioRouter,
    processPhase: processPhaseRouter,
    role: roleRouter,
    sectionCard: sectionCardRouter,
    serviceCategory: serviceCategoryRouter,
    settings: settingsRouter,
    user: userRouter,
    whysubCard: whysubCardRouter,
  }),
  account: accountRouter,
  public: router({
    acceptInvitation: acceptInvitationProcedure,
    compare: publicCompareRouter,
    faq: publicFaqRouter,
    frontPageSettings: publicFrontPageSettingsRouter,
    getInvitation: getInvitationProcedure,
    industry: publicIndustryRouter,
    marquee: publicMarqueeRouter,
    plan: publicPlanRouter,
    planOfInterest: publicPlanOfInterestRouter,
    portfolio: publicPortfolioRouter,
    processPhase: publicProcessPhaseRouter,
    sectionCard: publicSectionCardRouter,
    serviceCategory: publicServiceCategoryRouter,
    whysub: publicWhysubRouter,
  }),
});

export type AppRouter = typeof appRouter;
