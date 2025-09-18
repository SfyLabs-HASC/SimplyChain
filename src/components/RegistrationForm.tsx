// FILE: src/components/RegistrationForm.tsx
// DESCRIZIONE: Versione corretta che include la chiamata 'fetch' all'API
// per inviare effettivamente i dati di registrazione al tuo backend.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface RegistrationFormProps {
  walletAddress: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ walletAddress }) => {
  const [formData, setFormData] = useState({
    companyName: "", contactEmail: "", sector: "", userType: "azienda", website: "", facebook: "", instagram: "", twitter: "", tiktok: "",
  });
  const [status, setStatus] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactEmail || !formData.sector) {
      setStatus({ message: "Nome azienda, email e settore sono campi obbligatori.", type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatus({ message: "Invio della richiesta in corso...", type: 'info' });

    try {
      // --- MODIFICA CHIAVE: Eseguire la vera chiamata API al tuo backend ---
      const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, walletAddress }),
      });

      if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || "Si è verificato un errore durante l'invio.");
      }
      
      setStatus({ message: "Richiesta inviata con successo! Verrai ricontattato dopo l'approvazione del tuo account.", type: 'success' });

    } catch (error) {
      setStatus({ message: (error as Error).message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (status?.type === 'success') {
    return (
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h3>Richiesta Inviata!</h3>
        <p>{status.message}</p>
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #333' }}>
          <Link to="/" className="back-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}>
            <ArrowLeft size={16} />
            Torna alla Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: '2rem', maxWidth: '700px', margin: '2rem auto', textAlign: 'left' }}>
      <h3 style={{ color: '#fff' }}>Benvenuto su SimplyChain</h3>
      <p style={{ color: '#9ca3af' }}>Il tuo account non è ancora attivo. Compila il form di registrazione per inviare una richiesta di attivazione.</p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Sei un* (obbligatorio)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label><input type="radio" name="userType" value="azienda" checked={formData.userType === 'azienda'} onChange={handleInputChange} /> Azienda</label>
            <label><input type="radio" name="userType" value="privato" checked={formData.userType === 'privato'} onChange={handleInputChange} /> Privato</label>
          </div>
        </div>
        <div className="form-group"><label>Nome Azienda *</label><input type="text" name="companyName" className="form-input" onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Email di Contatto *</label><input type="email" name="contactEmail" className="form-input" onChange={handleInputChange} required /></div>
        <div className="form-group"><label>Settore di Attività *</label>
          <select name="sector" className="form-input" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }} onChange={handleInputChange} required defaultValue="">
            <option value="" disabled>Seleziona un settore...</option>
            <option value="Agroalimentare">Agroalimentare</option>
            <option value="Moda e Tessile">Moda e Tessile</option>
            <option value="Arredamento e Design">Arredamento e Design</option>
            <option value="Farmaceutico">Farmaceutico</option>
            <option value="Logistica e Trasporti">Logistica e Trasporti</option>
            <option value="Energia e Ambiente">Energia e Ambiente</option>
            <option value="Chimico e Materiali">Chimico e Materiali</option>
            <option value="Tecnologia e Elettronica">Tecnologia e Elettronica</option>
            <option value="Cosmetica e Cura Personale">Cosmetica e Cura Personale</option>
            <option value="Edilizia e Infrastrutture">Edilizia e Infrastrutture</option>
            <option value="Servizi Professionali">Servizi Professionali</option>
            <option value="Turismo e Ospitalità">Turismo e Ospitalità</option>
            <option value="Arte e Artigianato">Arte e Artigianato</option>
            <option value="Altro">Altro</option>
          </select>
        </div>
        <div className="form-group"><label>Indirizzo Wallet (automatico)</label><input type="text" className="form-input" value={walletAddress} readOnly disabled /></div>
        <hr style={{margin: '2rem 0', borderColor: '#333'}} />
        <h4>Profili Social (Opzionale)</h4>
        <div className="form-group"><label>Sito Web</label><input type="url" name="website" className="form-input" onChange={handleInputChange} placeholder="https://..." /></div>
        <div className="form-group"><label>Facebook</label><input type="url" name="facebook" className="form-input" onChange={handleInputChange} placeholder="https://facebook.com/..." /></div>
        <div className="form-group"><label>Instagram</label><input type="url" name="instagram" className="form-input" onChange={handleInputChange} placeholder="https://instagram.com/..." /></div>
        <div className="form-group"><label>Twitter / X</label><input type="url" name="twitter" className="form-input" onChange={handleInputChange} placeholder="https://x.com/..." /></div>
        <div className="form-group"><label>TikTok</label><input type="url" name="tiktok" className="form-input" onChange={handleInputChange} placeholder="https://tiktok.com/..." /></div>
        <button type="submit" className="web3-button" disabled={isLoading} style={{width: '100%', marginTop: '1rem'}}>{isLoading ? "Invio in corso..." : "Invia Richiesta di Attivazione"}</button>
        {status && status.type !== 'success' && (<p style={{ marginTop: '1rem', color: status.type === 'error' ? '#ff4d4d' : '#888', textAlign: 'center' }}>{status.message}</p>)}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #333', textAlign: 'center' }}>
          <Link to="/" className="back-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}>
            <ArrowLeft size={16} />
            Torna alla Home
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
