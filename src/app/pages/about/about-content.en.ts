import { AboutContent } from './about-content';

export const aboutContentEn: AboutContent = {
  lede: 'Image Optimizer started from one simple need: batch-compress images without worrying where private photos are being uploaded.',

  storyTitle: 'The story',
  storyParagraphs: [
    "I'm a front-end developer. One day I needed to send a client 80 product photos, 4-5 MB each. TinyPNG counts files, Squoosh handles one at a time, and the desktop tools either need installs or come with telemetry. So I sat down and wrote my own.",
    "The goal: a tool you open and use immediately — no signup, no upload, no limits. Because everything runs in your browser, I pay nothing for servers, and you don't have to trust me about whether your images leave your machine.",
  ],

  techTitle: 'Tech stack',
  techBlurb:
    'Choices prioritize being light and auditable. The landing page ships under 110 KB gzipped on first load.',
  techStack: [
    { name: 'Angular 21', role: 'Framework + Signals + SSG prerender', url: 'https://angular.dev' },
    { name: 'RxJS', role: 'Concurrency control (3 images at once)', url: 'https://rxjs.dev' },
    {
      name: 'heic-to',
      role: 'Decode HEIC files from iPhone (libheif WASM)',
      url: 'https://github.com/hoppergee/heic-to',
    },
    { name: 'JSZip', role: 'Bundle batches into .zip', url: 'https://stuk.github.io/jszip/' },
    {
      name: '@angular/cdk',
      role: 'Drag-drop + Dialog overlay',
      url: 'https://material.angular.dev/cdk',
    },
  ],

  privacyTitle: 'Privacy commitment',
  privacyBlurb:
    'Not a 5000-word policy. Just what the code actually does — and you can verify it on GitHub.',
  privacyBullets: [
    'Your images NEVER leave the browser. There is no upload endpoint anywhere in the code.',
    'No tracking cookies, no Google Analytics, no Facebook Pixel, no third-party script reading file content.',
    'localStorage only stores UI config (presets, language, theme). Clearing browser data wipes it.',
    'No account required, no email needed. You open, use, close the tab.',
    'Source is public under MIT — anyone can audit it or self-host on their own domain.',
    'Works after the first page load even if you go offline. (Full PWA cache is on the roadmap.)',
  ],

  ossTitle: 'Open source',
  ossParagraphs: [
    'All code is MIT licensed. Fork it, modify it, use it in commercial projects — just keep the copyright notice.',
    'Issues, pull requests, and feature ideas are all welcome. Roadmap is public on GitHub Projects.',
  ],

  supportTitle: 'Support the project',
  supportBlurb:
    "The app is free, ad-free, doesn't sell data, and there's no premium plan in the pipeline. If it makes your day easier, a coffee helps me keep it running and shipping new features.",
  supportCta: '☕ Buy me a coffee',

  contactTitle: 'Contact',
  contactBlurb: 'Fastest ways to reach me:',
  contactLines: [
    {
      label: 'Bugs & feature requests',
      href: 'https://github.com/ttquang1063750/angular-image-optimizer/issues',
      text: 'GitHub Issues',
    },
    {
      label: 'Pull requests',
      href: 'https://github.com/ttquang1063750/angular-image-optimizer',
      text: 'GitHub repository',
    },
  ],
};
