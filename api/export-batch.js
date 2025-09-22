
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { batch, exportType, companyName, bannerId } = req.body;

    if (exportType === 'qrcode') {
      // Usa il sistema Realtime Database invece di Firebase Hosting
      return await handleQRCodeGenerationRealtime(batch, companyName, res);
      
    } else if (exportType === 'pdf') {
      // Genera un vero PDF con pdf-lib
      return await generatePDFWithPDFLib(batch, companyName, res);

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
              border-radius: 15px;
              padding: 25px;
              margin-bottom: 30px;
              border-left: 6px solid #3b82f6;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .batch-section h2 {
              color: #1e40af;
              margin-bottom: 25px;
              font-size: 22px;
              display: flex;
              align-items: center;
              gap: 12px;
              font-weight: 700;
            }
            .batch-info {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 20px;
            }
            .info-item {
              background: white;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .info-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .info-label {
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-value {
              color: #6b7280;
              font-size: 15px;
              font-weight: 500;
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
              margin-bottom: 25px;
              font-size: 22px;
              display: flex;
              align-items: center;
              gap: 12px;
              font-weight: 700;
            }
            .step {
              background: #f0fdf4;
              border-radius: 15px;
              padding: 25px;
              margin-bottom: 20px;
              border-left: 6px solid #10b981;
              transition: transform 0.2s ease, box-shadow 0.2s ease;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
            }
            .step:hover {
              transform: translateX(8px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .step-header {
              font-size: 18px;
              font-weight: 700;
              color: #059669;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .step-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
              margin-top: 15px;
            }
            .step-detail {
              font-size: 14px;
              color: #6b7280;
              background: white;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
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
          <script>
            function toggleDescription(element) {
              const fullDesc = element.nextElementSibling;
              if (fullDesc && fullDesc.classList.contains('full-description')) {
                if (fullDesc.style.display === 'none') {
                  element.style.display = 'none';
                  fullDesc.style.display = 'inline';
                } else {
                  element.style.display = 'inline';
                  fullDesc.style.display = 'none';
                }
              }
            }
            
            function openImageModal(event, imageUrl) {
              event.preventDefault();
              const modal = document.createElement('div');
              modal.style.cssText = \`
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.9); display: flex; align-items: center;
                justify-content: center; z-index: 1000; cursor: pointer;
              \`;
              const img = document.createElement('img');
              img.src = imageUrl;
              img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 8px;';
              modal.appendChild(img);
              modal.onclick = () => document.body.removeChild(modal);
              document.body.appendChild(modal);
            }
          </script>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 CERTIFICATO DI TRACCIABILITÀ</h1>
              <div class="company-name">Prodotto da: ${companyName}</div>
            </div>

            <div class="content">
              <div class="batch-section">
                <h2>📦 INFORMAZIONI ISCRIZIONE</h2>
                <div class="batch-info">
                  <div class="info-item">
                    <div class="info-label">📦 Nome Prodotto</div>
                    <div class="info-value">${batch.name}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">📅 Data di Origine</div>
                    <div class="info-value">${batch.date || 'N/D'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">📍 Luogo di Produzione</div>
                    <div class="info-value">${batch.location || 'N/D'}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">📊 Stato</div>
                    <div class="info-value">✅ Finalizzato</div>
                  </div>
                  ${batch.imageIpfsHash && batch.imageIpfsHash !== "N/A" ? `
                    <div class="info-item">
                      <div class="info-label">🖼️ Immagine Prodotto</div>
                      <div class="info-value">
                        <a href="https://musical-emerald-partridge.myfilebase.com/ipfs/${batch.imageIpfsHash}" 
                           target="_blank" 
                           onclick="openImageModal(event, this.href)"
                           style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                          Visualizza Immagine
                        </a>
                      </div>
                    </div>
                  ` : ''}
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
                        <div class="step-detail">
                          📝 <strong>Descrizione:</strong> 
                          <span class="description-text" onclick="toggleDescription(this)">
                            ${step.description && step.description.length > 100 ? 
                              step.description.substring(0, 100) + '...' : 
                              step.description || 'Nessuna descrizione'}
                          </span>
                          ${step.description && step.description.length > 100 ? 
                            `<span class="full-description" style="display: none;">${step.description}</span>` : ''}
                        </div>
                        <div class="step-detail">📅 <strong>Data:</strong> ${step.date || 'N/D'}</div>
                        <div class="step-detail">📍 <strong>Luogo:</strong> ${step.location || 'N/D'}</div>
                        ${step.attachmentsIpfsHash && step.attachmentsIpfsHash !== "N/A" ? `
                          <div class="step-detail">
                            📎 <strong>Allegati:</strong>
                            <a href="https://musical-emerald-partridge.myfilebase.com/ipfs/${step.attachmentsIpfsHash}" 
                               target="_blank" 
                               style="color: #3b82f6; text-decoration: none; font-weight: 500; margin-left: 5px;">
                              Visualizza File
                            </a>
                          </div>
                        ` : ''}
                        <div class="step-detail">
                          🔗 <strong>Verifica su Blockchain:</strong>
                          <a href="https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash}" 
                             target="_blank" 
                             style="color: #3b82f6; text-decoration: none; font-weight: 500; margin-left: 5px;">
                            Verifica Transazione
                          </a>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <div class="footer">
              Generato tramite SimplyChain - Tracciabilità Blockchain per le imprese italiane.<br>
              Servizio Gratuito prodotto da SFY s.r.l. - Contattaci per maggiori informazioni: sfy.startup@gmail.com
            </div>
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="CERTIFICATO_TRACCIABILITA_${batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.html"`);
      res.send(html);
    } else {
      return res.status(400).json({ error: 'Export type not supported' });
    }

  } catch (error) {
    console.error('Errore durante l\'esportazione:', error);
    res.status(500).json({ error: 'Errore durante l\'esportazione', details: error.message });
  }
}

function generatePrintableHTML(batch, companyName) {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CERTIFICATO DI TRACCIABILITÀ - ${batch.name}</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #1f2937;
          background: white;
          padding: 20px;
        }
        .certificate-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 3px solid #8b5cf6;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.1);
        }
        .certificate-header {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 15px;
        }
        .certificate-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .company-info {
          font-size: 18px;
          opacity: 0.95;
          font-weight: 500;
        }
        .certificate-content {
          padding: 30px;
        }
        .section {
          margin-bottom: 35px;
          background: #f8fafc;
          border-radius: 12px;
          padding: 25px;
          border-left: 5px solid #8b5cf6;
        }
        .section-title {
          color: #8b5cf6;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .info-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          color: #1f2937;
          font-size: 16px;
          font-weight: 500;
        }
        .description-box {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          margin-top: 15px;
        }
        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .step-item {
          background: white;
          border-radius: 10px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          position: relative;
        }
        .step-number {
          position: absolute;
          top: -10px;
          left: 20px;
          background: #8b5cf6;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }
        .step-title {
          color: #8b5cf6;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 15px;
          margin-top: 5px;
        }
        .step-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        .step-detail {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .step-detail-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 14px;
        }
        .step-detail-value {
          color: #1f2937;
          font-size: 15px;
        }
        .qr-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }
        .qr-code {
          width: 80px;
          height: 80px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f9fafb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        .qr-code img {
          width: 100%;
          height: 100%;
          border-radius: 6px;
        }
        .blockchain-link {
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }
        .footer {
          background: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          z-index: 1000;
        }
        .instructions {
          position: fixed;
          top: 80px;
          right: 20px;
          background: #f8fafc;
          border: 2px solid #8b5cf6;
          border-radius: 8px;
          padding: 15px;
          max-width: 300px;
          font-size: 14px;
          color: #1f2937;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        .instructions h4 {
          color: #8b5cf6;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .instructions ol {
          margin: 0;
          padding-left: 20px;
        }
        .instructions li {
          margin-bottom: 5px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          background: #10b981;
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ Stampa PDF</button>
      
      <div class="instructions no-print">
        <h4>📄 Come convertire in PDF:</h4>
        <ol>
          <li>Premi il pulsante "Stampa PDF"</li>
          <li>Nel dialogo di stampa, seleziona "Salva come PDF"</li>
          <li>Scegli la destinazione e salva</li>
        </ol>
      </div>
      
      <div class="certificate-container">
        <div class="certificate-header">
          <div class="logo">S</div>
          <div class="certificate-title">Certificato di Tracciabilità</div>
          <div class="company-info">SIMPLY CHAIN</div>
          <div style="margin-top: 10px; font-size: 16px; opacity: 0.9;">Prodotto da: ${companyName}</div>
        </div>

        <div class="certificate-content">
          <!-- Informazioni Batch -->
          <div class="section">
            <div class="section-title">📦 Informazioni Iscrizione</div>
            <div class="info-grid">
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
                <div class="info-value">
                  <span class="status-badge">✅ Finalizzato</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Batch ID</div>
                <div class="info-value">${batch.batchId}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Data Generazione</div>
                <div class="info-value">${new Date().toLocaleDateString('it-IT')}</div>
              </div>
            </div>
            
            ${batch.description ? `
              <div class="description-box">
                <div class="info-label">Descrizione</div>
                <div class="info-value">${batch.description}</div>
              </div>
            ` : ''}
            
            <div class="info-item" style="margin-top: 20px;">
              <div class="info-label">Verifica su Blockchain</div>
              <div class="qr-container">
                <div class="qr-code">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}&color=8b5cf6&bgcolor=ffffff" alt="QR Code Blockchain" />
                </div>
                <div>
                  <div class="step-detail-value">Transaction Hash:</div>
                  <div class="step-detail-value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${batch.transactionHash}</div>
                  <a href="https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}" target="_blank" class="blockchain-link">
                    🔗 Verifica su Polygonscan
                  </a>
                </div>
              </div>
            </div>
          </div>

          ${batch.steps && batch.steps.length > 0 ? `
            <div class="section">
              <div class="section-title">🔄 Fasi di Lavorazione</div>
              <div class="steps-container">
                ${batch.steps.map((step, index) => `
                  <div class="step-item">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-title">${step.eventName}</div>
                    <div class="step-details">
                      <div class="step-detail">
                        <div class="step-detail-label">Descrizione</div>
                        <div class="step-detail-value">${step.description || 'Nessuna descrizione'}</div>
                      </div>
                      <div class="step-detail">
                        <div class="step-detail-label">Data</div>
                        <div class="step-detail-value">${step.date || 'N/D'}</div>
                      </div>
                      <div class="step-detail">
                        <div class="step-detail-label">Luogo</div>
                        <div class="step-detail-value">${step.location || 'N/D'}</div>
                      </div>
                      <div class="step-detail">
                        <div class="step-detail-label">Verifica Blockchain</div>
                        <div class="qr-container">
                          <div class="qr-code">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash}&color=8b5cf6&bgcolor=ffffff" alt="QR Code Step ${index + 1}" />
                          </div>
                          <div>
                            <div class="step-detail-value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${step.transactionHash}</div>
                            <a href="https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash}" target="_blank" class="blockchain-link">
                              🔗 Verifica Transazione
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <strong>SIMPLY CHAIN</strong> - Tracciabilità Blockchain per le imprese italiane<br>
          Servizio Gratuito prodotto da SFY s.r.l.<br>
          Contattaci: sfy.startup@gmail.com | Generato il ${new Date().toLocaleString('it-IT')}
        </div>
      </div>
    </body>
    </html>
  `;
}

// Funzione per gestire la generazione QR Code con Realtime Database
async function handleQRCodeGenerationRealtime(batch, companyName, res) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔥 Generando QR Code con Realtime Database per batch:', batch.batchId);
    }
    
    // Step 1: Genera dati certificato
    const certificateData = {
      batchId: batch.batchId,
      name: batch.name,
      companyName: companyName,
      walletAddress: batch.walletAddress || 'unknown',
      date: batch.date,
      location: batch.location,
      description: batch.description,
      transactionHash: batch.transactionHash,
      imageIpfsHash: batch.imageIpfsHash,
      steps: batch.steps || [],
      createdAt: new Date().toISOString(),
      isActive: true,
      viewCount: 0
    };

    // Step 2: Salva dati nel Realtime Database
    const admin = await import('firebase-admin');
    
    if (!admin.default.apps.length) {
      admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
    }

    const realtimeDb = admin.default.database();
    const certificateId = `${batch.batchId}_${Date.now()}`;
    const certificateRef = realtimeDb.ref(`certificates/${certificateId}`);
    
    await certificateRef.set(certificateData);
    if (process.env.NODE_ENV !== 'production') {
      console.log('💾 Dati certificato salvati in Realtime Database:', certificateId);
    }

    // Step 3: Genera URL per visualizzare il certificato
    const baseUrl = process.env.PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const certificateUrl = `${baseUrl}/api/qr-system?action=view&id=${certificateId}`;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('🌐 URL certificato generato:', certificateUrl);
    }

    // Step 4: Genera QR Code
    const QRCode = await import('qrcode');
    const qrCodeDataUrl = await QRCode.default.toDataURL(certificateUrl, {
      width: 1000,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    if (process.env.NODE_ENV !== 'production') {
      console.log('📱 QR Code generato per URL:', certificateUrl);
    }

    // Step 5: Restituisci il QR Code
    res.setHeader('Content-Type', 'image/png');
    const cleanBatchName = batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanBatchName}_qrcode.png"`);
    res.send(qrBuffer);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ QR Code creato con successo usando Realtime Database');
    }
    
  } catch (error) {
    console.error('❌ Errore generazione QR Code');
    res.status(500).json({ 
      error: 'Errore nella generazione del QR Code',
      details: error.message 
    });
  }
}

