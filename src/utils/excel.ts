import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Generate and download an Excel file from data
 * @param data Array of objects to export
 * @param filename Name of the file to download
 * @param sheetName Name of the worksheet
 */
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName = 'Sheet1'
): Promise<void> {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // If no data, return empty workbook
  if (!data.length) {
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${filename}.xlsx`);
    return;
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);

  // Add headers to the worksheet
  worksheet.addRow(headers);

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  data.forEach((item) => {
    const row = headers.map((header) => item[header]);
    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    const lengths = column.values?.filter(Boolean).map((v) => v.toString().length) || [];
    const maxLength = Math.max(...lengths, 10);
    column.width = maxLength + 2;
  });

  // Generate buffer and save file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
}

/**
 * Import data from an Excel file
 * @param file The Excel file to import
 * @returns Promise resolving to the parsed data
 */
export async function importFromExcel(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = new ExcelJS.Workbook();
        
        await workbook.xlsx.load(buffer as ArrayBuffer);
        
        const worksheet = workbook.worksheets[0];
        const data: Record<string, any>[] = [];
        
        // Get headers from the first row
        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell) => {
          headers.push(cell.value?.toString() || '');
        });
        
        // Read data rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) { // Skip header row
            const rowData: Record<string, any> = {};
            row.eachCell((cell, colNumber) => {
              rowData[headers[colNumber - 1]] = cell.value;
            });
            data.push(rowData);
          }
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}
