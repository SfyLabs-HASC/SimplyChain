import React, { useState, useEffect } from 'react';
import { ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { createThirdwebClient, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { Link } from 'react-router-dom';
import { supplyChainABI as abi } from '../abi/contractABI';
import "../App.css";

const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });
const contract = getContract({ 
  client, 
  chain: polygon,
  address: "0xd0bad36896df719b26683e973f2fc6135f215d4e" 
});

// Pacchetti crediti disponibili
const CREDIT_PACKAGES = [
  { credits: 10, pricePerCredit: 0.20, totalPrice: 2.00 },
  { credits: 50, pricePerCredit: 0.12, totalPrice: 6.00 },
  { credits: 100, pricePerCredit: 0.10, totalPrice: 10.00 },
  { credits: 500, pricePerCredit: 0.09, totalPrice: 45.00 },
  { credits: 1000, pricePerCredit: 0.07, totalPrice: 70.00 }
];

interface BillingData {
  type: 'azienda' | 'privato';
  // Dati azienda
  denominazioneSociale?: string;
  indirizzoAzienda?: string;
  codiceFiscalePartitaIva?: string;
  codiceUnicooPec?: string;
  // Dati privato
  nomeCognome?: string;
  indirizzoPrivato?: string;
  codiceFiscalePrivato?: string;
}

const RicaricaCreditiPageStyles = () => (
  <style>{`
    .ricarica-container {
      padding: 2rem;
      min-height: 100vh;
      background-color: #0f0f0f;
      color: #ffffff;
    }

    .ricarica-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: #1a1a1a;
      border-radius: 0.75rem;
      border: 1px solid #333;
    }

    .company-info {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #333;
      margin-bottom: 2rem;
    }

    .company-name {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #ffffff;
    }

    .company-stats {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
    }

    .status-active {
      color: #10b981;
    }

    .credits-section {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #333;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      color: #ffffff;
    }

    .packages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .package-card {
      background-color: #2a2a2a;
      border: 2px solid #444;
      border-radius: 0.75rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .package-card:hover {
      border-color: #6366f1;
      transform: translateY(-2px);
    }

    .package-card.selected {
      border-color: #6366f1;
      background-color: #1e1b4b;
    }

    .package-credits {
      font-size: 1.5rem;
      font-weight: bold;
      color: #ffffff;
    }

    .package-price {
      font-size: 1.2rem;
      color: #10b981;
      margin: 0.5rem 0;
    }

    .package-per-credit {
      font-size: 0.9rem;
      color: #9ca3af;
    }

    .payment-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .payment-button {
      flex: 1;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .payment-button:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      transform: translateY(-2px);
    }

    .payment-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .billing-form {
      background-color: #2a2a2a;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #444;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #ffffff;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      background-color: #1a1a1a;
      border: 1px solid #444;
      border-radius: 0.5rem;
      color: #ffffff;
      font-size: 1rem;
    }

    .form-input:focus {
      outline: none;
      border-color: #6366f1;
    }

    .radio-group {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .custom-section {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #333;
    }

    .custom-form {
      background-color: #2a2a2a;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #444;
      margin-top: 1.5rem;
    }

    .textarea {
      min-height: 120px;
      resize: vertical;
    }

    .char-counter {
      text-align: right;
      font-size: 0.9rem;
      color: #9ca3af;
      margin-top: 0.25rem;
    }

    .submit-button {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      width: 100%;
    }

    .submit-button:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .ricarica-container {
        padding: 1rem;
      }

      .company-stats {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .packages-grid {
        grid-template-columns: 1fr;
      }

      .payment-section {
        flex-direction: column;
      }

      .radio-group {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `}</style>
);

