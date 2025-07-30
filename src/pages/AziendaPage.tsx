// FILE: src/pages/AziendaPage.tsx
// DESCRIZIONE: Versione aggiornata che utilizza Firebase per i dati azienda,
// implementa il sistema di refresh on-chain e gestisce le iscrizioni con numerazione incrementale.

import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { supplyChainABI as abi } from "../abi/contractABI";
import "../App.css";

// Importa i componenti esterni
import RegistrationForm from "../components/RegistrationForm";
import TransactionStatusModal from "../components/TransactionStatusModal";

// --- Stili Mobile-First ---
const AziendaPageStyles = () => (
  <style>{`
      /* Mobile-first base styles */
      .app-container-full { 
        padding: 1rem; 
        min-height: 100vh;
        background-color: #0f0f0f;
      }

      .main-header-bar { 
        display: flex; 
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: #1a1a1a;
        border-radius: 0.75rem;
        border: 1px solid #333;
      }

      .header-title { 
        font-size: 1.5rem; 
        font-weight: bold; 
        color: #ffffff;
        text-align: center;
      }

      .login-container, .centered-container { 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        min-height: 80vh; 
        text-align: center;
        padding: 1rem;
      }

      .dashboard-header-card { 
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        color: #ffffff; 
        padding: 1.5rem; 
        border-radius: 1rem; 
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        margin-bottom: 1.5rem; 
        display: flex; 
        flex-direction: column;
        gap: 1rem;
      }

      .dashboard-title-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .dashboard-title { 
        font-size: 1.5rem; 
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }

      .dashboard-info {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .dashboard-info-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: #ffffff;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .dashboard-icon {
        font-size: 1.8rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .status-icon {
        font-size: 1.8rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .status-active-text {
        color: #10b981;
      }

      .status-inactive-text {
        color: #f59e0b;
      }

      .inscriptions-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .inscriptions-section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0;
      }

      .refresh-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .refresh-button {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
      }

      .refresh-button:hover {
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      }

      .refresh-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .refresh-icon {
        color: white;
        font-size: 1.5rem;
      }

      .refresh-counter {
        color: #10b981;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: bold;
        position: absolute;
        top: -5px;
        right: -5px;
      }

      .full-page-loading {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        color: white;
      }

      .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid #333;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .web3-button { 
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white; 
        padding: 1rem 1.5rem; 
        border: none; 
        border-radius: 0.75rem; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.3s ease;
        font-size: 0.9rem;
        width: 100%;
        text-align: center;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      }

      .web3-button:hover { 
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
      }

      .web3-button.secondary {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
      }

      .web3-button.secondary:hover {
        background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
        box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
      }

      .inscriptions-grid { 
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .inscription-card { 
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        border-radius: 1rem; 
        padding: 1.5rem; 
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        transition: all 0.3s ease;
        position: relative;
      }

      .inscription-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        border-color: #3b82f6;
      }

      .inscription-card h3 { 
        font-size: 1.1rem; 
        font-weight: 600; 
        color: #ffffff; 
        margin: 0 0 1rem 0;
        border-bottom: 1px solid #333; 
        padding-bottom: 0.75rem;
        word-wrap: break-word; 
      }

      .inscription-card p { 
        margin: 0.75rem 0; 
        color: #a0a0a0; 
        font-size: 0.85rem; 
        line-height: 1.5;
        word-wrap: break-word; 
      }

      .inscription-card strong { 
        color: #ffffff; 
        font-weight: 600;
      }

      .inscription-card a { 
        color: #60a5fa; 
        text-decoration: none; 
        font-weight: 500;
        transition: color 0.2s ease;
      }

      .inscription-card a:hover {
        color: #3b82f6;
      }

      .inscription-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #333;
      }

      .steps-count {
        font-size: 0.8rem;
        color: #a0a0a0;
      }

      .status-open {
        color: #10b981;
        font-weight: 600;
      }

      .status-closed {
        color: #ef4444;
        font-weight: 600;
      }

      .add-step-button {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .add-step-button:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-1px);
      }

      .export-button {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }

      .export-button:hover:not(:disabled) {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        transform: translateY(-1px);
      }

      .export-button:disabled {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .view-steps-button {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .view-steps-button:hover {
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        transform: translateY(-1px);
      }

      .view-steps-button.disabled {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .view-steps-button.disabled:hover {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        transform: none;
      }

      .tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: #1f2937;
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
      }

      .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: #1f2937;
      }

      .export-button:hover .tooltip {
        opacity: 1;
      }

      .steps-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 1rem;
      }

      .steps-modal-content {
        background-color: #1a1a1a;
        border-radius: 1rem;
        border: 1px solid #333;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        color: #ffffff;
      }

      .steps-modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .steps-modal-body {
        padding: 1.5rem;
      }

      .step-card {
        background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
        border-radius: 0.75rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
        border: 1px solid #444;
      }

      .step-card h4 {
        color: #3b82f6;
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
      }

      .step-card p {
        margin: 0.5rem 0;
        color: #a0a0a0;
      }

      .step-card strong {
        color: #ffffff;
      }

      .export-modal-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }

      .export-type-button {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 1rem 2rem;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 150px;
      }

      .export-type-button:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        transform: translateY(-2px);
      }

      .finalize-button {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .finalize-button:hover {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        transform: translateY(-1px);
      }

      .closed-lock-icon {
        color: #6b7280;
        font-size: 1.2rem;
      }

      .loading-error-container { 
        text-align: center; 
        padding: 2rem 1rem; 
        background-color: #1a1a1a; 
        border-radius: 1rem;
        border: 1px solid #333;
        color: #a0a0a0;
      }

      .steps-container { 
        margin-top: 1rem; 
        border-top: 1px solid #333; 
        padding-top: 1rem; 
      }

      .steps-container h4 { 
        margin: 0 0 0.75rem 0; 
        font-size: 0.9rem; 
        font-weight: 600;
        color: #ffffff;
      }

      .step-item { 
        font-size: 0.8rem; 
        padding: 0.75rem 0 0.75rem 1rem;
        border-left: 2px solid #3b82f6; 
        margin-bottom: 0.75rem;
        background-color: rgba(59, 130, 246, 0.05);
        border-radius: 0 0.5rem 0.5rem 0;
      }

      .step-item p {
        margin: 0.25rem 0;
        color: #a0a0a0;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #a0a0a0;
        background-color: #1a1a1a;
        border-radius: 1rem;
        border: 1px solid #333;
      }

      /* Modal styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-content {
        background-color: #1a1a1a;
        border-radius: 1rem;
        border: 1px solid #333;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        color: #ffffff;
      }

      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #333;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #333;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #f8f9fa;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #495057;
        border-radius: 0.5rem;
        background-color: #212529;
        color: #f8f9fa;
        font-size: 0.9rem;
      }

      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
      }

      .char-counter {
        font-size: 0.75rem;
        color: #6c757d;
        margin-top: 0.25rem;
      }

      .recap-summary {
        text-align: left;
        padding: 1rem;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      }

      .recap-summary p {
        margin: 0.5rem 0;
        word-break: break-word;
      }

      .recap-summary p strong {
        color: #f8f9fa;
      }

      .file-name-preview {
        color: #3b82f6;
        font-size: 0.85rem;
        margin-top: 0.5rem;
      }

      /* Image modal styles */
      .image-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1001;
        padding: 2rem;
      }

      .image-modal-content {
        max-width: 90%;
        max-height: 90%;
        border-radius: 0.5rem;
        overflow: hidden;
      }

      .image-modal-content img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .image-modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        font-size: 1.5rem;
      }

      /* Filtri per le iscrizioni */
      .inscriptions-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: #1a1a1a;
        border-radius: 0.75rem;
        border: 1px solid #333;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 200px;
        flex: 1;
      }

      .filter-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: #ffffff;
      }

      .filter-input {
        padding: 0.75rem;
        border: 1px solid #333;
        border-radius: 0.5rem;
        background-color: #2a2a2a;
        color: #ffffff;
        font-size: 0.9rem;
      }

      .filter-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
      }

      /* Paginazione */
      .pagination-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-top: 2rem;
        padding: 1rem;
      }

      .pagination-button {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }

      .pagination-button:hover:not(:disabled) {
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        transform: translateY(-1px);
      }

      .pagination-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .pagination-number {
        background-color: transparent;
        color: #ffffff;
        border: 1px solid #333;
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }

      .pagination-number:hover {
        background-color: #333;
      }

      .pagination-number.active {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        border-color: #6366f1;
      }

      .pagination-info {
        color: #a0a0a0;
        font-size: 0.9rem;
        margin: 0 1rem;
      }

      /* Tablet styles */
      @media (min-width: 768px) {
        .app-container-full { 
          padding: 2rem; 
        }

        .main-header-bar { 
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
        }

        .header-title { 
          font-size: 1.75rem;
          text-align: left;
        }

        .dashboard-header-card { 
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem;
        }

        .dashboard-title { 
          font-size: 1.75rem;
        }

        .dashboard-info {
          flex-direction: row;
          gap: 2rem;
        }

        .web3-button {
          width: auto;
          min-width: 200px;
        }

        .inscriptions-grid { 
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .inscription-card h3 { 
          font-size: 1.25rem;
        }

        .loading-error-container { 
          padding: 3rem; 
        }
      }

      /* Desktop styles */
      @media (min-width: 1024px) {
        .app-container-full { 
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .inscriptions-grid { 
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .inscription-card { 
          padding: 2rem; 
        }

        .dashboard-header-card { 
          padding: 2.5rem;
        }
      }
  `}</style>
);

