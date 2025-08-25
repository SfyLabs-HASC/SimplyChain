import React, { useState, useEffect } from 'react';
import { ConnectButton, useActiveAccount } from "https://esm.sh/thirdweb@5/react";
import { createThirdwebClient } from "https://esm.sh/thirdweb@5";
import { polygon } from "https://esm.sh/thirdweb@5/chains";
import { inAppWallet } from "https://esm.sh/thirdweb@5/wallets";
// Sostituisci con le tue importazioni da firebase
// import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
// import { app } from './firebaseConfig'; // Assicurati di avere il file di configurazione

const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });

// =================================================================================
// --- CONFIGURAZIONE PAGAMENTI ---
// INSERISCI QUI LE TUE CHIAVI API. NON INSERIRE MAI LE CHIAVI SEGRETE DIRETTAMENTE
// NEL CODICE FRONT-END IN UN'APPLICAZIONE DI PRODUZIONE. USA VARIABILI D'AMBIENTE.
// =================================================================================
const STRIPE_PUBLISHABLE_KEY = 'INSERISCI_LA_TUA_CHIAVE_PUBBLICABILE_STRIPE_QUI';
const PAYPAL_CLIENT_ID = 'INSERISCI_IL_TUO_CLIENT_ID_PAYPAL_QUI';
// Per le operazioni lato server (es. creazione di un Payment Intent), avrai bisogno
// di una SECRET KEY, che deve essere gestita in un backend sicuro.
// const STRIPE_SECRET_KEY = 'QUESTA_CHIAVE_DEVE_STARE_SOLO_SUL_SERVER!';
// =================================================================================


// --- DATI DEI PACCHETTI DI RICARICA ---
const creditPackages = [
  { credits: 10, price: 2.00, pricePerCredit: 0.20 },
  { credits: 50, price: 6.00, pricePerCredit: 0.12 },
  { credits: 100, price: 10.00, pricePerCredit: 0.10 },
  { credits: 500, price: 45.00, pricePerCredit: 0.09 },
  { credits: 1000, price: 70.00, pricePerCredit: 0.07 },
];

// --- COMPONENTE PER L'ICONA ---
const CreditCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);
const PayPalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.333 22.518c-1.35.01-2.686-.398-3.834-1.182-.134-.092-.28-.21-.32-.37-.043-.162.02-.34.15-.468.13-.128.306-.17.47-.134.162.038 1.16.342 2.22.342 3.172 0 4.43-2.132 4.54-3.84.1-1.62-.91-2.906-2.5-3.354-1.25-.35-2.71-.08-3.77.78-.04.03-.08.06-.12.09-.16.12-.35.15-.53.1-.18-.05-.32-.18-.39-.36-.07-.18-.05-.38.06-.54l.11-.16c.33-.47.7-.9 1.1-1.29.83-.79 1.85-1.23 2.93-1.23 3.14 0 4.4 2.13 4.5 3.82.1 1.84-1.15 3.12-2.8 3.52-1.05.26-2.1.05-3.05-.63-.03-.02-.06-.05-.09-.07-.13-.1-.3-.12-.45-.07-.15.04-.27.15-.32.3-.05.15-.02.32.08.45l.1.13c.27.36.58.68.92.96.83.69 1.83 1.08 2.89 1.08 1.4 0 2.7-.43 3.8-1.2.14-.1.3-.12.45-.07.15.04-.27.15-.32.3.05.15-.02.32-.08.45l-.12.16c-.4.53-.85 1-1.35 1.37-1.13.84-2.45 1.3-3.82 1.32zM21.66 8.358c-.13-.13-.3-.17-.47-.14-.17.03-1.2.25-2.3.25-1.58 0-2.3-.6-2.45-1.62-.15-1 .34-1.9 1.32-2.43.72-.39 1.6-.48 2.45-.25.04.01.08.02.12.03.17.05.35.02.48-.1.13-.12.18-.3.14-.47s-.18-.3-.36-.35c-.05-.01-.1-.02-.15-.03-1.02-.28-2.2-.16-3.2.3-1.3.6-2.03 1.9-1.88 3.2.16 1.3 1.3 2.3 2.9 2.3 1.15 0 2.2-.24 2.3-.26.17-.04.3-.17.34-.33.04-.17-.02-.34-.15-.46z"></path></svg>
);

