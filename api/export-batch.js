
import jsPDF from 'jspdf';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { batch, exportType, bannerId, companyName } = req.body;

    if (exportType === 'pdf') {
      const doc = new jsPDF();
      
      // Aggiungi banner (se disponibile)
      try {
        const bannerPath = path.join(process.cwd(), 'src', 'banners', `${bannerId}.png`);
        if (fs.existsSync(bannerPath)) {
          const bannerData = fs.readFileSync(bannerPath, 'base64');
          doc.addImage(`data:image/png;base64,${bannerData}`, 'PNG', 10, 10, 190, 30);
        }
      } catch (error) {
        console.log('Banner non disponibile, procedo senza banner');
      }

      // Nome azienda
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(companyName, 105, 60, { align: 'center' });

      // Informazioni batch
      doc.setFontSize(14);
      doc.text(`Nome: ${batch.name}`, 20, 80);
      doc.text(`Prodotto da: ${companyName}`, 20, 90);
      doc.text(`Data di origine: ${batch.date || 'N/D'}`, 20, 100);
      doc.text(`Luogo: ${batch.location || 'N/D'}`, 20, 110);
      doc.text(`Stato: Completato`, 20, 120);
      
      // Descrizione
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(`Descrizione: ${batch.description || 'N/D'}`, 170);
      doc.text(splitDescription, 20, 130);

      // Link blockchain
      doc.setTextColor(0, 0, 255);
      doc.text(`Link Blockchain: https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}`, 20, 150);

      // Steps
      if (batch.steps && batch.steps.length > 0) {
        let yPos = 170;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text('STEPS:', 20, yPos);
        yPos += 10;

        batch.steps.forEach((step, index) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(11);
          doc.text(`Step ${index + 1}: ${step.eventName}`, 20, yPos);
          yPos += 7;
          
          doc.setFontSize(9);
          doc.text(`Descrizione: ${step.description || 'N/D'}`, 25, yPos);
          yPos += 5;
          doc.text(`Data: ${step.date || 'N/D'}`, 25, yPos);
          yPos += 5;
          doc.text(`Luogo: ${step.location || 'N/D'}`, 25, yPos);
          yPos += 10;
        });
      }

      const pdfBuffer = doc.output('arraybuffer');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${batch.name}_export.pdf"`);
      res.send(Buffer.from(pdfBuffer));

    } else if (exportType === 'html') {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${batch.name} - Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .banner { width: 100%; height: 100px; background: #f0f0f0; margin-bottom: 20px; }
            .company-name { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
            .batch-info { margin: 20px 0; }
            .batch-info p { margin: 5px 0; }
            .steps { margin-top: 30px; }
            .step { margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .step h4 { margin: 0 0 10px 0; color: #333; }
          </style>
        </head>
        <body>
          <div class="banner">[Banner ${bannerId}]</div>
          <div class="company-name">${companyName}</div>
          
          <div class="batch-info">
            <h2>${batch.name}</h2>
            <p><strong>Prodotto da:</strong> ${companyName}</p>
            <p><strong>Data di origine:</strong> ${batch.date || 'N/D'}</p>
            <p><strong>Luogo:</strong> ${batch.location || 'N/D'}</p>
            <p><strong>Stato:</strong> Completato</p>
            <p><strong>Descrizione:</strong> ${batch.description || 'N/D'}</p>
            <p><strong>Link Blockchain:</strong> <a href="https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}" target="_blank">Visualizza transazione</a></p>
          </div>

          ${batch.steps && batch.steps.length > 0 ? `
            <div class="steps">
              <h3>STEPS:</h3>
              ${batch.steps.map((step, index) => `
                <div class="step">
                  <h4>Step ${index + 1}: ${step.eventName}</h4>
                  <p><strong>Descrizione:</strong> ${step.description || 'N/D'}</p>
                  <p><strong>Data:</strong> ${step.date || 'N/D'}</p>
                  <p><strong>Luogo:</strong> ${step.location || 'N/D'}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${batch.name}_export.html"`);
      res.send(html);
    }

  } catch (error) {
    console.error('Errore durante l\'esportazione:', error);
    res.status(500).json({ error: 'Errore durante l\'esportazione' });
  }
}
