import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Effect per gestire il disconnect e reindirizzare alla homepage
  useEffect(() => {
    // Solo reindirizza se l'account diventa null DOPO essere stato presente
    // Evita redirect se l'utente accede direttamente alla pagina senza wallet
    if (!account && userData !== null) {
      navigate('/');
      return;
    }
  }, [account, navigate, userData]);

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
        console.log('Fetching company data for wallet:', account.address);
        const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
        console.log('Response status:', response.status, 'ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Azienda non trovata o errore nel recupero dati: ${response.status}`);
        }
        const data = await response.json();
        console.log('Firebase data received:', data);

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
      <div className="space-y-6">
        {/* Account Summary Card */}
        <div className="glass-card rounded-2xl p-6 tech-shadow">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            👤 Riepilogo Account
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">Nome Azienda:</span>
              <p className="text-white font-semibold">{userData.companyName}</p>
            </div>
            <div>
              <span className="text-gray-400">Email di Iscrizione:</span>
              <p className="text-white">{userData.email}</p>
            </div>
            <div>
              <span className="text-gray-400">Crediti Rimanenti:</span>
              <p className="text-white font-bold text-xl">{userData.credits}</p>
            </div>
            <div>
              <span className="text-gray-400">Stato Account:</span>
              <p className={userData.status === 'active' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                {userData.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}
              </p>
            </div>
          </div>
        </div>

        {/* Credit Packages Card */}
        <div className="glass-card rounded-2xl p-6 tech-shadow">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            💎 Seleziona un Pacchetto Crediti
          </h2>
          
          <div className="grid gap-4">
            {creditPackages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                  selectedPackage?.id === pkg.id
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {pkg.credits} Crediti
                    </h3>
                    <p className="text-gray-400">
                      {pkg.pricePerCredit.toFixed(2)} € per credito
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {pkg.totalPrice.toFixed(2)} €
                    </p>
                    <p className="text-sm text-gray-400">
                      {pkg.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedPackage && (
          <div className="glass-card rounded-2xl p-6 tech-shadow">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              🧾 Dati di Fatturazione
            </h2>
            
            {billingDetails && !isEditingBilling ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Dati Salvati</h3>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition text-sm"
                    onClick={() => setIsEditingBilling(true)}
                  >
                    ✏️ Modifica
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {billingDetails.type === 'azienda' ? (
                    <>
                      <div>
                        <span className="text-gray-400">Ragione Sociale:</span>
                        <p className="text-white font-semibold">{billingDetails.ragioneSociale}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">P.IVA/CF:</span>
                        <p className="text-white">{billingDetails.pIvaCf}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-400">Indirizzo:</span>
                        <p className="text-white">{billingDetails.indirizzo}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">SDI/PEC:</span>
                        <p className="text-white">{billingDetails.sdiPec}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-400">Nome:</span>
                        <p className="text-white font-semibold">{billingDetails.nome} {billingDetails.cognome}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Codice Fiscale:</span>
                        <p className="text-white">{billingDetails.cf}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-400">Indirizzo:</span>
                        <p className="text-white">{billingDetails.indirizzo}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {billingDetails ? 'Modifica Dati di Fatturazione' : 'Inserisci i Dati di Fatturazione'}
                </h3>
                <BillingForm initialDetails={billingDetails} onSave={handleSaveBilling} isSaving={isSaving} />
              </div>
            )}
            
            {!isEditingBilling && clientSecret && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  💳 Procedi con il Pagamento
                </h3>
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

  if (!account) {
    return (
      <>
        <RicaricaCreditiStyles />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 text-center max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">🔗 Connetti Wallet</h1>
            <p className="text-gray-300 mb-6">Per ricaricare i crediti, connetti il tuo wallet.</p>
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={polygon}
              accountAbstraction={{ chain: polygon, sponsorGas: true }}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RicaricaCreditiStyles />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        
        {/* Header Bar - Uguale alle altre pagine */}
        <div className="glass-card rounded-3xl p-6 tech-shadow flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                💳 Ricarica Crediti
              </h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex flex-col md:flex-row gap-4 items-center-item">
                <span style={{ color: '#ffffff' }}>
                  Crediti Attuali: <strong>{userData?.credits || 0}</strong>
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center-item">
                <span>Stato: <strong className={userData?.status === 'active' ? 'status-active-text' : 'status-inactive-text'}>
                  {userData?.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}
                </strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={polygon}
              accountAbstraction={{ chain: polygon, sponsorGas: true }}
            />
            <button
              onClick={() => navigate('/azienda')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition"
            >
              ← Torna Indietro
            </button>
          </div>
        </div>

        {/* Content */}
        <main>
          {loading ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-300">Caricamento dati utente...</p>
            </div>
          ) : error ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-300 mb-2">Errore</h3>
              <p className="text-red-200">{error}</p>
            </div>
          ) : !userData ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-yellow-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">Nessun Dato</h3>
              <p className="text-yellow-200">Nessun dato utente trovato per questo wallet.</p>
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
