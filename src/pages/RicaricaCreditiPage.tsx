import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "../App.css";

// --- Interfacce Dati ---
interface UserData {
  companyName: string;
  credits: number;
  status: string;
  email: string;
}

interface BillingDetails {
  type: 'azienda' | 'privato';
  ragioneSociale?: string;
  indirizzo?: string;
  pIvaCf?: string;
  sdiPec?: string;
  nome?: string;
  cognome?: string;
  cf?: string;
}

interface CreditPackage {
  id: string;
  credits: number;
  pricePerCredit: number;
  totalPrice: number;
  description: string;
}

// --- Setup ---
const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });

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
const stripePromise = loadStripe("pk_test_51RrJLQRx6E9RZt5ynBwc2dt3o7RT4YTwwij3O9xj3VdMwNKlI4GA9Yvbzkgwbxi0I5J9XnqPMlgY7bz2xHSgxmz000KCex9EiA");

// --- Stili ---
const RicaricaCreditiStyles = () => (
  <style>{`
    /* Stili base da AziendaPage */
    .app-container-full { padding: 1rem; min-height: 100vh; background-color: #0f0f0f; }
    .main-header-bar { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background-color: #1a1a1a; border-radius: 0.75rem; border: 1px solid #333; }
    .header-title { font-size: 1.5rem; font-weight: bold; color: #ffffff; text-align: center; }
    .centered-container { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 80vh; text-align: center; padding: 1rem; color: #fff; }
    .web3-button { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 1rem 1.5rem; border: none; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 0.9rem; width: 100%; text-align: center; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
    .web3-button:hover:not(:disabled) { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); }
    .web3-button:disabled { opacity: 0.6; cursor: not-allowed; }
    .web3-button.secondary { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3); }
    .web3-button.secondary:hover { background: linear-gradient(135deg, #4b5563 0%, #374151 100%); box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #f8f9fa; }
    .form-input { width: 100%; padding: 0.75rem; border: 1px solid #495057; border-radius: 0.5rem; background-color: #212529; color: #f8f9fa; font-size: 0.9rem; }
    .error-message { color: #ef4444; font-size: 0.8rem; margin-top: 0.25rem; }
    
    /* Stili specifici per la pagina di ricarica */
    .recharge-container { max-width: 800px; margin: 0 auto; color: #fff; }
    .user-info-card, .packages-card, .billing-card { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #333; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); }
    .user-info-card h2 { margin-top: 0; }
    .user-info-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
    .status-active-text { color: #10b981; }
    .status-inactive-text { color: #f59e0b; }

    .credit-packages-table { width: 100%; border-collapse: collapse; }
    .credit-packages-table th, .credit-packages-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #333; }
    .credit-packages-table tr { cursor: pointer; transition: background-color 0.2s ease; }
    .credit-packages-table tr:hover { background-color: #3a3a3a; }
    .credit-packages-table tr.selected { background-color: #3b82f6; }
    .credit-packages-table th { font-size: 0.9rem; color: #a0a0a0; }
    
    .billing-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .billing-header h3 { margin: 0; }
    .edit-button { background: none; border: none; color: #60a5fa; cursor: pointer; font-size: 0.9rem; }

    @media (min-width: 768px) {
      .main-header-bar { flex-direction: row; justify-content: space-between; align-items: center; padding: 1.5rem; }
      .header-title { text-align: left; }
      .user-info-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `}</style>
);

// --- Pacchetti Crediti ---
const creditPackages: CreditPackage[] = [
  { id: 'price_1', credits: 10, pricePerCredit: 0.20, totalPrice: 2.00, description: 'Pacchetto 10 crediti' },
  { id: 'price_2', credits: 50, pricePerCredit: 0.12, totalPrice: 6.00, description: 'Pacchetto 50 crediti' },
  { id: 'price_3', credits: 100, pricePerCredit: 0.10, totalPrice: 10.00, description: 'Pacchetto 100 crediti' },
  { id: 'price_4', credits: 500, pricePerCredit: 0.09, totalPrice: 45.00, description: 'Pacchetto 500 crediti' },
  { id: 'price_5', credits: 1000, pricePerCredit: 0.07, totalPrice: 70.00, description: 'Pacchetto 1000 crediti' },
];

