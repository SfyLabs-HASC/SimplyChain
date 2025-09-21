import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { supplyChainABI as abi } from "../abi/contractABI";

const client = createThirdwebClient({ 
  clientId: "023dd6504a82409b2bc7cb971fd35b16" 
});

const contract = getContract({
  client,
  chain: polygon,
  address: "0x0c5e6204e80e6fb3c0c7098c4fa84b2210358d0b"
});

export interface BatchInfo {
  id: bigint;
  owner: string;
  productName: string;
  productDescription: string;
  productionDate: string;
  expiryDate: string;
  batchNumber: string;
  qrCodeHash: string;
  isClosed: boolean;
}

export interface StepInfo {
  stepName: string;
  stepDescription: string;
  stepDate: string;
  location: string;
  attachmentsIpfsHash: string;
}

/**
 * Recupera tutti i batch di un utente tramite Thirdweb Insights
 */
export async function getUserBatches(userAddress: string): Promise<BatchInfo[]> {
  try {
    console.log('getUserBatches: Inizio per', userAddress);
    
    // Recuperiamo tutti i batch dell'utente usando getBatchesByContributor
    const batchIds = await readContract({
      contract,
      abi,
      method: "function getBatchesByContributor(address) view returns (uint256[])",
      params: [userAddress]
    });

    console.log('getUserBatches: Batch IDs trovati', batchIds);

    if (batchIds.length === 0) {
      console.log('getUserBatches: Nessun batch trovato');
      return [];
    }

    // Recuperiamo le informazioni dettagliate di ogni batch
    const batchInfoPromises = batchIds.map(batchId =>
      readContract({
        contract,
        abi,
        method: "function getBatchInfo(uint256) view returns (uint256,address,string,string,string,string,string,string,bool)",
        params: [batchId]
      })
    );

    const batchInfos = await Promise.all(batchInfoPromises);

    // Convertiamo i risultati nel formato corretto
    return batchInfos.map((info, index) => ({
      id: batchIds[index],
      owner: info[1],
      productName: info[2],
      productDescription: info[3],
      productionDate: info[4],
      expiryDate: info[5],
      batchNumber: info[6],
      qrCodeHash: info[7],
      isClosed: info[8]
    }));

  } catch (error) {
    console.error("Errore nel recuperare i batch dell'utente:", error);
    throw error;
  }
}

/**
 * Recupera i dettagli degli step di un batch
 */
export async function getBatchSteps(batchId: bigint): Promise<StepInfo[]> {
  try {
    // Recuperiamo il numero di step del batch
    const stepCount = await readContract({
      contract,
      abi,
      method: "function getBatchStepCount(uint256) view returns (uint256)",
      params: [batchId]
    });

    if (stepCount === 0n) {
      return [];
    }

    // Recuperiamo tutti gli step del batch
    const stepPromises = [];
    for (let i = 0; i < Number(stepCount); i++) {
      stepPromises.push(
        readContract({
          contract,
          abi,
          method: "function getStepDetails(uint256, uint256) view returns (string, string, string, string, string)",
          params: [batchId, BigInt(i)]
        })
      );
    }

    const steps = await Promise.all(stepPromises);

    // Convertiamo i risultati nel formato corretto
    return steps.map(step => ({
      stepName: step[0],
      stepDescription: step[1],
      stepDate: step[2],
      location: step[3],
      attachmentsIpfsHash: step[4]
    }));

  } catch (error) {
    console.error("Errore nel recuperare gli step del batch:", error);
    throw error;
  }
}

/**
 * Recupera i crediti dell'utente dal contratto
 */
export async function getUserCredits(userAddress: string): Promise<number> {
  try {
    const contributorInfo = await readContract({
      contract,
      abi,
      method: "function getContributorInfo(address) view returns (string, uint256, bool)",
      params: [userAddress]
    });

    // contributorInfo[1] è il numero di crediti
    return Number(contributorInfo[1]);
  } catch (error) {
    console.error("Errore nel recuperare i crediti dell'utente:", error);
    return 0;
  }
}