// WARNING: This file is a verbatim copy of the original AziendaPage (2.tsx)

// Saved as AziendaPageStyled.tsx to ensure ALL functionality is preserved exactly.

// Next steps: I'll convert inline CSS to Tailwind classes in a follow-up pass.



// FILE: src/pages/AziendaPage.tsx

// DESCRIZIONE: Versione aggiornata che utilizza Firebase per i dati azienda,

// implementa il sistema d refresh on-chain e gestisce le iscrizioni con numerazione incrementale.



import React, { useState, useEffect } from "react";

import { ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import Footer from '../components/Footer';

import { useNavigate } from "react-router-dom";

import { createThirdwebClient, getContract, prepareContractCall } from "thirdweb";

import { polygon } from "thirdweb/chains";

import { inAppWallet } from "thirdweb/wallets";

import { supplyChainABI as abi } from "../abi/contractABI";

import "../App.css";



// Importa i componenti esterni

import TransactionStatusModal from "../components/TransactionStatusModal";



// --- Stili Mobile-First ---

const AziendaPageStyles = () => (

  <style>{`

      /* Mobile-first base styles */

      .min-h-screen bg-background px-6 py-6 container mx-auto { 

        padding: 1rem; 

        min-height: 100vh;

        background-color: #0f0f0f;

      }



      .flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 p-6 rounded-2xl border border-border { 

        display: flex; 

        flex-direction: column;

        gap: 1rem;

        margin-bottom: 1.5rem;

        padding: 1rem;

        background-color: #1a1a1a;

        border-radius: 0.75rem;

        border: 1px solid #333;

      }



      .text-2xl md:text-3xl font-bold text-foreground { 

        font-size: 1.5rem; 

        font-weight: bold; 

        color: #ffffff;

        text-align: center;

      }



      .flex flex-col items-center justify-center min-h-[60vh] text-center p-6, .flex flex-col items-center justify-center min-h-[60vh] text-center p-6 { 

        display: flex; 

        flex-direction: column; 

        justify-content: center; 

        align-items: center; 

        min-height: 80vh; 

        text-align: center;

        padding: 1rem;

      }



      .glass-card rounded-3xl p-6 tech-shadow flex flex-col md:flex-row justify-between items-center gap-6 { 

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



      .flex items-center gap-4 flex-wrap {

        display: flex;

        align-items: center;

        gap: 1rem;

        flex-wrap: wrap;

      }



      .text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent { 

        font-size: 1.5rem; 

        font-weight: 700;

        color: #ffffff;

        margin: 0;

      }



      .flex flex-col md:flex-row gap-4 items-center {

        display: flex;

        flex-direction: column;

        gap: 1rem;

      }



      .flex flex-col md:flex-row gap-4 items-center-item {

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



      .flex items-center gap-2 {

        display: flex;

        align-items: center;

        gap: 0.5rem;

      }



      .w-12 h-12 rounded-full flex items-center justify-center primary-gradient shadow-md hover:scale-105 transition {

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



      .w-12 h-12 rounded-full flex items-center justify-center primary-gradient shadow-md hover:scale-105 transition:hover {

        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);

        transform: translateY(-2px);

        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);

      }



      .w-12 h-12 rounded-full flex items-center justify-center primary-gradient shadow-md hover:scale-105 transition:disabled {

        opacity: 0.6;

        cursor: not-allowed;

        transform: none;

      }



      .w-5 h-5 text-white {

        color: white;

        font-size: 1.5rem;

      }



      .refresh-counter {

        color: #10b981;

        border-radius: 50%;

        width: 26px;

        height: 26px;

        display: flex;

        align-items: center;

        justify-content: center;

        font-size: 0.9rem;

        font-weight: bold;

        background: rgba(16, 185, 129, 0.12);

        border: 1px solid rgba(16, 185, 129, 0.45);

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



      .primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition { 

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



      .primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition:hover { 

        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);

        transform: translateY(-2px);

        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);

      }



      .primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition.secondary {

        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);

        box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);

      }



      .primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition.secondary:hover {

        background: linear-gradient(135deg, #4b5563 0%, #374151 100%);

        box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);

      }



      .grid gap-6 md:grid-cols-2 lg:grid-cols-3 { 

        display: flex;

        flex-direction: column;

        gap: 1rem;

      }



      .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition { 

        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);

        border-radius: 1rem; 

        padding: 1.5rem; 

        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

        border: 1px solid #333;

        transition: all 0.3s ease;

        position: relative;

        display: flex;

        flex-direction: column;

        height: 100%;

      }

      




      .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition:hover {

        transform: translateY(-2px);

        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);

        border-color: #3b82f6;

      }



      .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition h3 { 

        font-size: 1.1rem; 

        font-weight: 600; 

        color: #ffffff; 

        margin: 0 0 1rem 0;

        border-bottom: 1px solid #333; 

        padding-bottom: 0.75rem;

        word-wrap: break-word; 

      }



      .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition p { 

        margin: 0.75rem 0; 

        color: #a0a0a0; 

        font-size: 0.85rem; 

        line-height: 1.5;

        word-wrap: break-word; 

      }



      .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition strong { 

        color: #ffffff; 

        font-weight: 600;

      }



      .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition a { 

        color: #60a5fa; 

        text-decoration: none; 

        font-weight: 500;

        transition: color 0.2s ease;

      }



      .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition a:hover {

        color: #3b82f6;

      }






      .text-sm text-muted-foreground {

        font-size: 0.8rem;

        color: #a0a0a0;

      }



      .text-green-500 font-semibold {

        color: #10b981;

        font-weight: 600;

      }



      .text-red-500 font-semibold {

        color: #ef4444;

        font-weight: 600;

      }



      .bg-emerald-500 text-white px-3 py-2 rounded-md hover:scale-105 transition {

        background: linear-gradient(135deg, #10b981 0%, #059669 100%);

        color: white;

        border: none;

        border-radius: 0.5rem;

        padding: 0.5rem 1rem;

        font-size: 0.8rem;

        cursor: pointer;

        transition: all 0.3s ease;

      }



      .bg-emerald-500 text-white px-3 py-2 rounded-md hover:scale-105 transition:hover {

        background: linear-gradient(135deg, #059669 0%, #047857 100%);

        transform: translateY(-1px);

      }



      .primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition {

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



      .primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition:hover:not(:disabled) {

        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);

        transform: translateY(-1px);

      }



      .primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition:disabled {

        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);

        cursor: not-allowed;

        opacity: 0.6;

      }



      .accent-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition {

        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);

        color: white;

        border: none;

        border-radius: 0.5rem;

        padding: 0.5rem 1rem;

        font-size: 0.8rem;

        cursor: pointer;

        transition: all 0.3s ease;

      }



      .accent-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition:hover {

        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);

        transform: translateY(-1px);

      }



      .accent-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition.disabled {

        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);

        cursor: not-allowed;

        opacity: 0.6;

      }



      .accent-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition.disabled:hover {

        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);

        transform: none;

      }



      .absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded {

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



      .absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded::after {

        content: '';

        position: absolute;

        top: 100%;

        left: 50%;

        transform: translateX(-50%);

        border: 4px solid transparent;

        border-top-color: #1f2937;

      }



      .primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition:hover .absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded {

        opacity: 1;

      }



      .fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 {

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



      .bg-card p-4 rounded-2xl border border-border max-w-3xl w-full max-h-[80vh] overflow-auto text-foreground {

        background-color: #1a1a1a;

        border-radius: 1rem;

        border: 1px solid #333;

        width: 100%;

        max-width: 800px;

        max-height: 90vh;

        overflow-y: auto;

        color: #ffffff;

      }



      .steps-p-4 border-b border-border {

        padding: 1.5rem;

        border-bottom: 1px solid #333;

        display: flex;

        justify-content: space-between;

        align-items: center;

      }



      .steps-p-4 {

        padding: 1.5rem;

      }



      .bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4 {

        background: linear-gradient(135deg, #2a2a2a 0%, #3a2a3a 100%);

        border-radius: 0.75rem;

        padding: 1.5rem;

        margin-bottom: 1rem;

        border: 1px solid #444;

      }



      .bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4 h4 {

        color: #c4b5fd;

        margin: 0 0 1rem 0;

        font-size: 1.1rem;

      }



      .bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4 p {

        margin: 0.5rem 0;

        color: #a0a0a0;

      }



      .bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4 strong {

        color: #ffffff;

      }



      .export-modal-buttons {

        display: flex;

        gap: 1rem;

        justify-content: center;

        margin-top: 2rem;

      }



      .primary-gradient text-white px-6 py-3 rounded-xl hover:scale-105 transition {

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



      .primary-gradient text-white px-6 py-3 rounded-xl hover:scale-105 transition:hover {

        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);

        transform: translateY(-2px);

      }



      .bg-amber-500 text-white px-3 py-2 rounded-md hover:scale-105 transition {

        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);

        color: white;

        border: none;

        border-radius: 0.5rem;

        padding: 0.5rem 1rem;

        font-size: 0.8rem;

        cursor: pointer;

        transition: all 0.3s ease;

      }



      .bg-amber-500 text-white px-3 py-2 rounded-md hover:scale-105 transition:hover {

        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);

        transform: translateY(-1px);

      }



      .text-gray-400 {

        color: #6b7280;

        font-size: 1.2rem;

      }



      .bg-card p-6 rounded-xl border border-border text-muted-foreground text-center { 

        text-align: center; 

        padding: 2rem 1rem; 

        background-color: #1a1a1a; 

        border-radius: 1rem;

        border: 1px solid #333;

        color: #a0a0a0;

      }



      .mt-4 border-t border-border pt-4 { 

        margin-top: 1rem; 

        border-top: 1px solid #333; 

        padding-top: 1rem; 

      }



      .mt-4 border-t border-border pt-4 h4 { 

        margin: 0 0 0.75rem 0; 

        font-size: 0.9rem; 

        font-weight: 600;

        color: #ffffff;

      }



      .pl-3 border-l-4 border-primary/60 bg-primary/5 rounded-r-md mb-3 p-3 text-sm text-muted-foreground { 

        font-size: 0.8rem; 

        padding: 0.75rem 0 0.75rem 1rem;

        border-left: 2px solid #3b82f6; 

        margin-bottom: 0.75rem;

        background-color: rgba(59, 130, 246, 0.05);

        border-radius: 0 0.5rem 0.5rem 0;

      }



      .pl-3 border-l-4 border-primary/60 bg-primary/5 rounded-r-md mb-3 p-3 text-sm text-muted-foreground p {

        margin: 0.25rem 0;

        color: #a0a0a0;

      }



      .bg-card p-8 rounded-xl border border-border text-center text-muted-foreground {

        text-align: center;

        padding: 3rem 1rem;

        color: #a0a0a0;

        background-color: #1a1a1a;

        border-radius: 1rem;

        border: 1px solid #333;

      }



      /* Modal styles */

      .fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 {

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



      .bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground {

        background-color: #1a1a1a;

        border-radius: 1rem;

        border: 1px solid #333;

        width: 100%;

        max-width: 600px;

        max-height: 90vh;

        overflow-y: auto;

        color: #ffffff;

      }



      .p-4 border-b border-border {

        padding: 1.5rem;

        border-bottom: 1px solid #333;

      }



      .p-4 border-b border-border h2 {

        margin: 0;

        font-size: 1.25rem;

        font-weight: 600;

      }



      .p-4 {

        padding: 1.5rem;

      }



      .p-4 border-t border-border flex justify-between gap-4 {

        padding: 1.5rem;

        border-top: 1px solid #333;

        display: flex;

        justify-content: space-between;

        gap: 1rem;

      }



      .mb-4 {

        margin-bottom: 1rem;

      }



      .mb-4 label {

        display: block;

        margin-bottom: 0.5rem;

        font-weight: 500;

        color: #f8f9fa;

      }



      .w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 {

        width: 100%;

        padding: 0.75rem;

        border: 1px solid #495057;

        border-radius: 0.5rem;

        background-color: #212529;

        color: #f8f9fa;

        font-size: 0.9rem;

      }



      .w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50:focus {

        outline: none;

        border-color: #3b82f6;

        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);

      }



      .char-counter {

        font-size: 0.75rem;

        color: #6c757d;

        margin-top: 0.25rem;

      }



      .bg-gray-800 p-4 rounded-md border border-gray-700 {

        text-align: left;

        padding: 1rem;

        background-color: #2a2a2a;

        border: 1px solid #444;

        border-radius: 0.5rem;

        margin-bottom: 1rem;

      }



      .bg-gray-800 p-4 rounded-md border border-gray-700 p {

        margin: 0.5rem 0;

        word-break: break-word;

      }



      .bg-gray-800 p-4 rounded-md border border-gray-700 p strong {

        color: #f8f9fa;

      }



      .text-primary underline mt-2 block {

        color: #3b82f6;

        font-size: 0.85rem;

        margin-top: 0.5rem;

      }



      /* Image modal styles */

      .image-fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 {

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



      .image-bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground {

        max-width: 90%;

        max-height: 90%;

        border-radius: 0.5rem;

        overflow: hidden;

      }



      .image-bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground img {

        width: 100%;

        height: 100%;

        object-fit: contain;

      }



      .absolute top-4 right-4 bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center {

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

      .flex flex-wrap gap-4 p-4 bg-card rounded-2xl border border-border {

        display: flex;

        flex-wrap: wrap;

        gap: 1rem;

        margin-bottom: 1.5rem;

        padding: 1rem;

        background-color: #1e1e2a; /* blu scuro come le card */

        border-radius: 0.75rem;

        border: 1px solid #333;

      }



      .flex flex-col gap-2 min-w-[200px] flex-1 {

        display: flex;

        flex-direction: column;

        gap: 0.5rem;

        min-width: 200px;

        flex: 1;

      }



      .text-sm font-medium text-foreground {

        font-size: 0.9rem;

        font-weight: 500;

        color: #ffffff;

      }



      .p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:ring-2 focus:ring-primary/50 {

        padding: 0.75rem;

        border: 1px solid #333;

        border-radius: 0.5rem;

        background-color: #2a2a2a;

        color: #ffffff;

        font-size: 0.9rem;

      }



      .p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:ring-2 focus:ring-primary/50:focus {

        outline: none;

        border-color: #3b82f6;

        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);

      }



      /* Paginazione */

      .flex items-center justify-center gap-3 mt-6 p-4 {

        display: flex;

        justify-content: center;

        align-items: center;

        gap: 0.5rem;

        margin-top: 2rem;

        padding: 1rem;

      }



      .primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition {

        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);

        color: white;

        border: none;

        border-radius: 0.5rem;

        padding: 0.75rem 1rem;

        cursor: pointer;

        transition: all 0.3s ease;

        font-size: 0.9rem;

      }



      .primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition:hover:not(:disabled) {

        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);

        transform: translateY(-1px);

      }



      .primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition:disabled {

        opacity: 0.6;

        cursor: not-allowed;

        transform: none;

      }



      .bg-transparent text-foreground border border-border px-3 py-2 rounded-md hover:bg-card {

        background-color: transparent;

        color: #ffffff;

        border: 1px solid #333;

        border-radius: 0.5rem;

        padding: 0.75rem 1rem;

        cursor: pointer;

        transition: all 0.3s ease;

        font-size: 0.9rem;

      }



      .bg-transparent text-foreground border border-border px-3 py-2 rounded-md hover:bg-card:hover {

        background-color: #333;

      }



      .bg-transparent text-foreground border border-border px-3 py-2 rounded-md hover:bg-card.active {

        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);

        color: white;

        border-color: #6366f1;

      }



      .text-sm text-muted-foreground {

        color: #a0a0a0;

        font-size: 0.9rem;

        margin: 0 1rem;

      }



      /* Evidenzia pagina corrente della paginazione */

      .pagination-btn {

        background-color: transparent;

        color: #ffffff;

        border: 1px solid #333;

        border-radius: 0.5rem;

        padding: 0.75rem 1rem;

        cursor: pointer;

        transition: all 0.2s ease;

        font-size: 0.9rem;

      }

      .pagination-btn:hover {

        background-color: #333;

      }

      .pagination-btn.is-active {

        background: linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%);

        color: #ffffff;

        border-color: #8b5cf6;

        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.35);

        transform: translateY(-1px);

      }



      /* Tablet styles */

      @media (min-width: 768px) {

        .min-h-screen bg-background px-6 py-6 container mx-auto { 

          padding: 2rem; 

        }



        .flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 p-6 rounded-2xl border border-border { 

          flex-direction: row;

          justify-content: space-between;

          align-items: center;

          padding: 1.5rem;

        }



        .text-2xl md:text-3xl font-bold text-foreground { 

          font-size: 1.75rem;

          text-align: left;

        }



        .glass-card rounded-3xl p-6 tech-shadow flex flex-col md:flex-row justify-between items-center gap-6 { 

          flex-direction: row;

          justify-content: space-between;

          align-items: flex-start;

          padding: 2rem;

        }



        .text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent { 

          font-size: 1.75rem;

        }



        .flex flex-col md:flex-row gap-4 items-center {

          flex-direction: row;

          gap: 2rem;

        }



        .primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition {

          width: auto;

          min-width: 200px;

        }



        .grid gap-6 md:grid-cols-2 lg:grid-cols-3 { 

          display: grid;

          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

          gap: 1.5rem;

        }



        .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition h3 { 

          font-size: 1.25rem;

        }



        .bg-card p-6 rounded-xl border border-border text-muted-foreground text-center { 

          padding: 3rem; 

        }

      }



      /* Desktop styles */

      @media (min-width: 1024px) {

        .min-h-screen bg-background px-6 py-6 container mx-auto { 

          max-width: 1200px;

          margin: 0 auto;

          padding: 2rem;

        }



        .grid gap-6 md:grid-cols-2 lg:grid-cols-3 { 

          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));

          gap: 2rem;

        }



        .glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition { 

          padding: 2rem; 

        }



        .glass-card rounded-3xl p-6 tech-shadow flex flex-col md:flex-row justify-between items-center gap-6 { 

          padding: 2.5rem;

        }

      }



      /* Custom additions for requested tweaks */

      .credits-link {

        color: #ffffff;

        text-decoration: none;

        cursor: pointer;

        transition: all 0.3s ease;

      }



      .credits-link:hover {

        text-decoration: underline !important;

        text-decoration-color: #ffffff !important;

        text-underline-offset: 2px;

      }



      .batch-number {

        color: #a78bfa;

        font-weight: bold;

        display: inline-block;

        padding: 0.25rem 0.5rem;

        border: 1px solid #a78bfa;

        border-radius: 0.5rem;

        background: transparent;

        margin-right: 0.5rem;

      }



      .batch-card {

        transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;

        width: 100%;

        min-width: 0;

        box-sizing: border-box;

      }



      .batch-card:hover {

        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.9), 0 10px 25px rgba(139, 92, 246, 0.2);

        border-color: #8b5cf6;

      }



      .batch-title {

        font-size: 1.4rem;

        font-weight: 800;

        border-bottom: 1px solid #333;

        padding-bottom: 0.75rem;

        margin: 0 0 1rem 0;

        color: #ffffff;

        white-space: nowrap;

        overflow: hidden;

        text-overflow: ellipsis;

        display: block;

        max-width: 100%;

      }



      .batch-number {

        color: #a78bfa;

        display: inline-block;

        padding: 0.25rem 0.5rem;

        border: 1px solid #a78bfa;

        border-radius: 0.5rem;

        background: transparent;

        margin-right: 0.5rem;

      }



      .label-violet {

        color: #c4b5fd !important;

      }



      .link-underline-hover:hover {

        text-decoration: underline;

        text-decoration-color: #ffffff;

      }



      .info-button-reset {

        background: transparent !important;

        border: none !important;

        box-shadow: none !important;

        padding: 0;

        line-height: 1;

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



// Componente modale per visualizzare immagini (fullscreen overlay)

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {

  return (

    <div 

      style={{

        position: 'fixed',

        top: 0,

        left: 0,

        right: 0,

        bottom: 0,

        backgroundColor: 'rgba(0, 0, 0, 0.9)',

        display: 'flex',

        justifyContent: 'center',

        alignItems: 'center',

        zIndex: 9999,

        padding: '2rem'

      }}

      onClick={onClose}

    >

      <div 

        style={{

          position: 'relative',

          maxWidth: '90vw',

          maxHeight: '90vh',

          background: 'transparent'

        }}

        onClick={(e) => e.stopPropagation()}

      >

        <img 

          src={imageUrl} 

          alt="Immagine iscrizione" 

          style={{

            maxWidth: '100%',

            maxHeight: '100%',

            objectFit: 'contain',

            borderRadius: '0.75rem',

            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'

          }}

        />

        <button 

          onClick={onClose}

          style={{

            position: 'absolute',

            top: '1rem',

            right: '1rem',

            background: 'rgba(0, 0, 0, 0.7)',

            color: 'white',

            border: 'none',

            borderRadius: '50%',

            width: '40px',

            height: '40px',

            cursor: 'pointer',

            fontSize: '1.5rem',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            transition: 'all 0.3s ease'

          }}

          onMouseOver={(e) => {

            e.target.style.background = 'rgba(0, 0, 0, 0.9)';

            e.target.style.transform = 'scale(1.1)';

          }}

          onMouseOut={(e) => {

            e.target.style.background = 'rgba(0, 0, 0, 0.7)';

            e.target.style.transform = 'scale(1)';

          }}

        >

          ×

        </button>

      </div>

    </div>

  );

};



// Componente per il loading a pagina piena

const FullPageLoading: React.FC<{ message?: string }> = ({ message }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [fade, setFade] = useState(true);

  const loadingMessages = [
    "Stiamo aggiornando i tuoi dati",
    "Attendi qualche secondo",
    "Le tue iscrizioni appariranno qui",
    "Ci siamo quasi",
    "Caricamento delle informazioni",
    "Sincronizzazione con la blockchain"
  ];

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
          setFade(true);
        }, 300);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [message]);

  return (

    <div className="full-page-loading">

      <div className="loading-spinner"></div>

      <p style={{ 
        opacity: fade ? 1 : 0.3, 
        transition: 'opacity 0.3s ease',
        fontSize: '1.1rem',
        fontWeight: '500'
      }}>
        {message || loadingMessages[currentMessage]}
      </p>

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

  const [showQRModal, setShowQRModal] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);

  const [showBannerModal, setShowBannerModal] = useState(false);

  const [selectedExportType, setSelectedExportType] = useState<'pdf' | 'html' | null>(null);

  const [showInfoModal, setShowInfoModal] = useState(false);

  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

  // Funzione helper per ottenere il timestamp corretto per un batch
  const getBatchTimestamp = (batch: Batch) => {
    if (batch.qrCodeGenerated && batch.qrCodeTimestamp) {
      return batch.qrCodeTimestamp;
    } else if (batch.qrCodeGenerated && !batch.qrCodeTimestamp) {
      // Controlla se esiste un timestamp salvato in localStorage
      const savedTimestamp = localStorage.getItem(`qr_timestamp_${batch.batchId}`);
      if (savedTimestamp) {
        return parseInt(savedTimestamp);
      } else {
        // Per QR generati prima di questa modifica, usa un timestamp fisso
        const fixedTimestamp = 1757772000000 + batch.batchId;
        localStorage.setItem(`qr_timestamp_${batch.batchId}`, fixedTimestamp.toString());
        return fixedTimestamp;
      }
    } else {
      const newTimestamp = Date.now();
      localStorage.setItem(`qr_timestamp_${batch.batchId}`, newTimestamp.toString());
      return newTimestamp;
    }
  };

  // State per i filtri

  const [nameFilter, setNameFilter] = useState("");

  const [locationFilter, setLocationFilter] = useState("");

  const [dateFilter, setDateFilter] = useState("");

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

    const nameMatch = (batch.name || '').toLowerCase().includes(nameFilter.toLowerCase());

    const locationMatch = (batch.location || '').toLowerCase().includes(locationFilter.toLowerCase());

    const dateMatch = (batch.date || '').toLowerCase().includes(dateFilter.toLowerCase());

    let statusMatch = true;

    if (statusFilter === "Aperto") {

      statusMatch = !batch.isClosed;

    } else if (statusFilter === "Chiuso") {

      statusMatch = batch.isClosed;

    }

    return nameMatch && locationMatch && dateMatch && statusMatch;

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

  // Funzione per generare QR Code con Firebase Realtime Database
  const handleGenerateQRCode = async (batch: Batch) => {
    try {
      console.log('🔥 Generando QR Code con Firebase Realtime Database per batch:', batch.batchId);
      console.log('🔍 DEBUG Batch state:', {
        batchId: batch.batchId,
        qrCodeGenerated: batch.qrCodeGenerated,
        qrCodeTimestamp: batch.qrCodeTimestamp
      });
      
      // Verifica la configurazione Firebase prima di procedere
      const { realtimeDb } = await import('../firebaseConfig');
      
      if (!realtimeDb) {
        throw new Error('Firebase Realtime Database non configurato. Controlla le variabili d\'ambiente VITE_FIREBASE_DATABASE_URL.');
      }
      
      const { ref, set, push } = await import('firebase/database');
      const QRCode = await import('qrcode');
      
      // Step 1: Log per QR già generato (ma permette rigenerazione)
      if (batch.qrCodeGenerated) {
        console.log('🔄 Rigenerando QR Code per batch:', batch.batchId);
      }
      
      // Step 2: Prepara i dati del certificato
      const cleanCompanyName = currentCompanyData.companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      // Usa la funzione helper per ottenere il timestamp corretto
      const timestamp = getBatchTimestamp(batch);
      console.log('🔍 DEBUG Final timestamp for batch', batch.batchId, ':', timestamp);
      
      const certificateId = `${cleanCompanyName}_${batch.batchId}_${timestamp}`;
      const certificateData = {
        batchId: batch.batchId,
        name: batch.name,
        companyName: currentCompanyData.companyName,
        walletAddress: account?.address,
        date: batch.date,
        location: batch.location,
        description: batch.description,
        transactionHash: batch.transactionHash,
        imageIpfsHash: batch.imageIpfsHash,
        steps: batch.steps || [],
        createdAt: new Date().toISOString(),
        isActive: true,
        viewCount: 0
      };
      
      console.log('💾 Salvando certificato nel Realtime Database...');
      
      // Step 2: Salva nel Realtime Database
      const certificateRef = ref(realtimeDb, `certificates/${certificateId}`);
      await set(certificateRef, certificateData);
      
      console.log('✅ Certificato salvato nel Realtime Database:', certificateId);
      
      // Step 3: Genera URL per il certificato
      // Usa un URL fisso per evitare problemi con window.location.origin
      const baseUrl = 'https://simplychain-kr64t1v59-sfylabs-hascs-projects.vercel.app';
      const certificateUrl = `${baseUrl}/api/qr-system?action=view&id=${certificateId}`;
      
      console.log('🌐 URL certificato:', certificateUrl);
      
      // Step 4: Genera QR Code
      const qrCodeDataUrl = await QRCode.default.toDataURL(certificateUrl, {
        width: 1000,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      console.log('📱 QR Code generato per URL:', certificateUrl);
      
      // Step 5: Scarica il QR Code
      const a = document.createElement('a');
      a.href = qrCodeDataUrl;
      const cleanName = batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      a.download = `${cleanName}_qrcode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      console.log('✅ QR Code scaricato con successo');
      
      // Step 6: Aggiorna lo stato del batch (preserva il timestamp originale)
      const updatedBatch = { 
        ...batch, 
        qrCodeGenerated: true, 
        qrCodeTimestamp: batch.qrCodeTimestamp || timestamp // Usa il timestamp originale o quello generato
      };
      setBatches(prevBatches => 
        prevBatches.map(b => 
          b.batchId === batch.batchId ? updatedBatch : b
        )
      );
      
      // Step 7: Salva stato in Firestore (per compatibilità)
      try {
        await fetch('/api/qr-system?action=update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: account?.address,
            batchId: batch.batchId,
            qrCodeGenerated: true,
            qrCodeTimestamp: batch.qrCodeTimestamp || timestamp
          })
        });
        console.log('✅ Stato QR salvato in Firestore');
      } catch (saveError) {
        console.warn('⚠️ Errore salvando stato QR (non critico):', saveError);
      }
      
      setSuccessMessage('QR Code generato con successo!');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('❌ Errore durante la generazione QR Code:', error);
      
      // Gestione specifica per errori di permessi
      if (error.message.includes('PERMISSION_DENIED')) {
        alert('❌ Errore permessi Firebase!\n\n🔐 Le regole del Realtime Database non permettono la scrittura.\n\n📋 Soluzione:\n1. Vai su Firebase Console\n2. Realtime Database → Rules\n3. Configura le regole per /certificates/\n\nDettagli: ' + error.message);
      } else {
        alert('❌ Errore durante la generazione del QR Code. Riprova più tardi.\n\nDettagli: ' + error.message);
      }
    }
  };

  // Funzione helper per generare ID certificato consistente
  const generateCertificateId = (batch: Batch, companyName: string) => {
    const cleanCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    // Se il QR è già generato, usa un ID fisso per mantenere lo stesso QR
    if (batch.qrCodeGenerated) {
      return `${cleanCompanyName}_${batch.batchId}_existing`;
    }
    return `${cleanCompanyName}_${batch.batchId}_${Date.now()}`;
  };

  // Funzione per generare HTML certificato (versione client)
  const generateCertificateHTMLClient = (certificateData: any) => {
    const siteUrl = window.location.origin;
    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${certificateData.companyName} - Certificato di Tracciabilità</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap">
  <meta property="og:title" content="${certificateData.companyName} - Certificato SimplyChain">
  <meta property="og:description" content="Certificato di tracciabilità blockchain prodotto da ${certificateData.companyName}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  
  <style>
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #f1f5f9;
      min-height: 100vh;
      padding: 20px;
      line-height: 1.6;
    }
    
    .certificate-container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(30, 41, 59, 0.95);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(139, 92, 246, 0.3);
      backdrop-filter: blur(10px);
      position: relative;
    }
    
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid rgba(139, 92, 246, 0.3);
      padding-bottom: 30px;
    }
    
    .company-name-box {
      background: transparent;
      padding: 20px 30px;
      border-radius: 15px;
      margin-bottom: 20px;
      border: 2px solid rgba(139, 92, 246, 0.6);
      box-shadow: none;
    }
    
    .company-name {
      font-size: 2.5rem;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: #94a3b8;
      margin-bottom: 5px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .info-item {
      background: rgba(139, 92, 246, 0.1);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(139, 92, 246, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .info-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
    }
    
    .info-label {
      font-weight: 600;
      color: #8b5cf6;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .info-value {
      color: #f1f5f9;
      font-size: 1.1rem;
      word-break: break-word;
    }
    
    .blockchain-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #06b6d4;
      text-decoration: none;
      font-weight: 500;
      padding: 10px 16px;
      background: rgba(6, 182, 212, 0.1);
      border-radius: 25px;
      border: 1px solid rgba(6, 182, 212, 0.3);
      transition: all 0.3s ease;
      margin-top: 10px;
    }
    
    .blockchain-link:hover {
      background: rgba(6, 182, 212, 0.2);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
    }
    
    .section-title {
      font-size: 1.8rem;
      font-weight: bold;
      color: #8b5cf6;
      margin-bottom: 20px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    .description-section {
      margin-top: 40px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 15px;
      padding: 25px;
    }
    
    .description-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #8b5cf6;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .description-content {
      font-size: 1.1rem;
      color: #f1f5f9;
      line-height: 1.7;
      text-align: justify;
    }
    
    .steps-section {
      margin-top: 40px;
    }
    
    .step {
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.2);
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 20px;
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .step:hover {
      transform: translateX(5px);
      box-shadow: 0 8px 25px rgba(6, 182, 212, 0.15);
    }
    
    .step-number-circle {
      position: absolute;
      top: -10px;
      left: 20px;
      background: #06b6d4;
      color: #0f172a;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }
    
    .step-header {
      font-size: 1.3rem;
      font-weight: bold;
      color: #06b6d4;
      margin-bottom: 15px;
      margin-left: 20px;
    }
    
    .step-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-left: 20px;
    }
    
    .step-detail {
      font-size: 0.95rem;
      color: #cbd5e1;
      background: rgba(15, 23, 42, 0.3);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(6, 182, 212, 0.1);
    }
    
    .step-detail strong {
      color: #06b6d4;
    }
    
    .step-description {
      margin-top: 20px;
      padding: 15px;
      background: rgba(6, 182, 212, 0.05);
      border: 1px solid rgba(6, 182, 212, 0.2);
      border-radius: 8px;
    }
    
    .step-description strong {
      color: #06b6d4;
      font-size: 1rem;
    }
    
    .step-description-content {
      margin-top: 8px;
      color: #f1f5f9;
      line-height: 1.6;
      text-align: justify;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(139, 92, 246, 0.3);
      color: #94a3b8;
    }
    
    @media (max-width: 768px) {
      .certificate-container {
        padding: 20px;
        margin: 10px;
      }
      
      .title {
        font-size: 2rem;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .step-details {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="header">
      <div class="company-name-box">
        <h1 class="company-name">${certificateData.companyName}</h1>
      </div>
      <p class="subtitle">Certificato di Tracciabilità Blockchain</p>
    </div>

    <h2 class="section-title"><span class="material-symbols-outlined">info</span> Informazioni Iscrizione</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label"><span class="material-symbols-outlined">inventory_2</span> Nome Prodotto</div>
        <div class="info-value">${certificateData.name}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label"><span class="material-symbols-outlined">calendar_month</span> Data di Origine</div>
        <div class="info-value">${certificateData.date || 'N/D'}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label"><span class="material-symbols-outlined">location_on</span> Luogo di Produzione</div>
        <div class="info-value">${certificateData.location || 'N/D'}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label"><span class="material-symbols-outlined">verified</span> Stato</div>
        <div class="info-value"><span class="material-symbols-outlined">check_circle</span> Certificato Attivo</div>
      </div>
      
      ${certificateData.imageIpfsHash && certificateData.imageIpfsHash !== "N/A" ? `
        <div class="info-item">
          <div class="info-label"><span class="material-symbols-outlined">image</span> Immagine Prodotto</div>
          <div class="info-value">
            <a href="https://musical-emerald-partridge.myfilebase.com/ipfs/${certificateData.imageIpfsHash}" 
               target="_blank" 
               class="blockchain-link">
              <span class="material-symbols-outlined">open_in_new</span> Apri Immagine
            </a>
          </div>
        </div>
      ` : ''}
      
      <div class="info-item">
        <div class="info-label"><span class="material-symbols-outlined">link</span> Verifica Blockchain</div>
        <div class="info-value">
          <a href="https://polygonscan.com/inputdatadecoder?tx=${certificateData.transactionHash}" 
             target="_blank" 
             class="blockchain-link">
            <span class="material-symbols-outlined">travel_explore</span> Verifica su Polygon
          </a>
        </div>
      </div>
    </div>

    ${certificateData.description ? `
      <div class="description-section">
        <h3 class="description-title"><span class="material-symbols-outlined">description</span> Descrizione</h3>
        <div class="description-content">${certificateData.description}</div>
      </div>
    ` : ''}

    ${certificateData.steps && certificateData.steps.length > 0 ? `
      <div class="steps-section">
        <h2 class="section-title"><span class="material-symbols-outlined">sync</span> Fasi di Lavorazione</h2>
        ${certificateData.steps.map((step, index) => `
          <div class="step">
            <div class="step-number-circle">${index + 1}</div>
            <h3 class="step-header">Step ${index + 1}</h3>
            <div class="step-details">
              <div class="step-detail">
                <strong><span class="material-symbols-outlined">inventory_2</span> Nome:</strong><br>
                ${step.eventName}
              </div>
              <div class="step-detail">
                <strong><span class="material-symbols-outlined">calendar_month</span> Data:</strong><br>
                ${step.date || 'N/D'}
              </div>
              <div class="step-detail">
                <strong><span class="material-symbols-outlined">location_on</span> Luogo:</strong><br>
                ${step.location || 'N/D'}
              </div>
              ${step.attachmentsIpfsHash && step.attachmentsIpfsHash !== "N/A" ? `
                <div class="step-detail">
                  <strong><span class="material-symbols-outlined">attachment</span> Allegati:</strong><br>
                  <a href="https://musical-emerald-partridge.myfilebase.com/ipfs/${step.attachmentsIpfsHash}" 
                     target="_blank" 
                     class="blockchain-link" 
                     style="margin-top: 5px;">
                    <span class="material-symbols-outlined">folder_open</span> Visualizza File
                  </a>
                </div>
              ` : ''}
              ${step.transactionHash ? `
                <div class="step-detail">
                  <strong><span class="material-symbols-outlined">link</span> Verifica Blockchain:</strong><br>
                  <a href="https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash}" 
                     target="_blank" 
                     class="blockchain-link"
                     style="margin-top: 5px;">
                    <span class="material-symbols-outlined">travel_explore</span> Verifica Step
                  </a>
                </div>
              ` : ''}
            </div>
            ${step.description ? `
              <div class="step-description">
                <strong><span class="material-symbols-outlined">description</span> Descrizione:</strong><br>
                <div class="step-description-content">${step.description}</div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="footer">
      <p><span class="material-symbols-outlined">link</span> Certificato generato con <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="color:#a78bfa;text-decoration:none"><strong>SimplyChain</strong></a> il ${new Date(certificateData.createdAt).toLocaleDateString('it-IT')}</p>
      <p>Servizio prodotto da <a href="https://www.stickyfactory.it/" target="_blank" rel="noopener noreferrer" style="color:#a78bfa;text-decoration:none"><strong>SFY s.r.l.</strong></a></p>
      <p><span class="material-symbols-outlined">mail</span> Contattaci: sfy.startup@gmail.com</p>
    </div>
  </div>
</body>
</html>`;
  };

  // Funzione per scaricare il file HTML
  const downloadHTMLFile = async (batch: Batch) => {
    try {
      console.log('🔥 Generando file HTML per download per batch:', batch.batchId);
      
      // Genera i dati del certificato (stesso formato del QR)
      const cleanCompanyName = currentCompanyData.companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      // Usa la funzione helper per ottenere il timestamp corretto
      const timestamp = getBatchTimestamp(batch);
      console.log('🔍 DEBUG Final timestamp for batch', batch.batchId, ':', timestamp);
      
      const certificateId = `${cleanCompanyName}_${batch.batchId}_${timestamp}`;
      
      const certificateData = {
        batchId: batch.batchId,
        name: batch.name,
        companyName: currentCompanyData.companyName,
        walletAddress: account?.address,
        date: batch.date,
        location: batch.location,
        description: batch.description,
        transactionHash: batch.transactionHash,
        imageIpfsHash: batch.imageIpfsHash,
        steps: batch.steps || [],
        createdAt: new Date().toISOString(),
        isActive: true,
        viewCount: 0
      };

      // Genera l'HTML del certificato
      const certificateHTML = generateCertificateHTMLClient(certificateData);
      
      // Crea e scarica il file
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      a.download = `${cleanName}_certificato.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ File HTML scaricato con successo');
      setSuccessMessage('File HTML scaricato con successo!');
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error('❌ Errore durante il download del file HTML:', error);
      alert('❌ Errore durante il download del file HTML. Riprova più tardi.\n\nDettagli: ' + error.message);
    }
  };

  const handleExport = async (batch: Batch, exportType: 'pdf' | 'html', bannerId: string) => {

    try {

      console.log('Iniziando export per batch:', batch.batchId, 'tipo:', exportType);

      // Per HTML, scarica il file HTML
      if (exportType === 'html') {
        await downloadHTMLFile(batch);
        return;
      }

      // Per PDF, usa l'API esistente ma senza Firebase Hosting
      const response = await fetch('/api/export-batch', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          batch,

          exportType,

          companyName: currentCompanyData.companyName

        }),

      });

      console.log('Response status:', response.status, 'ok:', response.ok);

      if (response.ok) {

        const contentType = response.headers.get('content-type');

        console.log('Content-Type:', contentType);

        // Per PDF, verifichiamo che sia un PDF
        if (exportType === 'pdf' && !contentType?.includes('pdf')) {
          console.warn('Content-Type non è PDF:', contentType);
        }

        const blob = await response.blob();

        console.log('Blob size:', blob.size, 'type:', blob.type);

        

        if (blob.size === 0) {

          throw new Error('File generato vuoto');

        }

        

        // Verifica che il blob abbia il tipo corretto

        if (exportType === 'pdf' && !blob.type.includes('pdf')) {
          console.warn('Blob type non è PDF:', blob.type);
        }

        

        // Per PDF (che è HTML), apri in nuova finestra invece di scaricare
        if (exportType === 'pdf') {
          const htmlContent = await response.text();
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
          } else {
            // Fallback: scarica il file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CERTIFICATO_TRACCIABILITA_${batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.html`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
        } else {
          // Per HTML normale, scarica il file
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `CERTIFICATO_TRACCIABILITA_${batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.${exportType}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }



        // Se è un export HTML, mostra il popup per il QR Code

        if (exportType === 'html') {

          setShowQRCodeModal(true);

        }

      } else {

        // Gestisci errore response

        const errorText = await response.text();

        console.error('Errore response:', response.status, errorText);

        throw new Error(`Errore server: ${response.status} - ${errorText}`);

      }

    } catch (error) {

      console.error('Errore durante l\'esportazione:', error);

      

      // Mostra errore all'utente

      alert(`Errore durante l'esportazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);

    }

  };



  return (

    <>

      {showFullPageLoading && (

        <FullPageLoading />

      )}



      <div className="glass-card rounded-3xl p-6 tech-shadow flex flex-col md:flex-row justify-between items-center gap-6">

        <div>

          <div className="flex items-center gap-4 flex-wrap">

            <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{currentCompanyData.companyName}</h2>

          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">

            <div className="flex flex-col md:flex-row gap-4 items-center-item">

              <span>

                <a 

                  href="/ricaricacrediti" 

                  className="credits-link"

                  style={{ color: '#ffffff', textDecoration: 'none', cursor: 'pointer' }}

                  onClick={(e) => {

                    e.preventDefault();

                    window.location.href = '/ricaricacrediti';

                  }}

                >

                  Crediti Rimanenti: <strong>{currentCompanyData.credits}</strong>

                </a>

              </span>

            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center-item">

              <span>Stato: <strong className={currentCompanyData.status === 'active' ? 'status-active-text' : 'status-inactive-text'}>

                {currentCompanyData.status === 'active' ? 'ATTIVO' : 'NON ATTIVO'}

              </strong></span>

            </div>

          </div>

        </div>

        <button onClick={() => setIsModalOpen(true)} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">+ Inizializza Nuova Iscrizione</button>

      </div>



      <div className="inscriptions-section-header">

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

          <h3 className="inscriptions-section-title">Le mie Iscrizioni su Blockchain</h3>

          <button 

            className="info-button"

            onClick={() => setShowInfoModal(true)}

            style={{

              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',

              border: 'none',

              borderRadius: '50%',

              width: '30px',

              height: '30px',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              cursor: 'pointer',

              color: 'white',

              fontSize: '16px',

              fontWeight: 'bold',

              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'

            }}

            aria-label="Informazioni"

            title="Informazioni"

          >

            i

          </button>

        </div>

        <div className="flex items-center gap-2">

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {refreshCounter > 0 && (

              <div className="refresh-counter" style={{ position: 'relative', marginBottom: '0.5rem' }}>+{refreshCounter}</div>

            )}

            <button 

              className="w-12 h-12 rounded-full flex items-center justify-center primary-gradient shadow-md hover:scale-105 transition"

              onClick={handleRefresh}

              disabled={isRefreshing || refreshCounter === 0}

              title="Clicca Refresh per aggiornare la tua lista"

            >

              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPCEtLSBSZWZyZXNoIGNpcmN1bGFyIGFycm93cyAtLT4KPHBhdGggZD0iTTMgMTJBOSA5IDAgMCAxIDEyIDNWMUwxNiA1TDEyIDlWN0E3IDcgMCAwIDAgNSAxMkgzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxIDEyQTkgOSAwIDAgMSAxMiAyMVYyM0w4IDE5TDEyIDE1VjE3QTcgNyAwIDAgMCAxOSAxMkgyMVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" alt="refresh" className="w-5 h-5 text-white" style={{width: '20px', height: '20px'}} />

            </button>

          </div>

        </div>

      </div>



      <div className="flex flex-wrap gap-4 p-4 bg-card rounded-2xl border border-border">

        <div className="flex flex-col gap-2 min-w-[200px] flex-1">

          <label className="text-sm font-medium text-foreground">Nome</label>

          <input

            type="text"

            className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:ring-2 focus:ring-primary/50"

            value={nameFilter}

            onChange={(e) => setNameFilter(e.target.value)}

          />

        </div>

        <div className="flex flex-col gap-2 min-w-[200px] flex-1">

          <label className="text-sm font-medium text-foreground">Luogo</label>

          <input

            type="text"

            className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:ring-2 focus:ring-primary/50"

            value={locationFilter}

            onChange={(e) => setLocationFilter(e.target.value)}

          />

        </div>

        <div className="flex flex-col gap-2 min-w-[200px] flex-1">

          <label className="text-sm font-medium text-foreground">Data</label>

          <input

            type="date"

            className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:ring-2 focus:ring-primary/50"

            value={dateFilter}

            onChange={(e) => setDateFilter(e.target.value)}

          />

        </div>

        <div className="flex flex-col gap-2 min-w-[200px] flex-1">

          <label className="text-sm font-medium text-foreground">Stato</label>

          <select

            className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:ring-2 focus:ring-primary/50"

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

        <div className="bg-card p-6 rounded-xl border border-border text-muted-foreground text-center"><p>Caricamento delle tue iscrizioni...</p></div>

      ) : errorBatches ? (

        <div className="bg-card p-6 rounded-xl border border-border text-muted-foreground text-center">

          <p style={{ color: 'red' }}>{errorBatches}</p>

          <button

            onClick={() => window.location.reload()}

            className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition"

            style={{ marginTop: '10px' }}

          >

            REFRESHA

          </button>

        </div>

      ) : (

        <>

          {/* Paginazione superiore */}
          {filteredBatches.length > itemsPerPage && (
            <div className="flex items-center justify-center gap-3 mb-6 p-4">
              <button
                className="px-3 py-2 rounded-md hover:scale-105 transition border-2"
                style={{ background: 'transparent', color: '#ffffff', borderColor: '#8b5cf6' }}
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                ← Precedente
              </button>
              
              <span className="text-white font-medium">
                {currentPage} di {totalPages}
              </span>
              
              <button
                className="px-3 py-2 rounded-md hover:scale-105 transition border-2"
                style={{ background: 'transparent', color: '#ffffff', borderColor: '#8b5cf6' }}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Successiva →
              </button>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {currentItems.length > 0 ? (

              currentItems.map((batch) => (

                <div key={batch.batchId} className="batch-card glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition h-full flex flex-col">

                  <div className="flex-1 flex flex-col">

                    <h3 className="batch-title">

                      <span className="batch-number">{getBatchDisplayNumber(batch.batchId)}</span> {batch.name}

                    </h3>

                    <p><strong className="label-violet">Descrizione:</strong> {batch.description ? truncateText(batch.description, window.innerWidth < 768 ? 80 : 100) : "N/D"}</p>

                    <p><strong className="label-violet">Data:</strong> {formatItalianDate(batch.date)}</p>

                    <p><strong className="label-violet">Luogo:</strong> {batch.location || "N/D"}</p>

                    <p>

                      <strong>Stato:</strong> <span className={batch.isClosed ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>

                        {batch.isClosed ? ' Chiuso' : ' Aperto'}

                      </span>

                    </p>

                    <p><strong className="label-violet">Tx Hash:</strong>

                      <a

                        href={`https://polygonscan.com/inputdatadecoder?tx=${batch.transactionHash}`}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="link-underline-hover"

                      >

                        {truncateText(batch.transactionHash, 15)}

                      </a>

                    </p>



                    {batch.imageIpfsHash && batch.imageIpfsHash !== "N/A" && (

                      <p>

                        <a

                          href="#"

                          onClick={(e) => {

                            e.preventDefault();

                            setSelectedImage(`https://musical-emerald-partridge.myfilebase.com/ipfs/${batch.imageIpfsHash}`);

                          }}

                          className="link-underline-hover"

                        >

                          Apri L'immagine

                        </a>

                      </p>

                    )}



                    <div className="mt-auto pt-4 border-t border-gray-600" style={{marginTop: '1rem'}}>

                    </div>

                  {/* Spacer element che riempie tutto lo spazio disponibile - posizionato dopo la linea */}
                  <div style={{ flex: '1' }}></div>

                  {/* Pulsanti spostati fuori dal contenuto per allineamento corretto */}
                  <div className="pt-4" style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>

                    {/* Pulsante Steps - sempre visibile */}
                    <div>
                      {batch.steps && batch.steps.length > 0 ? (
                        <button
                          className="accent-gradient text-white px-4 py-2 rounded-md hover:scale-105 transition text-sm font-medium whitespace-nowrap"
                          onClick={() => setSelectedBatchForSteps(batch)}
                        >
                          {batch.steps.length} Steps
                        </button>
                      ) : (
                        <button
                          className="accent-gradient text-white px-4 py-2 rounded-md hover:scale-105 transition disabled text-sm font-medium whitespace-nowrap"
                          disabled={true}
                        >
                          0 Steps
                        </button>
                      )}
                    </div>

                    {/* Pulsante Esporta - mostrato solo per batch chiusi */}
                    {batch.isClosed && (
                      <button
                        className="primary-gradient text-white px-4 py-2 rounded-md hover:scale-105 transition text-sm font-medium whitespace-nowrap"
                        onClick={() => {
                          setSelectedBatchForExport(batch);
                          setShowExportModal(true);
                        }}
                      >
                        Esporta
                      </button>
                    )}

                    {/* Pulsante Genera QR Code - mostrato solo per batch chiusi */}
                    {batch.isClosed && (
                      <button
                        className="text-white px-4 py-2 rounded-md hover:scale-105 transition text-sm font-medium whitespace-nowrap"
                        style={{ backgroundColor: '#6368F7' }}
                        onClick={() => {
                          setSelectedBatchForExport(batch);
                          setShowQRModal(true);
                        }}
                      >
                        QR Code
                      </button>
                    )}



                    {/* Pulsanti Aggiungi Step e Finalizza per iscrizioni aperte, lucchetto per quelle chiuse */}

                    {!batch.isClosed ? (

                      <>

                        <button

                          className="bg-emerald-500 text-white px-3 py-2 rounded-md hover:scale-105 transition"

                          onClick={() => setSelectedBatchForStep(batch)}

                        >

                          Aggiungi Step

                        </button>

                        <button

                          className="bg-amber-500 text-white px-3 py-2 rounded-md hover:scale-105 transition"

                          onClick={() => setSelectedBatchForFinalize(batch)}

                        >

                          Finalizza

                        </button>

                      </>

                    ) : (
                      <span className="material-symbols-outlined text-gray-400">lock</span>
                    )}

                  </div>

                  </div>

                </div>

              ))

            ) : (

              <div className="bg-card p-8 rounded-xl border border-border text-center text-muted-foreground">

                <p>Non hai ancora inizializzato nessuna iscrizione con questo account.</p>

                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>

                  Clicca su "Inizializza Nuova Iscrizione" per iniziare

                </p>

              </div>

            )}

          </div>



          {/* Paginazione */}

          {filteredBatches.length > itemsPerPage && (

            <div className="flex items-center justify-center gap-3 mt-6 p-4">

              <button

                className="primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition"

                onClick={handlePreviousPage}

                disabled={currentPage === 1}

              >

                &lt;

              </button>



              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (

                <button

                  key={number}

                  className={`pagination-btn ${currentPage === number ? 'is-active' : ''}`}

                  aria-current={currentPage === number ? 'page' : undefined}

                  onClick={() => paginate(number)}

                >

                  {number}

                </button>

              ))}



              <button

                className="primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition"

                onClick={handleNextPage}

                disabled={currentPage === totalPages}

              >

                &gt;

              </button>

              <span className="text-sm text-muted-foreground">

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

          onBatchUpdate={(updatedBatch) => {
            setBatches(prevBatches => 
              prevBatches.map(b => 
                b.batchId === updatedBatch.batchId ? updatedBatch : b
              )
            );
          }}

          onCreditsUpdate={(newCredits: number) => {

            setCurrentCompanyData(prev => ({ ...prev, credits: newCredits }));

          }}

          currentCompanyData={currentCompanyData}

        />

      )}



      {/* Modale per visualizzare steps */}

      {selectedBatchForSteps && (

        <StepsModal

          batch={selectedBatchForSteps}

          onClose={() => setSelectedBatchForSteps(null)}

        />

      )}



      {/* Modale informativo per QR Code */}

      {showQRModal && selectedBatchForExport && (

        <QRInfoModal

          batch={selectedBatchForExport}

          onClose={() => {

            setShowQRModal(false);

            setSelectedBatchForExport(null);

          }}

          onGenerateQR={() => {

            // Logica per generare QR Code

            handleGenerateQRCode(selectedBatchForExport);

            setShowQRModal(false);

          }}

          onExportHTML={() => {

            // Esporta HTML direttamente dal modale

            handleExport(selectedBatchForExport, 'html', 'banner1');

            setShowQRModal(false);

          }}

        />

      )}

      {/* Modale Export */}
      {showExportModal && selectedBatchForExport && (
        <ExportModal
          batch={selectedBatchForExport}
          onClose={() => {
            setShowExportModal(false);
            setSelectedBatchForExport(null);
          }}
          onExportPDF={() => {
            if (selectedBatchForExport) {
              handleExport(selectedBatchForExport, 'pdf', '');
            }
            setShowExportModal(false);
          }}
          onExportHTML={() => {
            // Genera lo stesso file HTML che viene usato per il QR
            handleExport(selectedBatchForExport, 'html', 'banner1');
            setShowExportModal(false);
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



      {/* Modale QR Code */}

      {showQRCodeModal && (

        <QRCodeOfferModal onClose={() => setShowQRCodeModal(false)} />

      )}

      {/* Modale di successo */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
          }}
        />
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
  const [fileError, setFileError] = useState<string | null>(null);

  const [txResult, setTxResult] = useState<{ status: "success" | "error"; message: string; } | null>(null);

  const [loadingMessage, setLoadingMessage] = useState("");



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setFileError("Il file supera i 5 MB. Scegli un'immagine più leggera.");
      setSelectedFile(null);
      e.currentTarget.value = '';
      return;
    }
    setFileError(null);
    setSelectedFile(file);
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

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>

        <div className="bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground" onClick={(e) => e.stopPropagation()}>

          <div className="p-4 border-b border-border">

            <h2>Aggiungi step all'iscrizione ({currentStep}/6)</h2>

          </div>

          <div className="p-4" style={{ minHeight: "350px" }}>

            {currentStep === 1 && (

              <div>

                <div className="mb-4">

                  <label>

                    Nome Evento

                    <span style={{ color: "red", fontWeight: "bold" }}> * Obbligatorio</span>

                  </label>

                  <input

                    type="text"

                    name="eventName"

                    value={formData.eventName}

                    onChange={handleInputChange}

                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"

                    maxLength={50}

                  />

                  <small className="char-counter">{formData.eventName.length} / 50</small>

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

                <div className="mb-4">

                  <label className="text-slate-200 font-medium">

                    <span className="material-symbols-outlined align-middle mr-1 text-purple-300">description</span>

                    Descrizione

                    <span style={{ color: "#9ca3af" }}> Non obbligatorio</span>

                  </label>

                  <textarea

                    name="description"

                    value={formData.description}

                    onChange={handleInputChange}

                    className="w-full p-3 rounded-lg bg-slate-900 border border-purple-500/30 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"

                    rows={4}

                    maxLength={250}

                  ></textarea>

                  <small className="char-counter">{formData.description.length} / 250</small>

                </div>

                <div style={helpTextStyle}>

                  <p>Inserisci una descrizione dello step, come una fase produttiva, logistica, amministrativa o documentale. Fornisci tutte le informazioni utili per identificarlo chiaramente all'interno del processo o della filiera a cui appartiene.</p>

                </div>

              </div>

            )}



            {currentStep === 3 && (

              <div>

                <div className="mb-4">

                  <label>

                    Luogo

                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>

                  </label>

                  <input

                    type="text"

                    name="location"

                    value={formData.location}

                    onChange={handleInputChange}

                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"

                    maxLength={50}

                  />

                  <small className="char-counter">{formData.location.length} / 50</small>

                </div>

                <div style={helpTextStyle}>

                  <p>Inserisci il luogo in cui si è svolto lo step, come una città, una regione, un'azienda agricola, uno stabilimento o un punto logistico. Serve a indicare con precisione dove è avvenuto il passaggio registrato.</p>

                </div>

              </div>

            )}



            {currentStep === 4 && (

              <div>

                <div className="mb-4">

                  <label>

                    Data

                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>

                  </label>

                  <input

                    type="date"

                    name="date"

                    value={formData.date}

                    onChange={handleInputChange}

                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"

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

                <div className="mb-4">

                  <label>

                    Immagini / Documenti

                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>

                  </label>

                  <input

                    type="file"

                    name="attachments"

                    onChange={handleFileChange}

                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"

                    accept="image/png, image/jpeg, image/webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.oasis.opendocument.text, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

                  />

                  <small style={{ marginTop: "4px" }}>

                    Formati immagini: PNG, JPG, WEBP. Max: 5 MB.<br />

                    Formati documenti: PDF, DOC, DOCX, ODT, CSV, XLS, XLSX. Max 10 MB.

                  </small>

                  {fileError && (
                    <p className="text-red-400 mt-2">{fileError}</p>
                  )}
                  {selectedFile && !fileError && (
                    <p className="text-purple-300 underline mt-2 block">File: {selectedFile.name}</p>
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

                <div className="bg-gray-800 p-4 rounded-md border border-gray-700">

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

          <div className="p-4 border-t border-border flex justify-between gap-4">

            <div>

              {currentStep > 1 && (

                <button onClick={handlePrevStep} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition secondary" disabled={isProcessing}>

                  Indietro

                </button>

              )}

            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>

              <button onClick={onClose} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition secondary" disabled={isProcessing}>

                Chiudi

              </button>

              {currentStep < 6 && (

                <button onClick={handleNextStep} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">

                  Avanti

                </button>

              )}

              {currentStep === 6 && (

                <button onClick={handleSubmit} disabled={isProcessing} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">

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

          onClose={() => {
            setTxResult(null);
            setLoadingMessage("");
            onClose();
          }}

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

  onBatchUpdate: (updatedBatch: Batch) => void;

  onCreditsUpdate: (credits: number) => void;

  currentCompanyData: any;

}> = ({ batch, onClose, onSuccess, onBatchUpdate, onCreditsUpdate, currentCompanyData }) => {

  const account = useActiveAccount();

  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const [txResult, setTxResult] = useState<{ status: "success" | "error"; message: string; } | null>(null);

  const [loadingMessage, setLoadingMessage] = useState("");

  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const [certificateUrl, setCertificateUrl] = useState<string>("");

  // Funzione per generare QR Code automaticamente
  // Funzione helper per ottenere il timestamp corretto per un batch
  const getBatchTimestamp = (batch: Batch) => {
    if (batch.qrCodeGenerated && batch.qrCodeTimestamp) {
      return batch.qrCodeTimestamp;
    } else if (batch.qrCodeGenerated && !batch.qrCodeTimestamp) {
      // Controlla se esiste un timestamp salvato in localStorage
      const savedTimestamp = localStorage.getItem(`qr_timestamp_${batch.batchId}`);
      if (savedTimestamp) {
        return parseInt(savedTimestamp);
      } else {
        // Per QR generati prima di questa modifica, usa un timestamp fisso
        const fixedTimestamp = 1757772000000 + batch.batchId;
        localStorage.setItem(`qr_timestamp_${batch.batchId}`, fixedTimestamp.toString());
        return fixedTimestamp;
      }
    } else {
      const newTimestamp = Date.now();
      localStorage.setItem(`qr_timestamp_${batch.batchId}`, newTimestamp.toString());
      return newTimestamp;
    }
  };

  const generateQRCode = async (batch: Batch) => {
    try {
      console.log('🔥 Generando QR Code automaticamente per batch:', batch.batchId);
      
      // Verifica la configurazione Firebase prima di procedere
      const { realtimeDb } = await import('../firebaseConfig');
      
      if (!realtimeDb) {
        throw new Error('Firebase Realtime Database non configurato. Controlla le variabili d\'ambiente VITE_FIREBASE_DATABASE_URL.');
      }
      
      const { ref, set } = await import('firebase/database');
      const QRCode = await import('qrcode');
      
      // Step 1: Log per QR già generato (ma permette rigenerazione)
      if (batch.qrCodeGenerated) {
        console.log('🔄 Rigenerando QR Code per batch:', batch.batchId);
      }
      
      // Step 2: Prepara i dati del certificato
      const cleanCompanyName = currentCompanyData.companyName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      // Usa la funzione helper per ottenere il timestamp corretto
      const timestamp = getBatchTimestamp(batch);
      console.log('🔍 DEBUG Final timestamp for batch', batch.batchId, ':', timestamp);
      
      const certificateId = `${cleanCompanyName}_${batch.batchId}_${timestamp}`;
      const certificateData = {
        batchId: batch.batchId,
        name: batch.name,
        companyName: currentCompanyData.companyName,
        walletAddress: account?.address,
        date: batch.date,
        location: batch.location,
        description: batch.description,
        transactionHash: batch.transactionHash,
        imageIpfsHash: batch.imageIpfsHash,
        steps: batch.steps || [],
        createdAt: new Date().toISOString(),
        isActive: true,
        viewCount: 0
      };
      
      console.log('💾 Salvando certificato nel Realtime Database...');
      
      // Step 2: Salva nel Realtime Database
      const certificateRef = ref(realtimeDb, `certificates/${certificateId}`);
      await set(certificateRef, certificateData);
      
      console.log('✅ Certificato salvato nel Realtime Database:', certificateId);
      
      // Step 3: Genera URL per il certificato
      // Usa un URL fisso per evitare problemi con window.location.origin
      const baseUrl = 'https://simplychain-kr64t1v59-sfylabs-hascs-projects.vercel.app';
      const certUrl = `${baseUrl}/api/qr-system?action=view&id=${certificateId}`;
      setCertificateUrl(certUrl);
      
      console.log('🌐 URL certificato:', certUrl);
      
      // Step 4: Genera QR Code
      const qrCodeDataUrl = await QRCode.default.toDataURL(certUrl, {
        width: 1000,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeDataUrl(qrCodeDataUrl);
      setQrCodeGenerated(true);
      
      console.log('📱 QR Code generato automaticamente per URL:', certUrl);
      
      // Step 5: Salva stato in Firestore (per compatibilità)
      try {
        await fetch('/api/qr-system?action=update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: account?.address,
            batchId: batch.batchId,
            qrCodeGenerated: true,
            qrCodeTimestamp: batch.qrCodeTimestamp || timestamp
          })
        });
        console.log('✅ Stato QR salvato in Firestore');
      } catch (saveError) {
        console.warn('⚠️ Errore salvando stato QR (non critico):', saveError);
      }
      
      return { success: true, certificateId, qrCodeDataUrl, certUrl };
      
    } catch (error) {
      console.error('❌ Errore durante la generazione automatica QR Code:', error);
      
      // Gestione specifica per errori di permessi
      if (error.message.includes('PERMISSION_DENIED')) {
        return { 
          success: false, 
          error: 'Permessi Firebase insufficienti. Controlla le regole del Realtime Database.' 
        };
      }
      
      return { success: false, error: error.message };
    }
  };

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

        // Salva il transaction hash della finalizzazione
        console.log("Transaction hash per finalizzazione:", result.transactionHash);

        // Genera automaticamente il QR Code dopo la finalizzazione (in background)
        const qrResult = await generateQRCode(batch);
        
        if (qrResult.success) {
          console.log('✅ QR Code generato automaticamente con successo');
          
          // Aggiorna lo stato del batch per mostrare che il QR è stato generato
          onBatchUpdate({ ...batch, qrCodeGenerated: true, qrCodeTimestamp: batch.qrCodeTimestamp || Date.now(), isClosed: true });
        } else {
          console.warn('⚠️ Errore nella generazione automatica del QR Code:', qrResult.error);
          
          // Chiudi comunque il batch anche se il QR non è stato generato
          onBatchUpdate({ ...batch, isClosed: true });
        }

        // Chiudi automaticamente il modale dopo la finalizzazione
        setTimeout(() => {
          onSuccess();
          setTxResult(null);
          setLoadingMessage("");
        }, 1000);



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

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>

        <div className="bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground" onClick={(e) => e.stopPropagation()}>

          <div className="p-4 border-b border-border">

            <h2>Finalizza Iscrizione</h2>

          </div>

          <div className="p-4">

            <p>Sei sicuro di voler finalizzare l'iscrizione "{batch.name}"?</p>

            <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginTop: '1rem' }}>

              ⚠️ Attenzione: Una volta finalizzata, non potrai più aggiungere step a questa iscrizione.

            </p>

            {/* Anteprima QR Code generato */}
            {qrCodeGenerated && qrCodeDataUrl && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: 'rgba(34, 197, 94, 0.1)', 
                border: '1px solid rgba(34, 197, 94, 0.3)', 
                borderRadius: '0.75rem' 
              }}>
                <h4 style={{ color: '#22c55e', marginBottom: '0.5rem', fontWeight: '600' }}>
                  ✅ QR Code Generato Automaticamente!
                </h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code generato" 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      border: '2px solid #22c55e', 
                      borderRadius: '0.5rem' 
                    }} 
                  />
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{ color: '#d1d5db', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Il QR Code è stato generato e salvato nel database. Puoi scaricarlo cliccando sul pulsante qui sotto.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = qrCodeDataUrl;
                          const cleanName = batch.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
                          a.download = `${cleanName}_qrcode.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                        style={{
                          background: '#22c55e',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        📱 Scarica QR Code
                      </button>
                      <button
                        onClick={() => window.open(certificateUrl, '_blank')}
                        style={{
                          background: 'transparent',
                          color: '#22c55e',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #22c55e',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        <span className="material-symbols-outlined mr-1 align-middle">link</span> Visualizza Certificato
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="p-4 border-t border-border flex justify-between gap-4">

            <button onClick={onClose} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition secondary" disabled={isProcessing}>

              Annulla

            </button>

            <button onClick={handleFinalize} disabled={isProcessing} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">

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

          onClose={() => {
            setTxResult(null);
            setLoadingMessage("");
            onClose();
          }}

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

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>

        <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-slate-700/50" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 p-5 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white">inventory_2</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Steps</h2>
                <p className="text-sm text-slate-400">Batch: {batch.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-5">

            {batch.steps && batch.steps.length > 0 ? (

              batch.steps.map((step, index) => (

                <div key={index} className="bg-purple-500/10 p-5 rounded-xl border border-purple-500/30 mb-4 pl-5 border-l-4">

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-purple-300 font-semibold">Step {index + 1}</h4>
                    <div className="text-sm text-slate-200"><span className="material-symbols-outlined align-middle mr-1 text-purple-300">inventory_2</span> Nome: {step.eventName}</div>
                  </div>

                  <p className="text-slate-200"><strong className="text-purple-300"><span className="material-symbols-outlined mr-1 align-middle">description</span> Descrizione:</strong> {step.description || "N/D"}</p>

                  <p className="text-slate-200"><strong className="text-purple-300"><span className="material-symbols-outlined mr-1 align-middle">calendar_month</span> Data:</strong> {formatItalianDate(step.date)}</p>

                  <p className="text-slate-200"><strong className="text-purple-300"><span className="material-symbols-outlined mr-1 align-middle">location_on</span> Luogo:</strong> {step.location || "N/D"}</p>

                  {step.attachmentsIpfsHash && step.attachmentsIpfsHash !== "N/A" && (

                    <p className="text-slate-200">

                      <strong className="text-purple-300"><span className="material-symbols-outlined mr-1 align-middle">attachment</span> Allegati:</strong>

                      <a

                        href={`https://musical-emerald-partridge.myfilebase.com/ipfs/${step.attachmentsIpfsHash}`}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="link-underline-hover"

                        style={{ marginLeft: '0.5rem' }}

                      >

                        Visualizza

                      </a>

                    </p>

                  )}

                  <p className="text-slate-200">

                    <strong className="text-purple-300"><span className="material-symbols-outlined mr-1 align-middle">travel_explore</span> Verifica su Blockchain:</strong>

                    <a

                      href={`https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash}`}

                      target="_blank"

                      rel="noopener noreferrer"

                      className="link-underline-hover"

                      style={{ marginLeft: '0.5rem' }}

                    >

                      {truncateText(step.transactionHash, 15)}

                    </a>

                  </p>

                </div>

              ))

            ) : (

              <p>Nessuno step disponibile per questa iscrizione.</p>

            )}

            <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 p-5 rounded-b-2xl flex justify-end">
              <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">Chiudi</button>
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



        // Il successo viene ora gestito dal click su OK nel modal
        // setTimeout(() => {
        //   onSuccess();
        //   setLoadingMessage("");
        // }, 1500);

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

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>

        <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full text-foreground border border-slate-700/50" onClick={(e) => e.stopPropagation()}>

          <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 p-5 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white">edit_square</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Inizializza Nuova Iscrizione</h2>
                <p className="text-sm text-slate-400">Passo {currentStep} di 6</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-5" style={{ minHeight: "350px" }}>

            {currentStep === 1 && (

              <div>

                <div className="mb-4">

                  <label className="text-slate-200 font-medium">

                    <span className="material-symbols-outlined align-middle mr-1 text-purple-300">badge</span>

                    Nome Iscrizione 

                    <span style={{ color: "#ef4444", fontWeight: "bold" }}> * Obbligatorio</span>

                  </label>

                  <input 

                    type="text" 

                    name="name" 

                    value={formData.name} 

                    onChange={handleInputChange} 

                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 

                    maxLength={50} 

                  />

                  <small className="char-counter">{formData.name.length} / 50</small>

                </div>

                <div style={helpTextStyle}>

                  <p><strong><span className="material-symbols-outlined align-middle mr-1">info</span> Come scegliere il Nome Iscrizione</strong></p>

                  <p>Il Nome Iscrizione è un'etichetta descrittiva che ti aiuta a identificare in modo chiaro ciò che stai registrando on-chain. Ad esempio:</p>

                  <ul style={{ textAlign: "left", paddingLeft: "20px" }}>

                    <li>Il nome di un prodotto o varietà: <em>Pomodori San Marzano 2025, Olio Extravergine Frantoio</em></li>

                    <li>Un lotto o una produzione: <em>Lotto Pasta Artigianale LT1025, Produzione Vino Rosso 2024</em></li>

                    <li>Un servizio o processo: <em>Trasporto Merci Roma-Milano, Certificazione Biologico 2025</em></li>

                  </ul>

                  <p style={{ marginTop: "1rem" }}><strong><span className="material-symbols-outlined align-middle mr-1">push_pin</span> Consiglio:</strong> scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente l'iscrizione anche dopo mesi o anni.</p>

                </div>

              </div>

            )}



            {currentStep === 2 && (

              <div>

                <div className="mb-4">

                  <label>

                    Descrizione

                    <span style={{ color: "#6c757d" }}> Non obbligatorio</span>

                  </label>

                  <textarea

                    name="description"

                    value={formData.description}

                    onChange={handleInputChange}

                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"

                    rows={4}

                    maxLength={250}

                  ></textarea>

                  <small className="char-counter">{formData.description.length} / 250</small>

                </div>

                <div style={helpTextStyle}>

                  <p>Inserisci una descrizione dettagliata di ciò che stai registrando. Fornisci tutte le informazioni utili per identificare chiaramente il prodotto, il servizio o il processo a cui appartiene questa iscrizione.</p>

                </div>

              </div>

            )}



            {currentStep === 3 && (

              <div>

                <div className="mb-4">

                  <label className="text-slate-200 font-medium">

                    <span className="material-symbols-outlined align-middle mr-1 text-purple-300">location_on</span>

                    Luogo di Produzione

                    <span style={{ color: "#9ca3af" }}> Non obbligatorio</span>

                  </label>

                  <input

                    type="text"

                    name="location"

                    value={formData.location}

                    onChange={handleInputChange}

                    className="w-full p-3 rounded-lg bg-slate-900 border border-purple-500/30 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"

                    maxLength={50}

                  />

                  <small className="char-counter">{formData.location.length} / 50</small>

                </div>

                <div style={helpTextStyle}>

                  <p>Inserisci il luogo di origine o produzione, come una città, una regione, un'azienda agricola o uno stabilimento. Serve a indicare con precisione dove ha avuto origine ciò che stai registrando.</p>

                </div>

              </div>

            )}



            {currentStep === 4 && (

              <div>

                <div className="mb-4">

                  <label className="text-slate-200 font-medium">

                    <span className="material-symbols-outlined align-middle mr-1 text-purple-300">calendar_month</span>

                    Data di Origine

                    <span style={{ color: "#9ca3af" }}> Non obbligatorio</span>

                  </label>

                  <input

                    type="date"

                    name="date"

                    value={formData.date}

                    onChange={handleInputChange}

                    className="w-full p-3 rounded-lg bg-slate-900 border border-purple-500/30 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"

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

                <div className="mb-4">

                  <label className="text-slate-200 font-medium">

                    <span className="material-symbols-outlined align-middle mr-1 text-purple-300">image</span>

                    Immagine Prodotto

                    <span style={{ color: "#9ca3af" }}> Non obbligatorio</span>

                  </label>

                  <input

                    type="file"

                    name="image"

                    onChange={handleFileChange}

                    className="w-full p-3 rounded-lg bg-slate-900 border border-purple-500/30 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"

                    accept="image/png, image/jpeg, image/webp"

                  />

                  <small style={{ marginTop: "4px" }}>

                    Formati supportati: PNG, JPG, WEBP. Dimensione massima: 5 MB.

                  </small>

                  {selectedFile && (

                    <p className="text-primary underline mt-2 block">File: {selectedFile.name}</p>

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

                <div className="bg-gray-800 p-4 rounded-md border border-gray-700">

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

          <div className="p-4 border-t border-border flex justify-between gap-4">

            <div>

              {currentStep > 1 && (

                <button onClick={handlePrevStep} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition secondary" disabled={isProcessing}>

                  Indietro

                </button>

              )}

            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>

              <button onClick={onClose} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition secondary" disabled={isProcessing}>

                Chiudi

              </button>

              {currentStep < 6 && (

                <button onClick={handleNextStep} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">

                  Avanti

                </button>

              )}

              {currentStep === 6 && (

                <button onClick={handleSubmit} disabled={isProcessing} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">

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

          onClose={() => {
            if (txResult?.status === "success") {
              onSuccess();
              setLoadingMessage("");
            }
          }}

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

    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>

      <div className="bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground" onClick={(e) => e.stopPropagation()}>

        <div className="p-4 border-b border-border">

          <h2>Informazioni Esportazione</h2>

        </div>

        <div className="p-4">

          <div style={{ marginBottom: '2rem' }}>

            <p>Se hai completato con successo la tua iscrizione (solo dopo la finalizzazione), potrai esportare:</p>

            <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '1rem 0' }}>

              <li>Un certificato SimplyChain in formato PDF, utile all'azienda per uso interno o documentale. Questo file può essere archiviato, stampato o condiviso con terzi per attestare l'iscrizione e l'autenticità del prodotto, senza necessariamente passare per il QR Code.</li>

              <li>Un certificato SimplyChain in formato HTML, pensato per la pubblicazione online. Caricalo su uno spazio web (privato o pubblico), copia il link e usalo per generare un QR Code da applicare all'etichetta del tuo prodotto. Inquadrando il QR Code, chiunque potrà visualizzare il certificato direttamente online.</li>

            </ul>

          </div>

          <div className="export-modal-buttons">

            <button 

              className="primary-gradient text-white px-6 py-3 rounded-xl hover:scale-105 transition"

              onClick={() => onSelectType('pdf')}

            >

              📄 Esporta PDF

            </button>

            <button 

              className="primary-gradient text-white px-6 py-3 rounded-xl hover:scale-105 transition"

              onClick={() => onSelectType('html')}

            >

              🌐 Esporta HTML

            </button>

          </div>

        </div>

        <div className="p-4 border-t border-border flex justify-between gap-4">

          <button onClick={onClose} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition secondary">

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
    // Questa funzione non dovrebbe essere qui - usa quella principale
    console.log('QR Code generation triggered from modal');
  };



  return (

    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>

      <div className="bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground" onClick={(e) => e.stopPropagation()}>

        <div className="p-4 border-b border-border">

          <h2>Crea QR Code</h2>

        </div>

        <div className="p-4">

          <p style={{ marginBottom: '2rem', textAlign: 'center' }}>

            Vuoi creare anche un QrCode da usare per l'etichetta del tuo prodotto?

          </p>

        </div>

        <div className="p-4 border-t border-border flex justify-between gap-4">

          <button onClick={onClose} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition secondary">

            No Grazie

          </button>

          <button onClick={handleGenerateQRCode} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">

            Genera QrCode

          </button>

        </div>

      </div>

    </div>

  );

};



// Componente modale info con slide

const InfoModal: React.FC<{

  onClose: () => void;

}> = ({ onClose }) => {

  const [currentSlide, setCurrentSlide] = useState(0);

  const [isAnimating, setIsAnimating] = useState(false);



  const slides = [

    {

      title: "Come Funziona SimplyChain",

      icon: "🚀",

      content: (

        <div>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>

            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>

              <h5 style={{ color: '#6366f1', margin: '0 0 0.5rem 0', fontWeight: '600' }}>🔷 Inizializza Nuova Iscrizione</h5>

              <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.9rem' }}>Crea una nuova iscrizione con i dati base del prodotto</p>

            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>

              <h5 style={{ color: '#10b981', margin: '0 0 0.5rem 0', fontWeight: '600' }}>📋 Aggiungi Steps</h5>

              <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.9rem' }}>Registra ogni fase della filiera produttiva</p>

            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>

              <h5 style={{ color: '#f59e0b', margin: '0 0 0.5rem 0', fontWeight: '600' }}>🔒 Finalizza</h5>

              <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.9rem' }}>Chiudi l'iscrizione quando completata</p>

            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>

              <h5 style={{ color: '#8b5cf6', margin: '0 0 0.5rem 0', fontWeight: '600' }}>📄 Esporta</h5>

              <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.9rem' }}>Genera certificati PDF o HTML per i tuoi clienti</p>

            </div>

            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>

              <h5 style={{ color: '#6366f1', margin: '0 0 0.5rem 0', fontWeight: '600' }}>📱 QR Code per Certificati</h5>

              <p style={{ margin: 0, color: '#e5e7eb', fontSize: '0.9rem' }}>Genera un QR Code che riporta al tuo certificato online.</p>

            </div>

          </div>

        </div>

      )

    },

    {

      title: "Stati delle Iscrizioni",

      icon: "📊",

      content: (

        <div>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>

              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✅</div>

              <div>

                <h5 style={{ color: '#10b981', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Aperto</h5>

                <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.9rem' }}>Puoi aggiungere nuovi step alla tua iscrizione</p>

              </div>

            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>

              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔒</div>

              <div>

                <h5 style={{ color: '#ef4444', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Chiuso</h5>

                <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.9rem' }}>Finalizzato, pronto per l'esportazione</p>

              </div>

            </div>

          </div>

        </div>

      )

    },

    {

      title: "Sistema Crediti",

      icon: "💰",

      content: (

        <div>

          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '1rem' }}>

            <h5 style={{ color: '#6366f1', margin: '0 0 1rem 0', fontWeight: '600', fontSize: '1.1rem' }}>💎 Crediti Gratuiti</h5>

            <p style={{ margin: '0 0 0.5rem 0', color: '#d1d5db' }}>Dopo l'attivazione del tuo account avrai crediti gratuiti per iniziare.</p>

            <p style={{ margin: '0 0 1rem 0', color: '#d1d5db' }}>Ogni operazione consuma <strong style={{ color: '#ffffff' }}>1 credito</strong>:</p>

            <ul style={{ paddingLeft: '1.5rem', color: '#d1d5db', margin: 0 }}>

              <li>Nuova iscrizione</li>

              <li>Aggiunta step</li>

              <li>Finalizzazione</li>

            </ul>

          </div>

          <div style={{ textAlign: 'center', background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>

            <p style={{ margin: '0 0 1rem 0', color: '#d1d5db' }}>Hai bisogno di più crediti?</p>

            <a href="/ricaricacrediti" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>

              Vai alla Ricarica Crediti →

            </a>

          </div>

        </div>

      )

    },

    // Rimosso slide QR; info spostata nella prima pagina

  ];



  const nextSlide = () => {

    if (isAnimating) return;
    if (currentSlide >= slides.length - 1) return; // disabilita oltre l'ultima pagina

    setIsAnimating(true);

    setTimeout(() => {

      setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));

      setIsAnimating(false);

    }, 150);

  };



  const prevSlide = () => {

    if (isAnimating) return;
    if (currentSlide <= 0) return; // disabilita prima della prima pagina

    setIsAnimating(true);

    setTimeout(() => {

      setCurrentSlide((prev) => Math.max(prev - 1, 0));

      setIsAnimating(false);

    }, 150);

  };



  return (

    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>

      <div className="bg-card p-6 rounded-2xl border border-border max-w-3xl w-full text-foreground" onClick={(e) => e.stopPropagation()}>

        <div className="p-4 border-b border-border" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <h2 style={{ margin: 0 }}>

            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{slides[currentSlide].icon}</span>

            {slides[currentSlide].title}

          </h2>

          <div style={{ display: 'flex', gap: '0.5rem' }}>

            {slides.map((_, index) => (

              <div

                key={index}

                style={{

                  width: '8px',

                  height: '8px',

                  borderRadius: '50%',

                  background: index === currentSlide ? '#6366f1' : 'rgba(255, 255, 255, 0.3)',

                  cursor: 'pointer',

                  transition: 'all 0.3s ease'

                }}

                onClick={() => setCurrentSlide(index)}

              />

            ))}

          </div>

        </div>

        <div className="p-4" style={{ minHeight: '300px' }}>

          <div style={{ 

            opacity: isAnimating ? 0.5 : 1, 

            transition: 'opacity 0.15s ease',

            transform: isAnimating ? 'translateY(10px)' : 'translateY(0)',

          }}>

            {slides[currentSlide].content}

          </div>

        </div>

        <div className="p-4 border-t border-border" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <div style={{ display: 'flex', gap: '0.5rem' }}>

            <button 

              onClick={prevSlide} 

              disabled={isAnimating || currentSlide === 0}

              style={{ 

                background: 'rgba(255, 255, 255, 0.1)', 

                border: '1px solid rgba(255, 255, 255, 0.2)', 

                color: '#ffffff', 

                padding: '0.5rem 1rem', 

                borderRadius: '0.5rem', 

                cursor: 'pointer',

                transition: 'all 0.3s ease',

                opacity: (isAnimating || currentSlide === 0) ? 0.5 : 1

              }}

            >

              ← Indietro

            </button>

            <button 

              onClick={nextSlide} 

              disabled={isAnimating || currentSlide === slides.length - 1}

              style={{ 

                background: 'rgba(255, 255, 255, 0.1)', 

                border: '1px solid rgba(255, 255, 255, 0.2)', 

                color: '#ffffff', 

                padding: '0.5rem 1rem', 

                borderRadius: '0.5rem', 

                cursor: 'pointer',

                transition: 'all 0.3s ease',

                opacity: (isAnimating || currentSlide === slides.length - 1) ? 0.5 : 1

              }}

            >

              Avanti →

            </button>

          </div>

          <button onClick={onClose} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">

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

  const navigate = useNavigate();



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



  // Effect per gestire il disconnect e reindirizzare alla homepage
  // Solo dopo che il sistema ha avuto tempo di caricare l'account
  const [accountCheckDelay, setAccountCheckDelay] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Dai tempo al sistema di caricare l'account dopo F5
    const timer = setTimeout(() => {
      setAccountCheckDelay(false);
    }, 2000); // 2 secondi di delay per essere più sicuri

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Solo reindirizza se non c'è account E abbiamo aspettato il caricamento
    // E non siamo già sulla home page
    if (!account && !accountCheckDelay && window.location.pathname !== '/') {
      console.log('🔄 Reindirizzamento alla home per mancanza account');
      navigate('/');
      return;
    }
    
    // Resetta il loading quando l'account viene caricato
    if (account) {
      setIsConnecting(false);
    }
  }, [account, navigate, accountCheckDelay]);

  // Gestisce il tasto indietro del browser
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Se l'utente va indietro e non c'è account, reindirizza alla home
      if (!account && window.location.pathname !== '/') {
        console.log('🔄 Tasto indietro: reindirizzamento alla home');
        navigate('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [account, navigate]);



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
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Verifica stato account in corso...</p>
        </div>
      );
    }

    if (companyStatus.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
            <div className="text-red-400 text-2xl mb-2">⚠️</div>
            <p className="text-red-300">{companyStatus.error}</p>
          </div>
        </div>
      );
    }

    if (companyStatus.isActive && companyStatus.data) {
      return <Dashboard companyData={companyStatus.data} />;
    }

    if (account) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 max-w-md">
            <div className="text-amber-400 text-2xl mb-2">🔒</div>
            <p className="text-amber-300 text-lg">Account non attivato</p>
            <p className="text-slate-400 text-sm mt-2">Contatta l'amministratore per attivare il tuo account</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 max-w-md">
          <div className="text-slate-400 text-2xl mb-2">🔗</div>
          <p className="text-slate-300 text-lg">Connetti il wallet per continuare</p>
          <p className="text-slate-400 text-sm mt-2">Usa il pulsante in alto a destra per connettere il tuo wallet</p>
        </div>
      </div>
    );
  };



  if (!account) {

    return (

      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">

        <AziendaPageStyles />

        <div style={{ textAlign: "center" }}>

          <h1>Accesso non autorizzato</h1>

          <p>Devi accedere dalla homepage per utilizzare questa sezione.</p>

          <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Torna alla Homepage</a>

        </div>

      </div>

    );

  }



  return (

    <>

      <AziendaPageStyles />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap" />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        
        {/* Header moderno con glassmorphism */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              
              {/* Logo e titolo */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-white">SimplyChain</h1>
                    <p className="text-sm text-slate-400 hidden sm:block">Area Privata</p>
                  </div>
                </div>
              </div>

              {/* Connect Button */}
              <div className="flex items-center space-x-4">
                <ConnectButton 
                  client={client}
                  wallets={wallets}
                  chain={polygon}
                  accountAbstraction={{ chain: polygon, sponsorGas: true }}
                  onConnect={() => {
                    setIsConnecting(true);
                  }}
                  onDisconnect={() => {
                    setIsConnecting(false);
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Overlay di loading per la connessione */}
        {isConnecting && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-slate-700/50">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-purple-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connessione in corso...</h3>
              <p className="text-slate-400">Stai per accedere all'area privata</p>
              <div className="mt-4 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Contenuto principale */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <Footer />

      </div>

    </>

  );

};

// Componente Modale Informativo per QR Code
const QRInfoModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  onGenerateQR: () => void;
  onExportHTML: () => void;
}> = ({ batch, onClose, onGenerateQR, onExportHTML }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8 12h8v8h-8v-8zm2-6h4v4h-4v-4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8-8v2h2V3h-2zm0 8v2h2v-2h-2zm8 0v2h2v-2h-2zM7 7h2v2H7V7zm0 8h2v2H7v-2zm8-8h2v2h-2V7zm0 8h2v2h-2v-2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Generazione QR Code</h2>
                <p className="text-sm text-slate-400">Batch: {batch.name}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-400 text-xl">💡</div>
              <div>
                <h3 className="text-blue-300 font-semibold mb-2">Come funziona</h3>
                <p className="text-slate-300 text-sm">
                  Crea un QR Code delle tue iscrizioni finalizzate per stamparlo sulle etichette del tuo prodotto.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-green-400 text-lg">✅</div>
              <div>
                <h4 className="text-white font-medium mb-1">Validità</h4>
                <p className="text-slate-400 text-sm">
                  Il link sarà valido secondo i{' '}
                  <a 
                    href="/termini-condizioni" 
                    target="_blank" 
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Termini e condizioni
                  </a>
                </p>
              </div>
            </div>

          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="text-amber-400 text-xl">⚠️</div>
              <div>
                <h3 className="text-amber-300 font-semibold mb-2">Importante</h3>
                <p className="text-slate-300 text-sm">
                  Se il sito dovesse essere dismesso o i dati venissero cancellati, 
                  i QR Code potrebbero non funzionare più. SimplyChain non potrà essere ritenuta responsabile.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="text-cyan-400 text-lg">💾</div>
              <div>
                <h4 className="text-white font-medium mb-1">Alternativa</h4>
                <p className="text-slate-400 text-sm mb-3">
                  Scarica il file HTML e ospitalo su uno spazio personale per il controllo completo.
                </p>
                <button 
                  onClick={onExportHTML}
                  className="inline-flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <span>📄</span>
                  <span>Esporta HTML</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
            >
              Chiudi
            </button>
            <button
              onClick={onGenerateQR}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all font-medium shadow-lg hover:shadow-purple-500/25"
            >
              Genera QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Modale di Successo
const SuccessModal: React.FC<{
  message: string;
  onClose: () => void;
}> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">{message}</h2>
          
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg transition-all font-medium shadow-lg hover:shadow-green-500/25"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Modale Export
const ExportModal: React.FC<{
  batch: Batch;
  onClose: () => void;
  onExportPDF: () => void;
  onExportHTML: () => void;
}> = ({ batch, onClose, onExportPDF, onExportHTML }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Informazioni Esportazione</h2>
                <p className="text-sm text-slate-400">Batch: {batch.name}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
            <div className="text-green-400 text-3xl mb-3"><span className="material-symbols-outlined">celebration</span></div>
            <h3 className="text-green-300 font-semibold text-lg mb-2">Iscrizione Finalizzata.</h3>
            <p className="text-slate-300">
              Hai chiuso con successo la tua iscrizione. Adesso potrai esportare:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* PDF Card */}
            <div className="bg-slate-700/50 border border-slate-600/30 rounded-xl p-6 hover:bg-slate-700/70 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400 text-xl">picture_as_pdf</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Certificato PDF</h3>
                  <p className="text-slate-400 text-sm">Formato documentale</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Utile per uso interno o documentale. Può essere archiviato, stampato o condiviso 
                con terzi per attestare l'iscrizione e l'autenticità del prodotto.
              </p>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span>Stampa e archiviazione</span>
              </div>
            </div>
            
            {/* HTML Card */}
            <div className="bg-slate-700/50 border border-slate-600/30 rounded-xl p-6 hover:bg-slate-700/70 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-400 text-xl">language</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Certificato HTML</h3>
                  <p className="text-slate-400 text-sm">Pubblicazione online</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Pensato per la pubblicazione online. Caricalo su uno spazio privato per avere 
                il controllo completo del processo di creazione del QR Code.
              </p>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Controllo totale</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-400 text-xl">💡</div>
              <div>
                <h4 className="text-blue-300 font-semibold mb-1">Suggerimento</h4>
                <p className="text-slate-300 text-sm">
                  Entrambi i formati contengono le stesse informazioni di tracciabilità. 
                  Scegli quello più adatto alle tue esigenze.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
            >
              Chiudi
            </button>
            <button
              onClick={onExportPDF}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg transition-all font-medium shadow-lg hover:shadow-red-500/25"
            >
              <span className="material-symbols-outlined mr-2">picture_as_pdf</span> Genera PDF
            </button>
            <button
              onClick={onExportHTML}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg transition-all font-medium shadow-lg hover:shadow-green-500/25"
            >
              <span className="material-symbols-outlined mr-2">language</span> Genera HTML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AziendaPage;