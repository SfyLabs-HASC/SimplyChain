// FILE: api/unified-api.js
// API unificata per gestire tutte le operazioni e aggirare i limiti di Vercel

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';

// Inizializza Firebase Admin
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getFirestore();
  }
  if (!process.env.FIREBASE_ADMIN_SDK_JSON) {
    throw new Error("La variabile d'ambiente FIREBASE_ADMIN_SDK_JSON non è impostata.");
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
  initializeApp({
    credential: cert(serviceAccount),
  });
  return getFirestore();
}

// Configura SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    const db = initializeFirebaseAdmin();

    switch (action) {
      case 'get-pending-companies':
        return await handleGetPendingCompanies(req, res, db);

      case 'activate-company':
        return await handleActivateCompany(req, res, db);

      case 'delete-company':
        return await handleDeleteCompany(req, res, db);

      case 'get-company-status':
        return await handleGetCompanyStatus(req, res, db);

      case 'send-email':
        return await handleSendEmail(req, res);

      case 'create-relayer':
        return await handleCreateRelayer(req, res, db);

      case 'insight-proxy':
        return await handleInsightProxy(req, res);

      case 'indexer-data':
        return await handleIndexerData(req, res, db);

      case 'add-single-event':
        return await handleAddSingleEvent(req, res, db);

      case 'export-batch':
        return await handleExportBatch(req, res);

      case 'upload':
        return await handleUpload(req, res);

      case 'get-contract-events':
        return await handleGetContractEvents(req, res, db);

      case 'save-billing-data':
        return await handleSaveBillingData(req, res, db);

      case 'get-billing-data':
        return await handleGetBillingData(req, res, db);
      case 'create-stripe-payment':
        return await handleCreateStripePayment(req, res, db);
      case 'create-paypal-payment':
        return await handleCreatePayPalPayment(req, res, db);
      case 'confirm-payment':
        return await handleConfirmPayment(req, res, db);

      default:
        return res.status(400).json({ error: 'Azione non valida o mancante' });
    }
  } catch (error) {
    console.error('Errore API unificata:', error);
    return res.status(500).json({ error: 'Errore interno del server', details: error.message });
  }
}

// Funzioni handler per ogni operazione
async function handleGetPendingCompanies(req, res, db) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const pendingSnapshot = await db.collection('pendingCompanies').get();
  const activeSnapshot = await db.collection('activeCompanies').get();

  const pendingCompanies = [];
  pendingSnapshot.forEach(doc => {
    pendingCompanies.push({ id: doc.id, ...doc.data() });
  });

  const activeCompanies = [];
  activeSnapshot.forEach(doc => {
    activeCompanies.push({ id: doc.id, ...doc.data() });
  });

  return res.status(200).json({ pending: pendingCompanies, active: activeCompanies });
}

async function handleActivateCompany(req, res, db) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { companyId, companyData } = req.body;

  if (!companyId || !companyData) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  // Sposta da pending ad active
  await db.collection('activeCompanies').doc(companyId).set({
    ...companyData,
    activatedAt: new Date().toISOString(),
    status: 'active'
  });

  await db.collection('pendingCompanies').doc(companyId).delete();

  return res.status(200).json({ message: 'Azienda attivata con successo' });
}

async function handleDeleteCompany(req, res, db) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { companyId, collection } = req.body;

  if (!companyId || !collection) {
    return res.status(400).json({ error: 'Parametri mancanti' });
  }

  await db.collection(collection).doc(companyId).delete();
  return res.status(200).json({ message: 'Azienda eliminata con successo' });
}

async function handleGetCompanyStatus(req, res, db) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress mancante' });
  }

  // Cerca in activeCompanies
  const activeDoc = await db.collection('activeCompanies').doc(walletAddress.toLowerCase()).get();
  if (activeDoc.exists) {
    return res.status(200).json({ status: 'active', data: activeDoc.data() });
  }

  // Cerca in pendingCompanies
  const pendingDoc = await db.collection('pendingCompanies').doc(walletAddress.toLowerCase()).get();
  if (pendingDoc.exists) {
    return res.status(200).json({ status: 'pending', data: pendingDoc.data() });
  }

  return res.status(404).json({ status: 'not_found' });
}

