/**
 * Centralized PDFMake loader that uses CDN fonts
 * This ensures PDFMake is only loaded when needed, reducing initial bundle size
 */

// Define proper types for PDFMake
interface PDFFont {
  normal: string;
  bold: string;
  italics: string;
  bolditalics: string;
}

interface PDFFonts {
  [fontName: string]: PDFFont;
}

interface PDFMakeStatic {
  createPdf: (documentDefinition: unknown) => PDFDocumentRef;
  fonts: PDFFonts;
  vfs?: Record<string, string>;
}

interface PDFDocumentRef {
  download: (filename?: string) => void;
  open: (options?: unknown) => void;
  print: (options?: unknown) => void;
  getBase64: (callback: (base64: string) => void) => void;
  getBuffer: (callback: (buffer: ArrayBuffer) => void) => void;
  getBlob: (callback: (blob: globalThis.Blob) => void) => void;
}

// Add type definition for window with pdfMake
declare global {
  interface Window {
    pdfMake: PDFMakeStatic;
  }
}

// Cache the PDFMake instance to avoid loading it multiple times
let pdfMakeInstance: PDFMakeStatic | null = null;

// Define fonts using CDN URLs instead of bundling them
const pdfFonts: PDFFonts = {
  Roboto: {
    normal: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf",
    bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf",
    italics: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf",
    bolditalics:
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf",
  },
};

/**
 * Loads PDFMake dynamically and configures it with CDN fonts
 * @returns A promise that resolves to the PDFMake instance
 */
export const loadPdfMake = async (): Promise<PDFMakeStatic> => {
  if (pdfMakeInstance) {
    return pdfMakeInstance;
  }

  try {
    // Check if pdfMake is already loaded globally
    if (window.pdfMake) {
      const pdfMake: PDFMakeStatic = window.pdfMake;
      pdfMake.fonts = pdfFonts;
      pdfMakeInstance = pdfMake;
      return pdfMake;
    }

    // Import pdfMake directly as a script
    const pdfMakeScript = document.createElement("script");
    pdfMakeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js";
    pdfMakeScript.async = true;

    // Wait for the script to load
    await new Promise<void>((resolve, reject) => {
      pdfMakeScript.onload = () => resolve();
      pdfMakeScript.onerror = (e) => reject(new Error(`Failed to load PDFMake script: ${e}`));
      document.head.appendChild(pdfMakeScript);
    });

    // Access the global pdfMake object
    if (!window.pdfMake) {
      throw new Error("PDFMake failed to load properly");
    }

    const pdfMake: PDFMakeStatic = window.pdfMake;

    // Configure PDFMake to use CDN fonts
    pdfMake.fonts = pdfFonts;

    // Cache the instance
    pdfMakeInstance = pdfMake;

    return pdfMake;
  } catch (error) {
    console.error("Error loading PDFMake:", error instanceof Error ? error.message : String(error));
    throw new Error("Failed to load PDF generation library");
  }
};

// Export the fonts object so it can be used directly in createPdf calls
export const fonts = pdfFonts;
