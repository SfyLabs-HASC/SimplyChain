import React, { useState, useEffect } from 'react';
// Importa le librerie di Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// Importa le funzioni di Firebase Firestore
// import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

// --- CONFIGURAZIONE ---

// 1. Inizializza Stripe con la tua chiave PUBBLICA
const stripePromise = loadStripe('pk_test_51RrJLQRx6E9RZt5ynBwc2dt3o7RT4YTwwij3O9xj3VdMwNKlI4GA9Yvbzkgwbxi0I5J9XnqPMlgY7bz2xHSgxmz000KCex9EiA');

// 2. Inizializza Firebase (decommenta nel tuo progetto)
// import { app } from '../firebase-config'; 
// const db = getFirestore(app);

// 3. Simula l'hook per ottenere l'utente loggato (sostituisci con il tuo import reale)
// import { useActiveAccount } from "thirdweb/react";
const useActiveAccount = () => ({ address: '0x38a1FB0e7536b469184843C56eC315dC1AF344D3' });

// --- COMPONENTE CHECKOUT FORM ---

const CheckoutForm = ({ amount, credits, customerEmail, walletAddress, onSuccessfulPayment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                email: customerEmail,
            },
        });

        if (paymentMethodError) {
            setError(paymentMethodError.message);
            setIsProcessing(false);
            return;
        }

        try {
            // Sostituisci con l'URL della tua Cloud Function una volta deployata
            const response = await fetch('https://us-central1-tuo-progetto-firebase.cloudfunctions.net/processStripePayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    amount: amount * 100, // Stripe lavora in centesimi
                    customerEmail: customerEmail,
                    creditsToPurchase: credits,
                    walletAddress: walletAddress,
                }),
            });

            const paymentResult = await response.json();

            if (paymentResult.error) {
                setError(paymentResult.error);
            } else if (paymentResult.success) {
                alert('Pagamento completato! Riceverai una fattura via email.');
                onSuccessfulPayment();
            }
        } catch (err) {
            setError('Impossibile connettersi al server di pagamento. Riprova più tardi.');
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">Inserisci i dati della carta</h3>
            <div className="p-3 bg-white rounded-md border">
                <CardElement options={{ 
                    style: { 
                        base: { 
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    } 
                }} />
            </div>
            {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
            <button 
                type="submit" 
                disabled={!stripe || isProcessing}
                className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Pagamento in corso...' : `Paga ${amount.toFixed(2)} €`}
            </button>
        </form>
    );
};


// --- COMPONENTE PRINCIPALE ---

export default function RicaricaCreditiPage() {
    const account = useActiveAccount();
    const [userData, setUserData] = useState(null);
    const [pacchettoScelto, setPacchettoScelto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const pacchetti = [
        { id: '10', crediti: 10, prezzoTotale: 2.00 },
        { id: '50', crediti: 50, prezzoTotale: 6.00 },
        { id: '100', crediti: 100, prezzoTotale: 10.00 },
        { id: '500', crediti: 500, prezzoTotale: 45.00 },
        { id: '1000', crediti: 1000, prezzoTotale: 70.00 },
    ];

    const loadUserData = async () => {
        if (!account || !account.address) {
            setError("Per favore, connetti il tuo wallet per continuare.");
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            // --- LOGICA DATI REALI (DA DECOMMENTARE) ---
            // const userRef = doc(db, 'companies', account.address);
            // const userSnap = await getDoc(userRef);
            // if (userSnap.exists()) {
            //     const data = userSnap.data();
            //     setUserData({
            //         nomeAzienda: data.companyName,
            //         crediti: data.credits,
            //         stato: data.status === 'active' ? 'Attivo' : 'Non Attivo',
            //         email: data.contactEmail,
            //     });
            // } else {
            //     setError("Dati azienda non trovati.");
            // }

            // --- Logica di Esempio per la preview ---
            // Rimuovi questo blocco quando usi i dati reali
            setTimeout(() => {
                setUserData({
                    nomeAzienda: "Vino SFY",
                    crediti: 193,
                    stato: "Attivo",
                    email: "vinokasjdfkajsdf@gmail.com",
                });
                setIsLoading(false);
            }, 500);

        } catch (e) {
            setError("Errore nel caricamento dei dati.");
            console.error(e);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, [account]);

    if (isLoading) {
        return <div className="text-center p-10">Caricamento...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    if (!userData) {
        return <div className="text-center p-10">Nessun dato trovato per questo account.</div>;
    }

    return (
        <Elements stripe={stripePromise}>
            <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
                    <div className="p-8">
                        <header className="border-b pb-4 mb-6">
                            <h1 className="text-3xl font-bold text-gray-800">{userData.nomeAzienda}</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-gray-600">
                                <p><strong>Email:</strong><br/>{userData.email}</p>
                                <p><strong>Crediti:</strong><br/><span className="font-mono text-blue-600 text-lg">{userData.crediti}</span></p>
                                <p><strong>Stato:</strong><br/><span className="font-semibold text-green-600">{userData.stato}</span></p>
                            </div>
                        </header>

                        <main>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Ricarica Crediti</h2>
                            <select
                                onChange={(e) => setPacchettoScelto(pacchetti.find(p => p.id === e.target.value))}
                                defaultValue=""
                                className="block w-full p-3 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="" disabled>Seleziona un pacchetto...</option>
                                {pacchetti.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.crediti} crediti - {p.prezzoTotale.toFixed(2)} €
                                    </option>
                                ))}
                            </select>

                            {pacchettoScelto && (
                                <div className="mt-8">
                                    <CheckoutForm 
                                        amount={pacchettoScelto.prezzoTotale}
                                        credits={pacchettoScelto.crediti}
                                        customerEmail={userData.email}
                                        walletAddress={account.address}
                                        onSuccessfulPayment={() => {
                                            // Ricarica i dati utente per mostrare i nuovi crediti
                                            loadUserData();
                                            setPacchettoScelto(null);
                                        }}
                                    />
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </Elements>
    );
}
