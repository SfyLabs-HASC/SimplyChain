
import React from 'react';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import "../App.css";

const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });

const RicaricaCreditiPageStyles = () => (
  <style>{`
    .ricarica-container {
      padding: 2rem;
      min-height: 100vh;
      background-color: #0f0f0f;
      color: #ffffff;
    }

    .ricarica-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: #1a1a1a;
      border-radius: 0.75rem;
      border: 1px solid #333;
    }

    .ricarica-title {
      font-size: 1.75rem;
      font-weight: bold;
      color: #ffffff;
    }

    .ricarica-content {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid #333;
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .coming-soon {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #3b82f6;
    }

    .coming-soon-text {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      color: #a0a0a0;
      line-height: 1.6;
    }

    .back-button {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      text-decoration: none;
      display: inline-block;
    }

    .back-button:hover {
      background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .ricarica-container {
        padding: 1rem;
      }

      .ricarica-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .ricarica-title {
        font-size: 1.5rem;
      }
    }
  `}</style>
);

const RicaricaCreditiPage: React.FC = () => {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className="ricarica-container">
        <RicaricaCreditiPageStyles />
        <div style={{ textAlign: "center", paddingTop: "5rem" }}>
          <h1>Ricarica Crediti</h1>
          <p style={{ marginBottom: "2rem" }}>Connetti il tuo wallet per accedere.</p>
          <ConnectButton 
            client={client} 
            wallets={[inAppWallet()]}
            chain={polygon}
            accountAbstraction={{ chain: polygon, sponsorGas: true }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <RicaricaCreditiPageStyles />
      <div className="ricarica-container">
        <header className="ricarica-header">
          <h1 className="ricarica-title">Ricarica Crediti</h1>
          <ConnectButton 
            client={client}
            chain={polygon}
            accountAbstraction={{ chain: polygon, sponsorGas: true }}
          />
        </header>
        
        <main className="ricarica-content">
          <div className="coming-soon">🚧</div>
          <h2 className="coming-soon">Sezione in Sviluppo</h2>
          <p className="coming-soon-text">
            La funzionalità di ricarica crediti è attualmente in fase di sviluppo.<br />
            Presto potrai acquistare crediti aggiuntivi per continuare a utilizzare EasyChain.<br />
            <br />
            Per informazioni o assistenza, contattaci all'indirizzo: <strong>sfy.startup@gmail.com</strong>
          </p>
          
          <a href="/azienda" className="back-button">
            Torna alla Dashboard
          </a>
        </main>
      </div>
    </>
  );
};

export default RicaricaCreditiPage;
