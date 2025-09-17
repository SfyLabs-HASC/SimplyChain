import { createWalletClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import admin from 'firebase-admin';

// Funzione helper per inizializzare Firebase Admin
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

// ABI del contratto per leggere i crediti
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_contributorAddress",
        "type": "address"
      }
    ],
    "name": "getContributorInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x...';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Missing walletAddress' });
    }

    if (!process.env.BACKEND_PRIVATE_KEY) {
      return res.status(500).json({ error: 'BACKEND_PRIVATE_KEY not configured' });
    }

    if (!process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS === '0x...') {
      return res.status(500).json({ error: 'CONTRACT_ADDRESS not configured' });
    }

    // Configurazione del wallet client
    const account = privateKeyToAccount(process.env.BACKEND_PRIVATE_KEY);
    const walletClient = createWalletClient({
      chain: polygon,
      transport: http(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'),
      account: account
    });

    // Leggi i crediti dal contratto
    console.log('Reading credits from contract for:', walletAddress);
    let contractCredits = 0;
    
    try {
      const contractInfo = await walletClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getContributorInfo',
        args: [walletAddress]
      });

      contractCredits = Number(contractInfo[1]); // Il secondo valore è i crediti
      console.log('Credits from contract:', contractCredits);
    } catch (contractError) {
      console.log('Error reading from contract, using 0:', contractError.message);
      contractCredits = 0;
    }

    // Aggiorna Firebase con i crediti dal contratto
    try {
      const db = initializeFirebaseAdmin();
      const companyRef = db.collection('activeCompanies').doc(walletAddress);
      
      await companyRef.update({
        credits: contractCredits,
        lastCreditRefresh: new Date().toISOString()
      });
      
      console.log('Credits updated on Firebase:', contractCredits);
    } catch (firebaseError) {
      console.error('Error updating Firebase:', firebaseError);
      return res.status(500).json({ 
        error: 'Failed to update Firebase',
        details: firebaseError.message 
      });
    }

    return res.status(200).json({
      success: true,
      credits: contractCredits,
      message: 'Credits refreshed from blockchain'
    });

  } catch (error) {
    console.error('Error refreshing credits:', error);
    return res.status(500).json({ 
      error: 'Failed to refresh credits',
      details: error.message 
    });
  }
}