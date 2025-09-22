import { createWalletClient, createPublicClient, http } from 'viem';
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

// ABI del contratto
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_contributorAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_credits",
        "type": "uint256"
      }
    ],
    "name": "setContributorCredits",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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

// Indirizzo del contratto (da configurare)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x...'; // Sostituire con l'indirizzo reale

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, credits, action } = req.body;

    if (process.env.NODE_ENV !== 'production') {
      console.log('Received request:', { walletAddress, credits, action });
    }

    if (!walletAddress) {
      return res.status(400).json({ error: 'Missing walletAddress' });
    }

    if (!process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS === '0x...') {
      return res.status(500).json({ error: 'CONTRACT_ADDRESS not configured' });
    }

    // Se action è 'refresh', solo leggi i crediti dal contratto e aggiorna Firebase
    if (action === 'refresh') {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Refreshing credits from blockchain for:', walletAddress);
      }
      
      const publicClient = createPublicClient({
        chain: polygon,
        transport: http(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'),
      });

      // Leggi i crediti dal contratto
      let contractCredits = 0;
      
      try {
        const contractInfo = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getContributorInfo',
          args: [walletAddress]
        });

        contractCredits = Number(contractInfo[1]); // Il secondo valore è i crediti
        if (process.env.NODE_ENV !== 'production') {
          console.log('Credits from contract:', contractCredits);
        }
      } catch (contractError) {
        console.log('Error reading from contract, using 0');
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
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('Credits updated on Firebase:', contractCredits);
        }
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
    }

    // Altrimenti, aggiungi crediti (comportamento originale)
    if (!credits) {
      return res.status(400).json({ error: 'Missing credits for add operation' });
    }

    if (!process.env.BACKEND_PRIVATE_KEY) {
      return res.status(500).json({ error: 'BACKEND_PRIVATE_KEY not configured' });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Environment variables:', {
        hasPrivateKey: !!process.env.BACKEND_PRIVATE_KEY,
        hasContractAddress: !!process.env.CONTRACT_ADDRESS,
        hasRpcUrl: !!process.env.POLYGON_RPC_URL
      });
    }

    // Configurazione del wallet client
    const account = privateKeyToAccount(process.env.BACKEND_PRIVATE_KEY);
    const walletClient = createWalletClient({
      chain: polygon,
      transport: http(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'),
      account: account
    });

    // Prima leggiamo i crediti attuali da Firebase
    if (process.env.NODE_ENV !== 'production') {
      console.log('Reading current credits from Firebase for:', walletAddress);
    }
    let currentCredits = 0;
    
    try {
      const db = initializeFirebaseAdmin();
      const companyRef = db.collection('activeCompanies').doc(walletAddress);
      const doc = await companyRef.get();
      
      if (doc.exists) {
        const companyData = doc.data();
        currentCredits = companyData.credits || 0;
        if (process.env.NODE_ENV !== 'production') {
          console.log('Current credits from Firebase:', currentCredits);
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Company not found in Firebase, assuming 0 credits');
        }
        currentCredits = 0;
      }
    } catch (firebaseError) {
      console.log('Error reading credits from Firebase, assuming 0');
      currentCredits = 0;
    }

    const newTotalCredits = currentCredits + Number(credits);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Current credits:', currentCredits);
      console.log('Adding credits:', credits);
      console.log('New total credits:', newTotalCredits);
    }

    // Eseguire la transazione con il totale dei crediti
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'setContributorCredits',
      args: [walletAddress, BigInt(newTotalCredits)]
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Transaction hash:', hash);
    }

    // Aggiorna anche i crediti su Firebase
    try {
      const db = initializeFirebaseAdmin();
      const companyRef = db.collection('activeCompanies').doc(walletAddress);
      await companyRef.update({
        credits: newTotalCredits,
        lastCreditUpdate: new Date().toISOString()
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log('Credits updated on Firebase:', newTotalCredits);
      }
    } catch (firebaseUpdateError) {
      console.error('Error updating credits on Firebase:', firebaseUpdateError);
      // Non blocchiamo la risposta se l'aggiornamento Firebase fallisce
    }

    return res.status(200).json({
      success: true,
      transactionHash: hash,
      creditsAdded: credits,
      previousCredits: currentCredits,
      newTotalCredits: newTotalCredits
    });

  } catch (error) {
    console.error('Error in credits operation:', error);
    return res.status(500).json({ 
      error: 'Failed to process credits operation',
      details: error.message 
    });
  }
}