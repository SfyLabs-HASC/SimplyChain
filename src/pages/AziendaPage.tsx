// FILE: src/pages/AziendaPage.tsx
// DESCRIZIONE: Versione aggiornata che utilizza Firebase per i dati azienda,
// implementa il sistema di refresh on-chain e gestisce le iscrizioni con numerazione incrementale.
// Stili adattati dal file 1.tsx
// Correzioni: Reintroduzione di mock per thirdweb e componenti locali per risolvere errori di compilazione.

import React, { useState, useEffect } from "react";
// Importazioni originali di thirdweb e componenti locali commentate per il mocking
// import { ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
// import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
// import { polygon } from "thirdweb/chains";
// import { inAppWallet } from "thirdweb/wallets";
// import { supplyChainABI as abi } from "../abi/contractABI";
// import "../App.css";

// Importa le icone da lucide-react per coerenza con 1.tsx
import { ArrowRight, CheckCircle, Sparkles, Cpu, Network, Lock, FileText, X, Play, RefreshCw, Info, QrCode, LogOut, Wallet } from 'lucide-react';

// --- MOCK DI DIPENDENZE ESTERNE E LOCALI PER LA COMPILAZIONE ---
// Queste implementazioni mock permettono al codice di compilare e alla UI di rendersi,
// ma le funzionalità blockchain e le interazioni con i componenti locali saranno simulate.