const truncateText = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Formatta la data in formato italiano
const formatItalianDate = (dateString: string) => {
  if (!dateString) return "N/D";
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT');
};

// Interfacce per i dati
interface Step { 
  stepIndex: string; 
  eventName: string; 
  description: string; 
  date: string; 
  location: string; 
  attachmentsIpfsHash: string; 
  transactionHash?: string;
}

interface Batch { 
  batchId: string; 
  name: string; 
  description: string; 
  date: string; 
  location: string; 
  imageIpfsHash: string; 
  isClosed: boolean; 
  transactionHash: string; 
  steps: Step[]; 
}

interface CompanyData { 
  companyName: string; 
  credits: number;
  status: string;
}

const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });

const contract = getContract({
  client,
  chain: polygon,
  address: "0x0c5e6204e80e6fb3c0c7098c4fa84b2210358d0b",
  abi,
});

// Componente modale per visualizzare immagini
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Immagine iscrizione" />
      </div>
      <button className="image-modal-close" onClick={onClose}>×</button>
    </div>
  );
};

// Componente per il loading a pagina piena
const FullPageLoading: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="full-page-loading">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
};

// Componente per la Dashboard
const Dashboard: React.FC<{ companyData: CompanyData }> = ({ companyData }) => {
  const account = useActiveAccount();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [errorBatches, setErrorBatches] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showFullPageLoading, setShowFullPageLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [currentCompanyData, setCurrentCompanyData] = useState<CompanyData>(companyData);
  const [selectedBatchForStep, setSelectedBatchForStep] = useState<Batch | null>(null);
  const [selectedBatchForFinalize, setSelectedBatchForFinalize] = useState<Batch | null>(null);
  const [selectedBatchForSteps, setSelectedBatchForSteps] = useState<Batch | null>(null);
  const [selectedBatchForExport, setSelectedBatchForExport] = useState<Batch | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<'pdf' | 'html' | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // State per i filtri
  const [nameFilter, setNameFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Aperto" | "Chiuso" | "">("");

  // State per la paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Hook per leggere i dati dal contratto
  const { data: contractData, refetch: refetchContractData } = useReadContract({
    contract,
    method: "function getContributorInfo(address) view returns (string, uint256, bool)",
    params: account ? [account.address] : undefined,
    queryOptions: { enabled: !!account },
  });

  const loadBatches = async (isFirstLoad = false) => {
    if (!account) return;

    if (isFirstLoad) {
      setShowFullPageLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setIsLoadingBatches(true);
    setErrorBatches(null);

    try {
      const response = await fetch(`/api/get-contract-events?userAddress=${account.address}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Errore dal server: ${response.status}`);
      }
      const data = await response.json();
      const readyBatches: Batch[] = data.events || [];
      const sortedBatches = readyBatches.sort((a, b) => parseInt(b.batchId) - parseInt(a.batchId));

      setBatches(sortedBatches);
      setRefreshCounter(0); // Reset counter dopo il refresh
      setCurrentPage(1); // Reset alla prima pagina
    } catch (error: any) {
      setErrorBatches(error.message || "Errore sconosciuto.");
    } finally {
      setIsLoadingBatches(false);
      setIsRefreshing(false);
      setShowFullPageLoading(false);
      setFirstLoad(false);
    }
  };

  const handleRefresh = async () => {
    if (!account) return;

    setShowFullPageLoading(true);

    try {
      // 1. Controlla i crediti on-chain
      const refetchedData = await refetchContractData();
      if (refetchedData.data) {
        const [, onChainCredits] = refetchedData.data;
        const creditsNumber = Number(onChainCredits);

        // 2. Aggiorna Firebase con i crediti corretti
        await fetch('/api/activate-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'setCredits',
            walletAddress: account.address,
            credits: creditsNumber,
          }),
        });

        // 3. Aggiorna i dati locali
        setCurrentCompanyData(prev => ({
          ...prev,
          credits: creditsNumber
        }));
      }

      // 4. Ricarica le iscrizioni
      await loadBatches(false);

    } catch (error: any) {
      setErrorBatches(error.message || "Errore durante l'aggiornamento.");
    } finally {
      setShowFullPageLoading(false);
    }
  };

  const incrementRefreshCounter = () => {
    setRefreshCounter(prev => prev + 1);
  };

  useEffect(() => {
    if (account && firstLoad) {
      loadBatches(true);
    }
  }, [account, firstLoad]);

  // Calcola il numero di iscrizione incrementale per ogni batch
  const getBatchDisplayNumber = (batchId: string) => {
    const sortedBatches = [...batches].sort((a, b) => parseInt(a.batchId) - parseInt(b.batchId));
    const index = sortedBatches.findIndex(batch => batch.batchId === batchId);
    return index + 1;
  };

  // Funzioni per la paginazione
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filtra i batch basati sui criteri di ricerca
  const filteredBatches = batches.filter(batch => {
    const nameMatch = batch.name.toLowerCase().includes(nameFilter.toLowerCase());
    const locationMatch = batch.location?.toLowerCase().includes(locationFilter.toLowerCase());
    let statusMatch = true;
    if (statusFilter === "Aperto") {
      statusMatch = !batch.isClosed;
    } else if (statusFilter === "Chiuso") {
      statusMatch = batch.isClosed;
    }
    return nameMatch && locationMatch && statusMatch;
  });

  const currentItems = filteredBatches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleExport = async (batch: Batch, exportType: 'pdf' | 'html', bannerId: string) => {
    try {
      const response = await fetch('/api/export-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch,
          exportType,
          bannerId,
          companyName: currentCompanyData.companyName
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${batch.name}_export.${exportType}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error);
    }
  };

  return (
    <>
      {showFullPageLoading && (
        <FullPageLoading message="Aggiornamento dati in corso..." />
      )}

      <div className="dashboard-header-card">
        <div>
          <div className="dashboard-title-section">
            <h2 className="dashboard-title">{currentCompanyData.companyName}</h2>
          </div>
          <div className="dashboard-info">
            <div className="dashboard-info-item">
              <span>Crediti Rimanenti: <strong>{currentCompanyData.credits}</strong></span>
            </div>
            <div className="dashboard-info-item">
              <span>Stato: <strong className={currentCompanyData.status === 'active' ? 'status-active-text' : 'status-inactive-text'}>
                {currentCompanyData.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}
              </strong></span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="web3-button">+ Inizializza Nuova Iscrizione</button>
      </div>

      <div className="inscriptions-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 className="inscriptions-section-title">Le mie Iscrizioni su Blockchain</h3>
          <button 
            className="info-button"
            onClick={() => setShowInfoModal(true)}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ℹ️
          </button>
        </div>
        <div className="refresh-section">
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing || refreshCounter === 0}
          >
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPCEtLSBSZWZyZXNoIGNpcmN1bGFyIGFycm93cyAtLT4KPHBhdGggZD0iTTMgMTJBOSA5IDAgMCAxIDEyIDNWMUwxNiA1TDEyIDlWN0E3IDcgMCAwIDAgNSAxMkgzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxIDEyQTkgOSAwIDAgMSAxMiAyMVYyM0w4IDE5TDEyIDE1VjE3QTcgNyAwIDAgMCAxOSAxMkgyMVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" alt="refresh" className="refresh-icon" style={{width: '20px', height: '20px'}} />
            {refreshCounter > 0 && (
              <div className="refresh-counter">+{refreshCounter}</div>
            )}
          </button>
        </div>
      </div>

      <div className="inscriptions-filters">
        <div className="filter-group">
          <label className="filter-label">Nome</label>
          <input
            type="text"
            className="filter-input"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Luogo</label>
          <input
            type="text"
            className="filter-input"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Stato</label>
          <select
            className="filter-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "Aperto" | "Chiuso" | "")}
          >
            <option value="">Tutti</option>
            <option value="Aperto">Aperto</option>
            <option value="Chiuso">Chiuso</option>
          </select>
        </div>
      </div>

      {isLoadingBatches && !showFullPageLoading ? (
        <div className="loading-error-container"><p>Caricamento delle tue iscrizioni...</p></div>
      ) : errorBatches ? (
        <div className="loading-error-container"><p style={{ color: 'red' }}>{errorBatches}</p></div>
      ) : (
        <>
          <div className="inscriptions-grid">
            {currentItems.length > 0 ? (
              currentItems.map((batch) => (
                <div key={batch.batchId} className="inscription-card">
                  <h3>#{getBatchDisplayNumber(batch.batchId)} - {batch.name}</h3>
                  <p><strong>Descrizione:</strong> {batch.description ? truncateText(batch.description, window.innerWidth < 768 ? 80 : 100) : "N/D"}</p>
                  <p><strong>Data:</strong> {formatItalianDate(batch.date)}</p>
                  <p><strong>Luogo:</strong> {batch.location || "N/D"}</p>
                  <p><strong>Stato:</strong> <span className={batch.isClosed ? 'status-closed' : 'status-open'}>
                    {batch.isClosed ? ' Chiuso' : ' Aperto'}
                  </span></p>
                  {batch.imageIpfsHash && batch.imageIpfsHash !== "N/A" && (
                    <p>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedImage(`https://musical-emerald-partridge.myfilebase.com/ipfs/${batch.imageIpfsHash}`);
                        }}
                      >
                        Apri L'immagine
                      </a>
                    </p>
                  )}
                  <p><strong>Tx Hash:</strong>
                    <a
                      href={`https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {truncateText(batch.transactionHash, 15)}
                    </a>
                  </p>

                  <div className="inscription-footer">
                    <div className="steps-count">
                      {batch.steps && batch.steps.length > 0 ? (
                        <button
                          className="view-steps-button"
                          onClick={() => setSelectedBatchForSteps(batch)}
                        >
                          {batch.steps.length} steps
                        </button>
                      ) : (
                        <button
                          className="view-steps-button disabled"
                          disabled={true}
                        >
                          0 steps
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {/* Pulsante Esporta - mostrato solo per batch chiusi */}
                      {batch.isClosed && (
                        <button
                          className="export-button"
                          onClick={() => {
                            setSelectedBatchForExport(batch);
                            setShowExportModal(true);
                          }}
                        >
                          Esporta
                        </button>
                      )}

                      {/* Pulsanti Aggiungi Step e Finalizza per iscrizioni aperte, lucchetto per quelle chiuse */}
                      {!batch.isClosed ? (
                        <>
                          <button
                            className="add-step-button"
                            onClick={() => setSelectedBatchForStep(batch)}
                          >
                            Aggiungi Step
                          </button>
                          <button
                            className="finalize-button"
                            onClick={() => setSelectedBatchForFinalize(batch)}
                          >
                            Finalizza
                          </button>
                        </>
                      ) : (
                        <span className="closed-lock-icon">🔒</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Non hai ancora inizializzato nessuna iscrizione con questo account.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  Clicca su "Inizializza Nuova Iscrizione" per iniziare
                </p>
              </div>
            )}
          </div>

          {/* Paginazione */}
          {filteredBatches.length > itemsPerPage && (
            <div className="pagination-container">
              <button
                className="pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              ))}

              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
              <span className="pagination-info">
                Pagina {currentPage} di {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* Modale per visualizzare immagini */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Modale per nuova iscrizione */}
      {isModalOpen && (
        <NewInscriptionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            incrementRefreshCounter();
          }}
          onCreditsUpdate={(newCredits: number) => {
            setCurrentCompanyData(prev => ({ ...prev, credits: newCredits }));
          }}
        />
      )}

      {/* Modale per aggiungere step */}
      {selectedBatchForStep && (
        <AddStepModal
          batch={selectedBatchForStep}
          onClose={() => setSelectedBatchForStep(null)}
          onSuccess={() => {
            setSelectedBatchForStep(null);
            incrementRefreshCounter();
          }}
          onCreditsUpdate={(newCredits: number) => {
            setCurrentCompanyData(prev => ({ ...prev, credits: newCredits }));
          }}
        />
      )}

      {/* Modale per finalizzare iscrizione */}
      {selectedBatchForFinalize && (
        <FinalizeModal
          batch={selectedBatchForFinalize}
          onClose={() => setSelectedBatchForFinalize(null)}
          onSuccess={() => {
            setSelectedBatchForFinalize(null);
            incrementRefreshCounter();
          }}
          onCreditsUpdate={(newCredits: number) => {
            setCurrentCompanyData(prev => ({ ...prev, credits: newCredits }));
          }}
        />
      )}

      {/* Modale per visualizzare steps */}
      {selectedBatchForSteps && (
        <StepsModal
          batch={selectedBatchForSteps}
          onClose={() => setSelectedBatchForSteps(null)}
        />
      )}

      {/* Modale per scelta tipo esportazione */}
      {showExportModal && selectedBatchForExport && (
        <ExportTypeModal
          batch={selectedBatchForExport}
          onClose={() => {
            setShowExportModal(false);
            setSelectedBatchForExport(null);
          }}
          onSelectType={(type) => {
            setSelectedExportType(type);
            setShowExportModal(false);
            setShowBannerModal(true);
          }}
        />
      )}

      {/* Modale per scelta banner */}
      {showBannerModal && selectedBatchForExport && selectedExportType && (
        <BannerSelectionModal
          batch={selectedBatchForExport}
          exportType={selectedExportType}
          onClose={() => {
            setShowBannerModal(false);
            setSelectedBatchForExport(null);
            setSelectedExportType(null);
          }}
          onExport={(bannerId) => {
            handleExport(selectedBatchForExport, selectedExportType, bannerId);
            setShowBannerModal(false);
            setSelectedBatchForExport(null);
            setSelectedExportType(null);
          }}
        />
      )}

      {/* Modale Info */}
      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}
    </>
  );
};

// Componente modale per aggiungere step
const AddStepModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  onSuccess: () => void;
  onCreditsUpdate: (credits: number) => void;
}> = ({ batch, onClose, onSuccess, onCreditsUpdate }) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    date: "",
    location: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [txResult, setTxResult] = useState<{ status: "success" | "error"; message: string; } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.eventName.trim()) {
      alert("Il campo 'Nome Evento' è obbligatorio.");
      return;
    }
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.eventName.trim()) {
      setTxResult({ status: "error", message: "Il campo Nome Evento è obbligatorio." });
      return;
    }

    setLoadingMessage("Preparazione transazione...");
    let attachmentsIpfsHash = "";

    if (selectedFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          attachmentsIpfsHash = uploadResult.cid;
        }
      } catch (error) {
        console.error("Errore upload file:", error);
      }
    }

    setLoadingMessage("Transazione in corso...");
    const transaction = prepareContractCall({
      contract,
      method: "function addStepToBatch(uint256,string,string,string,string,string)",
      params: [batch.batchId, formData.eventName, formData.description || "", formData.date || "", formData.location || "", attachmentsIpfsHash],
    });

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        setTxResult({ status: "success", message: "Step aggiunto! Aggiorno i dati..." });

        // Aggiorna i crediti localmente dopo la transazione
        if (account?.address) {
          try {
            const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
            if (response.ok) {
              const data = await response.json();
              onCreditsUpdate(data.credits);

              await fetch('/api/activate-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'setCredits',
                  walletAddress: account.address,
                  credits: data.credits,
                }),
              });
            }
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti:", error);
          }
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 2000);
      },
      onError: (err) => {
        setTxResult({
          status: "error",
          message: err.message.toLowerCase().includes("insufficient funds") ? "Crediti Insufficienti" : "Errore nella transazione."
        });
        setLoadingMessage("");
      },
    });
  };

  const isProcessing = loadingMessage !== "" || isPending;
  const today = new Date().toISOString().split("T")[0];
  const helpTextStyle = {
    backgroundColor: "#343a40",
    border: "1px solid #495057",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "16px",
    fontSize: "0.9rem",
    color: "#f8f9fa"
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Aggiungi step all'iscrizione ({currentStep}/6)</h2>
          </div>
          <div className="modal-body" style={{ minHeight: "350px" }}>
            {currentStep === 1 && (
              <div>
                <div className="form-group">
                  <label>
                    Nome Evento
                    <span style={{ color: "red", fontWeight: "bold" }}> * Obbligatorio</span>
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    className="form-input"
                    maxLength={100}
                  />
                  <small className="char-counter">{formData.eventName.length} / 100</small>
                </div>
                <div style={helpTextStyle}>
                  <p><strong>ℹ️ Come scegliere il Nome Step Iscrizione</strong></p>
                  <p>Il Nome Step Iscrizione è un'etichetta descrittiva che ti aiuta a identificare con chiarezza un passaggio specifico della filiera o un evento rilevante che desideri registrare on-chain. Ad esempio:</p>
                  <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
                    <li>Una fase produttiva: <em>Raccolta uva – Vigna 3, Inizio mungitura – Allevamento Nord</em></li>
                    <li>Un'attività logistica: <em>Spedizione lotto LT1025 – 15/05/2025</em></li>
                    <li>Un controllo o verifica: <em>Ispezione qualità – Stabilimento A, Audit ICEA 2025</em></li>
                    <li>Un evento documentale: <em>Firma contratto fornitura – Cliente COOP, Approvazione certificato biologico</em></li>
                  </ul>
                  <p style={{ marginTop: "1rem" }}><strong>📌 Consiglio:</strong> scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente lo step anche dopo mesi o anni.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="form-group">
                  <label>
                    Descrizione
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input"
                    rows={4}
                    maxLength={500}
                  ></textarea>
                  <small className="char-counter">{formData.description.length} / 500</small>
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci una descrizione dello step, come una fase produttiva, logistica, amministrativa o documentale. Fornisci tutte le informazioni utili per identificarlo chiaramente all'interno del processo o della filiera a cui appartiene.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="form-group">
                  <label>
                    Luogo
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input"
                    maxLength={100}
                  />
                  <small className="char-counter">{formData.location.length} / 100</small>
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci il luogo in cui si è svolto lo step, come una città, una regione, un'azienda agricola, uno stabilimento o un punto logistico. Serve a indicare con precisione dove è avvenuto il passaggio registrato.</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="form-group">
                  <label>
                    Data
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-input"
                    max={today}
                  />
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci una data, puoi utilizzare il giorno attuale o una data precedente alla conferma di questo step.</p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <div className="form-group">
                  <label>
                    Immagini / Documenti
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input
                    type="file"
                    name="attachments"
                    onChange={handleFileChange}
                    className="form-input"
                    accept="image/png, image/jpeg, image/webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.oasis.opendocument.text, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  />
                  <small style={{ marginTop: "4px" }}>
                    Formati immagini: PNG, JPG, WEBP. Max: 5 MB.<br />
                    Formati documenti: PDF, DOC, DOCX, ODT, CSV, XLS, XLSX. Max 10 MB.
                  </small>
                  {selectedFile && (
                    <p className="file-name-preview">File: {selectedFile.name}</p>
                  )}
                </div>
                <div style={helpTextStyle}>
                  <p>Carica un'immagine rappresentativa dello step, come una foto della fase produttiva, di un documento firmato, di un certificato o di un controllo effettuato. Rispetta i formati e i limiti di peso.</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <h4>Riepilogo Dati</h4>
                <div className="recap-summary">
                  <p><strong>Nome Evento:</strong> {truncateText(formData.eventName, 40) || "N/D"}</p>
                  <p><strong>Descrizione:</strong> {truncateText(formData.description, 60) || "N/D"}</p>
                  <p><strong>Luogo:</strong> {truncateText(formData.location, 40) || "N/D"}</p>
                  <p><strong>Data:</strong> {formData.date ? formData.date.split("-").reverse().join("/") : "N/D"}</p>
                  <p><strong>File:</strong> {truncateText(selectedFile?.name || "", 40) || "Nessuno"}</p>
                </div>
                <p>Vuoi confermare e registrare questo step sulla blockchain?</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div>
              {currentStep > 1 && (
                <button onClick={handlePrevStep} className="web3-button secondary" disabled={isProcessing}>
                  Indietro
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={onClose} className="web3-button secondary" disabled={isProcessing}>
                Chiudi
              </button>
              {currentStep < 6 && (
                <button onClick={handleNextStep} className="web3-button">
                  Avanti
                </button>
              )}
              {currentStep === 6 && (
                <button onClick={handleSubmit} disabled={isProcessing} className="web3-button">
                  {isProcessing ? "Conferma..." : "Conferma e Registra"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <TransactionStatusModal
          isOpen={true}
          status={txResult?.status === "success" ? "success" : txResult?.status === "error" ? "error" : "loading"}
          message={txResult?.message || loadingMessage}
          onClose={() => {}}
        />
      )}
    </>
  );
};

// Componente modale per finalizzare iscrizione
const FinalizeModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  onSuccess: () => void;
  onCreditsUpdate: (credits: number) => void;
}> = ({ batch, onClose, onSuccess, onCreditsUpdate }) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [txResult, setTxResult] = useState<{ status: "success" | "error"; message: string; } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleFinalize = async () => {
    setLoadingMessage("Finalizzazione in corso...");
    
    const transaction = prepareContractCall({
      contract,
      method: "function closeBatch(uint256)",
      params: [batch.batchId],
    });

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        setTxResult({ status: "success", message: "Iscrizione finalizzata con successo!" });

        // Aggiorna i crediti localmente dopo la transazione
        if (account?.address) {
          try {
            const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
            if (response.ok) {
              const data = await response.json();
              onCreditsUpdate(data.credits);

              await fetch('/api/activate-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'setCredits',
                  walletAddress: account.address,
                  credits: data.credits,
                }),
              });
            }
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti:", error);
          }
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 2000);
      },
      onError: (err) => {
        setTxResult({
          status: "error",
          message: err.message.toLowerCase().includes("insufficient funds") ? "Crediti Insufficienti" : "Errore nella transazione."
        });
        setLoadingMessage("");
      },
    });
  };

  const isProcessing = loadingMessage !== "" || isPending;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Finalizza Iscrizione</h2>
          </div>
          <div className="modal-body">
            <p>Sei sicuro di voler finalizzare l'iscrizione "{batch.name}"?</p>
            <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '1rem' }}>
              ⚠️ Attenzione: Una volta finalizzata, non potrai più aggiungere step a questa iscrizione.
            </p>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="web3-button secondary" disabled={isProcessing}>
              Annulla
            </button>
            <button onClick={handleFinalize} disabled={isProcessing} className="web3-button">
              {isProcessing ? "Finalizzazione..." : "Finalizza"}
            </button>
          </div>
        </div>
      </div>

      {isProcessing && (
        <TransactionStatusModal
          isOpen={true}
          status={txResult?.status === "success" ? "success" : txResult?.status === "error" ? "error" : "loading"}
          message={txResult?.message || loadingMessage}
          onClose={() => {}}
        />
      )}
    </>
  );
};

// Componente modale per visualizzare steps
const StepsModal: React.FC<{
  batch: Batch;
  onClose: () => void;
}> = ({ batch, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="steps-modal-overlay" onClick={onClose}>
        <div className="steps-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="steps-modal-header">
            <h2>Steps - {batch.name}</h2>
            <button onClick={onClose} className="web3-button secondary">
              ✕
            </button>
          </div>
          <div className="steps-modal-body">
            {batch.steps && batch.steps.length > 0 ? (
              batch.steps.map((step, index) => (
                <div key={index} className="step-card">
                  <h4>📝 Step {index + 1}: {step.eventName}</h4>
                  <p><strong>📄 Descrizione:</strong> {step.description || "N/D"}</p>
                  <p><strong>📅 Data:</strong> {formatItalianDate(step.date)}</p>
                  <p><strong>📍 Luogo:</strong> {step.location || "N/D"}</p>
                  <p>
                    <strong>🔗 Verifica su Blockchain:</strong>
                    <a
                      href={`https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash || batch.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: '0.5rem' }}
                    >
                      🔗 Verifica
                    </a>
                  </p>
                  {step.attachmentsIpfsHash && step.attachmentsIpfsHash !== "N/A" && (
                    <p>
                      <strong>📎 Allegati:</strong>
                      <a
                        href={`https://musical-emerald-partridge.myfilebase.com/ipfs/${step.attachmentsIpfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: '0.5rem' }}
                      >
                        📎 Visualizza
                      </a>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>Nessuno step disponibile per questa iscrizione.</p>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

// Componente modale per nuova iscrizione
const NewInscriptionModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  onCreditsUpdate: (credits: number) => void;
}> = ({ onClose, onSuccess, onCreditsUpdate }) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [txResult, setTxResult] = useState<{ status: "success" | "error"; message: string; } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.name.trim()) {
      alert("Il campo 'Nome Iscrizione' è obbligatorio.");
      return;
    }
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setTxResult({ status: "error", message: "Il campo Nome Iscrizione è obbligatorio." });
      return;
    }

    setLoadingMessage("Preparazione transazione...");
    let imageIpfsHash = "";

    if (selectedFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageIpfsHash = uploadResult.cid;
        }
      } catch (error) {
        console.error("Errore upload file:", error);
      }
    }

    setLoadingMessage("Transazione in corso...");
    const transaction = prepareContractCall({
      contract,
      method: "function createBatch(string,string,string,string,string)",
      params: [formData.name, formData.description || "", formData.date || "", formData.location || "", imageIpfsHash],
    });

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        setTxResult({ status: "success", message: "Iscrizione creata! Aggiorno i dati..." });

        // Aggiorna i crediti localmente dopo la transazione
        if (account?.address) {
          try {
            const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
            if (response.ok) {
              const data = await response.json();
              onCreditsUpdate(data.credits);

              await fetch('/api/activate-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'setCredits',
                  walletAddress: account.address,
                  credits: data.credits,
                }),
              });
            }
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti:", error);
          }
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 2000);
      },
      onError: (err) => {
        setTxResult({
          status: "error",
          message: err.message.toLowerCase().includes("insufficient funds") ? "Crediti Insufficienti" : "Errore nella transazione."
        });
        setLoadingMessage("");
      },
    });
  };

  const isProcessing = loadingMessage !== "" || isPending;
  const today = new Date().toISOString().split("T")[0];
  const helpTextStyle = {
    backgroundColor: "#343a40",
    border: "1px solid #495057",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "16px",
    fontSize: "0.9rem",
    color: "#f8f9fa"
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Nuova Iscrizione ({currentStep}/6)</h2>
          </div>
          <div className="modal-body" style={{ minHeight: "350px" }}>
            {currentStep === 1 && (
              <div>
                <div className="form-group">
                  <label>
                    Nome Iscrizione 
                    <span style={{ color: "red", fontWeight: "bold" }}> * Obbligatorio</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="form-input" 
                    maxLength={100} 
                  />
                  <small className="char-counter">{formData.name.length} / 100</small>
                </div>
                <div style={helpTextStyle}>
                  <p><strong>ℹ️ Come scegliere il Nome Iscrizione</strong></p>
                  <p>Il Nome Iscrizione è un'etichetta descrittiva che ti aiuta a identificare in modo chiaro ciò che stai registrando on-chain. Ad esempio:</p>
                  <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
                    <li>Il nome di un prodotto o varietà: <em>Pomodori San Marzano 2025, Olio Extravergine Frantoio</em></li>
                    <li>Un lotto o una produzione: <em>Lotto Pasta Artigianale LT1025, Produzione Vino Rosso 2024</em></li>
                    <li>Un servizio o processo: <em>Trasporto Merci Roma-Milano, Certificazione Biologico 2025</em></li>
                  </ul>
                  <p style={{ marginTop: "1rem" }}><strong>📌 Consiglio:</strong> scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente l'iscrizione anche dopo mesi o anni.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="form-group">
                  <label>
                    Descrizione
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input"
                    rows={4}
                    maxLength={500}
                  ></textarea>
                  <small className="char-counter">{formData.description.length} / 500</small>
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci una descrizione dettagliata di ciò che stai registrando. Fornisci tutte le informazioni utili per identificare chiaramente il prodotto, il servizio o il processo a cui appartiene questa iscrizione.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="form-group">
                  <label>
                    Luogo di Produzione
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="form-input"
                    maxLength={100}
                  />
                  <small className="char-counter">{formData.location.length} / 100</small>
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci il luogo di origine o produzione, come una città, una regione, un'azienda agricola o uno stabilimento. Serve a indicare con precisione dove ha avuto origine ciò che stai registrando.</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="form-group">
                  <label>
                    Data di Origine
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-input"
                    max={today}
                  />
                </div>
                <div style={helpTextStyle}>
                  <p>Inserisci una data di origine, puoi utilizzare il giorno attuale o una data precedente alla registrazione di questa iscrizione.</p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <div className="form-group">
                  <label>
                    Immagine Prodotto
                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    className="form-input"
                    accept="image/png, image/jpeg, image/webp"
                  />
                  <small style={{ marginTop: "4px" }}>
                    Formati supportati: PNG, JPG, WEBP. Dimensione massima: 5 MB.
                  </small>
                  {selectedFile && (
                    <p className="file-name-preview">File: {selectedFile.name}</p>
                  )}
                </div>
                <div style={helpTextStyle}>
                  <p>Carica un'immagine rappresentativa di ciò che stai registrando, come una foto del prodotto, del luogo di produzione o di un documento. Rispetta i formati e i limiti di peso.</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <h4>Riepilogo Dati</h4>
                <div className="recap-summary">
                  <p><strong>Nome:</strong> {truncateText(formData.name, 40) || "N/D"}</p>
                  <p><strong>Descrizione:</strong> {truncateText(formData.description, 60) || "N/D"}</p>
                  <p><strong>Luogo:</strong> {truncateText(formData.location, 40) || "N/D"}</p>
                  <p><strong>Data:</strong> {formData.date ? formData.date.split("-").reverse().join("/") : "N/D"}</p>
                  <p><strong>Immagine:</strong> {truncateText(selectedFile?.name || "", 40) || "Nessuna"}</p>
                </div>
                <p>Vuoi confermare e registrare questa iscrizione sulla blockchain?</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div>
              {currentStep > 1 && (
                <button onClick={handlePrevStep} className="web3-button secondary" disabled={isProcessing}>
                  Indietro
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={onClose} className="web3-button secondary" disabled={isProcessing}>
                Chiudi
              </button>
              {currentStep < 6 && (
                <button onClick={handleNextStep} className="web3-button">
                  Avanti
                </button>
              )}
              {currentStep === 6 && (
                <button onClick={handleSubmit} disabled={isProcessing} className="web3-button">
                  {isProcessing ? "Conferma..." : "Conferma e Registra"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <TransactionStatusModal
          isOpen={true}
          status={txResult?.status === "success" ? "success" : txResult?.status === "error" ? "error" : "loading"}
          message={txResult?.message || loadingMessage}
          onClose={() => {}}
        />
      )}
    </>
  );
};

// Componente modale per scelta tipo esportazione
const ExportTypeModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  onSelectType: (type: 'pdf' | 'html') => void;
}> = ({ batch, onClose, onSelectType }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Informazioni Esportazione</h2>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: '2rem' }}>
            <p>Se hai finalizzato la tua iscrizione (non prima) potrai esportare:</p>
            <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '1rem 0' }}>
              <li>Un certificato EasyChain in formato PDF</li>
              <li>Un certificato EasyChain HTML che potrai caricare sul tuo server - spazio privato, copia il link e genera il QR Code da applicare sull'etichetta del tuo prodotto.</li>
            </ul>
          </div>
          <div className="export-modal-buttons">
            <button 
              className="export-type-button"
              onClick={() => onSelectType('pdf')}
            >
              📄 Esporta PDF
            </button>
            <button 
              className="export-type-button"
              onClick={() => onSelectType('html')}
            >
              🌐 Esporta HTML
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="web3-button secondary">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente placeholder per modale selezione banner (non più necessario)
const BannerSelectionModal: React.FC<{
  batch: Batch;
  exportType: 'pdf' | 'html';
  onClose: () => void;
  onExport: (bannerId: string) => void;
}> = ({ batch, exportType, onClose, onExport }) => {
  // Esporta direttamente senza banner
  React.useEffect(() => {
    onExport('none');
  }, [onExport]);

  return null;
};

// Componente modale info
const InfoModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Informazioni Iscrizioni</h2>
        </div>
        <div className="modal-body">
          <div style={{ textAlign: 'left' }}>
            <h4>Come funziona:</h4>
            <ul style={{ paddingLeft: '20px', margin: '1rem 0' }}>
              <li><strong>Inizializza:</strong> Crea una nuova iscrizione con i dati base del prodotto</li>
              <li><strong>Aggiungi Steps:</strong> Registra ogni fase della filiera produttiva</li>
              <li><strong>Finalizza:</strong> Chiudi l'iscrizione quando completata</li>
              <li><strong>Esporta:</strong> Genera certificati PDF o HTML per i tuoi clienti</li>
            </ul>
            
            <h4>Stati dell'iscrizione:</h4>
            <ul style={{ paddingLeft: '20px', margin: '1rem 0' }}>
              <li><span style={{ color: '#10b981' }}>Aperto</span>: Puoi aggiungere nuovi step</li>
              <li><span style={{ color: '#ef4444' }}>Chiuso</span>: Finalizzato, pronto per l'esportazione</li>
            </ul>

            <h4>Costi:</h4>
            <p>Ogni operazione (nuova iscrizione, aggiunta step, finalizzazione) consuma 1 credito.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="web3-button">
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principale "Controllore"
const AziendaPage: React.FC = () => {
  const account = useActiveAccount();

  const [companyStatus, setCompanyStatus] = useState<{
    isLoading: boolean;
    isActive: boolean;
    data: CompanyData | null;
    error: string | null;
  }>({
    isLoading: true,
    isActive: false,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!account) {
      setCompanyStatus({ isLoading: false, isActive: false, data: null, error: null });
      return;
    }

    const checkCompanyStatus = async () => {
      setCompanyStatus(prev => ({ ...prev, isLoading: true }));
      try {
        const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
        if (!response.ok) {
          throw new Error('Errore di rete nella verifica dello stato.');
        }
        const data = await response.json();
        setCompanyStatus({
          isLoading: false,
          isActive: data.isActive,
          data: data.isActive ? { 
            companyName: data.companyName, 
            credits: data.credits,
            status: data.status || 'active'
          } : null,
          error: null,
        });
      } catch (err: any) {
        setCompanyStatus({
          isLoading: false,
          isActive: false,
          data: null,
          error: err.message,
        });
      }
    };

    checkCompanyStatus();
  }, [account]);

  const renderContent = () => {
    if (companyStatus.isLoading) {
      return <div className="centered-container"><p>Verifica stato account in corso...</p></div>;
    }

    if (companyStatus.error) {
      return <div className="centered-container"><p style={{ color: "red" }}>{companyStatus.error}</p></div>;
    }

    if (companyStatus.isActive && companyStatus.data) {
      return <Dashboard companyData={companyStatus.data} />;
    }

    if (account) {
      return <RegistrationForm walletAddress={account.address} />;
    }

    return <div className="centered-container"><p>Connetti il wallet per continuare.</p></div>;
  };

  if (!account) {
    return (
      <div className="login-container">
        <AziendaPageStyles />
        <div style={{ textAlign: "center" }}>
          <h1>Benvenuto</h1>
          <p>Connetti il tuo wallet per accedere.</p>
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
      <AziendaPageStyles />
      <div className="app-container-full">
        <header className="main-header-bar">
          <h1 className="header-title">EasyChain - Area Privata</h1>
          <ConnectButton 
            client={client}
            chain={polygon}
            accountAbstraction={{ chain: polygon, sponsorGas: true }}
          />
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default AziendaPage;