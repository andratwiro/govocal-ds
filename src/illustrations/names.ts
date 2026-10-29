/**
 * Every illustration in this folder, one per `<kebab-name>.svg` file. A converter adds the file and its name
 * here; tests/illustrations.test.mjs fails when the list and the folder disagree. The recipe and the list of
 * scenes still to convert: docs/ILLUSTRATIONS.md.
 */
export const illustrationNames = [
  'document-annotation',
  'empty-notebook',
  'ideation-map',
  'proposal-threshold',
  'survey-pages'
] as const;

export type IllustrationName = (typeof illustrationNames)[number];