async function handleCreateRelayer(req, res, db) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { companyId } = req.body;

  if (!companyId) {
    return res.status(400).json({ error: "ID Azienda mancante." });
  }

  const engineUrl = process.env.THIRDWEB_ENGINE_URL;
  const adminKey = process.env.THIRDWEB_VAULT_ADMIN_KEY;
  const clientId = process.env.THIRDWEB_CLIENT_ID;

  if (!engineUrl || !adminKey || !clientId) {
    throw new Error("Configurazione del server incompleta.");
  }

  const cleanedEngineUrl = engineUrl.replace(/\/$/, ""); 
  const fullEndpointUrl = `${cleanedEngineUrl}/v1/backend-wallet/create`;

  const engineResponse = await fetch(fullEndpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminKey}`,
      'x-client-id': clientId,
    },
    body: JSON.stringify({}),
  });

  if (!engineResponse.ok) {
    throw new Error(`Errore Engine: ${engineResponse.statusText}`);
  }

  const result = await engineResponse.json();
  return res.status(200).json(result);
}

async function handleInsightProxy(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { contract_address, event_name, contributor } = req.query;

  if (!contract_address || !event_name || !contributor) {
    return res.status(400).json({ error: 'Parametri mancanti.' });
  }

  const clientId = "023dd6504a82409b2bc7cb971fd35b16";
  const insightUrl = `https://polygon.insight.thirdweb.com/v1/events`;
  const params = new URLSearchParams({
    contract_address,
    event_name,
    "filters[contributor]": contributor,
    order: "desc",
    limit: "100",
  });

  const response = await fetch(`${insightUrl}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'x-thirdweb-client-id': clientId,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Errore ricevuto da Thirdweb Insight:", errorBody);
    return res.status(response.status).json({ error: `Errore dall'API di Insight: ${response.statusText}` });
  }

  const data = await response.json();
  return res.status(200).json(data);
}

async function handleIndexerData(req, res, db) {
  if (req.method === 'GET') {
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
  }

  if (req.method === 'POST') {
    const { userAddress, batches } = req.body;

    if (!userAddress || !batches) {
      return res.status(400).json({ error: 'Parametri mancanti' });
    }

    await db.collection('userBatches').doc(userAddress).set({
      batches,
      lastUpdated: new Date().toISOString()
    });

    return res.status(200).json({ message: 'Dati salvati con successo' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

async function handleAddSingleEvent(req, res, db) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const eventData = req.body;

  await db.collection('singleEvents').add({
    ...eventData,
    createdAt: new Date().toISOString()
  });

  return res.status(200).json({ message: 'Evento aggiunto con successo' });
}

async function handleUpload(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Logica per l'upload dei file
  // Da implementare secondo le tue necessità
  return res.status(200).json({ message: 'Upload completato' });
}

async function handleGetContractEvents(req, res, db) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userAddress, address, source } = req.query;
  const targetAddress = (userAddress || address);

  if (!targetAddress) {
    return res.status(400).json({ error: "Il parametro 'userAddress' o 'address' è obbligatorio." });
  }

  // Implementa la logica per ottenere gli eventi del contratto
  return res.status(200).json({ events: [] });
}

async function handleSaveBillingData(req, res, db) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address, billingData } = req.body;

  if (!address || !billingData) {
    return res.status(400).json({ error: 'Parametri mancanti' });
  }

  await db.collection('billingData').doc(address.toLowerCase()).set({
    ...billingData,
    updatedAt: new Date().toISOString()
  });

  return res.status(200).json({ message: 'Dati fatturazione salvati con successo' });
}

async function handleGetBillingData(req, res, db) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Indirizzo mancante' });
  }

  const doc = await db.collection('billingData').doc(address.toLowerCase()).get();

  if (!doc.exists) {
    return res.status(404).json({ error: 'Dati fatturazione non trovati' });
  }

  return res.status(200).json({ billingData: doc.data() });
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const admin = require('firebase-admin');
const { createThirdwebClient, getContract, prepareContractCall, sendTransaction } = require('thirdweb');
const { polygon } = require('thirdweb/chains');
const { privateKeyToAccount } = require('thirdweb/wallets');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();
const resend = new Resend(process.env.RESEND_API_KEY);

// Thirdweb setup for on-chain transactions
const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });
const contract = getContract({ 
  client, 
  chain: polygon,
  address: "0xd0bad36896df719b26683e973f2fc6135f215d4e" 
});

