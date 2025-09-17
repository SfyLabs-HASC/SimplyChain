import { createWalletClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

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
  }
];

// Indirizzo del contratto (da configurare)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x...'; // Sostituire con l'indirizzo reale

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, credits } = req.body;

    if (!walletAddress || !credits) {
      return res.status(400).json({ error: 'Missing walletAddress or credits' });
    }

    // Configurazione del wallet client
    const account = privateKeyToAccount(process.env.BACKEND_PRIVATE_KEY);
    const walletClient = createWalletClient({
      chain: polygon,
      transport: http(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'),
      account: account
    });

    // Eseguire la transazione
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'setContributorCredits',
      args: [walletAddress, BigInt(credits)]
    });

    console.log('Transaction hash:', hash);

    return res.status(200).json({
      success: true,
      transactionHash: hash,
      credits: credits
    });

  } catch (error) {
    console.error('Error adding credits:', error);
    return res.status(500).json({ 
      error: 'Failed to add credits',
      details: error.message 
    });
  }
}