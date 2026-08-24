/**
 * Converts Captain API chunk text (HTML tables + Markdown-style markup) to
 * a single HTML string safe to render with dangerouslySetInnerHTML.
 * The content comes from the user's own Captain collection (trusted source).
 */
export function renderChunkText(text: string): string {
  let html = text;

  // Normalize Windows line endings
  html = html.replace(/\r\n/g, "\n");

  // Headings — must run before bold/italic so #-prefixed lines are captured first
  html = html.replace(/^#{3}\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^#{2}\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^#{1}\s+(.+)$/gm, "<h2>$1</h2>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(?!\s)(.+?)(?<!\s)\*/g, "<em>$1</em>");

  // Unordered list items: lines starting with "* " or "- "
  html = html.replace(/^[*-]\s+(.+)$/gm, "<li>$1</li>");
  // Wrap consecutive <li> blocks in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Paragraphs: blank lines between non-HTML, non-heading content
  // Split on double newlines, wrap non-block-element chunks in <p>
  const BLOCK_ELEMENT = /^\s*<(?:table|thead|tbody|tr|th|td|ul|ol|li|h[1-6]|hr|div|p|blockquote)/i;
  const chunks = html.split(/\n{2,}/);
  html = chunks
    .map((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return "";
      if (BLOCK_ELEMENT.test(trimmed)) return trimmed;
      // Wrap plain-text paragraphs; convert remaining single newlines to <br>
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

/** Returns true if the text visibly contains raw HTML or Markdown markup. */
export function needsRendering(text: string): boolean {
  return /<[a-z][\s\S]*?>/i.test(text) || /\*\*|^#{1,3}\s|^[*-]\s/m.test(text);
}
