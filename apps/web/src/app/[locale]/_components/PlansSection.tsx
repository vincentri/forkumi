import { Fragment, type ReactElement } from "react";

import { getPlans, type PlanItem } from "../../plans";

type PlansSectionProps = {
  locale: "id" | "en";
  promoTag?: string;
  promoSub?: string;
};

// ponytail: plan card markup kept inline for pixel control.
function renderPlanCard(plan: PlanItem, locale: "id" | "en"): ReactElement {
  const pickLabel = locale === "id" ? "Pilih Paket" : "Choose Plan";
  const tcNote = locale === "id" ? "*S&K berlaku" : "*T&C applied";
  const bestLabel = locale === "id" ? "Favorit" : "Popular";
  const fromLabel = locale === "id" ? "Mulai dari" : "Start from";

  return (
    <div className={`plan ${plan.color} reveal${plan.best ? " best" : ""}`}>
      {plan.best ? <span className="star">★ {bestLabel}</span> : null}
      <div className="pn">{plan.name}</div>
      <ul>
        {plan.features.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
      <div className="startfrom">{fromLabel}</div>
      <div className="price">
        {plan.price}
        <span style={{ fontSize: "14px" }}>/mo</span>
      </div>
      <div className="normal">{plan.normalPrice}/mo</div>
      {plan.ctaUrl ? (
        <a className="pick" href={plan.ctaUrl} target="_blank" rel="noopener">
          {pickLabel}
        </a>
      ) : null}
      <div className="tc-note">{tcNote}</div>
    </div>
  );
}

export async function PlansSection({ locale, promoTag, promoSub }: PlansSectionProps): Promise<ReactElement> {
  const plans = await getPlans(locale);
  const hasPromo = (promoTag && promoTag.trim().length > 0) || (promoSub && promoSub.trim().length > 0);
  if (plans.length === 0 && !hasPromo) {
    return <div className="plans" />;
  }
  return (
    <>
      {plans.length > 0 ? (
        <div className="plans">
          {plans.map((plan) => (
            <Fragment key={plan.id}>{renderPlanCard(plan, locale)}</Fragment>
          ))}
        </div>
      ) : null}
      {hasPromo ? (
        <p className="pnote reveal">
          {promoTag && promoTag.trim().length > 0 ? (
            <span className="promo-tag">{promoTag}</span>
          ) : null}
          {promoSub && promoSub.trim().length > 0 ? (
            <span className="promo-sub">{promoSub}</span>
          ) : null}
        </p>
      ) : null}
    </>
  );
}