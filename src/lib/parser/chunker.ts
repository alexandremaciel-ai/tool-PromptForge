/**
 * Chunk text into segments of roughly targetSize tokens.
 * Uses paragraph-based splitting with minimal overlap.
 */
export function chunkText(
  text: string,
  targetSize: number = 800,
  overlap: number = 50
): string[] {
  // Clean the text
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (!cleaned) return [];

  // Split by paragraphs
  const paragraphs = cleaned.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Estimate tokens (~4 chars per token)
    const currentTokens = Math.ceil(current.length / 4);
    const paraTokens = Math.ceil(trimmed.length / 4);

    if (currentTokens + paraTokens > targetSize && current) {
      chunks.push(current.trim());
      // Keep overlap from the end of current chunk
      const overlapText = current.slice(-overlap * 4);
      current = overlapText + "\n\n" + trimmed;
    } else {
      current = current ? current + "\n\n" + trimmed : trimmed;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}
