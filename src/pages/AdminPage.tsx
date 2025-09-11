// FILE: src/pages/AdminPage.tsx
// VERSIONE AGGIORNATA CON LAYOUT MOBILE RESPONSIVE

import React, { useState, useEffect, useCallback } from "react";
import { ConnectButton, TransactionButton, useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import { createThirdwebClient, getContract, readContract, prepareContractCall } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { supplyChainABI as abi } from "../abi/contractABI";
import "../App.css";

// --- Stili AdminPage con design moderno come AziendaPage ---
const AdminPageStyles = () => (
  <style>{`
    /* Base styles matching AziendaPage */
    .admin-container {
      padding: 1rem;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
    }

    .admin-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1.5rem;
      background: rgba(26, 26, 26, 0.8);
      backdrop-filter: blur(20px);
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .admin-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #ffffff;
      text-align: center;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .admin-content {
      background: rgba(26, 26, 26, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .filters-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: rgba(26, 26, 26, 0.6);
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .filter-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #e5e7eb;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.75rem;
      color: #ffffff;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .companies-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

    .company-card {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border-radius: 1rem;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .company-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
      border-color: #6366f1;
    }

    .company-header {
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .company-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .company-info {
      flex: 1;
      margin-bottom: 1rem;
    }

    .company-info p {
      margin: 0.5rem 0;
      color: #d1d5db;
      font-size: 0.9rem;
    }

    .company-info strong {
      color: #ffffff;
      font-weight: 600;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .status-deactivated {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .company-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .action-button {
      flex: 1;
      min-width: 100px;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .btn-success:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
    }

    .btn-secondary:hover {
      background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
    }

    /* Tablet styles */
    @media (min-width: 768px) {
      .admin-container {
        padding: 2rem;
      }
      
      .admin-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 2rem;
      }
      
      .admin-title {
        text-align: left;
        font-size: 1.75rem;
      }
      
      .companies-grid {
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 2rem;
      }
    }

    /* Desktop styles */
    @media (min-width: 1024px) {
      .admin-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }
    }

    /* Animations */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
);


// Definizione del tipo per un'azienda per una migliore gestione
type Company = {
  id: string;
  companyName: string;
  walletAddress: `0x${string}`;
  status: 'active' | 'pending' | 'deactivated';
  credits?: number;
  contactEmail?: string;
};

// Configurazione del Client e del Contratto
const client = createThirdwebClient({ 
  clientId: "023dd6504a82409b2bc7cb971fd35b16"
});

// Configurazione wallet con opzioni social multiple
const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "email",
        "x",
        "twitch",
        "facebook",
        "apple",
        "tiktok",
      ],
    },
  }),
];

const contract = getContract({ 
  client, 
  chain: polygon,
  address: "0x0c5e6204e80e6fb3c0c7098c4fa84b2210358d0b"
});


// --- Componente Modale per la Modifica (Invariato) ---
const EditCompanyModal = ({ company, onClose, onUpdate }: { company: Company, onClose: () => void, onUpdate: () => void }) => {
  const [credits, setCredits] = useState(company.credits || 0);
  const [newName, setNewName] = useState(company.companyName);

  const updateOffChainStatus = async (action: string, customData: Partial<Company> = {}) => {
    try {
      const bodyPayload = {
        action,
        walletAddress: company.walletAddress,
        credits: parseInt(String(credits)),
        companyName: newName,
        ...customData,
      };
      await fetch('/api/activate-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      onUpdate();
    } catch (error) {
      alert(`Errore nell'aggiornare il database: ${(error as Error).message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Sei sicuro di voler eliminare definitivamente ${company.companyName} dalla lista?`)) return;
    try {
      await fetch('/api/delete-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: company.walletAddress, status: company.status }),
      });
      alert("Azienda eliminata dalla lista.");
      onUpdate();
      onClose();
    } catch (error) {
       alert(`Errore: ${(error as Error).message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Gestisci: {company.companyName}</h2>
        <p><strong>Wallet:</strong> <span style={{wordBreak: 'break-all'}}>{company.walletAddress}</span></p>
        <hr style={{margin: '1.5rem 0', borderColor: '#27272a'}}/>
        <div className="form-group">
          <label>Azioni Stato Contributor</label>
          <div className="modal-actions">
            {company.status === 'pending' && (
              <TransactionButton transaction={() => prepareContractCall({ contract, abi, method: "function addContributor(address, string)", params: [company.walletAddress, newName] })} onTransactionConfirmed={() => { alert("Azienda attivata on-chain!"); updateOffChainStatus('activate'); onClose(); }} onError={(error) => alert(`Errore: ${error.message}`)} className="web3-button">✅ Attiva Contributor</TransactionButton>
            )}
            {company.status === 'active' && (
              <TransactionButton transaction={() => prepareContractCall({ contract, abi, method: "function deactivateContributor(address)", params: [company.walletAddress] })} onTransactionConfirmed={() => { alert("Azienda disattivata on-chain!"); updateOffChainStatus('deactivate'); }} onError={(error) => alert(`Errore: ${error.message}`)} className="web3-button" style={{backgroundColor: '#f59e0b'}}>❌ Disattiva Contributor</TransactionButton>
            )}
            {company.status === 'deactivated' && (
              <TransactionButton transaction={() => prepareContractCall({ contract, abi, method: "function addContributor(address, string)", params: [company.walletAddress, newName] })} onTransactionConfirmed={() => { alert("Azienda riattivata on-chain!"); updateOffChainStatus('reactivate'); }} onError={(error) => alert(`Errore: ${error.message}`)} className="web3-button">✅ Riattiva Contributor</TransactionButton>
            )}
          </div>
        </div>
        <div className="form-group" style={{marginTop: '1.5rem'}}>
          <label>Gestione Crediti</label>
          <p>Crediti disponibili: <strong>{company.status === 'pending' ? 0 : company.credits ?? 'N/D'}</strong></p>
          <input type="number" placeholder="Imposta nuovi crediti" value={credits} onChange={(e) => setCredits(Number(e.target.value))} className="form-input" style={{marginTop: '0.5rem'}} />
          <TransactionButton transaction={() => prepareContractCall({ contract, abi, method: "function setContributorCredits(address, uint256)", params: [company.walletAddress, BigInt(credits)] })} onTransactionConfirmed={() => { alert("Crediti impostati on-chain!"); updateOffChainStatus('setCredits'); }} onError={(error) => alert(`Errore: ${error.message}`)} className="web3-button" style={{marginTop: '0.5rem', width: '100%'}} disabled={company.status === 'pending'}>Aggiorna Crediti</TransactionButton>
        </div>
        <div className="form-group" style={{marginTop: '1.5rem'}}>
            <label>Cambia Nome Azienda</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="form-input" placeholder="Nuovo nome azienda" />
            <TransactionButton transaction={() => prepareContractCall({ contract, abi, method: "function addContributor(address, string)", params: [company.walletAddress, newName] })} onTransactionConfirmed={() => { alert("Nome azienda aggiornato on-chain!"); updateOffChainStatus('changeName', { companyName: newName }); }} onError={(error) => alert(`Errore: ${error.message}`)} className="web3-button" style={{marginTop: '0.5rem', width: '100%'}} disabled={!newName.trim() || newName === company.companyName}>Cambia Nome</TransactionButton>
        </div>
        {(company.status === 'pending' || company.status === 'deactivated') && (
          <div style={{marginTop: '1.5rem', borderTop: '1px solid #27272a', paddingTop: '1.5rem'}}>
              <button onClick={handleDelete} className="web3-button" style={{backgroundColor: '#ef4444', width: '100%'}}>Elimina Definitivamente</button>
          </div>
        )}
        <button onClick={onClose} style={{marginTop: '2rem', background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer'}}>Chiudi</button>
      </div>
    </div>
  );
};


// --- Componente per la Lista delle Aziende (MODIFICATO PER RESPONSIVE) ---
const CompanyList = () => {
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const fetchCompanies = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/get-pending-companies');
            if (!response.ok) { throw new Error(`Errore HTTP: ${response.status}`); }
            const data = await response.json();
            const pending = (data.pending || []).map((p: any) => ({ ...p, status: 'pending', id: p.walletAddress }));
            const active = (data.active || []).map((a: any) => ({ ...a, status: a.status || 'active', id: a.walletAddress }));
            setAllCompanies([...pending, ...active]);
        } catch (err: any) { setError(`Impossibile caricare i dati: ${err.message}`); }
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

    useEffect(() => {
        let companies = [...allCompanies];
        if (filterStatus !== "all") { companies = companies.filter(c => c.status === filterStatus); }
        if (searchTerm) { companies = companies.filter(c => c.companyName.toLowerCase().includes(searchTerm.toLowerCase())); }
        setFilteredCompanies(companies);
    }, [searchTerm, filterStatus, allCompanies]);

    const getStatusIcon = (status: Company['status']) => {
        if (status === 'active') return '✅';
        if (status === 'pending') return '⏳';
        return '❌';
    }

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="filters-container">
                <div className="filter-group">
                    <label className="filter-label">Cerca Azienda</label>
                    <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Nome azienda..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Stato</label>
                    <select className="form-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tutti gli stati</option>
                        <option value="active">Attivate</option>
                        <option value="pending">In Pending</option>
                        <option value="deactivated">Disattivate</option>
                    </select>
                </div>
            </div>
            
            {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
            
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#d1d5db' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #333', 
                        borderTop: '4px solid #6366f1', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite', 
                        margin: '0 auto 1rem' 
                    }}></div>
                    <p>Caricamento aziende...</p>
                </div>
            ) : filteredCompanies.length > 0 ? (
                <div className="companies-grid">
                    {filteredCompanies.map(company => (
                        <div key={company.id} className="company-card">
                            <div className="company-header">
                                <h3 className="company-name">{company.companyName}</h3>
                                <span className={`status-badge status-${company.status}`}>
                                    {company.status === 'active' ? 'Attiva' : 
                                     company.status === 'pending' ? 'In Attesa' : 'Disattivata'}
                                </span>
                            </div>
                            
                            <div className="company-info">
                                <p><strong>📧 Email:</strong> {company.contactEmail || "Non fornita"}</p>
                                <p><strong>👛 Wallet:</strong> {company.walletAddress.substring(0, 6)}...{company.walletAddress.substring(38)}</p>
                                <p><strong>💰 Crediti:</strong> {company.credits || 0}</p>
                            </div>
                            
                            <div className="company-actions">
                                <button 
                                    onClick={() => setSelectedCompany(company)} 
                                    className="action-button btn-primary"
                                >
                                    Gestisci
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: '#d1d5db',
                    background: 'rgba(26, 26, 26, 0.6)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nessuna azienda trovata</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Prova a modificare i filtri di ricerca</p>
                </div>
            )}
            
            {selectedCompany && <EditCompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} onUpdate={fetchCompanies} />}
        </div>
    );
};


// --- Componente Principale della Pagina Admin (Completo) ---
const AdminContent = () => {
    const account = useActiveAccount();
    const [isAllowed, setIsAllowed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPermissions = async () => {
            if (account) {
                setIsLoading(true);
                try {
                    const [superOwner, owner] = await Promise.all([
                        readContract({ contract, abi, method: "function superOwner() view returns (address)" }),
                        readContract({ contract, abi, method: "function owner() view returns (address)" })
                    ]);
                    const isAdmin = account.address.toLowerCase() === superOwner.toLowerCase() || (owner && account.address.toLowerCase() === owner.toLowerCase());
                    setIsAllowed(isAdmin);
                } catch (e) { setIsAllowed(false); }
                finally { setIsLoading(false); }
            } else {
                setIsLoading(false);
                setIsAllowed(false);
            }
        };
        checkPermissions();
    }, [account]);

    if (!account) { return <p style={{textAlign: 'center', marginTop: '2rem'}}>Connetti il tuo wallet da amministratore per accedere.</p>; }
    if (isLoading) { return <p style={{textAlign: 'center', marginTop: '2rem'}}>Verifica permessi in corso...</p>; }
    return isAllowed ? <div><h3>Benvenuto, SFY Labs!</h3><CompanyList /></div> : <h2 style={{ color: '#ef4444', fontSize: '2rem', marginTop: '4rem' }}>❌ ACCESSO NEGATO</h2>;
};


export default function AdminPage() {
  const account = useActiveAccount();
  const navigate = useNavigate();

  // Effect per gestire il disconnect e reindirizzare alla homepage
  useEffect(() => {
    if (!account) {
      navigate('/');
      return;
    }
  }, [account, navigate]);

  return (
    <>
      <AdminPageStyles />
      <div className="admin-container">
        <header className="admin-header">
          <h1 className="admin-title">Sistema di Gestione Aziendale</h1>
          <ConnectButton client={client} wallets={wallets} chain={polygon} />
        </header>
        <main className="admin-content">
          <AdminContent />
        </main>
      </div>
    </>
  );
}
