// FILE: src/pages/AziendaPage.tsx
// DESCRIZIONE: Versione aggiornata che utilizza Firebase per i dati azienda,
// implementa il sistema di refresh on-chain e gestisce le iscrizioni con numerazione incrementale.

import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { supplyChainABI as abi } from "../abi/contractABI";
import "../App.css"; // Mantieni il file CSS base se necessario, altrimenti rimuovi
import { Shield, Zap, Cpu, Network, Lock, FileText, ArrowRight, X, Play, RefreshCw, Info, CheckCircle, Package, User } from 'lucide-react';
import RegistrationForm from "../components/RegistrationForm";
import TransactionStatusModal from "../components/TransactionStatusModal";
import { Link } from "react-router-dom";

// --- Nuovo blocco di stili CSS (Integrato per la coerenza) ---
const CustomStyles = () => (
  <style>{`
      /* Background e Effetti Hero */
      .hero-section {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .tech-pattern {
        position: absolute;
        inset: 0;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none" stroke="%23374151" stroke-width="0.5" stroke-dasharray="2 2"><path d="M0 0h100v100H0zM50 0v100M0 50h100" /></svg>');
        opacity: 0.1;
      }
      
      .hero-gradient {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(107, 114, 128, 0.05) 50%, rgba(107, 114, 128, 0) 100%);
      }

      /* Animazioni */
      @keyframes float {
        0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        50% { transform: translateY(-20px) translateX(-5px) rotate(5deg); }
        100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
      }
      .floating-animation {
        animation: float 8s ease-in-out infinite;
      }
      
      @keyframes pulse-glow {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
        70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
      }
      .pulse-glow {
        animation: pulse-glow 2s infinite;
      }

      /* Nuove classi da 1.tsx */
      .bg-background { background-color: #0f0f0f; }
      .text-primary { color: #3b82f6; }
      .text-primary-foreground { color: #f8f9fa; }
      .text-accent { color: #fbbf24; }
      .text-accent-foreground { color: #f8f9fa; }
      .text-muted-foreground { color: #a0a0a0; }
      .bg-card { background-color: #1a1a1a; }
      .border-border { border-color: #333; }
      
      .primary-gradient {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      }
      
      .accent-gradient {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      }
      
      .glass-card {
        background-color: rgba(26, 26, 26, 0.6);
        border: 1px solid rgba(51, 51, 51, 0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      
      .tech-shadow {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      }
      
      .smooth-transition {
        transition: all 0.3s ease-in-out;
      }
      
      /* Stili aggiuntivi per il layout di AziendaPage */
      .app-container-full { 
        padding: 2rem; 
        min-height: 100vh;
        background-color: #0f0f0f;
        color: #f8f9fa;
      }

      .main-header-bar { 
        display: flex; 
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2.5rem;
        padding: 1.5rem;
        background-color: #1a1a1a;
        border-radius: 1rem;
        border: 1px solid #333;
        align-items: center;
        justify-content: space-between;
      }

      .header-title { 
        font-size: 2rem; 
        font-weight: bold; 
        color: #ffffff;
        text-align: center;
        margin: 0;
      }
      
      @media (min-width: 768px) {
        .main-header-bar {
          flex-direction: row;
        }
      }
      
      /* Altri stili aggiornati per AziendaPage */
      .dashboard-header-card {
        background: rgba(26, 26, 26, 0.6);
        border: 1px solid rgba(51, 51, 51, 0.5);
        backdrop-filter: blur(10px);
        padding: 2rem;
        border-radius: 1.5rem;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dashboard-title-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .dashboard-title {
        font-size: 2rem;
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

      .inscriptions-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .inscriptions-section-title {
        font-size: 1.5rem;
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
        gap: 1.5rem;
      }
      
      @media (min-width: 768px) {
        .inscriptions-grid { 
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
      }

      .inscription-card { 
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        border-radius: 1.5rem; 
        padding: 2rem; 
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
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
        font-size: 1.5rem; 
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
        flex-wrap: wrap;
        gap: 1rem;
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
        backdrop-filter: blur(5px);
      }
      
      .modal-content {
        background-color: #1a1a1a;
        border-radius: 1.5rem;
        border: 1px solid #333;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        color: #ffffff;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      
      .steps-modal-content {
        background-color: #1a1a1a;
        border-radius: 1.5rem;
        border: 1px solid #333;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        color: #ffffff;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }

      .modal-header, .steps-modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .modal-header h2, .steps-modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #ffffff;
      }

      .modal-body, .steps-modal-body {
        padding: 1.5rem;
      }
      
      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #333;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.75rem;
        font-weight: 500;
        color: #f8f9fa;
        font-size: 1rem;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #495057;
        border-radius: 0.5rem;
        background-color: #212529;
        color: #f8f9fa;
        font-size: 0.9rem;
        transition: all 0.3s ease;
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
        text-align: right;
        display: block;
      }

      .recap-summary {
        text-align: left;
        padding: 1.5rem;
        background-color: #2a2a2a;
        border: 1px solid #444;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .recap-summary p {
        margin: 0.75rem 0;
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

      .step-card {
        background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1rem;
        border: 1px solid #444;
      }

      .step-card h4 {
        color: #3b82f6;
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
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
        gap: 1.5rem;
        justify-content: center;
        margin-top: 2rem;
        flex-wrap: wrap;
      }

      .export-type-button {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border: none;
        border-radius: 0.75rem;
        padding: 1.25rem 2.5rem;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 200px;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      }

      .export-type-button:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
      }

      .loading-error-container, .empty-state, .centered-container {
        text-align: center;
        padding: 3rem 1.5rem;
        background: rgba(26, 26, 26, 0.6);
        border-radius: 1.5rem;
        border: 1px solid rgba(51, 51, 51, 0.5);
        color: #a0a0a0;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }

      .loading-error-container p, .empty-state p {
        font-size: 1.1rem;
      }

      .loading-error-container p.error-message {
        color: #ef4444;
      }

      .inscriptions-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 1.5rem;
        background: rgba(26, 26, 26, 0.6);
        border-radius: 1rem;
        border: 1px solid rgba(51, 51, 51, 0.5);
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
      
      .pagination-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.75rem;
        margin-top: 2.5rem;
        padding: 1rem;
        flex-wrap: wrap;
      }

      .pagination-button {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        border: none;
        border-radius: 0.75rem;
        padding: 0.75rem 1.25rem;
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
        border-radius: 0.75rem;
        padding: 0.75rem 1.25rem;
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

      /* Stili per il login */
      .login-container {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .login-card {
        background: rgba(26, 26, 26, 0.6);
        border: 1px solid rgba(51, 51, 51, 0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 1.5rem;
        padding: 3rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        text-align: center;
        max-width: 500px;
        width: 100%;
      }
      
      .login-card h1 {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .login-card p {
        font-size: 1.1rem;
        color: #a0a0a0;
        margin-bottom: 2rem;
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

// Configura Polygon con RPC Thirdweb
const polygonWithRPC = {
  ...polygon,
  rpc: `https://137.rpc.thirdweb.com/023dd6504a82409b2bc7cb971fd35b16`,
};

const contract = getContract({
  client,  chain: polygonWithRPC,
  address: "0x0c5e6204e80e6fb3c0c7098c4fa84b2210358d0b",
  abi,
});

// Componente modale per visualizzare immagini
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', maxHeight: '90%', overflow: 'hidden' }}>
        <img src={imageUrl} alt="Immagine iscrizione" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center smooth-transition" onClick={onClose}><X className="w-6 h-6 text-white" /></button>
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
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

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

        // Se è un export HTML, mostra il popup per il QR Code
        if (exportType === 'html') {
          setShowQRCodeModal(true);
        }
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

      <div className="glass-card rounded-3xl p-8 tech-shadow mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentCompanyData.companyName}</h2>
            <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-center md:items-start">
              <div className="flex items-center gap-2 text-primary-foreground font-semibold">
                <Package className="w-5 h-5 text-accent" />
                <Link to="/ricaricacrediti" className="text-white hover:text-accent smooth-transition">
                  Crediti Rimanenti: <strong className="text-accent">{currentCompanyData.credits}</strong>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground font-semibold">
                <CheckCircle className={`w-5 h-5 ${currentCompanyData.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`} />
                <span className={`font-bold ${currentCompanyData.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {currentCompanyData.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="group primary-gradient text-sm md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-xl tech-shadow smooth-transition hover:scale-105 text-primary-foreground font-semibold flex items-center gap-2 w-full md:w-auto justify-center">
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            Inizializza Nuova Iscrizione
          </button>
        </div>
      </div>

      <div className="inscriptions-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 className="inscriptions-section-title">Le mie Iscrizioni su Blockchain</h3>
          <button 
            className="group glass-card rounded-full w-8 h-8 flex items-center justify-center tech-shadow smooth-transition hover:scale-110"
            onClick={() => setShowInfoModal(true)}
            style={{
              cursor: 'pointer',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            <Info className="w-4 h-4 text-primary group-hover:text-accent smooth-transition" />
          </button>
        </div>
        <div className="refresh-section">
          <button 
            className="group glass-card rounded-full w-12 h-12 flex items-center justify-center tech-shadow smooth-transition hover:scale-105 relative"
            onClick={handleRefresh}
            disabled={isRefreshing || refreshCounter === 0}
          >
            <RefreshCw className="w-6 h-6 text-primary group-hover:text-accent smooth-transition" />
            {refreshCounter > 0 && (
              <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold -translate-y-1/2 translate-x-1/2">
                +{refreshCounter}
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="inscriptions-filters glass-card rounded-xl p-6 tech-shadow mb-8">
        <div className="filter-group">
          <label className="filter-label">Nome</label>
          <input
            type="text"
            className="form-input"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Luogo</label>
          <input
            type="text"
            className="form-input"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Stato</label>
          <select
            className="form-input"
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
        <div className="loading-error-container glass-card rounded-xl p-8 tech-shadow"><p>Caricamento delle tue iscrizioni...</p></div>
      ) : errorBatches ? (
        <div className="loading-error-container glass-card rounded-xl p-8 tech-shadow"><p className="text-red-500">{errorBatches}</p></div>
      ) : (
        <>
          <div className="inscriptions-grid">
            {currentItems.length > 0 ? (
              currentItems.map((batch) => (
                <div key={batch.batchId} className="inscription-card glass-card rounded-2xl p-6 tech-shadow">
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">#{getBatchDisplayNumber(batch.batchId)} - {batch.name}</h3>
                  <p className="text-sm text-gray-400 mb-2"><strong>Descrizione:</strong> {batch.description ? truncateText(batch.description, window.innerWidth < 768 ? 80 : 100) : "N/D"}</p>
                  <p className="text-sm text-gray-400 mb-2"><strong>Data:</strong> {formatItalianDate(batch.date)}</p>
                  <p className="text-sm text-gray-400 mb-2"><strong>Luogo:</strong> {batch.location || "N/D"}</p>
                  <p className="text-sm mb-2"><strong>Stato:</strong> <span className={batch.isClosed ? 'status-closed' : 'status-open'}>
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
                        className="text-primary hover:text-accent smooth-transition"
                      >
                        Apri L'immagine
                      </a>
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mb-4"><strong>Tx Hash:</strong>
                    <a
                      href={`https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent smooth-transition ml-2"
                    >
                      {truncateText(batch.transactionHash, 15)}
                    </a>
                  </p>

                  <div className="inscription-footer">
                    <div className="steps-count">
                      {batch.steps && batch.steps.length > 0 ? (
                        <button
                          className="view-steps-button primary-gradient text-white px-4 py-2 rounded-lg text-sm"
                          onClick={() => setSelectedBatchForSteps(batch)}
                        >
                          {batch.steps.length} steps
                        </button>
                      ) : (
                        <button
                          className="view-steps-button disabled bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                          disabled={true}
                        >
                          0 steps
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 items-center">
                      {batch.isClosed && (
                        <button
                          className="export-button bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm"
                          onClick={() => {
                            setSelectedBatchForExport(batch);
                            setShowExportModal(true);
                          }}
                        >
                          Esporta
                        </button>
                      )}

                      {!batch.isClosed ? (
                        <>
                          <button
                            className="add-step-button bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                            onClick={() => setSelectedBatchForStep(batch)}
                          >
                            Aggiungi Step
                          </button>
                          <button
                            className="finalize-button bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
                            onClick={() => setSelectedBatchForFinalize(batch)}
                          >
                            Finalizza
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xl">
                           <Lock />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state glass-card rounded-2xl p-12 tech-shadow">
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

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

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

      {selectedBatchForSteps && (
        <StepsModal
          batch={selectedBatchForSteps}
          onClose={() => setSelectedBatchForSteps(null)}
        />
      )}

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

      {showInfoModal && (
        <InfoModal onClose={() => setShowInfoModal(false)} />
      )}

      {showQRCodeModal && (
        <QRCodeOfferModal onClose={() => setShowQRCodeModal(false)} />
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

    // Timeout per gestire transazioni bloccate
    const timeoutId = setTimeout(() => {
      if (loadingMessage !== "") {
        setTxResult({ status: "error", message: "Timeout della transazione. Controlla su Polygonscan se è stata eseguita." });
        setLoadingMessage("");
      }
    }, 60000); // 60 secondi timeout

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        clearTimeout(timeoutId);
        setTxResult({ status: "success", message: "Step aggiunto! Aggiorno i dati..." });

        // Salva il transaction hash dello step
        console.log("Transaction hash per step:", result.transactionHash);

        // Aggiorna i crediti localmente dopo la transazione
        if (account?.address) {
          try {
            const creditsResponse = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
            const creditsData = creditsResponse.ok ? await creditsResponse.json() : { credits: 0 };
            onCreditsUpdate(creditsData.credits);
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti:", error);
          }
        }

        // Aggiungi l'evento al cache Firebase
        try {
          // Ottieni i crediti correnti
          const creditsResponse = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
          const creditsData = creditsResponse.ok ? await creditsResponse.json() : { credits: 0 };

          await fetch('/api/add-single-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress: account.address,
              eventType: 'BatchStepAdded',
              eventData: {
                batchId: batch.batchId,
                stepData: {
                  stepIndex: "0", // Verrà aggiornato dall'indexer
                  eventName: formData.eventName,
                  description: formData.description || "",
                  date: formData.date || "",
                  location: formData.location || "",
                  attachmentsIpfsHash: attachmentsIpfsHash,
                  transactionHash: result.transactionHash
                }
              },
              newCredits: creditsData.credits - 1
            }),
          });
        } catch (error) {
          console.error("Errore aggiunta evento al cache:", error);
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 1500);
      },
      onError: (err) => {
        clearTimeout(timeoutId);
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
                <div className="glass-card rounded-2xl p-6">
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
                <div className="glass-card rounded-2xl p-6">
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
                <div className="glass-card rounded-2xl p-6">
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
                <div className="glass-card rounded-2xl p-6">
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
                <div className="glass-card rounded-2xl p-6">
                  <p>Carica un'immagine rappresentativa dello step, come una foto della fase produttiva, di un documento firmato, di un certificato o di un controllo effettuato. Rispetta i formati e i limiti di peso.</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <h4 className="text-xl font-bold mb-4">Riepilogo Dati</h4>
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
            <div className="flex gap-4">
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

    // Timeout per gestire transazioni bloccate
    const timeoutId = setTimeout(() => {
      if (loadingMessage !== "") {
        setTxResult({ status: "error", message: "Timeout della transazione. Controlla su Polygonscan se è stata eseguita." });
        setLoadingMessage("");
      }
    }, 60000); // 60 secondi timeout

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        clearTimeout(timeoutId);
        setTxResult({ status: "success", message: "Iscrizione finalizzata con successo!" });

        // Salva il transaction hash della finalizzazione
        console.log("Transaction hash per finalizzazione:", result.transactionHash);

        // Aggiorna i crediti localmente dopo la transazione
        if (account?.address) {
          try {
            const creditsResponse = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
            const creditsData = creditsResponse.ok ? await creditsResponse.json() : { credits: 0 };
            onCreditsUpdate(creditsData.credits);
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti:", error);
          }
        }

        // Aggiungi l'evento al cache Firebase
        try {
          // Ottieni i crediti correnti
          const creditsResponse = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
          const creditsData = creditsResponse.ok ? await creditsResponse.json() : { credits: 0 };

          await fetch('/api/add-single-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress: account.address,
              eventType: 'BatchClosed',
              eventData: {
                batchId: batch.batchId
              },
              newCredits: creditsData.credits - 1
            }),
          });
        } catch (error) {
          console.error("Errore aggiunta evento al cache:", error);
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 1500);
      },
      onError: (err) => {
        clearTimeout(timeoutId);
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
            <p className="text-lg">Sei sicuro di voler finalizzare l'iscrizione "{batch.name}"?</p>
            <p className="text-yellow-500 text-sm mt-4">
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
      <div className="modal-overlay" onClick={onClose}>
        <div className="steps-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="steps-modal-header">
            <h2>Steps - {batch.name}</h2>
          </div>
          <div className="steps-modal-body">
            {batch.steps && batch.steps.length > 0 ? (
              batch.steps.map((step, index) => (
                <div key={index} className="step-card glass-card rounded-lg p-6 mb-4">
                  <h4 className="text-primary font-bold mb-4 text-lg">Step {index + 1}: {step.eventName}</h4>
                  <p className="text-gray-400 mb-1"><strong>📄 Descrizione:</strong> {step.description || "N/D"}</p>
                  <p className="text-gray-400 mb-1"><strong>📅 Data:</strong> {formatItalianDate(step.date)}</p>
                  <p className="text-gray-400 mb-1"><strong>📍 Luogo:</strong> {step.location || "N/D"}</p>
                  {step.attachmentsIpfsHash && step.attachmentsIpfsHash !== "N/A" && (
                    <p className="text-gray-400 mb-1">
                      <strong>📎 Allegati:</strong>
                      <a
                        href={`https://musical-emerald-partridge.myfilebase.com/ipfs/${step.attachmentsIpfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-accent smooth-transition ml-2"
                      >
                        Visualizza
                      </a>
                    </p>
                  )}
                  <p className="text-gray-400">
                    <strong>🔗 Verifica su Blockchain:</strong>
                    <a
                      href={`https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent smooth-transition ml-2"
                    >
                      {truncateText(step.transactionHash, 15)}
                    </a>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Nessuno step disponibile per questa iscrizione.</p>
            )}
            <div className="text-center mt-8">
              <button onClick={onClose} className="web3-button">
                Indietro
              </button>
            </div>
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
      method: "function initializeBatch(string,string,string,string,string)",
      params: [formData.name, formData.description || "", formData.date || "", formData.location || "", imageIpfsHash],
    });

    // Timeout per gestire transazioni bloccate
    const timeoutId = setTimeout(() => {
      if (loadingMessage !== "") {
        setTxResult({ status: "error", message: "Timeout della transazione. Controlla su Polygonscan se è stata eseguita." });
        setLoadingMessage("");
      }
    }, 60000); // 60 secondi timeout

    sendTransaction(transaction, {
      onSuccess: async (result) => {
        clearTimeout(timeoutId);
        setTxResult({ status: "success", message: "Iscrizione creata! Aggiorno i dati..." });

        // Aggiorna i crediti localmente dopo la transazione
        if (account?.address) {
          try {
            const creditsResponse = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
            const creditsData = creditsResponse.ok ? await creditsResponse.json() : { credits: 0 };
            onCreditsUpdate(creditsData.credits);
          } catch (error) {
            console.error("Errore durante l'aggiornamento dei crediti:", error);
          }
        }

        // Aggiungi l'evento al cache Firebase
        try {
          // Ottieni i crediti correnti
          const creditsResponse = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
          const creditsData = creditsResponse.ok ? await creditsResponse.json() : { credits: 0 };

          await fetch('/api/add-single-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress: account.address,
              eventType: 'BatchInitialized',
              eventData: {
                batchId: result.transactionHash, // Useremo il tx hash temporaneamente
                name: formData.name,
                description: formData.description || "",
                date: formData.date || "",
                location: formData.location || "",
                imageIpfsHash: imageIpfsHash,
                isClosed: false,
                transactionHash: result.transactionHash,
                steps: []
              },
              newCredits: creditsData.credits - 1
            }),
          });
        } catch (error) {
          console.error("Errore aggiunta evento al cache:", error);
        }

        setTimeout(() => {
          onSuccess();
          setLoadingMessage("");
        }, 1500);
      },
      onError: (err) => {
        clearTimeout(timeoutId);
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
                <div className="glass-card rounded-2xl p-6">
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
                <div className="glass-card rounded-2xl p-6">
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
                <div className="glass-card rounded-2xl p-6">
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
                <div className="glass-card rounded-2xl p-6">
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
                <div className="glass-card rounded-2xl p-6">
                  <p>Carica un'immagine rappresentativa di ciò che stai registrando, come una foto del prodotto, del luogo di produzione o di un documento. Rispetta i formati e i limiti di peso.</p>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <h4 className="text-xl font-bold mb-4">Riepilogo Dati</h4>
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
            <div className="flex gap-4">
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
          <div className="glass-card rounded-2xl p-6" style={{ marginBottom: '2rem' }}>
            <p>Se hai completato con successo la tua iscrizione (solo dopo la finalizzazione), potrai esportare:</p>
            <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '1rem 0' }}>
              <li>Un certificato EasyChain in formato PDF, utile all'azienda per uso interno o documentale. Questo file può essere archiviato, stampato o condiviso con terzi per attestare l'iscrizione e l'autenticità del prodotto, senza necessariamente passare per il QR Code.</li>
              <li>Un certificato EasyChain in formato HTML, pensato per la pubblicazione online. Caricalo su uno spazio web (privato o pubblico), copia il link e usalo per generare un QR Code da applicare all'etichetta del tuo prodotto. Inquadrando il QR Code, chiunque potrà visualizzare il certificato direttamente online.</li>
            </ul>
          </div>
          <div className="export-modal-buttons">
            <button 
              className="export-type-button"
              onClick={() => onSelectType('pdf')}
            >
              <FileText className="inline-block mr-2" /> Esporta PDF
            </button>
            <button 
              className="export-type-button"
              onClick={() => onSelectType('html')}
            >
              <Globe className="inline-block mr-2" /> Esporta HTML
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

// Componente modale per offrire la creazione del QR Code
const QRCodeOfferModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const handleGenerateQRCode = () => {
    window.location.href = '/qrcode';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crea QR Code</h2>
        </div>
        <div className="modal-body">
          <p className="text-lg text-center mb-8">
            Vuoi creare anche un QrCode da usare per l'etichetta del tuo prodotto?
          </p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="web3-button secondary">
            No Grazie
          </button>
          <button onClick={handleGenerateQRCode} className="web3-button">
            Genera QrCode
          </button>
        </div>
      </div>
    </div>
  );
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
          <div className="glass-card rounded-2xl p-6 text-white text-left">
            <h4 className="font-bold mb-4 text-xl">COME FUNZIONA</h4>
            <ul className="list-disc list-inside space-y-2 mb-8">
              <li><strong>Inizializza Nuova Iscrizione:</strong> Crea una nuova iscrizione con i dati base del prodotto</li>
              <li><strong>Aggiungi Steps:</strong> Registra ogni fase della filiera produttiva</li>
              <li><strong>Finalizza:</strong> Chiudi l'iscrizione quando completata, non potrai aggiungere nuovi steps</li>
              <li><strong>Esporta:</strong> Genera certificati PDF o HTML per i tuoi clienti</li>
            </ul>

            <h4 className="font-bold mb-4 text-xl">Stati dell'iscrizione:</h4>
            <ul className="list-disc list-inside space-y-2 mb-8">
              <li><span className="text-green-500">Aperto</span>: Puoi aggiungere nuovi step</li>
              <li><span className="text-red-500">Chiuso</span>: Finalizzato, pronto per l'esportazione</li>
            </ul>

            <h4 className="font-bold mb-4 text-xl">Riguardo i Costi:</h4>
            <p>Dopo l'attivazione del tuo account avrai a disposizione crediti gratuiti per avviare la tua attività di certificazione su Blockchain.</p>
            <p>Ogni operazione (nuova iscrizione, aggiunta step, finalizzazione) consuma 1 credito.</p>
            <p className="mt-4">Se hai bisogno di piu' crediti per le tue operazioni vai alla pagina <a href="/ricaricacrediti" className="text-primary hover:text-accent smooth-transition">Ricarica Crediti</a>.</p>
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

// Componente Principale "Controllore"b
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
      return <div className="centered-container"><p className="text-red-500">{companyStatus.error}</p></div>;
    }

    if (companyStatus.isActive && companyStatus.data) {
      return <Dashboard companyData={companyStatus.data} />;
    }

    if (account) {
      return <RegistrationForm walletAddress={account.address} />;
    }

    return (
      <div className="login-container">
        <div className="tech-pattern"></div>
        <div className="hero-gradient"></div>
        <div className="absolute top-20 left-10 w-20 h-20 primary-gradient rounded-full opacity-20 floating-animation"></div>
        <div className="absolute top-40 right-20 w-16 h-16 accent-gradient rounded-full opacity-30 floating-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 primary-gradient rounded-full opacity-25 floating-animation" style={{animationDelay: '4s'}}></div>
        
        <div className="login-card">
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
  };

  return (
    <div className="bg-background">
      <CustomStyles />
      {account ? (
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
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default AziendaPage;