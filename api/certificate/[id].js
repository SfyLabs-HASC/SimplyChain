// API per servire certificati HTML dinamicamente
// File: /api/certificate/[id].js

export default async function handler(req, res) {
  // Gestisci CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Certificate ID required' });
    }

    console.log('📄 Richiesta certificato:', id);

    // Importa Firebase Admin
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

    const db = admin.default.firestore();
    
    // Recupera il certificato da Firestore
    const certificateDoc = await db.collection('certificates').doc(id).get();
    
    if (!certificateDoc.exists) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificateData = certificateDoc.data();
    
    if (!certificateData.isPublic) {
      return res.status(403).json({ error: 'Certificate not public' });
    }

    console.log('✅ Certificato trovato e servito:', id);

    // Serve l'HTML del certificato
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 anno
    res.send(certificateData.html);

  } catch (error) {
    console.error('❌ Errore servendo certificato:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}