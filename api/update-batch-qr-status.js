// API per aggiornare lo stato QR Code di un batch
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, batchId, qrCodeGenerated } = req.body;

    if (!walletAddress || !batchId || qrCodeGenerated === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
    
    // Aggiorna il documento del batch
    const batchRef = db.collection('companies').doc(walletAddress).collection('batches').doc(batchId.toString());
    
    await batchRef.update({
      qrCodeGenerated: qrCodeGenerated,
      qrCodeGeneratedAt: admin.default.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ QR Code status aggiornato per batch ${batchId}: ${qrCodeGenerated}`);
    
    res.json({ 
      success: true, 
      message: 'QR Code status updated successfully' 
    });

  } catch (error) {
    console.error('❌ Errore aggiornamento QR Code status:', error);
    res.status(500).json({ 
      error: 'Failed to update QR Code status',
      details: error.message 
    });
  }
}