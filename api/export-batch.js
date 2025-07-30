
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
          doc.addImage(`data:image/png;base64,${bannerData}`, 'PNG', 10, 10, 190, 40);
        }
      } catch (error) {
        console.log('Banner non disponibile, procedo senza banner');
      }

      // Titolo documento con stile
      doc.setFontSize(20);
      doc.setTextColor(51, 51, 51);
      doc.text('CERTIFICATO DI TRACCIABILITÀ', 105, 70, { align: 'center' });
      
      // Linea separatrice
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.line(20, 75, 190, 75);

      // Nome azienda
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text(`Prodotto da: ${companyName}`, 105, 90, { align: 'center' });

      // Sezione Iscrizione (Batch)
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('📋 INFORMAZIONI ISCRIZIONE', 20, 110);
      
      // Box per iscrizione
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, 115, 170, 50, 3, 3, 'FD');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Nome Prodotto: ${batch.name}`, 25, 125);
      doc.text(`Data di Origine: ${batch.date || 'N/D'}`, 25, 135);
      doc.text(`Luogo di Produzione: ${batch.location || 'N/D'}`, 25, 145);
      doc.text(`Stato: ✅ Finalizzato`, 25, 155);
      
      // Descrizione
      if (batch.description) {
        const splitDescription = doc.splitTextToSize(`Descrizione: ${batch.description}`, 165);
        doc.text(splitDescription, 25, 175);
      }

      // Link blockchain cliccabile
      doc.setTextColor(59, 130, 246);
      doc.textWithLink(`🔗 Verifica su Blockchain`, 25, 190, {
        url: `https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}`
      });

      // Steps section
      if (batch.steps && batch.steps.length > 0) {
        let yPos = 210;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('🔄 FASI DI LAVORAZIONE', 20, yPos);
        yPos += 10;

        batch.steps.forEach((step, index) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 30;
          }
          
          // Box per ogni step
          doc.setDrawColor(16, 185, 129);
          doc.setFillColor(240, 253, 244);
          doc.roundedRect(20, yPos, 170, 35, 2, 2, 'FD');
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129);
          doc.text(`Step ${index + 1}: ${step.eventName}`, 25, yPos + 8);
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.text(`📝 ${step.description || 'Nessuna descrizione'}`, 25, yPos + 16);
          doc.text(`📅 ${step.date || 'N/D'}`, 25, yPos + 23);
          doc.text(`📍 ${step.location || 'N/D'}`, 25, yPos + 30);
          
          yPos += 45;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Generato tramite EasyChain - Tracciabilità Blockchain', 105, 280, { align: 'center' });

      const pdfBuffer = doc.output('arraybuffer');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${batch.name}_certificato.pdf"`);
      res.send(Buffer.from(pdfBuffer));

    } else if (exportType === 'html') {
      const html = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${batch.name} - Certificato di Tracciabilità</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .banner { 
              width: 100%; 
              height: 120px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            .header {
              text-align: center;
              padding: 30px 20px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
            }
            .header h1 {
              font-size: 28px;
              margin-bottom: 10px;
            }
            .company-name { 
              font-size: 18px;
              opacity: 0.9;
            }
            .content {
              padding: 30px;
            }
            .batch-section {
              background: #f8fafc;
              border-radius: 10px;
              padding: 25px;
              margin-bottom: 30px;
              border-left: 5px solid #3b82f6;
            }
            .batch-section h2 {
              color: #1e40af;
              margin-bottom: 20px;
              font-size: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .batch-info {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
            }
            .info-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
              margin-bottom: 5px;
            }
            .info-value {
              color: #6b7280;
            }
            .blockchain-link {
              display: inline-flex;
              align-items: center;
              gap: 5px;
              color: #3b82f6;
              text-decoration: none;
              font-weight: 500;
              padding: 8px 15px;
              background: #eff6ff;
              border-radius: 20px;
              transition: all 0.3s ease;
            }
            .blockchain-link:hover {
              background: #dbeafe;
              transform: translateY(-1px);
            }
            .steps-section {
              margin-top: 30px;
            }
            .steps-section h2 {
              color: #10b981;
              margin-bottom: 20px;
              font-size: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .step {
              background: #f0fdf4;
              border-radius: 10px;
              padding: 20px;
              margin-bottom: 15px;
              border-left: 4px solid #10b981;
              transition: transform 0.2s ease;
            }
            .step:hover {
              transform: translateX(5px);
            }
            .step-header {
              font-size: 16px;
              font-weight: 600;
              color: #059669;
              margin-bottom: 10px;
            }
            .step-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 10px;
              margin-top: 10px;
            }
            .step-detail {
              font-size: 14px;
              color: #6b7280;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background: #f9fafb;
              color: #9ca3af;
              font-size: 12px;
            }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="banner">[Banner ${bannerId}]</div>
            
            <div class="header">
              <h1>📋 CERTIFICATO DI TRACCIABILITÀ</h1>
              <div class="company-name">Prodotto da: ${companyName}</div>
            </div>

            <div class="content">
              <div class="batch-section">
                <h2>📦 INFORMAZIONI ISCRIZIONE</h2>
                <div class="batch-info">
                  <div class="info-item">
                    <div class="info-label">Nome Prodotto</div>
                    <div class="info-value">${batch.name}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Data di Origine</div>
                    <div class="info-value">${batch.date || 'N/D'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Luogo di Produzione</div>
                    <div class="info-value">${batch.location || 'N/D'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Stato</div>
                    <div class="info-value">✅ Finalizzato</div>
                  </div>
                </div>
                
                ${batch.description ? `
                  <div style="margin-top: 20px;">
                    <div class="info-label">Descrizione</div>
                    <div class="info-value">${batch.description}</div>
                  </div>
                ` : ''}
                
                <div style="margin-top: 20px;">
                  <a href="https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}" 
                     target="_blank" class="blockchain-link">
                    🔗 Verifica su Blockchain
                  </a>
                </div>
              </div>

              ${batch.steps && batch.steps.length > 0 ? `
                <div class="steps-section">
                  <h2>🔄 FASI DI LAVORAZIONE</h2>
                  ${batch.steps.map((step, index) => `
                    <div class="step">
                      <div class="step-header">Step ${index + 1}: ${step.eventName}</div>
                      <div class="step-details">
                        <div class="step-detail">📝 <strong>Descrizione:</strong> ${step.description || 'Nessuna descrizione'}</div>
                        <div class="step-detail">📅 <strong>Data:</strong> ${step.date || 'N/D'}</div>
                        <div class="step-detail">📍 <strong>Luogo:</strong> ${step.location || 'N/D'}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <div class="footer">
              Generato tramite EasyChain - Tracciabilità Blockchain
            </div>
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${batch.name}_certificato.html"`);
      res.send(html);
    }

  } catch (error) {
    console.error('Errore durante l\'esportazione:', error);
    res.status(500).json({ error: 'Errore durante l\'esportazione', details: error.message });
  }
}
