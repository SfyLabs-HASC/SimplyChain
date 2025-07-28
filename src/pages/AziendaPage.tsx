// FILE: src/pages/AziendaPage.tsx
// DESCRIZIONE: Versione aggiornata che verifica lo stato dell'utente tramite
// un endpoint API che interroga Firebase, invece di chiamare direttamente lo smart contract.

import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import "../App.css";

// Importa i componenti esterni
import RegistrationForm from "../components/RegistrationForm";

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
      
      .dashboard-title { 
        font-size: 1.25rem; 
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 0.5rem;
      }
      
      .dashboard-credits {
        color: #a0a0a0;
        font-size: 0.9rem;
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
      
      .batches-section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 1rem;
        padding-left: 0.5rem;
      }
      
      .batches-grid { 
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .batch-card { 
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        border-radius: 1rem; 
        padding: 1.5rem; 
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        transition: all 0.3s ease;
      }
      
      .batch-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        border-color: #3b82f6;
      }
      
      .batch-card h3 { 
        font-size: 1.1rem; 
        font-weight: 600; 
        color: #ffffff; 
        margin: 0 0 1rem 0;
        border-bottom: 1px solid #333; 
        padding-bottom: 0.75rem;
        word-wrap: break-word; 
      }
      
      .batch-card p { 
        margin: 0.75rem 0; 
        color: #a0a0a0; 
        font-size: 0.85rem; 
        line-height: 1.5;
        word-wrap: break-word; 
      }
      
      .batch-card strong { 
        color: #ffffff; 
        font-weight: 600;
      }
      
      .batch-card a { 
        color: #60a5fa; 
        text-decoration: none; 
        font-weight: 500;
        transition: color 0.2s ease;
      }
      
      .batch-card a:hover {
        color: #3b82f6;
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
          align-items: center;
          padding: 2rem;
        }
        
        .dashboard-title { 
          font-size: 1.5rem;
        }
        
        .web3-button {
          width: auto;
          min-width: 200px;
        }
        
        .batches-grid { 
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .batch-card h3 { 
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
        
        .batches-grid { 
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }
        
        .batch-card { 
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

// Interfacce per i dati
interface Step { stepIndex: string; eventName: string; description: string; date: string; location: string; attachmentsIpfsHash: string; }
interface Batch { batchId: string; name: string; description: string; date: string; location: string; imageIpfsHash: string; isClosed: boolean; transactionHash: string; steps: Step[]; }
interface CompanyData { companyName: string; credits: number; }

const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });

// Componente per la Dashboard
const Dashboard: React.FC<{ companyData: CompanyData }> = ({ companyData }) => {
  const account = useActiveAccount();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [errorBatches, setErrorBatches] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!account) return;
    const loadBatches = async () => {
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
        setBatches(readyBatches.sort((a, b) => parseInt(b.batchId) - parseInt(a.batchId)));
      } catch (error: any) {
        setErrorBatches(error.message || "Errore sconosciuto.");
      } finally {
        setIsLoadingBatches(false);
      }
    };
    loadBatches();
  }, [account]);

  return (
    <>
      <div className="dashboard-header-card">
        <div>
            <h2 className="dashboard-title">{companyData.companyName}</h2>
            <p className="dashboard-credits">Crediti Rimanenti: <strong>{companyData.credits}</strong></p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="web3-button">+ Inizializza Nuovo Lotto</button>
      </div>
      <h3 className="batches-section-title">I Miei Lotti Inizializzati</h3>
      {isLoadingBatches ? (
        <div className="loading-error-container"><p>Caricamento dei tuoi lotti...</p></div>
      ) : errorBatches ? (
        <div className="loading-error-container"><p style={{ color: 'red' }}>{errorBatches}</p></div>
      ) : (
        <div className="batches-grid">
          {batches.length > 0 ? (
            batches.map((batch) => (
              <div key={batch.batchId} className="batch-card">
                <h3>Lotto #{batch.batchId} - {batch.name}</h3>
                <p><strong>Descrizione:</strong> {truncateText(batch.description, 100)}</p>
                <p><strong>Data:</strong> {batch.date} | <strong>Luogo:</strong> {batch.location}</p>
                <p><strong>Stato:</strong> {batch.isClosed ? 'Chiuso' : 'Aperto'}</p>
                <p><strong>Tx Hash:</strong> <a href={`https://polygonscan.com/tx/${batch.transactionHash}`} target="_blank" rel="noopener noreferrer">{truncateText(batch.transactionHash, 15)}</a></p>
                {batch.steps && batch.steps.length > 0 && (
                  <div className="steps-container">
                    <h4>Steps:</h4>
                    {batch.steps.map(step => (
                      <div key={step.stepIndex} className="step-item">
                         <p><strong>{step.eventName}</strong> (Step #{step.stepIndex})</p>
                         <p>Desc: {truncateText(step.description, 50)}</p>
                         <p>Data: {step.date} | Luogo: {step.location}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Non hai ancora inizializzato nessun lotto con questo account.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                Clicca su "Inizializza Nuovo Lotto" per iniziare
              </p>
            </div>
          )}
        </div>
      )}
      {/* Qui andrà la logica del modale per creare un nuovo lotto */}
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
          data: data.isActive ? { companyName: data.companyName, credits: data.credits } : null,
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
          <ConnectButton client={client} wallets={[inAppWallet()]} />
        </div>
      </div>
    );
  }

  return (
    <>
      <AziendaPageStyles />
      <div className="app-container-full">
        <header className="main-header-bar">
          <h1 className="header-title">FoodChain</h1>
          <ConnectButton client={client} />
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default AziendaPage;
