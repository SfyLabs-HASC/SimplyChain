// FILE: /api/get-company-status.js
// CORRETTO: Ora restituisce tutti i dati necessari, inclusi email, stato e dati di fatturazione.

import admin from 'firebase-admin';

// Funzione per inizializzare Firebase Admin
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error.stack);
    }
  }
  return admin.firestore();
}

const db = initializeFirebaseAdmin();

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    // ASSUMO che la tua collection delle aziende attive si chiami 'companies'
    const companyRef = db.collection('companies').doc(walletAddress);
    const doc = await companyRef.get();

    if (!doc.exists) {
      return res.status(200).json({ isActive: false });
    }

    const companyData = doc.data();

    // Costruisce la risposta assicurandosi di includere tutti i campi necessari
    const responsePayload = {
      isActive: companyData.status === 'active',
      companyName: companyData.companyName || '',
      credits: companyData.credits || 0,
      status: companyData.status || 'inactive',
      contactEmail: companyData.contactEmail || '', // Campo chiave per l'email
      billingDetails: companyData.billingDetails || null, // Campo chiave per la fatturazione
    };

    res.status(200).json(responsePayload);

  } catch (error) {
    console.error("Error fetching company status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};