import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Network } from 'lucide-react';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";

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
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0, 0, 0, 0.75)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: '1rem' 
      }}
      onClick={onClose} // Chiude il modale cliccando sullo sfondo
    >
      {/* Contenitore del modale */}
      <div 
        style={{ 
          background: 'rgba(26, 26, 26, 0.95)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(20px)', 
          borderRadius: '1.5rem', 
          padding: '2rem', 
          maxWidth: '600px', 
          width: '100%', 
          textAlign: 'left', 
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
        }}
        onClick={(e) => e.stopPropagation()} // Evita la chiusura cliccando sul contenuto
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem' }}>Come funziona? Il controllo è tuo.</h2>
        <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
          Il QR Code che generi punterà alla <strong>pagina web di tracciabilità (il file .html) che hai appena creato</strong>. Per renderla accessibile a tutti, devi prima caricarla sul tuo spazio web personale (sito aziendale, server privato, hosting, ecc.).
        </p>
        <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', color: '#d1d5db', marginBottom: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>La <strong>pagina di tracciabilità (.html)</strong> è stata appena generata e scaricata sul tuo computer.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Carica questo file HTML</strong> sul tuo server o hosting (es. via FTP o dal pannello di controllo).</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Copia l'URL pubblico</strong> del file HTML una volta caricato (es. `https://www.mia-azienda.it/tracciabilita/prodotto-123.html`).</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Incolla l'URL</strong> nel campo qui sotto per generare il QR Code corrispondente.</li>
        </ol>
        <p style={{ 
          marginTop: '1.5rem', 
          fontSize: '0.9rem', 
          color: '#60a5fa', 
          background: 'rgba(59, 130, 246, 0.1)', 
          padding: '0.75rem', 
          borderRadius: '0.75rem', 
          border: '1px solid rgba(59, 130, 246, 0.3)' 
        }}>
          <strong>Vantaggio:</strong> In questo modo, sei tu il proprietario del link. Puoi aggiornare il file di destinazione in qualsiasi momento senza dover cambiare il QR Code già stampato.
        </p>
        <button
          onClick={onClose}
          style={{ 
            marginTop: '1.5rem', 
            float: 'right', 
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
            color: 'white', 
            fontWeight: '600', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.75rem', 
            border: 'none', 
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
            e.target.style.transform = 'none';
          }}
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
  const account = useActiveAccount();
  const navigate = useNavigate();

  // Effect per gestire il disconnect e reindirizzare alla homepage
  useEffect(() => {
    if (!account) {
      navigate('/');
      return;
    }
  }, [account, navigate]);

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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Header */}
      <header style={{ 
        background: 'rgba(26, 26, 26, 0.9)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        padding: '1rem 0' 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <Link to="/azienda" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            textDecoration: 'none', 
            color: 'inherit' 
          }}>
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              WebkitBackgroundClip: 'text', 
              backgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              EasyChain
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/azienda" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#9ca3af', 
              textDecoration: 'none', 
              fontSize: '0.9rem', 
              transition: 'all 0.3s ease' 
            }}>
              <ArrowLeft size={16} />
              Torna all'Area Privata
            </Link>
            <ConnectButton 
              client={client} 
              wallets={wallets}
              chain={polygon}
              accountAbstraction={{ chain: polygon, sponsorGas: true }}
            />
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          
          {/* --- INTESTAZIONE --- */}
          <header className="text-center mb-10" style={{ marginTop: '3rem' }}>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3rem)', 
              fontWeight: 'bold', 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
              WebkitBackgroundClip: 'text', 
              backgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              marginBottom: '1rem' 
            }}>
              Generatore QR Code per Tracciabilità
            </h1>
            <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Crea un QR Code da applicare ai tuoi prodotti per fornire informazioni di tracciabilità in modo semplice e diretto.
            </p>
          </header>

          {/* --- TRIGGER PER IL MODALE ESPLICATIVO --- */}
          <div className="text-center mb-10">
              <button
                  onClick={() => setIsModalOpen(true)}
                  style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '600', 
                    color: '#6366f1', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    textDecoration: 'underline', 
                    textDecorationStyle: 'dotted', 
                    textUnderlineOffset: '4px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#4f46e5'}
                  onMouseOut={(e) => e.target.style.color = '#6366f1'}
              >
                  Come funziona? Il controllo è tuo.
              </button>
          </div>

          <main className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            
            {/* --- PANNELLO DI CONTROLLO (SINISTRA) --- */}
            <div style={{ 
              background: 'rgba(26, 26, 26, 0.8)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '1.5rem', 
              padding: '2rem', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
            }}>
            
              {/* Input URL */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="url-input" style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '500', 
                  color: '#e5e7eb', 
                  marginBottom: '0.5rem' 
                }}>
                  URL pubblico della tua pagina HTML di tracciabilità
                </label>
                <input
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '0.75rem', 
                    padding: '0.75rem 1rem', 
                    color: '#ffffff', 
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="https://il-tuo-sito.com/prodotto.html"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Selettore Risoluzione */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '500', 
                  color: '#e5e7eb', 
                  marginBottom: '0.5rem' 
                }}>
                  Risoluzione (PNG)
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '0.5rem', 
                  background: 'rgba(0, 0, 0, 0.3)', 
                  padding: '0.25rem', 
                  borderRadius: '0.75rem', 
                  border: '1px solid rgba(255, 255, 255, 0.2)' 
                }}>
                  {resolutions.map((res) => (
                    <button
                      key={res.value}
                      onClick={() => setSize(res.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        fontSize: '0.9rem', 
                        fontWeight: '600', 
                        borderRadius: '0.5rem', 
                        border: 'none', 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: size === res.value ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                        color: size === res.value ? 'white' : '#9ca3af',
                        boxShadow: size === res.value ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                      onMouseOver={(e) => {
                        if (size !== res.value) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (size !== res.value) {
                          e.target.style.background = 'transparent';
                        }
                      }}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pulsante Genera */}
              <button 
                onClick={generateQRCode} 
                style={{ 
                  width: '100%', 
                  background: isGenerating ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                  color: 'white', 
                  fontWeight: '600', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '0.75rem', 
                  border: 'none', 
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  opacity: isGenerating ? 0.6 : 1
                }}
                disabled={isGenerating}
                onMouseOver={(e) => {
                  if (!isGenerating) {
                    e.target.style.background = 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isGenerating) {
                    e.target.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
                  }
                }}
              >
                {isGenerating ? 'Generazione in corso...' : 'Genera QR Code'}
              </button>

              {/* Messaggio di Errore */}
              {error && (
                <p style={{ 
                  color: '#ef4444', 
                  fontSize: '0.9rem', 
                  marginTop: '1rem', 
                  textAlign: 'center', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  padding: '0.75rem', 
                  borderRadius: '0.75rem', 
                  border: '1px solid rgba(239, 68, 68, 0.3)' 
                }}>
                  {error}
                </p>
              )}
            </div>

            {/* --- AREA RISULTATO (DESTRA)- --- */}
            <div style={{ 
              background: 'rgba(26, 26, 26, 0.8)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '1.5rem', 
              padding: '2rem', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              transition: 'all 0.3s ease'
            }}>
              {isGenerating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                  <svg style={{ 
                    animation: 'spin 1s linear infinite', 
                    height: '2rem', 
                    width: '2rem', 
                    color: 'white', 
                    marginBottom: '0.75rem' 
                  }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generazione...</span>
                </div>
              ) : qrCode ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  width: '100%',
                  animation: 'fadeIn 0.3s ease-in'
                }}>
                  <div style={{ 
                    background: 'white', 
                    padding: '1rem', 
                    borderRadius: '0.75rem', 
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)', 
                    marginBottom: '1.5rem' 
                  }}>
                    <img src={qrCode} alt="QR Code Generato" style={{ maxWidth: '100%', height: 'auto' }} />
                  </div>
                  <button 
                    onClick={downloadQRCode} 
                    style={{ 
                      width: '100%', 
                      maxWidth: '300px', 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      color: 'white', 
                      fontWeight: '600', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '0.75rem', 
                      border: 'none', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <DownloadIcon />
                    Scarica PNG
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                  <p>Il tuo QR code apparirà qui.</p>
                </div>
              )}
          </div>
        </main>

      </div>
      
        {/* --- MODALE INFORMATIVO --- */}
        <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      </div>
    </div>
  );
}
