// RicaricaCreditiPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { client } from "../client";

// --- Data Interfaces ---
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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51PTestKeyEXAMPLE...");

const creditPackages: CreditPackage[] = [
  { id: 'price_1', credits: 10, pricePerCredit: 0.20, totalPrice: 2.00, description: 'Pacchetto 10 crediti' },
  { id: 'price_2', credits: 50, pricePerCredit: 0.12, totalPrice: 6.00, description: 'Pacchetto 50 crediti' },
  { id: 'price_3', credits: 100, pricePerCredit: 0.10, totalPrice: 10.00, description: 'Pacchetto 100 crediti' },
  { id: 'price_4', credits: 500, pricePerCredit: 0.09, totalPrice: 45.00, description: 'Pacchetto 500 crediti' },
  { id: 'price_5', credits: 1000, pricePerCredit: 0.07, totalPrice: 70.00, description: 'Pacchetto 1000 crediti' },
];

// --- Billing Form Component ---
const BillingForm: React.FC<{ initialDetails?: BillingDetails | null; onSave: (details: BillingDetails) => void; isSaving: boolean; }> = ({ initialDetails, onSave, isSaving }) => {
  const [type, setType] = useState<'azienda' | 'privato'>(initialDetails?.type || 'azienda');
  const [formData, setFormData] = useState<Partial<BillingDetails>>(initialDetails || {});
  const [errors, setErrors] = useState<Partial<Record<keyof BillingDetails, string>>>({});

  useEffect(() => {
    if (initialDetails) {
      setType(initialDetails.type);
      setFormData(initialDetails);
    }
  }, [initialDetails]);

  const validate = () => {
    const newErrors: Partial<Record<keyof BillingDetails, string>> = {};
    if (type === 'azienda') {
      if (!formData.ragioneSociale?.trim()) newErrors.ragioneSociale = "La denominazione sociale è obbligatoria.";
      if (!formData.indirizzo?.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio.";
      const cleanedPiva = formData.pIvaCf?.replace(/\D/g, '') || '';
      if (!cleanedPiva || !/^\d{11}$/.test(cleanedPiva)) newErrors.pIvaCf = "La Partita IVA deve contenere 11 cifre.";
      if (!formData.sdiPec?.trim()) newErrors.sdiPec = "Il codice SDI o la PEC sono obbligatori.";
    } else {
      if (!formData.nome?.trim()) newErrors.nome = "Il nome è obbligatorio.";
      if (!formData.cognome?.trim()) newErrors.cognome = "Il cognome è obbligatorio.";
      if (!formData.indirizzo?.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio.";
      const cfVal = formData.cf?.trim().toUpperCase() || '';
      if (!cfVal || !/^[A-Z0-9]{16}$/.test(cfVal)) newErrors.cf = "Il codice fiscale non è valido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (validate()) {
      const detailsToSave: BillingDetails = type === 'azienda'
        ? {
          type,
          ragioneSociale: formData.ragioneSociale || '',
          indirizzo: formData.indirizzo || '',
          pIvaCf: formData.pIvaCf?.replace(/\D/g, '') || '',
          sdiPec: formData.sdiPec || ''
        }
        : {
          type,
          nome: formData.nome || '',
          cognome: formData.cognome || '',
          indirizzo: formData.indirizzo || '',
          cf: formData.cf?.trim().toUpperCase() || '',
        };
      onSave(detailsToSave);
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" value="azienda" checked={type === 'azienda'} onChange={() => setType('azienda')} disabled={isSaving} /> Azienda
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="privato" checked={type === 'privato'} onChange={() => setType('privato')} disabled={isSaving} /> Privato
        </label>
      </div>

      {type === 'azienda' ? (
        <>
          {/* Ragione Sociale */}
          <div className="mb-4">
            <label className="block mb-2">Denominazione Sociale</label>
            <input name="ragioneSociale" value={formData.ragioneSociale || ''} onChange={handleInputChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-md" />
            {errors.ragioneSociale && <p className="text-destructive text-sm mt-1">{errors.ragioneSociale}</p>}
          </div>
          {/* Indirizzo */}
          <div className="mb-4">
            <label className="block mb-2">Indirizzo</label>
            <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-md" />
            {errors.indirizzo && <p className="text-destructive text-sm mt-1">{errors.indirizzo}</p>}
          </div>
          {/* P.IVA */}
          <div className="mb-4">
            <label className="block mb-2">Partita IVA</label>
            <input name="pIvaCf" value={formData.pIvaCf || ''} onChange={handleInputChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-md" />
            {errors.pIvaCf && <p className="text-destructive text-sm mt-1">{errors.pIvaCf}</p>}
          </div>
          {/* SDI/PEC */}
          <div className="mb-4">
            <label className="block mb-2">Codice Univoco (SDI) o PEC</label>
            <input name="sdiPec" value={formData.sdiPec || ''} onChange={handleInputChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-md" />
            {errors.sdiPec && <p className="text-destructive text-sm mt-1">{errors.sdiPec}</p>}
          </div>
        </>
      ) : (
        <>
          {/* Nome */}
          <div className="mb-4">
            <label className="block mb-2">Nome</label>
            <input name="nome" value={formData.nome || ''} onChange={handleInputChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-md" />
            {errors.nome && <p className="text-destructive text-sm mt-1">{errors.nome}</p>}
          </div>
          {/* Cognome */}
          <div className="mb-4">
            <label className="block mb-2">Cognome</label>
            <input name="cognome" value={formData.cognome || ''} onChange={handleInputChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-md" />
            {errors.cognome && <p className="text-destructive text-sm mt-1">{errors.cognome}</p>}
          </div>
          {/* Indirizzo */}
          <div className="mb-4">
            <label className="block mb-2">Indirizzo</label>
            <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-md" />
            {errors.indirizzo && <p className="text-destructive text-sm mt-1">{errors.indirizzo}</p>}
          </div>
          {/* CF */}
          <div className="mb-4">
            <label className="block mb-2">Codice Fiscale</label>
            <input name="cf" value={formData.cf || ''} onChange={handleInputChange} disabled={isSaving} className="w-full px-3 py-2 border rounded-md" />
            {errors.cf && <p className="text-destructive text-sm mt-1">{errors.cf}</p>}
          </div>
        </>
      )}

      <button onClick={handleSave} disabled={isSaving} className="w-full py-2 rounded-2xl font-semibold bg-blue-600 text-white hover:scale-105 transition-all mt-4">
        {isSaving ? 'Salvataggio...' : 'Salva Dati di Fatturazione'}
      </button>
    </div>
  );
};

// --- Stripe Checkout Form Component ---
const StripeCheckoutForm: React.FC<{ onPaymentSuccess: () => void }> = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Errore sconosciuto durante il pagamento.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'requires_action') {
      setMessage("Autenticazione richiesta dal tuo istituto bancario. Completa l'autenticazione per procedere.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onPaymentSuccess();
    } else {
      setMessage("Pagamento non riuscito. Riprova.");
      setIsProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isProcessing || !stripe || !elements} className="w-full py-2 rounded-2xl font-semibold bg-green-600 text-white hover:scale-105 transition-all mt-8">
        {isProcessing ? "Pagamento in corso..." : "Paga ora"}
      </button>
      {message && <div className="text-destructive mt-4">{message}</div>}
    </form>
  );
};

// --- Success Popup ---
const SuccessPopup: React.FC = () => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="glass-card rounded-2xl p-8 tech-shadow text-center max-w-md w-[90%]">
      <h2 className="text-2xl font-bold text-green-500 mb-2">Acquisto completato!</h2>
      <p className="mb-6">I tuoi crediti sono stati aggiunti al tuo account.</p>
      <a href="/azienda" className="py-2 px-4 rounded-2xl bg-blue-600 text-white font-semibold hover:scale-105 transition-all">
        Torna alla dashboard
      </a>
    </div>
  </div>
);

// --- Main Page Component ---
export default function RicaricaCreditiPage() {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/company/status?walletAddress=${account.address}`);
      if (!res.ok) throw new Error('Errore nel recupero dei dati aziendali.');
      const data = await res.json();
      if (!data.isActive) throw new Error('Nessuna azienda attiva trovata per questo wallet.');

      setUserData({
        companyName: data.companyName,
        credits: data.credits,
        status: data.status,
        email: data.contactEmail,
      });

      if (data.billingDetails && Object.keys(data.billingDetails).length > 0) {
        setBillingDetails(data.billingDetails);
        setIsEditingBilling(false);
      } else {
        setBillingDetails(null);
        setIsEditingBilling(true);
      }
    } catch (err: any) {
      setError(err.message || 'Impossibile caricare i dati.');
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    setError(null);
    if (account) fetchAllData();
    else {
      setLoading(false);
      setUserData(null);
      setBillingDetails(null);
    }
  }, [account, fetchAllData]);

  const handleSelectPackage = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setClientSecret(null);
    setError(null);

    if (!billingDetails) {
      setIsEditingBilling(true);
      setError("Completa i dati di fatturazione per procedere con il pagamento.");
      return;
    }

    try {
      const response = await fetch(`/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: pkg.totalPrice * 100, walletAddress: account?.address }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Errore dal server');
      }
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message || "Non è stato possibile avviare il pagamento. Riprova.");
    }
  };

  const handleSaveBilling = async (details: BillingDetails) => {
    if (!account) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/company/save-billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: account.address, details }),
      });
      if (!response.ok) throw new Error('Salvataggio dei dati di fatturazione fallito.');

      setBillingDetails(details);
      setIsEditingBilling(false);

      if (selectedPackage) {
        await handleSelectPackage(selectedPackage);
      }
    } catch (err: any) {
      setError(err.message || 'Salvataggio dei dati di fatturazione fallito.');
    } finally {
      setIsSaving(false);
    }
  };

  const onPaymentSuccess = async () => {
    if (!account || !selectedPackage) return;
    setIsFulfilling(true);
    setError(null);
    try {
      const response = await fetch('/api/payments/fulfill-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account.address,
          packageId: selectedPackage.id,
          creditsPurchased: selectedPackage.credits,
        }),
      });
      if (!response.ok) throw new Error("Errore durante l'aggiornamento dei crediti.");

      setShowSuccessPopup(true);
      await fetchAllData();
    } catch (err: any) {
      setError(err.message || "Il tuo pagamento è andato a buon fine, ma non abbiamo potuto aggiungere i crediti. Contatta l'assistenza.");
    } finally {
      setIsFulfilling(false);
      if (clientSecret) setClientSecret(null);
      setSelectedPackage(null);
    }
  };

  if (isFulfilling) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <h1 className="text-2xl font-bold mb-2">Stiamo finalizzando il tuo acquisto...</h1>
        <p>Non chiudere questa pagina.</p>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center min-h-[60vh] text-center p-6"><p>Caricamento dati utente...</p></div>;
    }
    if (error && !showSuccessPopup) {
      return <div className="flex items-center justify-center min-h-[60vh] text-center p-6"><p className="text-destructive">{error}</p></div>;
    }
    if (!userData) {
      return <div className="flex items-center justify-center min-h-[60vh] text-center p-6"><p>Nessun dato utente trovato.</p></div>;
    }

    return (
      <div className="container mx-auto px-6 py-6 max-w-5xl">
        {/* Riepilogo Account */}
        <div className="glass-card rounded-2xl p-6 tech-shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Riepilogo Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Nome:</strong> {userData.companyName}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Crediti Rimanenti:</strong> {userData.credits}</p>
            <p><strong>Stato:</strong> <span className={userData.status === 'active' ? 'text-green-500' : 'text-yellow-500'}>
                {userData.status === 'active' ? 'Attivo' : 'Disattivo'}
              </span>
            </p>
          </div>
        </div>

        {/* Seleziona Pacchetto */}
        <div className="glass-card rounded-2xl p-6 tech-shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Seleziona un Pacchetto Crediti</h2>
          <table className="w-full border-separate border-spacing-y-2">
            <thead><tr className="text-muted-foreground text-sm">
              <th className="text-left py-2">Crediti</th>
              <th className="text-left py-2">Prezzo per credito</th>
              <th className="text-left py-2">Prezzo totale</th>
            </tr></thead>
            <tbody>
              {creditPackages.map(pkg => (
                <tr key={pkg.id} onClick={() => handleSelectPackage(pkg)} className={`cursor-pointer hover:bg-card/40 rounded-xl transition-colors ${selectedPackage?.id === pkg.id ? 'bg-primary/20 ring-2 ring-primary' : ''}`}>
                  <td className="py-3 px-4 font-semibold">{pkg.credits}</td>
                  <td className="py-3 px-4">{pkg.pricePerCredit.toFixed(2)} €</td>
                  <td className="py-3 px-4 font-semibold">{pkg.totalPrice.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dati di Fatturazione + Pagamento */}
        {selectedPackage && (
          <div className="glass-card rounded-2xl p-6 tech-shadow">
            {billingDetails && !isEditingBilling ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Dati di Fatturazione</h3>
                  <button className="text-accent border border-border rounded-md px-3 py-1 hover:bg-border/20 transition-colors" onClick={() => setIsEditingBilling(true)}>Modifica</button>
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
                <h3 className="text-lg font-semibold mb-4">{billingDetails ? 'Modifica Dati di Fatturazione' : 'Inserisci i Dati di Fatturazione'}</h3>
                <BillingForm initialDetails={billingDetails} onSave={handleSaveBilling} isSaving={isSaving} />
              </div>
            )}

            {/* Stripe Elements */}
            {!isEditingBilling && clientSecret && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4">Procedi con il Pagamento</h3>
                <Elements options={{ clientSecret }} stripe={stripePromise} key={clientSecret}>
                  <StripeCheckoutForm onPaymentSuccess={onPaymentSuccess} />
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
      {showSuccessPopup && <SuccessPopup />}
      <div className="min-h-screen bg-gray-100 px-6 py-6 container mx-auto">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold">EasyChain - Ricarica Crediti</h1>
          <ConnectButton client={client} wallets={[inAppWallet()]} chain={polygon} accountAbstraction={{ chain: polygon, sponsorGas: true }} />
        </header>
        <main className="mt-6">{account ? renderContent() : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <h1 className="text-2xl font-bold mb-2">Connetti il tuo Wallet</h1>
            <p>Per visualizzare e ricaricare i tuoi crediti, connetti il wallet associato alla tua azienda.</p>
          </div>
        )}</main>
      </div>
    </>
  );
}
yy