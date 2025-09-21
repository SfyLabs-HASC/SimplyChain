
// FILE: api/add-single-event.js
// DESCRIZIONE: Aggiunge un singolo evento ai dati cached

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') {
    return res.status(200).json({ 
      ok: true, 
      message: 'add-single-event API is working', 
      method: 'GET',
      timestamp: new Date().toISOString(),
      firebase: !!db
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  try {
    const { userAddress, eventType, eventData, newCredits } = req.body;

    if (!userAddress || !eventType || !eventData) {
      return res.status(400).json({ error: "userAddress, eventType e eventData sono obbligatori" });
    }

    const docRef = db.collection('INDEXER-ActiveContributor').doc(userAddress);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Dati cached non trovati" });
    }

    const data = doc.data();
    let batches = data.batches || [];

    if (eventType === 'BatchInitialized') {
      // Aggiungi nuovo batch
      batches.push({
        ...eventData,
        steps: []
      });
    } else if (eventType === 'BatchStepAdded') {
      // Aggiungi step al batch esistente
      const batchIndex = batches.findIndex(b => b.batchId === eventData.batchId);
      if (batchIndex !== -1) {
        batches[batchIndex].steps.push(eventData.stepData);
      }
    } else if (eventType === 'BatchClosed') {
      // Finalizza batch
      const batchIndex = batches.findIndex(b => b.batchId === eventData.batchId);
      if (batchIndex !== -1) {
        batches[batchIndex].isClosed = true;
      }
    }

    // Aggiorna i dati su Firebase
    await docRef.update({
      batches,
      credits: newCredits,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, batches });

  } catch (error) {
    console.error('Errore aggiunta evento:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
