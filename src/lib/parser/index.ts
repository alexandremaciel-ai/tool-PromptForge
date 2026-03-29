import * as pdfParseModule from "pdf-parse";
import { OfficeParser } from "officeparser";

// Helper for CJS vs ESM compatibility with pdf-parse
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

/**
 * Extract text from a PDF buffer.
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text || "";
}

/**
 * Extract text from a plain text buffer.
 */
export function parseText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

/**
 * Extract text from a markdown buffer (preserves structure).
 */
export function parseMarkdown(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

/**
 * Parses Office files (docx, pptx, xlsx)
 */
export async function parseOfficeDoc(buffer: Buffer): Promise<string> {
  const ast = await OfficeParser.parseOffice(buffer);
  return ast.toText() || "";
}

/**
 * Parse a file buffer based on its extension.
 */
export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();

  switch (ext) {
    case "pdf":
      return parsePdf(buffer);
    case "txt":
      return parseText(buffer);
    case "md":
    case "markdown":
      return parseMarkdown(buffer);
    case "docx":
    case "pptx":
    case "xlsx":
      return parseOfficeDoc(buffer);
    default:
      throw new Error(`Formato não suportado: .${ext}`);
  }
}
