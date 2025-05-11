/**
 * PDF utility functions for generating PDF files
 */

import type { Style, StyleDictionary } from "pdfmake/interfaces";
import type { SignatureData } from "../services/firebase/models/types";

/**
 * Default style for PDF documents
 */
export const PDF_DEFAULT_STYLE: Style = {
  fontSize: 9,
  lineHeight: 1.2,
  margin: [0, 15, 0, 15] as [number, number, number, number],
  // No font specified - use default
};

/**
 * Common styles for PDF documents
 */
export const PDF_STYLES: StyleDictionary = {
  title: {
    fontSize: 24,
    bold: true,
  },
  subtitle: {
    fontSize: 20,
    bold: true,
  },
  header: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 10] as [number, number, number, number],
  },
  subheader: {
    fontSize: 12,
    bold: true,
    margin: [0, 10, 0, 10] as [number, number, number, number],
  },
  body: {
    fontSize: 9,
    bold: true,
  },
  caption: {
    fontSize: 7,
    color: "#8a8a8a",
  },
  signature: {
    italics: true,
    fontSize: 16,
    color: "#000066",
  },
  signatureCaption: {
    fontSize: 8,
    color: "#666666",
  },
};

/**
 * dataURLFromImagePath performs an in-browser download of the referenced
 * image and encodes it as a dataURL. This function is intended for use when
 * embedding images in browser-generated PDF files.
 *
 * @param imagePath a relative URL of the image for which the DataURI is desired
 * (example: './VFSLogo.png')
 *
 * @returns A Promise which will resolve the DataURL of the supplied image
 */
export function dataURLFromImagePath(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      if (!ctx) {
        reject("Could not get canvas context");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      reject("");
    };

    img.src = imagePath;
  });
}

/**
 * Normalizes signature data for use in PDFMake
 *
 * @param signature The signature data to normalize
 * @returns A properly formatted data URL for PDFMake or null if data is invalid
 */
export function normalizeSignatureForPdf(signature: SignatureData): string | null {
  if (!signature || !signature.data) {
    return null;
  }

  let imageData = signature.data;

  // Remove any query parameters
  if (imageData.includes("?")) {
    imageData = imageData.split("?")[0];
  }

  try {
    // Ensure proper formatting for PDFMake
    if (imageData.startsWith("data:image/png;base64,")) {
      // Already formatted correctly
      return imageData;
    }
    if (imageData.startsWith("data:image/jpeg;base64,")) {
      // JPEG format is also acceptable
      return imageData;
    }
    if (imageData.startsWith("data:image/svg+xml;base64,")) {
      // SVG format is also acceptable
      return imageData;
    }
    if (imageData.includes("base64,")) {
      // Extract base64 part and recreate proper data URL
      const base64Data = imageData.split("base64,")[1];
      return `data:image/png;base64,${base64Data}`;
    }
    if (imageData.match(/^[A-Za-z0-9+/=]+$/)) {
      // Just raw base64 data without prefix
      return `data:image/png;base64,${imageData}`;
    }

    // Try to determine if it's a DOM data URI (canvas.toDataURL() style)
    if (typeof imageData === "string" && imageData.startsWith("<")) {
      // Might be raw SVG content
      try {
        // Encode as SVG
        return `data:image/svg+xml;base64,${window.btoa(imageData)}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Silent fail - we'll return null below
      }
    }

    // If we got here, the data is in an unexpected format
    return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return null;
  }
}

/**
 * Creates an empty signature box when a real signature isn't available.
 * This function is used for testing and fallback cases when working with signatures
 * in non-PDF contexts.
 *
 * @param name Optional name to include in the signature box (for debugging purposes)
 * @returns A data URL for an empty signature box image
 */
export function createFallbackSignature(name?: string): string {
  try {
    // Create a canvas for the empty signature box
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Draw white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw guidelines to indicate where to sign (paper form style)
    ctx.strokeStyle = "#eee";
    ctx.beginPath();
    ctx.moveTo(20, 70);
    ctx.lineTo(280, 70);
    ctx.stroke();

    // Only add text if specified (for debugging)
    if (name) {
      ctx.font = "normal 10px sans-serif";
      ctx.fillStyle = "#ccc";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`Signature box for: ${name}`, canvas.width / 2, 95);
    }

    // Convert to data URL
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error creating fallback signature box:", error);

    // Return a basic SVG as last resort if canvas fails
    return `data:image/svg+xml;base64,${window.btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100">' +
        '<rect width="300" height="100" fill="white" stroke="#ccc" stroke-width="1"/>' +
        '<line x1="20" y1="70" x2="280" y2="70" stroke="#eee" stroke-width="1"/>' +
        "</svg>",
    )}`;
  }
}

/**
 * Pre-processes a signature image by loading it through canvas
 * This is a promise-based approach that properly waits for the image to load
 *
 * @param imageData The image data to process
 * @returns A promise that resolves to a clean data URL for the image, or null if processing fails
 */
export function preprocessSignatureImage(imageData: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (!imageData || imageData.length < 100) {
      resolve(null);
      return;
    }

    try {
      // Create a canvas
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Create an image
      const img = new window.Image();

      // Set up event handlers for the image
      img.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill with white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          // Convert to data URL and resolve promise
          const dataUrl = canvas.toDataURL("image/png");
          resolve(dataUrl);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          resolve(null);
        }
      };

      img.onerror = () => {
        resolve(null);
      };

      // Set cross-origin to anonymous to avoid CORS issues
      img.crossOrigin = "Anonymous";

      // Set the source to the image data
      img.src = imageData;

      // If the image is already loaded, the onload event may not fire
      if (img.complete && img.naturalHeight !== 0) {
        // Call the onload handler directly if image is already loaded
        if (img.onload) {
          // Create a custom event that mimics the load event
          const loadEvent = new window.Event("load");
          // Cast to EventListener to satisfy TypeScript
          (img.onload as EventListener)(loadEvent);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      resolve(null);
    }
  });
}
