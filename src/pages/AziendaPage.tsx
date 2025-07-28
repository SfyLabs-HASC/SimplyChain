
// FILE: src/pages/AziendaPage.tsx
// DESCRIZIONE: Versione aggiornata che utilizza Firebase per i dati azienda,
// implementa il sistema di refresh on-chain e gestisce le iscrizioni con numerazione incrementale.

import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { supplyChainABI as abi } from "../abi/contractABI";
import "../App.css";

// Importa i componenti esterni
import RegistrationForm from "../components/RegistrationForm";
import TransactionStatusModal from "../components/TransactionStatusModal";

// --- Stili Mobile-First ---
const AziendaPageStyles = () => (
  <style>{`
      /* Mobile-first base styles */
      .app-container-full { 
        padding: 1rem; 
        min-height: 100vh;
        background-color: #0f0f0f;
      }
      
      .main-header-bar { 
        display: flex; 
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: #1a1a1a;
        border-radius: 0.75rem;
        border: 1px solid #333;
      }
      
      .header-title { 
        font-size: 1.5rem; 
        font-weight: bold; 
        color: #ffffff;
        text-align: center;
      }
      
      .login-container, .centered-container { 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        min-height: 80vh; 
        text-align: center;
        padding: 1rem;
      }
      
      .dashboard-header-card { 
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        color: #ffffff; 
        padding: 1.5rem; 
        border-radius: 1rem; 
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        margin-bottom: 1.5rem; 
        display: flex; 
        flex-direction: column;
        gap: 1rem;
      }
      
      .dashboard-title-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .dashboard-title { 
        font-size: 1.5rem; 
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }
      
      .dashboard-info {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .dashboard-info-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: #ffffff;
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .dashboard-icon {
        font-size: 1.8rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .status-icon {
        font-size: 1.8rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .status-active-text {
        color: #10b981;
      }
      
      .status-inactive-text {
        color: #f59e0b;
      }
      
      .inscriptions-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      
      .inscriptions-section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0;
      }
      
      .refresh-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .refresh-button {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
      }
      
      .refresh-button:hover {
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      }
      
      .refresh-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      
      .refresh-icon {
        color: white;
        font-size: 1.5rem;
      }
      
      .refresh-counter {
        color: #10b981;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: bold;
        position: absolute;
        top: -5px;
        right: -5px;
      }
      
      .full-page-loading {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        color: white;
      }
      
      .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid #333;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .web3-button { 
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white; 
        padding: 1rem 1.5rem; 
        border: none; 
        border-radius: 0.75rem; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.3s ease;
        font-size: 0.9rem;
        width: 100%;
        text-align: center;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      }
      
      .web3-button:hover { 
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
      }
      
      .web3-button.secondary {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
      }
      
      .web3-button.secondary:hover {
        background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
        box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
      }
      
      .inscriptions-grid { 
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .inscription-card { 
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        border-radius: 1rem; 
        padding: 1.5rem; 
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .inscription-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        border-color: #3b82f6;
      }
      
      .inscription-card h3 { 
        font-size: 1.1rem; 
        font-weight: 600; 
        color: #ffffff; 
        margin: 0 0 1rem 0;
        border-bottom: 1px solid #333; 
        padding-bottom: 0.75rem;
        word-wrap: break-word; 
      }
      
      .inscription-card p { 
        margin: 0.75rem 0; 
        color: #a0a0a0; 
        font-size: 0.85rem; 
        line-height: 1.5;
        word-wrap: break-word; 
      }
      
      .inscription-card strong { 
        color: #ffffff; 
        font-weight: 600;
      }
      
      .inscription-card a { 
        color: #60a5fa; 
        text-decoration: none; 
        font-weight: 500;
        transition: color 0.2s ease;
      }
      
      .inscription-card a:hover {
        color: #3b82f6;
      }
      
      .inscription-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #333;
      }
      
      .steps-count {
        font-size: 0.8rem;
        color: #a0a0a0;
      }
      
      .status-open {
        color: #10b981;
        font-weight: 600;
      }
      
      .status-closed {
        color: #ef4444;
        font-weight: 600;
      }
      
      .add-step-button {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .add-step-button:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-1px);
      }
      
      .closed-lock-icon {
        color: #6b7280;
        font-size: 1.2rem;
      }
      
      .loading-error-container { 
        text-align: center; 
        padding: 2rem 1rem; 
        background-color: #1a1a1a; 
        border-radius: 1rem;
        border: 1px solid #333;
        color: #a0a0a0;
      }
      
      .steps-container { 
        margin-top: 1rem; 
        border-top: 1px solid #333; 
        padding-top: 1rem; 
      }
      
      .steps-container h4 { 
        margin: 0 0 0.75rem 0; 
        font-size: 0.9rem; 
        font-weight: 600;
        color: #ffffff;
      }
      
      .step-item { 
        font-size: 0.8rem; 
        padding: 0.75rem 0 0.75rem 1rem;
        border-left: 2px solid #3b82f6; 
        margin-bottom: 0.75rem;
        background-color: rgba(59, 130, 246, 0.05);
        border-radius: 0 0.5rem 0.5rem 0;
      }
      
      .step-item p {
        margin: 0.25rem 0;
        color: #a0a0a0;
      }
      
      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #a0a0a0;
        background-color: #1a1a1a;
        border-radius: 1rem;
        border: 1px solid #333;
      }

      /* Modal styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 1rem;
      }
      
      .modal-content {
        background-color: #1a1a1a;
        border-radius: 1rem;
        border: 1px solid #333;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        color: #ffffff;
      }
      
      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #333;
      }
      
      .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }
      
      .modal-body {
        padding: 1.5rem;
      }
      
      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #333;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #f8f9fa;
      }
      
      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #495057;
        border-radius: 0.5rem;
        background-color: #212529;
        color: #f8f9fa;
        font-size: 0.9rem;
      }
      
      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
      }
      
      .char-counter {
        font-size: 0.75rem;
        color: #6c757d;
        margin-top: 0.25rem;
      }
      
      .recap-summary {
        text-align: left;
        padding: 1rem;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .recap-summary p {
        margin: 0.5rem 0;
        word-break: break-word;
      }
      
      .recap-summary p strong {
        color: #f8f9fa;
      }
      
      .file-name-preview {
        color: #3b82f6;
        font-size: 0.85rem;
        margin-top: 0.5rem;
      }

      /* Image modal styles */
      .image-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        padding: 2rem;
      }
      
      .image-modal-content {
        max-width: 90%;
        max-height: 90%;
        border-radius: 0.5rem;
        overflow: hidden;
      }
      
      .image-modal-content img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      
      .image-modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        font-size: 1.5rem;
      }

      /* Tablet styles */
      @media (min-width: 768px) {
        .app-container-full { 
          padding: 2rem; 
        }
        
        .main-header-bar { 
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
        }
        
        .header-title { 
          font-size: 1.75rem;
          text-align: left;
        }
        
        .dashboard-header-card { 
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem;
        }
        
        .dashboard-title { 
          font-size: 1.75rem;
        }
        
        .dashboard-info {
          flex-direction: row;
          gap: 2rem;
        }
        
        .web3-button {
          width: auto;
          min-width: 200px;
        }
        
        .inscriptions-grid { 
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .inscription-card h3 { 
          font-size: 1.25rem;
        }
        
        .loading-error-container { 
          padding: 3rem; 
        }
      }

      /* Desktop styles */
      @media (min-width: 1024px) {
        .app-container-full { 
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .inscriptions-grid { 
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }
        
        .inscription-card { 
          padding: 2rem; 
        }
        
        .dashboard-header-card { 
          padding: 2.5rem;
        }
      }
  `}</style>
);

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

