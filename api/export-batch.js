
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { batch, exportType, companyName, bannerId } = req.body;

    if (exportType === 'qrcode') {
      // Genera HTML, salvalo sul server e crea QR Code
      return await handleQRCodeGeneration(batch, companyName, res);
      
    } else if (exportType === 'pdf') {
      // Per ora PDF non è supportato in ambiente serverless
      // Generiamo invece un HTML che può essere convertito in PDF dal browser
      const pdfHtml = generatePrintableHTML(batch, companyName);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${batch.name}_certificato_stampa.html"`);
      res.send(pdfHtml);

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
      res.setHeader('Content-Disposition', `attachment; filename="${batch.name}_certificato.html"`);
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
      <title>${batch.name} - Certificato di Tracciabilità (PDF)</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .no-print { display: none; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.4; 
          color: #333;
          background: white;
          padding: 20px;
        }
        .print-header {
          text-align: center;
          padding: 20px;
          background: #3b82f6;
          color: white;
          margin-bottom: 30px;
          border-radius: 8px;
        }
        .print-header h1 { font-size: 24px; margin-bottom: 10px; }
        .company-name { font-size: 16px; opacity: 0.9; }
        .batch-info { margin-bottom: 30px; }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .info-item {
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .info-value { color: #6b7280; }
        .steps-section { margin-top: 30px; }
        .step {
          margin-bottom: 15px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }
        .step-header { font-weight: bold; color: #059669; margin-bottom: 10px; }
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ Stampa PDF</button>
      
      <div class="print-header">
        <h1>📋 CERTIFICATO DI TRACCIABILITÀ</h1>
        <div class="company-name">Prodotto da: ${companyName}</div>
      </div>

      <div class="batch-info">
        <h2>📦 INFORMAZIONI ISCRIZIONE</h2>
        <div class="info-grid">
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
        </div>
        
        ${batch.description ? `
          <div class="info-item">
            <div class="info-label">Descrizione</div>
            <div class="info-value">${batch.description}</div>
          </div>
        ` : ''}
        
        <div class="info-item">
          <div class="info-label">🔗 Verifica su Blockchain</div>
          <div class="info-value">${batch.transactionHash}</div>
        </div>
      </div>

      ${batch.steps && batch.steps.length > 0 ? `
        <div class="steps-section">
          <h2>🔄 FASI DI LAVORAZIONE</h2>
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

      <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #9ca3af;">
        Generato tramite SimplyChain - Tracciabilità Blockchain per le imprese italiane.<br>
        Servizio Gratuito prodotto da SFY s.r.l. - Contattaci per maggiori informazioni: sfy.startup@gmail.com
      </div>
    </body>
    </html>
  `;
}

// Funzione per gestire la generazione QR Code
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
    const certificateUrl = await deployToFirebaseHosting(certificateHTML, fileName);
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
    console.log('📱 QR Code generato (1000x1000px)');
    
    // Step 5: Restituisci il QR Code per il download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanBatchName}_qrcode.png"`);
    res.send(qrBuffer);
    
    console.log('✅ QR Code inviato per download');
    
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

// Funzione per deployare HTML su Firebase Storage (URL pubblici esterni)
async function deployToFirebaseHosting(htmlContent, fileName) {
  try {
    console.log('🔥 Caricando certificato su Firebase Storage:', fileName);
    
    const admin = await import('firebase-admin');
    
    // Inizializza Firebase se non già fatto
    if (!admin.default.apps.length) {
      admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });
    }
    
    // Prova prima con Firebase Storage (potrebbe funzionare per file HTML)
    try {
      const bucket = admin.default.storage().bucket();
      const file = bucket.file(`certificates/${fileName}`);
      
      // Upload HTML
      await file.save(htmlContent, {
        metadata: {
          contentType: 'text/html; charset=utf-8',
          cacheControl: 'public, max-age=31536000',
        }
      });
      
      // Rendi il file pubblico
      await file.makePublic();
      
      // URL pubblico Firebase Storage (esterno al nostro sito)
      const certificateUrl = `https://storage.googleapis.com/${process.env.FIREBASE_PROJECT_ID}.appspot.com/certificates/${fileName}`;
      
      console.log('🌐 Certificato caricato su Firebase Storage:', certificateUrl);
      return certificateUrl;
      
    } catch (storageError) {
      console.log('⚠️ Firebase Storage non disponibile, uso Firestore fallback');
      
      // Fallback: Usa Firestore + endpoint del nostro sito
      const certificateId = fileName.replace('.html', '');
      const db = admin.default.firestore();
      
      await db.collection('certificates').doc(certificateId).set({
        html: htmlContent,
        fileName: fileName,
        createdAt: admin.default.firestore.FieldValue.serverTimestamp(),
        isPublic: true
      });
      
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      const certificateUrl = `${baseUrl}/certificate/${certificateId}`;
      
      console.log('🔄 Certificato salvato con fallback:', certificateUrl);
      return certificateUrl;
    }
    
  } catch (error) {
    console.error('❌ Errore deploy:', error);
    throw new Error(`Errore nel deploy: ${error.message}`);
  }
}
