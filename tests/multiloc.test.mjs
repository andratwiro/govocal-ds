import {describe, it, expect} from 'vitest';
import {
  emptyLocales,
  isLocaleFilled,
  localeDirection,
  localeName,
  localeStatus
} from '../src/components/gv/LocaleSwitcher.tsx';

const LOCALES = ['en', 'nl-BE', 'fr-BE'];

describe('isLocaleFilled and emptyLocales (Locale switcher)', () => {
  it('counts a language with text as filled, a missing, empty or blank one as empty', () => {
    const title = {en: 'Parks', 'nl-BE': '   ', 'fr-BE': ''};
    expect(isLocaleFilled('en', title)).toBe(true);
    expect(isLocaleFilled('nl-BE', title)).toBe(false);
    expect(isLocaleFilled('fr-BE', title)).toBe(false);
    expect(isLocaleFilled('de-DE', title)).toBe(false);
    expect(emptyLocales(LOCALES, title)).toEqual(['nl-BE', 'fr-BE']);
  });
  it('takes no value as every language empty', () => {
    expect(emptyLocales(LOCALES, null)).toEqual(LOCALES);
    expect(emptyLocales(LOCALES, undefined)).toEqual(LOCALES);
    expect(emptyLocales(LOCALES, {})).toEqual(LOCALES);
  });
  it('reads rich text: tags alone are empty, words or an image are not', () => {
    expect(isLocaleFilled('en', {en: '<p></p>'})).toBe(false);
    expect(isLocaleFilled('en', {en: '<p>&nbsp;</p>'})).toBe(false);
    expect(isLocaleFilled('en', {en: '<p><strong>Hi</strong></p>'})).toBe(true);
    expect(isLocaleFilled('en', {en: '<p><img src="a.png"></p>'})).toBe(true);
  });
  it('with several Multilocs, a language is filled only when every one has it (the platform switcher)', () => {
    const title = {en: 'Parks', 'nl-BE': 'Parken', 'fr-BE': 'Parcs'};
    const description = {en: 'Where trees go', 'nl-BE': '', 'fr-BE': 'Où vont les arbres'};
    expect(emptyLocales(LOCALES, [title, description])).toEqual(['nl-BE']);
    expect(emptyLocales(LOCALES, [title, null])).toEqual(LOCALES);
  });
  it('keeps the platform order', () => {
    expect(emptyLocales(['fr-BE', 'en', 'nl-BE'], {en: 'x'})).toEqual(['fr-BE', 'nl-BE']);
  });
});

describe('localeStatus', () => {
  const values = {en: 'Parks', 'nl-BE': ''};
  it('marks an optional empty language empty, a required one required, and red once invalid', () => {
    expect(localeStatus('en', {values})).toBe('filled');
    expect(localeStatus('nl-BE', {values})).toBe('empty');
    expect(localeStatus('nl-BE', {values, isRequired: true})).toBe('required');
    expect(localeStatus('nl-BE', {values, isRequired: true, isInvalid: true})).toBe('invalid');
    expect(localeStatus('nl-BE', {values, isInvalid: true})).toBe('empty');
    expect(localeStatus('en', {values, isRequired: true, isInvalid: true})).toBe('filled');
  });
  it('marks a language with an error of its own invalid, filled or not', () => {
    expect(localeStatus('en', {values, invalidLocales: ['en']})).toBe('invalid');
  });
});

describe('localeDirection and localeName', () => {
  it('runs Arabic, Hebrew, Persian and Urdu right to left, the rest left to right', () => {
    for (const code of ['ar', 'ar-SA', 'ar-MA', 'he', 'fa-IR', 'ur-PK']) expect(localeDirection(code), code).toBe('rtl');
    for (const code of ['en', 'nl-BE', 'fr-BE', 'sr-Latn', 'tr-TR', 'kl-GL']) expect(localeDirection(code), code).toBe('ltr');
  });
  it('falls back to the language part for a tag the browser rejects', () => {
    expect(localeDirection('ar_SA')).toBe('rtl');
    expect(localeDirection('en_GB')).toBe('ltr');
  });
  it("says a language's name in the interface's language, the code when unknown", () => {
    expect(localeName('nl-BE', 'en')).toBe('Dutch (Belgium)');
    expect(localeName('fr-BE', 'en')).toBe('French (Belgium)');
    expect(localeName('en', 'en')).toBe('English');
    expect(localeName('not a tag!', 'en')).toBe('not a tag!');
  });
});