// Funzione per gestire la generazione QR Code (vecchia versione con Firebase Hosting)
async function handleQRCodeGeneration(batch, companyName, res) {
  try {
    console.log('🔥 Iniziando generazione QR Code per batch:', batch.batchId);
    
    // Step 1: Genera HTML per il certificato
    const certificateHTML = generateCertificateHTML(batch, companyName);
    console.log('📄 HTML certificato generato');
    
    // Step 2: Deploy HTML su Firebase Hosting
    // Usa il nome dell'iscrizione per il file, pulito per URL
    const cleanBatchName = batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const fileName = `${cleanBatchName}_${batch.batchId}.html`;
    const certificateUrl = await deployToFirebaseHosting(certificateHTML, fileName, companyName, batch);
    console.log('🌐 Certificato deployato su:', certificateUrl);
    
    // Step 3: Genera QR Code che punta al certificato
    const QRCode = await import('qrcode');
    const qrCodeDataUrl = await QRCode.default.toDataURL(certificateUrl, {
      width: 1000,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Step 4: Converti QR Code in buffer per il download
    const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    console.log('📱 QR Code generato per URL:', certificateUrl);
    
    // Step 5: Restituisci il QR Code per il download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanBatchName}_qrcode.png"`);
    res.send(qrBuffer);
    
    console.log('✅ QR Code scaricato - punta a Firebase:', certificateUrl);
    
  } catch (error) {
    console.error('❌ Errore generazione QR Code:', error);
    res.status(500).json({ 
      error: 'Errore nella generazione del QR Code',
      details: error.message 
    });
  }
}

// Funzione per generare HTML del certificato (riutilizza logica esistente)
function generateCertificateHTML(batch, companyName) {
  return `
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
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: #f1f5f9;
          min-height: 100vh;
          padding: 20px;
        }
        .certificate-container {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(30, 41, 59, 0.95);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid rgba(139, 92, 246, 0.3);
          padding-bottom: 30px;
        }
        .title {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 1.2rem;
          color: #94a3b8;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-item {
          background: rgba(139, 92, 246, 0.1);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .info-label {
          font-weight: 600;
          color: #8b5cf6;
          margin-bottom: 8px;
        }
        .info-value {
          color: #f1f5f9;
          font-size: 1.1rem;
        }
        .steps-section {
          margin-top: 40px;
        }
        .steps-title {
          font-size: 1.8rem;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 20px;
          text-align: center;
        }
        .step {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .step-header {
          font-size: 1.3rem;
          font-weight: bold;
          color: #06b6d4;
          margin-bottom: 15px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid rgba(139, 92, 246, 0.3);
          font-size: 0.9rem;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="certificate-container">
        <div class="header">
          <h1 class="title">🔗 SimplyChain</h1>
          <p class="subtitle">Certificato di Tracciabilità Blockchain</p>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">📦 Nome Prodotto</div>
            <div class="info-value">${batch.name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">🏢 Azienda</div>
            <div class="info-value">${companyName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">📅 Data</div>
            <div class="info-value">${batch.date}</div>
          </div>
          <div class="info-item">
            <div class="info-label">📍 Luogo</div>
            <div class="info-value">${batch.location}</div>
          </div>
          <div class="info-item">
            <div class="info-label">📝 Descrizione</div>
            <div class="info-value">${batch.description || 'Nessuna descrizione'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">🔗 Transaction Hash</div>
            <div class="info-value" style="word-break: break-all; font-size: 0.9rem;">${batch.transactionHash}</div>
          </div>
        </div>

        ${batch.steps && batch.steps.length > 0 ? `
          <div class="steps-section">
            <h2 class="steps-title">📋 Fasi di Produzione</h2>
            ${batch.steps.map((step, index) => `
              <div class="step">
                <div class="step-header">Step ${index + 1}: ${step.eventName}</div>
                <div><strong>Descrizione:</strong> ${step.description || 'Nessuna descrizione'}</div>
                <div><strong>Data:</strong> ${step.date || 'N/D'}</div>
                <div><strong>Luogo:</strong> ${step.location || 'N/D'}</div>
                ${step.transactionHash ? `<div><strong>Transaction Hash:</strong> ${step.transactionHash}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          Generato tramite SimplyChain - Tracciabilità Blockchain per le imprese italiane.<br>
          Servizio Gratuito prodotto da SFY s.r.l. - Contattaci per maggiori informazioni: sfy.startup@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;
}

// Funzione per deployare HTML su Firebase Hosting (gratuito)
async function deployToFirebaseHosting(htmlContent, fileName, companyName, batch) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔥 Deployando certificato su Firebase Hosting:', fileName);
    }
    
    const admin = await import('firebase-admin');
    
    // Inizializza Firebase se non già fatto
    if (!admin.default.apps.length) {
      admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
      });
    }
    
    // APPROCCIO: Usa Firestore per salvare HTML + endpoint Firebase Hosting
    // Firebase Hosting può servire file da Cloud Functions
    const db = admin.default.firestore();
    const certificateId = fileName.replace('.html', '');
    
    // Salva HTML in Firestore
    await db.collection('certificates').doc(certificateId).set({
      html: htmlContent,
      fileName: fileName,
      companyName: companyName,
      cleanCompanyName: companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_'),
      batchName: batch.name,
      createdAt: admin.default.firestore.FieldValue.serverTimestamp(),
      isPublic: true
    });
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('💾 HTML salvato in Firestore:', certificateId);
    }
    
    // Deploy immediato su Firebase Hosting
    const cleanCompanyName = companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    
    try {
      // Deploy immediato tramite GitHub API direttamente
      if (process.env.NODE_ENV !== 'production') {
        console.log('🚀 Tentativo deploy Firebase via GitHub API...');
      }
      
      if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
        throw new Error('GITHUB_TOKEN o GITHUB_REPO mancanti');
      }
      
      const filePath = `public/certificate/${cleanCompanyName}/${certificateId}.html`;
      if (process.env.NODE_ENV !== 'production') {
        console.log('📁 File path:', filePath);
      }
      
      const githubResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SimplyChain-Deploy'
        },
        body: JSON.stringify({
          message: `Add certificate: ${certificateId} for ${companyName}`,
          content: Buffer.from(htmlContent).toString('base64'),
          branch: 'main'
        })
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('📡 GitHub API response status:', githubResponse.status);
      }

      if (!githubResponse.ok) {
        const errorText = await githubResponse.text();
        if (process.env.NODE_ENV !== 'production') {
          console.error('❌ GitHub API error:', errorText);
        }
        throw new Error(`GitHub API failed: ${githubResponse.status}`);
      }

      const githubResult = await githubResponse.json();
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ File aggiunto al repository:', githubResult.commit?.sha);
      }
      
      const certificateUrl = `https://${process.env.FIREBASE_PROJECT_ID}.web.app/certificate/${cleanCompanyName}/${certificateId}.html`;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔥 URL Firebase Hosting:', certificateUrl);
        console.log('⏱️ Certificato disponibile tra 1-2 minuti dopo deploy GitHub Actions');
      }
      
      return certificateUrl;
      
    } catch (deployError) {
      console.error('❌ Errore deploy Firebase');
      
      // Fallback: usa endpoint Vercel
      const baseUrl = process.env.PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const fallbackUrl = `${baseUrl}/api/certificate/${certificateId}`;
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔗 Fallback URL:', fallbackUrl);
      }
      return fallbackUrl;
    }
    
  } catch (error) {
    console.error('❌ Errore Firebase Hosting');
    
    // Fallback: usa endpoint Vercel
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Fallback a endpoint Vercel...');
    }
    
    try {
      const admin = await import('firebase-admin');
      const db = admin.default.firestore();
      const certificateId = fileName.replace('.html', '');
      
      await db.collection('certificates').doc(certificateId).set({
        html: htmlContent,
        fileName: fileName,
        createdAt: admin.default.firestore.FieldValue.serverTimestamp(),
        isPublic: true
      });
      
      const baseUrl = process.env.PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const certificateUrl = `${baseUrl}/api/certificate/${certificateId}`;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Fallback completato:', certificateUrl);
      }
      return certificateUrl;
      
    } catch (fallbackError) {
      console.error('❌ Errore anche nel fallback');
      throw new Error(`Errore nel deploy HTML: ${error.message}`);
    }
  }
}