// --- COMPONENTE PRINCIPALE ---
const RicaricaCreditiPage = () => {
  const account = useActiveAccount();
  
  // --- STATI DEL COMPONENTE ---
  const [companyData, setCompanyData] = useState({ name: '', credits: 0, status: '' });
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[2]); // Pacchetto da 100 crediti preselezionato
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [billingType, setBillingType] = useState('azienda'); // 'azienda' o 'privato'
  const [billingDetails, setBillingDetails] = useState(null); // Dati di fatturazione dell'utente
  const [isLoading, setIsLoading] = useState(true);

  // --- EFFETTO PER CARICARE I DATI ---
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (account) {
        setIsLoading(true);
        // --- SIMULAZIONE CHIAMATA A FIREBASE ---
        try {
          // Dati mock per la demo
          await new Promise(resolve => setTimeout(resolve, 1000));
          setCompanyData({ name: 'Mia Azienda SRL', credits: 150, status: 'Attivo' });
          setBillingDetails(null); 

        } catch (error) {
          console.error("Errore nel recuperare i dati:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCompanyData();
  }, [account]);

  // --- GESTIONE PAGAMENTO ---
  const handlePayment = (paymentMethod) => {
    if (!billingDetails) {
      setShowBillingForm(true);
    } else {
      // =======================================================================
      // --- LOGICA DI PAGAMENTO REALE ---
      // Qui dovresti integrare l'SDK del provider di pagamento scelto.
      // =======================================================================
      console.log(`Inizio processo di pagamento con ${paymentMethod}`);
      console.log("Dati di fatturazione esistenti:", billingDetails);
      console.log("Pacchetto selezionato:", selectedPackage);

      if (paymentMethod === 'Stripe') {
        console.log("Utilizzo la chiave pubblicabile di Stripe:", STRIPE_PUBLISHABLE_KEY);
        // Esempio di logica con Stripe:
        // 1. Fai una chiamata al tuo backend per creare un "Payment Intent".
        //    Il backend userà la STRIPE_SECRET_KEY.
        // 2. Il backend restituisce un "client secret" del Payment Intent.
        // 3. Usa la libreria Stripe.js sul frontend con il "client secret"
        //    per mostrare il form della carta di credito e completare il pagamento.
        alert(`(SIMULAZIONE) Avvio pagamento con Stripe per ${selectedPackage.credits} crediti.`);

      } else if (paymentMethod === 'PayPal') {
        console.log("Utilizzo il Client ID di PayPal:", PAYPAL_CLIENT_ID);
        // Esempio di logica con PayPal:
        // 1. Usa l'SDK di PayPal per renderizzare i bottoni di pagamento.
        // 2. Configura l'SDK con il tuo PAYPAL_CLIENT_ID.
        // 3. Gestisci le callback onSuccess e onError per completare la transazione.
        alert(`(SIMULAZIONE) Avvio pagamento con PayPal per ${selectedPackage.credits} crediti.`);
      }
    }
  };
  
  // --- SALVATAGGIO DATI FATTURAZIONE ---
  const handleSaveBilling = async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());
      
      // Qui salveresti i dati su Firebase
      console.log("Salvataggio dati di fatturazione (simulato):", data);
      
      setBillingDetails(data);
      setShowBillingForm(false);
      
      alert(`Dati di fatturazione salvati! Ora puoi procedere al pagamento.`);
  };


  // --- RENDER DEL COMPONENTE ---

  if (!account) {
    return (
      <div className="ricarica-container">
        <div style={{ textAlign: "center", paddingTop: "5rem" }}>
          <h1 className="text-3xl font-bold mb-4">Ricarica Crediti</h1>
          <p className="text-gray-400 mb-8">Connetti il tuo wallet per accedere alla pagina di ricarica.</p>
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
      <div className="ricarica-container">
        <header className="ricarica-header">
          <h1 className="ricarica-title">Ricarica Crediti</h1>
          <ConnectButton 
            client={client}
            chain={polygon}
            accountAbstraction={{ chain: polygon, sponsorGas: true }}
          />
        </header>
        
        <main className="ricarica-content">
          {/* --- Sezione Dati Azienda --- */}
          <div className="company-info-card">
            {isLoading ? (
              <div className="text-center p-8">Caricamento dati...</div>
            ) : (
              <>
                <div className="info-item">
                  <span className="info-label">Nome Azienda</span>
                  <span className="info-value">{companyData.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Crediti Rimanenti</span>
                  <span className="info-value font-bold text-2xl text-blue-400">{companyData.credits}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Stato Account</span>
                  <span className={`info-value status ${companyData.status === 'Attivo' ? 'active' : 'inactive'}`}>{companyData.status}</span>
                </div>
              </>
            )}
          </div>

          {/* --- Sezione Ricarica --- */}
          <div className="recharge-section">
            <h2 className="section-title">Seleziona un pacchetto di ricarica</h2>
            <div className="packages-grid">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className={`package-card ${selectedPackage.credits === pkg.credits ? 'selected' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="credits-amount">{pkg.credits} Crediti</div>
                  <div className="total-price">€{pkg.price.toFixed(2)}</div>
                  <div className="price-per-credit">€{pkg.pricePerCredit.toFixed(2)} / credito</div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Sezione Pagamento --- */}
          {!showBillingForm ? (
            <div className="payment-section">
                <h2 className="section-title">Procedi al pagamento</h2>
                <div className="payment-buttons">
                    <button className="payment-btn stripe-btn" onClick={() => handlePayment('Stripe')}>
                        <CreditCardIcon /> Paga con Carta
                    </button>
                    <button className="payment-btn paypal-btn" onClick={() => handlePayment('PayPal')}>
                        <PayPalIcon /> Paga con PayPal
                    </button>
                </div>
                <p className="billing-info-notice">
                    {!billingDetails 
                        ? "Ti verranno chiesti i dati di fatturazione al prossimo step."
                        : "Utilizzeremo i dati di fatturazione che hai già salvato."
                    }
                </p>
            </div>
          ) : (
            // --- Form Fatturazione ---
            <div className="billing-form-section">
                <h2 className="section-title">Dati di Fatturazione</h2>
                <p className="text-gray-400 text-sm mb-4">Sembra che sia la prima volta. Inserisci i tuoi dati per procedere.</p>
                <form onSubmit={handleSaveBilling}>
                    <div className="billing-type-selector">
                        <label className={billingType === 'azienda' ? 'active' : ''}>
                            <input type="radio" name="billingType" value="azienda" checked={billingType === 'azienda'} onChange={() => setBillingType('azienda')} />
                            Azienda
                        </label>
                        <label className={billingType === 'privato' ? 'active' : ''}>
                            <input type="radio" name="billingType" value="privato" checked={billingType === 'privato'} onChange={() => setBillingType('privato')} />
                            Privato
                        </label>
                    </div>

                    {billingType === 'azienda' ? (
                        <>
                            <input name="denominazione" type="text" placeholder="Denominazione Sociale" required className="form-input"/>
                            <input name="indirizzo" type="text" placeholder="Indirizzo Completo" required className="form-input"/>
                            <input name="piva" type="text" placeholder="Partita IVA / Codice Fiscale" required className="form-input"/>
                            <input name="sdi" type="text" placeholder="Codice Univoco (SDI) o PEC" required className="form-input"/>
                        </>
                    ) : (
                         <>
                            <input name="nome" type="text" placeholder="Nome" required className="form-input"/>
                            <input name="cognome" type="text" placeholder="Cognome" required className="form-input"/>
                            <input name="indirizzo" type="text" placeholder="Indirizzo Completo" required className="form-input"/>
                            <input name="cf" type="text" placeholder="Codice Fiscale" required className="form-input"/>
                        </>
                    )}
                    <div className="form-actions">
                        <button type="button" onClick={() => setShowBillingForm(false)} className="cancel-btn">Annulla</button>
                        <button type="submit" className="save-btn">Salva e Continua</button>
                    </div>
                </form>
            </div>
          )}

        </main>
      </div>
      <RicaricaCreditiPageStyles />
    </>
  );
};


// --- STILI CSS IN JS ---
const RicaricaCreditiPageStyles = () => (
  <style>{`
    .ricarica-container {
      padding: 2rem;
      min-height: 100vh;
      background-color: #0f0f0f;
      color: #ffffff;
      font-family: 'Inter', sans-serif;
    }
    .ricarica-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem 1.5rem;
      background-color: #1a1a1a;
      border-radius: 0.75rem;
      border: 1px solid #333;
    }
    .ricarica-title {
      font-size: 1.5rem;
      font-weight: 600;
    }
    .ricarica-content {
      background: #161616;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #333;
      max-width: 900px;
      margin: 0 auto;
    }
    .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        text-align: center;
        color: #e5e7eb;
    }

    /* Card Info Azienda */
    .company-info-card {
        background: #1f1f1f;
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 2.5rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        border: 1px solid #333;
    }
    .info-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .info-label {
        font-size: 0.875rem;
        color: #a0a0a0;
        margin-bottom: 0.25rem;
    }
    .info-value {
        font-size: 1.25rem;
        font-weight: 500;
        color: #ffffff;
    }
    .status.active { color: #4ade80; }
    .status.inactive { color: #f87171; }

    /* Selettore Pacchetti */
    .packages-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }
    .package-card {
        background: #2a2a2a;
        border: 2px solid #444;
        border-radius: 0.75rem;
        padding: 1.25rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }
    .package-card:hover {
        transform: translateY(-5px);
        border-color: #555;
    }
    .package-card.selected {
        border-color: #3b82f6;
        background-color: #2563eb20;
        transform: translateY(-5px) scale(1.03);
        box-shadow: 0 0 15px #3b82f640;
    }
    .credits-amount {
        font-size: 1.5rem;
        font-weight: bold;
        color: #ffffff;
    }
    .total-price {
        font-size: 1.125rem;
        color: #e5e7eb;
        margin: 0.25rem 0;
    }
    .price-per-credit {
        font-size: 0.8rem;
        color: #a0a0a0;
    }

    /* Sezione Pagamento */
    .payment-section, .recharge-section, .billing-form-section {
        margin-top: 2.5rem;
        padding-top: 2rem;
        border-top: 1px solid #333;
    }
    .payment-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }
    .payment-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .payment-btn:hover {
        transform: scale(1.05);
    }
    .stripe-btn { background-color: #635bff; color: white; }
    .paypal-btn { background-color: #0070ba; color: white; }
    .billing-info-notice {
        text-align: center;
        font-size: 0.875rem;
        color: #a0a0a0;
    }

    /* Form Fatturazione */
    .billing-form-section { animation: fadeIn 0.5s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .billing-type-selector {
        display: flex;
        justify-content: center;
        background-color: #2a2a2a;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
        padding: 0.25rem;
    }
    .billing-type-selector label {
        flex: 1;
        text-align: center;
        padding: 0.5rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .billing-type-selector label.active {
        background-color: #3b82f6;
        color: white;
    }
    .billing-type-selector input[type="radio"] { display: none; }
    .form-input {
        width: 100%;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        color: white;
        margin-bottom: 1rem;
        font-size: 1rem;
    }
    .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px #3b82f680;
    }
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    .cancel-btn, .save-btn {
        padding: 0.6rem 1.2rem;
        border-radius: 0.5rem;
        border: none;
        font-weight: 600;
        cursor: pointer;
    }
    .cancel-btn { background-color: #4b5563; color: white; }
    .save-btn { background-color: #2563eb; color: white; }

    @media (max-width: 768px) {
      .ricarica-container { padding: 1rem; }
      .ricarica-header { flex-direction: column; gap: 1rem; text-align: center; }
      .ricarica-title { font-size: 1.25rem; }
      .company-info-card { grid-template-columns: 1fr; }
    }
  `}</style>
);

export default RicaricaCreditiPage;
