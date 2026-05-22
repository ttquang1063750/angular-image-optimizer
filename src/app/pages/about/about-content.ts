export interface TechItem {
  name: string;
  role: string;
  url?: string;
}

export interface AboutContent {
  lede: string;
  storyTitle: string;
  storyParagraphs: string[];
  techTitle: string;
  techBlurb: string;
  techStack: TechItem[];
  privacyTitle: string;
  privacyBlurb: string;
  privacyBullets: string[];
  ossTitle: string;
  ossParagraphs: string[];
  supportTitle: string;
  supportBlurb: string;
  supportCta: string;
  contactTitle: string;
  contactBlurb: string;
  contactLines: { label: string; href: string; text: string }[];
}
