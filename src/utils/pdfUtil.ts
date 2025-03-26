/**
 * PDF utility functions for generating PDF files
 */

import { Style, StyleDictionary } from 'pdfmake/interfaces';

/**
 * Default style for PDF documents
 */
export const PDF_DEFAULT_STYLE: Style = {
  fontSize: 9,
  lineHeight: 1.2,
  margin: [0, 15, 0, 15] as [number, number, number, number],
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
    color: '#8a8a8a',
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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      if (!ctx) {
        reject('Could not get canvas context');
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject('');
    };

    img.src = imagePath;
  });
}
