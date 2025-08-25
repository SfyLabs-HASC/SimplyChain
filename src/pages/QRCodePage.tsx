import React, { useState } from 'react';

// Icona per il download (SVG inlined)
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

// Componente per il popup modale informativo
const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Sfondo semi-trasparente
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose} // Chiude il modale cliccando sullo sfondo
    >
      {/* Contenitore del modale */}
      <div 
        className="bg-gray-800/80 border border-gray-700 backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-2xl w-full text-left relative transform animate-slide-up"
        onClick={(e) => e.stopPropagation()} // Evita la chiusura cliccando sul contenuto
      >
        <h2 className="text-2xl font-bold text-white mb-4">Come funziona? Il controllo è tuo.</h2>
        <p className="text-gray-300 mb-4">
          Il QR Code che generi punterà alla <strong>pagina web di tracciabilità (il file .html) che hai appena creato</strong>. Per renderla accessibile a tutti, devi prima caricarla sul tuo spazio web personale (sito aziendale, server privato, hosting, ecc.).
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>La <strong>pagina di tracciabilità (.html)</strong> è stata appena generata e scaricata sul tuo computer.</li>
          <li><strong>Carica questo file HTML</strong> sul tuo server o hosting (es. via FTP o dal pannello di controllo).</li>
          <li><strong>Copia l'URL pubblico</strong> del file HTML una volta caricato (es. `https://www.mia-azienda.it/tracciabilita/prodotto-123.html`).</li>
          <li><strong>Incolla l'URL</strong> nel campo qui sotto per generare il QR Code corrispondente.</li>
        </ol>
        <p className="mt-6 text-sm text-blue-400 bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
          <strong>Vantaggio:</strong> In questo modo, sei tu il proprietario del link. Puoi aggiornare il file di destinazione in qualsiasi momento senza dover cambiare il QR Code già stampato.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full sm:w-auto float-right bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};


// Componente principale dell'applicazione
export default function App() {
  // --- STATI DEL COMPONENTE ---
  const [url, setUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [size, setSize] = useState(500); // Dimensione predefinita del QR code
  const [error, setError] = useState(''); // Per gestire i messaggi di errore
  const [isModalOpen, setIsModalOpen] = useState(false); // Stato per il modale

  const resolutions = [
    { label: 'Bassa', value: 250 },
    { label: 'Media', value: 500 },
    { label: 'Alta', value: 1000 },
  ];

  /**
   * Gestisce la generazione del QR Code.
   * Valida l'URL e chiama l'API per creare l'immagine.
   */
  const generateQRCode = async () => {
    // Resetta lo stato precedente
    setQrCode('');
    if (!url.trim()) {
      setError('Per favore, inserisci un URL valido.');
      return;
    }
    // Semplice validazione dell'URL
    try {
        new URL(url);
    } catch (_) {
        setError('L\'URL inserito non sembra essere valido. Assicurati che inizi con http:// o https://');
        return;
    }
    setError('');
    setIsGenerating(true);

    try {
      // L'URL dell'API viene costruito dinamicamente con la dimensione scelta
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=png`;
      
      // Per assicurarsi che l'immagine sia caricata prima di mostrarla, la pre-carichiamo
      const img = new Image();
      img.src = qrUrl;
      img.onload = () => {
        setQrCode(qrUrl);
        setIsGenerating(false);
      };
      img.onerror = () => {
        setError('Errore nel caricare l\'immagine del QR Code.');
        setIsGenerating(false);
      }

    } catch (err)
{
      console.error('Errore nella generazione del QR Code:', err);
      setError('Si è verificato un errore imprevisto durante la generazione.');
      setIsGenerating(false);
    }
  };

  /**
   * Gestisce il download del QR Code generato.
   * Usa la Fetch API per scaricare l'immagine come blob e forzare il download.
   */
  const downloadQRCode = async () => {
    if (!qrCode) return;

    try {
      // 1. Scarica l'immagine come dati binari (blob)
      const response = await fetch(qrCode);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      
      // 2. Crea un URL locale temporaneo per il file
      const objectUrl = window.URL.createObjectURL(blob);

      // 3. Crea un link invisibile per avviare il download
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `qrcode-${size}x${size}.png`; // Nome del file dinamico
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 4. Rilascia l'URL temporaneo per liberare memoria
      window.URL.revokeObjectURL(objectUrl);

    } catch (err) {
      console.error('Errore nel download del QR Code:', err);
      setError('Impossibile scaricare il QR Code. Controlla la console per i dettagli.');
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        
        {/* --- INTESTAZIONE --- */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-3">
            Generatore QR Code per Tracciabilità
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-sm sm:text-base">
            Crea un QR Code da applicare ai tuoi prodotti per fornire informazioni di tracciabilità in modo semplice e diretto.
          </p>
        </header>

        {/* --- TRIGGER PER IL MODALE ESPLICATIVO --- */}
        <div className="text-center mb-10">
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 underline decoration-dotted underline-offset-4"
            >
                Come funziona? Il controllo è tuo.
            </button>
        </div>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          
          {/* --- PANNELLO DI CONTROLLO (SINISTRA) --- */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
            
            {/* Input URL */}
            <div className="mb-6">
              <label htmlFor="url-input" className="block text-sm font-medium text-gray-300 mb-2">
                URL pubblico della tua pagina HTML di tracciabilità
              </label>
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
                placeholder="https://il-tuo-sito.com/prodotto.html"
              />
            </div>

            {/* Selettore Risoluzione */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Risoluzione (PNG)
              </label>
              <div className="grid grid-cols-3 gap-2 bg-gray-900 p-1 rounded-lg border border-gray-600">
                {resolutions.map((res) => (
                  <button
                    key={res.value}
                    onClick={() => setSize(res.value)}
                    className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                      size === res.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-transparent text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {res.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pulsante Genera */}
            <button 
              onClick={generateQRCode} 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generazione in corso...' : 'Genera QR Code'}
            </button>

            {/* Messaggio di Errore */}
            {error && (
              <p className="text-red-400 text-sm mt-4 text-center bg-red-900/50 p-2 rounded-lg border border-red-500/50">
                {error}
              </p>
            )}
          </div>

          {/* --- AREA RISULTATO (DESTRA)- --- */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col items-center justify-center min-h-[300px] transition-all duration-300">
            {isGenerating ? (
              <div className="flex flex-col items-center text-gray-400">
                <svg className="animate-spin h-8 w-8 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generazione...</span>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center w-full animate-fade-in">
                <div className="bg-white p-3 rounded-lg shadow-lg mb-6">
                  <img src={qrCode} alt="QR Code Generato" className="max-w-full h-auto" />
                </div>
                <button 
                  onClick={downloadQRCode} 
                  className="w-full max-w-xs bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <DownloadIcon />
                  Scarica PNG
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Il tuo QR code apparirà qui.</p>
              </div>
            )}
          </div>
        </main>

      </div>
      
      {/* --- MODALE INFORMATIVO --- */}
      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}
