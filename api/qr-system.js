// API consolidata per gestire tutto il sistema QR Code con Firebase Realtime Database
export default async function handler(req, res) {
  const { action } = req.query;

  try {
    switch (action) {
      case 'create':
        return await handleCreateQR(req, res);
      case 'view':
        return await handleViewCertificate(req, res);
      case 'update-status':
        return await handleUpdateQRStatus(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action. Use: create, view, or update-status' });
    }
  } catch (error) {
    console.error('❌ Errore QR System API:', error);
    res.status(500).json({ 
      error: 'Errore interno del server',
      details: error.message 
    });
  }
}

// Gestisce la creazione di QR Code con Realtime Database
async function handleCreateQR(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { batch, companyName, walletAddress } = req.body;

  if (!batch || !companyName || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields: batch, companyName, walletAddress' });
  }

  console.log('🔥 Creando QR Code con Realtime Database per batch:', batch.batchId);
  
  // Step 1: Genera dati certificato
  const certificateData = {
    batchId: batch.batchId,
    name: batch.name,
    companyName: companyName,
    walletAddress: walletAddress,
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
  console.log('💾 Dati certificato salvati in Realtime Database:', certificateId);

  // Step 3: Genera URL per visualizzare il certificato
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const certificateUrl = `${baseUrl}/api/qr-system?action=view&id=${certificateId}`;
  
  console.log('🌐 Base URL:', baseUrl);
  console.log('🌐 Certificate URL:', certificateUrl);
  
  console.log('🌐 URL certificato generato:', certificateUrl);

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
  console.log('📱 QR Code generato per URL:', certificateUrl);

  // Step 5: Aggiorna stato batch in Firestore
  try {
    const firestore = admin.default.firestore();
    const batchRef = firestore.collection('companies').doc(walletAddress).collection('batches').doc(batch.batchId.toString());
    
    await batchRef.set({
      qrCodeGenerated: true,
      qrCodeGeneratedAt: admin.default.firestore.FieldValue.serverTimestamp(),
      qrCodeCertificateId: certificateId,
      qrCodeUrl: certificateUrl
    }, { merge: true });
    
    console.log('✅ Stato QR Code aggiornato in Firestore');
  } catch (firestoreError) {
    console.warn('⚠️ Errore aggiornamento Firestore (non critico):', firestoreError.message);
  }

  // Step 6: Restituisci il QR Code
  res.setHeader('Content-Type', 'image/png');
  const cleanBatchName = batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  res.setHeader('Content-Disposition', `attachment; filename="${cleanBatchName}_qrcode.png"`);
  res.send(qrBuffer);
  
  console.log('✅ QR Code creato con successo usando Realtime Database');
}

// Gestisce la visualizzazione dei certificati
async function handleViewCertificate(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Certificate ID is required' });
  }

  console.log('🔍 Recuperando certificato dal Realtime Database:', id);

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
  const certificateRef = realtimeDb.ref(`certificates/${id}`);
  
  const snapshot = await certificateRef.once('value');
  const certificateData = snapshot.val();

  if (!certificateData) {
    return res.status(404).send(generateErrorPage('Certificato non trovato', 'Il certificato richiesto non esiste o è stato rimosso.', '🔍'));
  }

  if (!certificateData.isActive) {
    return res.status(410).send(generateErrorPage('Certificato non disponibile', 'Questo certificato è stato disattivato.', '⚠️'));
  }

  // Incrementa contatore visualizzazioni
  try {
    await certificateRef.child('viewCount').transaction((current) => (current || 0) + 1);
    await certificateRef.child('lastViewed').set(new Date().toISOString());
  } catch (viewError) {
    console.warn('⚠️ Errore aggiornamento contatore:', viewError.message);
  }

  console.log('✅ Certificato trovato e visualizzato:', id);

  const certificateHTML = generateCertificateHTML(certificateData);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(certificateHTML);
}

// Gestisce l'aggiornamento dello stato QR
async function handleUpdateQRStatus(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress, batchId, qrCodeGenerated } = req.body;

  if (!walletAddress || !batchId || qrCodeGenerated === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const admin = await import('firebase-admin');
  
  if (!admin.default.apps.length) {
    admin.default.initializeApp({
      credential: admin.default.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      })
    });
  }

  const db = admin.default.firestore();
  const batchRef = db.collection('companies').doc(walletAddress).collection('batches').doc(batchId.toString());
  
  await batchRef.set({
    qrCodeGenerated: qrCodeGenerated,
    qrCodeGeneratedAt: admin.default.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  console.log(`✅ QR Code status aggiornato per batch ${batchId}: ${qrCodeGenerated}`);
  
  res.json({ 
    success: true, 
    message: 'QR Code status updated successfully' 
  });
}

function generateErrorPage(title, message, icon) {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - SimplyChain</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: #f1f5f9;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
        .error-container {
          text-align: center;
          padding: 40px;
          background: rgba(30, 41, 59, 0.95);
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .error-icon { font-size: 4rem; margin-bottom: 20px; }
        .error-title { font-size: 2rem; font-weight: bold; margin-bottom: 10px; color: #ef4444; }
        .error-message { font-size: 1.1rem; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">${icon}</div>
        <h1 class="error-title">${title}</h1>
        <p class="error-message">${message}</p>
      </div>
    </body>
    </html>
  `;
}

function generateCertificateHTML(certificateData) {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${certificateData.name} - Certificato di Tracciabilità</title>
      
      <meta property="og:title" content="${certificateData.name} - Certificato SimplyChain">
      <meta property="og:description" content="Certificato di tracciabilità blockchain prodotto da ${certificateData.companyName}">
      <meta property="og:type" content="website">
      <meta name="twitter:card" content="summary_large_image">
      
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: #f1f5f9;
          min-height: 100vh;
          padding: 20px;
          line-height: 1.6;
        }
        
        .certificate-container {
          max-width: 900px;
          margin: 0 auto;
          background: rgba(30, 41, 59, 0.95);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.3);
          backdrop-filter: blur(10px);
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
          background-clip: text;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 1.2rem;
          color: #94a3b8;
          margin-bottom: 10px;
        }
        
        .company-badge {
          display: inline-block;
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          border: 1px solid rgba(139, 92, 246, 0.3);
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
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .info-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
        }
        
        .info-label {
          font-weight: 600;
          color: #8b5cf6;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .info-value {
          color: #f1f5f9;
          font-size: 1.1rem;
          word-break: break-word;
        }
        
        .blockchain-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #06b6d4;
          text-decoration: none;
          font-weight: 500;
          padding: 10px 16px;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 25px;
          border: 1px solid rgba(6, 182, 212, 0.3);
          transition: all 0.3s ease;
          margin-top: 10px;
        }
        
        .blockchain-link:hover {
          background: rgba(6, 182, 212, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .step {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 20px;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .step:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.15);
        }
        
        .step-number {
          position: absolute;
          top: -10px;
          left: 20px;
          background: #06b6d4;
          color: #0f172a;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
        }
        
        .step-header {
          font-size: 1.3rem;
          font-weight: bold;
          color: #06b6d4;
          margin-bottom: 15px;
          margin-left: 20px;
        }
        
        .step-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-left: 20px;
        }
        
        .step-detail {
          font-size: 0.95rem;
          color: #cbd5e1;
          background: rgba(15, 23, 42, 0.3);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(6, 182, 212, 0.1);
        }
        
        .step-detail strong {
          color: #06b6d4;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid rgba(139, 92, 246, 0.3);
          color: #94a3b8;
        }
        
        .view-counter {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(139, 92, 246, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          backdrop-filter: blur(10px);
        }
        
        .image-preview {
          max-width: 200px;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .image-preview:hover {
          transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
          .certificate-container {
            padding: 20px;
            margin: 10px;
          }
          
          .title {
            font-size: 2rem;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .step-details {
            grid-template-columns: 1fr;
          }
        }
      </style>
      
      <script>
        function openImageModal(imageUrl) {
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
          document.body.appendChild(modal);
          modal.onclick = () => document.body.removeChild(modal);
        }
      </script>
    </head>
    <body>
      <div class="certificate-container">
        <div class="header">
          <h1 class="title">🔗 SimplyChain</h1>
          <p class="subtitle">Certificato di Tracciabilità Blockchain</p>
          <div class="company-badge">🏢 ${certificateData.companyName}</div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">📦 Nome Prodotto</div>
            <div class="info-value">${certificateData.name}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">📅 Data di Origine</div>
            <div class="info-value">${certificateData.date || 'N/D'}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">📍 Luogo di Produzione</div>
            <div class="info-value">${certificateData.location || 'N/D'}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">📊 Stato</div>
            <div class="info-value">✅ Certificato Attivo</div>
          </div>
          
          ${certificateData.imageIpfsHash && certificateData.imageIpfsHash !== "N/A" ? `
            <div class="info-item">
              <div class="info-label">🖼️ Immagine Prodotto</div>
              <div class="info-value">
                <img src="https://musical-emerald-partridge.myfilebase.com/ipfs/${certificateData.imageIpfsHash}" 
                     alt="Immagine prodotto" 
                     class="image-preview"
                     onclick="openImageModal(this.src)">
              </div>
            </div>
          ` : ''}
          
          <div class="info-item">
            <div class="info-label">🔗 Verifica Blockchain</div>
            <div class="info-value">
              <a href="https://polygonscan.com/inputdatadecoder?tx=${certificateData.transactionHash}" 
                 target="_blank" 
                 class="blockchain-link">
                🔍 Verifica su PolygonScan
              </a>
            </div>
          </div>
        </div>
        
        ${certificateData.description ? `
          <div class="info-item" style="margin-bottom: 30px;">
            <div class="info-label">📝 Descrizione</div>
            <div class="info-value">${certificateData.description}</div>
          </div>
        ` : ''}

        ${certificateData.steps && certificateData.steps.length > 0 ? `
          <div class="steps-section">
            <h2 class="steps-title">🔄 Fasi di Lavorazione</h2>
            ${certificateData.steps.map((step, index) => `
              <div class="step">
                <div class="step-number">${index + 1}</div>
                <div class="step-header">${step.eventName}</div>
                <div class="step-details">
                  <div class="step-detail">
                    <strong>📝 Descrizione:</strong><br>
                    ${step.description || 'Nessuna descrizione'}
                  </div>
                  <div class="step-detail">
                    <strong>📅 Data:</strong><br>
                    ${step.date || 'N/D'}
                  </div>
                  <div class="step-detail">
                    <strong>📍 Luogo:</strong><br>
                    ${step.location || 'N/D'}
                  </div>
                  ${step.attachmentsIpfsHash && step.attachmentsIpfsHash !== "N/A" ? `
                    <div class="step-detail">
                      <strong>📎 Allegati:</strong><br>
                      <a href="https://musical-emerald-partridge.myfilebase.com/ipfs/${step.attachmentsIpfsHash}" 
                         target="_blank" 
                         class="blockchain-link" 
                         style="margin-top: 5px;">
                        📁 Visualizza File
                      </a>
                    </div>
                  ` : ''}
                  ${step.transactionHash ? `
                    <div class="step-detail">
                      <strong>🔗 Verifica Blockchain:</strong><br>
                      <a href="https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash}" 
                         target="_blank" 
                         class="blockchain-link"
                         style="margin-top: 5px;">
                        🔍 Verifica Step
                      </a>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <p>🔗 <strong>SimplyChain</strong> - Tracciabilità Blockchain per le imprese italiane</p>
          <p>Certificato generato il ${new Date(certificateData.createdAt).toLocaleDateString('it-IT')}</p>
          <p>Servizio Gratuito prodotto da <strong>SFY s.r.l.</strong></p>
          <p>📧 Contattaci: sfy.startup@gmail.com</p>
        </div>
      </div>
      
      ${certificateData.viewCount ? `
        <div class="view-counter">
          👁️ ${certificateData.viewCount} visualizzazioni
        </div>
      ` : ''}
    </body>
    </html>
  `;
}