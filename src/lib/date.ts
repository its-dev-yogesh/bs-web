const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

export function formatRelative(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  for (const [unit, secs] of UNITS) {
    if (Math.abs(diffSec) >= secs || unit === "second") {
      return RTF.format(Math.round(diffSec / secs), unit);
    }
  }
  return RTF.format(diffSec, "second");
}

export function formatDate(
  input: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("en", options).format(date);
}