const contract = getContract({
  client,
  chain: polygon,
  address: "0x0c5e6204e80e6fb3c0c7098c4fa84b2210358d0b",
  abi,
});

// Componente modale per visualizzare immagini
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Immagine iscrizione" />
      </div>
      <button className="image-modal-close" onClick={onClose}>×</button>
    </div>
  );
};

// Componente per il loading a pagina piena
const FullPageLoading: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="full-page-loading">
      <div className="loading-spinner"></div>
      <p>{message}</p>
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
      const response = await fetch(`/api/get-contract-events?userAddress=${account.address}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Errore dal server: ${response.status}`);
      }
      const data = await response.json();
      const readyBatches: Batch[] = data.events || [];
      const sortedBatches = readyBatches.sort((a, b) => parseInt(b.batchId) - parseInt(a.batchId));
      
      setBatches(sortedBatches);
      setRefreshCounter(0); // Reset counter dopo il refresh
      
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
      // 1. Controlla i crediti on-chain
      const refetchedData = await refetchContractData();
      if (refetchedData.data) {
        const [, onChainCredits] = refetchedData.data;
        const creditsNumber = Number(onChainCredits);
        
        // 2. Aggiorna Firebase con i crediti corretti
        await fetch('/api/activate-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'setCredits',
            walletAddress: account.address,
            credits: creditsNumber,
          }),
        });
        
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

  return (
    <>
      {showFullPageLoading && (
        <FullPageLoading message="Aggiornamento dati in corso..." />
      )}
      
      <div className="dashboard-header-card">
        <div>
          <div className="dashboard-title-section">
            <h2 className="dashboard-title">{currentCompanyData.companyName}</h2>
          </div>
          <div className="dashboard-info">
            <div className="dashboard-info-item">
              <div className="dashboard-icon">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9ImdvbGQiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iZ29sZCIvPgo8L3N2Zz4K" alt="crediti" style={{width: '100%', height: '100%'}} />
              </div>
              <span>Crediti Rimanenti: <strong>{currentCompanyData.credits}</strong></span>
            </div>
            <div className="dashboard-info-item">
              <div className="status-icon">
                {currentCompanyData.status === 'active' ? (
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYgMTBWOEM2IDUuNzkgNy43OSA0IDEwIDRDMTIuMjEgNCA0IDUuNzkgMTQgOFYxMEgxNkMxNy4xIDEwIDE4IDEwLjkgMTggMTJWMjBDMTggMjEuMSAxNy4xIDIyIDE2IDIySDhDNi45IDIyIDYgMjEuMSA2IDIwVjEyQzYgMTAuOSA2LjkgMTAgOCAxMEg2WiIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiMxMGI5ODEiLz4KPC9zdmc+Cg==" alt="unlocked" style={{width: '100%', height: '100%'}} />
                ) : (
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjZIMTZDMTcuMSA2IDE4IDYuOSAxOCA4VjIwQzE4IDIxLjEgMTcuMSAyMiAxNiAyMkg4QzYuOSAyMiA2IDIxLjEgNiAyMFY4QzYgNi45IDYuOSA2IDggNkgxMFY0QzEwIDIuOSAxMC45IDIgMTIgMlpNMTIgNEMxMS40NSA0IDExIDQuNDUgMTEgNVY2SDEzVjVDMTMgNC40NSAxMi41NSA0IDEyIDRaIiBzdHJva2U9IiNmNTllMGIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0iI2Y1OWUwYiIvPgo8L3N2Zz4K" alt="locked" style={{width: '100%', height: '100%'}} />
                )}
              </div>
              <span>Stato: <strong className={currentCompanyData.status === 'active' ? 'status-active-text' : 'status-inactive-text'}>
                {currentCompanyData.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}
              </strong></span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="web3-button">+ Inizializza Nuova Iscrizione</button>
      </div>
      
      <div className="inscriptions-section-header">
        <h3 className="inscriptions-section-title">Le mie Iscrizioni su Blockchain</h3>
        <div className="refresh-section">
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing || refreshCounter === 0}
          >
            <img src="/src/assets/refresh-icon.png" alt="refresh" className="refresh-icon" style={{width: '20px', height: '20px'}} />
            {refreshCounter > 0 && (
              <div className="refresh-counter">+{refreshCounter}</div>
            )}
          </button>
        </div>
      </div>
      
      {isLoadingBatches && !showFullPageLoading ? (
        <div className="loading-error-container"><p>Caricamento delle tue iscrizioni...</p></div>
      ) : errorBatches ? (
        <div className="loading-error-container"><p style={{ color: 'red' }}>{errorBatches}</p></div>
      ) : (
        <div className="inscriptions-grid">
          {batches.length > 0 ? (
            batches.map((batch) => (
              <div key={batch.batchId} className="inscription-card">
                <h3>#{getBatchDisplayNumber(batch.batchId)} - {batch.name}</h3>
                <p><strong>Descrizione:</strong> {batch.description ? truncateText(batch.description, window.innerWidth < 768 ? 80 : 100) : "N/D"}</p>
                <p><strong>Data:</strong> {formatItalianDate(batch.date)}</p>
                <p><strong>Luogo:</strong> {batch.location || "N/D"}</p>
                <p><strong>Stato:</strong> 
                  <span className={batch.isClosed ? 'status-closed' : 'status-open'}>
                    {batch.isClosed ? ' Chiuso' : ' Aperto'}
                  </span>
                </p>
                {batch.imageIpfsHash && batch.imageIpfsHash !== "N/A" && (
                  <p><strong>Immagine:</strong> 
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedImage(`https://musical-emerald-partridge.myfilebase.com/ipfs/${batch.imageIpfsHash}`);
                      }}
                    >
                      Apri l'immagine
                    </a>
                  </p>
                )}
                <p><strong>Tx Hash:</strong> 
                  <a 
                    href={`https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {truncateText(batch.transactionHash, 15)}
                  </a>
                </p>
                
                {batch.steps && batch.steps.length > 0 && (
                  <div className="steps-container">
                    <h4>Steps:</h4>
                    {batch.steps.map(step => (
                      <div key={step.stepIndex} className="step-item">
                         <p><strong>{step.eventName}</strong> (Step #{step.stepIndex})</p>
                         <p>Desc: {step.description ? truncateText(step.description, 50) : "N/D"}</p>
                         <p>Data: {formatItalianDate(step.date)} | Luogo: {step.location || "N/D"}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="inscription-footer">
                  <div className="steps-count">
                    {batch.steps ? `${batch.steps.length} steps` : "0 steps"}
                  </div>
                  {/* Pulsante Aggiungi Step per iscrizioni aperte, lucchetto per quelle chiuse */}
                  {!batch.isClosed ? (
                    <button className="add-step-button">Aggiungi Step</button>
                  ) : (
                    <span className="closed-lock-icon">🔒</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Non hai ancora inizializzato nessuna iscrizione con questo account.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                Clicca su "Inizializza Nuova Iscrizione" per iniziare
              </p>
            </div>
          )}
        </div>
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
    </>
  );
};

// Componente modale per nuova iscrizione
const NewInscriptionModal: React.FC<{ 
  onClose: () => void; 
  onSuccess: () => void;
  onCreditsUpdate: (credits: number) => void;
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
      alert("Il campo 'Nome Iscrizione' è obbligatorio.");
      return;
    }
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setTxResult({ status: "error", message: "Il campo Nome è obbligatorio." });
      return;
    }

    setLoadingMessage("Preparazione transazione...");
    let imageIpfsHash = "N/A";
    
    if (selectedFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageIpfsHash = uploadResult.cid;
        }
      } catch (error) {
        console.error("Errore upload immagine:", error);
      }
    }

    setLoadingMessage("Transazione in corso...");
    const transaction = prepareContractCall({
      contract,
      method: "function initializeBatch(string,string,string,string,string)",
      params: [formData.name, formData.description || "", formData.date || "", formData.location || "", imageIpfsHash],
    });

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        setTxResult({ status: "success", message: "Iscrizione creata! Aggiorno i dati..." });
        
        // Aggiorna i crediti localmente dopo la transazione
        if (account?.address) {
          try {
            // Fetch dei crediti aggiornati dal contratto
            const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
            if (response.ok) {
              const data = await response.json();
              onCreditsUpdate(data.credits);
              
              // Aggiorna anche Firebase con i nuovi crediti
              await fetch('/api/activate-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'setCredits',
                  walletAddress: account.address,
                  credits: data.credits,
                }),
              });
            }
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti:", error);
          }
        }
        
        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 2000);
      },
      onError: (err) => {
        setTxResult({ 
          status: "error", 
          message: err.message.toLowerCase().includes("insufficient funds") ? "Crediti Insufficienti" : "Errore nella transazione." 
        });
        setLoadingMessage("");
      },
    });
  };

  const isProcessing = loadingMessage !== "" || isPending;
  const today = new Date().toISOString().split("T")[0];
  const helpTextStyle = { 
    backgroundColor: "#343a40", 
    border: "1px solid #495057", 
    borderRadius: "8px", 
    padding: "16px", 
    marginTop: "16px", 
    fontSize: "0.9rem", 
    color: "#f8f9fa" 
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Nuova Iscrizione ({currentStep}/6)</h2>
          </div>
          <div className="modal-body" style={{ minHeight: "350px" }}>
            {currentStep === 1 && (
              <div>
                <div className="form-group">
                  <label>
                    Nome Iscrizione 
                    <span style={{ color: "red", fontWeight: "bold" }}> * Obbligatorio</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    maxLength={100} 
                  />
                  <small className="char-counter">{formData.name.length} / 100</small>
                </div>
                <div style={helpTextStyle}>
                  <p><strong>ℹ️ Come scegliere il Nome Iscrizione</strong></p>
                  <p>Il Nome Iscrizione è un'etichetta descrittiva che ti aiuta a identificare in modo chiaro ciò che stai registrando on-chain. Ad esempio:</p>
                  <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
                    <li>Il nome di un prodotto o varietà: <em>Pomodori San Marzano 2025</em></li>
                    <li>Il numero di lotto: <em>Lotto LT1025 – Olio EVO 3L</em></li>
                    <li>Il nome di un contratto: <em>Contratto fornitura COOP – Aprile 2025</em></li>
                    <li>Una certificazione o audit: <em>Certificazione Bio ICEA 2025</em></li>
                    <li>Un riferimento amministrativo: <em>Ordine n.778 – Cliente NordItalia</em></li>
                  </ul>
                  <p style={{ marginTop: "1rem" }}><strong>📌 Consiglio:</strong> scegli un nome breve ma significativo, che ti aiuti a ritrovare facilmente l'iscrizione anche dopo mesi o anni.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="form-group">
                  <label>
                    Descrizione 
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    rows={4} 
                    maxLength={500}
                  ></textarea>
                  <small className="char-counter">{formData.description.length} / 500</small>
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci una descrizione del prodotto, lotto, contratto o altro elemento principale. Fornisci tutte le informazioni essenziali per identificarlo chiaramente nella filiera o nel contesto dell'iscrizione.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="form-group">
                  <label>
                    Luogo 
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input 
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    maxLength={100} 
                  />
                  <small className="char-counter">{formData.location.length} / 100</small>
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci il luogo di origine o di produzione del prodotto o lotto. Può essere una città, una regione, un'azienda agricola o uno stabilimento specifico per identificare con precisione dove è stato realizzato.</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="form-group">
                  <label>
                    Data 
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    max={today} 
                  />
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci una data, puoi utilizzare il giorno attuale o una data precedente alla conferma di questa Iscrizione.</p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <div className="form-group">
                  <label>
                    Immagine 
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input 
                    type="file" 
                    name="image" 
                    onChange={handleFileChange} 
                    className="form-input" 
                    accept="image/png, image/jpeg, image/webp" 
                  />
                  <small style={{ marginTop: "4px" }}>Formati: PNG, JPG, WEBP. Max: 5 MB.</small>
                  {selectedFile && (
                    <p className="file-name-preview">File: {selectedFile.name}</p>
                  )}
                </div>
                <div style={helpTextStyle}>
                  <p>Carica un'immagine rappresentativa del prodotto, lotto, contratto, etc. Rispetta i formati e i limiti di peso.<br/><strong>Consiglio:</strong> Per una visualizzazione ottimale, usa un'immagine quadrata (formato 1:1).</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <h4>Riepilogo Dati</h4>
                <div className="recap-summary">
                  <p><strong>Nome:</strong> {truncateText(formData.name, 40) || "N/D"}</p>
                  <p><strong>Descrizione:</strong> {truncateText(formData.description, 60) || "N/D"}</p>
                  <p><strong>Luogo:</strong> {truncateText(formData.location, 40) || "N/D"}</p>
                  <p><strong>Data:</strong> {formData.date ? formData.date.split("-").reverse().join("/") : "N/D"}</p>
                  <p><strong>Immagine:</strong> {truncateText(selectedFile?.name || "", 40) || "Nessuna"}</p>
                </div>
                <p>Vuoi confermare e registrare questi dati sulla blockchain?</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div>
              {currentStep > 1 && (
                <button onClick={handlePrevStep} className="web3-button secondary" disabled={isProcessing}>
                  Indietro
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={onClose} className="web3-button secondary" disabled={isProcessing}>
                Chiudi
              </button>
              {currentStep < 6 && (
                <button onClick={handleNextStep} className="web3-button">
                  Avanti
                </button>
              )}
              {currentStep === 6 && (
                <button onClick={handleSubmit} disabled={isProcessing} className="web3-button">
                  {isProcessing ? "Conferma..." : "Conferma e Registra"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <TransactionStatusModal 
          status="loading" 
          message={loadingMessage} 
          onClose={() => {}} 
        />
      )}
      
      {txResult && (
        <TransactionStatusModal 
          status={txResult.status} 
          message={txResult.message} 
          onClose={() => {
            if (txResult.status === "success") onClose();
            setTxResult(null);
          }} 
        />
      )}
    </>
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

  useEffect(() => {
    if (!account) {
      setCompanyStatus({ isLoading: false, isActive: false, data: null, error: null });
      return;
    }

    const checkCompanyStatus = async () => {
      setCompanyStatus(prev => ({ ...prev, isLoading: true }));
      try {
        const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
        if (!response.ok) {
          throw new Error('Errore di rete nella verifica dello stato.');
        }
        const data = await response.json();
        setCompanyStatus({
          isLoading: false,
          isActive: data.isActive,
          data: data.isActive ? { 
            companyName: data.companyName, 
            credits: data.credits,
            status: data.status || 'active'
          } : null,
          error: null,
        });
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
      return <div className="centered-container"><p>Verifica stato account in corso...</p></div>;
    }

    if (companyStatus.error) {
      return <div className="centered-container"><p style={{ color: "red" }}>{companyStatus.error}</p></div>;
    }

    if (companyStatus.isActive && companyStatus.data) {
      return <Dashboard companyData={companyStatus.data} />;
    }
    
    if (account) {
      return <RegistrationForm walletAddress={account.address} />;
    }

    return <div className="centered-container"><p>Connetti il wallet per continuare.</p></div>;
  };

  if (!account) {
    return (
      <div className="login-container">
        <AziendaPageStyles />
        <div style={{ textAlign: "center" }}>
          <h1>Benvenuto</h1>
          <p>Connetti il tuo wallet per accedere.</p>
          <ConnectButton 
            client={client} 
            wallets={[inAppWallet()]}
            chain={polygon}
            accountAbstraction={{ chain: polygon, sponsorGas: true }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <AziendaPageStyles />
      <div className="app-container-full">
        <header className="main-header-bar">
          <h1 className="header-title">EasyChain - Area Privata</h1>
          <ConnectButton 
            client={client}
            chain={polygon}
            accountAbstraction={{ chain: polygon, sponsorGas: true }}
          />
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default AziendaPage;
