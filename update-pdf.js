const fs = require('fs');

const file = 'src/app/admin/estimate/page.tsx';
let text = fs.readFileSync(file, 'utf8');

const newGeneratePDF = `  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Top Left
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(24);
    doc.text('TAX INVOICE', 14, 25);
    doc.setFontSize(9);
    doc.text(\`Invoice# INV-\${Date.now().toString().slice(-6)}\`, 14, 32);
    
    doc.setFontSize(8);
    doc.text('Balance Due', 14, 45);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(\`Rs.\${totalAmount.toLocaleString('en-IN')}.00\`, 14, 50);

    // Top Right (Company & Logo)
    const rightX = 195;
    
    // Fake logo text
    doc.setTextColor(39, 174, 96); // Greenish
    doc.setFontSize(22);
    doc.setFont('helvetica', 'normal');
    doc.text('ELSHADAI', rightX, 25, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INTERIOR & DECORS', rightX, 30, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const companyAddress = [
      'ELSHADAI INTERIOR & DECORS',
      'No 30, 1st Floor, Bharathi Nagar Main Road, KK Nagar,',
      'Chennai 87',
      'Chennai Tamil Nadu 600089',
      'India',
      'GSTIN 33AGOPJ2326E1ZQ',
      '7904614023',
      'elshadaidecors.in'
    ];
    let addrY = 40;
    companyAddress.forEach(line => {
      if (line === 'ELSHADAI INTERIOR & DECORS') doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      doc.text(line, rightX, addrY, { align: 'right' });
      addrY += 4;
    });

    // Invoice Meta (Left)
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Invoice Date :', 14, 85);
    doc.text('Terms :', 14, 90);
    doc.text('Due Date :', 14, 95);
    
    doc.setTextColor(0, 0, 0);
    doc.text(customer.date, 45, 85);
    doc.text('Due on Receipt', 45, 90);
    doc.text(customer.date, 45, 95);

    // Bill To (Right)
    doc.setTextColor(100, 100, 100);
    doc.text('Bill To', 100, 80);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(customer.name || 'Customer Name', 100, 85);
    doc.setFont('helvetica', 'normal');
    
    const billAddressLines = doc.splitTextToSize(customer.address || 'Address', 60);
    doc.text(billAddressLines, 100, 90);
    doc.text(customer.phone || '', 100, 90 + (billAddressLines.length * 4));
    
    // Place of Supply
    doc.text('Place Of Supply: Tamil Nadu (33)', 14, 115);

    // Table
    const tableColumn = ["#", "Item & Description", "HSN/SAC", "Qty", "Rate", "Amount"];
    const tableRows = items.map((item, index) => [
      index + 1,
      item.material,
      '000000',
      \`\${item.quantity}\\nsqft/nos\`,
      item.unitPrice.toLocaleString('en-IN', {minimumFractionDigits: 2}),
      (item.quantity * item.unitPrice).toLocaleString('en-IN', {minimumFractionDigits: 2})
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 120,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 4, textColor: [0, 0, 0] },
      headStyles: { fillColor: [51, 51, 51], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' }
      },
      didDrawCell: (data) => {
        if (data.row.section === 'body') {
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.1);
          doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        }
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    
    doc.save(\`Invoice_\${customer.name.replace(/\\s+/g, '_')}_\${customer.date}.pdf\`);
  };`;

text = text.replace(/  const generatePDF = \(\) => \{[\s\S]*?doc\.save.*?;\n  \};/m, newGeneratePDF);

fs.writeFileSync(file, text);
console.log("PDF updated");
