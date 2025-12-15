import { getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  // ----------------------------
  // PDF HANDLING (unpdf)
  // ----------------------------
  if (file.type === "application/pdf") {
    const pdfDoc = await getDocumentProxy(uint8);
    const numPages = pdfDoc.numPages;

    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item: any) => item.str || "")
        .join(" ");

      fullText += pageText + "\n";
    }

    return fullText;
  }

  // ----------------------------
  // DOCX HANDLING (mammoth)
  // ----------------------------
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const buffer = Buffer.from(uint8); // ✅ FIX

    const { value } = await mammoth.extractRawText({
      buffer,
    });

    return value;
  }

  throw new Error("❌ Unsupported file type");
}
