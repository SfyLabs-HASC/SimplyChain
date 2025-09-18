// PERCORSO FILE: api/get-contract-events.ts
// DESCRIZIONE: Funzione unificata che gestisce sia eventi blockchain che dati Firebase
// basandosi sul parametro 'source' nella query

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createThirdwebClient, getContract, getContractEvents } from 'thirdweb';
import fetch from 'node-fetch';
import { polygon } from 'thirdweb/chains';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const supplyChainABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contributor","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"BatchClosed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contributor","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"description","type":"string"},{"indexed":false,"internalType":"string","name":"date","type":"string"},{"indexed":false,"internalType":"string","name":"location","type":"string"},{"indexed":false,"internalType":"string","name":"imageIpfsHash","type":"string"},{"indexed":false,"internalType":"string","name":"contributorName","type":"string"},{"indexed":false,"internalType":"bool","name":"isClosed","type":"bool"}],"name":"BatchInitialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stepIndex","type":"uint256"},{"indexed":false,"internalType":"string","name":"eventName","type":"string"},{"indexed":false,"internalType":"string","name":"description","type":"string"},{"indexed":false,"internalType":"string","name":"date","type":"string"},{"indexed":false,"internalType":"string","name":"location","type":"string"},{"indexed":false,"internalType":"string","name":"attachmentsIpfsHash","type":"string"}],"name":"BatchStepAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contributorAddress","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"ContributorAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contributorAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"newCreditBalance","type":"uint256"}],"name":"ContributorCreditsSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contributorAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"newCreditBalance","type":"uint256"}],"name":"ContributorCreditsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contributorAddress","type":"address"},{"indexed":false,"internalType":"bool","name":"isActive","type":"bool"}],"name":"ContributorStatusChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldSuperOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newSuperOwner","type":"address"}],"name":"SuperOwnerChanged","type":"event"},{"inputs":[{"internalType":"address","name":"_contributorAddress","type":"address"}],"name":"activateContributor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_contributorAddress","type":"address"},{"internalType":"string","name":"_name","type":"string"}],"name":"addContributor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_batchId","type":"uint256"},{"internalType":"string","name":"_eventName","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"string","name":"_date","type":"string"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_attachmentsIpfsHash","type":"string"}],"name":"addStepToBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"batches","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"contributor","type":"address"},{"internalType":"string","name":"contributorName","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"date","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"imageIpfsHash","type":"string"},{"internalType":"bool","name":"isClosed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_batchId","type":"uint256"}],"name":"closeBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"contributorBatches","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"contributors","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"credits","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_contributorAddress","type":"address"}],"name":"deactivateContributor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_batchId","type":"uint256"}],"name":"getBatchInfo","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"contributor","type":"address"},{"internalType":"string","name":"contributorName","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"date","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"imageIpfsHash","type":"string"},{"internalType":"bool","name":"isClosed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_batchId","type":"uint256"},{"internalType":"uint256","name":"_stepIndex","type":"uint256"}],"name":"getBatchStep","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_batchId","type":"uint256"}],"name":"getBatchStepCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_contributor","type":"address"}],"name":"getBatchesByContributor","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_contributorAddress","type":"address"}],"name":"getContributorInfo","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"string","name":"_date","type":"string"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_imageIpfsHash","type":"string"}],"name":"initializeBatch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_contributorAddress","type":"address"},{"internalType":"uint256","name":"_credits","type":"uint256"}],"name":"setContributorCredits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"superOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}] as const;
const CONTRACT_ADDRESS = '0x0c5e6204e80e6fb3c0c7098c4fa84b2210358d0b';

// Inizializzazione Firebase Admin
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

function serializeBigInts(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => serializeBigInts(item));
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'bigint') newObj[key] = value.toString();
      else if (typeof value === 'object') newObj[key] = serializeBigInts(value);
      else newObj[key] = value;
    }
  }
  return newObj;
}

// Utilità per tenere il payload sotto controllo
const FIELD_LIMITS = {
  name: 120,
  description: 2000,
  location: 200,
  date: 50,
  ipfs: 200,
  eventName: 120,
};

