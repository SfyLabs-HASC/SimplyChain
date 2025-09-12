const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inizializza Firebase Admin
admin.initializeApp();

// Cloud Function per servire i certificati HTML
exports.certificate = functions.https.onRequest(async (req, res) => {
  // Abilita CORS per permettere l'accesso da qualsiasi dominio
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Gestisci richieste OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Estrae l'ID del certificato dall'URL
  // URL formato: /certificate/nome-certificato
  const path = req.path.replace('/certificate/', '');
  const certificateId = path.split('/')[0] || path;
  
  console.log('🔍 Richiesta certificato:', certificateId);
  console.log('📍 Path completo:', req.path);
  
  if (!certificateId) {
    res.status(400).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>❌ ID Certificato Mancante</h1>
          <p>Specifica un ID certificato nell'URL</p>
          <p>Formato: /certificate/[id-certificato]</p>
        </body>
      </html>
    `);
    return;
  }
  
  try {
    // Cerca il certificato in Firestore
    const doc = await admin.firestore().collection('certificates').doc(certificateId).get();
    
    if (!doc.exists) {
      console.log('❌ Certificato non trovato:', certificateId);
      res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>🔍 Certificato Non Trovato</h1>
            <p>Il certificato <strong>${certificateId}</strong> non esiste</p>
            <p>Verifica che l'ID sia corretto</p>
          </body>
        </html>
      `);
      return;
    }
    
    const data = doc.data();
    console.log('✅ Certificato trovato:', certificateId);
    
    // Imposta headers per HTML
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache per 1 ora
    
    // Restituisci l'HTML del certificato
    res.send(data.html);
    
  } catch (error) {
    console.error('❌ Errore nel caricamento certificato:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>⚠️ Errore del Server</h1>
          <p>Si è verificato un errore nel caricamento del certificato</p>
          <p>Riprova tra qualche minuto</p>
        </body>
      </html>
    `);
  }
});