const RicaricaCreditiPage: React.FC = () => {
  const account = useActiveAccount();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [billingData, setBillingData] = useState<BillingData>({ type: 'azienda' });
  const [savedBillingData, setSavedBillingData] = useState<BillingData | null>(null);
  const [customRequest, setCustomRequest] = useState({ message: '', email: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Ottieni informazioni azienda da contratto
  const { data: contributorInfo } = useReadContract({ 
    contract, 
    method: "function getContributorInfo(address) view returns (string, uint256, bool)", 
    params: account ? [account.address] : undefined,
    queryOptions: { enabled: !!account, refetchOnWindowFocus: false } 
  });

  // Carica dati fatturazione salvati
  useEffect(() => {
    const loadSavedBillingData = async () => {
      if (!account?.address) return;

      try {
        const response = await fetch(`/api/unified-api?action=get-billing-data&address=${account.address}`);
        if (response.ok) {
          const data = await response.json();
          setSavedBillingData(data.billingData);
        }
      } catch (error) {
        console.error('Errore nel caricamento dati fatturazione:', error);
      }
    };

    loadSavedBillingData();
  }, [account?.address]);

  const handlePackageSelect = (index: number) => {
    setSelectedPackage(index);
  };

  const handlePaymentClick = async (method: 'stripe' | 'paypal') => {
    if (selectedPackage === null) {
      alert('Seleziona un pacchetto prima di procedere al pagamento');
      return;
    }

    // Se non ci sono dati di fatturazione salvati, mostra il form
    if (!savedBillingData) {
      setShowBillingForm(true);
      return;
    }

    // Procedi con il pagamento
    await processPayment(method, savedBillingData);
  };

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPackage === null) return;

    // Salva i dati di fatturazione
    try {
      await fetch('/api/unified-api?action=save-billing-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: account?.address,
          billingData
        })
      });

      setSavedBillingData(billingData);
      setShowBillingForm(false);

      // Procedi con il pagamento
      await processPayment('stripe', billingData);
    } catch (error) {
      console.error('Errore nel salvataggio dati fatturazione:', error);
      alert('Errore nel salvataggio dei dati. Riprova.');
    }
  };

  const processPayment = async (method: 'stripe' | 'paypal', billing: BillingData) => {
    if (selectedPackage === null) return;

    setIsProcessing(true);
    const selectedPkg = CREDIT_PACKAGES[selectedPackage];

    try {
      if (method === 'stripe') {
        // Crea pagamento Stripe
        const response = await fetch('/api/unified-api?action=create-stripe-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: selectedPkg.totalPrice,
            credits: selectedPkg.credits,
            userAddress: account?.address,
            billingData: billing
          })
        });

        const { clientSecret, paymentIntentId } = await response.json();

        // Carica Stripe.js dinamicamente
        const stripe = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

        // Conferma il pagamento
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: {
              // Qui dovresti implementare un form per i dati della carta
              // Per ora utilizziamo un prompt di test
            }
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
          await confirmPaymentAndCredit(paymentIntentId, 'stripe');
        }

      } else if (method === 'paypal') {
        // Crea pagamento PayPal
        const response = await fetch('/api/unified-api?action=create-paypal-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: selectedPkg.totalPrice,
            credits: selectedPkg.credits,
            userAddress: account?.address,
            billingData: billing
          })
        });

        const { orderId } = await response.json();

        // Carica PayPal SDK e apri popup
        // Qui dovresti implementare l'integrazione PayPal completa
        alert(`PayPal Order ID: ${orderId} - Implementa l'integrazione PayPal`);
      }

    } catch (error) {
      console.error('Errore nel processamento pagamento:', error);
      alert('Errore nel processamento del pagamento. Riprova.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPaymentAndCredit = async (paymentId: string, provider: string) => {
    try {
      const response = await fetch('/api/unified-api?action=confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          provider
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Pagamento confermato! Sono stati accreditati ${result.credits} crediti al tuo account.`);
        setSelectedPackage(null);
        // Aggiorna i dati del contributore
        window.location.reload();
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Errore nella conferma pagamento:', error);
      alert('Errore nella conferma del pagamento.');
    }
  };

  const handleCustomRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customRequest.email || !customRequest.phone || !customRequest.message) {
      alert('Tutti i campi sono obbligatori');
      return;
    }

    try {
      const emailBody = `
        <h2>Richiesta Custom</h2>
        <p><strong>Email:</strong> ${customRequest.email}</p>
        <p><strong>Telefono:</strong> ${customRequest.phone}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${customRequest.message.replace(/\n/g, '<br>')}</p>
      `;

      const response = await fetch('/api/unified-api?action=send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'sfy.startup@gmail.com',
          subject: 'Richiesta Custom',
          html: emailBody,
          requestData: {
            type: 'custom_request',
            ...customRequest,
            userAddress: account?.address
          }
        })
      });

      alert('Richiesta inviata con successo!');
      setCustomRequest({ message: '', email: '', phone: '' });
    } catch (error) {
      console.error('Errore invio richiesta:', error);
      alert('Errore nell\'invio della richiesta. Riprova.');
    }
  };

  if (!account) {
    return (
      <div className="ricarica-container">
        <RicaricaCreditiPageStyles />
        <div style={{ textAlign: "center", paddingTop: "5rem" }}>
          <h1>Ricarica Crediti</h1>
          <p style={{ marginBottom: "2rem" }}>Connetti il tuo wallet per accedere.</p>
          <ConnectButton client={client} chain={polygon} />
        </div>
      </div>
    );
  }

  const companyName = contributorInfo?.[0] || 'Caricamento...';
  const credits = contributorInfo?.[1]?.toString() || '...';

  return (
    <>
      <RicaricaCreditiPageStyles />
      <div className="ricarica-container">
        <header className="ricarica-header">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>EasyChain - Ricarica Crediti</div>
          </Link>
          <ConnectButton client={client} chain={polygon} />
        </header>

        {/* Informazioni Azienda */}
        <div className="company-info">
          <div className="company-name">{companyName}</div>
          <div className="company-stats">
            <div className="stat-item">
              <span>Crediti Rimanenti: <strong>{credits}</strong></span>
            </div>
            <div className="stat-item">
              <span>Stato: <strong className="status-active">ATTIVO</strong></span>
              <span style={{ color: '#10b981' }}>✅</span>
            </div>
          </div>
        </div>

        {/* Sezione Ricarica Crediti */}
        <div className="credits-section">
          <h2 className="section-title">RICARICA CREDITI</h2>

          <div className="packages-grid">
            {CREDIT_PACKAGES.map((pkg, index) => (
              <div
                key={index}
                className={`package-card ${selectedPackage === index ? 'selected' : ''}`}
                onClick={() => handlePackageSelect(index)}
              >
                <div className="package-credits">{pkg.credits} crediti</div>
                <div className="package-price">€{pkg.totalPrice.toFixed(2)}</div>
                <div className="package-per-credit">€{pkg.pricePerCredit.toFixed(2)} per credito</div>
              </div>
            ))}
          </div>

          <div className="payment-section">
            <button
              className="payment-button"
              onClick={() => handlePaymentClick('stripe')}
              disabled={selectedPackage === null || isProcessing}
            >
              {isProcessing ? 'Elaborazione...' : 'Paga con Stripe'}
            </button>
            <button
              className="payment-button"
              onClick={() => handlePaymentClick('paypal')}
              disabled={selectedPackage === null || isProcessing}
            >
              {isProcessing ? 'Elaborazione...' : 'Paga con PayPal'}
            </button>
          </div>

          {savedBillingData && (
            <div style={{ padding: '1rem', backgroundColor: '#2a2a2a', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <h4>Dati di fatturazione salvati:</h4>
              <p>Tipo: {savedBillingData.type === 'azienda' ? 'Azienda' : 'Privato'}</p>
              <button
                onClick={() => setShowBillingForm(true)}
                style={{ background: 'none', border: '1px solid #6366f1', color: '#6366f1', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}
              >
                Modifica dati
              </button>
            </div>
          )}
        </div>

        {/* Form Dati Fatturazione */}
        {showBillingForm && (
          <form className="billing-form" onSubmit={handleBillingSubmit}>
            <h3 className="section-title">Dati di Fatturazione</h3>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  value="azienda"
                  checked={billingData.type === 'azienda'}
                  onChange={(e) => setBillingData({ ...billingData, type: e.target.value as 'azienda' | 'privato' })}
                />
                <span>AZIENDA</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="privato"
                  checked={billingData.type === 'privato'}
                  onChange={(e) => setBillingData({ ...billingData, type: e.target.value as 'azienda' | 'privato' })}
                />
                <span>PRIVATO</span>
              </label>
            </div>

            {billingData.type === 'azienda' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Denominazione Sociale</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingData.denominazioneSociale || ''}
                    onChange={(e) => setBillingData({ ...billingData, denominazioneSociale: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Indirizzo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingData.indirizzoAzienda || ''}
                    onChange={(e) => setBillingData({ ...billingData, indirizzoAzienda: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Codice Fiscale / Partita IVA</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingData.codiceFiscalePartitaIva || ''}
                    onChange={(e) => setBillingData({ ...billingData, codiceFiscalePartitaIva: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Codice Univoco o PEC</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingData.codiceUnicooPec || ''}
                    onChange={(e) => setBillingData({ ...billingData, codiceUnicooPec: e.target.value })}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Nome e Cognome</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingData.nomeCognome || ''}
                    onChange={(e) => setBillingData({ ...billingData, nomeCognome: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Indirizzo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingData.indirizzoPrivato || ''}
                    onChange={(e) => setBillingData({ ...billingData, indirizzoPrivato: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Codice Fiscale</label>
                  <input
                    type="text"
                    className="form-input"
                    value={billingData.codiceFiscalePrivato || ''}
                    onChange={(e) => setBillingData({ ...billingData, codiceFiscalePrivato: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowBillingForm(false)}
                style={{ flex: 1, background: '#6b7280', color: 'white', padding: '1rem', border: 'none', borderRadius: '0.75rem', cursor: 'pointer' }}
              >
                Annulla
              </button>
              <button type="submit" className="submit-button" style={{ flex: 1 }}>
                Salva e Procedi
              </button>
            </div>
          </form>
        )}

        {/* Sezione Servizi Custom */}
        <div className="custom-section">
          <h2 className="section-title">Servizi Custom</h2>
          <p style={{ marginBottom: '1.5rem', color: '#9ca3af' }}>
            Ti serve un servizio custom adatto alle tue esigenze? Vuoi sviluppare un software proprietario per la tua azienda?
          </p>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Contattaci</h3>

          <form className="custom-form" onSubmit={handleCustomRequest}>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                value={customRequest.email}
                onChange={(e) => setCustomRequest({ ...customRequest, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Numero di Telefono *</label>
              <input
                type="tel"
                className="form-input"
                value={customRequest.phone}
                onChange={(e) => setCustomRequest({ ...customRequest, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Richiesta (max 500 parole) *</label>
              <textarea
                className="form-input textarea"
                value={customRequest.message}
                onChange={(e) => setCustomRequest({ ...customRequest, message: e.target.value })}
                maxLength={500}
                required
              ></textarea>
              <div className="char-counter">{customRequest.message.length} / 500</div>
            </div>

            <button type="submit" className="submit-button">
              Invia Richiesta
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RicaricaCreditiPage;