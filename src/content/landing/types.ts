export type LocaleCode = 'en' | 'es' | 'de' | 'fr'

export interface LandingSection {
  title: string
  body: string
}

export interface LandingBullet {
  strong: string
  rest: string
}

export interface LandingStep {
  strong: string
  rest: string
}

export interface LandingFaq {
  question: string
  answer: string
}

export interface LandingCopy {
  code: LocaleCode
  htmlLang: string
  ogLocale: string
  path: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  schemaDescription: string
  breadcrumbName: string
  h1: string
  subhead: string
  downloadLabel: string
  seeHowLabel: string
  tracksTitle: string
  tracks: [LandingSection, LandingSection, LandingSection]
  choiceTitle: string
  withWatch: LandingSection
  withoutWatch: LandingSection
  compareTitle: string
  compareIntro: string
  compareLead: string
  bullets: [LandingBullet, LandingBullet, LandingBullet]
  compareOutro: string
  howTitle: string
  steps: [LandingStep, LandingStep, LandingStep]
  howDownloadLabel: string
  faqTitle: string
  faqs: [LandingFaq, LandingFaq, LandingFaq, LandingFaq, LandingFaq]
  ctaTitle: string
  ctaBody: string
  ctaLabel: string
  backLabel: string
  languagesLabel: string
  heroAlt: string
  gymAlt: string
  runAlt: string
}
