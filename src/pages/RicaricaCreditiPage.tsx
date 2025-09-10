import React, { useState, useEffect, useCallback } from "react";
import { ConnectButton, useActiveAccount } from "https://esm.sh/thirdweb/react";
import { createThirdwebClient } from "https://esm.sh/thirdweb";
import { polygon } from "https://esm.sh/thirdweb/chains";
import { inAppWallet } from "https://esm.sh/thirdweb/wallets";
import { loadStripe } from "https://esm.sh/@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "https://esm.sh/@stripe/react-stripe-js";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from "firebase/auth";

// --- Configurazione Firebase (Esempio, adatta con la tua configurazione) ---
// NOTA: Assicurati che la configurazione di Firebase sia caricata correttamente nel tuo progetto.
// Potresti avere un file di configurazione separato da importare.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inizializzazione Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" }); // Sostituisci con il tuo Client ID
const stripePromise = loadStripe("pk_test_51RrJLQRx6E9RZt5ynBwc2dt3o7RT4YTwwij3O9xj3VdMwNKlI4GA9Yvbzkgwbxi0I5J9XnqPMlgY7bz2xHSgxmz000KCex9EiA"); // Sostituisci con la tua chiave pubblica Stripe

// --- Stili ---
const RicaricaCreditiStyles = () => (
    <style>{`
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #0d1117;
        }
        .app-container-full {
            min-height: 100vh;
            background-color: #0d1117;
            color: #c9d1d9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
            display: flex;
            flex-direction: column;
        }
        .main-header-bar {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            background-color: #161b22;
            border-bottom: 1px solid #30363d;
        }
        .header-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #f0f6fc;
            text-align: center;
        }
        .centered-container {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 1rem;
        }
        .web3-button {
            background: linear-gradient(135deg, #238636 0%, #2ea043 100%);
            color: white;
            padding: 0.75rem 1.5rem;
            border: 1px solid rgba(240, 246, 252, 0.1);
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            font-size: 1rem;
            box-shadow: 0 1px 0 rgba(27, 31, 35, 0.04), inset 0 1px 0 hsla(0, 0%, 100%, 0.25);
        }
        .web3-button:hover:not(:disabled) {
            background: linear-gradient(135deg, #2ea043 0%, #3fb950 100%);
        }
        .web3-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .form-group { margin-bottom: 1rem; text-align: left; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #c9d1d9; }
        .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #30363d;
            border-radius: 0.5rem;
            background-color: #0d1117;
            color: #c9d1d9;
            font-size: 1rem;
            box-sizing: border-box;
        }
        .form-input:focus {
            outline: none;
            border-color: #2f81f7;
            box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.3);
        }
        .error-message { color: #f85149; font-size: 0.875rem; margin-top: 0.25rem; }
        
        .recharge-container { max-width: 900px; width: 100%; margin: 2rem auto; padding: 0 1rem; box-sizing: border-box; }
        .info-card {
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        .info-card h2, .info-card h3 {
             margin-top: 0;
             color: #f0f6fc;
             border-bottom: 1px solid #30363d;
             padding-bottom: 0.75rem;
             margin-bottom: 1.5rem;
        }
        .user-info-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .user-info-grid p { margin: 0; }
        .status-active-text { color: #3fb950; }
        .status-inactive-text { color: #f59e0b; }

        .credit-packages-table { width: 100%; border-collapse: collapse; }
        .credit-packages-table th, .credit-packages-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #30363d; }
        .credit-packages-table tr { cursor: pointer; transition: background-color 0.2s ease; }
        .credit-packages-table tr:hover { background-color: #1f242c; }
        .credit-packages-table tr.selected { background-color: #2f81f7; color: white; }
        .credit-packages-table th { font-size: 0.9rem; color: #8b949e; text-transform: uppercase; }
        
        .billing-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .edit-button { background: none; border: 1px solid #30363d; color: #58a6ff; cursor: pointer; font-size: 0.9rem; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; }
        .edit-button:hover { background-color: #30363d; color: white; }
        
        /* Modal Popup */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: #161b22; padding: 2rem; border-radius: 0.75rem; text-align: center; border: 1px solid #30363d; max-width: 500px; width: 90%; }
        .modal-content h2 { color: #3fb950; }
        
        @media (min-width: 768px) {
            .main-header-bar { flex-direction: row; justify-content: space-between; align-items: center; padding: 1rem 2rem; }
            .header-title { text-align: left; }
            .user-info-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
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

// --- Componente Form di Fatturazione ---
const BillingForm: React.FC<{ initialDetails?: BillingDetails | null, onSave: (details: BillingDetails) => void, isSaving: boolean }> = ({ initialDetails, onSave, isSaving }) => {
    const [type, setType] = useState<'azienda' | 'privato'>(initialDetails?.type || 'azienda');
    const [formData, setFormData] = useState(initialDetails || {});
    const [errors, setErrors] = useState<Partial<BillingDetails>>({});

    useEffect(() => {
        if (initialDetails) {
            setType(initialDetails.type || 'azienda');
            setFormData(initialDetails);
        }
    }, [initialDetails]);

    const validate = () => {
        const newErrors: Partial<BillingDetails> = {};
        if (type === 'azienda') {
            if (!formData.ragioneSociale?.trim()) newErrors.ragioneSociale = "La denominazione sociale è obbligatoria.";
            if (!formData.indirizzo?.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio.";
            if (!formData.pIvaCf?.trim() || !/^[0-9]{11}$/.test(formData.pIvaCf)) newErrors.pIvaCf = "La Partita IVA deve contenere 11 cifre.";
            if (!formData.sdiPec?.trim()) newErrors.sdiPec = "Il codice SDI o la PEC sono obbligatori.";
        } else {
            if (!formData.nome?.trim()) newErrors.nome = "Il nome è obbligatorio.";
            if (!formData.cognome?.trim()) newErrors.cognome = "Il cognome è obbligatorio.";
            if (!formData.indirizzo?.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio.";
            if (!formData.cf?.trim() || !/^[A-Z0-9]{16}$/i.test(formData.cf)) newErrors.cf = "Il codice fiscale deve essere di 16 caratteri.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        if (validate()) {
            const detailsToSave: BillingDetails = { type, ...formData };
            onSave(detailsToSave);
        }
    };

    return (
        <div className="billing-form">
            <div className="form-group">
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label><input type="radio" value="azienda" checked={type === 'azienda'} onChange={() => setType('azienda')} disabled={isSaving} /> Azienda</label>
                    <label><input type="radio" value="privato" checked={type === 'privato'} onChange={() => setType('privato')} disabled={isSaving} /> Privato</label>
                </div>
            </div>
            {type === 'azienda' ? (
                <>
                    <div className="form-group"><label>Denominazione Sociale</label><input type="text" name="ragioneSociale" value={formData.ragioneSociale || ''} onChange={handleInputChange} className="form-input" disabled={isSaving} />{errors.ragioneSociale && <p className="error-message">{errors.ragioneSociale}</p>}</div>
                    <div className="form-group"><label>Indirizzo</label><input type="text" name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} className="form-input" disabled={isSaving} />{errors.indirizzo && <p className="error-message">{errors.indirizzo}</p>}</div>
                    <div className="form-group"><label>Partita IVA</label><input type="text" name="pIvaCf" value={formData.pIvaCf || ''} onChange={handleInputChange} className="form-input" disabled={isSaving} />{errors.pIvaCf && <p className="error-message">{errors.pIvaCf}</p>}</div>
                    <div className="form-group"><label>Codice Univoco (SDI) o PEC</label><input type="text" name="sdiPec" value={formData.sdiPec || ''} onChange={handleInputChange} className="form-input" disabled={isSaving} />{errors.sdiPec && <p className="error-message">{errors.sdiPec}</p>}</div>
                </>
            ) : (
                <>
                    <div className="form-group"><label>Nome</label><input type="text" name="nome" value={formData.nome || ''} onChange={handleInputChange} className="form-input" disabled={isSaving} />{errors.nome && <p className="error-message">{errors.nome}</p>}</div>
                    <div className="form-group"><label>Cognome</label><input type="text" name="cognome" value={formData.cognome || ''} onChange={handleInputChange} className="form-input" disabled={isSaving} />{errors.cognome && <p className="error-message">{errors.cognome}</p>}</div>
                    <div className="form-group"><label>Indirizzo</label><input type="text" name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} className="form-input" disabled={isSaving} />{errors.indirizzo && <p className="error-message">{errors.indirizzo}</p>}</div>
                    <div className="form-group"><label>Codice Fiscale</label><input type="text" name="cf" value={formData.cf || ''} onChange={handleInputChange} className="form-input" disabled={isSaving} />{errors.cf && <p className="error-message">{errors.cf}</p>}</div>
                </>
            )}
            <button onClick={handleSave} className="web3-button" style={{ marginTop: '1rem', width: '100%' }} disabled={isSaving}>
                {isSaving ? 'Salvataggio...' : 'Salva Dati di Fatturazione'}
            </button>
        </div>
    );
};

// --- Componente Checkout Stripe ---
const StripeCheckoutForm: React.FC<{onPaymentSuccess: () => void}> = ({onPaymentSuccess}) => {
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
            redirect: "if_required" // Impedisce il reindirizzamento
        });

        if (error) {
            setMessage(error.message || "Errore sconosciuto.");
            setIsProcessing(false);
        } else {
            setMessage(null);
            // Pagamento riuscito
            onPaymentSuccess();
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <button disabled={isProcessing || !stripe || !elements} id="submit" className="web3-button" style={{ width: '100%', marginTop: '2rem' }}>
                <span>{isProcessing ? "Pagamento in corso..." : "Paga ora"}</span>
            </button>
            {message && <div style={{ color: '#f85149', marginTop: '1rem' }}>{message}</div>}
        </form>
    );
};

// --- Componente Popup Successo ---
const SuccessPopup: React.FC = () => {
    const handleRedirect = () => {
        // Reindirizza alla pagina aziendapage.html
        window.location.href = '/aziendapage.html';
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Acquisto Completato!</h2>
                <p>Complimenti, hai completato il tuo acquisto su EasyChain.</p>
                <button onClick={handleRedirect} className="web3-button" style={{marginTop: "1.5rem"}}>
                    Torna alla Dashboard
                </button>
            </div>
        </div>
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
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const fetchAllData = useCallback(async () => {
        if (!account) return;
        
        setLoading(true);
        setError(null);
        try {
            await signInAnonymously(auth);

            // Fetch dati azienda
            const companyDocRef = doc(db, 'activeCompanies', account.address);
            const companyDocSnap = await getDoc(companyDocRef);

            if (companyDocSnap.exists()) {
                const data = companyDocSnap.data();
                setUserData({
                    companyName: data.companyName,
                    credits: data.credits,
                    status: data.status,
                    email: data.contactEmail,
                });

                // Fetch dati fatturazione
                const billingDocRef = doc(db, 'Fatturazione', account.address);
                const billingDocSnap = await getDoc(billingDocRef);
                if (billingDocSnap.exists()) {
                    setBillingDetails(billingDocSnap.data() as BillingDetails);
                    setIsEditingBilling(false);
                } else {
                    setBillingDetails(null);
                    setIsEditingBilling(true); // Forza l'inserimento se non ci sono dati
                }

            } else {
                throw new Error('Nessuna azienda attiva trovata per questo wallet.');
            }
        } catch (err: any) {
            setError(err.message || "Impossibile caricare i dati.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [account]);

    useEffect(() => {
        if (account) {
            fetchAllData();
        } else {
            setLoading(false);
            setUserData(null);
            setBillingDetails(null);
        }
    }, [account, fetchAllData]);

    const handleSelectPackage = async (pkg: CreditPackage) => {
        setSelectedPackage(pkg);
        setClientSecret(null);

        if (!billingDetails) {
            setIsEditingBilling(true);
            return;
        }

        try {
            // Qui dovresti chiamare un backend sicuro (es. una Cloud Function) per creare il Payment Intent
            // Per semplicità, simulo una chiamata a un endpoint API
            const response = await fetch(`https://your-backend-url/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: pkg.totalPrice * 100 }),
            });
            if (!response.ok) throw new Error(`Errore dal server`);
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
            const billingDocRef = doc(db, 'Fatturazione', account.address);
            await setDoc(billingDocRef, details, { merge: true }); // setDoc sovrascrive, che è il comportamento richiesto
            setBillingDetails(details);
            setIsEditingBilling(false);

            if (selectedPackage) {
                await handleSelectPackage(selectedPackage);
            }
        } catch (err: any) {
            setError('Salvataggio dei dati di fatturazione fallito.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };
    
    const onPaymentSuccess = async () => {
        if (!account || !selectedPackage || !userData) return;
        
        try {
            const companyDocRef = doc(db, 'activeCompanies', account.address);
            const newCredits = (userData.credits || 0) + selectedPackage.credits;

            await setDoc(companyDocRef, { credits: newCredits }, { merge: true });
            
            setShowSuccessPopup(true);
        } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti:", error);
            setError("Il pagamento è andato a buon fine, ma c'è stato un problema con l'aggiornamento dei crediti. Contatta l'assistenza.");
        }
    };

    const renderContent = () => {
        if (loading) return <div className="centered-container"><p>Caricamento dati utente...</p></div>;
        if (error) return <div className="centered-container"><p style={{ color: "#f85149" }}>{error}</p></div>;
        if (!userData) return <div className="centered-container"><p>Nessun dato utente trovato.</p></div>;

        return (
            <div className="recharge-container">
                <div className="info-card">
                    <h2>Riepilogo Account</h2>
                    <div className="user-info-grid">
                        <p><strong>Nome:</strong> {userData.companyName}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>Crediti Rimanenti:</strong> {userData.credits}</p>
                        <p><strong>Stato:</strong> <strong className={userData.status === 'active' ? 'status-active-text' : 'status-inactive-text'}>
                            {userData.status === 'active' ? 'Attivo' : 'Disattivo'}
                        </strong></p>
                    </div>
                </div>

                <div className="info-card">
                    <h2>Seleziona un Pacchetto Crediti</h2>
                    <table className="credit-packages-table">
                        <thead><tr><th>Crediti</th><th>Prezzo per credito</th><th>Prezzo totale</th></tr></thead>
                        <tbody>
                            {creditPackages.map(pkg => (
                                <tr key={pkg.id} onClick={() => handleSelectPackage(pkg)} className={selectedPackage?.id === pkg.id ? 'selected' : ''}>
                                    <td><strong>{pkg.credits}</strong></td>
                                    <td>{pkg.pricePerCredit.toFixed(2)} €</td>
                                    <td><strong>{pkg.totalPrice.toFixed(2)} €</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedPackage && (
                    <div className="info-card">
                        {billingDetails && !isEditingBilling ? (
                            <div>
                                <div className="billing-header">
                                    <h3>Dati di Fatturazione</h3>
                                    <button className="edit-button" onClick={() => setIsEditingBilling(true)}>Modifica</button>
                                </div>
                                {billingDetails.type === 'azienda' ? (
                                    <>
                                        <p><strong>Ragione Sociale:</strong> {billingDetails.ragioneSociale}</p>
                                        <p><strong>P.IVA:</strong> {billingDetails.pIvaCf}</p>
                                        <p><strong>SDI/PEC:</strong> {billingDetails.sdiPec}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Nome:</strong> {billingDetails.nome} {billingDetails.cognome}</p>
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
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ borderTop: '1px solid #30363d', paddingTop: '1.5rem' }}>Procedi con il Pagamento</h3>
                                <Elements options={{ clientSecret }} stripe={stripePromise}>
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
            <RicaricaCreditiStyles />
            {showSuccessPopup && <SuccessPopup />}
            <div className="app-container-full">
                <header className="main-header-bar">
                    <h1 className="header-title">EasyChain - Ricarica Crediti</h1>
                    <ConnectButton client={client} wallets={[inAppWallet()]} chain={polygon} />
                </header>
                <main style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                    {!account ? (
                        <div className="centered-container">
                            <h1>Connetti il tuo Wallet</h1>
                            <p>Per visualizzare e ricaricare i tuoi crediti, connetti il wallet associato alla tua azienda.</p>
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