// --- Componente Form di Fatturazione con Validazione ---
const BillingForm: React.FC<{ initialDetails?: BillingDetails | null, onSave: (details: BillingDetails) => void, isSaving: boolean }> = ({ initialDetails, onSave, isSaving }) => {
    const [type, setType] = useState<'azienda' | 'privato'>(initialDetails?.type || 'azienda');
    const [formData, setFormData] = useState(initialDetails || {});
    const [errors, setErrors] = useState<Partial<BillingDetails>>({});

    // Funzione di validazione
    const validate = () => {
        const newErrors: Partial<BillingDetails> = {};
        
        if (type === 'azienda') {
            if (!formData.ragioneSociale?.trim()) newErrors.ragioneSociale = "La denominazione sociale è obbligatoria.";
            if (!formData.indirizzo?.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio.";
            if (!formData.pIvaCf?.trim()) newErrors.pIvaCf = "La Partita IVA è obbligatoria.";
            else if (!/^[0-9]{11}$/.test(formData.pIvaCf)) newErrors.pIvaCf = "La Partita IVA deve contenere 11 cifre.";
            if (!formData.sdiPec?.trim()) newErrors.sdiPec = "Il codice SDI o la PEC sono obbligatori.";
            else if (!/^[a-zA-Z0-9]{7}$/.test(formData.sdiPec) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sdiPec)) {
                newErrors.sdiPec = "Inserisci un codice SDI (7 caratteri) o una PEC valida.";
            }
        } else { // Privato
            if (!formData.nome?.trim()) newErrors.nome = "Il nome è obbligatorio.";
            if (!formData.cognome?.trim()) newErrors.cognome = "Il cognome è obbligatorio.";
            if (!formData.indirizzo?.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio.";
            if (!formData.cf?.trim()) newErrors.cf = "Il codice fiscale è obbligatorio.";
            else if (!/^[A-Z0-9]{16}$/i.test(formData.cf)) newErrors.cf = "Il codice fiscale deve essere di 16 caratteri.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    const handleSave = () => {
      if (validate()) {
        // Pulisce i dati non pertinenti prima di salvare
        const detailsToSave: BillingDetails = { type };
        if (type === 'azienda') {
            detailsToSave.ragioneSociale = formData.ragioneSociale;
            detailsToSave.indirizzo = formData.indirizzo;
            detailsToSave.pIvaCf = formData.pIvaCf;
            detailsToSave.sdiPec = formData.sdiPec;
        } else {
            detailsToSave.nome = formData.nome;
            detailsToSave.cognome = formData.cognome;
            detailsToSave.indirizzo = formData.indirizzo;
            detailsToSave.cf = formData.cf;
        }
        onSave(detailsToSave);
      }
    };
  
    return (
      <div className="billing-form">
        <div className="form-group">
          <label>Tipo di account</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label><input type="radio" value="azienda" checked={type === 'azienda'} onChange={() => setType('azienda')} disabled={isSaving}/> Azienda</label>
            <label><input type="radio" value="privato" checked={type === 'privato'} onChange={() => setType('privato')} disabled={isSaving}/> Privato</label>
          </div>
        </div>
        
        {type === 'azienda' ? (
          <>
            <div className="form-group">
                <label>Denominazione Sociale</label>
                <input type="text" name="ragioneSociale" value={formData.ragioneSociale || ''} onChange={handleInputChange} className="form-input" disabled={isSaving}/>
                {errors.ragioneSociale && <p className="error-message">{errors.ragioneSociale}</p>}
            </div>
            <div className="form-group">
                <label>Indirizzo</label>
                <input type="text" name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} className="form-input" disabled={isSaving}/>
                {errors.indirizzo && <p className="error-message">{errors.indirizzo}</p>}
            </div>
            <div className="form-group">
                <label>Partita IVA</label>
                <input type="text" name="pIvaCf" value={formData.pIvaCf || ''} onChange={handleInputChange} className="form-input" disabled={isSaving}/>
                {errors.pIvaCf && <p className="error-message">{errors.pIvaCf}</p>}
            </div>
            <div className="form-group">
                <label>Codice Univoco (SDI) o PEC</label>
                <input type="text" name="sdiPec" value={formData.sdiPec || ''} onChange={handleInputChange} className="form-input" disabled={isSaving}/>
                {errors.sdiPec && <p className="error-message">{errors.sdiPec}</p>}
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
                <label>Nome</label>
                <input type="text" name="nome" value={formData.nome || ''} onChange={handleInputChange} className="form-input" disabled={isSaving}/>
                {errors.nome && <p className="error-message">{errors.nome}</p>}
            </div>
            <div className="form-group">
                <label>Cognome</label>
                <input type="text" name="cognome" value={formData.cognome || ''} onChange={handleInputChange} className="form-input" disabled={isSaving}/>
                {errors.cognome && <p className="error-message">{errors.cognome}</p>}
            </div>
            <div className="form-group">
                <label>Indirizzo</label>
                <input type="text" name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} className="form-input" disabled={isSaving}/>
                {errors.indirizzo && <p className="error-message">{errors.indirizzo}</p>}
            </div>
            <div className="form-group">
                <label>Codice Fiscale</label>
                <input type="text" name="cf" value={formData.cf || ''} onChange={handleInputChange} className="form-input" disabled={isSaving}/>
                {errors.cf && <p className="error-message">{errors.cf}</p>}
            </div>
          </>
        )}
        <button onClick={handleSave} className="web3-button" style={{ marginTop: '1rem' }} disabled={isSaving}>
            {isSaving ? 'Salvataggio...' : 'Salva Dati'}
        </button>
      </div>
    );
  };

