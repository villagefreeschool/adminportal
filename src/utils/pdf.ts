import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Define default styles
const defaultStyles = {
  header: {
    fontSize: 18,
    bold: true,
    margin: [0, 0, 0, 10],
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5],
  },
  tableHeader: {
    bold: true,
    fontSize: 13,
    color: 'black',
    fillColor: '#eeeeee',
  },
};

/**
 * Generate a PDF document with a table
 * @param title Document title
 * @param data Array of objects to display in the table
 * @param filename Name of the file to download (without extension)
 */
export function generateTablePDF<T extends Record<string, any>>(
  title: string,
  data: T[],
  filename: string
): void {
  // If no data, create empty document with message
  if (!data.length) {
    const docDefinition = {
      content: [
        { text: title, style: 'header' },
        { text: 'No data available', style: 'subheader' },
      ],
      styles: defaultStyles,
    };
    
    pdfMake.createPdf(docDefinition).download(`${filename}.pdf`);
    return;
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);
  
  // Create table body starting with header row
  const tableBody = [
    headers.map(header => ({ 
      text: header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1'), 
      style: 'tableHeader' 
    })),
  ];
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => item[header]?.toString() || '');
    tableBody.push(row);
  });
  
  // Create document definition
  const docDefinition = {
    content: [
      { text: title, style: 'header' },
      {
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill('*'),
          body: tableBody,
        },
        layout: {
          fillColor: function(rowIndex) {
            return rowIndex % 2 === 0 ? '#FFFFFF' : '#F8F8F8';
          }
        }
      },
    ],
    footer: function(currentPage, pageCount) { 
      return { 
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        fontSize: 8,
        margin: [0, 10, 0, 0]
      };
    },
    styles: defaultStyles,
  };
  
  // Generate and download PDF
  pdfMake.createPdf(docDefinition).download(`${filename}.pdf`);
}

/**
 * Generate a PDF document with custom content
 * @param docDefinition The pdfmake document definition
 * @param filename Name of the file to download (without extension)
 * @param action 'download', 'open', or 'print'
 */
export function generateCustomPDF(
  docDefinition: any,
  filename: string,
  action: 'download' | 'open' | 'print' = 'download'
): void {
  const pdf = pdfMake.createPdf(docDefinition);
  
  switch (action) {
    case 'open':
      pdf.open();
      break;
    case 'print':
      pdf.print();
      break;
    case 'download':
    default:
      pdf.download(`${filename}.pdf`);
      break;
  }
}