// Funzione per generare vero PDF con pdf-lib
async function generatePDFWithPDFLib(batch, companyName, res) {
  try {
    console.log('🔥 Generando vero PDF con pdf-lib per batch:', batch.batchId);
    
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
    
    // Crea nuovo documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    // Colori del tema (come AziendaPage)
    const primaryColor = rgb(0.545, 0.361, 0.965); // #8b5cf6
    const cardBg = rgb(0.05, 0.05, 0.15); // #0d0d26 (background card)
    const lightGray = rgb(0.973, 0.980, 0.988); // #f8fafc
    const darkGray = rgb(0.122, 0.161, 0.216); // #1f2937
    const white = rgb(1, 1, 1);
    const textGray = rgb(0.6, 0.6, 0.6); // #999999
    
    // Background scuro come AziendaPage
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 595,
      height: 842,
      color: cardBg,
    });
    
    // Header con gradiente viola (come AziendaPage)
    page.drawRectangle({
      x: 0,
      y: 742,
      width: 595,
      height: 100,
      color: primaryColor,
    });
    
    // Logo Simply Chain (come nell'header)
    page.drawCircle({
      x: 50,
      y: 792,
      radius: 15,
      color: white,
    });
    
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    page.drawText('S', {
      x: 42,
      y: 787,
      size: 20,
      font: font,
      color: primaryColor,
    });
    
    // Titolo principale (come nell'header)
    page.drawText('CERTIFICATO DI TRACCIABILITÀ', {
      x: 0,
      y: 762,
      size: 24,
      font: font,
      color: white,
      align: 'center',
    });
    
    // Simply Chain (come nell'header)
    page.drawText('SIMPLY CHAIN', {
      x: 0,
      y: 737,
      size: 16,
      font: font,
      color: white,
      align: 'center',
    });
    
    // Azienda (come nell'header)
    page.drawText(`Prodotto da: ${companyName}`, {
      x: 0,
      y: 712,
      size: 12,
      font: font,
      color: white,
      align: 'center',
    });
    
    // Sezione Informazioni Batch (come card AziendaPage)
    page.drawRectangle({
      x: 50,
      y: 600,
      width: 495,
      height: 100,
      color: cardBg,
      borderColor: primaryColor,
      borderWidth: 1,
    });
    
    page.drawText('INFORMAZIONI ISCRIZIONE', {
      x: 60,
      y: 670,
      size: 16,
      font: font,
      color: primaryColor,
    });
    
    // Griglia informazioni
    const infoData = [
      ['Nome Prodotto:', batch.name],
      ['Data di Origine:', batch.date || 'N/D'],
      ['Luogo di Produzione:', batch.location || 'N/D'],
      ['Stato:', 'Finalizzato'],
      ['Batch ID:', batch.batchId],
      ['Data Generazione:', new Date().toLocaleDateString('it-IT')]
    ];
    
    infoData.forEach(([label, value], index) => {
      const x = 60 + (index % 2) * 240;
      const y = 640 + Math.floor(index / 2) * 15;
      
      page.drawText(label, {
        x: x,
        y: y,
        size: 10,
        font: font,
        color: textGray, // Come nelle card
      });
      
      page.drawText(value, {
        x: x + 80,
        y: y,
        size: 10,
        font: regularFont,
        color: white, // Testo bianco come nelle card
      });
    });
    
    let yPosition = 480;
    
    // Descrizione se presente (come card AziendaPage)
    if (batch.description) {
      page.drawRectangle({
        x: 50,
        y: yPosition,
        width: 495,
        height: 40,
        color: cardBg,
        borderColor: primaryColor,
        borderWidth: 1,
      });
      
      page.drawText('Descrizione:', {
        x: 60,
        y: yPosition + 20,
        size: 12,
        font: font,
        color: primaryColor,
      });
      
      // Dividi la descrizione in righe se troppo lunga
      const maxWidth = 475;
      const words = batch.description.split(' ');
      let line = '';
      let lines = [];
      
      for (const word of words) {
        const testLine = line + word + ' ';
        if (testLine.length * 6 > maxWidth) { // 6px per carattere approssimativo
          lines.push(line);
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      lines.forEach((line, index) => {
        page.drawText(line, {
          x: 60,
          y: yPosition + 5 - (index * 12),
          size: 10,
          font: regularFont,
          color: white, // Testo bianco come nelle card
        });
      });
      
      yPosition -= 60;
    }
    
    // QR Code per batch (come card AziendaPage)
    page.drawRectangle({
      x: 60,
      y: yPosition,
      width: 60,
      height: 60,
      color: cardBg,
      borderColor: primaryColor,
      borderWidth: 1,
    });
    
    page.drawText('QR CODE', {
      x: 75,
      y: yPosition + 30,
      size: 10,
      font: font,
      color: primaryColor,
      align: 'center',
    });
    
    page.drawText('Blockchain', {
      x: 75,
      y: yPosition + 20,
      size: 8,
      font: font,
      color: primaryColor,
      align: 'center',
    });
    
    page.drawText('Verification', {
      x: 75,
      y: yPosition + 10,
      size: 8,
      font: font,
      color: primaryColor,
      align: 'center',
    });
    
    // Testo verifica blockchain
    page.drawText('Verifica Blockchain:', {
      x: 140,
      y: yPosition + 30,
      size: 10,
      font: font,
      color: primaryColor,
    });
    
    page.drawText('Transaction Hash:', {
      x: 140,
      y: yPosition + 15,
      size: 8,
      font: font,
      color: textGray, // Come nelle card
    });
    
    // Dividi l'hash in righe se troppo lungo
    const hash = batch.transactionHash;
    const hashLines = [];
    for (let i = 0; i < hash.length; i += 50) {
      hashLines.push(hash.substring(i, i + 50));
    }
    
    hashLines.forEach((line, index) => {
      page.drawText(line, {
        x: 140,
        y: yPosition - (index * 10),
        size: 8,
        font: regularFont,
        color: white, // Testo bianco come nelle card
      });
    });
    
    yPosition -= 100;
    
    // Steps se presenti
    if (batch.steps && batch.steps.length > 0) {
      // Nuova pagina se necessario
      if (yPosition < 200) {
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = 700;
      }
      
      page.drawRectangle({
        x: 50,
        y: yPosition,
        width: 495,
        height: 20,
        color: cardBg,
        borderColor: primaryColor,
        borderWidth: 1,
      });
      
      page.drawText('FASI DI LAVORAZIONE', {
        x: 60,
        y: yPosition + 5,
        size: 16,
        font: font,
        color: primaryColor,
      });
      
      yPosition -= 40;
      
      batch.steps.forEach((step, index) => {
        // Nuova pagina se necessario
        if (yPosition < 100) {
          const newPage = pdfDoc.addPage([595, 842]);
          yPosition = 700;
        }
        
        // Step container (come card AziendaPage)
        page.drawRectangle({
          x: 50,
          y: yPosition - 60,
          width: 495,
          height: 60,
          color: cardBg,
          borderColor: primaryColor,
          borderWidth: 1,
        });
        
        // Numero step
        page.drawCircle({
          x: 70,
          y: yPosition - 20,
          radius: 8,
          color: primaryColor,
        });
        
        page.drawText((index + 1).toString(), {
          x: 65,
          y: yPosition - 25,
          size: 10,
          font: font,
          color: white,
        });
        
        // Titolo step
        page.drawText(step.eventName, {
          x: 90,
          y: yPosition - 10,
          size: 12,
          font: font,
          color: primaryColor,
        });
        
        // Dettagli step
        const stepDetails = [
          ['Descrizione:', step.description || 'Nessuna descrizione'],
          ['Data:', step.date || 'N/D'],
          ['Luogo:', step.location || 'N/D']
        ];
        
        stepDetails.forEach(([label, value], detailIndex) => {
          const y = yPosition - 25 - (detailIndex * 12);
          page.drawText(label, {
            x: 90,
            y: y,
            size: 9,
            font: font,
            color: textGray, // Come nelle card
          });
          page.drawText(value, {
            x: 90 + 60,
            y: y,
            size: 9,
            font: regularFont,
            color: white, // Testo bianco come nelle card
          });
        });
        
        // QR Code per step (placeholder)
        page.drawRectangle({
          x: 500,
          y: yPosition - 55,
          width: 40,
          height: 40,
          borderColor: primaryColor,
          borderWidth: 1,
        });
        
        page.drawText('QR', {
          x: 515,
          y: yPosition - 30,
          size: 8,
          font: font,
          color: primaryColor,
          align: 'center',
        });
        
        page.drawText('CODE', {
          x: 515,
          y: yPosition - 40,
          size: 8,
          font: font,
          color: primaryColor,
          align: 'center',
        });
        
        page.drawText('Verifica:', {
          x: 500,
          y: yPosition - 50,
          size: 6,
          font: font,
          color: primaryColor,
        });
        
        const txHash = step.transactionHash.substring(0, 15) + '...';
        page.drawText(txHash, {
          x: 500,
          y: yPosition - 60,
          size: 6,
          font: regularFont,
          color: darkGray,
        });
        
        yPosition -= 80;
      });
    }
    
    // Footer (come AziendaPage)
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 595,
      height: 50,
      color: cardBg,
      borderColor: primaryColor,
      borderWidth: 1,
    });
    
    page.drawText('SIMPLY CHAIN - Tracciabilità Blockchain per le imprese italiane', {
      x: 0,
      y: 30,
      size: 8,
      font: font,
      color: white, // Testo bianco come nel footer
      align: 'center',
    });
    
    page.drawText('Servizio Gratuito prodotto da SFY s.r.l. - sfy.startup@gmail.com', {
      x: 0,
      y: 15,
      size: 8,
      font: font,
      color: textGray, // Testo grigio come nel footer
      align: 'center',
    });
    
    // Genera il PDF
    const pdfBytes = await pdfDoc.save();
    
    // Invia il PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CERTIFICATO_TRACCIABILITA_${batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(pdfBytes));
    
    console.log('Vero PDF generato con successo');
    
  } catch (error) {
    console.error('Errore generazione PDF:', error);
    res.status(500).json({ 
      error: 'Errore nella generazione del PDF',
      details: error.message 
    });
  }
}

