import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Footer from '../components/Footer';
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
  savingsText?: string;
}

interface CustomContactForm {
  email: string;
  companyName: string;
  message: string;
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
    
    /* Stili per header identico ad AziendaPage */
    .glass-card.rounded-3xl.p-6.tech-shadow.flex.flex-col.md\\:flex-row.justify-between.items-center.gap-6 { 
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
    
    .flex.items-center.gap-4.flex-wrap {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .text-2xl.md\\:text-3xl.font-extrabold.bg-gradient-to-r.from-primary.to-accent.bg-clip-text.text-transparent { 
      font-size: 1.5rem; 
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    
    .flex.flex-col.md\\:flex-row.gap-4.items-center {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .flex.flex-col.md\\:flex-row.gap-4.items-center-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #ffffff;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .credits-link {
      color: #ffffff;
      text-decoration: none;
      cursor: pointer;
    }
    
    .credits-link:hover {
      text-decoration: underline !important;
      text-decoration-color: #ffffff !important;
    }

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
      
      .glass-card.rounded-3xl.p-6.tech-shadow.flex.flex-col.md\\:flex-row.justify-between.items-center.gap-6 { 
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        padding: 2rem;
      }
      
      .text-2xl.md\\:text-3xl.font-extrabold.bg-gradient-to-r.from-primary.to-accent.bg-clip-text.text-transparent { 
        font-size: 1.875rem;
      }
    }
    
    @media (min-width: 1024px) {
      .glass-card.rounded-3xl.p-6.tech-shadow.flex.flex-col.md\\:flex-row.justify-between.items-center.gap-6 { 
        padding: 2.5rem;
      }
    }
  `}</style>
);

// --- Pacchetti Crediti ---
const creditPackages: CreditPackage[] = [
  { id: 'price_1', credits: 10, pricePerCredit: 1.00, totalPrice: 10.00, description: 'Pacchetto 10 crediti' },
  { id: 'price_2', credits: 50, pricePerCredit: 0.90, totalPrice: 45.00, description: 'Pacchetto 50 crediti', savingsText: '10% (5 €)' },
  { id: 'price_3', credits: 100, pricePerCredit: 0.85, totalPrice: 85.00, description: 'Pacchetto 100 crediti', savingsText: '15% (15 €)' },
  { id: 'price_4', credits: 500, pricePerCredit: 0.80, totalPrice: 400.00, description: 'Pacchetto 500 crediti', savingsText: '20% (100 €)' },
  { id: 'price_5', credits: 1000, pricePerCredit: 0.70, totalPrice: 700.00, description: 'Pacchetto 1000 crediti', savingsText: '30% (300 €)' },
];

// --- Componente Form Contatto Custom ---
const CustomContactModal: React.FC<{ isOpen: boolean, onClose: () => void, userData: UserData | null, walletAddress?: string | undefined }> = ({ isOpen, onClose, userData, walletAddress }) => {
  const [formData, setFormData] = useState<CustomContactForm>({
    email: '',
    companyName: userData?.companyName || '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CustomContactForm>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = () => {
    const newErrors: Partial<CustomContactForm> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nome azienda obbligatorio';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Messaggio obbligatorio';
    } else if (formData.message.length > 500) {
      newErrors.message = 'Messaggio troppo lungo (max 500 caratteri)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/send-email?action=custom-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          companyName: formData.companyName,
          message: formData.message,
          userEmail: userData?.email || 'N/A',
          walletAddress: walletAddress || null
        })
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          onClose();
          setFormData({ email: '', companyName: userData?.companyName || '', message: '' });
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Errore invio email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Richiesta Prezzo Custom</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>
        
        {submitStatus === 'success' ? (
          <div className="text-center py-4">
            <div className="text-green-400 text-4xl mb-2">✓</div>
            <p className="text-green-300">Messaggio inviato con successo!</p>
            <p className="text-slate-400 text-sm">Ti contatteremo presto</p>
          </div>
        ) : submitStatus === 'error' ? (
          <div className="text-center py-4">
            <div className="text-red-400 text-4xl mb-2">✗</div>
            <p className="text-red-300">Errore nell'invio del messaggio</p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
            >
              Riprova
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                placeholder="tua@email.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nome Azienda *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                placeholder="Nome della tua azienda"
              />
              {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Messaggio * (max 500 caratteri)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Descrivi le tue esigenze per un prezzo personalizzato..."
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.message && <p className="text-red-400 text-xs">{errors.message}</p>}
                <p className="text-slate-400 text-xs ml-auto">
                  {formData.message.length}/500
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                {isSubmitting ? 'Invio...' : 'Invia Richiesta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

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
        <button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition" style={{ marginTop: '1rem' }} disabled={isSaving}>
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
// Componente per il form di pagamento Stripe
const PaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || isProcessing) return;

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/ricaricacrediti?payment=success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('Payment error:', error);
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Errore durante il pagamento');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment successful:', paymentIntent);
        setPaymentStatus('success');
        
        // Redirect dopo successo
        setTimeout(() => {
          navigate('/azienda?payment=success');
        }, 2000);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setPaymentStatus('error');
      setErrorMessage('Errore imprevisto durante il pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-green-400 text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">Pagamento Completato!</h3>
        <p className="text-gray-300 mb-4">I tuoi crediti sono stati aggiunti al tuo account.</p>
        <p className="text-sm text-gray-400">Reindirizzamento alla dashboard...</p>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Errore Pagamento</h3>
        <p className="text-red-300 mb-4">{errorMessage}</p>
        <button
          onClick={() => {
            setPaymentStatus('idle');
            setErrorMessage('');
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg transition font-semibold flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Elaborazione...
            </>
          ) : (
            <>
              Paga Ora
            </>
          )}
        </button>
      </div>
    </form>
  );
};

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
  const [currentStep, setCurrentStep] = useState(1); // 1: Pacchetti, 2: Dati, 3: Pagamento
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Redirect: se non loggato non può stare su questa pagina.
  // Attende un delay più ampio per evitare redirect mentre il wallet si inizializza quando sei loggato.
  useEffect(() => {
    // Precarica da localStorage le ultime info salvate su AziendaPage
    try {
      const cached = localStorage.getItem('simplychain_company_latest');
      if (cached) {
        const parsed = JSON.parse(cached);
        setUserData({
          companyName: parsed.companyName,
          credits: parsed.credits,
          status: parsed.status,
          email: ''
        });
      }
    } catch {}

    if (account) return;
    const timer = setTimeout(() => {
      if (!account) navigate('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [account, navigate]);

  useEffect(() => {
    if (!account) {
      // Non azzerare subito lo stato: evita flicker e redirect erronei
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching company data for wallet:', account.address);
        const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`, { cache: 'no-store' as any });
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

          console.log('Checking billingDetails from Firebase:', data.billingDetails);
          console.log('billingDetails exists:', !!data.billingDetails);
          console.log('billingDetails keys:', data.billingDetails ? Object.keys(data.billingDetails) : 'none');
          
          if (data.billingDetails && Object.keys(data.billingDetails).length > 0) {
            console.log('Loading existing billing details:', data.billingDetails);
            setBillingDetails(data.billingDetails);
            setIsEditingBilling(false);
          } else {
            console.log('No billing details found, setting to edit mode');
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

  // Effect per gestire lo step iniziale basato sui dati esistenti
  useEffect(() => {
    if (userData && billingDetails) {
      console.log('Dati di fatturazione esistenti trovati, utente può andare direttamente al pagamento');
      // Se ci sono dati salvati e l'utente non ha ancora selezionato un pacchetto, resta allo step 1
      if (!selectedPackage) {
        setCurrentStep(1);
      }
    }
  }, [userData, billingDetails, selectedPackage]);
  
  const handleSelectPackage = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setClientSecret(null);

    // Vai al passo 2 (dati di fatturazione)
    setCurrentStep(2);

    // Se non ci sono dati di fatturazione, attiva editing
    if (!billingDetails) {
        setIsEditingBilling(true);
        return;
    }

    // Se ci sono già dati salvati, vai direttamente al pagamento
    await createPaymentIntent(pkg);
  };

  const createPaymentIntent = async (pkg: CreditPackage) => {
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
        setCurrentStep(3); // Vai al passo 3 (pagamento)
    } catch (error) {
        console.error("Errore nella creazione del Payment Intent:", error);
        setError("Non è stato possibile avviare il pagamento. Riprova.");
    }
  };

