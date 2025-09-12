// API per creare QR Code usando Firebase Realtime Database
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { batch, companyName, walletAddress } = req.body;

    if (!batch || !companyName || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields: batch, companyName, walletAddress' });
    }

    console.log('🔥 Iniziando creazione QR Code con Realtime Database per batch:', batch.batchId);
    
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
    
    // Inizializza Firebase Admin se non già fatto
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
    
    // Genera un ID unico per il certificato
    const certificateId = `${batch.batchId}_${Date.now()}`;
    const certificateRef = realtimeDb.ref(`certificates/${certificateId}`);
    
    // Salva i dati del certificato
    await certificateRef.set(certificateData);
    console.log('💾 Dati certificato salvati in Realtime Database:', certificateId);

    // Step 3: Genera URL per visualizzare il certificato
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const certificateUrl = `${baseUrl}/api/view-certificate/${certificateId}`;
    
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
    
    // Step 5: Converti QR Code in buffer per il download
    const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    console.log('📱 QR Code generato per URL:', certificateUrl);

    // Step 6: Aggiorna stato batch in Firestore (per compatibilità)
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

    // Step 7: Restituisci il QR Code per il download
    res.setHeader('Content-Type', 'image/png');
    const cleanBatchName = batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanBatchName}_qrcode.png"`);
    res.send(qrBuffer);
    
    console.log('✅ QR Code creato con successo usando Realtime Database');

  } catch (error) {
    console.error('❌ Errore creazione QR Code con Realtime Database:', error);
    res.status(500).json({ 
      error: 'Errore nella creazione del QR Code',
      details: error.message 
    });
  }
}