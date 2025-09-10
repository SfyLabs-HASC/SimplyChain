import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit, CreditCard, Wallet, Loader2 } from "lucide-react";

// Interfaccia per i dettagli di fatturazione
export interface BillingDetails {
  type: 'azienda' | 'privato';
  ragioneSociale?: string;
  indirizzo?: string;
  pIvaCf?: string;
  sdiPec?: string;
  nome?: string;
  cognome?: string;
  cf?: string;
}

interface BillingFormProps {
  initialDetails?: BillingDetails | null;
  onSave: (details: BillingDetails) => void;
  isSaving: boolean;
  isEditing: boolean;
  onEdit: () => void;
}

/**
 * Componente BillingForm
 * Un form riutilizzabile per inserire e visualizzare i dati di fatturazione.
 * Gestisce la validazione e la distinzione tra account privati e aziendali.
 */
const BillingForm: React.FC<BillingFormProps> = ({ 
  initialDetails, 
  onSave, 
  isSaving, 
  isEditing, 
  onEdit 
}) => {
  const [type, setType] = useState<'azienda' | 'privato'>(initialDetails?.type || 'azienda');
  const [formData, setFormData] = useState<Partial<BillingDetails>>(initialDetails || {});
  const [errors, setErrors] = useState<Partial<BillingDetails>>({});

  // Funzione di validazione dei campi del form
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
    } else {
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
      const detailsToSave = {
        type,
        ...formData
      } as BillingDetails;
      onSave(detailsToSave);
    }
  };

  // --- Vista di sola lettura ---
  if (initialDetails && !isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            Dati di Fatturazione
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {initialDetails.type === 'azienda' ? (
            <>
              <div className="text-sm"><span className="font-medium text-muted-foreground">Ragione Sociale:</span> <span className="ml-2">{initialDetails.ragioneSociale}</span></div>
              <div className="text-sm"><span className="font-medium text-muted-foreground">Indirizzo:</span> <span className="ml-2">{initialDetails.indirizzo}</span></div>
              <div className="text-sm"><span className="font-medium text-muted-foreground">P.IVA/CF:</span> <span className="ml-2">{initialDetails.pIvaCf}</span></div>
              <div className="text-sm"><span className="font-medium text-muted-foreground">SDI/PEC:</span> <span className="ml-2">{initialDetails.sdiPec}</span></div>
            </>
          ) : (
            <>
              <div className="text-sm"><span className="font-medium text-muted-foreground">Nome:</span> <span className="ml-2">{initialDetails.nome} {initialDetails.cognome}</span></div>
              <div className="text-sm"><span className="font-medium text-muted-foreground">Indirizzo:</span> <span className="ml-2">{initialDetails.indirizzo}</span></div>
              <div className="text-sm"><span className="font-medium text-muted-foreground">Codice Fiscale:</span> <span className="ml-2">{initialDetails.cf}</span></div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // --- Vista form (modifica/inserimento) ---
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {initialDetails ? 'Modifica Dati di Fatturazione' : 'Inserisci i Dati di Fatturazione'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Tipo di account</Label>
          <RadioGroup
            value={type}
            onValueChange={(value) => setType(value as 'azienda' | 'privato')}
            className="flex gap-6"
            disabled={isSaving}
          >
            <div className="flex items-center space-x-2"><RadioGroupItem value="azienda" id="azienda" /><Label htmlFor="azienda">Azienda</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="privato" id="privato" /><Label htmlFor="privato">Privato</Label></div>
          </RadioGroup>
        </div>
        
        {type === 'azienda' ? (
          <>
            <div className="space-y-2"><Label htmlFor="ragioneSociale">Denominazione Sociale</Label><Input id="ragioneSociale" name="ragioneSociale" value={formData.ragioneSociale || ''} onChange={handleInputChange} disabled={isSaving} className={errors.ragioneSociale ? "border-destructive" : ""} /><p className="text-xs text-destructive">{errors.ragioneSociale}</p></div>
            <div className="space-y-2"><Label htmlFor="indirizzo">Indirizzo</Label><Input id="indirizzo" name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} disabled={isSaving} className={errors.indirizzo ? "border-destructive" : ""} /><p className="text-xs text-destructive">{errors.indirizzo}</p></div>
            <div className="space-y-2"><Label htmlFor="pIvaCf">Partita IVA</Label><Input id="pIvaCf" name="pIvaCf" value={formData.pIvaCf || ''} onChange={handleInputChange} disabled={isSaving} className={errors.pIvaCf ? "border-destructive" : ""} /><p className="text-xs text-destructive">{errors.pIvaCf}</p></div>
            <div className="space-y-2"><Label htmlFor="sdiPec">Codice Univoco (SDI) o PEC</Label><Input id="sdiPec" name="sdiPec" value={formData.sdiPec || ''} onChange={handleInputChange} disabled={isSaving} className={errors.sdiPec ? "border-destructive" : ""} /><p className="text-xs text-destructive">{errors.sdiPec}</p></div>
          </>
        ) : (
          <>
            <div className="space-y-2"><Label htmlFor="nome">Nome</Label><Input id="nome" name="nome" value={formData.nome || ''} onChange={handleInputChange} disabled={isSaving} className={errors.nome ? "border-destructive" : ""} /><p className="text-xs text-destructive">{errors.nome}</p></div>
            <div className="space-y-2"><Label htmlFor="cognome">Cognome</Label><Input id="cognome" name="cognome" value={formData.cognome || ''} onChange={handleInputChange} disabled={isSaving} className={errors.cognome ? "border-destructive" : ""} /><p className="text-xs text-destructive">{errors.cognome}</p></div>
            <div className="space-y-2"><Label htmlFor="indirizzo">Indirizzo</Label><Input id="indirizzo" name="indirizzo" value={formData.indirizzo || ''} onChange={handleInputChange} disabled={isSaving} className={errors.indirizzo ? "border-destructive" : ""} /><p className="text-xs text-destructive">{errors.indirizzo}</p></div>
            <div className="space-y-2"><Label htmlFor="cf">Codice Fiscale</Label><Input id="cf" name="cf" value={formData.cf || ''} onChange={handleInputChange} disabled={isSaving} className={errors.cf ? "border-destructive" : ""} /><p className="text-xs text-destructive">{errors.cf}</p></div>
          </>
        )}
        
        <Button onClick={handleSave} className="w-full" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Salvataggio...' : 'Salva Dati'}
        </Button>
      </CardContent>
    </Card>
  );
};


/**
 * Pagina RicaricaCreditiPage
 * Pagina principale che orchestra il processo di ricarica.
 * L'utente prima seleziona un importo e poi inserisce o conferma i dati di fatturazione.
 * Solo dopo aver salvato i dati di fatturazione può procedere al pagamento.
 */
function RicaricaCreditiPage() {
  const [selectedCredits, setSelectedCredits] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');

  // Stato per gestire i dati di fatturazione, la modalità di modifica e il caricamento
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const creditOptions = [10, 25, 50, 100];
  
  const handleSelectCredits = (amount: number) => {
    setSelectedCredits(amount);
    setCustomAmount('');
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    if(value) {
        setSelectedCredits(parseInt(value, 10));
    }
  }

  // Funzione per salvare i dati (simula una chiamata API)
  const handleSaveDetails = (details: BillingDetails) => {
    setIsSaving(true);
    console.log("Salvataggio dei dati:", details);
    setTimeout(() => {
      setBillingDetails(details);
      setIsSaving(false);
      setIsEditing(false); // Passa alla modalità di visualizzazione dopo il salvataggio
    }, 1500); // Simula un ritardo di rete
  };
  
  // Funzione per entrare in modalità modifica
  const handleEditDetails = () => {
    setIsEditing(true);
  };

  const canProceedToPayment = billingDetails && !isEditing;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Ricarica Crediti</h1>
          <p className="text-muted-foreground mt-1">Scegli l'importo da ricaricare e completa i tuoi dati per procedere.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonna 1: Scelta crediti e Riepilogo */}
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle>1. Scegli un importo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {creditOptions.map(amount => (
                    <Button 
                      key={amount} 
                      variant={selectedCredits === amount && !customAmount ? 'default' : 'outline'}
                      onClick={() => handleSelectCredits(amount)}
                      className="h-16 text-lg"
                    >
                      {amount}€
                    </Button>
                  ))}
                </div>
                <div>
                  <Label htmlFor="custom-amount">Oppure inserisci un importo personalizzato</Label>
                  <Input 
                    id="custom-amount"
                    type="text"
                    placeholder="Es: 150"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={canProceedToPayment ? 'border-primary' : ''}>
              <CardHeader><CardTitle>3. Procedi al Pagamento</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-muted-foreground">
                   {canProceedToPayment 
                     ? `Stai per acquistare ${selectedCredits}€ di crediti. Clicca su "Paga Ora" per completare l'operazione.`
                     : 'Completa e salva i dati di fatturazione per poter procedere al pagamento.'
                   }
                 </p>
                <Button size="lg" className="w-full" disabled={!canProceedToPayment}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Paga Ora {selectedCredits}€
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Colonna 2: Dati di Fatturazione */}
          <div className="space-y-8">
             <Card>
                <CardHeader><CardTitle>2. Dati per la Fattura</CardTitle></CardHeader>
                <CardContent>
                    <BillingForm 
                      initialDetails={billingDetails}
                      onSave={handleSaveDetails}
                      isSaving={isSaving}
                      isEditing={isEditing}
                      onEdit={handleEditDetails}
                    />
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RicaricaCreditiPage;
