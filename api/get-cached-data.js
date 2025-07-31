
// FILE: api/get-cached-data.js
// DESCRIZIONE: Recupera i dati cached dall'indexer da Firebase

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  try {
    const { userAddress } = req.query;

    if (!userAddress) {
      return res.status(400).json({ error: "userAddress è obbligatorio" });
    }

    const docRef = db.collection('INDEXER-ActiveContributor').doc(userAddress);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Dati cached non trovati" });
    }

    const data = doc.data();
    return res.status(200).json({
      batches: data.batches || [],
      credits: data.credits || 0,
      lastUpdated: data.lastUpdated
    });

  } catch (error) {
    console.error('Errore recupero dati cached:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
