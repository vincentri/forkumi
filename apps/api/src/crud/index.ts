export { RoleCRUD } from "./role";
export { SettingsCRUD } from "./setting";
export { UserCRUD } from "./user";
export { FrontPageSettingsCRUD } from "./frontPageSetting";
export { MarqueeItemCRUD } from "./marqueeItem";
export { WhysubCardCRUD } from "./whysubCard";
export { CompareCategoryCRUD } from "./compareCategory";
export { CompareCriterionCRUD } from "./compareCriterion";
export { PortfolioCRUD } from "./portfolio";
export { PlanCRUD } from "./plan";
export { PlanFeatureCRUD } from "./planFeature";
export { FaqItemCRUD } from "./faq";
export { IndustryItemCRUD } from "./industry";
export { SectionCardCRUD } from "./sectionCard";
export { ProcessPhaseCRUD } from "./processPhase";
export { ContactSubmissionCRUD } from "./contactSubmission";
export { ServiceCategoryCRUD } from "./serviceCategory";
export { PlanOfInterestCRUD } from "./planOfInterest";

import { RoleCRUD } from "./role";
import { SettingsCRUD } from "./setting";
import { UserCRUD } from "./user";
import { FrontPageSettingsCRUD } from "./frontPageSetting";
import { MarqueeItemCRUD } from "./marqueeItem";
import { WhysubCardCRUD } from "./whysubCard";
import { CompareCategoryCRUD } from "./compareCategory";
import { CompareCriterionCRUD } from "./compareCriterion";
import { PortfolioCRUD } from "./portfolio";
import { PlanCRUD } from "./plan";
import { PlanFeatureCRUD } from "./planFeature";
import { FaqItemCRUD } from "./faq";
import { IndustryItemCRUD } from "./industry";
import { SectionCardCRUD } from "./sectionCard";
import { ProcessPhaseCRUD } from "./processPhase";
import { ContactSubmissionCRUD } from "./contactSubmission";
import { ServiceCategoryCRUD } from "./serviceCategory";
import { PlanOfInterestCRUD } from "./planOfInterest";

export const CRUDConfigs = {
  user: UserCRUD,
  role: RoleCRUD,
  settings: SettingsCRUD,
  frontPageSettings: FrontPageSettingsCRUD,
  marqueeItem: MarqueeItemCRUD,
  whysubCard: WhysubCardCRUD,
  compareCategory: CompareCategoryCRUD,
  compareCriterion: CompareCriterionCRUD,
  portfolio: PortfolioCRUD,
  plan: PlanCRUD,
  planFeature: PlanFeatureCRUD,
  faqItem: FaqItemCRUD,
  industryItem: IndustryItemCRUD,
  sectionCard: SectionCardCRUD,
  processPhase: ProcessPhaseCRUD,
  contactSubmission: ContactSubmissionCRUD,
  serviceCategory: ServiceCategoryCRUD,
  planOfInterest: PlanOfInterestCRUD,
} as const;