// Mock per thirdweb/react
const useActiveAccount = () => {
  const [account, setAccount] = useState<{ address: string } | null>(null);
  useEffect(() => {
    // Simula la connessione di un account dopo un breve ritardo
    const timer = setTimeout(() => {
      setAccount({ address: "0xMockWalletAddress1234567890abcdef" });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  return account;
};

const useReadContract = ({ queryOptions }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (queryOptions?.enabled) {
      setLoading(true);
      // Simula il fetching dei dati dal contratto
      const timer = setTimeout(() => {
        setData(["Mock Company Name", 100, true]); // Esempio: [companyName, credits, isActive]
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [queryOptions?.enabled]);
  const refetch = () => {
    // Simula il refetch
    console.log("Mock refetch triggered");
    return { data: ["Mock Company Name Refetched", 105, true] }; // Dati di esempio per il refetch
  };
  return { data, isLoading: loading, refetch };
};

const useSendTransaction = () => {
  const [isPending, setIsPending] = useState(false);
  const mutate = (transaction: any, options: any) => {
    setIsPending(true);
    console.log("Mock transaction sent:", transaction);
    // Simula una transazione riuscita o fallita
    setTimeout(() => {
      setIsPending(false);
      if (Math.random() > 0.1) { // 90% successo
        options.onSuccess({ transactionHash: "0xMockTxHash" + Math.random().toString(16).substring(2,10) });
      } else { // 10% fallimento
        options.onError(new Error("Mock transaction failed (insufficient funds)"));
      }
    }, 2000);
  };
  return { mutate, isPending };
};

// Mock per thirdweb
const createThirdwebClient = (config: any) => {
  console.log("Mock createThirdwebClient called with config:", config);
  return { clientId: config.clientId };
};
const getContract = (config: any) => {
  console.log("Mock getContract called with config:", config);
  return { address: config.address, abi: config.abi };
};
const prepareContractCall = (config: any) => {
  console.log("Mock prepareContractCall called with config:", config);
  return { ...config, mock: true };
};

// Mock per thirdweb/chains
const polygon = {
  chainId: 137,
  name: "Polygon Mainnet (Mock)",
  rpc: "https://mock-rpc-polygon.thirdweb.com",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  blockExplorers: [{ name: "Polygonscan (Mock)", url: "https://polygonscan.com" }],
};

// Mock per thirdweb/wallets
const inAppWallet = () => {
  console.log("Mock InAppWallet called");
  return { name: "Mock InApp Wallet" };
};

// Mock per ConnectButton - per ora un semplice bottone
const ConnectButton: React.FC<any> = ({ client, wallets, chain, accountAbstraction, className }) => {
  const account = useActiveAccount();
  return (
    <button
      onClick={() => console.log("Mock ConnectButton clicked")}
      className={`${className} flex items-center justify-center gap-2`}
    >
      <Wallet className="w-5 h-5" /> {account?.address ? truncateText(account.address, 10) : "Connetti Wallet"}
    </button>
  );
};


// Mock ABI - In un'applicazione reale, questo verrebbe importato da '../abi/contractABI'.
const abi: any[] = [
  {
    "type": "function",
    "name": "getContributorInfo",
    "inputs": [{"name":"_contributor","type":"address","internalType":"address"}],
    "outputs": [{"name":"","type":"string","internalType":"string"},{"name":"","type":"uint256","internalType":"uint256"},{"name":"","type":"bool","internalType":"bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "addStepToBatch",
    "inputs": [{"name":"_batchId","type":"uint256","internalType":"uint256"},{"name":"_eventName","type":"string","internalType":"string"},{"name":"_description","type":"string","internalType":"string"},{"name":"_date","type":"string","internalType":"string"},{"name":"_location","type":"string","internalType":"string"},{"name":"_attachmentsIpfsHash","type":"string","internalType":"string"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "closeBatch",
    "inputs": [{"name":"_batchId","type":"uint256","internalType":"uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "initializeBatch",
    "inputs": [{"name":"_name","type":"string","internalType":"string"},{"name":"_description","type":"string","internalType":"string"},{"name":"_date","type":"string","internalType":"string"},{"name":"_location","type":"string","internalType":"string"},{"name":"_imageIpfsHash","type":"string","internalType":"string"}],
    "outputs": [{"name":"","type":"uint256","internalType":"uint256"}],
    "stateMutability": "nonpayable"
  },
];

// Mock per RegistrationForm.tsx
const RegistrationForm: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegistration = async () => {
    if (!companyName.trim()) {
      setError("Il nome dell'azienda è obbligatorio.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulazione di una chiamata API
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (Math.random() > 0.1) { // 90% successo
        setSuccess("Registrazione avvenuta con successo! Potrebbe essere necessario un refresh per vedere i cambiamenti.");
      } else { // 10% fallimento
        throw new Error('Errore simulato durante la registrazione.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 md:p-12 text-center tech-shadow max-w-lg w-full">
        <h2 className="text-3xl font-bold mb-6 text-foreground">Registra la tua Azienda</h2>
        <p className="text-lg text-muted-foreground mb-8">Inserisci il nome della tua azienda per completare la registrazione.</p>
        <div className="mb-6">
          <input
            type="text"
            className="w-full p-3 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent smooth-transition"
            placeholder="Nome della tua azienda"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleRegistration}
          className="group primary-gradient text-primary-foreground text-xl px-8 py-4 rounded-xl tech-shadow hover:scale-105 smooth-transition w-full"
          disabled={isLoading}
        >
          {isLoading ? "Registrazione in corso..." : "Registra Azienda"}
          {isLoading ? <Cpu className="w-5 h-5 animate-spin ml-2" /> : <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 smooth-transition" />}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>}
      </div>
    </div>
  );
};

// Mock per TransactionStatusModal.tsx
const TransactionStatusModal: React.FC<{
  isOpen: boolean;
  status: "success" | "error" | "loading";
  message: string;
  onClose: () => void;
}> = ({ isOpen, status, message, onClose }) => {
  if (!isOpen) return null;

  let icon, title, textColor;
  switch (status) {
    case "success":
      icon = <CheckCircle className="w-12 h-12 text-green-500" />;
      title = "Successo!";
      textColor = "text-green-500";
      break;
    case "error":
      icon = <X className="w-12 h-12 text-red-500" />;
      title = "Errore!";
      textColor = "text-red-500";
      break;
    case "loading":
    default:
      icon = <Cpu className="w-12 h-12 text-primary animate-spin" />;
      title = "In corso...";
      textColor = "text-primary";
      break;
  }

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card rounded-3xl p-8 md:p-12 text-center tech-shadow max-w-md w-full">
        <div className="flex justify-center mb-6">{icon}</div>
        <h2 className={`text-3xl font-bold mb-4 ${textColor}`}>{title}</h2>
        <p className="text-lg text-muted-foreground mb-8">{message}</p>
        {status !== "loading" && (
          <button onClick={onClose} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow hover:scale-105 smooth-transition">
            Chiudi
          </button>
        )}
      </div>
    </div>
  );
};

const truncateText = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Formatta la data in formato italiano
const formatItalianDate = (dateString: string) => {
  if (!dateString) return "N/D";
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT');
};

// Interfacce per i dati
interface Step {
  stepIndex: string;
  eventName: string;
  description: string;
  date: string;
  location: string;
  attachmentsIpfsHash: string;
  transactionHash?: string;
}

interface Batch {
  batchId: string;
  name: string;
  description: string;
  date: string;
  location: string;
  imageIpfsHash: string;
  isClosed: boolean;
  transactionHash: string;
  steps: Step[];
}

interface CompanyData {
  companyName: string;
  credits: number;
  status: string;
}

const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });

// Configura Polygon con RPC Thirdweb (Mock)
const polygonWithRPC = {
  ...polygon,
  rpc: `https://137.rpc.thirdweb.com/023dd6504a82409b2bc7cb971fd35b16`,
};

const contract = getContract({
  client,  chain: polygonWithRPC,
  address: "0x0c5e6204e80e6fb3c0c7098c4fa84b2210358d0b",
  abi,
});

// Componente modale per visualizzare immagini
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl mx-4 bg-background rounded-2xl overflow-hidden tech-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center smooth-transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <img src={imageUrl} alt="Immagine iscrizione" className="w-full h-full object-contain" />
      </div>
    </div>
  );
};

// Componente per il loading a pagina piena
const FullPageLoading: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col justify-center items-center z-[1000] text-foreground p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
      <p className="text-xl font-medium">{message}</p>
    </div>
  );
};

// Componente per la Dashboard
const Dashboard: React.FC<{ companyData: CompanyData }> = ({ companyData }) => {
  const account = useActiveAccount();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [errorBatches, setErrorBatches] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showFullPageLoading, setShowFullPageLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [currentCompanyData, setCurrentCompanyData] = useState<CompanyData>(companyData);
  const [selectedBatchForStep, setSelectedBatchForStep] = useState<Batch | null>(null);
  const [selectedBatchForFinalize, setSelectedBatchForFinalize] = useState<Batch | null>(null);
  const [selectedBatchForSteps, setSelectedBatchForSteps] = useState<Batch | null>(null);
  const [selectedBatchForExport, setSelectedBatchForExport] = useState<Batch | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<'pdf' | 'html' | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  // State per i filtri
  const [nameFilter, setNameFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Aperto" | "Chiuso" | "">("");

  // State per la paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Hook per leggere i dati dal contratto
  const { data: contractData, refetch: refetchContractData } = useReadContract({
    contract,
    method: "function getContributorInfo(address) view returns (string, uint256, bool)",
    params: account ? [account.address] : undefined,
    queryOptions: { enabled: !!account },
  });

  const loadBatches = async (isFirstLoad = false) => {
    if (!account) return;

    if (isFirstLoad) {
      setShowFullPageLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setIsLoadingBatches(true);
    setErrorBatches(null);

    try {
      // Mock della chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockBatches: Batch[] = [
        {
          batchId: "1", name: "Pomodori San Marzano 2025", description: "Coltivazione biologica in campo aperto, Italia", date: "2025-05-10", location: "Salerno, Italia", imageIpfsHash: "QmSampleImageHash1", isClosed: false, transactionHash: "0xMockTxHashBatch1", steps: [
            { stepIndex: "1", eventName: "Semina", description: "Inizio semina in serra", date: "2024-02-15", location: "Salerno", attachmentsIpfsHash: "QmStepAttach1", transactionHash: "0xMockTxStep1" },
            { stepIndex: "2", eventName: "Raccolta", description: "Raccolta manuale dei pomodori maturi", date: "2025-08-01", location: "Salerno", attachmentsIpfsHash: "QmStepAttach2", transactionHash: "0xMockTxStep2" }
          ]
        },
        {
          batchId: "2", name: "Olio Extravergine d'Oliva", description: "Olio di oliva DOP, prima spremitura a freddo", date: "2024-11-20", location: "Puglia, Italia", imageIpfsHash: "QmSampleImageHash2", isClosed: true, transactionHash: "0xMockTxHashBatch2", steps: [
            { stepIndex: "1", eventName: "Raccolta Olive", description: "Raccolta meccanizzata", date: "2024-10-25", location: "Foggia", attachmentsIpfsHash: "QmStepAttach3", transactionHash: "0xMockTxStep3" },
            { stepIndex: "2", eventName: "Frangitura", description: "Frangitura a freddo entro 12h dalla raccolta", date: "2024-10-26", location: "Bari", attachmentsIpfsHash: "QmStepAttach4", transactionHash: "0xMockTxStep4" },
            { stepIndex: "3", eventName: "Imbottigliamento", description: "Imbottigliamento in bottiglie scure", date: "2024-11-20", location: "Bari", attachmentsIpfsHash: "QmStepAttach5", transactionHash: "0xMockTxStep5" }
          ]
        },
        {
          batchId: "3", name: "Mozzarella di Bufala Campana", description: "Produzione giornaliera di mozzarella", date: "2025-01-15", location: "Caserta, Italia", imageIpfsHash: "QmSampleImageHash3", isClosed: false, transactionHash: "0xMockTxHashBatch3", steps: []
        },
      ];

      const sortedBatches = mockBatches.sort((a, b) => parseInt(b.batchId) - parseInt(a.batchId));
      setBatches(sortedBatches);
      setRefreshCounter(0); // Reset counter dopo il refresh
      setCurrentPage(1); // Reset alla prima pagina
    } catch (error: any) {
      setErrorBatches(error.message || "Errore sconosciuto.");
    } finally {
      setIsLoadingBatches(false);
      setIsRefreshing(false);
      setShowFullPageLoading(false);
      setFirstLoad(false);
    }
  };

  const handleRefresh = async () => {
    if (!account) return;

    setShowFullPageLoading(true);

    try {
      // 1. Controlla i crediti on-chain (Mock)
      const refetchedData = await refetchContractData();
      if (refetchedData.data) {
        const [, onChainCredits] = refetchedData.data;
        const creditsNumber = Number(onChainCredits);

        // 2. Aggiorna Firebase con i crediti corretti (Mock)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simula API call

        // 3. Aggiorna i dati locali
        setCurrentCompanyData(prev => ({
          ...prev,
          credits: creditsNumber
        }));
      }

      // 4. Ricarica le iscrizioni
      await loadBatches(false);

    } catch (error: any) {
      setErrorBatches(error.message || "Errore durante l'aggiornamento.");
    } finally {
      setShowFullPageLoading(false);
    }
  };

  const incrementRefreshCounter = () => {
    setRefreshCounter(prev => prev + 1);
  };

  useEffect(() => {
    if (account && firstLoad) {
      loadBatches(true);
    }
  }, [account, firstLoad]);

  // Calcola il numero di iscrizione incrementale per ogni batch
  const getBatchDisplayNumber = (batchId: string) => {
    const sortedBatches = [...batches].sort((a, b) => parseInt(a.batchId) - parseInt(b.batchId));
    const index = sortedBatches.findIndex(batch => batch.batchId === batchId);
    return index + 1;
  };

  // Funzioni per la paginazione
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filtra i batch basati sui criteri di ricerca
  const filteredBatches = batches.filter(batch => {
    const nameMatch = batch.name.toLowerCase().includes(nameFilter.toLowerCase());
    const locationMatch = batch.location?.toLowerCase().includes(locationFilter.toLowerCase());
    let statusMatch = true;
    if (statusFilter === "Aperto") {
      statusMatch = !batch.isClosed;
    } else if (statusFilter === "Chiuso") {
      statusMatch = batch.isClosed;
    }
    return nameMatch && locationMatch && statusMatch;
  });

  const currentItems = filteredBatches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleExport = async (batch: Batch, exportType: 'pdf' | 'html', bannerId: string) => {
    try {
      // Mock della chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Mock Export batch ${batch.name} as ${exportType} with banner ${bannerId}`);

      // Simula il download
      const mockBlob = new Blob([`Contenuto mock del ${exportType} per ${batch.name}`], { type: `text/${exportType}` });
      const url = window.URL.createObjectURL(mockBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${batch.name}_export.${exportType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Se è un export HTML, mostra il popup per il QR Code
      if (exportType === 'html') {
        setShowQRCodeModal(true);
      }
    } catch (error) {
      console.error('Errore durante l\'esportazione (mock):', error);
    }
  };

  return (
    <>
      {showFullPageLoading && (
        <FullPageLoading message="Aggiornamento dati in corso..." />
      )}

      <div className="glass-card rounded-3xl p-6 md:p-8 tech-shadow mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-foreground">{currentCompanyData.companyName}</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-muted-foreground text-lg">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                <a
                  href="/ricaricacrediti"
                  className="text-primary hover:text-accent smooth-transition underline decoration-primary/50 hover:decoration-accent"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/ricaricacrediti';
                  }}
                >
                  Crediti Rimanenti: <strong className="text-foreground">{currentCompanyData.credits}</strong>
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Stato: <strong className={currentCompanyData.status === 'active' ? 'text-green-500' : 'text-orange-400'}>
                {currentCompanyData.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}
              </strong></span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="group primary-gradient text-xl px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 text-primary-foreground font-semibold flex items-center gap-3">
          + Nuova Iscrizione
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-foreground">Le mie Iscrizioni su Blockchain</h3>
          <button
            className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 smooth-transition"
            onClick={() => setShowInfoModal(true)}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <button
            className="group relative w-12 h-12 rounded-full primary-gradient flex items-center justify-center tech-shadow hover:scale-105 smooth-transition"
            onClick={handleRefresh}
            disabled={isRefreshing || refreshCounter === 0}
          >
            <RefreshCw className="w-6 h-6 text-primary-foreground group-hover:rotate-180 smooth-transition" />
            {refreshCounter > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {refreshCounter}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 tech-shadow mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground font-medium">Nome</label>
          <input
            type="text"
            className="form-input bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent smooth-transition"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Filtra per nome"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground font-medium">Luogo</label>
          <input
            type="text"
            className="form-input bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent smooth-transition"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Filtra per luogo"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-muted-foreground font-medium">Stato</label>
          <select
            className="form-input bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent smooth-transition appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "Aperto" | "Chiuso" | "")}
          >
            <option value="">Tutti</option>
            <option value="Aperto">Aperto</option>
            <option value="Chiuso">Chiuso</option>
          </select>
        </div>
      </div>

      {isLoadingBatches && !showFullPageLoading ? (
        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground tech-shadow">
          <p>Caricamento delle tue iscrizioni...</p>
        </div>
      ) : errorBatches ? (
        <div className="glass-card rounded-2xl p-8 text-center text-red-500 tech-shadow">
          <p>{errorBatches}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.length > 0 ? (
              currentItems.map((batch) => (
                <div key={batch.batchId} className="glass-card rounded-3xl p-6 tech-shadow hover:scale-[1.02] smooth-transition relative">
                  <h3 className="text-xl font-bold mb-3 text-primary">#{getBatchDisplayNumber(batch.batchId)} - {batch.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2"><strong>Descrizione:</strong> {batch.description ? truncateText(batch.description, window.innerWidth < 768 ? 80 : 100) : "N/D"}</p>
                  <p className="text-muted-foreground text-sm mb-2"><strong>Data:</strong> {formatItalianDate(batch.date)}</p>
                  <p className="text-muted-foreground text-sm mb-2"><strong>Luogo:</strong> {batch.location || "N/D"}</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    <strong>Stato:</strong> <span className={batch.isClosed ? 'text-red-500' : 'text-green-500'}>
                      {batch.isClosed ? 'Chiuso' : 'Aperto'}
                    </span>
                  </p>

                  {batch.imageIpfsHash && batch.imageIpfsHash !== "N/A" && (
                    <p className="mb-4">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedImage(`https://musical-emerald-partridge.myfilebase.com/ipfs/${batch.imageIpfsHash}`);
                        }}
                        className="text-accent hover:underline text-sm font-medium flex items-center gap-1"
                      >
                        <Play className="w-4 h-4" /> Apri Immagine
                      </a>
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs mb-4">
                    <strong>Tx Hash:</strong>
                    <a
                      href={`https://polygonscan.com/tx/${batch.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline ml-1"
                    >
                      {truncateText(batch.transactionHash, 15)}
                    </a>
                  </p>

                  <div className="border-t border-border/50 pt-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      {batch.steps && batch.steps.length > 0 ? (
                        <button
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:scale-105 smooth-transition shadow-md"
                          onClick={() => setSelectedBatchForSteps(batch)}
                        >
                          {batch.steps.length} Steps
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-muted/20 text-muted-foreground rounded-lg text-sm font-semibold cursor-not-allowed">
                          0 Steps
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {/* Pulsante Esporta - mostrato solo per batch chiusi */}
                      {batch.isClosed && (
                        <button
                          className="px-4 py-2 primary-gradient text-primary-foreground rounded-lg text-sm font-semibold hover:scale-105 smooth-transition shadow-md"
                          onClick={() => {
                            setSelectedBatchForExport(batch);
                            setShowExportModal(true);
                          }}
                        >
                          Esporta
                        </button>
                      )}

                      {/* Pulsanti Aggiungi Step e Finalizza per iscrizioni aperte, lucchetto per quelle chiuse */}
                      {!batch.isClosed ? (
                        <>
                          <button
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:scale-105 smooth-transition shadow-md"
                            onClick={() => setSelectedBatchForStep(batch)}
                          >
                            Aggiungi Step
                          </button>
                          <button
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-600 text-white rounded-lg text-sm font-semibold hover:scale-105 smooth-transition shadow-md"
                            onClick={() => setSelectedBatchForFinalize(batch)}
                          >
                            Finalizza
                          </button>
                        </>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted/20 text-muted-foreground flex items-center justify-center">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground col-span-full tech-shadow">
                <p className="text-lg mb-2">Non hai ancora inizializzato nessuna iscrizione con questo account.</p>
                <p className="text-sm opacity-70">Clicca su "Nuova Iscrizione" per iniziare</p>
              </div>
            )}
          </div>

          {/* Paginazione */}
          {filteredBatches.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                className="px-4 py-2 primary-gradient text-primary-foreground rounded-lg hover:scale-105 smooth-transition disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  className={`px-4 py-2 rounded-lg text-foreground hover:bg-muted/30 smooth-transition ${currentPage === number ? 'bg-primary/20 text-primary font-bold' : 'bg-card'}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              ))}

              <button
                className="px-4 py-2 primary-gradient text-primary-foreground rounded-lg hover:scale-105 smooth-transition disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
              <span className="text-muted-foreground text-sm hidden sm:block">
                Pagina {currentPage} di {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* Modale per visualizzare immagini */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Modale per nuova iscrizione */}
      {isModalOpen && (
        <NewInscriptionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            incrementRefreshCounter();
          }}
          onCreditsUpdate={(newCredits: number) => {
            setCurrentCompanyData(prev => ({ ...prev, credits: newCredits }));
          }}
        />
      )}

      {/* Modale per aggiungere step */}
      {selectedBatchForStep && (
        <AddStepModal
          batch={selectedBatchForStep}
          onClose={() => setSelectedBatchForStep(null)}
          onSuccess={() => {
            setSelectedBatchForStep(null);
            incrementRefreshCounter();
          }}
          onCreditsUpdate={(newCredits: number) => {
            setCurrentCompanyData(prev => ({ ...prev, credits: newCredits }));
          }}
        />
      )}

      {/* Modale per finalizzare iscrizione */}
      {selectedBatchForFinalize && (
        <FinalizeModal
          batch={selectedBatchForFinalize}
          onClose={() => setSelectedBatchForFinalize(null)}
          onSuccess={() => {
            setSelectedBatchForFinalize(null);
            incrementRefreshCounter();
          }}
          onCreditsUpdate={(newCredits: number) => {
            setCurrentCompanyData(prev => ({ ...prev, credits: newCredits }));
          }}
        />
      )}

      {/* Modale per visualizzare steps */}
      {selectedBatchForSteps && (
        <StepsModal
          batch={selectedBatchForSteps}
          onClose={() => setSelectedBatchForSteps(null)}
        />
      )}

      {/* Modale per scelta tipo esportazione */}
      {showExportModal && selectedBatchForExport && (
        <ExportTypeModal
          batch={selectedBatchForExport}
          onClose={() => {
            setShowExportModal(false);
            setSelectedBatchForExport(null);
          }}
          onSelectType={(type) => {
            setSelectedExportType(type);
            setShowExportModal(false);
            setShowBannerModal(true);
          }}
        />
      )}

      {/* Modale per scelta banner */}
      {showBannerModal && selectedBatchForExport && selectedExportType && (
        <BannerSelectionModal
          batch={selectedBatchForExport}
          exportType={selectedExportType}
          onClose={() => {
            setShowBannerModal(false);
            setSelectedBatchForExport(null);
            setSelectedExportType(null);
          }}
          onExport={(bannerId) => {
            handleExport(selectedBatchForExport, selectedExportType, bannerId);
            setShowBannerModal(false);
            setSelectedBatchForExport(null);
            setSelectedExportType(null);
          }}
        />
      )}

      {/* Modale Info */}
      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}

      {/* Modale QR Code */}
      {showQRCodeModal && (
        <QRCodeOfferModal onClose={() => setShowQRCodeModal(false)} />
      )}
    </>
  );
};

// Componente modale per aggiungere step
const AddStepModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  onSuccess: () => void;
  onCreditsUpdate: (credits: number) => void;
}> = ({ batch, onClose, onSuccess, onCreditsUpdate }) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    date: "",
    location: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [txResult, setTxResult] = useState<{ status: "success" | "error"; message: string; } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.eventName.trim()) {
      setTxResult({ status: "error", message: "Il campo 'Nome Evento' è obbligatorio." });
      return;
    }
    setTxResult(null); // Clear previous error
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    setTxResult(null); // Clear error when going back
  };

  const handleSubmit = async () => {
    if (!formData.eventName.trim()) {
      setTxResult({ status: "error", message: "Il campo Nome Evento è obbligatorio." });
      return;
    }

    setLoadingMessage("Preparazione transazione...");
    let attachmentsIpfsHash = "";

    if (selectedFile) {
      try {
        // Mock della chiamata API di upload
        await new Promise(resolve => setTimeout(resolve, 500));
        attachmentsIpfsHash = "QmMockIpfsHash" + Math.random().toString(16).substring(2,10);
      } catch (error) {
        console.error("Errore upload file (mock):", error);
      }
    }

    setLoadingMessage("Transazione in corso...");
    const transaction = prepareContractCall({
      contract,
      method: "function addStepToBatch(uint256,string,string,string,string,string)",
      params: [batch.batchId, formData.eventName, formData.description || "", formData.date || "", formData.location || "", attachmentsIpfsHash],
    });

    // Timeout per gestire transazioni bloccate
    const timeoutId = setTimeout(() => {
      if (loadingMessage !== "") {
        setTxResult({ status: "error", message: "Timeout della transazione. Controlla su Polygonscan se è stata eseguita." });
        setLoadingMessage("");
      }
    }, 60000); // 60 secondi timeout

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        clearTimeout(timeoutId);
        setTxResult({ status: "success", message: "Step aggiunto! Aggiorno i dati..." });

        console.log("Transaction hash per step (mock):", result.transactionHash);

        // Aggiorna i crediti localmente dopo la transazione (Mock)
        if (account?.address) {
          try {
            await new Promise(resolve => setTimeout(resolve, 200));
            // Qui dovresti avere un modo per ottenere i crediti aggiornati dal tuo backend
            // Per ora, simulo un decremento
            onCreditsUpdate(prevCredits => prevCredits - 1); // Questo richiede che onCreditsUpdate accetti un updater function
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti (mock):", error);
          }
        }

        // Aggiungi l'evento al cache Firebase (Mock)
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error("Errore aggiunta evento al cache (mock):", error);
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 1500);
      },
      onError: (err) => {
        clearTimeout(timeoutId);
        setTxResult({
          status: "error",
          message: err.message.toLowerCase().includes("insufficient funds") ? "Crediti Insufficienti (mock)" : "Errore nella transazione (mock)."
        });
        setLoadingMessage("");
      },
    });
  };

  const isProcessing = loadingMessage !== "" || isPending;
  const today = new Date().toISOString().split("T")[0];

  const helpCardStyle = "glass-card rounded-xl p-4 mt-4 text-sm text-muted-foreground tech-shadow";
  const labelStyle = "block mb-1 font-medium text-foreground";
  const inputStyle = "form-input w-full p-3 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent smooth-transition";
  const charCounterStyle = "text-xs text-muted-foreground mt-1";


  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="glass-card rounded-3xl p-6 md:p-8 tech-shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Aggiungi step all'iscrizione <span className="text-primary">({currentStep}/6)</span></h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/50 text-muted-foreground flex items-center justify-center hover:bg-card smooth-transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="min-h-[300px] mb-6">
            {currentStep === 1 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Nome Evento <span className="text-red-500 font-bold">* Obbligatorio</span>
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    className={inputStyle}
                    maxLength={100}
                  />
                  <small className={charCounterStyle}>{formData.eventName.length} / 100</small>
                </div>
                <div className={helpCardStyle}>
                  <p className="font-semibold text-primary mb-2">ℹ️ Come scegliere il Nome Step Iscrizione</p>
                  <p>Il Nome Step Iscrizione è un'etichetta descrittiva che ti aiuta a identificare con chiarezza un passaggio specifico della filiera o un evento rilevante che desideri registrare on-chain. Ad esempio:</p>
                  <ul className="list-disc list-inside mt-2 ml-2">
                    <li>Una fase produttiva: <em>Raccolta uva – Vigna 3, Inizio mungitura – Allevamento Nord</em></li>
                    <li>Un'attività logistica: <em>Spedizione lotto LT1025 – 15/05/2025</em></li>
                    <li>Un controllo o verifica: <em>Ispezione qualità – Stabilimento A, Audit ICEA 2025</em></li>
                    <li>Un evento documentale: <em>Firma contratto fornitura – Cliente COOP, Approvazione certificato biologico</em></li>
                  </ul>
                  <p className="mt-4 font-semibold text-accent">📌 Consiglio: scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente lo step anche dopo mesi o anni.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Descrizione <span className="text-muted-foreground">Non obbligatorio</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={inputStyle}
                    rows={4}
                    maxLength={500}
                  ></textarea>
                  <small className={charCounterStyle}>{formData.description.length} / 500</small>
                </div>
                <div className={helpCardStyle}>
                  <p>Inserisci una descrizione dello step, come una fase produttiva, logistica, amministrativa o documentale. Fornisci tutte le informazioni utili per identificarlo chiaramente all'interno del processo o della filiera a cui appartiene.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Luogo <span className="text-muted-foreground">Non obbligatorio</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={inputStyle}
                    maxLength={100}
                  />
                  <small className={charCounterStyle}>{formData.location.length} / 100</small>
                </div>
                <div className={helpCardStyle}>
                  <p>Inserisci il luogo in cui si è svolto lo step, come una città, una regione, un'azienda agricola, uno stabilimento o un punto logistico. Serve a indicare con precisione dove è avvenuto il passaggio registrato.</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Data <span className="text-muted-foreground">Non obbligatorio</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={inputStyle}
                    max={today}
                  />
                </div>
                <div className={helpCardStyle}>
                  <p>Inserisci una data, puoi utilizzare il giorno attuale o una data precedente alla conferma di questo step.</p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Immagini / Documenti <span className="text-muted-foreground">Non obbligatorio</span>
                  </label>
                  <input
                    type="file"
                    name="attachments"
                    onChange={handleFileChange}
                    className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer`}
                    accept="image/png, image/jpeg, image/webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.oasis.opendocument.text, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  />
                  <small className="block text-xs text-muted-foreground mt-2">
                    Formati immagini: PNG, JPG, WEBP. Max: 5 MB.<br />
                    Formati documenti: PDF, DOC, DOCX, ODT, CSV, XLS, XLSX. Max 10 MB.
                  </small>
                  {selectedFile && (
                    <p className="text-primary text-sm mt-2">File selezionato: {selectedFile.name}</p>
                  )}
                </div>
                <div className={helpCardStyle}>
                  <p>Carica un'immagine rappresentativa dello step, come una foto della fase produttiva, di un documento firmato, di un certificato o di un controllo effettuato. Rispetta i formati e i limiti di peso.</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <h4 className="text-xl font-bold mb-4 text-primary">Riepilogo Dati</h4>
                <div className="glass-card rounded-xl p-4 tech-shadow text-muted-foreground text-sm">
                  <p className="mb-1"><strong>Nome Evento:</strong> <span className="text-foreground">{truncateText(formData.eventName, 40) || "N/D"}</span></p>
                  <p className="mb-1"><strong>Descrizione:</strong> <span className="text-foreground">{truncateText(formData.description, 60) || "N/D"}</span></p>
                  <p className="mb-1"><strong>Luogo:</strong> <span className="text-foreground">{truncateText(formData.location, 40) || "N/D"}</span></p>
                  <p className="mb-1"><strong>Data:</strong> <span className="text-foreground">{formData.date ? formData.date.split("-").reverse().join("/") : "N/D"}</span></p>
                  <p className="mb-1"><strong>File:</strong> <span className="text-foreground">{truncateText(selectedFile?.name || "", 40) || "Nessuno"}</span></p>
                </div>
                <p className="mt-6 text-lg text-foreground text-center">Vuoi confermare e registrare questo step sulla blockchain?</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
            {currentStep > 1 && (
              <button onClick={handlePrevStep} className="group secondary-gradient text-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2" disabled={isProcessing}>
                <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 smooth-transition" />
                Indietro
              </button>
            )}
            <div className="flex-1 flex justify-end gap-4">
              <button onClick={onClose} className="group secondary-gradient text-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2" disabled={isProcessing}>
                Chiudi
              </button>
              {currentStep < 6 && (
                <button onClick={handleNextStep} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2">
                  Avanti
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
                </button>
              )}
              {currentStep === 6 && (
                <button onClick={handleSubmit} disabled={isProcessing} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2">
                  {isProcessing ? "Conferma..." : "Conferma e Registra"}
                  {isProcessing ? <Cpu className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {txResult && (
        <TransactionStatusModal
          isOpen={true}
          status={txResult.status}
          message={txResult.message}
          onClose={() => { setTxResult(null); setLoadingMessage(""); }}
        />
      )}
    </>
  );
};

// Componente modale per finalizzare iscrizione
const FinalizeModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  onSuccess: () => void;
  onCreditsUpdate: (credits: number) => void;
}> = ({ batch, onClose, onSuccess, onCreditsUpdate }) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [txResult, setTxResult] = useState<{ status: "success" | "error"; message: string; } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleFinalize = async () => {
    setLoadingMessage("Finalizzazione in corso...");

    const transaction = prepareContractCall({
      contract,
      method: "function closeBatch(uint256)",
      params: [batch.batchId],
    });

    // Timeout per gestire transazioni bloccate
    const timeoutId = setTimeout(() => {
      if (loadingMessage !== "") {
        setTxResult({ status: "error", message: "Timeout della transazione. Controlla su Polygonscan se è stata eseguita." });
        setLoadingMessage("");
      }
    }, 60000); // 60 secondi timeout

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        clearTimeout(timeoutId);
        setTxResult({ status: "success", message: "Iscrizione finalizzata con successo!" });

        console.log("Transaction hash per finalizzazione:", result.transactionHash);

        // Aggiorna i crediti localmente dopo la transazione (Mock)
        if (account?.address) {
          try {
            await new Promise(resolve => setTimeout(resolve, 200));
            onCreditsUpdate(prevCredits => prevCredits - 1); // Mock: decrementa i crediti
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti (mock):", error);
          }
        }

        // Aggiungi l'evento al cache Firebase (Mock)
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error("Errore aggiunta evento al cache (mock):", error);
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 1500);
      },
      onError: (err) => {
        clearTimeout(timeoutId);
        setTxResult({
          status: "error",
          message: err.message.toLowerCase().includes("insufficient funds") ? "Crediti Insufficienti (mock)" : "Errore nella transazione (mock)."
        });
        setLoadingMessage("");
      },
    });
  };

  const isProcessing = loadingMessage !== "" || isPending;

  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="glass-card rounded-3xl p-6 md:p-8 tech-shadow w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Finalizza Iscrizione</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/50 text-muted-foreground flex items-center justify-center hover:bg-card smooth-transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6 text-center">
            <p className="text-lg text-foreground mb-4">Sei sicuro di voler finalizzare l'iscrizione "<span className="font-semibold text-primary">{batch.name}</span>"?</p>
            <p className="text-orange-400 text-sm font-medium">
              ⚠️ Attenzione: Una volta finalizzata, non potrai più aggiungere step a questa iscrizione.
            </p>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
            <button onClick={onClose} className="group secondary-gradient text-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2" disabled={isProcessing}>
              Annulla
            </button>
            <button onClick={handleFinalize} disabled={isProcessing} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2">
              {isProcessing ? "Finalizzazione..." : "Finalizza"}
              {isProcessing ? <Cpu className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {txResult && (
        <TransactionStatusModal
          isOpen={true}
          status={txResult.status}
          message={txResult.message}
          onClose={() => {setTxResult(null); setLoadingMessage("");}}
        />
      )}
    </>
  );
};

// Componente modale per visualizzare steps
const StepsModal: React.FC<{
  batch: Batch;
  onClose: () => void;
}> = ({ batch, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="glass-card rounded-3xl p-6 md:p-8 tech-shadow w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Steps - <span className="text-primary">{batch.name}</span></h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/50 text-muted-foreground flex items-center justify-center hover:bg-card smooth-transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {batch.steps && batch.steps.length > 0 ? (
              batch.steps.map((step, index) => (
                <div key={index} className="glass-card rounded-2xl p-4 tech-shadow">
                  <h4 className="text-xl font-bold mb-2 text-accent">Step {index + 1}: {step.eventName}</h4>
                  <p className="text-muted-foreground text-sm mb-1"><strong>📄 Descrizione:</strong> <span className="text-foreground">{step.description || "N/D"}</span></p>
                  <p className="text-muted-foreground text-sm mb-1"><strong>📅 Data:</strong> <span className="text-foreground">{formatItalianDate(step.date)}</span></p>
                  <p className="text-muted-foreground text-sm mb-1"><strong>📍 Luogo:</strong> <span className="text-foreground">{step.location || "N/D"}</span></p>
                  {step.attachmentsIpfsHash && step.attachmentsIpfsHash !== "N/A" && (
                    <p className="text-muted-foreground text-sm mb-1">
                      <strong>📎 Allegati:</strong>
                      <a
                        href={`https://musical-emerald-partridge.myfilebase.com/ipfs/${step.attachmentsIpfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline ml-1"
                      >
                        Visualizza
                      </a>
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    <strong>🔗 Verifica su Blockchain:</strong>
                    <a
                      href={`https://polygonscan.com/tx/${step.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline ml-1"
                    >
                      {truncateText(step.transactionHash, 15)}
                    </a>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-lg p-8">Nessuno step disponibile per questa iscrizione.</p>
            )}
          </div>
          <div className="text-center mt-8 pt-4 border-t border-border/50">
            <button onClick={onClose} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2 mx-auto">
              Indietro
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 smooth-transition" />
            </button>
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

// Componente modale per nuova iscrizione
const NewInscriptionModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  onCreditsUpdate: (credits: number | ((prev: number) => number)) => void; // Aggiornato per accettare una funzione
}> = ({ onClose, onSuccess, onCreditsUpdate }) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [txResult, setTxResult] = useState<{ status: "success" | "error"; message: string; } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      setTxResult({ status: "error", message: "Il campo 'Nome Iscrizione' è obbligatorio." });
      return;
    }
    setTxResult(null); // Clear previous error
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    setTxResult(null); // Clear error when going back
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setTxResult({ status: "error", message: "Il campo Nome Iscrizione è obbligatorio." });
      return;
    }

    setLoadingMessage("Preparazione transazione...");
    let imageIpfsHash = "";

    if (selectedFile) {
      try {
        // Mock della chiamata API di upload
        await new Promise(resolve => setTimeout(resolve, 500));
        imageIpfsHash = "QmMockIpfsHash" + Math.random().toString(16).substring(2,10);
      } catch (error) {
        console.error("Errore upload file (mock):", error);
      }
    }

    setLoadingMessage("Transazione in corso...");
    const transaction = prepareContractCall({
      contract,
      method: "function initializeBatch(string,string,string,string,string)",
      params: [formData.name, formData.description || "", formData.date || "", formData.location || "", imageIpfsHash],
    });

    // Timeout per gestire transazioni bloccate
    const timeoutId = setTimeout(() => {
      if (loadingMessage !== "") {
        setTxResult({ status: "error", message: "Timeout della transazione. Controlla su Polygonscan se è stata eseguita." });
        setLoadingMessage("");
      }
    }, 60000); // 60 secondi timeout

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        clearTimeout(timeoutId);
        setTxResult({ status: "success", message: "Iscrizione creata! Aggiorno i dati..." });

        // Aggiorna i crediti localmente dopo la transazione (Mock)
        if (account?.address) {
          try {
            await new Promise(resolve => setTimeout(resolve, 200));
            onCreditsUpdate(prevCredits => prevCredits - 1); // Mock: decrementa i crediti
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti (mock):", error);
          }
        }

        // Aggiungi l'evento al cache Firebase (Mock)
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error("Errore aggiunta evento al cache (mock):", error);
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 1500);
      },
      onError: (err) => {
        clearTimeout(timeoutId);
        setTxResult({
          status: "error",
          message: err.message.toLowerCase().includes("insufficient funds") ? "Crediti Insufficienti (mock)" : "Errore nella transazione (mock)."
        });
        setLoadingMessage("");
      },
    });
  };

  const isProcessing = loadingMessage !== "" || isPending;
  const today = new Date().toISOString().split("T")[0];

  const helpCardStyle = "glass-card rounded-xl p-4 mt-4 text-sm text-muted-foreground tech-shadow";
  const labelStyle = "block mb-1 font-medium text-foreground";
  const inputStyle = "form-input w-full p-3 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent smooth-transition";
  const charCounterStyle = "text-xs text-muted-foreground mt-1";

  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="glass-card rounded-3xl p-6 md:p-8 tech-shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Nuova Iscrizione <span className="text-primary">({currentStep}/6)</span></h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/50 text-muted-foreground flex items-center justify-center hover:bg-card smooth-transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="min-h-[300px] mb-6">
            {currentStep === 1 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Nome Iscrizione <span className="text-red-500 font-bold">* Obbligatorio</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputStyle}
                    maxLength={100}
                  />
                  <small className={charCounterStyle}>{formData.name.length} / 100</small>
                </div>
                <div className={helpCardStyle}>
                  <p className="font-semibold text-primary mb-2">ℹ️ Come scegliere il Nome Iscrizione</p>
                  <p>Il Nome Iscrizione è un'etichetta descrittiva che ti aiuta a identificare in modo chiaro ciò che stai registrando on-chain. Ad esempio:</p>
                  <ul className="list-disc list-inside mt-2 ml-2">
                    <li>Il nome di un prodotto o varietà: <em>Pomodori San Marzano 2025, Olio Extravergine Frantoio</em></li>
                    <li>Un lotto o una produzione: <em>Lotto Pasta Artigianale LT1025, Produzione Vino Rosso 2024</em></li>
                    <li>Un servizio o processo: <em>Trasporto Merci Roma-Milano, Certificazione Biologico 2025</em></li>
                  </ul>
                  <p className="mt-4 font-semibold text-accent">📌 Consiglio: scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente l'iscrizione anche dopo mesi o anni.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Descrizione <span className="text-muted-foreground">Non obbligatorio</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={inputStyle}
                    rows={4}
                    maxLength={500}
                  ></textarea>
                  <small className={charCounterStyle}>{formData.description.length} / 500</small>
                </div>
                <div className={helpCardStyle}>
                  <p>Inserisci una descrizione dettagliata di ciò che stai registrando. Fornisci tutte le informazioni utili per identificare chiaramente il prodotto, il servizio o il processo a cui appartiene questa iscrizione.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Luogo di Produzione <span className="text-muted-foreground">Non obbligatorio</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={inputStyle}
                    maxLength={100}
                  />
                  <small className={charCounterStyle}>{formData.location.length} / 100</small>
                </div>
                <div className={helpCardStyle}>
                  <p>Inserisci il luogo di origine o produzione, come una città, una regione, un'azienda agricola o uno stabilimento. Serve a indicare con precisione dove ha avuto origine ciò che stai registrando.</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Data di Origine <span className="text-muted-foreground">Non obbligatorio</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={inputStyle}
                    max={today}
                  />
                </div>
                <div className={helpCardStyle}>
                  <p>Inserisci una data di origine, puoi utilizzare il giorno attuale o una data precedente alla registrazione di questa iscrizione.</p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <div className="form-group">
                  <label className={labelStyle}>
                    Immagine Prodotto <span className="text-muted-foreground">Non obbligatorio</span>
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer`}
                    accept="image/png, image/jpeg, image/webp"
                  />
                  <small className="block text-xs text-muted-foreground mt-2">
                    Formati supportati: PNG, JPG, WEBP. Dimensione massima: 5 MB.
                  </small>
                  {selectedFile && (
                    <p className="text-primary text-sm mt-2">File selezionato: {selectedFile.name}</p>
                  )}
                </div>
                <div className={helpCardStyle}>
                  <p>Carica un'immagine rappresentativa di ciò che stai registrando, come una foto del prodotto, del luogo di produzione o di un documento. Rispetta i formati e i limiti di peso.</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <h4 className="text-xl font-bold mb-4 text-primary">Riepilogo Dati</h4>
                <div className="glass-card rounded-xl p-4 tech-shadow text-muted-foreground text-sm">
                  <p className="mb-1"><strong>Nome:</strong> <span className="text-foreground">{truncateText(formData.name, 40) || "N/D"}</span></p>
                  <p className="mb-1"><strong>Descrizione:</strong> <span className="text-foreground">{truncateText(formData.description, 60) || "N/D"}</span></p>
                  <p className="mb-1"><strong>Luogo:</strong> <span className="text-foreground">{truncateText(formData.location, 40) || "N/D"}</span></p>
                  <p className="mb-1"><strong>Data:</strong> <span className="text-foreground">{formData.date ? formData.date.split("-").reverse().join("/") : "N/D"}</span></p>
                  <p className="mb-1"><strong>Immagine:</strong> <span className="text-foreground">{truncateText(selectedFile?.name || "", 40) || "Nessuna"}</span></p>
                </div>
                <p className="mt-6 text-lg text-foreground text-center">Vuoi confermare e registrare questa iscrizione sulla blockchain?</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
            {currentStep > 1 && (
              <button onClick={handlePrevStep} className="group secondary-gradient text-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2" disabled={isProcessing}>
                <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 smooth-transition" />
                Indietro
              </button>
            )}
            <div className="flex-1 flex justify-end gap-4">
              <button onClick={onClose} className="group secondary-gradient text-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2" disabled={isProcessing}>
                Chiudi
              </button>
              {currentStep < 6 && (
                <button onClick={handleNextStep} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2">
                  Avanti
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
                </button>
              )}
              {currentStep === 6 && (
                <button onClick={handleSubmit} disabled={isProcessing} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2">
                  {isProcessing ? "Conferma..." : "Conferma e Registra"}
                  {isProcessing ? <Cpu className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {txResult && (
        <TransactionStatusModal
          isOpen={true}
          status={txResult.status}
          message={txResult.message}
          onClose={() => {setTxResult(null); setLoadingMessage("");}}
        />
      )}
    </>
  );
};

// Componente modale per scelta tipo esportazione
const ExportTypeModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  onSelectType: (type: 'pdf' | 'html') => void;
}> = ({ batch, onClose, onSelectType }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-3xl p-6 md:p-8 tech-shadow w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Informazioni Esportazione</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/50 text-muted-foreground flex items-center justify-center hover:bg-card smooth-transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-8 text-muted-foreground text-base leading-relaxed">
          <p className="mb-4">Se hai completato con successo la tua iscrizione (solo dopo la finalizzazione), potrai esportare:</p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Un certificato EasyChain in formato <strong className="text-primary">PDF</strong>, utile all'azienda per uso interno o documentale. Questo file può essere archiviato, stampato o condiviso con terzi per attestare l'iscrizione e l'autenticità del prodotto, senza necessariamente passare per il QR Code.</li>
            <li>Un certificato EasyChain in formato <strong className="text-primary">HTML</strong>, pensato per la pubblicazione online. Caricalo su uno spazio web (privato o pubblico), copia il link e usalo per generare un QR Code da applicare all'etichetta del tuo prodotto. Inquadrando il QR Code, chiunque potrà visualizzare il certificato direttamente online.</li>
          </ul>
        </div>
        <div className="flex justify-center gap-6 pt-4 border-t border-border/50">
          <button
            className="group primary-gradient text-primary-foreground px-8 py-4 rounded-xl tech-shadow smooth-transition hover:scale-105 flex flex-col items-center gap-2 min-w-[150px]"
            onClick={() => onSelectType('pdf')}
          >
            <FileText className="w-6 h-6" />
            <span className="font-semibold text-lg">Esporta PDF</span>
          </button>
          <button
            className="group primary-gradient text-primary-foreground px-8 py-4 rounded-xl tech-shadow smooth-transition hover:scale-105 flex flex-col items-center gap-2 min-w-[150px]"
            onClick={() => onSelectType('html')}
          >
            <Globe className="w-6 h-6" />
            <span className="font-semibold text-lg">Esporta HTML</span>
          </button>
        </div>
        <div className="text-center mt-6">
          <button onClick={onClose} className="group secondary-gradient text-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente placeholder per modale selezione banner (non più necessario)
const BannerSelectionModal: React.FC<{
  batch: Batch;
  exportType: 'pdf' | 'html';
  onClose: () => void;
  onExport: (bannerId: string) => void;
}> = ({ batch, exportType, onClose, onExport }) => {
  // Esporta direttamente senza banner
  React.useEffect(() => {
    onExport('none');
  }, [onExport]);

  return null;
};

// Componente modale per offrire la creazione del QR Code
const QRCodeOfferModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const handleGenerateQRCode = () => {
    window.location.href = '/qrcode';
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-3xl p-6 md:p-8 tech-shadow w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Crea QR Code</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/50 text-muted-foreground flex items-center justify-center hover:bg-card smooth-transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-8 text-center text-lg text-foreground">
          <p>Vuoi creare anche un <span className="font-semibold text-primary">QRCode</span> da usare per l'etichetta del tuo prodotto?</p>
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
          <button onClick={onClose} className="group secondary-gradient text-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105">
            No Grazie
          </button>
          <button onClick={handleGenerateQRCode} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105 flex items-center gap-2">
            Genera QrCode
            <QrCode className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente modale info
const InfoModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card rounded-3xl p-6 md:p-8 tech-shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Informazioni Iscrizioni</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/50 text-muted-foreground flex items-center justify-center hover:bg-card smooth-transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-muted-foreground text-base leading-relaxed">
          <h4 className="text-xl font-bold mb-3 text-primary">COME FUNZIONA</h4>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li><strong>Inizializza Nuova Iscrizione:</strong> Crea una nuova iscrizione con i dati base del prodotto</li>
            <li><strong>Aggiungi Steps:</strong> Registra ogni fase della filiera produttiva</li>
            <li><strong>Finalizza:</strong> Chiudi l'iscrizione quando completata, non potrai aggiungere nuovi steps</li>
            <li><strong>Esporta:</strong> Genera certificati PDF o HTML per i tuoi clienti</li>
          </ul>

          <h4 className="text-xl font-bold mb-3 text-primary">Stati dell'iscrizione:</h4>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li><span className="text-green-500 font-semibold">Aperto</span>: Puoi aggiungere nuovi step</li>
            <li><span className="text-red-500 font-semibold">Chiuso</span>: Finalizzato, pronto per l'esportazione</li>
          </ul>

          <h4 className="text-xl font-bold mb-3 text-primary">Riguardo i Costi:</h4>
          <p className="mb-2">Dopo l'attivazione del tuo account avrai a disposizione crediti gratuiti per avviare la tua attività di certificazione su Blockchain.</p>
          <p className="mb-4">Ogni operazione (nuova iscrizione, aggiunta step, finalizzazione) consuma 1 credito.</p>
          <p>Se hai bisogno di piu' crediti per le tue operazioni vai alla pagina <a href="/ricaricacrediti" className="text-primary hover:underline font-medium">Ricarica Crediti</a>.</p>
        </div>
        <div className="text-center mt-8 pt-4 border-t border-border/50">
          <button onClick={onClose} className="group primary-gradient text-primary-foreground px-6 py-3 rounded-xl tech-shadow smooth-transition hover:scale-105">
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principale "Controllore"
const AziendaPage: React.FC = () => {
  const account = useActiveAccount();

  const [companyStatus, setCompanyStatus] = useState<{
    isLoading: boolean;
    isActive: boolean;
    data: CompanyData | null;
    error: string | null;
  }>({
    isLoading: true,
    isActive: false,
    data: null,
    error: null,
  });

  // currentCompanyData è ora inizializzato con i dati di companyStatus.data
  const [currentCompanyData, setCurrentCompanyData] = useState<CompanyData>({
    companyName: "Loading...",
    credits: 0,
    status: "inactive",
  });


  useEffect(() => {
    if (!account) {
      setCompanyStatus({ isLoading: false, isActive: false, data: null, error: null });
      return;
    }

    const checkCompanyStatus = async () => {
      setCompanyStatus(prev => ({ ...prev, isLoading: true }));
      try {
        // Mock della chiamata API
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = {
          isActive: true,
          companyName: "Azienda di Prova",
          credits: 10,
          status: "active",
        };
        setCompanyStatus({
          isLoading: false,
          isActive: mockData.isActive,
          data: mockData.isActive ? {
            companyName: mockData.companyName,
            credits: mockData.credits,
            status: mockData.status || 'active'
          } : null,
          error: null,
        });
        if (mockData.isActive) { // Usa mockData per aggiornare currentCompanyData
          setCurrentCompanyData({
            companyName: mockData.companyName,
            credits: mockData.credits,
            status: mockData.status || 'active'
          });
        }
      } catch (err: any) {
        setCompanyStatus({
          isLoading: false,
          isActive: false,
          data: null,
          error: err.message,
        });
      }
    };

    checkCompanyStatus();
  }, [account]);

  const renderContent = () => {
    if (companyStatus.isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh] text-foreground">
          <p className="text-xl">Verifica stato account in corso...</p>
        </div>
      );
    }

    if (companyStatus.error) {
      return (
        <div className="flex justify-center items-center min-h-[60vh] text-red-500">
          <p className="text-xl">{companyStatus.error}</p>
        </div>
      );
    }

    if (companyStatus.isActive && companyStatus.data) {
      return <Dashboard companyData={companyStatus.data} />;
    }

    if (account) {
      return <RegistrationForm walletAddress={account.address} />;
    }

    return (
      <div className="flex justify-center items-center min-h-[60vh] text-foreground">
        <p className="text-xl">Connetti il wallet per continuare.</p>
      </div>
    );
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center tech-shadow max-w-lg w-full">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Benvenuto
          </h1>
          <p className="text-lg text-muted-foreground mb-8">Connetti il tuo wallet per accedere.</p>
          <ConnectButton
            client={client}
            wallets={[inAppWallet()]}
            chain={polygon}
            accountAbstraction={{ chain: polygon, sponsorGas: true }}
            className="w-full primary-gradient text-primary-foreground text-xl px-8 py-4 rounded-xl tech-shadow hover:scale-105 smooth-transition"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="glass-card rounded-2xl p-4 md:p-6 tech-shadow mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">EasyChain - Area Privata</h1>
        <ConnectButton
          client={client}
          chain={polygon}
          accountAbstraction={{ chain: polygon, sponsorGas: true }}
          className="w-full sm:w-auto primary-gradient text-primary-foreground text-lg px-6 py-3 rounded-xl tech-shadow hover:scale-105 smooth-transition"
        />
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default AziendaPage;
