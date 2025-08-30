// FILE: src/pages/AziendaPage.tsx
// DESCRIZIONE: Versione aggiornata che si basa ESCLUSIVAMENTE sui dati della blockchain,
// rimuovendo la dipendenza dal caching su Firebase.

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
        .min-h-screen.bg-background.px-6.py-6.container.mx-auto { 
            padding: 1rem; 
            min-height: 100vh;
            background-color: #0f0f0f;
        }

        .flex.flex-col.md:flex-row.items-center.justify-between.gap-4.bg-card\/60.p-6.rounded-2xl.border.border-border { 
            display: flex; 
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background-color: #1a1a1a;
            border-radius: 0.75rem;
            border: 1px solid #333;
        }

        .text-2xl.md:text-3xl.font-bold.text-foreground { 
            font-size: 1.5rem; 
            font-weight: bold; 
            color: #ffffff;
            text-align: center;
        }

        .flex.flex-col.items-center.justify-center.min-h-\[60vh\].text-center.p-6 { 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            min-height: 80vh; 
            text-align: center;
            padding: 1rem;
        }

        .glass-card.rounded-3xl.p-6.tech-shadow.flex.flex-col.md:flex-row.justify-between.items-center.gap-6 { 
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

        .flex.items-center.gap-4.flex-wrap {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .text-2xl.md:text-3xl.font-extrabold.bg-gradient-to-r.from-primary.to-accent.bg-clip-text.text-transparent { 
            font-size: 1.5rem; 
            font-weight: 700;
            color: #ffffff;
            margin: 0;
        }

        .flex.flex-col.md:flex-row.gap-4.items-center {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .flex.flex-col.md:flex-row.gap-4.items-center-item {
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

        .flex.items-center.gap-2 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .w-12.h-12.rounded-full.flex.items-center.justify-center.primary-gradient.shadow-md.hover\:scale-105.transition {
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

        .w-12.h-12.rounded-full.flex.items-center.justify-center.primary-gradient.shadow-md.hover\:scale-105.transition:hover {
            background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .w-12.h-12.rounded-full.flex.items-center.justify-center.primary-gradient.shadow-md.hover\:scale-105.transition:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .w-5.h-5.text-white {
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

        .primary-gradient.text-white.px-4.py-2.rounded-2xl.font-semibold.hover\:scale-105.transition { 
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

        .primary-gradient.text-white.px-4.py-2.rounded-2xl.font-semibold.hover\:scale-105.transition:hover { 
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .primary-gradient.text-white.px-4.py-2.rounded-2xl.font-semibold.hover\:scale-105.transition.secondary {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
        }

        .primary-gradient.text-white.px-4.py-2.rounded-2xl.font-semibold.hover\:scale-105.transition.secondary:hover {
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
            box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
        }

        .grid.gap-6.md\:grid-cols-2.lg\:grid-cols-3 { 
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition { 
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border-radius: 1rem; 
            padding: 1.5rem; 
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            border: 1px solid #333;
            transition: all 0.3s ease;
            position: relative;
        }

        .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
            border-color: #3b82f6;
        }

        .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition.h3 { 
            font-size: 1.1rem; 
            font-weight: 600; 
            color: #ffffff; 
            margin: 0 0 1rem 0;
            border-bottom: 1px solid #333; 
            padding-bottom: 0.75rem;
            word-wrap: break-word; 
        }

        .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition.p { 
            margin: 0.75rem 0; 
            color: #a0a0a0; 
            font-size: 0.85rem; 
            line-height: 1.5;
            word-wrap: break-word; 
        }

        .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition.strong { 
            color: #ffffff; 
            font-weight: 600;
        }

        .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition.a { 
            color: #60a5fa; 
            text-decoration: none; 
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition.a:hover {
            color: #3b82f6;
        }

        .flex.justify-between.items-center.mt-4 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #333;
        }

        .text-sm.text-muted-foreground {
            font-size: 0.8rem;
            color: #a0a0a0;
        }

        .text-green-500.font-semibold {
            color: #10b981;
            font-weight: 600;
        }

        .text-red-500.font-semibold {
            color: #ef4444;
            font-weight: 600;
        }

        .bg-emerald-500.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .bg-emerald-500.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            transform: translateY(-1px);
        }

        .primary-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition {
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

        .primary-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            transform: translateY(-1px);
        }

        .primary-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition:disabled {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            cursor: not-allowed;
            opacity: 0.6;
        }

        .accent-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .accent-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition:hover {
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            transform: translateY(-1px);
        }

        .accent-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition.disabled {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            cursor: not-allowed;
            opacity: 0.6;
        }

        .accent-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition.disabled:hover {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            transform: none;
        }

        .absolute.bottom-full.left-1\/2.transform.-translate-x-1\/2.bg-gray-800.text-white.text-sm.py-1.px-2.rounded {
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

        .absolute.bottom-full.left-1\/2.transform.-translate-x-1\/2.bg-gray-800.text-white.text-sm.py-1.px-2.rounded::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #1f2937;
        }

        .primary-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition:hover .absolute.bottom-full.left-1\/2.transform.-translate-x-1\/2.bg-gray-800.text-white.text-sm.py-1.px-2.rounded {
            opacity: 1;
        }

        .fixed.inset-0.bg-black\/70.flex.items-center.justify-center.z-50.p-4 {
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

        .bg-card.p-4.rounded-2xl.border.border-border.max-w-3xl.w-full.max-h-\[80vh\].overflow-auto.text-foreground {
            background-color: #1a1a1a;
            border-radius: 1rem;
            border: 1px solid #333;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            color: #ffffff;
        }

        .steps-p-4.border-b.border-border {
            padding: 1.5rem;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .steps-p-4 {
            padding: 1.5rem;
        }

        .bg-gray-800.p-4.rounded-xl.border.border-gray-700.mb-4 {
            background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border: 1px solid #444;
        }

        .bg-gray-800.p-4.rounded-xl.border.border-gray-700.mb-4.h4 {
            color: #3b82f6;
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
        }

        .bg-gray-800.p-4.rounded-xl.border.border-gray-700.mb-4.p {
            margin: 0.5rem 0;
            color: #a0a0a0;
            word-break: break-word;
        }

        .bg-gray-800.p-4.rounded-xl.border.border-gray-700.mb-4.strong {
            color: #ffffff;
        }

        .export-modal-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }

        .primary-gradient.text-white.px-6.py-3.rounded-xl.hover\:scale-105.transition {
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

        .primary-gradient.text-white.px-6.py-3.rounded-xl.hover\:scale-105.transition:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            transform: translateY(-2px);
        }

        .bg-amber-500.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .bg-amber-500.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition:hover {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            transform: translateY(-1px);
        }

        .text-gray-400 {
            color: #6b7280;
            font-size: 1.2rem;
        }

        .bg-card.p-6.rounded-xl.border.border-border.text-muted-foreground.text-center { 
            text-align: center; 
            padding: 2rem 1rem; 
            background-color: #1a1a1a; 
            border-radius: 1rem;
            border: 1px solid #333;
            color: #a0a0a0;
        }

        .mt-4.border-t.border-border.pt-4 { 
            margin-top: 1rem; 
            border-top: 1px solid #333; 
            padding-top: 1rem; 
        }

        .mt-4.border-t.border-border.pt-4.h4 { 
            margin: 0 0 0.75rem 0; 
            font-size: 0.9rem; 
            font-weight: 600;
            color: #ffffff;
        }

        .pl-3.border-l-4.border-primary\/60.bg-primary\/5.rounded-r-md.mb-3.p-3.text-sm.text-muted-foreground { 
            font-size: 0.8rem; 
            padding: 0.75rem 0 0.75rem 1rem;
            border-left: 2px solid #3b82f6; 
            margin-bottom: 0.75rem;
            background-color: rgba(59, 130, 246, 0.05);
            border-radius: 0 0.5rem 0.5rem 0;
        }

        .pl-3.border-l-4.border-primary\/60.bg-primary\/5.rounded-r-md.mb-3.p-3.text-sm.text-muted-foreground.p {
            margin: 0.25rem 0;
            color: #a0a0a0;
        }

        .bg-card.p-8.rounded-xl.border.border-border.text-center.text-muted-foreground {
            text-align: center;
            padding: 3rem 1rem;
            color: #a0a0a0;
            background-color: #1a1a1a;
            border-radius: 1rem;
            border: 1px solid #333;
        }

        /* Modal styles */
        .fixed.inset-0.bg-black\/70.flex.items-center.justify-center.z-50.p-4 {
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

        .bg-card.p-6.rounded-2xl.border.border-border.max-w-2xl.w-full.text-foreground {
            background-color: #1a1a1a;
            border-radius: 1rem;
            border: 1px solid #333;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            color: #ffffff;
        }

        .p-4.border-b.border-border {
            padding: 1.5rem;
            border-bottom: 1px solid #333;
        }

        .p-4.border-b.border-border.h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
        }

        .p-4 {
            padding: 1.5rem;
        }

        .p-4.border-t.border-border.flex.justify-between.gap-4 {
            padding: 1.5rem;
            border-top: 1px solid #333;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
        }

        .mb-4 {
            margin-bottom: 1rem;
        }

        .mb-4.label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #f8f9fa;
        }

        .w-full.p-3.rounded-lg.bg-gray-800.border.border-gray-700.text-foreground.focus\:outline-none.focus\:ring-2.focus\:ring-primary\/50 {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #495057;
            border-radius: 0.5rem;
            background-color: #212529;
            color: #f8f9fa;
            font-size: 0.9rem;
        }

        .w-full.p-3.rounded-lg.bg-gray-800.border.border-gray-700.text-foreground.focus\:outline-none.focus\:ring-2.focus\:ring-primary\/50:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }

        .char-counter {
            font-size: 0.75rem;
            color: #6c757d;
            margin-top: 0.25rem;
        }

        .bg-gray-800.p-4.rounded-md.border.border-gray-700 {
            text-align: left;
            padding: 1rem;
            background-color: #2a2a2a;
            border: 1px solid #444;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        }

        .bg-gray-800.p-4.rounded-md.border.border-gray-700.p {
            margin: 0.5rem 0;
            word-break: break-word;
        }

        .bg-gray-800.p-4.rounded-md.border.border-gray-700.p.strong {
            color: #f8f9fa;
        }

        .text-primary.underline.mt-2.block {
            color: #3b82f6;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }

        /* Image modal styles */
        .image-fixed.inset-0.bg-black\/70.flex.items-center.justify-center.z-50.p-4 {
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

        .image-bg-card.p-6.rounded-2xl.border.border-border.max-w-2xl.w-full.text-foreground {
            max-width: 90%;
            max-height: 90%;
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .image-bg-card.p-6.rounded-2xl.border.border-border.max-w-2xl.w-full.text-foreground.img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .absolute.top-4.right-4.bg-black\/60.text-white.rounded-full.w-10.h-10.flex.items-center.justify-center {
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
        .flex.flex-wrap.gap-4.p-4.bg-card.rounded-2xl.border.border-border {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background-color: #1a1a1a;
            border-radius: 0.75rem;
            border: 1px solid #333;
        }

        .flex.flex-col.gap-2.min-w-\[200px\].flex-1 {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            min-width: 200px;
            flex: 1;
        }

        .text-sm.font-medium.text-foreground {
            font-size: 0.9rem;
            font-weight: 500;
            color: #ffffff;
        }

        .p-3.rounded-lg.bg-gray-800.border.border-gray-700.text-foreground.focus\:ring-2.focus\:ring-primary\/50 {
            padding: 0.75rem;
            border: 1px solid #333;
            border-radius: 0.5rem;
            background-color: #2a2a2a;
            color: #ffffff;
            font-size: 0.9rem;
        }

        .p-3.rounded-lg.bg-gray-800.border.border-gray-700.text-foreground.focus\:ring-2.focus\:ring-primary\/50:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }

        /* Paginazione */
        .flex.items-center.justify-center.gap-3.mt-6.p-4 {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-top: 2rem;
            padding: 1rem;
        }

        .primary-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .primary-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition:hover:not(:disabled) {
            background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
            transform: translateY(-1px);
        }

        .primary-gradient.text-white.px-3.py-2.rounded-md.hover\:scale-105.transition:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .bg-transparent.text-foreground.border.border-border.px-3.py-2.rounded-md.hover\:bg-card {
            background-color: transparent;
            color: #ffffff;
            border: 1px solid #333;
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .bg-transparent.text-foreground.border.border-border.px-3.py-2.rounded-md.hover\:bg-card:hover {
            background-color: #333;
        }

        .bg-transparent.text-foreground.border.border-border.px-3.py-2.rounded-md.hover\:bg-card.active {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: white;
            border-color: #6366f1;
        }

        .text-sm.text-muted-foreground {
            color: #a0a0a0;
            font-size: 0.9rem;
            margin: 0 1rem;
        }

        /* Tablet styles */
        @media (min-width: 768px) {
            .min-h-screen.bg-background.px-6.py-6.container.mx-auto { 
                padding: 2rem; 
            }

            .flex.flex-col.md\:flex-row.items-center.justify-between.gap-4.bg-card\/60.p-6.rounded-2xl.border.border-border { 
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
            }

            .text-2xl.md\:text-3xl.font-bold.text-foreground { 
                font-size: 1.75rem;
                text-align: left;
            }

            .glass-card.rounded-3xl.p-6.tech-shadow.flex.flex-col.md\:flex-row.justify-between.items-center.gap-6 { 
                flex-direction: row;
                justify-content: space-between;
                align-items: flex-start;
                padding: 2rem;
            }

            .text-2xl.md\:text-3xl.font-extrabold.bg-gradient-to-r.from-primary.to-accent.bg-clip-text.text-transparent { 
                font-size: 1.75rem;
            }

            .flex.flex-col.md\:flex-row.gap-4.items-center {
                flex-direction: row;
                gap: 2rem;
            }

            .primary-gradient.text-white.px-4.py-2.rounded-2xl.font-semibold.hover\:scale-105.transition {
                width: auto;
                min-width: 200px;
            }

            .grid.gap-6.md\:grid-cols-2.lg\:grid-cols-3 { 
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
            }

            .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition.h3 { 
                font-size: 1.25rem;
            }

            .bg-card.p-6.rounded-xl.border.border-border.text-muted-foreground.text-center { 
                padding: 3rem; 
            }
        }

        /* Desktop styles */
        @media (min-width: 1024px) {
            .min-h-screen.bg-background.px-6.py-6.container.mx-auto { 
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }

            .grid.gap-6.md\:grid-cols-2.lg\:grid-cols-3 { 
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2rem;
            }

            .glass-card.rounded-2xl.p-6.tech-shadow.hover\:shadow-lg.transition { 
                padding: 2rem; 
            }

            .glass-card.rounded-3xl.p-6.tech-shadow.flex.flex-col.md\:flex-row.justify-between.items-center.gap-6 { 
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

// Configura Polygon con RPC Thirdweb
const polygonWithRPC = {
    ...polygon,
    rpc: `https://137.rpc.thirdweb.com/023dd6504a82409b2bc7cb971fd35b16`,
};

const contract = getContract({
    client, chain: polygonWithRPC,
    address: "0x0c5e6204e80e6fb3c0c7098c4fa84b2210358d0b",
    abi,
});

// Componente modale per visualizzare immagini
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
    return (
        <div className="image-fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="image-bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground" onClick={(e) => e.stopPropagation()}>
                <img src={imageUrl} alt="Immagine iscrizione" />
            </div>
            <button className="absolute top-4 right-4 bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center" onClick={onClose}>×</button>
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

                // 2. Aggiorna i dati locali
                setCurrentCompanyData(prev => ({
                    ...prev,
                    credits: creditsNumber
                }));
            }

            // 3. Ricarica le iscrizioni
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
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifycontent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        ℹ️
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="w-12 h-12 rounded-full flex items-center justify-center primary-gradient shadow-md hover:scale-105 transition"
                        onClick={handleRefresh}
                        disabled={isRefreshing || refreshCounter === 0}
                    >
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPCEtLSBSZWZyZXNoIGNpcmN1bGFyIGFycm93cyAtLT4KPHBhdGggZD0iTTMgMTJBOSA5IDAgMCAxIDEyIDNWMUwxNiA1TDEyIDlWN0E3IDcgMCAwIDAgNSAxMkgzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxIDEyQTkgOSAwIDAgMSAxMiAyMVYyM0w4IDE5TDEyIDE1VjE3QTcgNyAwIDAgMCAxOSAxMkgyMVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" alt="refresh" className="w-5 h-5 text-white" style={{ width: '20px', height: '20px' }} />
                        {refreshCounter > 0 && (
                            <div className="refresh-counter">+{refreshCounter}</div>
                        )}
                    </button>
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
                <div className="bg-card p-6 rounded-xl border border-border text-muted-foreground text-center"><p style={{ color: 'red' }}>{errorBatches}</p></div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {currentItems.length > 0 ? (
                            currentItems.map((batch) => (
                                <div key={batch.batchId} className="glass-card rounded-2xl p-6 tech-shadow hover:shadow-lg transition">
                                    <h3>#{getBatchDisplayNumber(batch.batchId)} - {batch.name}</h3>
                                    <p><strong>Descrizione:</strong> {batch.description ? truncateText(batch.description, window.innerWidth < 768 ? 80 : 100) : "N/D"}</p>
                                    <p><strong>Data:</strong> {formatItalianDate(batch.date)}</p>
                                    <p><strong>Luogo:</strong> {batch.location || "N/D"}</p>
                                    <p><strong>Stato:</strong> <span className={batch.isClosed ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>
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

                                    <div className="flex justify-between items-center mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            {batch.steps && batch.steps.length > 0 ? (
                                                <button
                                                    className="accent-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition"
                                                    onClick={() => setSelectedBatchForSteps(batch)}
                                                >
                                                    {batch.steps.length} steps
                                                </button>
                                            ) : (
                                                <button
                                                    className="accent-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition disabled"
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
                                                    className="primary-gradient text-white px-3 py-2 rounded-md hover:scale-105 transition"
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
                                                <span className="text-gray-400">🔒</span>
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
                                    className={`bg-transparent text-foreground border border-border px-3 py-2 rounded-md hover:bg-card ${currentPage === number ? 'active' : ''}`}
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

            {/* Modale QR Code */}
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
                                    {selectedFile && (
                                        <p className="text-primary underline mt-2 block">File: {selectedFile.name}</p>
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
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-card p-4 rounded-2xl border border-border max-w-3xl w-full max-h-[80vh] overflow-auto text-foreground" onClick={(e) => e.stopPropagation()}>
                    <div className="steps-p-4 border-b border-border">
                        <h2>Steps - {batch.name}</h2>
                    </div>
                    <div className="steps-p-4">
                        {batch.steps && batch.steps.length > 0 ? (
                            batch.steps.map((step, index) => (
                                <div key={index} className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4">
                                    <h4>Step {index + 1}: {step.eventName}</h4>
                                    <p><strong>📄 Descrizione:</strong> {step.description || "N/D"}</p>
                                    <p><strong>📅 Data:</strong> {formatItalianDate(step.date)}</p>
                                    <p><strong>📍 Luogo:</strong> {step.location || "N/D"}</p>
                                    {step.attachmentsIpfsHash && step.attachmentsIpfsHash !== "N/A" && (
                                        <p>
                                            <strong>📎 Allegati:</strong>
                                            <a
                                                href={`https://musical-emerald-partridge.myfilebase.com/ipfs/${step.attachmentsIpfsHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ marginLeft: '0.5rem' }}
                                            >
                                                Visualizza
                                            </a>
                                        </p>
                                    )}
                                    <p>
                                        <strong>🔗 Verifica su Blockchain:</strong>
                                        <a
                                            href={`https://polygonscan.com/inputdatadecoder?tx=${step.transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
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
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button onClick={onClose} className="primary-gradient text-white px-4 py-2 rounded-2xl font-semibold hover:scale-105 transition">
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
                        <h2>Nuova Iscrizione ({currentStep}/6)</h2>
                    </div>
                    <div className="p-4" style={{ minHeight: "350px" }}>
                        {currentStep === 1 && (
                            <div>
                                <div className="mb-4">
                                    <label>
                                        Nome Iscrizione
                                        <span style={{ color: "red", fontWeight: "bold" }}> * Obbligatorio</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                                <div className="mb-4">
                                    <label>
                                        Luogo di Produzione
                                        <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                                <div className="mb-4">
                                    <label>
                                        Data di Origine
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
                                    <p>Inserisci una data di origine, puoi utilizzare il giorno attuale o una data precedente alla registrazione di questa iscrizione.</p>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div>
                                <div className="mb-4">
                                    <label>
                                        Immagine Prodotto
                                        <span style={{ color: "#6c757d" }}> Non obbligatorio</span>
                                    </label>
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleFileChange}
                                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border">
                    <h2>Informazioni Esportazione</h2>
                </div>
                <div className="p-4">
                    <div style={{ marginBottom: '2rem' }}>
                        <p>Se hai completato con successo la tua iscrizione (solo dopo la finalizzazione), potrai esportare:</p>
                        <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '1rem 0' }}>
                            <li>Un certificato EasyChain in formato PDF, utile all'azienda per uso interno o documentale. Questo file può essere archiviato, stampato o condiviso con terzi per attestare l'iscrizione e l'autenticità del prodotto, senza necessariamente passare per il QR Code.</li>
                            <li>Un certificato EasyChain in formato HTML, pensato per la pubblicazione online. Caricalo su uno spazio web (privato o pubblico), copia il link e usalo per generare un QR Code da applicare all'etichetta del tuo prodotto. Inquadrando il QR Code, chiunque potrà visualizzare il certificato direttamente online.</li>
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
        window.location.href = '/qrcode';
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

// Componente modale info
const InfoModal: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-card p-6 rounded-2xl border border-border max-w-2xl w-full text-foreground" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border">
                    <h2>Informazioni Iscrizioni</h2>
                </div>
                <div className="p-4">
                    <div style={{ textAlign: 'left' }}>
                        <h4>COME FUNZIONA</h4>
                        <ul style={{ paddingLeft: '20px', margin: '1rem 0' }}>
                            <li><strong>Inizializza Nuova Iscrizione:</strong> Crea una nuova iscrizione con i dati base del prodotto</li>
                            <li><strong>Aggiungi Steps:</strong> Registra ogni fase della filiera produttiva</li>
                            <li><strong>Finalizza:</strong> Chiudi l'iscrizione quando completata, non potrai aggiungere nuovi steps</li>
                            <li><strong>Esporta:</strong> Genera certificati PDF o HTML per i tuoi clienti</li>
                        </ul>

                        <h4>Stati dell'iscrizione:</h4>
                        <ul style={{ paddingLeft: '20px', margin: '1rem 0' }}>
                            <li><span style={{ color: '#10b981' }}>Aperto</span>: Puoi aggiungere nuovi step</li>
                            <li><span style={{ color: '#ef4444' }}>Chiuso</span>: Finalizzato, pronto per l'esportazione</li>
                        </ul>

                        <h4>Riguardo i Costi:</h4>
                        <p>Dopo l'attivazione del tuo account avrai a disposizione crediti gratuiti per avviare la tua attività di certificazione su Blockchain.</p>
                        <p>Ogni operazione (nuova iscrizione, aggiunta step, finalizzazione) consuma 1 credito.</p>
                        <p>Se hai bisogno di piu' crediti per le tue operazioni vai alla pagina <a href="/ricaricacrediti" style={{ color: '#3b82f6', textDecoration: 'none' }}>Ricarica Crediti</a>.</p>
                    </div>
                </div>
                <div className="p-4 border-t border-border flex justify-between gap-4">
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
            return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"><p>Verifica stato account in corso...</p></div>;
        }

        if (companyStatus.error) {
            return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"><p style={{ color: "red" }}>{companyStatus.error}</p></div>;
        }

        if (companyStatus.isActive && companyStatus.data) {
            return <Dashboard companyData={companyStatus.data} />;
        }

        if (account) {
            return <RegistrationForm walletAddress={account.address} />;
        }

        return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"><p>Connetti il wallet per continuare.</p></div>;
    };

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
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
            <div className="min-h-screen bg-background px-6 py-6 container mx-auto">
                <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 p-6 rounded-2xl border border-border">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">EasyChain - Area Privata</h1>
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