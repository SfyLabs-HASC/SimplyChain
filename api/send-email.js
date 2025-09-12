// FILE: api/send-email.js
// MODIFICATO: Ora gestisce invio email, pagamenti Stripe e salvataggio dati di fatturazione.

import { Resend } from 'resend';
import admin from 'firebase-admin';
import Stripe from 'stripe';

// --- Inizializzazione dei servizi ---
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
const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- 1. Logica per inviare l'email di registrazione ---
async function handleSendEmail(req, res) {
  try {
    const { companyName, contactEmail, sector, walletAddress, ...socials } = req.body;
    const pendingRef = db.collection('pendingCompanies').doc(walletAddress);
    await pendingRef.set({
      companyName, contactEmail, sector, walletAddress, status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...socials,
    });
    
    const { data, error } = await resend.emails.send({
      from: 'Simply Chain <onboarding@resend.dev>',
      to: ['sfy.startup@gmail.com'],
      subject: `${companyName} - Richiesta Attivazione`,
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;"><h2>Nuova Richiesta di Attivazione</h2><p>L'azienda "${companyName}" ha richiesto l'attivazione.</p><hr /><h3>Dettagli:</h3><ul><li><strong>Nome Azienda:</strong> ${companyName}</li><li><strong>Email:</strong> ${contactEmail}</li><li><strong>Settore:</strong> ${sector}</li><li><strong>Wallet:</strong> ${walletAddress}</li></ul><h3>Social:</h3><ul><li><strong>Sito Web:</strong> ${socials.website || 'N/D'}</li><li><strong>Facebook:</strong> ${socials.facebook || 'N/D'}</li><li><strong>Instagram:</strong> ${socials.instagram || 'N/D'}</li></ul></div>`,
    });

    if (error) return res.status(400).json(error);
    res.status(200).json({ message: "Request sent and saved successfully." });
  } catch (error) {
    console.error("Error processing email request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// --- 2. Logica per creare il pagamento Stripe ---
async function handleCreatePaymentIntent(req, res) {
  try {
    const { amount, walletAddress } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: { walletAddress: walletAddress },
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating Stripe Payment Intent:", error);
    return res.status(500).json({ error: 'Errore durante la creazione del pagamento.' });
  }
}

// --- AGGIUNTO: 3. Logica per salvare i dati di fatturazione ---
async function handleSaveBillingDetails(req, res) {
  try {
    const { walletAddress, details } = req.body;
    if (!walletAddress || !details) {
      return res.status(400).json({ error: 'Indirizzo wallet o dati di fatturazione mancanti.' });
    }
    // ASSUMO che la tua collection delle aziende attive si chiami 'companies'
    const companyRef = db.collection('companies').doc(walletAddress);
    await companyRef.set({
      billingDetails: details
    }, { merge: true }); // 'merge: true' assicura di non sovrascrivere altri dati dell'azienda

    res.status(200).json({ message: 'Dati di fatturazione salvati con successo.' });
  } catch (error) {
    console.error("Errore nel salvataggio dei dati di fatturazione:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// --- Handler Principale che decide quale funzione eseguire ---
export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action } = req.query;

  switch (action) {
    case 'create-payment-intent':
      return await handleCreatePaymentIntent(req, res);
    
    // AGGIUNTO: Nuovo caso per il salvataggio dei dati
    case 'save-billing-details':
      return await handleSaveBillingDetails(req, res);
      
    default:
      // Se non c'è 'action' o è sconosciuto, esegue l'invio dell'email
      return await handleSendEmail(req, res);
  }
};