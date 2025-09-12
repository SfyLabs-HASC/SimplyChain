// API per visualizzare certificati dal Realtime Database
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Certificate ID is required' });
  }

  try {
    console.log('🔍 Recuperando certificato dal Realtime Database:', id);

    // Inizializza Firebase Admin
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
    
    // Recupera i dati del certificato
    const snapshot = await certificateRef.once('value');
    const certificateData = snapshot.val();

    if (!certificateData) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificato non trovato - SimplyChain</title>
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
            <div class="error-icon">🔍</div>
            <h1 class="error-title">Certificato non trovato</h1>
            <p class="error-message">Il certificato richiesto non esiste o è stato rimosso.</p>
          </div>
        </body>
        </html>
      `);
    }

    if (!certificateData.isActive) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificato non disponibile - SimplyChain</title>
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
              border: 1px solid rgba(245, 158, 11, 0.3);
            }
            .error-icon { font-size: 4rem; margin-bottom: 20px; }
            .error-title { font-size: 2rem; font-weight: bold; margin-bottom: 10px; color: #f59e0b; }
            .error-message { font-size: 1.1rem; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h1 class="error-title">Certificato non disponibile</h1>
            <p class="error-message">Questo certificato è stato disattivato.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Incrementa il contatore delle visualizzazioni
    try {
      await certificateRef.child('viewCount').transaction((current) => (current || 0) + 1);
      await certificateRef.child('lastViewed').set(new Date().toISOString());
    } catch (viewError) {
      console.warn('⚠️ Errore aggiornamento contatore visualizzazioni:', viewError.message);
    }

    console.log('✅ Certificato trovato e visualizzato:', id);

    // Genera HTML del certificato
    const certificateHTML = generateCertificateHTML(certificateData);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(certificateHTML);

  } catch (error) {
    console.error('❌ Errore visualizzazione certificato:', error);
    
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Errore - SimplyChain</title>
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
          <div class="error-icon">💥</div>
          <h1 class="error-title">Errore del server</h1>
          <p class="error-message">Si è verificato un errore durante il caricamento del certificato.</p>
        </div>
      </body>
      </html>
    `);
  }
}

function generateCertificateHTML(certificateData) {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${certificateData.name} - Certificato di Tracciabilità</title>
      
      <!-- Meta tags per social sharing -->
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
        
        /* Responsive design */
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
        
        /* Modal per immagini */
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.9);
          cursor: pointer;
        }
        
        .modal-content {
          display: block;
          margin: auto;
          max-width: 90%;
          max-height: 90%;
          border-radius: 8px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      </style>
      
      <script>
        function openImageModal(imageUrl) {
          const modal = document.createElement('div');
          modal.className = 'modal';
          modal.style.display = 'block';
          
          const img = document.createElement('img');
          img.className = 'modal-content';
          img.src = imageUrl;
          
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