// --- Componente Checkout Stripe ---
const StripeCheckoutForm: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setIsProcessing(true);
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/pagamento-successo` },
      });
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Errore sconosciuto.");
      } else {
        setMessage("Un errore inaspettato è occorso.");
      }
      setIsProcessing(false);
    };
  
    return (
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        <button disabled={isProcessing || !stripe || !elements} id="submit" className="web3-button" style={{ width: '100%', marginTop: '2rem' }}>
          <span>{isProcessing ? "Pagamento in corso..." : "Paga ora"}</span>
        </button>
        {message && <div style={{ color: 'red', marginTop: '1rem' }}>{message}</div>}
      </form>
    );
};

// --- Componente Principale Pagina ---
const RicaricaCreditiPage: React.FC = () => {
  const account = useActiveAccount();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!account) {
      setLoading(false);
      setUserData(null);
      setBillingDetails(null);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
        if (!response.ok) {
          throw new Error('Azienda non trovata o errore nel recupero dati.');
        }
        const data = await response.json();

        if (data.isActive) {
          setUserData({
            companyName: data.companyName,
            credits: data.credits,
            status: data.status,
            email: data.contactEmail, // Corretto per leggere 'contactEmail' da Firebase
          });

          if (data.billingDetails && Object.keys(data.billingDetails).length > 0) {
            setBillingDetails(data.billingDetails);
            setIsEditingBilling(false);
          } else {
            setBillingDetails(null);
            setIsEditingBilling(true);
          }
        } else {
            throw new Error('Il tuo account non risulta attivo.');
        }

      } catch (err: any) {
        setError(err.message || "Impossibile caricare i dati dell'utente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [account]);
  
  const handleSelectPackage = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setClientSecret(null);

    if (!billingDetails) {
        setIsEditingBilling(true);
        return;
    }

    try {
        const response = await fetch(`/api/send-email?action=create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: pkg.totalPrice * 100,
                walletAddress: account?.address
            }),
        });
        
        if (!response.ok) throw new Error(`Errore dal server: ${response.statusText}`);
        const data = await response.json();
        setClientSecret(data.clientSecret);
    } catch (error) {
        console.error("Errore nella creazione del Payment Intent:", error);
        setError("Non è stato possibile avviare il pagamento. Riprova.");
    }
  };

  const handleSaveBilling = async (details: BillingDetails) => {
    if (!account) return;
    setIsSaving(true);
    setError(null);

    try {
        const response = await fetch('/api/send-email?action=save-billing-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress: account.address,
                details: details
            })
        });

        if (!response.ok) {
            throw new Error('Salvataggio dei dati di fatturazione fallito.');
        }

        setBillingDetails(details);
        setIsEditingBilling(false);

        if (selectedPackage) {
            await handleSelectPackage(selectedPackage);
        }

    } catch(err: any) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="centered-container"><p>Caricamento dati utente...</p></div>;
    if (error) return <div className="centered-container"><p style={{ color: "red" }}>{error}</p></div>;
    if (!userData) return <div className="centered-container"><p>Nessun dato utente trovato per questo wallet.</p></div>;

    return (
      <div className="recharge-container">
        <div className="user-info-card">
          <h2>Riepilogo Account</h2>
          <div className="user-info-grid">
            <p><strong>Nome Azienda:</strong> {userData.companyName}</p>
            <p><strong>Email di Iscrizione:</strong> {userData.email}</p>
            <p><strong>Crediti Rimanenti:</strong> {userData.credits}</p>
            <p><strong>Stato:</strong> <strong className={userData.status === 'active' ? 'status-active-text' : 'status-inactive-text'}>
              {userData.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}
            </strong></p>
          </div>
        </div>

        <div className="packages-card">
          <h2>Seleziona un Pacchetto Crediti</h2>
          <table className="credit-packages-table">
            <thead>
              <tr><th>Pacchetto</th><th>Prezzo per credito</th><th>Prezzo totale (€)</th></tr>
            </thead>
            <tbody>
              {creditPackages.map(pkg => (
                <tr key={pkg.id} onClick={() => handleSelectPackage(pkg)} className={selectedPackage?.id === pkg.id ? 'selected' : ''}>
                  <td><strong>{pkg.credits} crediti</strong></td>
                  <td>{pkg.pricePerCredit.toFixed(2)} €</td>
                  <td><strong>{pkg.totalPrice.toFixed(2)} €</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPackage && (
          <div className="billing-card">
            {billingDetails && !isEditingBilling ? (
              <div>
                <div className="billing-header">
                  <h3>Dati di Fatturazione</h3>
                  <button className="edit-button" onClick={() => setIsEditingBilling(true)}>✏️ Modifica</button>
                </div>
                {billingDetails.type === 'azienda' ? (
                  <>
                    <p><strong>Ragione Sociale:</strong> {billingDetails.ragioneSociale}</p>
                    <p><strong>Indirizzo:</strong> {billingDetails.indirizzo}</p>
                    <p><strong>P.IVA/CF:</strong> {billingDetails.pIvaCf}</p>
                    <p><strong>SDI/PEC:</strong> {billingDetails.sdiPec}</p>
                  </>
                ) : (
                   <>
                    <p><strong>Nome:</strong> {billingDetails.nome} {billingDetails.cognome}</p>
                    <p><strong>Indirizzo:</strong> {billingDetails.indirizzo}</p>
                    <p><strong>Codice Fiscale:</strong> {billingDetails.cf}</p>
                  </>
                )}
              </div>
            ) : (
              <div>
                <h3>{billingDetails ? 'Modifica Dati di Fatturazione' : 'Inserisci i Dati di Fatturazione'}</h3>
                <BillingForm initialDetails={billingDetails} onSave={handleSaveBilling} isSaving={isSaving} />
              </div>
            )}
            
            {!isEditingBilling && clientSecret && (
                <div style={{marginTop: '2rem'}}>
                    <h3 style={{borderTop: '1px solid #444', paddingTop: '2rem'}}>Procedi con il Pagamento</h3>
                     <Elements options={{ clientSecret }} stripe={stripePromise}>
                        <StripeCheckoutForm />
                    </Elements>
                </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <RicaricaCreditiStyles />
      <div className="app-container-full">
        <header className="main-header-bar">
          <h1 className="header-title">EasyChain - Ricarica Crediti</h1>
          <ConnectButton
            client={client}
            wallets={wallets}
            chain={polygon}
            accountAbstraction={{ chain: polygon, sponsorGas: true }}
          />
        </header>
        <main>
          {!account ? (
            <div className="centered-container">
              <h1>Connetti il Wallet</h1>
              <p>Per ricaricare i crediti, connetti il tuo wallet.</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </>
  );
};

export default RicaricaCreditiPage;