  const handleSaveBilling = async (details: BillingDetails) => {
    if (!account || isSaving) return; // Evita doppio click
    setIsSaving(true);
    setError(null);

    try {
        console.log('Salvando dati di fatturazione...', details);
        const response = await fetch('/api/send-email?action=save-billing-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress: account.address,
                details: details
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Errore response:', response.status, errorText);
            throw new Error(`Errore dal server: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log('Dati salvati con successo, response:', responseData);
        setBillingDetails(details);
        setIsEditingBilling(false);

        // Forza il ricaricamento dei dati per verificare che siano stati salvati
        setTimeout(async () => {
          try {
            const verifyResponse = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('Verifica dati dopo salvataggio:', verifyData.billingDetails);
              
              if (verifyData.billingDetails) {
                setBillingDetails(verifyData.billingDetails);
              }
            }
          } catch (verifyError) {
            console.error('Errore durante la verifica:', verifyError);
          }
        }, 1000);

        // Vai al passo 3 (pagamento) se c'è un pacchetto selezionato
        if (selectedPackage) {
            await createPaymentIntent(selectedPackage);
        }

    } catch(err: any) {
        console.error('Errore nel salvataggio:', err);
        setError(`Errore nel salvataggio: ${err.message || 'Errore sconosciuto'}`);
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
        {/* Progress Steps - stile AziendaPage */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-purple-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-600'}`}>
                1
              </div>
              <span className="font-medium">Seleziona Pacchetto</span>
            </div>
            
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-slate-600'}`}></div>
            
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-purple-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-slate-600'}`}>
                2
              </div>
              <span className="font-medium">Dati Fatturazione</span>
            </div>
            
            <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-slate-600'}`}></div>
            
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-purple-400' : 'text-slate-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-slate-600'}`}>
                3
              </div>
              <span className="font-medium">Pagamento</span>
            </div>
          </div>
        </div>

        {/* Step 1: Pacchetti Crediti - stile AziendaPage */}
        {currentStep === 1 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 transform transition-all duration-500 ease-in-out">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              Seleziona un Pacchetto Crediti
            </h2>
            
            <div className="grid gap-4">
              {creditPackages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className="p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 border-slate-600 bg-slate-700/30 hover:border-purple-500 hover:bg-slate-700/50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {pkg.credits} Crediti
                      </h3>
                      <p className="text-slate-400">
                        {pkg.pricePerCredit.toFixed(2)} € per credito
                      </p>
                      {pkg.savingsText && (
                        <p className="text-green-400 text-sm mt-1">
                          Risparmio: {pkg.savingsText}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-400">
                        {pkg.totalPrice.toFixed(2)} €
                      </p>
                      <p className="text-sm text-slate-400">
                        {pkg.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Opzione Custom */}
              <div
                onClick={() => setShowCustomModal(true)}
                className="p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 border-purple-500 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Servizio Personalizzato
                    </h3>
                    <p className="text-slate-300">
                      Contatta per un preventivo su misura
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-400">
                      Custom
                    </p>
                    <p className="text-sm text-slate-400">
                      Contatta SFY
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Dati di Fatturazione - stile AziendaPage */}
        {currentStep === 2 && selectedPackage && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 transform transition-all duration-500 ease-in-out">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Dati di Fatturazione
              </h2>
              <div className="text-right">
                <p className="text-slate-400">Pacchetto selezionato:</p>
                <p className="text-purple-400 font-bold">{selectedPackage.credits} crediti - {selectedPackage.totalPrice.toFixed(2)} €</p>
              </div>
            </div>
            
            {billingDetails && !isEditingBilling ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Dati Salvati</h3>
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition text-sm"
                    onClick={() => setIsEditingBilling(true)}
                  >
                    Modifica
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    ← Cambia Pacchetto
                  </button>
                  <button
                    onClick={() => createPaymentIntent(selectedPackage)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Procedi al Pagamento →
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {billingDetails ? 'Modifica Dati di Fatturazione' : 'Inserisci i Dati di Fatturazione'}
                </h3>
                <BillingForm initialDetails={billingDetails} onSave={handleSaveBilling} isSaving={isSaving} />
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    ← Cambia Pacchetto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Pagamento - stile AziendaPage */}
        {currentStep === 3 && selectedPackage && clientSecret && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 transform transition-all duration-500 ease-in-out">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Completa il Pagamento
              </h2>
              <div className="text-right">
                <p className="text-slate-400">Importo totale:</p>
                <p className="text-2xl font-bold text-green-400">{selectedPackage.totalPrice.toFixed(2)} €</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <h4 className="font-semibold text-white mb-2">Riepilogo Ordine:</h4>
              <p className="text-slate-300">{selectedPackage.credits} crediti × {selectedPackage.pricePerCredit.toFixed(2)} € = {selectedPackage.totalPrice.toFixed(2)} €</p>
            </div>
            
            <Elements options={{ clientSecret }} stripe={stripePromise}>
              <PaymentForm />
            </Elements>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
              >
                ← Modifica Dati
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
              >
                ← Cambia Pacchetto
              </button>
            </div>
          </div>
        )}

        
      </div>
    );
  };

  // Non mostrare schermate di connect: il redirect sopra gestisce i non loggati

  return (
    <>
      <RicaricaCreditiStyles />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        
        {/* Header identico ad AziendaPage */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              
              {/* Logo e titolo */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-white">SimplyChain</h1>
                    <p className="text-sm text-slate-400 hidden sm:block">Ricarica Crediti</p>
                  </div>
                </div>
              </div>

              {/* Connect Button */}
              <div className="flex items-center space-x-4">
                <ConnectButton
                  client={client}
                  wallets={wallets}
                  chain={polygon}
                  accountAbstraction={{ chain: polygon, sponsorGas: true }}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Barra info azienda - identica ad AziendaPage */}
        {userData && (
          <div className="glass-card rounded-3xl p-6 tech-shadow flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{userData.companyName}</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex flex-col md:flex-row gap-4 items-center-item">
                  <span>
                    <a href="/ricaricacrediti" className="credits-link" style={{ color: 'rgb(255, 255, 255)', textDecoration: 'none', cursor: 'pointer' }}>
                      Crediti Rimanenti: <strong>{userData.credits}</strong>
                    </a>
                  </span>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center-item">
                  <span>Stato: <strong className={userData.status === 'active' ? 'status-active-text' : 'status-inactive-text'}>{userData.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}</strong></span>
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/azienda')} className="text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition" style={{ backgroundColor: 'rgb(99, 104, 247)' }}>Dashboard</button>
          </div>
        )}

        {/* Content - stile AziendaPage */}
        <main className="flex-1">
          {loading ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-700/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-300">Caricamento dati utente...</p>
            </div>
          ) : error ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-700/50">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-300 mb-2">Errore</h3>
              <p className="text-red-200">{error}</p>
            </div>
          ) : !userData ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-slate-700/50">
              <div className="text-yellow-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">Nessun Dato</h3>
              <p className="text-yellow-200">Nessun dato utente trovato per questo wallet.</p>
            </div>
          ) : (
            renderContent()
          )}
        </main>
        
        </div>

        {/* Rimosso rettangolo in basso: ora la barra info è sotto l'header */}

        {/* Footer identico ad AziendaPage */}
        <Footer />

        {/* Modal Contatto Custom */}
        <CustomContactModal 
          isOpen={showCustomModal} 
          onClose={() => setShowCustomModal(false)} 
          userData={userData} 
          walletAddress={account?.address}
        />

      </div>
    </>
  );
};

export default RicaricaCreditiPage;
