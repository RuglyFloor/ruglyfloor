import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { order_id } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Fetch order details
    const order = await base44.asServiceRole.entities.Order.get(order_id);
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create certificate PDF (8.5" x 5.5" - half letter, landscape)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [8.5, 5.5]
    });

    // Set up decorative border (for cutting guide)
    doc.setLineWidth(0.02);
    doc.setDrawColor(200, 200, 200);
    doc.rect(0.25, 0.25, 8, 5, 'S');
    
    // Inner decorative border
    doc.setLineWidth(0.01);
    doc.rect(0.35, 0.35, 7.8, 4.8, 'S');

    // Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF AUTHENTICITY', 4.25, 1.0, { align: 'center' });

    // Decorative line
    doc.setLineWidth(0.02);
    doc.setDrawColor(0, 0, 0);
    doc.line(1.5, 1.3, 7.0, 1.3);

    // Serial number (if available)
    const serialNumber = order.order_number || `ORD-${order.id?.slice(0, 8)}`;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Certificate No: ${serialNumber}`, 4.25, 1.6, { align: 'center' });

    // Main content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const createdDate = order.created_date 
      ? new Date(order.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.text('This certifies that', 4.25, 2.2, { align: 'center' });
    
    // Customer name (bold)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(order.customer_name || 'Valued Customer', 4.25, 2.6, { align: 'center' });
    
    // Rug details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('is the authenticated owner of a', 4.25, 3.0, { align: 'center' });
    
    // Rug description
    const rugItem = order.items?.[0] || {};
    const rugDescription = rugItem.size 
      ? `${rugItem.size} Custom Hand-Painted Rug`
      : 'Custom Hand-Painted Rug';
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(rugDescription, 4.25, 3.4, { align: 'center' });

    // Date and quality details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Created: ${createdDate}`, 4.25, 3.9, { align: 'center' });
    
    if (rugItem.qualityLabel) {
      doc.text(`Quality: ${rugItem.qualityLabel}`, 4.25, 4.15, { align: 'center' });
    }

    // Footer signature area
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Rugly Floors - Homesteads, LLC', 4.25, 4.7, { align: 'center' });
    doc.text('Hand-crafted with care', 4.25, 4.9, { align: 'center' });

    // Signature line
    doc.setLineWidth(0.01);
    doc.line(5.5, 4.5, 7.2, 4.5);
    doc.setFontSize(8);
    doc.text('Authorized Signature', 6.35, 4.65, { align: 'center' });

    // Convert to blob and upload
    const pdfBlob = doc.output('blob');
    const fileName = `certificate-${serialNumber}-${Date.now()}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    // Update order with certificate URL
    await base44.asServiceRole.entities.Order.update(order_id, {
      certificate_url: file_url
    });

    return Response.json({ 
      success: true, 
      certificate_url: file_url,
      message: 'Certificate generated successfully'
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    return Response.json({ 
      error: 'Failed to generate certificate', 
      details: error.message 
    }, { status: 500 });
  }
});