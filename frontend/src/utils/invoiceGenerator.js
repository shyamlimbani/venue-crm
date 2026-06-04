import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { MODULES } from './constants';

export const getInvoiceNumber = (booking) => {
  if (!booking) return '';
  const dateObj = new Date(booking.createdAt || booking.date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const shortId = booking._id ? booking._id.toString().slice(-6).toUpperCase() : 'TEMP';
  return `INV-${year}${month}-${shortId}`;
};

export const generateInvoicePDF = (booking, branding) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  doc.setFont("helvetica");
  
  // Header details
  const logo = branding?.logo;
  
  if (logo && (logo.startsWith('data:image/png') || logo.startsWith('data:image/jpeg') || logo.startsWith('data:image/jpg') || logo.startsWith('data:image/webp'))) {
    try {
      // Add logo on left
      doc.addImage(logo, 'PNG', 14, 12, 28, 14);
    } catch (err) {
      console.error('Failed to add logo to PDF', err);
    }
  } else {
    // Fallback company name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(branding?.companyName || "VENUE CRM", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(branding?.tagline || "Enterprise Edition", 14, 25);
  }
  
  // Invoice Title (Right aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("BOOKING INVOICE", 196, 22, { align: "right" });
  
  // Horizontal divider
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(14, 28, 196, 28);
  
  // Metadata Section
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  const invNumber = getInvoiceNumber(booking);
  const bookingDateStr = booking.createdAt 
    ? format(new Date(booking.createdAt), 'dd MMM yyyy')
    : format(new Date(), 'dd MMM yyyy');
  const eventDateStr = format(new Date(booking.date), 'dd MMM yyyy');
  
  // Left Column (Invoice Meta)
  doc.text(`Invoice No:`, 14, 35);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(invNumber, 38, 35);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Booking Date:`, 14, 40);
  doc.setTextColor(0, 0, 0);
  doc.text(bookingDateStr, 38, 40);
  
  // Right Column (Customer & Event Details Header)
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Customer Name:`, 110, 35);
  doc.setTextColor(0, 0, 0);
  doc.text(booking.customerName, 140, 35);
  
  doc.setTextColor(80, 80, 80);
  doc.text(`Mobile Number:`, 110, 40);
  doc.setTextColor(0, 0, 0);
  doc.text(booking.mobile, 140, 40);
  
  // Table section header
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 46, 196, 46);
  
  // Section Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("BOOKING DETAILS", 14, 52);
  
  // Data Table (B&W Corporate Style)
  let y = 56;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);
  
  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y, 182, 7, 'F');
  doc.line(14, y, 196, y);
  doc.line(14, y + 7, 196, y + 7);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Field", 18, y + 5);
  doc.text("Value", 90, y + 5);
  
  // Table Rows
  const venueLabel = MODULES[booking.module]?.label || booking.module;
  
  const getBookingTypeLabel = (type) => {
    if (type === 'full-day') return 'Full Day';
    if (type === 'morning') return 'Morning Half Day';
    if (type === 'evening') return 'Evening Half Day';
    return type || 'Standard Booking';
  };
  
  const getSlotDetails = (b) => {
    if (b.module === 'cricket') return 'Full Day Booking';
    if (b.module === 'shooting') return `${b.startTime || ''} - ${b.endTime || ''}`;
    if (b.module === 'marriage' || b.module === 'banquet') return getBookingTypeLabel(b.bookingType);
    return b.timeSlot || 'Standard Slot';
  };
  
  const rows = [
    { field: "Customer Name", value: booking.customerName },
    { field: "Mobile Number", value: booking.mobile },
    { field: "Venue Name", value: venueLabel },
    { field: "Event Date", value: eventDateStr },
    { field: "Time Slot / Schedule", value: getSlotDetails(booking) }
  ];
  
  y += 7;
  doc.setFont("helvetica", "normal");
  
  rows.forEach((row) => {
    doc.text(row.field, 18, y + 6);
    doc.text(row.value, 90, y + 6);
    doc.line(14, y + 9, 196, y + 9);
    y += 9;
  });
  
  // Verticals borders for the table
  doc.line(14, 56, 14, y);
  doc.line(85, 56, 85, y);
  doc.line(196, 56, 196, y);
  
  // Payment Summary Section
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PAYMENT SUMMARY", 14, y);
  
  y += 4;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);
  
  // Total Amount Row
  doc.line(110, y, 196, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Total Amount:", 112, y + 6);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${booking.totalAmount.toLocaleString('en-IN')}`, 194, y + 6, { align: "right" });
  y += 8;
  
  // Advance Paid Row
  doc.line(110, y, 196, y);
  doc.setFont("helvetica", "normal");
  doc.text("Advance Paid:", 112, y + 6);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${booking.advanceAmount.toLocaleString('en-IN')}`, 194, y + 6, { align: "right" });
  y += 8;
  
  // Remaining Balance Row
  doc.line(110, y, 196, y);
  doc.setFont("helvetica", "normal");
  doc.text("Remaining Balance:", 112, y + 6);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${booking.remainingAmount.toLocaleString('en-IN')}`, 194, y + 6, { align: "right" });
  y += 8;
  
  // Payment Status Row
  doc.setFillColor(245, 245, 245);
  doc.rect(110, y, 86, 8, 'F');
  doc.line(110, y, 196, y);
  doc.line(110, y + 8, 196, y + 8);
  doc.line(110, y - 24, 110, y + 8); // vertical left boundary
  doc.line(196, y - 24, 196, y + 8); // vertical right boundary
  
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status:", 112, y + 5.5);
  doc.text(booking.paymentStatus?.toUpperCase() || "PENDING", 194, y + 5.5, { align: "right" });
  
  // Footer Section
  const pageHeight = doc.internal.pageSize.height;
  const now = new Date();
  
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 20, 196, pageHeight - 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Generated By: Venue CRM", 14, pageHeight - 14);
  doc.text(`Generated On: ${now.toLocaleString()}`, 196, pageHeight - 14, { align: "right" });
  doc.text("Thank you for your business!", 105, pageHeight - 9, { align: "center" });
  
  return doc;
};

export const getInvoiceFilename = (booking) => {
  if (!booking) return 'Invoice.pdf';
  const eventDateStr = format(new Date(booking.date), 'dd-MM-yyyy');
  const sanitizedCustomer = booking.customerName.replace(/[^a-zA-Z0-9]/g, '-');
  return `Invoice-${sanitizedCustomer}-${eventDateStr}.pdf`;
};

export const downloadInvoicePDF = (booking, branding) => {
  const doc = generateInvoicePDF(booking, branding);
  const filename = getInvoiceFilename(booking);
  doc.save(filename);
};

export const printInvoicePDF = (booking, branding) => {
  const doc = generateInvoicePDF(booking, branding);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
};
