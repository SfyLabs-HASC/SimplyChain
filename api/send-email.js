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
    // Salva i profili di fatturazione in una collection dedicata
    const billingRef = db.collection('billingProfiles').doc(walletAddress);
    await billingRef.set({
      billingDetails: details,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.status(200).json({ message: 'Dati di fatturazione salvati con successo.' });
  } catch (error) {
    console.error("Errore nel salvataggio dei dati di fatturazione:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// --- AGGIUNTO: 4. Logica per inviare email di contatto custom ---
async function handleCustomContact(req, res) {
  try {
    const { email, companyName, message, userEmail, walletAddress } = req.body;
    
    if (!email || !companyName || !message) {
      return res.status(400).json({ error: 'Email, nome azienda e messaggio sono obbligatori.' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Messaggio troppo lungo (max 500 caratteri).' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Simply Chain <onboarding@resend.dev>',
      to: ['sfy.startup@gmail.com'],
      subject: `Richiesta prezzo custom - ${companyName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #f9f9f9;">
          <h2 style="color: #8b5cf6;">Richiesta Prezzo Personalizzato</h2>
          <p>L'azienda <strong>${companyName}</strong> ha richiesto un preventivo personalizzato per i crediti.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          
          <h3 style="color: #333;">Dettagli Richiesta:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #8b5cf6;">
              <strong>Nome Azienda:</strong> ${companyName}
            </li>
            <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #8b5cf6;">
              <strong>Email Contatto:</strong> ${email}
            </li>
            <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #8b5cf6;">
              <strong>Email Utente:</strong> ${userEmail}
            </li>
            <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #8b5cf6;">
              <strong>Wallet:</strong> ${walletAddress || 'N/D'}
            </li>
          </ul>
          
          <h3 style="color: #333;">Messaggio:</h3>
          <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          
          <p style="color: #666; font-size: 14px;">
            <strong>Data richiesta:</strong> ${new Date().toLocaleString('it-IT')}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Rispondi direttamente a questa email per contattare l'azienda.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: 'Errore nell\'invio dell\'email.' });
    }

    res.status(200).json({ message: 'Richiesta inviata con successo.' });
  } catch (error) {
    console.error("Errore nell'invio della richiesta custom:", error);
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
    
    // AGGIUNTO: Nuovo caso per il contatto custom
    case 'custom-contact':
      return await handleCustomContact(req, res);
      
    default:
      // Se non c'è 'action' o è sconosciuto, esegue l'invio dell'email
      return await handleSendEmail(req, res);
  }
};