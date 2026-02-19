import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

/**
 * Export the analytics report to PDF by capturing the HTML content
 * @param containerId - The ID of the HTML element to capture
 * @param filename - Optional custom filename
 */
export const exportToPDF = async (
  containerId: string = 'report-container',
  filename?: string
): Promise<void> => {
  try {
    const element = document.getElementById(containerId);
    
    if (!element) {
      throw new Error(`Element with id "${containerId}" not found`);
    }

    // Show a loading indicator (optional)
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#0a0a0a', // Dark background to match theme
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const pdfFilename = filename || `Vijay_Fan_Analytics_Report_${timestamp}.pdf`;

    // Save the PDF
    pdf.save(pdfFilename);

    // Restore cursor
    document.body.style.cursor = originalCursor;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    document.body.style.cursor = 'default';
    throw new Error('Failed to export report to PDF');
  }
};

/**
 * Print the analytics report
 * @param containerId - The ID of the HTML element to print
 */
export const printReport = (containerId: string = 'report-container'): void => {
  const element = document.getElementById(containerId);
  
  if (!element) {
    console.error(`Element with id "${containerId}" not found`);
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    toast.error('Please allow pop-ups to print the report');
    return;
  }

  // Copy the element content and styles
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Analytics Report - Vijay Fan Club</title>
        <style>
          @media print {
            body {
              margin: 0;
              padding: 20px;
              background: white;
            }
            .no-print {
              display: none !important;
            }
          }
          body {
            font-family: Arial, sans-serif;
            color: #333;
          }
        </style>
        <link rel="stylesheet" href="${window.location.origin}/styles.css">
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};
