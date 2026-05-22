export type ChangeKind = 'added' | 'changed' | 'fixed';

export interface ChangelogGroup {
  kind: ChangeKind;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  /** ISO date YYYY-MM-DD. */
  date: string;
  /** Short codename, optional. */
  codename?: string;
  groups: ChangelogGroup[];
}

export interface ChangelogContent {
  intro: string;
  noteTitle: string;
  noteBody: string;
  kindLabels: Record<ChangeKind, string>;
  entries: ChangelogEntry[];
}
