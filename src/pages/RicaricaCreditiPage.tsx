import React, { useState, useEffect, useCallback } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
// Assuming 'client' is a correctly configured ThirdwebClient instance
import { client } from '../client';


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

// --- Setup ---
// Vite exposes import.meta.env. A fallback to a test key is used only in development.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51PTestKeyEXAMPLE...");

// --- Credit Packages ---
const creditPackages: CreditPackage[] = [
    { id: 'price_1', credits: 10, pricePerCredit: 0.20, totalPrice: 2.00, description: 'Pacchetto 10 crediti' },
    { id: 'price_2', credits: 50, pricePerCredit: 0.12, totalPrice: 6.00, description: 'Pacchetto 50 crediti' },
    { id: 'price_3', credits: 100, pricePerCredit: 0.10, totalPrice: 10.00, description: 'Pacchetto 100 crediti' },
    { id: 'price_4', credits: 500, pricePerCredit: 0.09, totalPrice: 45.00, description: 'Pacchetto 500 crediti' },
    { id: 'price_5', credits: 1000, pricePerCredit: 0.07, totalPrice: 70.00, description: 'Pacchetto 1000 crediti' },
];

// --- Billing Form Component ---
const BillingForm: React.FC<{ initialDetails?: BillingDetails | null, onSave: (details: BillingDetails) => void, isSaving: boolean }> = ({ initialDetails, onSave, isSaving }) => {
    const [type, setType] = useState<'azienda' | 'privato'>(initialDetails?.type || 'azienda');
    const [formData, setFormData] = useState<Partial<BillingDetails>>(initialDetails || {});
    const [errors, setErrors] = useState<Partial<Record<keyof BillingDetails, string>>>({});

    useEffect(() => {
        if (initialDetails) {
            setType(initialDetails.type || 'azienda');
            setFormData(initialDetails);
        }
    }, [initialDetails]);

    const validate = () => {
        const newErrors: Partial<Record<keyof BillingDetails, string>> = {};
        if (type === 'azienda') {
            if (!formData.ragioneSociale?.trim()) newErrors.ragioneSociale = "La denominazione sociale è obbligatoria.";
            if (!formData.indirizzo?.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio.";
            // Correct validation for Italian Partita IVA (11 digits)
            if (!formData.pIvaCf?.trim() || !/^[0-9]{11}$/.test(formData.pIvaCf)) newErrors.pIvaCf = "La Partita IVA deve contenere 11 cifre.";
            if (!formData.sdiPec?.trim()) newErrors.sdiPec = "Il codice SDI o la PEC sono obbligatori.";
        } else {
            if (!formData.nome?.trim()) newErrors.nome = "Il nome è obbligatorio.";
            if (!formData.cognome?.trim()) newErrors.cognome = "Il cognome è obbligatorio.";
            if (!formData.indirizzo?.trim()) newErrors.indirizzo = "L'indirizzo è obbligatorio.";
            // Correct validation for Italian Codice Fiscale (16 alphanumeric chars)
            if (!formData.cf?.trim() || !/^[A-Z0-9]{16}$/i.test(formData.cf)) newErrors.cf = "Il codice fiscale non è valido.";
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
            // Ensure all properties are defined before saving
            const detailsToSave: BillingDetails = type === 'azienda'
                ? { type, ragioneSociale: formData.ragioneSociale || '', indirizzo: formData.indirizzo || '', pIvaCf: formData.pIvaCf || '', sdiPec: formData.sdiPec || '' }
                : { type, nome: formData.nome || '', cognome: formData.cognome || '', indirizzo: formData.indirizzo || '', cf: formData.cf || '' };
            onSave(detailsToSave);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" value="azienda" checked={type === 'azienda'} onChange={() => setType('azienda')} disabled={isSaving} /> Azienda</label>
                    <label className="flex items-center gap-2"><input type="radio" value="privato" checked={type === 'privato'} onChange={() => setType('privato')} disabled={isSaving} /> Privato</label>
                </div>
            </div>
            {type === 'azienda' ? (
                <>
                    <div className="mb-4"><label className="block mb-2">Denominazione Sociale</label><input type="text" name="ragioneSociale" value={formData.ragioneSociale || ''} onChange={handleInputChange} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground" disabled={isSaving} />{errors.ragioneSociale && <p className="text-destructive text-sm mt-1">{errors.ragioneSociale}</p>}</div>
                    <div className="mb-4"><label className="block mb-2">Indirizzo</label><input type="text" name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground" disabled={isSaving} />{errors.indirizzo && <p className="text-destructive text-sm mt-1">{errors.indirizzo}</p>}</div>
                    <div className="mb-4"><label className="block mb-2">Partita IVA</label><input type="text" name="pIvaCf" value={formData.pIvaCf || ''} onChange={handleInputChange} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground" disabled={isSaving} />{errors.pIvaCf && <p className="text-destructive text-sm mt-1">{errors.pIvaCf}</p>}</div>
                    <div className="mb-4"><label className="block mb-2">Codice Univoco (SDI) o PEC</label><input type="text" name="sdiPec" value={formData.sdiPec || ''} onChange={handleInputChange} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground" disabled={isSaving} />{errors.sdiPec && <p className="text-destructive text-sm mt-1">{errors.sdiPec}</p>}</div>
                </>
            ) : (
                <>
                    <div className="mb-4"><label className="block mb-2">Nome</label><input type="text" name="nome" value={formData.nome || ''} onChange={handleInputChange} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground" disabled={isSaving} />{errors.nome && <p className="text-destructive text-sm mt-1">{errors.nome}</p>}</div>
                    <div className="mb-4"><label className="block mb-2">Cognome</label><input type="text" name="cognome" value={formData.cognome || ''} onChange={handleInputChange} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground" disabled={isSaving} />{errors.cognome && <p className="text-destructive text-sm mt-1">{errors.cognome}</p>}</div>
                    <div className="mb-4"><label className="block mb-2">Indirizzo</label><input type="text" name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground" disabled={isSaving} />{errors.indirizzo && <p className="text-destructive text-sm mt-1">{errors.indirizzo}</p>}</div>
                    <div className="mb-4"><label className="block mb-2">Codice Fiscale</label><input type="text" name="cf" value={formData.cf || ''} onChange={handleInputChange} className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground" disabled={isSaving} />{errors.cf && <p className="text-destructive text-sm mt-1">{errors.cf}</p>}</div>
                </>
            )}
            <button onClick={handleSave} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 smooth-transition w-full mt-4" disabled={isSaving}>
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

        const { error } = await stripe.confirmPayment({
            elements,
            redirect: "if_required" // Prevents redirect
        });

        if (error) {
            setMessage(error.message || "Errore sconosciuto durante il pagamento.");
            setIsProcessing(false); // FIXED: Re-enable button on error
        } else {
            // Payment successful on client, now notify server
            onPaymentSuccess();
            // The parent component will handle the final processing state
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <button disabled={isProcessing || !stripe || !elements} id="submit" className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 smooth-transition w-full mt-8">
                <span>{isProcessing ? "Pagamento in corso..." : "Paga ora"}</span>
            </button>
            {message && <div className="text-destructive mt-4">{message}</div>}
        </form>
    );
};

// --- Success Popup Component ---
const SuccessPopup: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="glass-card rounded-2xl p-8 tech-shadow text-center max-w-md w-[90%]">
                <h2 className="text-2xl font-bold text-accent mb-2">Acquisto completato!</h2>
                <p className="mb-6">I tuoi crediti sono stati aggiunti al tuo account.</p>
                <a href="/azienda" className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 smooth-transition">
                    Torna alla dashboard
                </a>
            </div>
        </div>
    );
};


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
    const [isFulfilling, setIsFulfilling] = useState(false); // NEW: State for final fulfillment step
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const fetchAllData = useCallback(async () => {
        if (!account) return;
        setLoading(true);
        setError(null);
        try {
            // Using a more semantic API endpoint
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
                setBillingDetails(data.billingDetails as BillingDetails);
                setIsEditingBilling(false);
            } else {
                setBillingDetails(null);
                setIsEditingBilling(true); // Force user to enter details if missing
            }
        } catch (err: any) {
            setError(err.message || 'Impossibile caricare i dati.');
        } finally {
            setLoading(false);
        }
    }, [account]);

    useEffect(() => {
        if (account) {
            fetchAllData();
        } else {
            setLoading(false); // Not loading if there's no account
            setUserData(null);
            setBillingDetails(null);
        }
    }, [account, fetchAllData]);

    const handleSelectPackage = async (pkg: CreditPackage) => {
        setSelectedPackage(pkg);
        setClientSecret(null); // Reset previous payment intent
        setError(null);

        if (!billingDetails) {
            setIsEditingBilling(true);
            return; // Wait for user to save billing details
        }

        try {
            // Using a more semantic API endpoint
            const response = await fetch(`/api/payments/create-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: pkg.totalPrice * 100, walletAddress: account?.address }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Errore dal server');
            }
            const data = await response.json();
            setClientSecret(data.clientSecret);
        } catch (error: any) {
            setError(error.message || "Non è stato possibile avviare il pagamento. Riprova.");
        }
    };

    const handleSaveBilling = async (details: BillingDetails) => {
        if (!account) return;
        setIsSaving(true);
        setError(null);
        try {
            // Using a more semantic API endpoint
            const response = await fetch('/api/company/save-billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: account.address, details })
            });
            if (!response.ok) throw new Error('Salvataggio dei dati di fatturazione fallito.');

            setBillingDetails(details);
            setIsEditingBilling(false);

            // If a package was already selected, proceed to create the payment intent
            if (selectedPackage) {
                await handleSelectPackage(selectedPackage);
            }
        } catch (err: any) {
            setError(err.message || 'Salvataggio dei dati di fatturazione fallito.');
        } finally {
            setIsSaving(false);
        }
    };

    // CRITICAL FIX: This function now tells the backend to credit the user's account
    const onPaymentSuccess = async () => {
        if (!account || !selectedPackage) return;

        setIsFulfilling(true);
        setError(null);

        try {
            // Using a more semantic API endpoint
            const response = await fetch('/api/payments/fulfill-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: account.address,
                    packageId: selectedPackage.id,
                    creditsPurchased: selectedPackage.credits
                })
            });
            if (!response.ok) throw new Error('Errore durante l\'aggiornamento dei crediti.');

            // Success!
            setShowSuccessPopup(true);
            // Optionally, refetch data to show updated credit balance immediately
            await fetchAllData();

        } catch (err: any) {
            setError(err.message || "Il tuo pagamento è andato a buon fine, ma c'è stato un problema ad aggiungere i crediti. Contatta l'assistenza.");
        } finally {
            setIsFulfilling(false);
            setClientSecret(null); // Clear the used payment intent
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
        if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-center p-6"><p>Caricamento dati utente...</p></div>;
        if (error && !showSuccessPopup) return <div className="flex items-center justify-center min-h-[60vh] text-center p-6"><p className="text-destructive">{error}</p></div>;
        if (!userData) return <div className="flex items-center justify-center min-h-[60vh] text-center p-6"><p>Nessun dato utente trovato.</p></div>;

        return (
            <div className="container mx-auto px-6 py-6 max-w-5xl">
                <div className="glass-card rounded-2xl p-6 tech-shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">Riepilogo Account</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p className="m-0"><strong>Nome:</strong> {userData.companyName}</p>
                        <p className="m-0"><strong>Email:</strong> {userData.email}</p>
                        <p className="m-0"><strong>Crediti Rimanenti:</strong> {userData.credits}</p>
                        <p className="m-0"><strong>Stato:</strong> <strong className={userData.status === 'active' ? 'text-green-500' : 'text-yellow-500'}>
                            {userData.status === 'active' ? 'Attivo' : 'Disattivo'}
                        </strong></p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 tech-shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">Seleziona un Pacchetto Crediti</h2>
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-muted-foreground text-sm">
                                <th className="text-left py-2">Crediti</th>
                                <th className="text-left py-2">Prezzo per credito</th>
                                <th className="text-left py-2">Prezzo totale</th>
                            </tr>
                        </thead>
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

                {selectedPackage && (
                    <div className="glass-card rounded-2xl p-6 tech-shadow">
                        {billingDetails && !isEditingBilling ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Dati di Fatturazione</h3>
                                    <button className="text-accent border border-border rounded-md px-3 py-1 hover:bg-border/20 smooth-transition" onClick={() => setIsEditingBilling(true)}>Modifica</button>
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
                        
                        {!isEditingBilling && clientSecret && (
                            <div className="mt-8 border-t border-border pt-6">
                                <h3 className="text-lg font-semibold mb-4">Procedi con il Pagamento</h3>
                                {/* ROBUSTNESS: Added key prop to ensure Elements re-initializes on secret change */}
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
            <div className="min-h-screen bg-background px-6 py-6 container mx-auto">
                <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 p-6 rounded-2xl border border-border">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">EasyChain - Ricarica Crediti</h1>
                    <ConnectButton 
                        client={client} 
                        wallets={[inAppWallet()]}
                        chain={polygon}
                        accountAbstraction={{ chain: polygon, sponsorGas: true }}
                    />
                </header>
                <main>
                    {!account ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                            <h1 className="text-2xl font-bold mb-2">Connetti il tuo Wallet</h1>
                            <p>Per visualizzare e ricaricare i tuoi crediti, connetti il wallet associato alla tua azienda.</p>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </main>
            </div>
        </>
    );
}

