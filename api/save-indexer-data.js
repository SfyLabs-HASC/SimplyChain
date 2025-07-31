
// FILE: api/save-indexer-data.js
// DESCRIZIONE: Salva i dati dell'indexer su Firebase per caching

import admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  }
  return admin.firestore();
}

const db = initializeFirebaseAdmin();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  try {
    const { userAddress, batches, credits } = req.body;

    if (!userAddress || !Array.isArray(batches)) {
      return res.status(400).json({ error: "userAddress e batches sono obbligatori" });
    }

    // Salva i dati dell'indexer su Firebase
    const docRef = db.collection('INDEXER-ActiveContributor').doc(userAddress);
    await docRef.set({
      userAddress,
      batches,
      credits: credits || 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Errore salvataggio dati indexer:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
