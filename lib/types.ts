export interface BISData {
  brandName: string;
  brandNameKo: string;
  vision: string;
  mission: string;
  essenceKeyword: string;
  essenceDesc: string;
  valueFunctional: Array<{ en: string; ko: string }>;
  valueEmotional: Array<{ en: string; ko: string }>;
  benefitFunctional: string;
  benefitEmotional: string;
  attributes: string;
  tagline: string;
}
