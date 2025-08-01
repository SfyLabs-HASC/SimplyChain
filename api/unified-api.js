
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
        return await handleSendEmail(req, res, db);
      
      case 'create-relayer':
        return await handleCreateRelayer(req, res, db);
      
      case 'insight-proxy':
        return await handleInsightProxy(req, res);
      
      case 'indexer-data':
        return await handleIndexerData(req, res, db);
      
      case 'add-single-event':
        return await handleAddSingleEvent(req, res, db);
      
      case 'export-batch':
        return await handleExportBatch(req, res, db);
      
      case 'upload':
        return await handleUpload(req, res);
      
      case 'get-contract-events':
        return await handleGetContractEvents(req, res, db);
      
      case 'save-billing-data':
        return await handleSaveBillingData(req, res, db);
      
      case 'get-billing-data':
        return await handleGetBillingData(req, res, db);

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

async function handleSendEmail(req, res, db) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html, requestData } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Parametri email mancanti' });
  }

  const msg = {
    to,
    from: 'sfy.startup@gmail.com',
    subject,
    html,
  };

  await sgMail.send(msg);

  // Salva la richiesta in Firestore se fornita
  if (requestData) {
    await db.collection('emailRequests').add({
      ...requestData,
      sentAt: new Date().toISOString(),
    });
  }

  return res.status(200).json({ message: 'Email inviata con successo' });
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

async function handleExportBatch(req, res, db) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { batchId } = req.query;
  
  if (!batchId) {
    return res.status(400).json({ error: 'batchId mancante' });
  }

  // Logica per esportare i dati del batch
  const batchDoc = await db.collection('batches').doc(batchId).get();
  
  if (!batchDoc.exists) {
    return res.status(404).json({ error: 'Batch non trovato' });
  }

  return res.status(200).json({ batch: batchDoc.data() });
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
