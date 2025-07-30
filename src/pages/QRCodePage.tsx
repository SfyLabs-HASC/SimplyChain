
import React, { useState } from 'react';
import '../App.css';

const QRCodePageStyles = () => (
  <style>{`
    .qr-container {
      min-height: 100vh;
      background-color: #0f0f0f;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .qr-header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      color: #ffffff;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      border: 1px solid #333;
      margin-bottom: 2rem;
      text-align: center;
      max-width: 800px;
      width: 100%;
    }

    .qr-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #ffffff;
    }

    .qr-subtitle {
      font-size: 1.1rem;
      color: #a0a0a0;
      line-height: 1.6;
    }

    .qr-form {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      border: 1px solid #333;
      max-width: 600px;
      width: 100%;
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
      padding: 1rem;
      border: 1px solid #333;
      border-radius: 0.5rem;
      background-color: #2a2a2a;
      color: #ffffff;
      font-size: 1rem;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
    }

    .generate-button {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .generate-button:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .qr-result {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      border: 1px solid #333;
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    .qr-code-display {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      display: inline-block;
    }

    .back-button {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 2rem;
      box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
    }

    .back-button:hover {
      background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
    }
  `}</style>
);

const QRCodePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    if (!url.trim()) {
      alert('Inserisci un URL valido');
      return;
    }

    setIsGenerating(true);
    try {
      // Usa l'API QR Server (gratuita) per generare il QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      setQrCode(qrUrl);
    } catch (error) {
      console.error('Errore nella generazione del QR Code:', error);
      alert('Errore nella generazione del QR Code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qrcode.png';
    link.click();
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <>
      <QRCodePageStyles />
      <div className="qr-container">
        <button onClick={goBack} className="back-button">
          ← Torna Indietro
        </button>

        <div className="qr-header">
          <h1 className="qr-title">Generatore QR Code</h1>
          <p className="qr-subtitle">
            Carica il file esportato sul tuo server privato, copia il link e genera un QR Code 
            da applicare sull'etichetta del tuo prodotto per la tracciabilità.
          </p>
        </div>

        <div className="qr-form">
          <div className="form-group">
            <label className="form-label">
              URL del file esportato
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input"
              placeholder="https://esempio.com/il-tuo-file-export.pdf"
            />
          </div>
          
          <button 
            onClick={generateQRCode} 
            className="generate-button"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generazione...' : 'Genera QR Code'}
          </button>
        </div>

        {qrCode && (
          <div className="qr-result">
            <div className="qr-code-display">
              <img src={qrCode} alt="QR Code" />
            </div>
            <button onClick={downloadQRCode} className="generate-button">
              Scarica QR Code
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default QRCodePage;
