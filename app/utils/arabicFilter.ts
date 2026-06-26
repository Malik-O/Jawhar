/**
 * Filters text to keep only Arabic characters, Arabic punctuation, and whitespace.
 * Used for DISPLAY ONLY — does not modify stored data.
 *
 * Keeps:
 * - Arabic main block: \u0600-\u06FF
 * - Arabic Supplement: \u0750-\u077F
 * - Arabic Presentation Forms-A: \uFB50-\uFDFF
 * - Arabic Presentation Forms-B: \uFE70-\uFEFF
 * - Arabic-Indic digits: ٠-٩ (\u0660-\u0669)
 * - Extended Arabic-Indic digits: ۰-۹ (\u06F0-\u06F9)
 * - Arabic punctuation: ، ؛ ؟ ﴿ ﴾ « »
 * - Common punctuation: . ! : ; -
 * - Whitespace: space, tab, newline
 *
 * Removes: Latin letters, Latin digits (0-9), other scripts, special symbols
 */
export function filterArabicOnly(text: string): string {
  if (!text) return '';

  // Regex matches characters to KEEP
  // \u0600-\u06FF : Arabic main block (includes letters, digits, punctuation)
  // \u0750-\u077F : Arabic Supplement
  // \uFB50-\uFDFF : Arabic Presentation Forms-A
  // \uFE70-\uFEFF : Arabic Presentation Forms-B
  // Specific punctuation: ، ؛ ؟ ﴿ ﴾ « » . ! : ; -
  // \s : whitespace
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\u060C\u061B\u061F\uFD3F\uFD3E\u00AB\u00BB.\u0021\u003A\u003B\u002D\s]/g;

  const matches = text.match(arabicRegex);
  return matches ? matches.join('') : '';
}

/**
 * Filters Arabic text while preserving custom tags like <fix>, <quran>, <hadith>.
 * Only filters the text content between/inside tags, not the tags themselves.
 * Used for transcript display where tags need to be preserved for rendering.
 */
export function filterArabicPreservingTags(text: string): string {
  if (!text) return '';

  // Split by tags but keep them in the result
  const parts = text.split(/(<\/?(?:fix|quran|hadith)\b[^>]*>)/gi);

  return parts.map(part => {
    // Don't filter tag names/attributes
    if (/^<\/?(?:fix|quran|hadith)\b/i.test(part)) return part;
    return filterArabicOnly(part);
  }).join('');
}