function truncateString(value: any, max: number): any {
  if (value == null) return value;
  const s = String(value);
  return s.length > max ? s.slice(0, max) : s;
}

function sanitizeStep(raw: any) {
  return {
    stepIndex: truncateString(raw.stepIndex, 100),
    eventName: truncateString(raw.eventName, FIELD_LIMITS.eventName),
    description: truncateString(raw.description, FIELD_LIMITS.description),
    date: truncateString(raw.date, FIELD_LIMITS.date),
    location: truncateString(raw.location, FIELD_LIMITS.location),
    attachmentsIpfsHash: truncateString(raw.attachmentsIpfsHash, FIELD_LIMITS.ipfs),
    transactionHash: raw.transactionHash,
  };
}

function sanitizeBatch(raw: any) {
  const steps = Array.isArray(raw.steps) ? raw.steps.map(sanitizeStep) : [];
  return {
    batchId: truncateString(raw.batchId, 100),
    name: truncateString(raw.name, FIELD_LIMITS.name),
    description: truncateString(raw.description, FIELD_LIMITS.description),
    date: truncateString(raw.date, FIELD_LIMITS.date),
    location: truncateString(raw.location, FIELD_LIMITS.location),
    imageIpfsHash: truncateString(raw.imageIpfsHash, FIELD_LIMITS.ipfs),
    isClosed: !!raw.isClosed,
    transactionHash: raw.transactionHash,
    steps,
  };
}

// *** MODIFICA QUI PER RECUPERARE TUTTI GLI EVENTI ***
async function handleBlockchainEvents(userAddress: string, limit?: number) {
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Variabile d'ambiente del server mancante.");
  }

  const client = createThirdwebClient({ secretKey });
  const contract = getContract({ client, chain: polygon, address: CONTRACT_ADDRESS, abi: supplyChainABI });

  // Blocco di deploy del contratto. Lo puoi trovare su PolygonScan
  // Sostituisci questo numero con il blocco reale se è diverso.
  const DEPLOY_BLOCK = 50269000; 

  // Carica tutti gli eventi e filtra
  const allEvents = await getContractEvents({
    contract,
    fromBlock: BigInt(DEPLOY_BLOCK),
    toBlock: 'latest' as const
  });

  const userBatches = allEvents.filter(event => {
    if (event.eventName !== 'BatchInitialized') {
      return false;
    }
    const contributor = (event.args as any)?.contributor;
    return contributor && contributor.toLowerCase() === userAddress.toLowerCase();
  });

  const allBatchStepEvents = allEvents.filter(event => event.eventName === 'BatchStepAdded');

  const stepsByBatchId = new Map<string, any[]>();
  for (const stepEvent of allBatchStepEvents) {
    const stepArgs = stepEvent.args as any;
    if (stepArgs && typeof stepArgs.batchId !== 'undefined' && stepArgs.batchId !== null) {
      const batchId = stepArgs.batchId.toString();
      if (!stepsByBatchId.has(batchId)) {
        stepsByBatchId.set(batchId, []);
      }
      const stepWithTx = {
        ...stepArgs,
        transactionHash: stepEvent.transactionHash
      };
        // push "raw", verrà sanitizzato dopo
      stepsByBatchId.get(batchId)!.push(stepWithTx);
    }
  }

  const combinedDataRaw = userBatches.map(batchEvent => {
    const batchArgs = batchEvent.args as any;
    const batchId = batchArgs.batchId.toString();

    const batchClosedEvents = allEvents.filter(event => 
      event.eventName === 'BatchClosed' && 
      (event.args as any)?.batchId?.toString() === batchId
    );
    const isClosed = batchClosedEvents.length > 0;

    return {
      ...batchArgs,
      batchId,
      transactionHash: batchEvent.transactionHash,
      steps: stepsByBatchId.get(batchId) || [],
      isClosed: isClosed
    };
  });

  // Ordina batch per id desc (opzionale)
  combinedDataRaw.sort((a, b) => Number(b.batchId) - Number(a.batchId));

  // Applica limite opzionale
  const limited = typeof limit === 'number' && limit > 0 ? combinedDataRaw.slice(0, limit) : combinedDataRaw;

  // Sanitize per tagliare i campi lunghi e rimuovere chiavi inutili
  const combinedDataSanitized = limited.map(sanitizeBatch);

  return serializeBigInts(combinedDataSanitized);
}
// *** FINE MODIFICA ***

