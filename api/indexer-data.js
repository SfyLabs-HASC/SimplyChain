
// PERCORSO FILE: api/indexer-data.js
// DESCRIZIONE: Funzione unificata che gestisce sia il recupero che il salvataggio dei dati dell'indexer
// basandosi sul metodo HTTP (GET per recuperare, POST per salvare)

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }
  if (!process.env.FIREBASE_ADMIN_SDK_JSON) {
    throw new Error("La variabile d'ambiente FIREBASE_ADMIN_SDK_JSON non è impostata.");
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    if (req.method === 'GET') {
      // Logica per get-cached-data
      const { userAddress } = req.query;
      
      if (!userAddress) {
        return res.status(400).json({ error: 'userAddress è obbligatorio' });
      }

      const docRef = db.collection('userBatches').doc(userAddress);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(200).json({ batches: [] });
      }

      const data = doc.data();
      return res.status(200).json({ 
        batches: data.batches || [],
        lastUpdated: data.lastUpdated 
      });

    } else if (req.method === 'POST') {
      // Logica per save-indexer-data
      const { userAddress, events, credits } = req.body;
      
      if (!userAddress || !Array.isArray(events)) {
        return res.status(400).json({ error: 'userAddress ed events sono obbligatori' });
      }

      const docRef = db.collection('userBatches').doc(userAddress);
      
      await docRef.set({
        batches: events,
        credits: credits || 0,
        lastUpdated: new Date().toISOString(),
      }, { merge: true });

      return res.status(200).json({ 
        success: true, 
        message: 'Dati salvati con successo',
        batchesCount: events.length 
      });

    } else {
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

  } catch (error) {
    console.error('Errore in indexer-data:', error);
    return res.status(500).json({ 
      error: 'Errore interno del server',
      details: error.message 
    });
  }
}