// Owner account for on-chain transactions (your company wallet)
const ownerAccount = privateKeyToAccount({ 
  client, 
  privateKey: process.env.OWNER_PRIVATE_KEY 
});
async function sendEmail(req, res) {
  try {
    const { to, subject, html, requestData } = req.body;

    const result = await resend.emails.send({
      from: 'noreply@easychain.it',
      to: to,
      subject: subject,
      html: html,
    });

    // Save email log to Firebase if needed
    if (requestData) {
      await db.collection('email_logs').add({
        ...requestData,
        emailId: result.id,
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.status(200).json({ success: true, emailId: result.id });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}

async function createStripePayment(req, res, db) {
    try {
        const { amount, credits, userAddress, billingData } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe uses cents
            currency: 'eur',
            metadata: {
                userAddress,
                credits: credits.toString(),
                type: 'credit_purchase'
            }
        });

        // Save the pending payment in Firebase
        await db.collection('pending_payments').doc(paymentIntent.id).set({
            userAddress,
            credits,
            amount,
            billingData,
            status: 'pending',
            provider: 'stripe',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating Stripe payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
}

async function createPayPalPayment(req, res, db) {
    try {
        const { amount, credits, userAddress, billingData } = req.body;

        // 1. Get PayPal Access Token
        const authResponse = await fetch('https://api.paypal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        });

        const authData = await authResponse.json();

        // 2. Create PayPal Order
        const orderResponse = await fetch('https://api.paypal.com/v2/checkout/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.access_token}`
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'EUR',
                        value: amount.toFixed(2)
                    },
                    description: `Acquisto ${credits} crediti EasyChain`
                }]
            })
        });

        const orderData = await orderResponse.json();

        // 3. Save Pending Payment in Firebase
        await db.collection('pending_payments').doc(orderData.id).set({
            userAddress,
            credits,
            amount,
            billingData,
            status: 'pending',
            provider: 'paypal',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ orderId: orderData.id });
    } catch (error) {
        console.error('Error creating PayPal payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
}
async function confirmPayment(req, res, db) {
    try {
        const { paymentId, provider } = req.body;

        // 1. Retrieve Payment Data from Firebase
        const paymentDoc = await db.collection('pending_payments').doc(paymentId).get();
        if (!paymentDoc.exists) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        const paymentData = paymentDoc.data();

        // 2. Verify Payment with the Provider
        let isPaymentValid = false;

        if (provider === 'stripe') {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
            isPaymentValid = paymentIntent.status === 'succeeded';
        } else if (provider === 'paypal') {
            // Verify with PayPal API
            const authResponse = await fetch('https://api.paypal.com/v1/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`
                },
                body: 'grant_type=client_credentials'
            });

            const authData = await authResponse.json();

            const orderResponse = await fetch(`https://api.paypal.com/v2/checkout/orders/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${authData.access_token}`
                }
            });

            const orderData = await orderResponse.json();
            isPaymentValid = orderData.status === 'COMPLETED';
        }

        if (!isPaymentValid) {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // 3. Credit On-Chain Credits
        try {
            const transaction = prepareContractCall({
                contract,
                method: "function setContributorCredits(address _contributorAddress, uint256 _credits)",
                params: [paymentData.userAddress, paymentData.credits]
            });

            await sendTransaction({
                transaction,
                account: ownerAccount
            });

            // 4. Update Payment Status in Firebase
            await db.collection('pending_payments').doc(paymentId).update({
                status: 'completed',
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 5. Send Confirmation Email
            const emailSubject = `Pagamento Crediti Confermato - EasyChain`;
            const emailBody = `
                <h2>Pagamento Confermato!</h2>
                <p>Il tuo pagamento di €${paymentData.amount} è stato confermato.</p>
                <p>Sono stati accreditati <strong>${paymentData.credits} crediti</strong> al tuo account.</p>
                <p>Puoi ora utilizzare i crediti per le tue operazioni di tracciabilità.</p>
            `;

            await resend.emails.send({
                from: 'noreply@easychain.it',
                to: 'sfy.startup@gmail.com', // Replace with the actual user email address
                subject: emailSubject,
                html: emailBody
            });

            res.status(200).json({ success: true, credits: paymentData.credits });

        } catch (onchainError) {
            console.error('Error crediting on-chain:', onchainError);
            res.status(500).json({ error: 'Failed to credit on-chain' });
        }

    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
}

async function handleSendEmail(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html, text } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'EasyChain <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
      text: text
    });

    if (error) {
      console.error('Errore Resend:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Errore invio email:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}

async function handleExportBatch(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { batchId } = req.query;

  if (!batchId) {
    return res.status(400).json({ error: 'BatchId mancante' });
  }

  try {
    // Logica per esportare i dati del batch
    // Questo dipende dalla tua implementazione specifica
    return res.status(200).json({ 
      success: true, 
      message: 'Export completato',
      batchId 
    });
  } catch (error) {
    console.error('Errore export batch:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}