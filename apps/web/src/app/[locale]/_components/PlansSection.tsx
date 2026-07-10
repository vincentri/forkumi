import { Fragment, type ReactElement } from "react";

import { getPlans, type PlanItem } from "../../plans";

type PlansSectionProps = {
  locale: "id" | "en";
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

export async function PlansSection({ locale }: PlansSectionProps): Promise<ReactElement> {
  const plans = await getPlans(locale);
  if (plans.length === 0) {
    return <div className="plans" />;
  }
  return (
    <div className="plans">
      {plans.map((plan) => (
        <Fragment key={plan.id}>{renderPlanCard(plan, locale)}</Fragment>
      ))}
    </div>
  );
}