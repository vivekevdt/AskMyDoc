declare module "pdf-parse" {
  interface PDFResult {
    text: string;
    numpages?: number;
    numrender?: number;
    info?: any;
    metadata?: any;
    version?: string;
  }

  function pdf(data: Buffer | Uint8Array, options?: any): Promise<PDFResult>;

  export default pdf;
}
