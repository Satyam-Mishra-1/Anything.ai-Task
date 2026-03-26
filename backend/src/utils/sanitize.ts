import sanitizeHtml from "sanitize-html";

export function sanitizeText(input: unknown, maxLen: number): string {
  const str = typeof input === "string" ? input : "";
  const trimmed = str.trim().slice(0, maxLen);
  // Disallow any HTML to prevent injection when data is displayed.
  return sanitizeHtml(trimmed, { allowedTags: [], allowedAttributes: {} });
}