// Prova a usare Thirdweb Insight se configurato
async function handleInsightEvents(userAddress: string, limit?: number) {
  const baseUrl = process.env.THIRDWEB_INSIGHT_API_URL;
  const apiKey = process.env.THIRDWEB_INSIGHT_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error('Insight non configurato');
  }

  // Nota: l'endpoint può variare a seconda della tua istanza Insight.
  // Qui proviamo uno schema generico e facciamo fallback se fallisce.
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/contracts/${CONTRACT_ADDRESS}/events`);
  url.searchParams.set('chain', 'polygon');
  url.searchParams.set('eventName', 'BatchInitialized');
  url.searchParams.set('contributor', userAddress);
  if (typeof limit === 'number' && limit > 0) url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  } as any);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Insight error ${res.status}: ${text}`);
  }

  const data: any = await res.json();
  const events = Array.isArray(data?.events) ? data.events : Array.isArray(data) ? data : [];

  // Mappa eventi BatchInitialized e unisci gli step se l'API li fornisce; altrimenti lascia steps vuoti
  const batchesRaw = events
    .filter((e: any) => (e.eventName || e.name) === 'BatchInitialized')
    .map((e: any) => {
      const args = e.args || e.data || {};
      const batchId = String(args.batchId ?? args.id ?? '');
      return {
        ...args,
        batchId,
        transactionHash: e.transactionHash || e.txHash,
        steps: [],
        isClosed: false,
      };
    });

  // Ordina, limita e sanitizza
  batchesRaw.sort((a: any, b: any) => Number(b.batchId) - Number(a.batchId));
  const limited = typeof limit === 'number' && limit > 0 ? batchesRaw.slice(0, limit) : batchesRaw;
  const sanitized = limited.map(sanitizeBatch);
  return serializeBigInts(sanitized);
}

async function handleFirebaseData(address: string) {
  initializeFirebaseAdmin();
  const db = getFirestore();

  const batchesRef = db.collection('batches');
  const snapshot = await batchesRef.where('ownerAddress', '==', address).get();

  if (snapshot.empty) {
    return [];
  }

  const batchesData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return batchesData;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  try {
    const { userAddress, address, source, limit } = req.query;
    
    const targetAddress = (userAddress || address) as string;
    const dataSource = (source as string) || 'blockchain';
    const limitNumber = typeof limit === 'string' ? Math.max(0, Math.min(parseInt(limit, 10) || 0, 1000)) : undefined;

    if (!targetAddress || typeof targetAddress !== 'string') {
      return res.status(400).json({ error: "Il parametro 'userAddress' o 'address' è obbligatorio." });
    }

    let result;
    
    if (dataSource === 'firebase') {
      result = await handleFirebaseData(targetAddress);
      return res.status(200).json(result);
    } else {
      // Prova prima Insight, poi fallback allo SDK
      const envInsightConfigured = !!process.env.THIRDWEB_INSIGHT_API_URL && !!process.env.THIRDWEB_INSIGHT_API_KEY;
      try {
        if (!envInsightConfigured) throw new Error('Insight env not configured');
        result = await handleInsightEvents(targetAddress, limitNumber);
        return res.status(200).json({ events: result, source: 'insight', envInsightConfigured });
      } catch (e: any) {
        const fallbackReason = e?.message || String(e);
        try {
          result = await handleBlockchainEvents(targetAddress, limitNumber);
          return res.status(200).json({ events: result, source: 'sdk', envInsightConfigured, fallbackReason });
        } catch (sdkErr: any) {
          // Se anche lo SDK fallisce, propaga errore
          throw sdkErr;
        }
      }
    }

  } catch (error: any) {
    console.error('ERRORE SERVER durante l\'esecuzione della funzione API:', error);
    return res.status(500).json({ 
      error: 'Ops Sembra esserci qualche problema!\nRifresha o riprova tra poco, alcune volte c\'è bisogno di tempo affinchè i dati siano correttamente sincronizzati.',
      details: error?.message || String(error)
    });
  }
}