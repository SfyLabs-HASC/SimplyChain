import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { Link } from "react-router-dom";
import { ArrowLeft, Network, Shield, Sparkles } from 'lucide-react';
import RegistrationForm from "../components/RegistrationForm";
import "../App.css";
import Footer from '../components/Footer';

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

const FormPageStyles = () => (
  <style>{`
    .form-page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
      position: relative;
      overflow-x: hidden;
    }
    
    .form-page-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .form-header {
      position: relative;
      z-index: 10;
      background: rgba(26, 26, 26, 0.9);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1rem 0;
    }

    .form-header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .form-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .form-brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .form-brand-text {
      font-size: 1.5rem;
      font-weight: bold;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .form-main {
      position: relative;
      z-index: 10;
      padding: 3rem 2rem;
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-content {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-hero {
      text-align: center;
      margin-bottom: 3rem;
    }

    .form-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 50px;
      padding: 0.75rem 1.5rem;
      margin-bottom: 2rem;
      color: #c4b5fd;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .form-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }

    .form-subtitle {
      font-size: 1.25rem;
      color: #9ca3af;
      margin-bottom: 2rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      transition: all 0.3s ease;
    }

    .back-button:hover {
      color: #6366f1;
      transform: translateX(-2px);
    }

    .form-card {
      background: rgba(26, 26, 26, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(139, 92, 246, 0.05);
    }

    .connect-wallet-section {
      text-align: center;
      padding: 3rem 0;
    }

    .connect-wallet-title {
      font-size: 2rem;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 1rem;
    }

    .connect-wallet-subtitle {
      color: #9ca3af;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .floating-elements {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .floating-element {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
      animation: float 6s ease-in-out infinite;
    }

    .floating-element:nth-child(1) {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }

    .floating-element:nth-child(2) {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      top: 20%;
      right: 15%;
      animation-delay: 2s;
    }

    .floating-element:nth-child(3) {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }

    .floating-element:nth-child(4) {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      bottom: 30%;
      right: 10%;
      animation-delay: 1s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-header-content {
        padding: 0 1rem;
      }
      
      .form-main {
        padding: 2rem 1rem;
      }
      
      .form-title {
        font-size: 2rem;
      }
      
      .form-card {
        padding: 2rem;
      }
      
      .floating-element {
        display: none;
      }
    }

    /* Override degli stili del form esistente per adattarli al nuovo design */
    .form-card .card {
      background: transparent;
      border: none;
      box-shadow: none;
      margin: 0;
      padding: 0;
    }

    .form-card .card h3 {
      color: #ffffff;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .form-card .card p {
      color: #9ca3af;
      margin-bottom: 2rem;
    }

    .form-card .form-group {
      margin-bottom: 1.5rem;
    }

    .form-card .form-group label {
      color: #e5e7eb;
      font-weight: 500;
      margin-bottom: 0.5rem;
      display: block;
    }

    .form-card .form-input {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: #ffffff;
      padding: 0.75rem 1rem;
      width: 100%;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-card .form-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .form-card .form-input:disabled {
      background: rgba(0, 0, 0, 0.2);
      color: #9ca3af;
    }

    .form-card .web3-button {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border: none;
      border-radius: 12px;
      color: white;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
    }

    .form-card .web3-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
    }

    .form-card .web3-button:disabled {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      cursor: not-allowed;
      transform: none;
    }

    .form-card hr {
      border: none;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 2rem 0;
    }

    .form-card h4 {
      color: #c4b5fd;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
  `}</style>
);

const FormPage: React.FC = () => {
  const account = useActiveAccount();
  const [hasRequestSent, setHasRequestSent] = useState(false);
  const [isCheckingRequest, setIsCheckingRequest] = useState(false);

  useEffect(() => {
    if (account?.address) {
      checkIfRequestAlreadySent();
    }
  }, [account]);

  const checkIfRequestAlreadySent = async () => {
    if (!account?.address) return;
    
    setIsCheckingRequest(true);
    try {
      const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
      if (response.ok) {
        const data = await response.json();
        // Se pendente, mostra direttamente il box "Richiesta Inviata"
        const isPending = !!data?.pending;
        const isActive = !!data?.isActive;
        setHasRequestSent(!isActive && isPending);
      } else {
        setHasRequestSent(false);
      }
    } catch (error) {
      console.error('Errore durante il controllo della richiesta:', error);
      setHasRequestSent(false);
    } finally {
      setIsCheckingRequest(false);
    }
  };

  return (
    <>
      <FormPageStyles />
      <div className="form-page-container">
        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
        </div>

        {/* Header in stile AziendaPage */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
                    <img src="/logo-simplychain.svg" alt="SimplyChain" className="w-10 h-10 object-cover" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-white">SimplyChain</h1>
                    <p className="text-sm text-slate-400 hidden sm:block">Richiesta Attivazione</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <ConnectButton
                  client={client}
                  wallets={wallets}
                  chain={polygon}
                  accountAbstraction={{ chain: polygon, sponsorGas: true }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="form-main">
          <div className="form-content">
            {!hasRequestSent && (
              <div className="form-hero">
                <div className="form-badge">
                  <Sparkles size={16} />
                  Registrazione Aziendale
                </div>
                <h1 className="form-title">Completa la Registrazione</h1>
                <p className="form-subtitle">Compila il form per richiedere l'attivazione del tuo account aziendale.</p>
              </div>
            )}

            <div className="form-card">
              {!account ? (
                <div className="connect-wallet-section">
                  <h2 className="connect-wallet-title">Connetti il tuo Wallet</h2>
                  <p className="connect-wallet-subtitle">
                    Per procedere con la registrazione, devi prima connettere il tuo wallet
                  </p>
                </div>
              ) : isCheckingRequest ? (
                <div className="connect-wallet-section">
                  <h2 className="connect-wallet-title">Controllo stato richiesta...</h2>
                  <p className="connect-wallet-subtitle">
                    Stiamo verificando se hai già inviato una richiesta
                  </p>
                </div>
              ) : hasRequestSent ? (
                <div className="connect-wallet-section">
                  <h2 className="connect-wallet-title">RICHIESTA INVIATA</h2>
                  <p className="connect-wallet-subtitle">
                    Hai già inviato una richiesta di attivazione. Verrai ricontattato dopo l'approvazione del tuo account.
                  </p>
                  <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Link to="/" className="back-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.3s ease' }}>
                      <ArrowLeft size={16} />
                      Torna alla Home
                    </Link>
                  </div>
                </div>
              ) : (
                <RegistrationForm walletAddress={account.address} />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default FormPage;