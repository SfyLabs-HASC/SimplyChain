import React, { useState, useEffect } from 'react';
// Importa le funzioni di Firebase Firestore
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
// Importa la configurazione di Firebase (assicurati che il percorso sia corretto)
// import { app } from '../firebase-config'; 

// --- INIZIALIZZAZIONE FIREBASE (DA DECOMMENTARE) ---
// const db = getFirestore(app);

// --- SIMULAZIONE DELL'HOOK useActiveAccount ---
// Mantengo questa simulazione per evitare errori di compilazione nel preview.
// Nel tuo ambiente di sviluppo, dovrai sostituirla con il vero import:
// import { useActiveAccount } from "thirdweb/react";
const useActiveAccount = () => {
    // Restituisce un oggetto account fittizio per scopi di test
    // In produzione, questo conterrà il vero wallet dell'utente.
    return {
        address: '0x1234567890AbCdEf1234567890aBcDeF12345678' 
    };
};


// --- COMPONENTE PRINCIPALE ---

export default function RicaricaCreditiPage() {
    // Hook per ottenere l'account (wallet) connesso
    const account = useActiveAccount();

    // --- STATI DEL COMPONENTE ---
    const [userData, setUserData] = useState(null);
    const [pacchettoScelto, setPacchettoScelto] = useState(null);
    const [showBillingForm, setShowBillingForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Dati per il selettore dei pacchetti
    const pacchetti = [
        { id: '10', crediti: 10, prezzoPerCredito: 0.20, prezzoTotale: 2.00 },
        { id: '50', crediti: 50, prezzoPerCredito: 0.12, prezzoTotale: 6.00 },
        { id: '100', crediti: 100, prezzoPerCredito: 0.10, prezzoTotale: 10.00 },
        { id: '500', crediti: 500, prezzoPerCredito: 0.09, prezzoTotale: 45.00 },
        { id: '1000', crediti: 1000, prezzoPerCredito: 0.07, prezzoTotale: 70.00 },
    ];

    // --- EFFETTI ---
    // Carica i dati dell'utente da Firebase
    useEffect(() => {
        const loadData = async () => {
            if (!account || !account.address) {
                setError("Per favore, connetti il tuo wallet per continuare.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // --- INTEGRAZIONE FIREBASE REALE ---
                // La collezione in Firestore si chiama 'companies' e il documento ha come ID l'indirizzo del wallet.
                const userRef = doc(db, 'companies', account.address); 
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const firebaseData = userSnap.data();
                    // Mappiamo i dati di Firebase con i nomi usati nel componente
                    const formattedData = {
                        nomeAzienda: firebaseData.companyName,
                        crediti: firebaseData.credits,
                        stato: firebaseData.status === 'active' ? 'Attivo' : 'Non Attivo',
                        datiFatturazione: firebaseData.datiFatturazione || null // Carica anche i dati di fatturazione se esistono
                    };
                    setUserData(formattedData);
                } else {
                    setError("Dati azienda non trovati. Assicurati di aver completato la registrazione.");
                }
                
            } catch (e) {
                console.error("Errore nel caricamento dati da Firebase:", e);
                setError("Si è verificato un errore durante il caricamento dei dati.");
            } finally {
                setIsLoading(false);
            }
        };

        // Decommenta la riga seguente per usare i dati reali
        // loadData();

        // --- Logica di Esempio (rimuovi/commenta quando attivi la logica reale) ---
        // Questa parte serve solo per far visualizzare la pagina senza una connessione a Firebase
        console.log(`Modalità Sviluppo: Dati mock per l'utente: ${account.address}`);
        setTimeout(() => {
            const mockFirebaseData = {
                companyName: 'La Mia Azienda SRL (Dati Finti)',
                credits: 210,
                status: 'active',
                datiFatturazione: null,
            };
            const formattedData = {
                nomeAzienda: mockFirebaseData.companyName,
                crediti: mockFirebaseData.credits,
                stato: mockFirebaseData.status === 'active' ? 'Attivo' : 'Non Attivo',
                datiFatturazione: mockFirebaseData.datiFatturazione
            };
            setUserData(formattedData);
            setIsLoading(false);
        }, 1000);


    }, [account]);

    // --- GESTORI DI EVENTI ---
    const handlePackageSelect = (event) => {
        const selectedId = event.target.value;
        const pacchetto = pacchetti.find(p => p.id === selectedId) || null;
        setPacchettoScelto(pacchetto);
    };

    const handlePaymentStart = () => {
        if (!pacchettoScelto) {
            alert("Per favore, seleziona un pacchetto di crediti.");
            return;
        }
        if (!userData.datiFatturazione) {
            setShowBillingForm(true);
        } else {
            console.log('Dati di fatturazione trovati. Procedo al pagamento con:', userData.datiFatturazione);
            alert(`Procedendo al pagamento di ${pacchettoScelto.prezzoTotale.toFixed(2)} €...`);
        }
    };

    const handleBillingDataSaved = (newData) => {
        setUserData(prev => ({ ...prev, datiFatturazione: newData }));
        setShowBillingForm(false);
        console.log('Dati salvati, ora puoi procedere al pagamento.');
        alert(`Dati di fatturazione salvati! Procedendo al pagamento di ${pacchettoScelto.prezzoTotale.toFixed(2)} €...`);
    };

    // --- RENDER ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><div className="text-xl font-semibold">Caricamento dati azienda...</div></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><div className="text-xl font-semibold text-red-500 p-4 text-center">{error}</div></div>;
    }
    
    if (!userData) {
         return <div className="flex justify-center items-center h-screen bg-gray-100"><div className="text-xl font-semibold">Nessun dato utente trovato.</div></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                    <header className="border-b pb-4 mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{userData.nomeAzienda}</h1>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-gray-600">
                            <p><strong>Crediti Rimanenti:</strong> <span className="font-mono text-blue-600">{userData.crediti}</span></p>
                            <p><strong>Stato Account:</strong> <span className="text-green-600 font-semibold">{userData.stato}</span></p>
                        </div>
                    </header>

                    <main>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Ricarica Crediti</h2>
                        
                        <label htmlFor="credit-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Scegli il pacchetto
                        </label>
                        <select
                            id="credit-select"
                            onChange={handlePackageSelect}
                            defaultValue=""
                            className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="" disabled>Seleziona un'opzione...</option>
                            {pacchetti.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.crediti} crediti @ {p.prezzoPerCredito.toFixed(2)}€/cad = {p.prezzoTotale.toFixed(2)}€
                                </option>
                            ))}
                        </select>

                        {pacchettoScelto && (
                            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800">Riepilogo</h3>
                                <p className="text-gray-600">Pacchetto: {pacchettoScelto.crediti} crediti</p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                    Prezzo Totale: {pacchettoScelto.prezzoTotale.toFixed(2)} €
                                </p>
                            </div>
                        )}

                        <div className="mt-8">
                            {showBillingForm ? (
                                <FormFatturazione 
                                    onSave={handleBillingDataSaved} 
                                    isSaving={isSaving}
                                    setIsSaving={setIsSaving}
                                    account={account}
                                />
                            ) : (
                                <MetodiPagamento 
                                    onPaymentStart={handlePaymentStart} 
                                    disabled={!pacchettoScelto}
                                />
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}


// --- SOTTO-COMPONENTI INTERNI ---

function MetodiPagamento({ onPaymentStart, disabled }) {
    return (
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Scegli come pagare</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    onClick={onPaymentStart}
                    disabled={disabled}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Paga con Carta / Stripe
                </button>
                <button 
                    onClick={onPaymentStart}
                    disabled={disabled}
                    className="w-full sm:w-auto px-8 py-3 bg-yellow-400 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Paga con PayPal
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Accettiamo Visa, Mastercard e American Express.</p>
        </div>
    );
}

function FormFatturazione({ onSave, isSaving, setIsSaving, account }) {
    const [tipoCliente, setTipoCliente] = useState('privato');
    const [formData, setFormData] = useState({
        nomeCognome: '', indirizzoPrivato: '', codiceFiscale: '',
        denominazioneSociale: '', indirizzoAzienda: '', pIva: '', codiceUnivoco: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!account || !account.address) {
            alert("Errore: indirizzo wallet non trovato.");
            return;
        }
        setIsSaving(true);
        
        const dataToSave = { tipo: tipoCliente };
        if (tipoCliente === 'privato') {
            dataToSave.nomeCognome = formData.nomeCognome;
            dataToSave.indirizzo = formData.indirizzoPrivato;
            dataToSave.codiceFiscale = formData.codiceFiscale;
        } else {
            dataToSave.denominazioneSociale = formData.denominazioneSociale;
            dataToSave.indirizzo = formData.indirizzoAzienda;
            dataToSave.pIva = formData.pIva;
            dataToSave.codiceUnivoco = formData.codiceUnivoco;
        }

        try {
            // --- INTEGRAZIONE FIREBASE REALE ---
            const userRef = doc(db, 'companies', account.address);
            await updateDoc(userRef, { datiFatturazione: dataToSave });

            onSave(dataToSave);
        } catch (e) {
            console.error("Errore nel salvataggio dei dati di fatturazione:", e);
            alert("Si è verificato un errore durante il salvataggio.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">Completa i dati di fatturazione</h3>
            
            <fieldset className="flex gap-4">
                <legend className="text-sm font-medium text-gray-700 mb-2">Tipo di cliente</legend>
                <label className="flex items-center">
                    <input type="radio" value="privato" checked={tipoCliente === 'privato'} onChange={() => setTipoCliente('privato')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="ml-2 text-gray-700">Privato</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" value="azienda" checked={tipoCliente === 'azienda'} onChange={() => setTipoCliente('azienda')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <span className="ml-2 text-gray-700">Azienda</span>
                </label>
            </fieldset>

            <div className="space-y-4">
                {tipoCliente === 'privato' ? (
                    <>
                        <InputField name="nomeCognome" placeholder="Nome e Cognome" value={formData.nomeCognome} onChange={handleInputChange} required />
                        <InputField name="indirizzoPrivato" placeholder="Indirizzo completo" value={formData.indirizzoPrivato} onChange={handleInputChange} required />
                        <InputField name="codiceFiscale" placeholder="Codice Fiscale" value={formData.codiceFiscale} onChange={handleInputChange} required />
                    </>
                ) : (
                    <>
                        <InputField name="denominazioneSociale" placeholder="Denominazione Sociale" value={formData.denominazioneSociale} onChange={handleInputChange} required />
                        <InputField name="indirizzoAzienda" placeholder="Indirizzo completo" value={formData.indirizzoAzienda} onChange={handleInputChange} required />
                        <InputField name="pIva" placeholder="Partita IVA / Codice Fiscale" value={formData.pIva} onChange={handleInputChange} required />
                        <InputField name="codiceUnivoco" placeholder="Codice Univoco o PEC" value={formData.codiceUnivoco} onChange={handleInputChange} required />
                    </>
                )}
            </div>

            <button type="submit" disabled={isSaving} className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400">
                {isSaving ? 'Salvataggio...' : 'Salva e Procedi al Pagamento'}
            </button>
        </form>
    );
}

function InputField({ name, placeholder, value, onChange, required = false }) {
    return (
        <div>
            <label htmlFor={name} className="sr-only">{placeholder}</label>
            <input
                type="text"
                id={name}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
}
