/**
 * Display helpers for turning raw wiki field values into clean terminal text.
 *
 * Wiki Bucket values can contain MediaWiki link syntax (`[[Target|Label]]`),
 * HTML fragments (`<br/>`, `<b>…</b>`) and HTML entities (`&amp;`). These helpers
 * normalise that into plain, single-line text suitable for a TUI.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/** Strip wiki/HTML markup and collapse whitespace for clean single-line display. */
export function cleanWikiText(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, " ") // line breaks → space
    .replace(/<[^>]+>/g, "") // any other HTML tag → removed
    .replace(
      /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
      (_match, target: string, label?: string) => label ?? target
    )
    .replace(
      /&[a-z#0-9]+;/gi,
      (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? entity
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate to `max` display characters, using a trailing ellipsis when shortened. */
export function truncate(input: string, max: number): string {
  if (input.length <= max) {
    return input;
  }
  if (max <= 1) {
    return "…";
  }
  return `${input.slice(0, max - 1)}…`;
}
