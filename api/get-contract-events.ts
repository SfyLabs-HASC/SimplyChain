// PERCORSO FILE: api/get-contract-events.ts
// DESCRIZIONE: Funzione unificata che gestisce sia eventi blockchain che dati Firebase
// basandosi sul parametro 'source' nella query

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createThirdwebClient, getContract, getContractEvents } from 'thirdweb';
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

// *** MODIFICA QUI PER RECUPERARE TUTTI GLI EVENTI ***
async function handleBlockchainEvents(userAddress: string) {
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Variabile d'ambiente del server mancante.");
  }

  const client = createThirdwebClient({ secretKey });
  const contract = getContract({ client, chain: polygon, address: CONTRACT_ADDRESS, abi: supplyChainABI });

  // Blocco di deploy del contratto. Lo puoi trovare su PolygonScan
  // Sostituisci questo numero con il blocco reale se è diverso.
  const DEPLOY_BLOCK = 50269000; 

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
      stepsByBatchId.get(batchId)!.push(stepWithTx);
    }
  }

  const combinedData = userBatches.map(batchEvent => {
    const batchArgs = batchEvent.args as any;
    const batchId = batchArgs.batchId.toString();

    const batchClosedEvents = allEvents.filter(event => 
      event.eventName === 'BatchClosed' && 
      (event.args as any)?.batchId?.toString() === batchId
    );
    const isClosed = batchClosedEvents.length > 0;

    return {
      ...batchArgs,
      transactionHash: batchEvent.transactionHash,
      steps: stepsByBatchId.get(batchId) || [],
      isClosed: isClosed
    };
  });

  return serializeBigInts(combinedData);
}
// *** FINE MODIFICA ***

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
    const { userAddress, address, source } = req.query;
    
    const targetAddress = (userAddress || address) as string;
    const dataSource = source as string || 'blockchain';

    if (!targetAddress || typeof targetAddress !== 'string') {
      return res.status(400).json({ error: "Il parametro 'userAddress' o 'address' è obbligatorio." });
    }

    let result;
    
    if (dataSource === 'firebase') {
      result = await handleFirebaseData(targetAddress);
      return res.status(200).json(result);
    } else {
      result = await handleBlockchainEvents(targetAddress);
      return res.status(200).json({ events: result });
    }

  } catch (error: any) {
    console.error('ERRORE SERVER durante l\'esecuzione della funzione API:', error);
    return res.status(500).json({ 
      error: 'Errore interno del server.',
      details: error.message 
    });
  }
}