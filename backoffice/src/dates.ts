import {useDateFormatter} from 'govocal-ds';

/** The invented platform's today (the reports, invitations and copies made today carry it). ISO, as every date in
 * the data files: pages format them in the app's locale, never as fixed text. */
export const TODAY = '2026-10-29';

/**
 * A day as the locale writes it in a list or a property ("27 Oct 2026" in en-GB): every table date in the back office
 * reads the same way. Takes an ISO date ("2026-10-27").
 */
export function useDay(): (iso: string) => string {
  const f = useDateFormatter({day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
  return iso => f.format(new Date(`${iso}T00:00:00Z`));
}

/** The ISO date `days` before the platform's today. */
export const daysBefore = (days: number) => new Date(Date.parse(`${TODAY}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);

/** The invented platform's now, for what is sent or scheduled here (ISO, no zone: read as written). */
export const NOW = `${TODAY}T10:42`;

/** A day and a time as the locale writes them ("3 Nov 2026, 09:00" in en-GB). Takes "2026-11-03T09:00". */
export function useDayTime(): (iso: string) => string {
  const f = useDateFormatter({day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'});
  return iso => f.format(new Date(`${iso}Z`));
}
