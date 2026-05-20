import { Lang, TranslationDict } from './types';
import { vi } from './vi';
import { en } from './en';

export type { Lang, TranslationDict };

export const TRANSLATIONS: Record<Lang, TranslationDict> = { vi, en };
